import React, { useEffect, useState } from 'react';
import { 
  getPayments as getAdminPayments, 
  updatePaymentStatus, 
  refundPayment, 
  type PaymentsResponse, 
  type Payment 
} from '../services/adminService';
import './AdminPayments.css';

const AdminPayments: React.FC = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPayments = async (page = 1) => {
    try {
      setLoading(true);
      const res: PaymentsResponse = await getAdminPayments({ page, limit: 10, status: status as any });
      setPayments(res.payments);
      setCurrentPage(res.pagination.currentPage);
      setTotalPages(res.pagination.totalPages);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể tải thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(1); }, []);

  return (
    <div className="admin-page">
      <div className="container">
        
        {/* Header */}
        <div className="page-header">
          <h1>💳 Quản lý thanh toán</h1>
          <p>Theo dõi giao dịch và cập nhật trạng thái thanh toán</p>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <h2>Bộ lọc</h2>
          <div className="filters-grid">
            <div>
              <label>Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="btn-group">
              <button className="btn btn-primary" onClick={() => loadPayments(1)} disabled={loading}>
                {loading ? '⏳' : 'Lọc'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setStatus(''); loadPayments(1); }}>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-box">{error}</div>}

        {/* Table */}
        <div className="table-card">
          <div className="table-header">Danh sách giao dịch</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Người dùng</th>
                  <th>Gói</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>{p.transactionId}</td>
                    <td>
                      <div className="font-medium">{p.user?.fullName}</div>
                      <div className="text-sm text-gray">{p.user?.email}</div>
                    </td>
                    <td>{p.subscriptionPlan?.name}</td>
                    <td className="amount">{p.finalAmount?.toLocaleString()} {p.currency}</td>
                    <td>
                      <span className={`badge ${p.status}`}>{p.status}</span>
                    </td>
                    <td className="text-sm text-gray">{new Date(p.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn-action refund" 
                          disabled={p.status === 'refunded'}
                          onClick={async ()=>{ await refundPayment(p._id); await loadPayments(currentPage); }}
                        >
                          Hoàn tiền
                        </button>
                        <button 
                          className="btn-action complete" 
                          onClick={async ()=>{ await updatePaymentStatus(p._id, 'completed'); await loadPayments(currentPage); }}
                        >
                          Hoàn tất
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && payments.length === 0 && (
                  <tr><td colSpan={7} className="no-data">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>Trang {currentPage}/{totalPages}</span>
          <div>
            <button disabled={currentPage <= 1 || loading} onClick={() => loadPayments(currentPage - 1)}>⬅ Trước</button>
            <button disabled={currentPage >= totalPages || loading} onClick={() => loadPayments(currentPage + 1)}>Sau ➡</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
