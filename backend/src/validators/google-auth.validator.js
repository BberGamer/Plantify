const v = require("./common");
const auth = require("./auth.validator");

const allowed = (input, fields) => {
  v.object(input);
  for (const key of Object.keys(input)) if (!fields.includes(key)) v.invalid(key, `Không được gửi trường ${key}.`);
};
const ticket = (value) => {
  if (typeof value !== "string" || !/^[\w-]{43}$/.test(value)) v.invalid("ticket", "Phiên xác thực Google không hợp lệ.");
  return value;
};

const credentials = (input) => {
  allowed(input, ["idToken", "challengeToken"]);
  const idToken = v.text(input.idToken, "idToken");
  if (idToken.length > 10000) v.invalid("idToken");
  return { idToken, challengeToken: ticket(input.challengeToken) };
};
const complete = (input, email) => {
  allowed(input, ["registrationTicket", "fullName", "phone", "password", "confirmPassword", "agreeTerms"]);
  ticket(input.registrationTicket);
  const data = auth.register({ ...input, email });
  if (data.fullName.length > 100) v.invalid("fullName", "Họ tên không quá 100 ký tự.");
  if (input.confirmPassword !== data.password) v.invalid("confirmPassword", "Mật khẩu xác nhận không khớp.");
  if (input.agreeTerms !== true) v.invalid("agreeTerms", "Vui lòng đồng ý với điều khoản dịch vụ.");
  return data;
};

module.exports = { credentials, complete, ticket };
