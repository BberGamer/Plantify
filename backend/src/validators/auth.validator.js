const v = require("./common");
const register = (input) => {
  v.object(input);
  return {
    fullName: v.text(input.fullName, "fullName"),
    email: v.email(input.email),
    password: v.password(input.password),
    phone: input.phone === undefined ? "" : v.phone(input.phone),
  };
};
const verify = (input) => {
  v.object(input);
  return { email: v.email(input.email), otp: v.otp(input.otp) };
};
const login = (input) => {
  v.object(input);
  return {
    email: v.email(input.email),
    password: v.password(input.password, "password", false),
  };
};
const reset = (input) => ({
  ...verify(input),
  newPassword: v.password(input.newPassword, "newPassword"),
});
const profile = (input) => {
  v.object(input);
  const result = {
    fullName: v.text(input.fullName, "fullName"),
    email: v.email(input.email),
    phone: v.phone(input.phone),
  };
  if (result.fullName.length > 100)
    v.invalid("fullName", "Họ tên không quá 100 ký tự.");
  if (input.newPassword !== undefined)
    result.newPassword = v.password(input.newPassword, "newPassword");
  if (input.currentPassword !== undefined)
    result.currentPassword = v.password(
      input.currentPassword,
      "currentPassword",
      false,
    );
  return result;
};
module.exports = { register, verify, login, reset, profile };
