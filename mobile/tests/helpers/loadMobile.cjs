const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const babel = require("@babel/core");
const React = require("react");
const Renderer = require("react-test-renderer");
const sourceRoot = path.resolve(__dirname, "../../src");

function loadMobile(entry, overrides = {}) {
  const cache = new Map();
  const mockPaths = new Map(Object.entries(overrides).map(([name, value]) => [
    name.startsWith(".") ? path.resolve(sourceRoot, name) : name, value,
  ]));
  function load(filename) {
    if (mockPaths.has(filename)) return mockPaths.get(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const mod = { exports: {} };
    cache.set(filename, mod);
    const code = babel.transformSync(fs.readFileSync(filename, "utf8"), {
      filename, configFile: false, babelrc: false,
      plugins: [require("@babel/plugin-transform-modules-commonjs"), require("@babel/plugin-transform-react-jsx")],
    }).code;
    const actualRequire = createRequire(filename);
    const localRequire = (specifier) => {
      if (mockPaths.has(specifier)) return mockPaths.get(specifier);
      if (specifier.startsWith(".")) {
        const candidate = path.resolve(path.dirname(filename), specifier);
        const target = fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()
          ? path.join(candidate, "index.js") : candidate.endsWith(".js") ? candidate : `${candidate}.js`;
        return load(target);
      }
      return actualRequire(specifier);
    };
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename })(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return load(path.resolve(sourceRoot, entry));
}

async function mountHook(useHook, initialProps) {
  let latest;
  let renderer;
  function Probe(props) { latest = useHook(props); return null; }
  await Renderer.act(async () => { renderer = Renderer.create(React.createElement(Probe, initialProps)); });
  return {
    get current() { return latest; },
    async run(action) { await Renderer.act(async () => { await action(latest); }); },
    async rerender(props) { await Renderer.act(async () => { renderer.update(React.createElement(Probe, props)); }); },
    async unmount() { await Renderer.act(async () => { renderer.unmount(); }); },
  };
}
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
module.exports = { loadMobile, mountHook, deferred, React, Renderer };
