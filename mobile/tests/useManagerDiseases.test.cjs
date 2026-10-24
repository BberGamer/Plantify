// useManagerPlants.test.cjs - Kiểm tra luồng state bất đồng bộ bằng service giả.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const React = require("react");
const ShallowRenderer = require("react-shallow-renderer");
const babel = require("@babel/core");
const loadPureModule = require("./helpers/loadPureModule.cjs");
const errorMessages = loadPureModule(
  path.join(__dirname, "../src/utils/getErrorMessage.js"),
);

const hookCode = babel.transformSync(
  fs.readFileSync(
    path.join(__dirname, "../src/hooks/useManagerDiseases.js"),
    "utf8",
  ),
  {
    babelrc: false,
    configFile: false,
    plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")],
  },
).code;

const flush = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};
const listResponse = (plants = [], total = plants.length) => ({
  success: true,
  data: { plants, total },
});
const categoryResponse = {
  success: true,
  data: [{ _id: "category-1", category_name: "Cây cảnh" }],
};
const plant = {
  _id: "plant-1",
  category_id: { _id: "category-1" },
  common_name: "Trầu bà",
  scientific_name: "Epipremnum aureum",
  care_requirements: {
    water: "Mỗi tuần",
    soil: "Đất thoáng",
    fertilizer: { interval: 30 },
    humidity: 65,
  },
  common_disease_ids: ["disease-1"],
  is_published: false,
};

function mount(t, overrides = {}) {
  const service = {
    getManagerPlants: async () => listResponse([plant]),
    getManagerDiseases: async () => ({
      success: true,
      data: { diseases: [], total: 0 },
    }),
    getManagerDiseaseById: async () => ({ success: true, data: disease }),
    createDisease: async () => ({ success: true }),
    updateDisease: async () => ({ success: true }),
    deleteDisease: async () => ({ success: true }),
    getCategories: async () => categoryResponse,
    createPlant: async () => ({ success: true }),
    updatePlant: async () => ({ success: true }),
    deletePlant: async () => ({ success: true }),
    ...overrides,
  };
  let effect;
  let current;
  const timers = new Map();
  let timerId = 0;
  // Shallow renderer chạy state/ref/callback thật; effect mount/unmount được gọi rõ ràng.
  const reactWithEffect = {
    ...React,
    useEffect: (setup) => {
      effect = setup;
    },
  };
  const compiled = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    "setTimeout",
    "clearTimeout",
    hookCode,
  )(
    (name) =>
      name === "react"
        ? reactWithEffect
        : name === "../utils/getErrorMessage"
          ? errorMessages
          : service,
    compiled,
    compiled.exports,
    (callback) => {
      timers.set(++timerId, callback);
      return timerId;
    },
    (id) => timers.delete(id),
  );
  const renderer = ShallowRenderer.createRenderer();
  function Harness() {
    current = compiled.exports.default();
    return React.createElement("hook-result");
  }
  renderer.render(React.createElement(Harness));
  const cleanup = effect();
  let unmounted = false;
  const unmount = () => {
    if (unmounted) return;
    cleanup();
    renderer.unmount();
    unmounted = true;
  };
  t.after(unmount);
  return {
    get state() {
      return current;
    },
    timers,
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
    unmount,
  };
}

const disease = {
  _id: "d1",
  disease_name: "Đốm lá",
  typical_symptoms: "Lá đốm",
  status: "inactive",
  plants: [plant],
  treatment_protocol: { untouched: { days: 14 } },
};
test("edit loads full relationships, preserves protocol, locks submit and keeps draft on failure", async (t) => {
  const pending = deferred();
  const updates = [];
  const app = mount(t, {
    updateDisease: (id, payload) => {
      updates.push(payload);
      return pending.promise;
    },
  });
  await flush();
  app.state.openEdit({ _id: "d1" });
  await app.state.save();
  assert.equal(updates.length, 0);
  await flush();
  assert.deepEqual(app.state.form.plant_ids, [plant._id]);
  app.state.changeField("disease_name", "  Bệnh mới  ");
  const submit = app.state.save;
  const saving = submit();
  await submit();
  app.state.closeForm();
  app.state.togglePlant(plant._id);
  assert.equal(updates.length, 1);
  assert.equal(updates[0].disease_name, "Bệnh mới");
  assert.deepEqual(updates[0].treatment_protocol, disease.treatment_protocol);
  assert.equal(updates[0].status, "inactive");
  assert.equal(app.state.visible, true);
  pending.reject({
    response: {
      data: { message: "T\u00ean b\u1ec7nh \u0111\u00e3 t\u1ed3n t\u1ea1i." },
    },
  });
  await saving;
  assert.equal(
    app.state.formError,
    "T\u00ean b\u1ec7nh \u0111\u00e3 t\u1ed3n t\u1ea1i.",
  );
  assert.equal(app.state.form.disease_name, "  Bệnh mới  ");
  assert.equal(app.state.saving, false);
});
test("create validates required fields, plants and URL then submits", async (t) => {
  const created = [];
  const app = mount(t, {
    createDisease: async (payload) => {
      created.push(payload);
      return { success: true };
    },
  });
  await flush();
  app.state.openCreate();
  await app.state.save();
  assert.ok(app.state.formError);
  app.state.changeField("disease_name", "Bệnh");
  app.state.changeField("typical_symptoms", "Triệu chứng");
  await app.state.save();
  assert.equal(created.length, 0);
  app.state.togglePlant(plant._id);
  app.state.changeField("disease_image_url", "invalid");
  await app.state.save();
  assert.equal(created.length, 0);
  app.state.changeField("disease_image_url", "https://example.com/image.jpg");
  await app.state.save();
  assert.equal(created.length, 1);
  assert.equal(app.state.visible, false);
});
test("delete waits for confirmation, locks dismissal, retains error and retries", async (t) => {
  const pending = deferred();
  let calls = 0;
  const app = mount(t, {
    deleteDisease: () => {
      calls++;
      return calls === 1 ? pending.promise : Promise.resolve({ success: true });
    },
  });
  await flush();
  app.state.requestDelete(disease);
  assert.equal(calls, 0);
  const confirm = app.state.confirmDelete;
  const deleting = confirm();
  await confirm();
  app.state.closeDelete();
  assert.equal(app.state.deleteTarget, disease);
  assert.equal(calls, 1);
  pending.reject(new Error("Không xóa được bệnh cây."));
  await deleting;
  assert.ok(app.state.deleteError);
  await app.state.confirmDelete();
  assert.equal(app.state.deleteTarget, null);
});
test("plant selector loads every page", async (t) => {
  const pages = [];
  const app = mount(t, {
    getManagerPlants: async ({ page }) => {
      pages.push(page);
      return {
        success: true,
        data: { plants: [{ _id: `p${page}` }], totalPages: 2 },
      };
    },
  });
  await flush();
  assert.deepEqual(pages, [1, 2]);
  assert.equal(app.state.plantOptions.length, 2);
});
test("closing edit ignores its late detail response", async (t) => {
  const pending = deferred();
  const app = mount(t, { getManagerDiseaseById: () => pending.promise });
  await flush();
  app.state.openEdit(disease);
  app.state.closeForm();
  app.state.openCreate();
  pending.resolve({ success: true, data: disease });
  await flush();
  assert.equal(app.state.editing, null);
  assert.equal(app.state.form.disease_name, "");
});
