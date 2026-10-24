// otpInput.test.cjs - Kiểm tra dán mã và chỉnh sửa một chữ số OTP mà không lệch vị trí.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const React = require("react");
const ShallowRenderer = require("react-shallow-renderer");
const babel = require("@babel/core");

const filename = path.join(__dirname, "../src/components/auth/OtpInput.js");
const compiled = babel.transformSync(fs.readFileSync(filename, "utf8"), {
  babelrc: false, configFile: false,
  plugins: [
    [require.resolve("@babel/plugin-transform-react-jsx"), { runtime: "automatic" }],
    require.resolve("@babel/plugin-transform-modules-commonjs"),
  ],
}).code;
const exported = { exports: {} };
new Function("require", "module", "exports", compiled)(
  (name) => {
    if (name === "react-native") return { View: "View", TextInput: "TextInput", StyleSheet: { create: (styles) => styles } };
    if (name.includes("theme/colors")) return { colors: {} };
    return require(name);
  }, exported, exported.exports,
);

test("OTP supports paste and preserves other digits when deleting or replacing a middle digit", () => {
  const renderer = ShallowRenderer.createRenderer();
  const changes = [];
  const render = (value) => {
    renderer.render(React.createElement(exported.exports.default, { value, onChange: (next) => changes.push(next) }));
    return renderer.getRenderOutput().props.children;
  };
  let inputs = render("123456");
  inputs[2].props.onChangeText("");
  assert.equal(changes.at(-1), "12 456");
  inputs = render(changes.at(-1));
  assert.equal(inputs[3].props.value, "4");
  inputs[2].props.onChangeText("9");
  assert.equal(changes.at(-1), "129456");
  inputs = render("");
  inputs[0].props.onChangeText("987654");
  assert.equal(changes.at(-1), "987654");
  const count = changes.length;
  inputs[0].props.onChangeText("ABC");
  assert.equal(changes.length, count);
  renderer.unmount();
});

test("OTP inputs are locked while an auth request is pending", () => {
  const renderer = ShallowRenderer.createRenderer();
  let changes = 0;
  renderer.render(React.createElement(exported.exports.default, {
    value: "123456", disabled: true, onChange: () => { changes += 1; },
  }));
  const inputs = renderer.getRenderOutput().props.children;
  assert.ok(inputs.every((input) => input.props.editable === false));
  inputs[0].props.onChangeText("9");
  assert.equal(changes, 0);
  renderer.unmount();
});
