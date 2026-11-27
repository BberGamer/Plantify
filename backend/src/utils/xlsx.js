const { Readable } = require("node:stream");
const { ZipArchive } = require("archiver");

const HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const SHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const TYPE_PREFIX = "application/vnd.openxmlformats-officedocument.spreadsheetml.";

function xml(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/gu, "")
    .replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
    })[char]);
}

function columnName(index) {
  let name = "";
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26))
    name = String.fromCharCode(65 + (value - 1) % 26) + name;
  return name;
}

const styles = HEADER + '<styleSheet xmlns="' + SHEET_NS + '">' +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>' +
  '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill>' +
  '<fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1">' +
  '<alignment vertical="top" wrapText="1"/></xf>' +
  '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

async function* worksheet({ widths, rows }) {
  yield HEADER + '<worksheet xmlns="' + SHEET_NS + '">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" state="frozen"/>' +
    '</sheetView></sheetViews><cols>' +
    widths.map((width, index) =>
      '<col min="' + (index + 1) + '" max="' + (index + 1) + '" width="' + width + '" customWidth="1"/>',
    ).join("") + '</cols><sheetData>';
  let row = 0;
  for await (const values of rows) {
    row++;
    const cells = values.map((value, column) => {
      const ref = columnName(column) + row;
      const style = row === 1 ? ' s="1"' : "";
      if (typeof value === "number" && Number.isFinite(value))
        return '<c r="' + ref + '"' + style + '><v>' + value + '</v></c>';
      // Ô văn bản luôn giữ kiểu inlineStr, kể cả khi nội dung bắt đầu bằng dấu "=".
      return '<c r="' + ref + '"' + style + ' t="inlineStr"><is><t xml:space="preserve">' +
        xml(value) + '</t></is></c>';
    });
    yield '<row r="' + row + '">' + cells.join("") + '</row>';
  }
  yield '</sheetData>' + (row > 1
    ? '<autoFilter ref="A1:' + columnName(widths.length - 1) + row + '"/>'
    : "") + '</worksheet>';
}

function createWorkbook(sheets) {
  const archive = new ZipArchive({ zlib: { level: 5 } });
  const add = (name, content) => archive.append(content, { name });
  add("[Content_Types].xml", HEADER +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="' + TYPE_PREFIX + 'sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="' + TYPE_PREFIX + 'styles+xml"/>' +
    sheets.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) +
      '.xml" ContentType="' + TYPE_PREFIX + 'worksheet+xml"/>').join("") + '</Types>');
  const relationships = (body) => HEADER + '<Relationships xmlns="' + PACKAGE_REL_NS +
    '">' + body + '</Relationships>';
  const relation = (id, type, target) =>
    '<Relationship Id="' + id + '" Type="' + REL_NS + '/' + type + '" Target="' + target + '"/>';
  add("_rels/.rels", relationships(relation("rId1", "officeDocument", "xl/workbook.xml")));
  add("xl/workbook.xml", HEADER + '<workbook xmlns="' + SHEET_NS + '" xmlns:r="' + REL_NS +
    '"><bookViews><workbookView/></bookViews><sheets>' + sheets.map((sheet, i) =>
      '<sheet name="' + xml(sheet.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>',
    ).join("") + '</sheets></workbook>');
  add("xl/_rels/workbook.xml.rels", relationships(sheets.map((_, i) =>
    relation("rId" + (i + 1), "worksheet", "worksheets/sheet" + (i + 1) + ".xml"),
  ).join("") + relation("rId" + (sheets.length + 1), "styles", "styles.xml")));
  add("xl/styles.xml", styles);
  const streams = sheets.map((sheet, i) => {
    const stream = Readable.from(worksheet(sheet));
    stream.on("error", (error) => archive.destroy(error));
    add("xl/worksheets/sheet" + (i + 1) + ".xml", stream);
    return stream;
  });
  return {
    archive,
    abort() {
      for (const stream of streams) stream.destroy();
      archive.abort();
    },
  };
}

module.exports = { createWorkbook };
