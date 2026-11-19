const { buildDocuments, rank, createRetriever } = require("../chatRetrieval.service");
const Plant = require("../../models/plant.model");
const Disease = require("../../models/disease.model");
const Protocol = require("../../models/treatmentProtocol.model");
const plants = [
  { _id: "p1", common_name: "Trầu bà", scientific_name: "Epipremnum aureum", is_published: true,
    care_requirements: { watering: "Tưới nước khi đất khô. Không để ngập úng.", light: "Ánh sáng gián tiếp." }, common_disease_ids: ["d1"] },
  { _id: "p2", common_name: "Kim tiền", is_published: true,
    care_requirements: { watering: "Tưới nước ít, kiểm tra đất trước." }, common_disease_ids: [] },
  { _id: "hidden", common_name: "Cây ẩn", is_published: false, description: "Nội dung bí mật" },
];
const diseases = [
  { _id: "d1", disease_name: "Thối rễ", typical_symptoms: "Rễ mềm, lá vàng.", status: "active", content_status: "verified" },
  { _id: "d2", disease_name: "Bệnh chưa duyệt", typical_symptoms: "SECRET", status: "active", content_status: "unverified" },
  { _id: "d3", disease_name: "Bệnh ngừng dùng", typical_symptoms: "SECRET", status: "inactive", content_status: "verified" },
];
const protocols = [{ _id: "t1", disease_id: "d1", plant_ids: ["p1"], protocol_name: "Xử lý thối rễ",
  status: "approved", instruction_source: "manager_verified", version: 2, duration_days: 1,
  description: "Kiểm tra rễ trước khi xử lý.", approved_instructions: ["Cắt bỏ rễ hỏng"],
  safety_guidelines: ["Dùng găng tay"], stages: [{ order: 1, title: "Kiểm tra", start_day: 1, end_day: 1,
    instructions: ["Cắt bỏ rễ hỏng"], dosage_note: "Không dùng thuốc khi chưa xác định nguyên nhân" }] }];
const chain = (data) => ({ select() { return this; }, sort() { return this; }, limit() { return this; },
  maxTimeMS() { return this; }, lean: async () => data });
afterEach(() => jest.restoreAllMocks());

test("only published plants, verified active disease and valid linked protocols become knowledge", async () => {
  const corpus = await buildDocuments(plants, diseases, [...protocols,
    { ...protocols[0], _id: "bad", disease_id: "d2" },
    { ...protocols[0], _id: "unlinked", plant_ids: ["p2"] }], async () => true);
  expect(corpus.documents.some((doc) => doc.id === "p1")).toBe(true);
  expect(corpus.documents.some((doc) => doc.id === "t1" && doc.content.includes("Dùng găng tay"))).toBe(true);
  expect(corpus.documents.some((doc) => ["hidden", "d2", "d3", "bad", "unlinked"].includes(doc.id))).toBe(false);
  expect(JSON.stringify(corpus)).not.toContain("SECRET");
});

test("unaccented questions retrieve care with the named plant and exclude another plant", async () => {
  const corpus = await buildDocuments(plants, diseases, [], async () => true);
  const rows = rank(corpus.documents, "tuoi nuoc trau ba", [], corpus.plants);
  expect(rows[0]).toMatchObject({ id: "p1" });
  expect(rows[0].content).toContain("Tưới nước");
  expect(rows.some((doc) => doc.id === "p2")).toBe(false);
});

test("followup inherits user subject, explicit new plant overrides old subject", async () => {
  const corpus = await buildDocuments(plants, diseases, [], async () => true);
  const history = [{ role: "user", content: "Tôi trồng trầu bà" }, { role: "assistant", content: "Kim tiền?" }];
  expect(rank(corpus.documents, "Vậy tưới thế nào?", history, corpus.plants)[0].id).toBe("p1");
  expect(rank(corpus.documents, "Còn tưới kim tiền?", history, corpus.plants)[0].id).toBe("p2");
});

test("irrelevant or blank query does not return arbitrary sources", async () => {
  const corpus = await buildDocuments(plants, diseases, [], async () => true);
  expect(rank(corpus.documents, "Bitcoin chứng khoán", [], corpus.plants)).toEqual([]);
  expect(rank(corpus.documents, "", [], corpus.plants)).toEqual([]);
});

test("invalid protocol content never enters retrieval even when status is approved", async () => {
  jest.spyOn(Plant, "find").mockReturnValue(chain(plants));
  jest.spyOn(Disease, "find").mockReturnValue(chain(diseases));
  jest.spyOn(Protocol, "find").mockReturnValue(chain(protocols)); // invalid ObjectIds and missing approval metadata
  const result = await createRetriever()('Phác đồ thối rễ trầu bà');
  expect(result.sources.some((source) => source.type === "protocol")).toBe(false);
  expect(result.sources.every((source) => source.content_hash.length === 64)).toBe(true);
});

test("valid approved protocol supplies treatment stages and safety with versioned sources", async () => {
  const pid = "507f1f77bcf86cd799439011", did = "507f1f77bcf86cd799439012", tid = "507f1f77bcf86cd799439013";
  jest.spyOn(Plant, "find").mockReturnValue(chain([{ ...plants[0], _id: pid, common_disease_ids: [did] }]));
  jest.spyOn(Disease, "find").mockReturnValue(chain([{ ...diseases[0], _id: did }]));
  jest.spyOn(Protocol, "find").mockReturnValue(chain([{ ...protocols[0], _id: tid,
    disease_id: did, plant_ids: [pid], created_by: pid, approved_by: pid, approved_at: new Date() }]));
  const result = await createRetriever()("Phác đồ xử lý thối rễ trầu bà");
  expect(result.sources.some((source) => source.type === "protocol" && source.version === 2)).toBe(true);
  expect(result.content).toContain("Dùng găng tay");
  expect(result.sources.length).toBeLessThanOrEqual(6);
});

test("reads current data each turn, no stale approved knowledge cache", async () => {
  const lookup = jest.spyOn(Plant, "find").mockReturnValue(chain(plants));
  jest.spyOn(Disease, "find").mockReturnValue(chain([]));
  jest.spyOn(Protocol, "find").mockReturnValue(chain([]));
  const retrieve = createRetriever();
  expect((await retrieve("Tưới trầu bà")).sources.length).toBeGreaterThan(0);
  lookup.mockReturnValue(chain([]));
  expect((await retrieve("Tưới trầu bà")).sources).toEqual([]);
});

test("database failures and capacity overflow return safe retrieval error", async () => {
  const lookup = jest.spyOn(Plant, "find").mockImplementation(() => { throw new Error("private connection"); });
  await expect(createRetriever()("Tưới cây")).rejects.toMatchObject({ code: "CHAT_RETRIEVAL_UNAVAILABLE" });
  lookup.mockReturnValue(chain(Array(2001).fill(plants[0])));
  jest.spyOn(Disease, "find").mockReturnValue(chain([]));
  jest.spyOn(Protocol, "find").mockReturnValue(chain([]));
  await expect(createRetriever()("Tưới cây")).rejects.toMatchObject({ code: "CHAT_RETRIEVAL_UNAVAILABLE" });
});
