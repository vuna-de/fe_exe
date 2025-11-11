import React, { useState } from 'react';
import { createWorkoutPlan } from '../services/workoutService';
import { getExercises } from '../services/exerciseService';
import { Exercise } from '../types';
import './ManualPlanModal.css';

interface Props {
  onClose: () => void;
  onCreated: () => void;
  editingPlan?: any;
}

const ManualPlanModal: React.FC<Props> = ({ onClose, onCreated, editingPlan }) => {
  const [name, setName] = useState(editingPlan?.name || 'Kế hoạch của tôi');
  const [description, setDescription] = useState(editingPlan?.description || '');
  const [category, setCategory] = useState<'strength' | 'muscle_gain' | 'weight_loss' | 'endurance' | 'flexibility' | 'general'>(editingPlan?.category || 'general');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(editingPlan?.difficulty || 'beginner');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(editingPlan?.estimatedDuration || 45);
  const [exercises, setExercises] = useState<any[]>(editingPlan?.exercises || []);
  const [isSaving, setIsSaving] = useState(false);

  const ExerciseSelector: React.FC<{ value: string; onChange: (val: { id: string; name: string }) => void }>
  = ({ value, onChange }) => {
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<Exercise[]>([] as any);

    React.useEffect(() => {
      const fetchAll = async () => {
        try {
          setLoading(true);
          // Lấy tối đa 100 bài tập đầu tiên để chọn nhanh
          const res: any = await getExercises({}, 1, 100);
          setList(res.exercises || []);
        } catch {
          setList([] as any);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }, []);

    return (
      <select
        className="profile-form-select"
        value={value || ''}
        onChange={(e) => {
          const id = e.target.value;
          const ex = (list as any).find((it: any) => it._id === id);
          onChange({ id, name: ex?.name || '' });
        }}
      >
        <option value="">-- Chọn bài tập --</option>
        {loading && <option value="" disabled>Đang tải...</option>}
        {!loading && list.map((ex: any) => (
          <option key={ex._id} value={ex._id}>
            {ex.name} ({ex.category})
          </option>
        ))}
      </select>
    );
  };

  const addExercise = () => {
    setExercises((prev) => ([...prev, { exercise: '', plannedSets: 3, plannedReps: { min: 8, max: 12 }, order: prev.length + 1 }]));
  };

  const updateExercise = (idx: number, patch: any) => {
    setExercises((prev) => prev.map((ex, i) => i === idx ? { ...ex, ...patch } : ex));
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx).map((ex, i) => ({ ...ex, order: i + 1 })));
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) return alert('Vui lòng nhập tên kế hoạch');
      if (estimatedDuration < 10) return alert('Thời lượng tối thiểu 10 phút');
      if (exercises.length === 0) return alert('Vui lòng thêm ít nhất 1 bài tập');
      setIsSaving(true);
      const payload = { name, description, category, difficulty, estimatedDuration, exercises } as any;
      if (editingPlan?._id) {
        const { updateWorkoutPlan } = await import('../services/workoutService');
        await updateWorkoutPlan(editingPlan._id, payload);
      } else {
        await createWorkoutPlan(payload);
      }
      onCreated();
      onClose();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Tạo kế hoạch thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 840 }}>
        <div className="modal-header">
          <div className="font-semibold">{editingPlan?._id ? 'Chỉnh sửa kế hoạch' : 'Tạo kế hoạch thủ công'}</div>
          <button className="logout-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600">Tên kế hoạch</label>
              <input className="profile-form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Danh mục</label>
              <select className="profile-form-select" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                <option value="general">Tổng quát</option>
                <option value="weight_loss">Giảm cân</option>
                <option value="muscle_gain">Tăng cơ</option>
                <option value="strength">Tăng sức mạnh</option>
                <option value="endurance">Sức bền</option>
                <option value="flexibility">Linh hoạt</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Độ khó</label>
              <select className="profile-form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                <option value="beginner">Dễ</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Khó</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Thời lượng ước tính (phút)</label>
              <input type="number" min={10} className="profile-form-input" value={estimatedDuration} onChange={(e) => setEstimatedDuration(Number(e.target.value))} />
            </div>
          </div>

          <div className="dashboard-section-new">
            <div className="section-header"><div className="section-title">Bài tập</div></div>
            <div className="p-4 space-y-3">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="exercise-card-detail">
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Chọn bài tập</label>
                      <ExerciseSelector
                        value={typeof ex.exercise === 'string' ? ex.exercise : ''}
                        onChange={({ id }) => updateExercise(idx, { exercise: id })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Sets</label>
                      <input type="number" min={1} className="profile-form-input"
                        value={ex.plannedSets}
                        onChange={(e) => updateExercise(idx, { plannedSets: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Reps min</label>
                      <input type="number" min={1} className="profile-form-input"
                        value={ex.plannedReps?.min || 8}
                        onChange={(e) => updateExercise(idx, { plannedReps: { ...(ex.plannedReps||{}), min: Number(e.target.value) } })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Reps max</label>
                      <input type="number" min={1} className="profile-form-input"
                        value={ex.plannedReps?.max || 12}
                        onChange={(e) => updateExercise(idx, { plannedReps: { ...(ex.plannedReps||{}), max: Number(e.target.value) } })} />
                    </div>
                    <div className="flex justify-end">
                      <button className="delete-btn" onClick={() => removeExercise(idx)}>🗑️</button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline w-full" onClick={addExercise}>+ Thêm bài tập</button>
              </div>

          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu kế hoạch'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPlanModal;


