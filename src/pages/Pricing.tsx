import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon,
  StarIcon,
  CreditCardIcon,
  GiftIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { SubscriptionPlan, Coupon } from '../types';
import * as VoucherService from '../services/voucherService';
import { 
  getSubscriptionPlans, 
  validateCoupon, 
  createVNPayPayment,
  getCoupons 
} from '../services/paymentService';
import './Pricing.css';

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [vouchers, setVouchers] = useState<VoucherService.Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isVoucherMode, setIsVoucherMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansResponse, couponsResponse, vouchersResponse] = await Promise.all([
        getSubscriptionPlans(),
        getCoupons(),
        VoucherService.getVouchers()
      ]);
      
      setPlans(plansResponse.plans);
      setCoupons(couponsResponse.coupons);
      setVouchers(vouchersResponse.coupons);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponValidate = async () => {
    if (!couponCode.trim() || !selectedPlan) return;

    try {
      setValidatingCoupon(true);
      setCouponError(null);

      // Thử validate voucher trước
      const voucherResult = await VoucherService.validateVoucher({
        code: couponCode.trim(),
        planId: selectedPlan._id,
        amount: selectedPlan.price
      });

      if (voucherResult.valid && voucherResult.coupon) {
        setCoupon(voucherResult.coupon);
        setIsVoucherMode(true);
        return;
      }

      // Nếu không phải voucher, thử coupon
      const couponResult = await validateCoupon({
        code: couponCode.trim(),
        planId: selectedPlan._id,
        amount: selectedPlan.price
      });

      if (couponResult.valid && couponResult.coupon) {
        setCoupon(couponResult.coupon);
        setIsVoucherMode(false);
      } else {
        setCouponError(couponResult.error || 'Mã không hợp lệ');
        setCoupon(null);
      }
    } catch (err) {
      setCouponError('Lỗi khi kiểm tra mã');
      setCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCouponCode('');
    setCoupon(null);
    setCouponError(null);
    setIsVoucherMode(false);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);
      
      const result = await createVNPayPayment({
        planId: selectedPlan._id,
        couponCode: couponCode.trim() || undefined,
        paymentMethod: 'vnpay'
      });

      // Chuyển hướng đến trang thanh toán VNPay
      window.location.href = result.payment.paymentUrl;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tạo thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDuration = (duration: number, type: string) => {
    switch (type) {
      case 'monthly':
        return `${duration} ngày`;
      case 'quarterly':
        return `${duration / 30} tháng`;
      case 'yearly':
        return `${duration / 365} năm`;
      case 'lifetime':
        return 'Trọn đời';
      default:
        return `${duration} ngày`;
    }
  };

  const getFinalPrice = (plan: SubscriptionPlan) => {
    if (coupon && selectedPlan?._id === plan._id) {
      return coupon.finalAmount;
    }
    return plan.price;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="mt-4 text-gray-600">Đang tải gói đăng ký...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="pricing-header">
        <div className="relative z-10 text-center">
          <h1 className="pricing-title">
            Chọn Gói Phù Hợp Với Bạn 💎
          </h1>
          <p className="pricing-subtitle">
            Nâng cấp trải nghiệm tập luyện với các gói Premium đầy đủ tính năng
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">100%</span> An toàn
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">24/7</span> Hỗ trợ
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
              <span className="text-2xl font-black">30</span> Ngày hoàn tiền
            </div>
          </div>
        </div>
      </div>

      {/* Available Coupons & Vouchers */}
      {(coupons.length > 0 || vouchers.length > 0) && (
        <div className="coupons-section">
          <h3 className="coupons-title">
            <GiftIcon className="w-6 h-6" />
            Mã giảm giá có sẵn
          </h3>
          
          {/* Available Vouchers */}
          {vouchers.length > 0 && (
            <>
              <div className="coupons-subtitle">
                🎫 Voucher
              </div>
              <div className="coupons-grid">
                {vouchers.slice(0, 3).map((voucher) => {
                  const statusBadge = VoucherService.getVoucherStatus(voucher);
                  return (
                    <div key={voucher._id} className="coupon-card voucher-card">
                      <div className="coupon-header">
                        <span className="coupon-code voucher-code">{voucher.code}</span>
                        <span className={`coupon-type voucher-badge ${statusBadge.class}`}>
                          {VoucherService.formatDiscountValue(voucher)}
                        </span>
                      </div>
                      <p className="coupon-description">{voucher.name}</p>
                      <div className="voucher-status">
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                        <span className="usage-info">
                          Đã dùng: {voucher.usedCount}/{voucher.usageLimit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Available Coupons */}
          {coupons.length > 0 && (
            <>
              <div className="coupons-subtitle">
                🎁 Coupon
              </div>
              <div className="coupons-grid">
                {coupons.slice(0, 2).map((coupon) => (
                  <div key={coupon._id} className="coupon-card">
                    <div className="coupon-header">
                      <span className="coupon-code">{coupon.code}</span>
                      <span className="coupon-type">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : 
                         coupon.type === 'fixed_amount' ? formatCurrency(coupon.value) : 'Miễn phí'}
                      </span>
                    </div>
                    <p className="coupon-description">{coupon.name}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pricing Plans */}
      <div className="pricing-plans">
        {plans.map((plan, index) => (
          <div 
            key={plan._id} 
            className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {plan.isPopular && (
              <div className="popular-badge">
                <StarIcon className="w-5 h-5" />
                Phổ biến nhất
              </div>
            )}

            <div className="plan-header">
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              
              <div className="plan-pricing">
                <div className="price-container">
                  <span className="price-current">
                    {formatCurrency(getFinalPrice(plan))}
                  </span>
                  {plan.originalPrice && plan.originalPrice > plan.price && (
                    <span className="price-original">
                      {formatCurrency(plan.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="price-period">
                  / {formatDuration(plan.duration, plan.type)}
                </span>
                {plan.discountPercentage && plan.discountPercentage > 0 && (
                  <div className="discount-badge">
                    -{plan.discountPercentage}%
                  </div>
                )}
              </div>
            </div>

            <div className="plan-features">
              {plan.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex} 
                  className={`feature-item ${feature.included ? 'included' : 'excluded'}`}
                >
                  {feature.included ? (
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="feature-content">
                    <span className="feature-name">{feature.name}</span>
                    <span className="feature-description">{feature.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className={`plan-button ${plan.isPopular ? 'plan-button-popular' : ''}`}
              onClick={() => handleSelectPlan(plan)}
            >
              {selectedPlan?._id === plan._id ? (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Đã chọn
                </>
              ) : (
                <>
                  Chọn gói này
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Selected Plan & Coupon */}
      {selectedPlan && (
        <div className="checkout-section">
          <div className="checkout-card">
            <h3 className="checkout-title">
              <CreditCardIcon className="w-6 h-6" />
              Thanh toán
            </h3>
            
            <div className="selected-plan">
              <div className="selected-plan-info">
                <h4 className="selected-plan-name">{selectedPlan.name}</h4>
                <p className="selected-plan-description">{selectedPlan.description}</p>
              </div>
              <div className="selected-plan-price">
                {formatCurrency(selectedPlan.price)}
              </div>
            </div>

            {/* Coupon/Voucher Input */}
            <div className="coupon-section">
              <label className="coupon-label">
                <TagIcon className="w-5 h-5" />
                Mã giảm giá / Voucher
              </label>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Nhập mã voucher hoặc coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button
                  onClick={handleCouponValidate}
                  disabled={!couponCode.trim() || validatingCoupon}
                  className="coupon-validate-btn"
                >
                  {validatingCoupon ? 'Đang kiểm tra...' : 'Áp dụng'}
                </button>
              </div>
              {couponError && (
                <p className="coupon-error">{couponError}</p>
              )}
              {coupon && (
                <div className="coupon-success">
                  <CheckIcon className="w-5 h-5" />
                  <span>
                    Đã áp dụng {isVoucherMode ? 'voucher' : 'mã'} {coupon.code} - Giảm {formatCurrency(coupon.discountAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="price-summary">
              <div className="price-row">
                <span>Giá gốc:</span>
                <span>{formatCurrency(selectedPlan.price)}</span>
              </div>
              {coupon && (
                <div className="price-row discount">
                  <span>Giảm giá ({coupon.code}):</span>
                  <span>-{formatCurrency(coupon.discountAmount)}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(getFinalPrice(selectedPlan))}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="payment-button"
            >
              {processing ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5" />
                  Thanh toán với VNPay
                </>
              )}
            </button>

            <div className="payment-security">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Thanh toán an toàn với VNPay</span>
            </div>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="features-comparison">
        <h3 className="comparison-title">So sánh tính năng</h3>
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="comparison-feature">Tính năng</div>
            {plans.map(plan => (
              <div key={plan._id} className="comparison-plan">
                {plan.name}
              </div>
            ))}
          </div>
          {plans[0]?.features.map((feature, index) => (
            <div key={index} className="comparison-row">
              <div className="comparison-feature">
                {feature.name}
              </div>
              {plans.map(plan => (
                <div key={plan._id} className="comparison-value">
                  {plan.features[index]?.included ? (
                    <CheckIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Pricing;
