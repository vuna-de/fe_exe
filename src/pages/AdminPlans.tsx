import React, { useEffect, useState } from 'react';
import { getAdminPlans, createAdminPlan, updateAdminPlan, deleteAdminPlan } from '../services/adminService';
import './AdminPlans.css';

const AdminPlans: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<'workout' | 'meal' | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<{ name: string; description?: string; type: 'workout' | 'meal' }>({
    name: '', description: '', type: 'workout'
  });

  const loadPlans = async (page = 1) => {
    try {
      setLoading(true);
      const res: any = await getAdminPlans({ page, limit: 10, type: typeFilter || undefined, search: search || undefined });
      setPlans(res.plans);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể tải kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(1); }, []);

  const openCreate = () => { setEditing({}); setForm({ name: '', description: '', type: 'workout' }); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, description: p.description, type: p.type || (p.dailyMeals ? 'meal' : 'workout') }); };
  const savePlan = async () => {
    if (!editing?._id) {
      await createAdminPlan(form);
    } else {
      await updateAdminPlan(editing._id, { name: form.name, description: form.description });
    }
    setEditing(null);
    await loadPlans(currentPage);
  };
  const removePlan = async (id: string) => {
    if (!window.confirm('Xóa kế hoạch này?')) return;
    await deleteAdminPlan(id);
    await loadPlans(currentPage);
  };

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h1>📋 Quản lý kế hoạch</h1>
          <p>Quản trị kế hoạch tập luyện và dinh dưỡng</p>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <h2>Bộ lọc</h2>
          <div className="filters-grid">
            <div>
              <label>Loại</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
                <option value="">Tất cả loại</option>
                <option value="workout">Workout</option>
                <option value="meal">Meal</option>
              </select>
            </div>
            <div>
              <label>Tìm theo tên</label>
              <input placeholder="Nhập tên kế hoạch" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => loadPlans(1)} disabled={loading}>
                {loading ? '⏳' : 'Lọc'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setTypeFilter(''); setSearch(''); loadPlans(1); }}>Làm mới</button>
              <button className="btn btn-success" onClick={openCreate}>+ Thêm</button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Table */}
        <div className="table-card">
          <div className="table-header">Danh sách kế hoạch</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>
                      <span className={`badge ${p.type || (p.dailyMeals ? 'meal' : 'workout')}`}>
                        {p.type || (p.dailyMeals ? 'meal' : 'workout')}
                      </span>
                    </td>
                    <td title={p.description} className="truncate">{p.description}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-action edit" onClick={() => openEdit(p)}>Sửa</button>
                        <button className="btn-action delete" onClick={() => removePlan(p._id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && plans.length === 0 && (
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
            <button disabled={currentPage <= 1 || loading} onClick={() => loadPlans(currentPage - 1)}>⬅ Trước</button>
            <button disabled={currentPage >= totalPages || loading} onClick={() => loadPlans(currentPage + 1)}>Sau ➡</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editing?._id ? 'Chỉnh sửa kế hoạch' : 'Thêm kế hoạch'}</h3>
              <button className="close-btn" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div>
                  <label>Tên</label>
                  <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                {!editing?._id && (
                  <div>
                    <label>Loại</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                      <option value="workout">Workout</option>
                      <option value="meal">Meal</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label>Mô tả</label>
                  <textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setEditing(null)}>Hủy</button>
                <button className="btn btn-primary" onClick={savePlan}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
