import React, { useState } from 'react';
import {
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { generateWorkoutPlan, GenerateWorkoutPlanData } from '../services/workoutService';
import './WorkoutPlanGenerator.css';

interface WorkoutPlanGeneratorProps {
  onPlanGenerated?: (plan: any) => void;
  onClose?: () => void;
}

const WorkoutPlanGenerator: React.FC<WorkoutPlanGeneratorProps> = ({
  onPlanGenerated,
  onClose
}) => {
  const [formData, setFormData] = useState<GenerateWorkoutPlanData>({
    goal: 'general',
    difficulty: 'beginner',
    duration: 45,
    frequency: 'weekly',
    equipment: [] as string[]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const goals = [
    { value: 'weight_loss', label: 'Giảm cân', description: 'Đốt cháy calories và giảm mỡ thừa', icon: '🔥' },
    { value: 'muscle_gain', label: 'Tăng cơ', description: 'Xây dựng khối lượng cơ bắp', icon: '💪' },
    { value: 'strength', label: 'Tăng sức mạnh', description: 'Cải thiện sức mạnh tổng thể', icon: '⚡' },
    { value: 'endurance', label: 'Tăng sức bền', description: 'Cải thiện khả năng tim mạch', icon: '🏃' },
    { value: 'general', label: 'Tổng quát', description: 'Duy trì sức khỏe tổng thể', icon: '🎯' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Người mới bắt đầu', description: 'Phù hợp cho người mới tập' },
    { value: 'intermediate', label: 'Trung cấp', description: 'Có kinh nghiệm tập luyện cơ bản' },
    { value: 'advanced', label: 'Nâng cao', description: 'Có kinh nghiệm tập luyện lâu năm' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'every_other_day', label: 'Cách ngày' },
    { value: 'weekly', label: 'Hàng tuần' }
  ];

  const equipmentOptions = [
    { value: 'none', label: 'Không cần thiết bị' },
    { value: 'dumbbells', label: 'Tạ đơn' },
    { value: 'barbell', label: 'Tạ đòn' },
    { value: 'kettlebell', label: 'Tạ ấm' },
    { value: 'resistance_band', label: 'Dây kháng lực' },
    { value: 'pull_up_bar', label: 'Xà đơn' },
    { value: 'bench', label: 'Ghế tập' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await generateWorkoutPlan(formData);
      setSuccess(true);
      if (onPlanGenerated) onPlanGenerated(result);
      setTimeout(() => { if (onClose) onClose(); }, 2000);
    } catch (err: any) {
      setError(err.error || 'Có lỗi xảy ra khi tạo kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentChange = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.includes(equipment)
        ? prev.equipment.filter(eq => eq !== equipment)
        : [...(prev.equipment || []), equipment]
    }));
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-card success-card">
          <div className="success-icon">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3>Tạo kế hoạch thành công 🎉</h3>
          <p>Kế hoạch tập luyện đã được thêm vào danh sách của bạn.</p>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card generator-card">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary-600" />
            <span className="title">Tạo kế hoạch tự động</span>
          </div>
          {onClose && <button className="close-btn" onClick={onClose}>✕</button>}
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="error-alert">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="generator-form">
            {/* Goals */}
            <div className="form-section">
              <label>Mục tiêu tập luyện</label>
              <div className="grid-2">
                {goals.map(goal => (
                  <div
                    key={goal.value}
                    className={`select-card ${formData.goal === goal.value ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, goal: goal.value as any })}
                  >
                    <span className="icon">{goal.icon}</span>
                    <div>
                      <h4>{goal.label}</h4>
                      <p>{goal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="form-section">
              <label>Trình độ</label>
              <div className="stack">
                {difficulties.map(d => (
                  <label
                    key={d.value}
                    className={`select-row ${formData.difficulty === d.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      checked={formData.difficulty === d.value}
                      onChange={() => setFormData({ ...formData, difficulty: d.value as any })}
                    />
                    <div>
                      <h4>{d.label}</h4>
                      <p>{d.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration & Frequency */}
            <div className="form-section grid-2">
            <div>
              <label>Thời gian tập (phút)</label>
              <div className="input-icon">
                <ClockIcon className="icon" />
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                  placeholder="Nhập số phút"
                />
              </div>
            </div>

              <div>
                <label>Tần suất</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                >
                  {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>

            {/* Equipment */}
            <div className="form-section">
              <label>Thiết bị có sẵn</label>
              <div className="grid-3">
                {equipmentOptions.map(eq => (
                  <label
                  key={eq.value}
                  className={`select-row ${formData.equipment?.includes(eq.value) ? 'active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.equipment?.includes(eq.value) || false}
                    onChange={() => handleEquipmentChange(eq.value)}
                  />
                  <span>{eq.label}</span>
                </label>
                
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              {onClose && <button type="button" className="btn-outline" onClick={onClose}>Hủy</button>}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="loader small"></div>
                    <span>Đang tạo...</span>
                  </div>
                ) : 'Tạo kế hoạch'}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanGenerator;
