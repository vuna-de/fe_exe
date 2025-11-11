import React, { useEffect, useState } from 'react';
import { 
  getExercises as getAdminExercises, 
  createExercise, 
  updateExercise, 
  deleteExercise, 
  type ExercisesResponse, 
  type Exercise 
} from '../services/adminService';
import './AdminExercises.css';

const AdminExercises: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState<Partial<Exercise>>({});

  const loadExercises = async (page = 1) => {
    try {
      setLoading(true);
      const res: ExercisesResponse = await getAdminExercises({ page, limit: 10, search, category, difficulty: difficulty as any });
      setExercises(res.exercises);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể tải bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExercises(1); }, []);

  const openCreate = () => {
    setEditing({} as any);
    setForm({ name: '', category: '', difficulty: 'beginner', description: '' });
  };
  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setForm({ name: ex.name, category: ex.category, difficulty: ex.difficulty as any, description: ex.description });
  };
  const saveExercise = async () => {
    if (!editing?._id) {
      await createExercise({
        name: form.name || '',
        description: form.description || '',
        category: form.category || '',
        difficulty: (form.difficulty as any) || 'beginner',
        primaryMuscles: [],
        secondaryMuscles: [],
        equipment: '',
        instructions: []
      });
    } else {
      await updateExercise(editing._id, form);
    }
    setEditing(null);
    await loadExercises(currentPage);
  };
  const removeExercise = async (id: string) => {
    if (!window.confirm('Xóa bài tập này?')) return;
    await deleteExercise(id);
    await loadExercises(currentPage);
  };

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h1>🏋️ Quản lý bài tập</h1>
          <p>Thêm, chỉnh sửa và quản trị danh mục bài tập</p>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <h2>Bộ lọc</h2>
          <div className="filters-grid">
            <div>
              <label>Tìm kiếm</label>
              <input placeholder="Tên bài tập..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label>Danh mục</label>
              <input placeholder="Danh mục..." value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label>Độ khó</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="beginner">Dễ</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Khó</option>
              </select>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => loadExercises(1)} disabled={loading}>
                {loading ? '⏳' : 'Lọc'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); loadExercises(1); }}>
                Làm mới
              </button>
              <button className="btn btn-success" onClick={openCreate}>+ Thêm</button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Table */}
        <div className="table-card">
          <div className="table-header">Danh sách bài tập</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Danh mục</th>
                  <th>Độ khó</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map(ex => (
                  <tr key={ex._id}>
                    <td>{ex.name}</td>
                    <td>{ex.category}</td>
                    <td>
                      <span className={`badge difficulty ${ex.difficulty}`}>
                        {ex.difficulty}
                      </span>
                    </td>
                    <td title={ex.description} className="truncate">{ex.description}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-action edit" onClick={() => openEdit(ex)}>✏️</button>
                        <button className="btn-action delete" onClick={() => removeExercise(ex._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && exercises.length === 0 && (
                  <tr><td colSpan={5} className="no-data">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>Trang {currentPage}/{totalPages}</span>
          <div>
            <button disabled={currentPage <= 1} onClick={() => loadExercises(currentPage - 1)}>⬅ Trước</button>
            <button disabled={currentPage >= totalPages} onClick={() => loadExercises(currentPage + 1)}>Sau ➡</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editing?._id ? 'Chỉnh sửa bài tập' : 'Thêm bài tập'}</h3>
              <button onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <input placeholder="Tên" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
              <input placeholder="Danh mục" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}/>
              <select value={form.difficulty || 'beginner'} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}>
                <option value="beginner">Dễ</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Khó</option>
              </select>
              <textarea placeholder="Mô tả" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveExercise}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExercises;
