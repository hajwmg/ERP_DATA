import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = process.argv[2] ?? "outputs/erp_import_2020_20260430";
const payloadPath = path.join(outputDir, "ERP_conversion_payload_2020_20260430.json");
const payload = JSON.parse(await fs.readFile(payloadPath, "utf8"));

function rowsFromObjects(headers, records) {
  return [headers, ...records.map((record) => headers.map((header) => record[header] ?? null))];
}

function setColumns(sheet, widths) {
  widths.forEach((width, idx) => {
    sheet.getRangeByIndexes(0, idx, Math.max(sheet.getUsedRange(true).rowCount, 1), 1).format.columnWidthPx = width;
  });
}

function styleSheet(sheet, colCount) {
  const used = sheet.getUsedRange(true);
  used.format = {
    font: { name: "맑은 고딕", size: 10 },
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: "#D7DEE5" },
  };
  const header = sheet.getRangeByIndexes(0, 0, 1, colCount);
  header.format = {
    fill: "#D9EAF7",
    font: { bold: true, color: "#17324D", name: "맑은 고딕", size: 10 },
    horizontalAlignment: "center",
    verticalAlignment: "middle",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#AFC6D8" },
  };
  sheet.freezePanes.freezeRows(1);
}

const workbook = Workbook.create();
const upload = workbook.worksheets.add("업로드용");
const uploadRows = rowsFromObjects(payload.uploadHeaders, payload.included);
upload.getRangeByIndexes(0, 0, uploadRows.length, payload.uploadHeaders.length).writeValues(uploadRows);
styleSheet(upload, payload.uploadHeaders.length);
setColumns(upload, [80, 90, 95, 190, 90, 130, 120, 280, 70, 90, 160, 120, 95, 120, 520]);

const excluded = workbook.worksheets.add("제외목록");
const excludedRows = rowsFromObjects(payload.excludeHeaders, payload.excluded);
excluded.getRangeByIndexes(0, 0, excludedRows.length, payload.excludeHeaders.length).writeValues(excludedRows);
styleSheet(excluded, payload.excludeHeaders.length);
setColumns(excluded, [170, 70, 110, 190, 130, 120, 280, 70, 90, 90, 260, 90, 160, 260]);

const summary = workbook.worksheets.add("요약");
const summaryRows = [
  ["항목", "값"],
  ["원본 파일", payload.summary.source],
  ["변환 기준 기간", payload.summary.period],
  ["업로드 포함 건수", payload.summary.included],
  ["제외 건수", payload.summary.excluded],
  ["소모품 포함 건수", payload.summary.assetCounts["소모품"] ?? 0],
  ["장비 포함 건수", payload.summary.assetCounts["장비"] ?? 0],
  ["변환 규칙", "0원/합계 0원, 수량 0 이하, 기간 외, 합계행은 업로드 제외"],
  ["유효기간 규칙", "소모품은 시리얼 제조월 기준 +3년, 시리얼 제조월이 없으면 납품일 기준 +3년"],
  [],
  ["대표제품명", "건수"],
  ...Object.entries(payload.summary.productCounts),
  [],
  ["유효기간 계산 방식", "건수"],
  ...Object.entries(payload.summary.expiryMethodCounts),
  [],
  ["제외사유", "건수"],
  ...Object.entries(payload.summary.excludeReasonCounts),
  [],
  ["상위 병원/거래처", "건수"],
  ...Object.entries(payload.summary.topHospitals),
];
summary.getRangeByIndexes(0, 0, summaryRows.length, 2).writeValues(summaryRows);
styleSheet(summary, 2);
setColumns(summary, [210, 640]);

const output = await SpreadsheetFile.exportXlsx(workbook);
const xlsxPath = path.join(outputDir, "ERP_bulk_upload_2020_20260430.xlsx");
await output.save(xlsxPath);

const imported = await SpreadsheetFile.importXlsx(await FileBlob.load(xlsxPath));
const inspection = await imported.inspect({
  kind: "sheet,table",
  sheetId: "업로드용",
  range: "A1:O4",
  tableMaxRows: 4,
  tableMaxCols: 15,
  maxChars: 4000,
});
await fs.writeFile(path.join(outputDir, "xlsx_verification.txt"), inspection.ndjson, "utf8");

const preview = await imported.render({ sheetName: "업로드용", range: "A1:O12", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "upload_preview.png"), new Uint8Array(await preview.arrayBuffer()));
