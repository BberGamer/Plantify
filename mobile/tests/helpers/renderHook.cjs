// renderHook.cjs - Chạy hook với React state thật, service giả và đồng hồ điều khiển được.
const fs = require("node:fs");
const path = require("node:path");
const React = require("react");
const ShallowRenderer = require("react-shallow-renderer");
const babel = require("@babel/core");

const flush = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};
const sourceRoot = path.resolve(__dirname, "../../src");
const storePath = path.resolve(__dirname, "../../store/authStore.js");

function renderHook(t, filename, options = {}) {
  const records = new Set();
  const effects = new Set();
  const timers = new Map();
  const cache = new Map();
  let clock = 100000;
  let timerId = 0;
  let stopped = false;
  let current;
  const store = options.store || {};
  const mocks = {
    "expo-router": { useRouter: () => options.router || { push() {}, replace() {}, back() {} } },
    "react-native": { Alert: { alert() {} } },
    [storePath]: (selector) => selector ? selector(store) : store,
    [path.join(sourceRoot, "services/authService.js")]: options.authService || {},
    [path.join(sourceRoot, "services/plantService.js")]: options.plantService || {},
    [path.join(sourceRoot, "services/userService.js")]: options.userService || {},
    ...options.mocks,
  };
  const runEffects = () => {
    if (stopped) return;
    const pending = [...effects];
    effects.clear();
    pending.forEach((record) => {
      const next = record.pending;
      if (!next) return;
      record.pending = null;
      record.cleanup?.();
      record.deps = next.deps;
      record.initialized = true;
      record.cleanup = next.setup();
    });
  };
  // Shallow renderer không chạy effect; mô phỏng commit và cleanup theo dependency.
  const reactWithEffects = {
    ...React,
    // Renderer này trả thẳng callback; dùng useMemo để giữ đúng dependency như React.
    useCallback: (callback, deps) => React.useMemo(() => callback, deps),
    useEffect(setup, deps) {
      const ref = React.useRef({ initialized: false });
      const record = ref.current;
      records.add(record);
      if (!record.initialized || !deps || deps.some((value, index) => !Object.is(value, record.deps?.[index]))) {
        record.pending = { setup, deps };
        effects.add(record);
        queueMicrotask(runEffects);
      }
    },
  };
  const controlledSetTimeout = (callback, delay = 0) => {
    timers.set(++timerId, { callback, due: clock + delay });
    return timerId;
  };
  class ControlledDate extends Date { static now() { return clock; } }
  function load(modulePath) {
    if (mocks[modulePath]) return mocks[modulePath];
    if (cache.has(modulePath)) return cache.get(modulePath).exports;
    const result = { exports: {} };
    cache.set(modulePath, result);
    const compiled = babel.transformSync(fs.readFileSync(modulePath, "utf8"), {
      babelrc: false, configFile: false,
      plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
    }).code;
    new Function("require", "module", "exports", "setTimeout", "clearTimeout", "Date", compiled)(
      (name) => {
        if (name === "react") return reactWithEffects;
        if (mocks[name]) return mocks[name];
        if (name.startsWith(".")) return load(path.resolve(path.dirname(modulePath), name + (path.extname(name) ? "" : ".js")));
        return require(name);
      },
      result, result.exports, controlledSetTimeout, (id) => timers.delete(id), ControlledDate,
    );
    return result.exports;
  }
  const exported = load(path.join(sourceRoot, "hooks", filename));
  const hook = exported[options.exportName || "default"];
  const renderer = ShallowRenderer.createRenderer();
  function Harness({ input }) { current = hook(input); return React.createElement("hook-result"); }
  const rerender = (input) => renderer.render(React.createElement(Harness, { input }));
  rerender(options.input);
  const unmount = () => {
    if (stopped) return;
    stopped = true;
    effects.clear();
    records.forEach((record) => record.cleanup?.());
    renderer.unmount();
  };
  t.after(unmount);
  return {
    get state() { return current; },
    timers, rerender, unmount,
    async advance(milliseconds) {
      const target = clock + milliseconds;
      await flush();
      for (let iterations = 0; iterations < 1000; iterations += 1) {
        const next = [...timers].filter(([, timer]) => timer.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        clock = next[1].due;
        timers.delete(next[0]);
        next[1].callback();
        await flush();
      }
      clock = target;
      await flush();
    },
  };
}

module.exports = { renderHook, flush, deferred };
