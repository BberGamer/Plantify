// useManagerPlants.test.cjs - Kiểm tra luồng state bất đồng bộ bằng service giả.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const React = require("react");
const ShallowRenderer = require("react-shallow-renderer");
const babel = require("@babel/core");
const loadPureModule = require("./helpers/loadPureModule.cjs");
const errorMessages = loadPureModule(path.join(__dirname, "../src/utils/getErrorMessage.js"));

const hookCode = babel.transformSync(
  fs.readFileSync(path.join(__dirname, "../src/hooks/useManagerPlants.js"), "utf8"),
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
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};
const listResponse = (plants = [], total = plants.length) => ({ success: true, data: { plants, total } });
const categoryResponse = { success: true, data: [{ _id: "category-1", category_name: "Cây cảnh" }] };
const plant = {
  _id: "plant-1",
  category_id: { _id: "category-1" },
  common_name: "Trầu bà",
  scientific_name: "Epipremnum aureum",
  care_requirements: { water: "Mỗi tuần", soil: "Đất thoáng", fertilizer: { interval: 30 }, humidity: 65 },
  common_disease_ids: ["disease-1"],
  is_published: false,
};

function mount(t, overrides = {}) {
  const service = {
    getManagerPlants: async () => listResponse([plant]),
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
  const reactWithEffect = { ...React, useEffect: (setup) => { effect = setup; } };
  const compiled = { exports: {} };
  new Function("require", "module", "exports", "setTimeout", "clearTimeout", hookCode)(
    (name) => name === "react" ? reactWithEffect : name === "../utils/getErrorMessage" ? errorMessages : service,
    compiled,
    compiled.exports,
    (callback) => { timers.set(++timerId, callback); return timerId; },
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
    get state() { return current; },
    timers,
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach((callback) => callback());
    },
    unmount,
  };
}

test("debounces search, ignores stale responses and does not reload categories", async (t) => {
  const requests = [];
  let categoryCalls = 0;
  const app = mount(t, {
    getManagerPlants: (query) => {
      const pending = deferred();
      requests.push({ ...pending, query });
      return pending.promise;
    },
    getCategories: async () => { categoryCalls += 1; return categoryResponse; },
  });
  await flush();
  app.state.changeSearch("tr");
  app.state.changeSearch("trầu");
  assert.equal(requests.length, 1);
  assert.equal(app.timers.size, 1);
  requests[0].resolve(listResponse([{ _id: "stale" }]));
  await flush();
  assert.deepEqual(app.state.plants, []);
  assert.equal(app.state.loading, true);
  app.runTimers();
  assert.equal(requests[1].query.search, "trầu");
  app.state.changeSearch("lan");
  app.runTimers();
  requests[2].resolve(listResponse([{ _id: "latest" }], 125));
  await flush();
  requests[1].resolve(listResponse([{ _id: "old-search" }]));
  await flush();
  assert.equal(app.state.plants[0]._id, "latest");
  assert.equal(app.state.total, 125);
  assert.equal(app.state.loading, false);
  assert.equal(categoryCalls, 1);
});

test("refresh uses the latest query and cancels a pending search timer", async (t) => {
  const queries = [];
  const app = mount(t, {
    getManagerPlants: async (query) => { queries.push(query.search); return listResponse(); },
  });
  await flush();
  app.state.changeSearch("  lan  ");
  await app.state.refresh();
  assert.deepEqual(queries, ["", "lan"]);
  assert.equal(app.timers.size, 0);
  assert.equal(app.state.refreshing, false);
});

test("save preserves unedited care data, locks the draft and prevents duplicate requests", async (t) => {
  const pending = deferred();
  const updates = [];
  const app = mount(t, {
    updatePlant: (id, payload) => { updates.push({ id, payload }); return pending.promise; },
  });
  await flush();
  app.state.openEdit(plant);
  app.state.changeField("common_name", "  Trầu bà mới  ");
  app.state.changeCareField("water", "  ");
  const submit = app.state.save;
  const saving = submit();
  await submit();
  app.state.closeForm();
  app.state.changeField("common_name", "Không được ghi");
  app.state.openCreate();
  assert.equal(app.state.visible, true);
  assert.equal(app.state.saving, true);
  assert.equal(app.state.form.common_name, "  Trầu bà mới  ");
  assert.equal(updates.length, 1);
  assert.equal(updates[0].id, plant._id);
  assert.equal(updates[0].payload.common_name, "Trầu bà mới");
  assert.deepEqual(updates[0].payload.care_requirements, {
    soil: "Đất thoáng", fertilizer: { interval: 30 }, humidity: 65,
  });
  assert.deepEqual(updates[0].payload.common_disease_ids, ["disease-1"]);
  assert.equal(updates[0].payload.is_published, false);
  assert.equal(plant.care_requirements.water, "Mỗi tuần");
  pending.resolve({ success: true });
  await saving;
  assert.equal(app.state.visible, false);
  assert.equal(app.state.editing, null);
  assert.equal(app.state.form.common_name, "");
  assert.equal(app.state.saving, false);
});

