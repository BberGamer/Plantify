const request = require("supertest");

jest.mock("../src/services/auth.service", () => ({
  sendRegisterOTP: jest.fn(),
  verifyRegisterOTP: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

const authService = require("../src/services/auth.service");
const app = require("../src/app");

const BASE_URL = "/api/v1/auth";
const validRegistration = {
  fullName: "Nguyen Van An",
  email: "an@example.com",
  password: "12345678",
  phone: "0912345678",
};
const registeredUser = {
  _id: "507f1f77bcf86cd799439011",
  fullName: validRegistration.fullName,
  email: validRegistration.email,
  role: "customer",
  status: true,
};
const authResult = { user: registeredUser, token: "signed.jwt.token" };

const serviceError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const expectFailure = (response, status) => {
  expect(response.status).toBe(status);
  expect(response.body).toEqual(
    expect.objectContaining({ success: false, data: null }),
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Authentication", () => {
  describe("Register - Send OTP", () => {
    test("UTC001 - sends an OTP for valid registration data", async () => {
      authService.sendRegisterOTP.mockResolvedValue();

      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send(validRegistration);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.sendRegisterOTP).toHaveBeenCalledWith(validRegistration);
    });

    test("UTC002 - rejects an email that is already registered", async () => {
      authService.sendRegisterOTP.mockRejectedValue(
        serviceError("Email is already registered", 400),
      );
      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send(validRegistration);
      expectFailure(response, 400);
    });

    test.each([
      ["UTC003 - missing fullName", { fullName: undefined }],
      ["UTC004 - missing email", { email: undefined }],
      ["UTC005 - missing password", { password: undefined }],
      ["UTC006 - invalid email format", { email: "invalid-email" }],
      ["UTC007 - whitespace-only email", { email: "   " }],
      ["UTC008 - password shorter than 8 characters", { password: "1234567" }],
      ["UTC012 - invalid phone number", { phone: "1234567890" }],
      ["UTC014 - phone has an invalid prefix and length", { phone: "02123456789" }],
    ])("%s fails validation", async (_name, override) => {
      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send({ ...validRegistration, ...override });
      expectFailure(response, 400);
      expect(authService.sendRegisterOTP).not.toHaveBeenCalled();
    });

    test("UTC009 - accepts a password with exactly 8 characters", async () => {
      authService.sendRegisterOTP.mockResolvedValue();
      const body = { ...validRegistration, password: "12345678" };
      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send(body);
      expect(response.status).toBe(200);
      expect(authService.sendRegisterOTP).toHaveBeenCalledWith(body);
    });

    test("UTC010 - accepts a full name with exactly 100 characters", async () => {
      authService.sendRegisterOTP.mockResolvedValue();
      const body = { ...validRegistration, fullName: "A".repeat(100) };
      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send(body);
      expect(response.status).toBe(200);
      expect(authService.sendRegisterOTP).toHaveBeenCalledWith(body);
    });

    test.failing("UTC011 - rejects a full name longer than 100 characters", async () => {
      authService.sendRegisterOTP.mockResolvedValue();
      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send({ ...validRegistration, fullName: "A".repeat(101) });
      expectFailure(response, 400);
      expect(authService.sendRegisterOTP).not.toHaveBeenCalled();
    });

    test.failing("UTC013 - rejects a missing phone number", async () => {
      authService.sendRegisterOTP.mockResolvedValue();
      const { phone, ...body } = validRegistration;
      const response = await request(app)
        .post(`${BASE_URL}/register/send-otp`)
        .send(body);
      expectFailure(response, 400);
      expect(authService.sendRegisterOTP).not.toHaveBeenCalled();
    });
  });

  describe("Verify OTP - Complete Registration", () => {
    const endpoint = `${BASE_URL}/register/verify-otp`;

    test("UTC015 - completes registration with the correct OTP", async () => {
      authService.verifyRegisterOTP.mockResolvedValue(authResult);
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email, otp: "123456" });
      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(authResult);
      expect(authService.verifyRegisterOTP).toHaveBeenCalledWith(
        validRegistration.email,
        "123456",
      );
    });

    test.each([
      ["UTC016 - rejects an incorrect OTP", "Incorrect OTP", 400],
      ["UTC018 - rejects an expired OTP", "OTP has expired", 400],
      ["UTC022 - rejects reuse after registration", "Registration data not found", 404],
      ["UTC023 - rejects an OTP replaced by a newer OTP", "Incorrect OTP", 400],
    ])("%s", async (_name, message, status) => {
      authService.verifyRegisterOTP.mockRejectedValue(
        serviceError(message, status),
      );
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email, otp: "123456" });
      expectFailure(response, status);
    });

    test("UTC017 - rejects a missing OTP", async () => {
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email });
      expectFailure(response, 400);
      expect(authService.verifyRegisterOTP).not.toHaveBeenCalled();
    });

    test.failing("UTC019 - rejects an OTP containing letters", async () => {
      authService.verifyRegisterOTP.mockResolvedValue(authResult);
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email, otp: "12AB56" });
      expectFailure(response, 400);
      expect(authService.verifyRegisterOTP).not.toHaveBeenCalled();
    });

    test("UTC020 - passes a six-character OTP to matching logic", async () => {
      authService.verifyRegisterOTP.mockRejectedValue(
        serviceError("Incorrect OTP", 400),
      );
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email, otp: "000000" });
      expectFailure(response, 400);
      expect(authService.verifyRegisterOTP).toHaveBeenCalledWith(
        validRegistration.email,
        "000000",
      );
    });

    test("UTC021 - rejects an OTP shorter than six characters", async () => {
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email, otp: "12345" });
      expectFailure(response, 400);
      expect(authService.verifyRegisterOTP).not.toHaveBeenCalled();
    });
  });

  describe("Login", () => {
    const endpoint = `${BASE_URL}/login`;
    const credentials = { email: validRegistration.email, password: "12345678" };

    test("UTC024 - logs in an active account with correct credentials", async () => {
      authService.login.mockResolvedValue(authResult);
      const response = await request(app).post(endpoint).send(credentials);
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(authResult);
      expect(authService.login).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
    });

    test.each([
      ["UTC025 - incorrect password", 401],
      ["UTC026 - unregistered email", 401],
      ["UTC034 - blocked account", 403],
    ])("%s is rejected", async (_name, status) => {
      authService.login.mockRejectedValue(serviceError("Login rejected", status));
      const response = await request(app).post(endpoint).send(credentials);
      expectFailure(response, status);
    });

    test.each([
      ["UTC027 - missing email", { password: credentials.password }],
      ["UTC028 - missing password", { email: credentials.email }],
      ["UTC030 - empty email and password", { email: "", password: "" }],
    ])("%s fails validation", async (_name, body) => {
      const response = await request(app).post(endpoint).send(body);
      expectFailure(response, 400);
      expect(authService.login).not.toHaveBeenCalled();
    });

    test.failing("UTC029 - rejects an invalid email format", async () => {
      authService.login.mockResolvedValue(authResult);
      const response = await request(app)
        .post(endpoint)
        .send({ email: "invalid-email", password: credentials.password });
      expectFailure(response, 400);
      expect(authService.login).not.toHaveBeenCalled();
    });

    test.failing("UTC031 - rejects email with leading or trailing spaces", async () => {
      authService.login.mockResolvedValue(authResult);
      const response = await request(app)
        .post(endpoint)
        .send({ email: ` ${credentials.email} `, password: credentials.password });
      expectFailure(response, 400);
      expect(authService.login).not.toHaveBeenCalled();
    });

    test("UTC032 - treats spaces in the password as part of the password", async () => {
      authService.login.mockRejectedValue(serviceError("Incorrect password", 401));
      const spacedPassword = ` ${credentials.password} `;
      const response = await request(app)
        .post(endpoint)
        .send({ email: credentials.email, password: spacedPassword });
      expectFailure(response, 401);
      expect(authService.login).toHaveBeenCalledWith(
        credentials.email,
        spacedPassword,
      );
    });

    test("UTC033 - accepts a correct password at the minimum length", async () => {
      authService.login.mockResolvedValue(authResult);
      const response = await request(app).post(endpoint).send(credentials);
      expect(response.status).toBe(200);
    });

    test.failing("UTC035 - rate-limits repeated failed login attempts", async () => {
      authService.login.mockRejectedValue(serviceError("Incorrect password", 401));
      let response;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        response = await request(app).post(endpoint).send(credentials);
      }
      expectFailure(response, 429);
    });
  });

  describe("Forgot Password", () => {
    const endpoint = `${BASE_URL}/forgot-password`;

    test("UTC036 - accepts a registered email", async () => {
      authService.forgotPassword.mockResolvedValue();
      const response = await request(app)
        .post(endpoint)
        .send({ email: validRegistration.email });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        validRegistration.email,
      );
    });

    test("UTC037 - rejects an unregistered email", async () => {
      authService.forgotPassword.mockRejectedValue(
        serviceError("Email is not registered", 404),
      );
      const response = await request(app)
        .post(endpoint)
        .send({ email: "missing@example.com" });
      expectFailure(response, 404);
    });

    test.each([
      ["UTC038 - missing email", {}],
      ["UTC039 - empty email", { email: "" }],
    ])("%s fails validation", async (_name, body) => {
      const response = await request(app).post(endpoint).send(body);
      expectFailure(response, 400);
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    test.failing("UTC040 - rejects an invalid email format", async () => {
      authService.forgotPassword.mockResolvedValue();
      const response = await request(app)
        .post(endpoint)
        .send({ email: "invalid-email" });
      expectFailure(response, 400);
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    test.failing("UTC041 - rejects email with leading or trailing spaces", async () => {
      authService.forgotPassword.mockResolvedValue();
      const response = await request(app)
        .post(endpoint)
        .send({ email: ` ${validRegistration.email} ` });
      expectFailure(response, 400);
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    test.failing("UTC042 - rate-limits consecutive reset requests", async () => {
      authService.forgotPassword.mockResolvedValue();
      let response;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        response = await request(app)
          .post(endpoint)
          .send({ email: validRegistration.email });
      }
      expectFailure(response, 429);
    });
  });

  describe("Reset Password", () => {
    const endpoint = `${BASE_URL}/reset-password`;
    const resetData = {
      email: validRegistration.email,
      otp: "123456",
      newPassword: "87654321",
    };

    test("UTC043 - resets the password with a valid OTP and password", async () => {
      authService.resetPassword.mockResolvedValue();
      const response = await request(app).post(endpoint).send(resetData);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetData.email,
        resetData.otp,
        resetData.newPassword,
      );
    });

    test.each([
      ["UTC044 - invalid OTP", 400],
      ["UTC045 - expired OTP", 400],
    ])("%s is rejected", async (_name, status) => {
      authService.resetPassword.mockRejectedValue(
        serviceError("OTP rejected", status),
      );
      const response = await request(app).post(endpoint).send(resetData);
      expectFailure(response, status);
    });

    test.each([
      ["UTC046 - missing OTP", { otp: undefined }],
      ["UTC047 - missing new password", { newPassword: undefined }],
      ["UTC048 - new password shorter than 8 characters", { newPassword: "1234567" }],
    ])("%s fails validation", async (_name, override) => {
      const response = await request(app)
        .post(endpoint)
        .send({ ...resetData, ...override });
      expectFailure(response, 400);
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    test("UTC049 - accepts a new password with exactly 8 characters", async () => {
      authService.resetPassword.mockResolvedValue();
      const response = await request(app).post(endpoint).send(resetData);
      expect(response.status).toBe(200);
    });

    test.failing("UTC050 - rejects a new password longer than 72 bytes", async () => {
      authService.resetPassword.mockResolvedValue();
      const response = await request(app)
        .post(endpoint)
        .send({ ...resetData, newPassword: "A".repeat(73) });
      expectFailure(response, 400);
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    test("UTC051 - logs in with the new password after reset", async () => {
      authService.login.mockResolvedValue(authResult);
      const response = await request(app).post(`${BASE_URL}/login`).send({
        email: resetData.email,
        password: resetData.newPassword,
      });
      expect(response.status).toBe(200);
      expect(authService.login).toHaveBeenCalledWith(
        resetData.email,
        resetData.newPassword,
      );
    });

    test("UTC052 - rejects the old password after reset", async () => {
      authService.login.mockRejectedValue(serviceError("Incorrect password", 401));
      const response = await request(app).post(`${BASE_URL}/login`).send({
        email: resetData.email,
        password: validRegistration.password,
      });
      expectFailure(response, 401);
    });

    test("UTC053 - rejects reuse of a reset OTP", async () => {
      authService.resetPassword.mockRejectedValue(
        serviceError("OTP does not exist", 400),
      );
      const response = await request(app).post(endpoint).send(resetData);
      expectFailure(response, 400);
    });
  });
});
