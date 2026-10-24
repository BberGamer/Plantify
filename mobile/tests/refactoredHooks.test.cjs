// refactoredHooks.test.cjs - Kiểm tra các luồng Auth, tra cứu cây và quản lý tài khoản.
const assert = require("node:assert/strict");
const test = require("node:test");
const { renderHook, flush, deferred } = require("./helpers/renderHook.cjs");

const success = (data = null) => ({ success: true, data });
const user = { _id: "user-1", fullName: "Nguyễn An", email: "an@example.com", role: "customer", status: true };
const usersResponse = (users = [user]) => success({ users, pagination: { currentPage: 1, totalUsers: users.length, totalPages: 1 } });
const fillRegistration = (app) => {
  Object.entries({ fullName: user.fullName, email: user.email, phone: "", password: "12345678", confirmPassword: "12345678", agreeTerms: true })
    .forEach(([key, value]) => app.state.changeField(key, value));
};

test("registration validates the draft and only advances after OTP is sent", async (t) => {
  const pending = deferred();
  let sends = 0;
  const app = renderHook(t, "useRegister.js", {
    authService: { sendRegisterOTP: () => { sends += 1; return pending.promise; } },
  });
  await flush();
  await app.state.sendOTP();
  assert.equal(sends, 0);
  assert.ok(app.state.errorMsg);
  fillRegistration(app);
  const send = app.state.sendOTP;
  const sending = send();
  await send();
  app.state.goBack();
  app.state.changeField("email", "other@example.com");
  assert.equal(sends, 1);
  assert.equal(app.state.step, 1);
  assert.equal(app.state.form.email, user.email);
  pending.resolve(success());
  await sending;
  assert.equal(app.state.step, 2);
  assert.equal(app.state.countdown, 60);
  await app.state.resendOTP();
  assert.equal(sends, 1);
  await app.advance(60000);
  await app.state.resendOTP();
  assert.equal(sends, 2);
  assert.equal(app.state.countdown, 60);
  app.state.goBack();
  await flush();
  assert.equal(app.state.step, 1);
  assert.equal(app.timers.size, 0);
});

test("registration rejects malformed sessions and allows a verification retry", async (t) => {
  const sessions = [];
  const routes = [];
  let verifications = 0;
  const app = renderHook(t, "useRegister.js", {
    authService: {
      sendRegisterOTP: async () => success(),
      verifyRegisterOTP: async () => ++verifications === 1 ? success({ token: 123 }) : success({ user, token: "jwt" }),
    },
    store: { setAuthSession: async (...args) => sessions.push(args) },
    router: { replace: (route) => routes.push(route) },
  });
  await flush();
  fillRegistration(app);
  await app.state.sendOTP();
  app.state.changeOtp("12AB56");
  await app.state.verifyOTP();
  assert.equal(verifications, 0);
  app.state.changeOtp("123456");
  await app.state.verifyOTP();
  assert.equal(sessions.length, 0);
  assert.ok(app.state.errorMsg);
  await app.state.verifyOTP();
  assert.deepEqual(sessions, [[user, "jwt"]]);
  assert.deepEqual(routes, ["/(tabs)"]);
});

test("reset invalidates the OTP when email changes and prevents duplicate resets", async (t) => {
  const pending = deferred();
  let resets = 0;
  const app = renderHook(t, "useResetPassword.js", {
    authService: { forgotPassword: async () => success(), resetPassword: () => { resets += 1; return pending.promise; } },
  });
  await flush();
  app.state.changeEmail(user.email);
  await app.state.sendCode();
  app.state.changeOtp("123456");
  app.state.changeEmail("other@example.com");
  assert.equal(app.state.codeSent, false);
  assert.equal(app.state.isOtpComplete, false);
  assert.equal(app.state.otp, "");
  await app.state.sendCode();
  app.state.changeOtp("123456");
  app.state.changeNewPassword("12345678");
  app.state.changeConfirmPassword("wrong");
  await app.state.confirmReset();
  assert.equal(resets, 0);
  app.state.changeConfirmPassword("12345678");
  const confirm = app.state.confirmReset;
  const resetting = confirm();
  await confirm();
  app.state.changeEmail(user.email);
  assert.equal(app.state.email, "other@example.com");
  assert.equal(resets, 1);
  pending.resolve(success());
  await resetting;
  assert.equal(app.state.resetSuccess, true);
  assert.equal(app.state.newPassword, "");
});

test("reset cleans up its redirect timer on unmount", async (t) => {
  const routes = [];
  const app = renderHook(t, "useResetPassword.js", {
    authService: { forgotPassword: async () => success(), resetPassword: async () => success() },
    router: { replace: (route) => routes.push(route) },
  });
  await flush();
  app.state.changeEmail(user.email);
  await app.state.sendCode();
  app.state.changeOtp("123456");
  app.state.changeNewPassword("12345678");
  app.state.changeConfirmPassword("12345678");
  await app.state.confirmReset();
  app.unmount();
  await app.advance(3000);
  assert.deepEqual(routes, []);
  assert.equal(app.timers.size, 0);
});

