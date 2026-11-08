const test = require("node:test");
const assert = require("node:assert/strict");
const Favorite = require("../../models/favoritePlant.model");
const Plant = require("../../models/plant.model");
const service = require("../favorite.service");
const user = "111111111111111111111111";
const other = "222222222222222222222222";
const id = (n) => n.toString(16).padStart(24, "0");

function fixture(t, initial = []) {
  const rows = initial.map((row) => ({ user_id: user, ...row }));
  const matches = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
  t.mock.method(Plant, "exists", async () => true);
  t.mock.method(Favorite, "init", async () => {});
  t.mock.method(Favorite, "exists", async (query) => rows.some((row) => matches(row, query)));
  t.mock.method(Favorite, "find", (query) => ({ select: () => ({ lean: async () => rows.filter((row) => matches(row, query)) }) }));
  t.mock.method(Favorite, "create", async (row) => {
    if (rows.some((saved) => saved.user_id === row.user_id &&
        (saved.plant_id === row.plant_id || saved.free_slot === row.free_slot))) {
      throw Object.assign(new Error("duplicate"), { code: 11000 });
    }
    rows.push(row);
  });
  t.mock.method(Favorite, "deleteOne", async (query) => {
    const index = rows.findIndex((row) => matches(row, query));
    if (index >= 0) rows.splice(index, 1);
  });
  return rows;
}

test("Free: concurrent additions cannot exceed five; existing PUT stays idempotent", async (t) => {
  const rows = fixture(t);
  const results = await Promise.allSettled(Array.from({ length: 12 }, (_, n) => service.add(user, id(n))));
  assert.equal(rows.length, 5);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 5);
  for (const result of results.filter((result) => result.status === "rejected")) {
    assert.equal(result.reason.code, "FAVORITE_LIMIT_REACHED");
    assert.equal(result.reason.statusCode, 409);
  }
  assert.deepEqual(await service.add(user, rows[0].plant_id), { plant_id: rows[0].plant_id, is_favorite: true });
  assert.equal(rows.length, 5);
});

test("legacy favorites count toward quota; removal releases capacity and is scoped to owner", async (t) => {
  const rows = fixture(t, Array.from({ length: 5 }, (_, n) => ({ plant_id: id(n) })));
  await assert.rejects(service.add(user, id(9)), { code: "FAVORITE_LIMIT_REACHED" });
  await service.remove(other, id(0));
  assert.equal(rows.length, 5);
  await service.remove(user, id(0));
  await service.remove(user, id(0));
  await service.add(user, id(9));
  assert.equal(rows.length, 5);
});

test("duplicate concurrent saves succeed with one stored favorite", async (t) => {
  const rows = fixture(t);
  const results = await Promise.all(Array.from({ length: 8 }, () => service.add(user, id(7))));
  assert.equal(rows.length, 1);
  assert.ok(results.every((result) => result.is_favorite));
});

test("invalid IDs and unpublished plants are rejected without saving", async (t) => {
  const rows = fixture(t);
  await assert.rejects(service.add(user, "bad"), { code: "INVALID_ID" });
  Plant.exists.mock.mockImplementation(async () => false);
  await assert.rejects(service.add(user, id(1)), { code: "PLANT_NOT_FOUND" });
  assert.equal(rows.length, 0);
});

test("list filters published plants before counting and pagination, scoped to customer", async (t) => {
  let pipeline;
  t.mock.method(Favorite, "aggregate", async (stages) => {
    pipeline = stages;
    return [{ plants: [{ _id: id(1) }], count: [{ total: 1 }] }];
  });
  t.mock.method(Plant, "populate", async (plants) => plants);
  const result = await service.list(user, { page: "2", limit: "1" });
  assert.equal(String(pipeline[0].$match.user_id), user);
  assert.ok(pipeline.findIndex((stage) => stage.$match?.["plant.is_published"]) < pipeline.findIndex((stage) => stage.$facet));
  assert.equal(result.total, 1);
  assert.equal(result.page, 2);
  assert.equal(result.plants.length, 1);
});
