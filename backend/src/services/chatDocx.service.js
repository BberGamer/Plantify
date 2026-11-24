const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { extractDocument } = require("./treatment-ai-content.service");

const DIRECTORY = path.resolve(__dirname, "../../data/treatment-templates");

// Tài liệu tham khảo độc lập với danh mục DB; cache được làm mới theo hash file.
const createDocxReader = ({ directory = DIRECTORY, files = fs, extract = extractDocument } = {}) => {
  const cache = new Map();
  return async ({ normalize, split }) => {
    let entries;
    try {
      entries = await files.readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") { cache.clear(); return []; }
      throw error;
    }
    const filenames = entries.filter((entry) => entry.isFile() &&
      !entry.name.startsWith("~$") && /\.docx$/i.test(entry.name))
      .map((entry) => entry.name).sort();
    if (filenames.length > 100) throw new Error("DOCX file capacity exceeded");
    for (const key of cache.keys()) if (!filenames.includes(key)) cache.delete(key);
    const documents = [];
    let totalBytes = 0;
    for (const filename of filenames) {
      const filePath = path.join(directory, filename);
      const stat = await files.stat(filePath);
      if (stat.size > 5 * 1024 * 1024) throw new Error("DOCX file too large");
      totalBytes += stat.size;
      if (totalBytes > 20 * 1024 * 1024) throw new Error("DOCX byte capacity exceeded");
      const buffer = await files.readFile(filePath);
      const digest = createHash("sha256").update(buffer).digest("hex");
      let cached = cache.get(filename);
      if (cached?.digest !== digest) {
        cached = { digest, text: await extract(buffer) };
        cache.set(filename, cached);
      }
      // Không trộn các mục bệnh hoặc dùng lịch mẫu như phác đồ được duyệt.
      const sections = cached.text.split(/(?=^Bệnh:\s*)/m)
        .filter((section) => /^Bệnh:\s*/.test(section));
      for (const section of sections) {
        const diseaseName = section.match(/^Bệnh:\s*([^\n]+)/)?.[1]?.trim();
        const plantName = section.match(/^Cây áp dụng:\s*([^\n]+)/m)?.[1]?.trim();
        if (!diseaseName || !plantName) continue;
        const plantIds = [`docx-plant:${normalize(plantName)}`];
        split(section).forEach((part, index) => documents.push({
          type: "docx",
          id: `docx:${filename}`,
          title: `${filename} — ${plantName} — ${diseaseName}`,
          section: `Tài liệu tham khảo, chưa duyệt phác đồ: ${diseaseName} (${index + 1})`,
          plantIds,
          plantName,
          diseaseName,
          names: [plantName, diseaseName],
          version: null,
          updated_at: stat.mtime,
          content: `${plantName} — ${diseaseName}\n${part}`,
        }));
      }
      if (documents.length > 20000) throw new Error("DOCX chunk capacity exceeded");
    }
    return documents;
  };
};

module.exports = { readDocuments: createDocxReader(), createDocxReader };
