// ProfileOrdersTab.jsx - Hiển thị lịch sử đơn hàng trong hồ sơ người dùng
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Package, Calendar } from "lucide-react";
import { motion } from "motion/react";

function ProfileOrdersTab({
  CANCELLATION_REASON_LABELS,
  PAYMENT_STATUS_CONFIG,
  STATUS_CONFIG,
  formatOrderDate,
  formatVND,
  getRemainingPayment,
  handleCustomerAction,
  navigate,
  orders,
  ordersLoading,
}) {
  return (
<TabsContent value="orders" className="space-y-6">
              {ordersLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                </div>
              ) : orders.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Chưa có đơn hàng"
                  description="Bạn chưa có đơn hàng nào. Hãy khám phá sản phẩm của chúng tôi!"
                  action={{ label: "Khám phá sản phẩm", onClick: () => navigate("/marketplace") }}
                />
              ) : (
                <div className="space-y-6">
                  {orders.map((order, idx) => (
                    <motion.div
                      key={order._id || order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="profile-order-card">
                        {/* Order Header */}
                        <div className="profile-order-header">
                          <div>
                            <div className="profile-order-code-row">
                              <Package className="w-5 h-5 text-slate-500" />
                              <span className="profile-order-code">
                                MÃ ĐƠN: {order.orderCode}
                              </span>
                            </div>
                            <p className="profile-order-date">
                              <Calendar className="w-3.5 h-3.5" />
                              Đặt ngày: {formatOrderDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="profile-order-badges">
                            {/* Payment Status Badge */}
                            {(() => {
                              const payConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
                              return (
                                <Badge variant="outline" className={`px-2.5 py-1 text-xs font-semibold ${payConfig.className}`}>
                                  {payConfig.label}
                                </Badge>
                              );
                            })()}
                            
                            {/* Order Status Badge */}
                            {(() => {
                              const stConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                              return (
                                <Badge variant="outline" className={`px-2.5 py-1 text-xs font-semibold ${stConfig.className}`}>
                                  {stConfig.label}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Order Items */}
                        <CardContent className="p-6">
                          <div className="profile-order-items-list">
                            {order.items?.map((item) => (
                              <div key={item.productId} className="profile-order-item">
                                <img
                                  src={item.image || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=100&auto=format&fit=crop&q=60"}
                                  alt={item.name}
                                  className="profile-order-item-img"
                                />
                                <div className="profile-order-item-details">
                                  <h4 className="profile-order-item-name">
                                    {item.name}
                                  </h4>
                                  <p className="profile-order-item-quantity">
                                    Số lượng: <span className="profile-order-item-qty-val">{item.quantity}</span>
                                  </p>
                                </div>
                                <div className="profile-order-item-price-col">
                                  <p className="profile-order-item-price">
                                    {formatVND(item.price)}
                                  </p>
                                  <p className="profile-order-item-total">
                                    Tổng: {formatVND(item.lineTotal || (item.price * item.quantity))}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer & Metadata */}
                          <div className="profile-order-footer">
                            <div className="profile-order-shipping-summary">
                              <p>
                                <span className="profile-order-shipping-label">Người nhận:</span> {order.shippingInfo?.fullName} ({order.shippingInfo?.phone})
                              </p>
                              <p className="line-clamp-2">
                                <span className="profile-order-shipping-label">Địa chỉ giao:</span> {order.shippingInfo?.address}
                              </p>
                              {order.shippingInfo?.notes && (
                                <p className="profile-order-shipping-notes">
                                  Lưu ý: "{order.shippingInfo.notes}"
                                </p>
                              )}
                            </div>

                            <div className="profile-order-price-summary">
                              <div className="profile-order-summary-fees">
                                <div className="profile-order-fee-row">
                                  <span>Tạm tính:</span>
                                  <span className="profile-order-fee-val">{formatVND(order.subtotal)}</span>
                                </div>
                                <div className="profile-order-fee-row">
                                  <span>Phí vận chuyển:</span>
                                  <span className="profile-order-fee-val">{formatVND(order.shippingFee)}</span>
                                </div>
                                {order.paymentMethod && (
                                  <div className="profile-order-payment-method-row">
                                    <span>Phương thức:</span>
                                    <span className="profile-order-payment-method-badge">
                                      {order.paymentMethod === 'COD' ? 'COD (Thanh toán khi nhận)' : 'Chuyển khoản (VNPay)'}
                                    </span>
                                  </div>
                                )}
                                {order.walletAmount > 0 && (
                                  <div className="profile-order-fee-row text-emerald-700">
                                    <span>Đã dùng từ ví:</span>
                                    <span className="profile-order-fee-val">
                                      {formatVND(order.walletAmount)}
                                    </span>
                                  </div>
                                )}
                                {order.refundedAmount > 0 && (
                                  <div className="profile-order-fee-row text-violet-700">
                                    <span>Đã hoàn vào ví:</span>
                                    <span className="profile-order-fee-val">
                                      {formatVND(order.refundedAmount)}
                                    </span>
                                  </div>
                                )}
                                {order.cancellationReason && (
                                  <div className="profile-order-fee-row text-rose-700">
                                    <span>Lý do hủy:</span>
                                    <span className="profile-order-fee-val">
                                      {CANCELLATION_REASON_LABELS[order.cancellationReason] ||
                                        order.cancellationReason}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="profile-order-grand-total-row">
                                <span className="profile-order-total-label">
                                  Thành tiền phải thanh toán:
                                </span>
                                <span className="profile-order-total-amount">
                                  {formatVND(getRemainingPayment(order))}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Hành động của khách - chỉ hiện khi status = sented */}
                          {order.status === 'sented' && (
                            <div className="profile-order-actions">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                                onClick={() => handleCustomerAction(order._id || order.id, 'succeeded')}
                              >
                                ✓ Đã nhận hàng
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 font-medium"
                                onClick={() => handleCustomerAction(order._id || order.id, 'returning')}
                              >
                                ↩ Yêu cầu hoàn trả
                              </Button>
                            </div>
                          )}
                          {order.status === 'pending' && (
                            <div className="profile-order-actions">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => handleCustomerAction(order._id || order.id, 'cancelled')}
                              >
                                Hủy đơn hàng
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
  );
}

export { ProfileOrdersTab };
