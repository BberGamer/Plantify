// CheckoutShippingSection.jsx - Hiển thị và nhập thông tin địa chỉ giao hàng
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

function CheckoutShippingSection({ errors, form, handleInputChange }) {
  return (
<Card className="border border-border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                     <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    <h2 className="text-lg font-semibold">
                      Thông tin giao hàng
                    </h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="fullName"
                      placeholder="Nhập họ và tên người nhận..."
                      value={form.fullName}
                      onChange={handleInputChange}
                      className={
                        errors.fullName
                          ? "border-destructive text-black"
                          : "text-black"
                      }
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="phone"
                        placeholder="Nhập số điện thoại..."
                        value={form.phone}
                        onChange={handleInputChange}
                        className={
                          errors.phone
                            ? "border-destructive text-black"
                            : "text-black"
                        }
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Nhập địa chỉ email..."
                        value={form.email}
                        onChange={handleInputChange}
                        className={
                          errors.email
                            ? "border-destructive text-black"
                            : "text-black"
                        }
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Địa chỉ nhận hàng{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="address"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                      value={form.address}
                      onChange={handleInputChange}
                      className={
                        errors.address
                          ? "border-destructive text-black"
                          : "text-black"
                      }
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Ghi chú đơn hàng
                    </label>
                    <Textarea
                      name="notes"
                      placeholder="Lưu ý cho shipper, thời gian nhận hàng mong muốn..."
                      value={form.notes}
                      onChange={handleInputChange}
                      className="min-h-[100px] text-black"
                    />
                  </div>
                </CardContent>
              </Card>
  );
}

export { CheckoutShippingSection };
