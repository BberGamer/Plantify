// email.js - Nodemailer helper gửi email qua Gmail SMTP
const nodemailer = require('nodemailer');

/**
 * Tạo transporter Nodemailer kết nối Gmail qua port 465 (SSL)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Chuyển sang dùng SSL port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Gửi email chứa mã OTP xác thực đổi mật khẩu
 * @param {string} toEmail - Email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 * @returns {Promise<void>}
 */
const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Plantify 🌿" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Mã OTP đặt lại mật khẩu Plantify của bạn',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Xác thực đặt lại mật khẩu</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:36px 40px;text-align:center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                            <span style="font-size:28px;">🌿</span>
                          </div>
                          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Plantify</h1>
                          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Nền tảng cây xanh thông minh</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:700;">Mã xác thực đặt lại mật khẩu</h2>
                    <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Plantify của bạn.
                      Vui lòng sử dụng mã OTP dưới đây để hoàn tất việc xác thực. Mã này sẽ hết hạn sau <strong>5 phút</strong>.
                    </p>
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:12px 0 24px;">
                          <div style="display:inline-block;background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:16px 36px;">
                            <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:6px;color:#15803d;">${otp}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <!-- Warning box -->
                    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                        ⚠️ <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã OTP này với bất kỳ ai để tránh mất tài khoản.
                        Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                      Email này được gửi tự động từ hệ thống Plantify. Vui lòng không trả lời email này.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      © 2026 Plantify. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  // Luôn log thông tin OTP ra console trong môi trường development để dễ dàng test
  console.log('\n==================================================');
  console.log(`[EMAIL SENDING] Gửi mã OTP đặt lại mật khẩu cho: ${toEmail}`);
  console.log(`[OTP CODE] Mã OTP: ${otp}`);
  console.log('==================================================\n');

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Gửi email chứa OTP tới ${toEmail} thành công.`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối SMTP hoặc gửi email tới ${toEmail}:`, error.message);

    throw error;
  }
};

/**
 * Gửi email chứa mã OTP xác thực đăng ký tài khoản mới
 * @param {string} toEmail - Email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 * @returns {Promise<void>}
 */
const sendRegisterOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Plantify 🌿" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🌱 Mã OTP đăng ký tài khoản Plantify của bạn',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Xác thực đăng ký tài khoản</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:36px 40px;text-align:center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                            <span style="font-size:28px;">🌿</span>
                          </div>
                          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Plantify</h1>
                          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Nền tảng cây xanh thông minh</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:700;">Mã xác thực đăng ký tài khoản</h2>
                    <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                      Chào mừng bạn đến với Plantify! Bạn vừa tạo một tài khoản mới với địa chỉ email này.
                      Vui lòng sử dụng mã OTP dưới đây để hoàn tất việc xác thực và kích hoạt tài khoản. Mã này sẽ hết hạn sau <strong>5 phút</strong>.
                    </p>
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:12px 0 24px;">
                          <div style="display:inline-block;background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:16px 36px;">
                            <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:6px;color:#15803d;">${otp}</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <!-- Warning box -->
                    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                      <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                        ⚠️ <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã OTP này với bất kỳ ai để tránh mất tài khoản.
                        Nếu bạn không thực hiện yêu cầu đăng ký này, hãy bỏ qua email này.
                      </p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                      Email này được gửi tự động từ hệ thống Plantify. Vui lòng không trả lời email này.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      © 2026 Plantify. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  console.log('\n==================================================');
  console.log(`[EMAIL SENDING] Gửi mã OTP đăng ký tài khoản cho: ${toEmail}`);
  console.log(`[OTP CODE] Mã OTP: ${otp}`);
  console.log('==================================================\n');

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Gửi email xác thực đăng ký tới ${toEmail} thành công.`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối SMTP hoặc gửi email tới ${toEmail}:`, error.message);
    throw error;
  }
};

module.exports = { sendOTPEmail, sendRegisterOTPEmail };
