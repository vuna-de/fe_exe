import React, { useEffect, useState } from 'react';
import { 
  getVouchers, 
  createVoucher, 
  updateVoucher, 
  deleteVoucher, 
  getVoucherStats,
  type VouchersResponse, 
  type Voucher,
  type VoucherFilters,
  type VoucherStats
} from '../services/adminService';
import './AdminVouchers.css';

const AdminVouchers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [discountType, setDiscountType] = useState('');
  const [status, setStatus] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Voucher>>({});
  const [stats, setStats] = useState<VoucherStats | null>(null);

  const loadVouchers = async (page = 1) => {
    try {
      setLoading(true);
      const filters: VoucherFilters = { 
        page, 
        limit: 10, 
        search, 
        discountType: discountType as any,
        status: status as any,
        isActive
      };
      const res: VouchersResponse = await getVouchers(filters);
      setVouchers(res.vouchers);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getVoucherStats();
      setStats(res);
    } catch (e: any) {
      console.error('Không thể tải thống kê voucher:', e);
    }
  };

  useEffect(() => { 
    loadVouchers(1);
    loadStats();
  }, []);

  const openCreate = () => {
    setCreating(true);
    setForm({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscountAmount: 0,
      minOrderAmount: 0,
      applicablePlans: [],
      usageLimit: 1,
      usageLimitPerUser: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      isPublic: false
    });
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    setForm({ 
      code: v.code,
      name: v.name,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxDiscountAmount: v.maxDiscountAmount,
      minOrderAmount: v.minOrderAmount,
      applicablePlans: v.applicablePlans,
      usageLimit: v.usageLimit,
      usageLimitPerUser: v.usageLimitPerUser,
      validFrom: v.validFrom.split('T')[0],
      validUntil: v.validUntil.split('T')[0],
      isActive: v.isActive,
      isPublic: v.isPublic
    });
  };

  const saveVoucher = async () => {
    try {
      if (creating) {
        await createVoucher(form as any);
        setCreating(false);
      } else if (editing) {
        await updateVoucher(editing._id, form);
        setEditing(null);
      }
      setForm({});
      await loadVouchers(currentPage);
      await loadStats();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể lưu voucher');
    }
  };

  const removeVoucher = async (id: string) => {
    if (!window.confirm('Xóa voucher này?')) return;
    try {
      await deleteVoucher(id);
      await loadVouchers(currentPage);
      await loadStats();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể xóa voucher');
    }
  };

  const formatDiscountValue = (voucher: Voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue.toLocaleString()} VNĐ`;
    }
  };

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    const validFrom = new Date(voucher.validFrom);
    const validUntil = new Date(voucher.validUntil);
    
    if (!voucher.isActive) {
      return { text: 'Không hoạt động', class: 'inactive' };
    }
    if (validUntil < now) {
      return { text: 'Hết hạn', class: 'expired' };
    }
    if (validFrom > now) {
      return { text: 'Chưa bắt đầu', class: 'pending' };
    }
    if (voucher.usedCount >= voucher.usageLimit) {
      return { text: 'Hết lượt', class: 'used' };
    }
    return { text: 'Hoạt động', class: 'active' };
  };

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="page-header">
          <h1>🎫 Quản lý Voucher</h1>
          <p>Tạo và quản lý các mã giảm giá cho khách hàng</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Tổng voucher</h3>
              <p className="stat-number">{stats.totalVouchers}</p>
            </div>
            <div className="stat-card">
              <h3>Đang hoạt động</h3>
              <p className="stat-number">{stats.activeVouchers}</p>
            </div>
            <div className="stat-card">
              <h3>Hết hạn</h3>
              <p className="stat-number">{stats.expiredVouchers}</p>
            </div>
            <div className="stat-card">
              <h3>Tổng sử dụng</h3>
              <p className="stat-number">{stats.totalUsage}</p>
            </div>
            <div className="stat-card">
              <h3>Tổng giảm giá</h3>
              <p className="stat-number">{stats.totalDiscountGiven.toLocaleString()} VNĐ</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filter-card">
          <h2>Bộ lọc & Tìm kiếm</h2>
          <div className="filters-grid">
            <div>
              <label>Tìm kiếm</label>
              <input 
                placeholder="Mã, tên hoặc mô tả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label>Loại giảm giá</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="percentage">Phần trăm</option>
                <option value="fixed_amount">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="expired">Hết hạn</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div>
              <label>Hiển thị công khai</label>
              <select value={isActive === undefined ? '' : String(isActive)} onChange={(e) => setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')}>
                <option value="">Tất cả</option>
                <option value="true">Có</option>
                <option value="false">Không</option>
              </select>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => loadVouchers(1)} disabled={loading}>
                {loading ? '⏳' : 'Tìm kiếm'}
              </button>
              <button className="btn btn-secondary" onClick={() => { 
                setSearch(''); 
                setDiscountType(''); 
                setStatus(''); 
                setIsActive(undefined);
                loadVouchers(1); 
              }}>
                Làm mới
              </button>
              <button className="btn btn-success" onClick={openCreate}>
                ➕ Tạo voucher
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Vouchers Table */}
        <div className="table-card">
          <div className="table-header">Danh sách voucher</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Giảm giá</th>
                  <th>Đơn tối thiểu</th>
                  <th>Đã dùng</th>
                  <th>Hiệu lực</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => {
                  const statusBadge = getStatusBadge(v);
                  return (
                    <tr key={v._id}>
                      <td>
                        <div className="voucher-code">
                          <code>{v.code}</code>
                          {v.isPublic && <span className="public-badge">Công khai</span>}
                        </div>
                      </td>
                      <td>
                        <div className="voucher-info">
                          <strong>{v.name}</strong>
                          {v.description && <p className="description">{v.description}</p>}
                        </div>
                      </td>
                      <td>
                        <div className="discount-info">
                          <span className="discount-value">{formatDiscountValue(v)}</span>
                          {v.maxDiscountAmount && (
                            <p className="max-discount">Tối đa: {v.maxDiscountAmount.toLocaleString()} VNĐ</p>
                          )}
                        </div>
                      </td>
                      <td>{v.minOrderAmount.toLocaleString()} VNĐ</td>
                      <td>
                        <div className="usage-info">
                          <span>{v.usedCount}/{v.usageLimit}</span>
                          <div className="usage-bar">
                            <div 
                              className="usage-fill" 
                              style={{ width: `${(v.usedCount / v.usageLimit) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="validity-info">
                          <p>Từ: {new Date(v.validFrom).toLocaleDateString()}</p>
                          <p>Đến: {new Date(v.validUntil).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`badge status ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn-action edit" onClick={() => openEdit(v)}>✏️</button>
                          <button className="btn-action delete" onClick={() => removeVoucher(v._id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && vouchers.length === 0 && (
                  <tr><td colSpan={8} className="no-data">Không có voucher</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>Trang {currentPage}/{totalPages}</span>
          <div>
            <button disabled={currentPage <= 1} onClick={() => loadVouchers(currentPage - 1)}>⬅ Trước</button>
            <button disabled={currentPage >= totalPages} onClick={() => loadVouchers(currentPage + 1)}>Sau ➡</button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(creating || editing) && (
        <div className="modal-overlay">
          <div className="modal voucher-modal">
            <div className="modal-header">
              <h3>{creating ? 'Tạo voucher mới' : 'Chỉnh sửa voucher'}</h3>
              <button onClick={() => { setCreating(false); setEditing(null); setForm({}); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Mã voucher *</label>
                  <input 
                    placeholder="VOUCHER123" 
                    value={form.code || ''} 
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    disabled={!!editing}
                  />
                </div>
                <div className="form-group">
                  <label>Tên voucher *</label>
                  <input 
                    placeholder="Tên voucher" 
                    value={form.name || ''} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea 
                  placeholder="Mô tả voucher..."
                  value={form.description || ''} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại giảm giá *</label>
                  <select 
                    value={form.discountType || ''} 
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                  >
                    <option value="percentage">Phần trăm</option>
                    <option value="fixed_amount">Số tiền cố định</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá trị giảm giá *</label>
                  <input 
                    type="number"
                    placeholder={form.discountType === 'percentage' ? '10' : '50000'}
                    value={form.discountValue || ''} 
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value ? Number(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giảm tối đa (VNĐ)</label>
                  <input 
                    type="number"
                    placeholder="100000"
                    value={form.maxDiscountAmount || ''} 
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value ? Number(e.target.value) : 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Đơn hàng tối thiểu (VNĐ)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={form.minOrderAmount || ''} 
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giới hạn sử dụng</label>
                  <input 
                    type="number"
                    placeholder="100"
                    value={form.usageLimit || ''} 
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : 1 })}
                  />
                </div>
                <div className="form-group">
                  <label>Giới hạn mỗi user</label>
                  <input 
                    type="number"
                    placeholder="1"
                    value={form.usageLimitPerUser || ''} 
                    onChange={(e) => setForm({ ...form, usageLimitPerUser: e.target.value ? Number(e.target.value) : 1 })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input 
                    type="date"
                    value={form.validFrom || ''} 
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input 
                    type="date"
                    value={form.validUntil || ''} 
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={form.isActive || false} 
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Kích hoạt
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input 
                      type="checkbox"
                      checked={form.isPublic || false} 
                      onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                    />
                    Hiển thị công khai
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setCreating(false); setEditing(null); setForm({}); }}>Hủy</button>
              <button className="btn btn-primary" onClick={saveVoucher}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;
