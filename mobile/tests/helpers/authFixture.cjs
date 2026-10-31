const { loadMobile, React } = require("./loadMobile.cjs");
const { createFocus } = require("./focusFixture.cjs");
const A = {
  _id: "507f1f77bcf86cd799439011",
  fullName: "Nguyễn An",
  email: "a@example.com",
  phone: "",
  role: "customer",
  status: true,
};
const B = {
  ...A,
  _id: "507f1f77bcf86cd799439012",
  fullName: "Bình",
  email: "b@example.com",
  role: "manager",
};
function tokenFor(user, extra = {}) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ id: user._id || user.id, role: user.role, fullName: user.fullName, exp: Math.floor(Date.now() / 1000) + 3600, ...extra })}.signature`;
}
const success = (data) => ({ success: true, message: "OK", data });
function httpError(config, status = 401, code = "SESSION_INVALID") {
  return Object.assign(new Error("HTTP failed"), {
    config,
    response: { status, data: { success: false, code, message: "raw secret" } },
  });
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

function authFixture(seed = {}, extraEntries = []) {
  const focus = createFocus();
  const data = new Map(Object.entries(seed));
  const storageCalls = [];
  const storage = {
    async getItem(key) {
      storageCalls.push(["get", key]);
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      storageCalls.push(["set", key, value]);
      data.set(key, value);
    },
    async multiRemove(keys) {
      storageCalls.push(["remove", ...keys]);
      keys.forEach((key) => data.delete(key));
    },
  };
  const navigation = {
    segments: ["auth", "login"],
    key: "root",
    calls: [],
    pushes: [],
  };
  const router = {
    replace(path) {
      navigation.calls.push(path);
    },
    push(path) {
      navigation.pushes.push(path);
    },
    back() {},
  };
  const Tabs = (props) => React.createElement("Tabs", props, props.children);
  Tabs.Screen = "TabScreen";
  const modules = loadMobile(
    [
      "../store/authStore.js",
      "services/api.js",
      "services/sessionAccess.js",
      "services/sessionStorage.js",
      ...extraEntries,
    ],
    {
      "@react-native-async-storage/async-storage": storage,
      "react-native": { Platform: { OS: "android" } },
      "expo-router": {
        useFocusEffect: focus.useFocusEffect,
        useRouter: () => router,
        useSegments: () => navigation.segments,
        useRootNavigationState: () =>
          navigation.key ? { key: navigation.key } : undefined,
        Tabs,
      },
      "@expo/vector-icons": { Ionicons: "Ionicons" },
    },
  );
  const [storeModule, apiModule, access, cache] = modules;
  const fixture = {
    focus,
    store: storeModule.default,
    api: apiModule.default,
    access,
    cache,
    data,
    storage,
    storageCalls,
    navigation,
    modules: modules.slice(4),
    calls: [],
    async onRequest(config) {
      if (config.url === "/auth/login") {
        const user = JSON.parse(config.data).email === B.email ? B : A;
        return success({ user, token: tokenFor(user) });
      }
      if (config.url === "/auth/register/verify-otp")
        return success({ user: A, token: tokenFor(A) });
      if (config.method === "patch")
        return success({ ...A, fullName: "Updated A" });
      return success(null);
    },
    signIn(user = A, token = tokenFor(user)) {
      return fixture.store.getState().setAuthSession(user, token);
    },
    persisted() {
      const value = data.get("authSession");
      return value ? JSON.parse(value) : null;
    },
  };
  fixture.api.defaults.adapter = async (config) => {
    fixture.calls.push(config);
    return {
      config,
      data: await fixture.onRequest(config),
      status: 200,
      statusText: "OK",
      headers: {},
    };
  };
  return fixture;
}
module.exports = { authFixture, A, B, tokenFor, success, httpError, tick };
