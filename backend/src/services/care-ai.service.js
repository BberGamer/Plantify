const ai = require("../integrations/ai/ai.service");
const AppError = require("../utils/app-error");
const {
  extractDocument,
  parseJson,
  readPlantDocument,
  slugifyVietnamese,
} = require("./treatment-ai-content.service");
const { isTime } = require("./careRecurrence");

const actions = {
  "Tưới nước": "watering",
  "Bón phân": "fertilizing",
  "Ánh sáng": "sunlight",
  "Theo dõi hằng ngày": "inspection",
};
const morningTimes = { inspection: "06:45", watering: "07:00", fertilizing: "07:30", sunlight: "08:00" };
const sectionPattern = new RegExp(
  `^(${Object.keys(actions).join("|")})\\n([\\s\\S]*?)(?=^(?:${Object.keys(actions).join("|")})\\n|^Nguồn:|(?![\\s\\S]))`, "gm",
);

const lines = (section, label) => [...section.matchAll(new RegExp(`^${label}:[ \\t]*(.+)$`, "gm"))]
  .map((match) => match[1].trim()).filter(Boolean);

function readProfile(text, species) {
  const profiles = new Map();
  for (const [, aliases, body] of text.matchAll(/^Nhóm cây:[ \t]*(.+)\n([\s\S]*?)(?=^Nhóm cây:|(?![\s\S]))/gm)) {
    for (const name of aliases.split("|")) profiles.set(slugifyVietnamese(name), body);
  }
  const key = slugifyVietnamese(species.split("(")[0]);
  const match = profiles.get(key) ?? profiles.get(key.replace(/^cay-/, ""));
  const body = match ?? profiles.get("chung") ?? "";
  const sources = Array.from(body.matchAll(/^Nguồn:[ \t]*([^|\n]+)\|[ \t]*(https:\/\/[^\s]+)[ \t]*$/gm),
    ([, title, url]) => ({ title: title.trim(), url }),
  );
  const rules = Array.from(body.matchAll(sectionPattern),
    ([, label, section]) => {
      const title = section.match(/^Công việc:[ \t]*(.+)$/m)?.[1]?.trim();
      const repeat = Number(section.match(/^Tần suất:[ \t]*Mỗi (\d{1,3}) ngày[ \t]*$/m)?.[1]);
      const notes = lines(section, "Hướng dẫn").join("\n");
      const steps = lines(section, "Bước");
      const dose_note = lines(section, "Liều lượng")[0] || "";
      return { action_type: actions[label], title, repeat_every_days: repeat, notes, steps, dose_note };
    },
  );
  const actionCount = Object.keys(actions).length;
  if (new Set(rules.map((rule) => rule.action_type)).size !== actionCount || rules.length !== actionCount ||
      !sources.length || rules.some(({ action_type, title, repeat_every_days, notes, steps, dose_note }) =>
        !title || title.length > 200 || notes.length > 1000 ||
        steps.length < 2 || steps.length > 6 || steps.some((step) => step.length > 240) ||
        dose_note.length > 180 || (["watering", "fertilizing"].includes(action_type) && !dose_note) ||
        (action_type === "inspection" && repeat_every_days !== 1) ||
        !Number.isInteger(repeat_every_days) || repeat_every_days < 1 || repeat_every_days > 365)) {
    throw new AppError("CARE_REFERENCE_UNAVAILABLE", 503, "Tài liệu tham khảo từ hệ thống chưa có đủ hướng dẫn chăm sóc.");
  }
  return { rules, sources, reference_kind: match ? "species" : "general" };
}

async function loadReference(species) {
  const document = await readPlantDocument("tham-khao-cham-soc");
  if (!document)
    throw new AppError("CARE_REFERENCE_UNAVAILABLE", 503, "Chưa có tài liệu tham khảo từ hệ thống cho lịch chăm sóc.");
  try {
    return readProfile(await extractDocument(document.buffer), species);
  } catch (error) {
    if (error.code !== "INVALID_TREATMENT_DOCUMENT") throw error;
    throw new AppError("CARE_REFERENCE_UNAVAILABLE", 503, "Chưa thể đọc tài liệu tham khảo từ hệ thống.");
  }
}

async function scheduleReference(plant, rules) {
  let times = morningTimes;
  let timing_source = "default";
  try {
    const reply = await ai.complete([
      {
        role: "system",
        content: "Chọn giờ nhắc theo giờ Việt Nam từ 06:00 đến 10:00 cho các công việc trong dữ liệu. " +
          "Dựa vào loài, nơi đặt và loại chậu để chọn giờ buổi sáng phù hợp. Chỉ trả một JSON object " +
          "với khóa action_type và giá trị HH:mm. Giờ ánh sáng là giờ kiểm tra vị trí hoặc bật đèn khi cần. " +
          "Xếp giờ kiểm tra trước khi tưới nếu có cả hai. Tần suất, các bước và liều lượng giữ theo tài liệu.",
      },
      {
        role: "user",
        content: JSON.stringify({
          species: plant.species_snapshot.common_name,
          placement: plant.placement_location,
          pot: plant.pot_type_size,
          tasks: rules.map(({ action_type, title }) => ({ action_type, title })),
        }),
      },
    ], { maxTokens: 200, timeoutMs: 8000 });
    const proposed = parseJson(reply, "giờ chăm sóc");
    if (rules.every(({ action_type }) => {
      const time = proposed?.[action_type];
      return isTime(time) && time >= "06:00" && time <= "10:00";
    }) && (!proposed.inspection || !proposed.watering || proposed.inspection <= proposed.watering)) {
      times = proposed;
      timing_source = "ai";
    }
  } catch (error) {
    if (![
      "AI_TIMEOUT", "AI_NOT_CONFIGURED", "AI_BUSY", "AI_UNAVAILABLE",
      "AI_INVALID_RESPONSE", "AI_INCOMPLETE_RESPONSE",
    ].includes(error.code)) throw error;
  }
  return {
    tasks: rules.map((rule) => ({ ...rule, time: times[rule.action_type] })),
    timing_source,
  };
}

module.exports = { loadReference, scheduleReference };
