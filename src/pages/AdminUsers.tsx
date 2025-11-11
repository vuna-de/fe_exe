import React, { useEffect, useState } from 'react';
import { 
  getUsers as getAdminUsers, 
  updateUser, 
  deleteUser, 
  type UsersResponse, 
  type User 
} from '../services/adminService';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res: UsersResponse = await getAdminUsers({ page, limit: 10, search, role: role as any });
      setUsers(res.users);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể tải người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(1); }, []);

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ 
      fullName: u.fullName, 
      email: u.email, 
      role: u.role, 
      membershipType: u.membershipType, 
      isActive: u.isActive 
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await updateUser(editing._id, form);
    setEditing(null);
    await loadUsers(currentPage);
  };

  const removeUser = async (id: string) => {
    if (!window.confirm('Xóa người dùng này?')) return;
    await deleteUser(id);
    await loadUsers(currentPage);
  };

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h1>👥 Quản lý người dùng</h1>
          <p>Theo dõi và quản lý toàn bộ tài khoản trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <h2>Bộ lọc & Tìm kiếm</h2>
          <div className="filters-grid">
            <div>
              <label>Tìm kiếm</label>
              <input 
                placeholder="Tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label>Vai trò</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="user">User</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => loadUsers(1)} disabled={loading}>
                {loading ? '⏳' : 'Tìm kiếm'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setRole(''); loadUsers(1); }}>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Users Table */}
        <div className="table-card">
          <div className="table-header">Danh sách người dùng</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Gói</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-info">
                        <div className="avatar">{u.fullName?.charAt(0) || 'U'}</div>
                        <span>{u.fullName}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge role ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.membershipType || '—'}</td>
                    <td>
                      <span className={`badge status ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-action edit" onClick={() => openEdit(u)}>✏️</button>
                        <button className="btn-action delete" onClick={() => removeUser(u._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr><td colSpan={7} className="no-data">Không có người dùng</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>Trang {currentPage}/{totalPages}</span>
          <div>
            <button disabled={currentPage <= 1} onClick={() => loadUsers(currentPage - 1)}>⬅ Trước</button>
            <button disabled={currentPage >= totalPages} onClick={() => loadUsers(currentPage + 1)}>Sau ➡</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Chỉnh sửa người dùng</h3>
              <button onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <input placeholder="Họ tên" value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })}/>
              <input placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
              <select value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                <option value="user">User</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              <input placeholder="Gói" value={form.membershipType || ''} onChange={(e) => setForm({ ...form, membershipType: e.target.value })}/>
              <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Hoạt động</option>
                <option value="false">Khóa</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={saveEdit}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
