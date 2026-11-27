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
};
const morningTimes = { watering: "07:00", fertilizing: "07:30", sunlight: "08:00" };

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
  const rules = Array.from(body.matchAll(/^(Tưới nước|Bón phân|Ánh sáng)\n([\s\S]*?)(?=^(?:Tưới nước|Bón phân|Ánh sáng)\n|^Nguồn:|(?![\s\S]))/gm),
    ([, label, section]) => {
      const title = section.match(/^Công việc:[ \t]*(.+)$/m)?.[1]?.trim();
      const repeat = Number(section.match(/^Tần suất:[ \t]*Mỗi (\d{1,3}) ngày[ \t]*$/m)?.[1]);
      const notes = section.match(/^Hướng dẫn:[ \t]*(.+)$/gm)
        ?.map((line) => line.slice("Hướng dẫn:".length).trim()).join("\n");
      return { action_type: actions[label], title, repeat_every_days: repeat, notes };
    },
  );
  if (new Set(rules.map((rule) => rule.action_type)).size !== 3 || rules.length !== 3 ||
      !sources.length || rules.some(({ title, repeat_every_days, notes }) =>
        !title || title.length > 200 || !notes || notes.length > 1000 ||
        !Number.isInteger(repeat_every_days) || repeat_every_days < 1 || repeat_every_days > 365)) {
    throw new AppError("CARE_REFERENCE_UNAVAILABLE", 503, "Tài liệu DOCX chăm sóc thiếu hướng dẫn hoặc nguồn tham khảo.");
  }
  return { rules, sources, reference_kind: match ? "species" : "general" };
}

async function loadReference(species) {
  const document = await readPlantDocument("tham-khao-cham-soc");
  if (!document)
    throw new AppError("CARE_REFERENCE_UNAVAILABLE", 503, "Chưa có tài liệu DOCX chăm sóc.");
  return readProfile(await extractDocument(document.buffer), species);
}

async function scheduleReference(plant, rules) {
  let times = morningTimes;
  let timing_source = "default";
  try {
    const reply = await ai.complete([
      {
        role: "system",
        content: "Chọn giờ nhắc theo giờ Việt Nam từ 06:00 đến 10:00 cho các công việc trong dữ liệu. " +
          "Xem loài, nơi đặt và ghi chú để chọn giờ buổi sáng phù hợp. Chỉ trả một JSON object " +
          "với khóa action_type và giá trị HH:mm. Giờ ánh sáng là giờ kiểm tra vị trí hoặc bật đèn khi cần. " +
          "Tần suất, thời lượng và liều lượng giữ theo tài liệu.",
      },
      {
        role: "user",
        content: JSON.stringify({
          species: plant.species_snapshot.common_name,
          placement: plant.placement_location,
          pot: plant.pot_type_size,
          tasks: rules,
        }),
      },
    ], { maxTokens: 200, timeoutMs: 8000 });
    const proposed = parseJson(reply, "giờ chăm sóc");
    if (rules.every(({ action_type }) => {
      const time = proposed?.[action_type];
      return isTime(time) && time >= "06:00" && time <= "10:00";
    })) {
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
