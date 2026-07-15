// auth.service.test.js - Unit test cho đăng nhập và quy trình đăng ký bằng OTP
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../../src/features/auth/auth.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../../src/utils/email', () => ({
  sendOTPEmail: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../src/features/auth/auth.model');
const { sendOTPEmail } = require('../../../src/utils/email');
const {
  login,
  sendRegisterOTP,
  verifyRegisterOTP,
} = require('../../../src/features/auth/auth.service');

const userId = '507f1f77bcf86cd799439011';

function buildUser(overrides = {}) {
  const user = {
    _id: userId,
    fullName: 'Nguyen Van A',
    email: 'user@gmail.com',
    phone: '0912345678',
    password: 'hashed-password',
    role: 'customer',
    status: true,
    ...overrides,
  };

  user.toObject = jest.fn(() => ({ ...user, toObject: undefined }));
  return user;
}

function buildRegistration(overrides = {}) {
  return {
    fullName: 'Nguyen Van A',
    email: 'new-user@gmail.com',
    phone: '0987654321',
    address: 'Ha Noi',
    password: 'Password123',
    ...overrides,
  };
}

async function sendRegistrationAndGetOTP(registration) {
  User.findOne.mockResolvedValue(null);
  await sendRegisterOTP(registration);
  return sendOTPEmail.mock.calls.at(-1)[1];
}

describe('authService.login', () => {
  beforeEach(() => {
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('signed-jwt-token');
  });

  test('từ chối đăng nhập khi mật khẩu sai', async () => {
    User.findOne.mockResolvedValue(buildUser());
    bcrypt.compare.mockResolvedValue(false);

    await expect(login('user@gmail.com', 'wrong-password')).rejects.toMatchObject({
      message: 'Email hoặc mật khẩu không chính xác',
      statusCode: 401,
    });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('từ chối đăng nhập khi tài khoản bị khóa', async () => {
    User.findOne.mockResolvedValue(buildUser({ status: false }));

    await expect(login('user@gmail.com', 'Password123')).rejects.toMatchObject({
      message: 'Tài khoản đã bị khóa',
      statusCode: 403,
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test('tạo token và loại mật khẩu khỏi kết quả khi đăng nhập thành công', async () => {
    const user = buildUser();
    User.findOne.mockResolvedValue(user);

    const result = await login('user@gmail.com', 'Password123');

    expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: userId,
        email: 'user@gmail.com',
        role: 'customer',
        fullName: 'Nguyen Van A',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    expect(result).toEqual({
      token: 'signed-jwt-token',
      user: expect.not.objectContaining({ password: expect.anything() }),
    });
  });
});

describe('authService.sendRegisterOTP', () => {
  beforeEach(() => {
    bcrypt.genSalt.mockResolvedValue('test-salt');
    bcrypt.hash.mockResolvedValue('hashed-registration-password');
    sendOTPEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('không gửi OTP khi email đã được sử dụng', async () => {
    const registration = buildRegistration({ email: 'duplicate@gmail.com' });
    User.findOne.mockResolvedValue(buildUser({ email: registration.email }));

    await expect(sendRegisterOTP(registration)).rejects.toMatchObject({
      message: 'Email đã được sử dụng bởi tài khoản khác',
      statusCode: 400,
    });
    expect(sendOTPEmail).not.toHaveBeenCalled();
  });

  test('không gửi OTP khi số điện thoại đã được sử dụng', async () => {
    const registration = buildRegistration({ email: 'phone-duplicate@gmail.com' });
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildUser({ phone: registration.phone }));

    await expect(sendRegisterOTP(registration)).rejects.toMatchObject({
      message: 'Số điện thoại đã được sử dụng bởi tài khoản khác',
      statusCode: 400,
    });
    expect(User.findOne).toHaveBeenNthCalledWith(2, { phone: registration.phone });
    expect(sendOTPEmail).not.toHaveBeenCalled();
  });

  test('tạo OTP 6 chữ số, hash mật khẩu và gửi email đăng ký', async () => {
    const registration = buildRegistration({ email: 'otp-created@gmail.com' });
    User.findOne.mockResolvedValue(null);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);

    await expect(sendRegisterOTP(registration)).resolves.toBeUndefined();

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(registration.password, 'test-salt');
    expect(sendOTPEmail).toHaveBeenCalledWith(
      registration.email,
      expect.stringMatching(/^\d{6}$/),
      'register',
    );
  });

  test('xóa đăng ký tạm và trả lỗi 500 khi gửi email thất bại', async () => {
    const registration = buildRegistration({ email: 'mail-failed@gmail.com' });
    User.findOne.mockResolvedValue(null);
    sendOTPEmail.mockRejectedValue(new Error('SMTP unavailable'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendRegisterOTP(registration)).rejects.toMatchObject({
      statusCode: 500,
    });
    await expect(verifyRegisterOTP(registration.email, '123456')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('authService.verifyRegisterOTP', () => {
  beforeEach(() => {
    bcrypt.genSalt.mockResolvedValue('test-salt');
    bcrypt.hash.mockResolvedValue('hashed-registration-password');
    sendOTPEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('từ chối OTP không chính xác', async () => {
    const registration = buildRegistration({ email: 'wrong-otp@gmail.com' });
    const otp = await sendRegistrationAndGetOTP(registration);

    await expect(verifyRegisterOTP(registration.email, otp === '000000' ? '111111' : '000000'))
      .rejects.toMatchObject({ message: 'Mã OTP không chính xác', statusCode: 400 });
    expect(User.create).not.toHaveBeenCalled();
  });

  test('từ chối và xóa OTP đã hết hạn', async () => {
    const registration = buildRegistration({ email: 'expired-otp@gmail.com' });
    const startTime = new Date('2026-07-15T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(startTime);
    const otp = await sendRegistrationAndGetOTP(registration);
    jest.setSystemTime(new Date(startTime.getTime() + 5 * 60 * 1000 + 1));

    await expect(verifyRegisterOTP(registration.email, otp)).rejects.toMatchObject({
      message: expect.stringContaining('hết hạn'),
      statusCode: 400,
    });
    await expect(verifyRegisterOTP(registration.email, otp)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('tạo user và loại mật khẩu khỏi kết quả khi OTP hợp lệ', async () => {
    const registration = buildRegistration({ email: 'verified-user@gmail.com' });
    const otp = await sendRegistrationAndGetOTP(registration);
    const createdUser = buildUser({
      email: registration.email,
      password: 'hashed-registration-password',
    });
    User.create.mockResolvedValue(createdUser);

    const result = await verifyRegisterOTP(`  ${registration.email.toUpperCase()}  `, otp);

    expect(User.create).toHaveBeenCalledWith({
      fullName: registration.fullName,
      email: registration.email,
      phone: registration.phone,
      address: registration.address,
      password: 'hashed-registration-password',
      role: 'customer',
      status: true,
    });
    expect(result).not.toHaveProperty('password');
    await expect(verifyRegisterOTP(registration.email, otp)).rejects.toMatchObject({ statusCode: 404 });
  });
});
