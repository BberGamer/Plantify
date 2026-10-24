// loadPureModule.cjs - Nạp module ESM thuần JavaScript cho bộ kiểm tra bằng Node.
const fs = require("node:fs");
const babel = require("@babel/core");

module.exports = function loadPureModule(filename) {
  const code = babel.transformSync(fs.readFileSync(filename, "utf8"), {
    babelrc: false,
    configFile: false,
    plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
  }).code;
  const compiled = { exports: {} };
  new Function("module", "exports", code)(compiled, compiled.exports);
  return compiled.exports;
};
