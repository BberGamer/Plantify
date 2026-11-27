const shortOutcomes = new Map([
  ["Chụp ảnh cùng một góc, ghi số lá/cây có triệu chứng và phạm vi đang bị ảnh hưởng.",
    "Có ảnh, số lá hoặc cây bệnh và phạm vi ảnh hưởng."],
  ["Ghi rõ bộ phận đã loại bỏ, cho vào túi riêng và kiểm tra cây sau thao tác.",
    "Đã ghi lại và đóng túi phần bệnh."],
  ["Ghi độ ẩm đất, tình trạng thoát nước và thời gian tán lá khô sau chăm sóc.",
    "Đã ghi độ ẩm đất, thoát nước và thời gian tán khô."],
  ["Đánh dấu cây đã vệ sinh; không dùng chung dụng cụ khi chưa khử khuẩn.",
    "Đã đánh dấu cây sạch và khử khuẩn dụng cụ."],
  ["So sánh với ảnh ngày 1, đếm vết mới và ghi mức lan: giảm, ổn định hay tăng.",
    "Có số vết mới và mức lan so với ngày 1."],
  ["Ghi quyết định tiếp tục theo dõi hoặc liên hệ chuyên gia; không tự tăng liều hay trộn thuốc.",
    "Đã ghi hướng xử lý. Tránh tăng liều hay trộn thuốc."],
  ["Tổng hợp ảnh và số liệu 7 ngày; nếu còn vết mới, tiếp tục cách ly và xin chẩn đoán chuyên môn.",
    "Có ảnh và số liệu 7 ngày. Còn vết mới, cách ly và hỏi chuyên gia."],
]);

const legacyDoses = new Map([
  ["Chỉ tưới khi công việc yêu cầu. Dùng 0 ml nếu đất còn đủ ẩm. Nếu cần tưới, đong lượng thực tế và dừng khi vùng rễ đủ ẩm.",
    "0ml (đất đủ ẩm). Nếu cần tưới, đong đến khi đủ ẩm."],
  ["Đối chiếu hướng dẫn của ngày này và nhãn sản phẩm để xác định liều. Nếu chưa có chỉ định phù hợp, chưa bón.",
    "Theo nhãn (khi có chỉ định)."],
]);

const dailySteps = (instruction) => [
  ...instruction.matchAll(/^[ \t]*Bước[ \t]+(\d+):[ \t]*(\S[^\r\n]*)/gim),
];

function withDailySteps(instruction) {
  const steps = dailySteps(instruction);
  if (steps.length !== 1 || steps[0][1] !== "1") return instruction;
  const [line, , method] = steps[0];
  const actions = method.trim().split(/;\s+/u).filter(Boolean);
  if (actions.length === 1) actions.push("Ghi lại kết quả sau khi thực hiện.");
  return instruction.replace(line, () => actions.map((action, index) =>
    `Bước ${index + 1}: ${action[0].toLocaleUpperCase("vi-VN")}${action.slice(1)}`,
  ).join("\n"));
}

function compactDose(value) {
  const original = value.trim();
  const dose = (legacyDoses.get(original) || original)
    .replace(/\s+(?:[–—-]\s*)?(?:không bón trong|cho|trong) công việc này[.!]?$/iu, "")
    .replace(/(\d)[ \t]*(ml|g)\b/giu, (_, amount, unit) => amount + unit.toLowerCase());
  return /^0g hoặc 0ml\.?$/iu.test(dose) ? "0g" : dose.replace(/^(0(?:ml|g))\.$/iu, "$1");
}

function formatTreatmentInstruction(instruction) {
  return instruction
    .replace(/^[ \t]*(?:Lượng nước|Tưới nước):[ \t]*([^\r\n]+)$/gim,
      (_, value) => `Tưới nước: ${compactDose(value)}`)
    .replace(/^[ \t]*Phân bón:[ \t]*([^\r\n]+)$/gim,
      (_, value) => `Phân bón: ${compactDose(value)}`)
    .replace(/^[ \t]*(?:=>[ \t]*)?Kết quả cần đạt:[ \t]*([^\r\n]+)$/gim,
      (_, value) => `Kết quả cần đạt: ${shortOutcomes.get(value.trim()) || value.trim()}`);
}

function presentTreatmentInstruction(instruction) {
  const formatted = formatTreatmentInstruction(instruction);
  if (!/^Tưới nước:/im.test(formatted) || !/^Phân bón:/im.test(formatted) || !dailySteps(formatted).length)
    return formatted;
  const expanded = withDailySteps(formatted);
  return /^Kết quả cần đạt:/im.test(expanded) ? expanded
    : `${expanded.trimEnd()}\nKết quả cần đạt: Có ghi nhận kết quả trong ngày.`;
}

function compactTreatmentNote(note = "", safetyGuidelines = []) {
  if (typeof note !== "string" || !note) return note;
  const shared = note.match(/[.;][ \t]+(mọi thuốc\/hoạt chất phải[^.]+\.)$/iu);
  return shared && safetyGuidelines.some((guideline) => guideline.includes(shared[1]))
    ? `${note.slice(0, shared.index).trimEnd()}.`
    : note;
}

module.exports = {
  dailySteps,
  formatTreatmentInstruction,
  presentTreatmentInstruction,
  compactTreatmentNote,
};