test("create validates required fields and cancel discards the draft", async (t) => {
  const created = [];
  const app = mount(t, {
    createPlant: async (payload) => { created.push(payload); return { success: true }; },
  });
  await flush();
  app.state.openCreate();
  await app.state.save();
  assert.ok(app.state.formError);
  assert.equal(created.length, 0);
  app.state.changeField("common_name", "Nháp");
  app.state.closeForm();
  app.state.openCreate();
  assert.equal(app.state.form.common_name, "");
  app.state.changeField("common_name", "  Lan  ");
  app.state.changeField("scientific_name", "  Orchidaceae  ");
  app.state.changeCareField("light", "  Gián tiếp  ");
  await app.state.save();
  assert.equal(created.length, 1);
  assert.equal(created[0].common_name, "Lan");
  assert.equal(created[0].category_id, "category-1");
  assert.deepEqual(created[0].care_requirements, { light: "Gián tiếp" });
  assert.equal(app.state.visible, false);
});

test("save failure keeps the draft open and allows retry", async (t) => {
  let attempts = 0;
  const app = mount(t, {
    updatePlant: async () => {
      attempts += 1;
      if (attempts === 1) throw { response: { data: { message: "Không lưu được" } } };
      return { success: true };
    },
  });
  await flush();
  app.state.openEdit(plant);
  await app.state.save();
  assert.equal(app.state.visible, true);
  assert.equal(app.state.formError, "Không lưu được");
  assert.equal(app.state.form.common_name, plant.common_name);
  assert.equal(app.state.saving, false);
  await app.state.save();
  assert.equal(app.state.visible, false);
});

test("a successful save followed by a failed refresh reports a list error", async (t) => {
  let loads = 0;
  const app = mount(t, {
    getManagerPlants: async () => {
      if (++loads === 1) return listResponse([plant]);
      throw new Error("Không tải lại được");
    },
  });
  await flush();
  app.state.openEdit(plant);
  await app.state.save();
  assert.equal(app.state.visible, false);
  assert.equal(app.state.formError, "");
  assert.equal(app.state.listError, "Không tải lại được");
});

test("delete requires confirmation, prevents duplicate requests and blocks dismissal while pending", async (t) => {
  const pending = deferred();
  let deletes = 0;
  let loads = 0;
  const app = mount(t, {
    getManagerPlants: async () => {
      if (++loads === 1) return listResponse([plant]);
      throw new Error("Không tải lại được");
    },
    deletePlant: () => { deletes += 1; return pending.promise; },
  });
  await flush();
  app.state.requestDelete(plant);
  assert.equal(deletes, 0);
  app.state.closeDelete();
  assert.equal(app.state.deleteTarget, null);
  app.state.requestDelete(plant);
  const confirm = app.state.confirmDelete;
  const deleting = confirm();
  await confirm();
  app.state.closeDelete();
  assert.equal(app.state.deleteTarget._id, plant._id);
  assert.equal(deletes, 1);
  pending.resolve({ success: true });
  await deleting;
  assert.equal(app.state.deleteTarget, null);
  assert.deepEqual(app.state.plants, []);
  assert.equal(app.state.total, 0);
  assert.equal(app.state.deleting, false);
  assert.ok(app.state.listError);
});

test("delete failure keeps the selected plant and allows retry", async (t) => {
  let attempts = 0;
  const app = mount(t, {
    deletePlant: async () => ({ success: ++attempts > 1, message: "Xóa thất bại" }),
  });
  await flush();
  app.state.requestDelete(plant);
  await app.state.confirmDelete();
  assert.equal(app.state.deleteTarget._id, plant._id);
  assert.equal(app.state.deleteError, "Xóa thất bại");
  assert.equal(app.state.plants.length, 1);
  assert.equal(app.state.deleting, false);
  await app.state.confirmDelete();
  assert.equal(app.state.deleteTarget, null);
});

test("category failure does not block the list and can be retried independently", async (t) => {
  let attempts = 0;
  const app = mount(t, {
    getCategories: async () => {
      if (++attempts === 1) throw new Error("Lỗi danh mục");
      return categoryResponse;
    },
  });
  await flush();
  assert.equal(app.state.plants.length, 1);
  assert.equal(app.state.listError, "");
  assert.equal(app.state.categoriesError, "Lỗi danh mục");
  await app.state.retryCategories();
  assert.equal(app.state.categories.length, 1);
  assert.equal(app.state.categoriesError, "");
});

test("unmount cancels the debounce and ignores pending responses", async (t) => {
  const pending = deferred();
  let calls = 0;
  const app = mount(t, {
    getManagerPlants: () => { calls += 1; return pending.promise; },
  });
  app.state.changeSearch("lan");
  app.unmount();
  app.runTimers();
  pending.resolve(listResponse([plant]));
  await flush();
  assert.equal(calls, 1);
  assert.deepEqual(app.state.plants, []);
});