test("login validates, prevents duplicate requests and routes by role", async (t) => {
  const pending = deferred();
  const routes = [];
  const credentials = [];
  const app = renderHook(t, "useLogin.js", {
    store: { login: (...args) => { credentials.push(args); return pending.promise; }, clearError() {}, isLoading: false },
    router: { replace: (route) => routes.push(route) },
  });
  await flush();
  await app.state.submit();
  assert.equal(credentials.length, 0);
  app.state.changeEmail(" an@example.com ");
  app.state.changePassword(" password with spaces ");
  const submit = app.state.submit;
  const loggingIn = submit();
  await submit();
  assert.deepEqual(credentials, [[user.email, " password with spaces "]]);
  pending.resolve({ success: true, user: { role: "manager" } });
  await loggingIn;
  assert.deepEqual(routes, ["/manager"]);
});

test("logout exposes failure for retry and prevents duplicate requests", async (t) => {
  const pending = deferred();
  let calls = 0;
  const routes = [];
  const app = renderHook(t, "useLogout.js", {
    store: { logout: () => { calls += 1; return calls === 1 ? pending.promise : Promise.resolve(); } },
    router: { replace: (route) => routes.push(route) },
  });
  await flush();
  const logout = app.state.handleLogout;
  const loggingOut = logout();
  await logout();
  assert.equal(calls, 1);
  pending.reject(new Error("storage"));
  await loggingOut;
  assert.ok(app.state.logoutError);
  assert.equal(app.state.isLoggingOut, false);
  await app.state.handleLogout();
  assert.deepEqual(routes, ["/(auth)/login"]);
});

test("plant detail ignores old IDs and settles an absent ID", async (t) => {
  const requests = [];
  const app = renderHook(t, "usePlants.js", {
    exportName: "usePlantDetail", input: "first",
    plantService: { getPlantById: (id) => { const pending = deferred(); requests.push({ id, ...pending }); return pending.promise; } },
  });
  await flush();
  app.rerender("second");
  await flush();
  requests[1].resolve(success({ _id: "second" }));
  await flush();
  requests[0].resolve(success({ _id: "first" }));
  await flush();
  assert.equal(app.state.plant._id, "second");
  app.rerender(undefined);
  await flush();
  assert.equal(app.state.loading, false);
  assert.ok(app.state.error);
});

test("directory debounce keeps only the latest query and clear cancels the old search", async (t) => {
  const queries = [];
  let categoryCalls = 0;
  const app = renderHook(t, "usePlantDirectory.js", {
    plantService: {
      getPlants: async (query) => { queries.push(query); return success({ plants: [], total: 0 }); },
      getCategories: async () => { categoryCalls += 1; return success([]); },
    },
  });
  await flush();
  app.state.changeSearch("tr");
  await flush();
  app.state.changeSearch("trầu");
  await app.advance(500);
  assert.deepEqual(queries.map((query) => query.search), ["", "trầu"]);
  app.state.changeSearch("old");
  await flush();
  app.state.clearSearch();
  await app.advance(500);
  assert.deepEqual(queries.map((query) => query.search), ["", "trầu", ""]);
  assert.equal(categoryCalls, 1);
  app.state.changeSearch("pending");
  await flush();
  app.unmount();
  assert.equal(app.timers.size, 0);
});

test("plant list ignores responses arriving out of order", async (t) => {
  const requests = [];
  const app = renderHook(t, "usePlants.js", {
    exportName: "usePlants", input: "category-a",
    plantService: { getPlants: () => { const pending = deferred(); requests.push(pending); return pending.promise; } },
  });
  await flush();
  app.rerender("category-b");
  await flush();
  requests[1].resolve(success({ plants: [{ _id: "new" }], total: 1 }));
  await flush();
  requests[0].resolve(success({ plants: [{ _id: "old" }], total: 1 }));
  await flush();
  assert.equal(app.state.plants[0]._id, "new");
});

test("Admin clears search immediately and ignores outdated list requests", async (t) => {
  const requests = [];
  const app = renderHook(t, "useAdminUsers.js", {
    store: { user: { _id: "admin-1", role: "admin" } },
    userService: { getUsers: (query) => { const pending = deferred(); requests.push({ query, ...pending }); return pending.promise; } },
  });
  await flush();
  app.state.setSearch("old");
  app.state.handleSearchSubmit();
  app.state.handleSearchClear();
  assert.equal(requests[1].query.search, "old");
  assert.equal(requests[2].query.search, undefined);
  requests[2].resolve(usersResponse([{ ...user, _id: "current" }]));
  await flush();
  requests[1].resolve(usersResponse([{ ...user, _id: "stale" }]));
  requests[0].resolve(usersResponse([{ ...user, _id: "initial" }]));
  await flush();
  assert.equal(app.state.users[0]._id, "current");
  assert.equal(app.state.loading, false);
});

test("Admin blocks duplicate mutations, keeps failed dialogs open and cleans toast timers", async (t) => {
  const pending = deferred();
  let updates = 0;
  const app = renderHook(t, "useAdminUsers.js", {
    store: { user: { _id: "admin-1", role: "admin" } },
    userService: {
      getUsers: async () => usersResponse(),
      updateUserRole: () => { updates += 1; return pending.promise; },
    },
  });
  await flush();
  app.state.handleOpenRoleModal(user);
  app.state.setNewRoleSelection("manager");
  const confirm = app.state.handleConfirmRoleChange;
  const updating = confirm();
  await confirm();
  app.state.setRoleModalVisible(false);
  assert.equal(updates, 1);
  assert.equal(app.state.roleModalVisible, true);
  pending.reject(new Error("Không thể cập nhật"));
  await updating;
  assert.equal(app.state.roleModalVisible, true);
  assert.equal(app.state.submitting, false);
  assert.equal(app.state.toast.type, "error");
  app.unmount();
  assert.equal(app.timers.size, 0);
});
