// Build interview presentation — verbose, explanatory version with visual diagrams
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Andrew";
pres.title = "Chiller Load Forecast Platform";

// ── Color palette (HVAC / cool energy) ─────────────────────
const C = {
  navy:   "0B2D4D",
  cyan:   "00A6BE",
  mint:   "7CD8C5",
  amber:  "F4A261",
  red:    "E76F51",
  bgDark: "081E36",
  bg:     "F8FAFC",
  card:   "FFFFFF",
  border: "E2E8F0",
  text:   "1E293B",
  muted:  "64748B",
  white:  "FFFFFF",
};

const F = { head: "Calibri", body: "Calibri" };

const shadow = () => ({ type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.12 });

// Reusable header for content slides
function addHeader(slide, titleCh, titleEn, sub) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy }, line: { type: "none" } });
  slide.addText(`${titleCh} ${titleEn}`, { x: 0.5, y: 0.18, w: 9, h: 0.5, fontSize: 24, fontFace: F.head, bold: true, color: C.white, margin: 0 });
  slide.addText(sub, { x: 0.5, y: 0.55, w: 9, h: 0.3, fontSize: 12, fontFace: F.body, color: C.mint, margin: 0 });
}

// =========================================================
// Slide 1 — Cover
// =========================================================
let s = pres.addSlide();
s.background = { color: C.bgDark };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.cyan }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 9.6, y: 0, w: 0.4, h: 0.4, fill: { color: C.mint }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 9.0, y: 5.225, w: 1.0, h: 0.4, fill: { color: C.cyan }, line: { type: "none" } });

s.addText("ML Engineer Interview · 2026", { x: 0.7, y: 0.55, w: 9, h: 0.4, fontSize: 13, fontFace: F.body, color: C.mint, charSpacing: 4, bold: true, margin: 0 });
s.addText("冰水機負載預測平台", { x: 0.7, y: 1.15, w: 9, h: 0.8, fontSize: 40, fontFace: F.head, color: C.white, bold: true, margin: 0 });
s.addText("Chiller Load Forecast Platform", { x: 0.7, y: 1.95, w: 9, h: 0.55, fontSize: 24, fontFace: F.head, color: "B8E0D2", bold: true, margin: 0 });
s.addText("用機器學習預測冰水機未來 6 小時的冷負載，幫助節能、優化排程、降低營運成本。", { x: 0.7, y: 2.7, w: 9, h: 0.5, fontSize: 14, fontFace: F.body, color: "CADCFC", margin: 0 });
s.addText("從「每個案場一套客製系統」→ 升級成「一個平台服務所有案場」", { x: 0.7, y: 3.2, w: 9, h: 0.5, fontSize: 16, fontFace: F.body, color: C.mint, italic: true, margin: 0 });

// Tags
const tags = ["PyTorch", "LightGBM", "FastAPI", "PostgreSQL", "Docker", "MLflow"];
const tagW = 1.35, tagGap = 0.15;
const tagsTotal = tags.length * tagW + (tags.length - 1) * tagGap;
let tagX = (10 - tagsTotal) / 2;
tags.forEach((t) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tagX, y: 4.45, w: tagW, h: 0.4, fill: { color: C.navy }, line: { color: C.cyan, width: 0.75 }, rectRadius: 0.05 });
  s.addText(t, { x: tagX, y: 4.45, w: tagW, h: 0.4, fontSize: 11, fontFace: F.body, color: C.white, align: "center", valign: "middle", margin: 0 });
  tagX += tagW + tagGap;
});

s.addText("Andrew  ·  worldpeaceandrew@gmail.com", { x: 0.7, y: 5.1, w: 9, h: 0.35, fontSize: 11, fontFace: F.body, color: "CADCFC", margin: 0 });

// =========================================================
// Slide 2 — What is chiller load? (Foundational explainer)
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "先講清楚：什麼是「冰水機負載預測」？", "", "用最簡單的方式解釋這個專案要解決的問題");

// LEFT: Simple diagram showing building cooling cycle
// Sun (heat source)
s.addShape(pres.shapes.OVAL, { x: 0.5, y: 1.5, w: 0.8, h: 0.8, fill: { color: C.amber }, line: { type: "none" } });
s.addText("☼", { x: 0.5, y: 1.5, w: 0.8, h: 0.8, fontSize: 36, fontFace: F.head, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
s.addText("外氣溫度", { x: 0.5, y: 2.35, w: 0.8, h: 0.3, fontSize: 10, fontFace: F.body, color: C.muted, align: "center", margin: 0 });

// Arrow 1: sun → building
s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: 1.45, y: 1.8, w: 0.25, h: 0.2, fill: { color: C.red }, line: { type: "none" }, rotate: 90 });
s.addText("熱進入", { x: 1.45, y: 1.4, w: 0.6, h: 0.3, fontSize: 9, fontFace: F.body, color: C.red, align: "center", margin: 0 });

// Building
s.addShape(pres.shapes.RECTANGLE, { x: 1.85, y: 1.3, w: 1.6, h: 1.2, fill: { color: C.navy }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 2.0, y: 1.45, w: 0.3, h: 0.3, fill: { color: C.amber }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 2.4, y: 1.45, w: 0.3, h: 0.3, fill: { color: C.amber }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 2.8, y: 1.45, w: 0.3, h: 0.3, fill: { color: C.amber }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 2.0, y: 1.85, w: 0.3, h: 0.3, fill: { color: C.amber }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 2.4, y: 1.85, w: 0.3, h: 0.3, fill: { color: C.amber }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 2.8, y: 1.85, w: 0.3, h: 0.3, fill: { color: C.amber }, line: { type: "none" } });
s.addText("建築物", { x: 1.85, y: 2.55, w: 1.6, h: 0.3, fontSize: 11, fontFace: F.body, color: C.text, align: "center", bold: true, margin: 0 });

// Arrow 2: building → chiller
s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: 3.6, y: 1.8, w: 0.25, h: 0.2, fill: { color: C.red }, line: { type: "none" }, rotate: 90 });
s.addText("熱排出", { x: 3.6, y: 1.4, w: 0.6, h: 0.3, fontSize: 9, fontFace: F.body, color: C.red, align: "center", margin: 0 });

// Chiller
s.addShape(pres.shapes.RECTANGLE, { x: 4.0, y: 1.3, w: 1.5, h: 1.2, fill: { color: C.cyan }, line: { type: "none" } });
s.addText("冰水機\nChiller", { x: 4.0, y: 1.3, w: 1.5, h: 1.2, fontSize: 13, fontFace: F.head, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
s.addText("製造冷水送回建築降溫", { x: 4.0, y: 2.55, w: 1.5, h: 0.3, fontSize: 9, fontFace: F.body, color: C.muted, align: "center", margin: 0 });

// Bottom note
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.0, w: 5.0, h: 0.9, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.0, w: 0.08, h: 0.9, fill: { color: C.amber }, line: { type: "none" } });
s.addText("冷負載 (Cooling Load)", { x: 0.7, y: 3.05, w: 4.7, h: 0.3, fontSize: 13, fontFace: F.head, bold: true, color: C.text, margin: 0 });
s.addText("= 建築物每小時需要被「移除」的熱量\n= 冰水機這小時要做多少工", { x: 0.7, y: 3.35, w: 4.7, h: 0.55, fontSize: 11, fontFace: F.body, color: C.muted, margin: 0 });

// RIGHT: The key insight
s.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 1.3, w: 3.7, h: 4.0, fill: { color: C.navy }, line: { type: "none" }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 5.8, y: 1.3, w: 3.7, h: 0.08, fill: { color: C.mint }, line: { type: "none" } });
s.addText("為什麼要預測？", { x: 6.0, y: 1.45, w: 3.3, h: 0.4, fontSize: 18, fontFace: F.head, bold: true, color: C.white, margin: 0 });

s.addText("40-60%", { x: 6.0, y: 1.95, w: 3.3, h: 0.7, fontSize: 42, fontFace: F.head, bold: true, color: C.mint, margin: 0 });
s.addText("商業建築總用電的比例就是冰水機", { x: 6.0, y: 2.65, w: 3.3, h: 0.4, fontSize: 11, fontFace: F.body, color: "B8E0D2", margin: 0 });

s.addText("如果能預測 6 小時後負載 →", { x: 6.0, y: 3.2, w: 3.3, h: 0.3, fontSize: 12, fontFace: F.head, bold: true, color: C.white, margin: 0 });

const benefits = [
  "提前啟動或關停冰水機",
  "減少不必要的空轉浪費",
  "選擇電費較低的時段運行",
];
benefits.forEach((b, i) => {
  s.addShape(pres.shapes.OVAL, { x: 6.0, y: 3.6 + i * 0.35 + 0.07, w: 0.15, h: 0.15, fill: { color: C.mint }, line: { type: "none" } });
  s.addText(b, { x: 6.25, y: 3.6 + i * 0.35, w: 3.1, h: 0.3, fontSize: 11.5, fontFace: F.body, color: C.white, margin: 0 });
});

s.addText("→ 節能 10-30%、降電費、延長設備壽命", { x: 6.0, y: 4.85, w: 3.3, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.mint, margin: 0 });

// =========================================================
// Slide 3 — The Challenge (expanded)
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "商業挑戰", "The Challenge", "為什麼愛淨節能科技正在從「客製化」轉型成「平台化」");

s.addText("過去：每個案場一套客製系統。新案場上線要 3-6 個月、改一個 Bug 要重複修 N 次。", {
  x: 0.5, y: 1.05, w: 9, h: 0.35, fontSize: 13, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const problems = [
  {
    num: "01", title: "客製化包袱", icon: "⚙",
    body: "每個案場硬體不同、Bug 不同、需求不同。維運人力成本指數成長，新案場上線速度跟不上業務擴張。",
    impact: "新案場上線時間：3-6 個月",
  },
  {
    num: "02", title: "節能機會龐大", icon: "$",
    body: "冰水機佔商業建築用電 40-60%。準確預測未來負載，可以最佳化排程，節能 10-30%。一棟商辦一年省下百萬電費並不誇張。",
    impact: "潛在節能：每年 10-30% 電費",
  },
  {
    num: "03", title: "現場資料很髒", icon: "✕",
    body: "感測器會壞、會漂移、會斷線。模型必須能容忍髒資料、自動偵測異常，並向利害關係人說清楚「為什麼這樣預測」。",
    impact: "資料異常比例：~12.5%",
  },
];
problems.forEach((p, i) => {
  const x = 0.5 + i * 3.1;
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.9, h: 3.7, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.9, h: 0.08, fill: { color: C.cyan }, line: { type: "none" } });

  // Number badge
  s.addText(p.num, { x: x + 0.2, y: 1.65, w: 2, h: 0.5, fontSize: 28, fontFace: F.head, bold: true, color: C.cyan, margin: 0 });
  s.addText(p.title, { x: x + 0.2, y: 2.2, w: 2.5, h: 0.4, fontSize: 17, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(p.body, { x: x + 0.2, y: 2.65, w: 2.5, h: 1.8, fontSize: 11, fontFace: F.body, color: C.muted, margin: 0, valign: "top" });

  // Impact box at bottom
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: 4.65, w: 2.5, h: 0.45, fill: { color: C.bgDark }, line: { type: "none" } });
  s.addText(p.impact, { x: x + 0.2, y: 4.65, w: 2.5, h: 0.45, fontSize: 10, fontFace: F.body, color: C.mint, align: "center", valign: "middle", bold: true, margin: 0 });
});

s.addText("這個專案的目標：用平台化思維解決上述三個痛點。", {
  x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 13, fontFace: F.body, color: C.text, italic: true, align: "center", bold: true, margin: 0,
});

// =========================================================
// Slide 4 — Solution Overview / Architecture
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "解決方案", "Solution Architecture", "完整端到端 pipeline：從原始資料到使用者介面");

s.addText("資料如何在系統中流動？由左至右閱讀。", {
  x: 0.5, y: 1.0, w: 9, h: 0.3, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const stages = [
  { title: "1. 資料來源", subtitle: "Raw Data", body: "ASHRAE 公開資料集 · 1,448 棟建築 · 2 年逐時感測", color: C.navy },
  { title: "2. 資料清洗 & 特徵", subtitle: "ETL + FE", body: "缺值補值 · 異常偵測 · 46 個特徵工程", color: C.cyan },
  { title: "3. 機器學習", subtitle: "ML Models", body: "LightGBM 基線 + LSTM · MLflow 實驗追蹤", color: C.amber },
  { title: "4. 後端 API", subtitle: "FastAPI", body: "REST endpoints · OpenAPI 文件 · PostgreSQL", color: C.cyan },
  { title: "5. 視覺化", subtitle: "Dashboard", body: "Streamlit 儀表板 · 4 個分頁 · Plotly 圖表", color: C.navy },
];
const boxW = 1.65, boxH = 1.7, gap = 0.2;
const startX = (10 - (boxW * 5 + gap * 4)) / 2;
stages.forEach((stg, i) => {
  const x = startX + i * (boxW + gap);
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: boxW, h: boxH, fill: { color: stg.color }, line: { type: "none" }, shadow: shadow() });
  s.addText(stg.title, { x, y: 1.7, w: boxW, h: 0.4, fontSize: 12, fontFace: F.head, bold: true, color: C.white, align: "center", margin: 0 });
  s.addText(stg.subtitle, { x, y: 2.05, w: boxW, h: 0.3, fontSize: 10, fontFace: F.body, italic: true, color: C.mint, align: "center", margin: 0 });
  s.addText(stg.body, { x: x + 0.1, y: 2.4, w: boxW - 0.2, h: 0.85, fontSize: 9.5, fontFace: F.body, color: C.white, align: "center", margin: 0 });

  if (i < 4) {
    s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: x + boxW + 0.01, y: 2.35, w: 0.18, h: 0.2, fill: { color: C.muted }, line: { type: "none" }, rotate: 90 });
  }
});

// DB layer
s.addShape(pres.shapes.RECTANGLE, { x: 2.8, y: 3.7, w: 4.4, h: 0.65, fill: { color: C.bgDark }, line: { type: "none" }, shadow: shadow() });
s.addText("PostgreSQL", { x: 2.9, y: 3.78, w: 1.2, h: 0.5, fontSize: 13, fontFace: F.head, bold: true, color: C.mint, valign: "middle", margin: 0 });
s.addText("buildings · meter_readings · predictions · model_metadata", { x: 4.1, y: 3.78, w: 3.0, h: 0.5, fontSize: 9.5, fontFace: F.body, color: "B8E0D2", valign: "middle", margin: 0 });
s.addShape(pres.shapes.LINE, { x: 5.0, y: 3.3, w: 0, h: 0.4, line: { color: C.muted, width: 1.5, dashType: "dash" } });

// Key concept callouts at bottom
const callouts = [
  { title: "Docker Compose", body: "一行指令啟動所有服務" },
  { title: "MLflow 實驗追蹤", body: "每次訓練都有紀錄、可比較" },
  { title: "多案場架構", body: "site_id 切分，新案場零程式碼上線" },
];
callouts.forEach((c, i) => {
  const x = 0.5 + i * 3.15;
  s.addShape(pres.shapes.RECTANGLE, { x, y: 4.65, w: 2.95, h: 0.85, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x, y: 4.65, w: 0.08, h: 0.85, fill: { color: C.cyan }, line: { type: "none" } });
  s.addText(c.title, { x: x + 0.2, y: 4.7, w: 2.7, h: 0.35, fontSize: 12, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(c.body, { x: x + 0.2, y: 5.0, w: 2.7, h: 0.45, fontSize: 10.5, fontFace: F.body, color: C.muted, margin: 0 });
});

// =========================================================
// Slide 5 — Tech Stack
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "技術選型", "Tech Stack", "每個選擇都呼應職缺需求 — 不是「會什麼用什麼」");

const techs = [
  { cat: "機器學習 / 深度學習", items: "PyTorch · LightGBM · scikit-learn", note: "Tree-based 模型做基線，LSTM 處理時序，符合「至少一種 DL 框架」要求" },
  { cat: "資料處理", items: "Pandas · NumPy · SciPy", note: "時序資料清洗、缺值補值、異常偵測，正是職缺寫明的需求" },
  { cat: "後端 API", items: "FastAPI · Pydantic · SQLAlchemy", note: "職缺指定 FastAPI；Pydantic schema 是「API contract」的核心" },
  { cat: "資料庫", items: "PostgreSQL 16", note: "職缺指定 PostgreSQL；ORM 抽象讓本地測試可換 SQLite" },
  { cat: "視覺化", items: "Streamlit · Plotly", note: "BI 背景的天然強項，符合「儀表板開發或維運經驗」" },
  { cat: "部署 & MLOps", items: "Docker Compose · MLflow", note: "加分項：容器化部署 + 模型版本管理" },
];
techs.forEach((t, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.5 + col * 3.15;
  const y = 1.15 + row * 2.05;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 1.9, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 0.08, fill: { color: C.cyan }, line: { type: "none" } });
  s.addText(t.cat, { x: x + 0.2, y: y + 0.15, w: 2.7, h: 0.35, fontSize: 14, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
  s.addText(t.items, { x: x + 0.2, y: y + 0.55, w: 2.7, h: 0.4, fontSize: 11.5, fontFace: F.body, color: C.text, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: y + 1.0, w: 2.55, h: 0.02, fill: { color: C.border }, line: { type: "none" } });
  s.addText(t.note, { x: x + 0.2, y: y + 1.05, w: 2.55, h: 0.8, fontSize: 9.5, fontFace: F.body, italic: true, color: C.muted, margin: 0, valign: "top" });
});

// =========================================================
// Slide 6 — Data Understanding (with source story)
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "資料來源", "Data Source", "資料從哪裡來？為什麼選這份？");

s.addText("使用 Kaggle 公開的 ASHRAE Great Energy Predictor III — 全球最具公信力的建築能耗預測競賽資料集。", {
  x: 0.5, y: 1.05, w: 9, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

// Stats on the left (2x2 grid)
const stats = [
  { val: "4.2M",  lbl: "逐時資料筆數",     sub: "從 2016 全年" },
  { val: "498",   lbl: "棟建築 (冰水)",   sub: "篩選 meter=1" },
  { val: "10",    lbl: "個獨立案場",       sub: "site_id 分組" },
  { val: "12.5%", lbl: "平均異常率",       sub: "感測器問題" },
];
stats.forEach((st, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.5 + col * 2.4;
  const y = 1.55 + row * 1.55;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.2, h: 1.4, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addText(st.val, { x, y: y + 0.1, w: 2.2, h: 0.7, fontSize: 30, fontFace: F.head, bold: true, color: C.cyan, align: "center", margin: 0 });
  s.addText(st.lbl, { x, y: y + 0.8, w: 2.2, h: 0.3, fontSize: 11.5, fontFace: F.body, bold: true, color: C.text, align: "center", margin: 0 });
  s.addText(st.sub, { x, y: y + 1.07, w: 2.2, h: 0.28, fontSize: 9.5, fontFace: F.body, italic: true, color: C.muted, align: "center", margin: 0 });
});

// Right column: what each row contains
s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.55, w: 4.0, h: 3.5, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.55, w: 4.0, h: 0.08, fill: { color: C.amber }, line: { type: "none" } });
s.addText("每筆資料長什麼樣？", { x: 5.7, y: 1.7, w: 3.7, h: 0.4, fontSize: 15, fontFace: F.head, bold: true, color: C.text, margin: 0 });
s.addText("感測器每小時上傳一次冰水機讀數，配合當下氣象條件和建築屬性：", {
  x: 5.7, y: 2.1, w: 3.7, h: 0.55, fontSize: 10.5, fontFace: F.body, color: C.muted, margin: 0,
});

const fields = [
  { col: "meter_reading", desc: "冷負載讀數 (目標變數，kWh)" },
  { col: "air_temperature", desc: "外氣溫度 (°C)" },
  { col: "dew_temperature", desc: "露點溫度 → 推算濕度" },
  { col: "wind_speed", desc: "風速 → 建築熱損失" },
  { col: "square_feet", desc: "建築面積 → 規模代理變數" },
  { col: "primary_use", desc: "建築用途 (辦公/教育/醫療)" },
];
fields.forEach((f, i) => {
  const y = 2.75 + i * 0.38;
  s.addShape(pres.shapes.OVAL, { x: 5.75, y: y + 0.08, w: 0.12, h: 0.12, fill: { color: C.amber }, line: { type: "none" } });
  s.addText(f.col, { x: 5.95, y, w: 1.5, h: 0.3, fontSize: 10.5, fontFace: "Consolas", color: C.navy, bold: true, margin: 0 });
  s.addText(f.desc, { x: 7.45, y, w: 1.95, h: 0.3, fontSize: 10, fontFace: F.body, color: C.muted, margin: 0 });
});

s.addText("資料完整、有公信力，但有 12.5% 缺值/異常需要處理 → 下一頁。", {
  x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 12, fontFace: F.body, color: C.text, italic: true, align: "center", margin: 0,
});

// =========================================================
// Slide 7 (NEW) — Scenarios covered by the data
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "資料涵蓋的情境", "Data Diversity & Scenarios", "為什麼用這份資料訓練的模型，能應用到台灣案場？");

s.addText("ASHRAE 資料涵蓋多種建築型態、不同氣候區、整年週期變化 — 這份多樣性讓模型學到的是「通用的冷負載規律」，不會過度擬合到單一場景。", {
  x: 0.5, y: 1.05, w: 9, h: 0.55, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const scenarios = [
  {
    title: "建築用途多樣",
    bigStat: "16 類",
    subStat: "primary_use",
    body: "辦公樓 / 教育 / 醫療 / 飯店 / 公共設施 / 娛樂場館 — 每種建築的負載 pattern 都不同，模型必須學會跨類別泛化。",
    color: C.cyan,
  },
  {
    title: "氣候區涵蓋廣",
    bigStat: "16 sites",
    subStat: "across climate zones",
    body: "從冷帶到熱帶、乾燥到潮濕都有 — 訓練出的模型對極端天氣、季節轉換都有抗性。",
    color: C.amber,
  },
  {
    title: "完整年週期",
    bigStat: "2 年",
    subStat: "逐時連續資料",
    body: "包含完整 24 個月 — 春夏秋冬、工作日週末、節日、長假都涵蓋，能捕捉到所有時序 pattern。",
    color: C.cyan,
  },
  {
    title: "建築規模差異大",
    bigStat: "100x",
    subStat: "square_feet range",
    body: "小型診所到大型購物中心都在資料裡 — 模型學到「規模 × 用途」的交互效應。",
    color: C.amber,
  },
];

scenarios.forEach((sc, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.5 + col * 4.7;
  const y = 1.75 + row * 1.85;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.5, h: 1.65, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h: 1.65, fill: { color: sc.color }, line: { type: "none" } });
  s.addText(sc.title, { x: x + 0.25, y: y + 0.15, w: 2.0, h: 0.35, fontSize: 14, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  // Big stat on the right
  s.addText(sc.bigStat, { x: x + 2.5, y: y + 0.1, w: 1.85, h: 0.55, fontSize: 26, fontFace: F.head, bold: true, color: sc.color, align: "right", margin: 0 });
  s.addText(sc.subStat, { x: x + 2.5, y: y + 0.6, w: 1.85, h: 0.25, fontSize: 9, fontFace: F.body, italic: true, color: C.muted, align: "right", margin: 0 });
  // Body
  s.addText(sc.body, { x: x + 0.25, y: y + 0.8, w: 4.1, h: 0.8, fontSize: 10.5, fontFace: F.body, color: C.muted, margin: 0, valign: "top" });
});

s.addText("應用到台灣：愛淨的客戶建築規模、用途也很多元 — 這份資料的多樣性正好對應實際業務情境。", {
  x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 11.5, fontFace: F.body, italic: true, bold: true, color: C.text, align: "center", margin: 0,
});

// =========================================================
// Slide 8 — Cleaning Pipeline
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "資料清洗", "Cleaning Pipeline", "髒資料是現場常態 — 模型訓練前必須先處理");

s.addText("為什麼資料會髒？感測器斷線、定期保養停機、設定漂移、瞬間電壓問題。如果直接丟給模型，預測會被異常值污染。", {
  x: 0.5, y: 1.05, w: 9, h: 0.45, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const cleanSteps = [
  { n: "1", title: "氣象資料補值", icon: "○", body: "氣象站偶爾斷訊 → 先 forward-fill (用上一筆)，再 linear interpolation (兩端內插)。處理後完全沒有缺值。" },
  { n: "2", title: "IQR 異常偵測", icon: "△", body: "用 3×IQR 法則，逐建築獨立計算閾值。為什麼逐建築？因為一棟學校和一棟醫院的「正常範圍」完全不同。" },
  { n: "3", title: "長零值偵測", icon: "□", body: "標記連續 ≥48 小時為零的讀數 → 通常是感測器壞掉，不是真的沒在用冷氣。這個邏輯來自 HVAC 領域知識。" },
  { n: "4", title: "時序內插補目標值", icon: "◇", body: "標記為異常的讀數設為 NaN，再用時序 interpolation 填回去。讓 lag 特徵 (lag_24h) 不會被異常擴散污染。" },
];
cleanSteps.forEach((st, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.5 + col * 4.7;
  const y = 1.65 + row * 1.85;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.5, h: 1.65, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fill: { color: C.cyan }, line: { type: "none" } });
  s.addText(st.n, { x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fontSize: 22, fontFace: F.head, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  s.addText(st.title, { x: x + 1.0, y: y + 0.2, w: 3.4, h: 0.4, fontSize: 15, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(st.body, { x: x + 1.0, y: y + 0.65, w: 3.4, h: 0.95, fontSize: 10.5, fontFace: F.body, color: C.muted, margin: 0, valign: "top" });
});

s.addText("產出：data_quality_report() 函式可生成各建築缺值/異常率報表，能向客戶交代資料品質。", {
  x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 11.5, fontFace: F.body, italic: true, color: C.text, align: "center", margin: 0,
});

// =========================================================
// Slide 8 — Feature Engineering (with concrete example)
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "特徵工程", "Feature Engineering", "從原始資料萃取 46 個有預測力的訊號 — 每個都能說出物理意義");

s.addText("我不只「想」這些特徵能用，每個都能解釋為什麼它跟冷負載有關。下面舉一個例子：", {
  x: 0.5, y: 1.0, w: 9, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

// LEFT: All feature groups
const featGroups = [
  { title: "時間特徵 (10)",       items: "hour, day_of_week, month, is_business_hour, is_weekend, sin/cos cyclic encoding" },
  { title: "氣象特徵 (4)",       items: "air_temp, dew_temp, cooling_degree_hours, temp × humidity" },
  { title: "滯後特徵 Lag (4)",    items: "lag_1h, lag_6h, lag_24h, lag_168h (上週同時段)" },
  { title: "滾動統計 (6)",       items: "rolling mean/std/max 在 6h 和 24h 視窗" },
  { title: "建築特徵 (22)",      items: "log_square_feet, age, primary_use one-hot encoded" },
];
featGroups.forEach((g, i) => {
  const y = 1.5 + i * 0.62;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 4.5, h: 0.55, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.08, h: 0.55, fill: { color: C.cyan }, line: { type: "none" } });
  s.addText(g.title, { x: 0.7, y: y + 0.04, w: 1.7, h: 0.25, fontSize: 11, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(g.items, { x: 0.7, y: y + 0.28, w: 4.15, h: 0.25, fontSize: 9, fontFace: F.body, color: C.muted, margin: 0 });
});

// RIGHT: Concrete example — cooling_degree_hours
s.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.5, w: 4.2, h: 3.65, fill: { color: C.bgDark }, line: { type: "none" }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.5, w: 4.2, h: 0.08, fill: { color: C.amber }, line: { type: "none" } });
s.addText("舉例：cooling_degree_hours", { x: 5.5, y: 1.65, w: 3.9, h: 0.4, fontSize: 14, fontFace: F.head, bold: true, color: C.mint, margin: 0 });
s.addText("最重要的氣象衍生特徵", { x: 5.5, y: 2.05, w: 3.9, h: 0.3, fontSize: 10, fontFace: F.body, italic: true, color: "B8E0D2", margin: 0 });

s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 2.45, w: 3.8, h: 0.5, fill: { color: C.navy }, line: { type: "none" } });
s.addText("公式：max(0, 外氣溫度 − 18°C)", { x: 5.5, y: 2.45, w: 3.8, h: 0.5, fontSize: 12, fontFace: "Consolas", color: C.mint, align: "center", valign: "middle", margin: 0 });

s.addText("為什麼這樣設計？", { x: 5.5, y: 3.05, w: 3.9, h: 0.3, fontSize: 11.5, fontFace: F.head, bold: true, color: C.white, margin: 0 });
const reasons = [
  "外溫低於 18°C 時建築幾乎不需要降溫",
  "高於 18°C 時，每升 1°C 冷負載就上升",
  "用 max(0, ...) 切掉「不必要冷卻」的雜訊",
  "比直接用 air_temperature 預測力強很多",
];
reasons.forEach((r, i) => {
  const y = 3.4 + i * 0.4;
  s.addText("·", { x: 5.5, y, w: 0.2, h: 0.3, fontSize: 16, fontFace: F.head, bold: true, color: C.mint, margin: 0 });
  s.addText(r, { x: 5.7, y, w: 3.7, h: 0.35, fontSize: 11, fontFace: F.body, color: "CADCFC", margin: 0 });
});

s.addText("這就是「能說清楚特徵與目標因果假設」的具體展現。", {
  x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 11.5, fontFace: F.body, italic: true, color: C.text, align: "center", margin: 0,
});

// =========================================================
// Slide 9 — Multi-step forecasting visual
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "什麼是「多步時序預測」？", "Multi-step Forecasting", "用過去資料一次預測未來多個時間點 — 不是只預測下一秒");

s.addText("為什麼要一次預測 6 小時？因為冰水機排程需要提前規劃 — 知道下午會熱，現在就要開始準備。", {
  x: 0.5, y: 1.05, w: 9, h: 0.4, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

// Timeline visualization
const tlY = 3.1;  // axis line at y = 3.1 (bars grow UP from here)
const tlStartX = 1.0, tlEndX = 9.0, tlMidX = 5.5;

// Region labels ABOVE the bars
s.addShape(pres.shapes.RECTANGLE, { x: tlStartX, y: 1.55, w: tlMidX - tlStartX, h: 0.35, fill: { color: C.navy }, line: { type: "none" } });
s.addText("輸入：過去 48 小時感測資料", { x: tlStartX, y: 1.55, w: tlMidX - tlStartX, h: 0.35, fontSize: 11, fontFace: F.body, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

s.addShape(pres.shapes.RECTANGLE, { x: tlMidX, y: 1.55, w: tlEndX - tlMidX, h: 0.35, fill: { color: C.cyan }, line: { type: "none" } });
s.addText("輸出：未來 6 小時負載預測", { x: tlMidX, y: 1.55, w: tlEndX - tlMidX, h: 0.35, fontSize: 11, fontFace: F.body, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

// Axis line
s.addShape(pres.shapes.LINE, { x: tlStartX, y: tlY, w: tlEndX - tlStartX, h: 0, line: { color: C.muted, width: 1.5 } });

// "Now" vertical marker
s.addShape(pres.shapes.LINE, { x: tlMidX, y: 2.0, w: 0, h: 1.2, line: { color: C.red, width: 2, dashType: "dash" } });
s.addText("現在", { x: tlMidX - 0.5, y: 2.0, w: 1.0, h: 0.3, fontSize: 11, fontFace: F.head, bold: true, color: C.red, align: "center", margin: 0 });

// Past data points as bars (no diagonal lines — avoid negative-height issue)
const pastPoints = [1.4, 1.9, 2.4, 2.9, 3.4, 3.9, 4.4, 4.9];
const pastHeights = [0.45, 0.35, 0.4, 0.5, 0.6, 0.7, 0.65, 0.7];
pastPoints.forEach((px, i) => {
  s.addShape(pres.shapes.RECTANGLE, { x: px - 0.08, y: tlY - pastHeights[i], w: 0.16, h: pastHeights[i], fill: { color: C.navy }, line: { type: "none" } });
});

// Future predictions as outlined bars
const futurePoints = [5.9, 6.4, 6.9, 7.4, 7.9, 8.4];
const futureHeights = [0.75, 0.85, 0.9, 0.85, 0.75, 0.6];
futurePoints.forEach((px, i) => {
  s.addShape(pres.shapes.RECTANGLE, { x: px - 0.08, y: tlY - futureHeights[i], w: 0.16, h: futureHeights[i], fill: { color: C.cyan, transparency: 60 }, line: { color: C.cyan, width: 1.5 } });
});

// Labels
s.addText("負載 (kWh)", { x: tlStartX - 0.85, y: 2.4, w: 0.8, h: 0.3, fontSize: 9, fontFace: F.body, italic: true, color: C.muted, align: "right", margin: 0 });
s.addText("-48h", { x: tlStartX - 0.25, y: tlY + 0.05, w: 0.5, h: 0.25, fontSize: 9.5, fontFace: F.body, color: C.muted, align: "center", margin: 0 });
s.addText("現在", { x: tlMidX - 0.25, y: tlY + 0.05, w: 0.5, h: 0.25, fontSize: 10, fontFace: F.body, bold: true, color: C.red, align: "center", margin: 0 });
s.addText("+6h", { x: tlEndX - 0.25, y: tlY + 0.05, w: 0.5, h: 0.25, fontSize: 9.5, fontFace: F.body, color: C.muted, align: "center", margin: 0 });
s.addText("時間 →", { x: tlEndX + 0.05, y: tlY + 0.05, w: 0.8, h: 0.25, fontSize: 9.5, fontFace: F.body, italic: true, color: C.muted, margin: 0 });

// Bottom: two callouts
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.2, w: 4.45, h: 1.15, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.2, w: 0.08, h: 1.15, fill: { color: C.cyan }, line: { type: "none" } });
s.addText("挑戰：Walk-forward Validation", { x: 0.7, y: 4.25, w: 4.2, h: 0.35, fontSize: 13, fontFace: F.head, bold: true, color: C.text, margin: 0 });
s.addText("時序資料絕對不能用一般的 k-fold cross-validation — 因為這樣會「用未來資料訓練去預測過去」，等於作弊。要用 walk-forward：時間先後嚴格保留。", {
  x: 0.7, y: 4.6, w: 4.2, h: 0.75, fontSize: 10, fontFace: F.body, color: C.muted, margin: 0,
});

s.addShape(pres.shapes.RECTANGLE, { x: 5.05, y: 4.2, w: 4.45, h: 1.15, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 5.05, y: 4.2, w: 0.08, h: 1.15, fill: { color: C.amber }, line: { type: "none" } });
s.addText("離線/線上一致性", { x: 5.25, y: 4.25, w: 4.15, h: 0.35, fontSize: 13, fontFace: F.head, bold: true, color: C.text, margin: 0 });
s.addText("離線訓練的評估方式必須跟線上實際運作一致 — 不然模型在實驗室很厲害，上線就崩。walk-forward 就是在模擬「每天都在預測明天」的場景。", {
  x: 5.25, y: 4.6, w: 4.15, h: 0.75, fontSize: 10, fontFace: F.body, color: C.muted, margin: 0,
});

// =========================================================
// Slide 10 — LightGBM vs LSTM
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "為什麼挑這兩個演算法？", "LightGBM vs LSTM", "他們代表時序預測兩種主流哲學 — 我要證明兩個都掌握，並能用實驗判斷哪個適合");

// Rationale box (why these two)
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.0, w: 9, h: 0.45, fill: { color: C.bgDark }, line: { type: "none" } });
s.addText("業界共識：時序預測領域有兩大流派 — Tree-based (代表：LightGBM) 與 Sequence-based (代表：LSTM)。我同時實作，用同份資料、同個驗證流程公平比較。", {
  x: 0.7, y: 1.0, w: 8.6, h: 0.45, fontSize: 11, fontFace: F.body, color: C.white, italic: true, valign: "middle", margin: 0,
});

const models = [
  { title: "LightGBM", subtitle: "梯度提升樹 · Gradient Boosting", color: C.cyan,
    body: "把 6 個未來時段，訓練 6 個獨立的樹模型。每個模型負責預測一個時間步。",
    pros: ["Tabular 特徵的標竿模型", "原生處理 NaN，不怕髒資料", "ASHRAE Kaggle 競賽冠軍方案"],
    speed: "訓練速度：~30 秒 / fold (CPU)",
  },
  { title: "PyTorch LSTM", subtitle: "長短期記憶神經網路", color: C.amber,
    body: "把過去 48 小時當成一個序列丟進 LSTM，一次輸出未來 6 小時的預測。",
    pros: ["能學長期時序依賴模式", "可以隨資料增加而變強", "符合「深度學習落地」要求"],
    speed: "訓練速度：~3-5 分鐘 / fold (CPU)",
  },
];
models.forEach((m, i) => {
  const x = 0.5 + i * 4.7;
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 4.5, h: 3.55, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 4.5, h: 0.1, fill: { color: m.color }, line: { type: "none" } });
  s.addText(m.title, { x: x + 0.3, y: 1.75, w: 4, h: 0.5, fontSize: 22, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
  s.addText(m.subtitle, { x: x + 0.3, y: 2.2, w: 4, h: 0.3, fontSize: 11, fontFace: F.body, italic: true, color: C.muted, margin: 0 });

  s.addText(m.body, { x: x + 0.3, y: 2.55, w: 4, h: 0.65, fontSize: 11, fontFace: F.body, color: C.text, margin: 0 });

  s.addText("優勢：", { x: x + 0.3, y: 3.3, w: 4, h: 0.3, fontSize: 11.5, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
  m.pros.forEach((p, j) => {
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 3.65 + j * 0.32 + 0.07, w: 0.13, h: 0.13, fill: { color: m.color }, line: { type: "none" } });
    s.addText(p, { x: x + 0.55, y: 3.65 + j * 0.32, w: 3.8, h: 0.32, fontSize: 10.5, fontFace: F.body, color: C.text, margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: 4.75, w: 3.95, h: 0.35, fill: { color: C.bg }, line: { type: "none" } });
  s.addText(m.speed, { x: x + 0.4, y: 4.75, w: 3.85, h: 0.35, fontSize: 10, fontFace: F.body, italic: true, color: C.muted, valign: "middle", margin: 0 });
});

s.addText("結果在下一頁 — 但先思考：在這個資料規模下，哪個流派會贏？", {
  x: 0.5, y: 5.25, w: 9, h: 0.3, fontSize: 12, fontFace: F.body, italic: true, bold: true, color: C.text, align: "center", margin: 0,
});

// =========================================================
// Slide 11 — Results
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "實驗結果", "Results", "Building 171 · 8,616 筆資料 · 3-fold walk-forward CV");

s.addText("Avg RMSE 和 Avg MAE 越低越好 (代表平均預測誤差，單位 kWh)。LightGBM 大幅勝出。", {
  x: 0.5, y: 1.0, w: 9, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

s.addChart(pres.charts.BAR, [
  { name: "LightGBM", labels: ["Avg RMSE", "Avg MAE"], values: [40.02, 27.03] },
  { name: "LSTM",     labels: ["Avg RMSE", "Avg MAE"], values: [89.91, 73.30] },
], {
  x: 0.5, y: 1.45, w: 5.4, h: 3.3, barDir: "col",
  chartColors: [C.cyan, C.amber],
  chartArea: { fill: { color: "FFFFFF" }, roundedCorners: true },
  catAxisLabelColor: C.muted, valAxisLabelColor: C.muted,
  catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
  valGridLine: { color: "E2E8F0", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text, dataLabelFontSize: 11,
  showLegend: true, legendPos: "b", legendColor: C.muted, legendFontSize: 11,
  showTitle: true, title: "預測誤差 (kWh) — 越低越好", titleColor: C.text, titleFontSize: 12,
});

// Right side: interpretation
s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 1.45, w: 3.4, h: 3.3, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 6.1, y: 1.45, w: 3.4, h: 0.08, fill: { color: C.cyan }, line: { type: "none" } });
s.addText("我怎麼解讀這個結果", { x: 6.3, y: 1.6, w: 3.0, h: 0.35, fontSize: 14, fontFace: F.head, bold: true, color: C.text, margin: 0 });

const insights = [
  { t: "1. LightGBM 勝出符合預期", d: "Kaggle ASHRAE 競賽前幾名也都是 GBM" },
  { t: "2. LSTM 沒贏不是 LSTM 不好", d: "單一建築 8,616 筆對 LSTM 來說偏少" },
  { t: "3. Tabular 特徵充足時，GBM 通常贏", d: "這是業界一致的經驗法則" },
  { t: "4. 別只看 MAPE", d: "夜間負載接近零會讓 MAPE 失真，RMSE/MAE 才是真實表現" },
];
insights.forEach((ins, i) => {
  const y = 2.0 + i * 0.69;
  s.addText(ins.t, { x: 6.3, y, w: 3.0, h: 0.32, fontSize: 11, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(ins.d, { x: 6.3, y: y + 0.32, w: 3.0, h: 0.34, fontSize: 9.5, fontFace: F.body, italic: true, color: C.muted, margin: 0 });
});

s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.95, w: 9, h: 0.55, fill: { color: C.bgDark }, line: { type: "none" } });
s.addText("實務建議：LightGBM 跑 1-6h 短期排程；資料規模擴大到「跨建築 + 多月」時再回頭評估 LSTM。", {
  x: 0.7, y: 4.95, w: 8.6, h: 0.55, fontSize: 12, fontFace: F.body, color: C.white, italic: true, margin: 0, valign: "middle",
});

// =========================================================
// Slide 13 (NEW) — Business Value: Model-driven savings
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "商業價值試算", "Business Value · Taiwan", "用 LightGBM 跟 LSTM 的實際 RMSE，推算對比「沒有智慧控制」能省多少");

s.addText("方法：模型預測越準 → 控制策略越精準 → 節能越多。用 forecast skill score 把模型 RMSE 轉換成可實現的節能比例。", {
  x: 0.5, y: 1.0, w: 9, h: 0.45, fontSize: 11, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

// LEFT: Methodology panel
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.55, w: 3.0, h: 3.65, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.55, w: 3.0, h: 0.08, fill: { color: C.amber }, line: { type: "none" } });
s.addText("試算方法", { x: 0.7, y: 1.65, w: 2.7, h: 0.35, fontSize: 14, fontFace: F.head, bold: true, color: C.text, margin: 0 });

// Methodology steps
s.addText("① 基準電費", { x: 0.7, y: 2.05, w: 2.7, h: 0.3, fontSize: 11, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
s.addText("Building 171 全年逐時消耗 × 台電三段式時間電價 = NT$ 4,252,899", {
  x: 0.7, y: 2.32, w: 2.7, h: 0.55, fontSize: 9.5, fontFace: F.body, color: C.muted, margin: 0,
});

s.addText("② Forecast Skill Score", { x: 0.7, y: 2.95, w: 2.7, h: 0.3, fontSize: 11, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
s.addText("Skill = 1 − (模型RMSE / 基準RMSE)\nLightGBM: 1 − 40/137 = 71%\nLSTM: 1 − 90/137 = 35%", {
  x: 0.7, y: 3.22, w: 2.7, h: 0.85, fontSize: 9.5, fontFace: F.body, color: C.muted, margin: 0,
});

s.addText("③ 可實現節能", { x: 0.7, y: 4.15, w: 2.7, h: 0.3, fontSize: 11, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
s.addText("= Skill × 30% 理論上限\n(理論上限來自 ASHRAE/DOE 文獻)", {
  x: 0.7, y: 4.42, w: 2.7, h: 0.7, fontSize: 9.5, fontFace: F.body, color: C.muted, margin: 0,
});

// CENTER: Chart comparing 4 scenarios
s.addChart(pres.charts.BAR, [
  { name: "年電費 (NT$)", labels: ["無智慧控制\n(baseline)", "LSTM 控制\n10.3%", "LightGBM 控制\n21.3%", "完美預測\n30%"], values: [4252899, 3812836, 3349057, 2977029] },
], {
  x: 3.7, y: 1.55, w: 4.0, h: 3.65, barDir: "col",
  chartColors: ["8FA3BD", C.amber, C.cyan, C.mint],
  chartColorsOpacity: 100,
  chartArea: { fill: { color: "FFFFFF" }, roundedCorners: true },
  catAxisLabelColor: C.text, valAxisLabelColor: C.muted,
  catAxisLabelFontSize: 8.5, valAxisLabelFontSize: 9,
  valGridLine: { color: "E2E8F0", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.text, dataLabelFontSize: 9, dataLabelFormatCode: "#,##0",
  showLegend: false,
  showTitle: true, title: "年電費對比 (單棟 · NT$)", titleColor: C.text, titleFontSize: 11,
});

// RIGHT: Savings vs baseline column
s.addShape(pres.shapes.RECTANGLE, { x: 7.9, y: 1.55, w: 1.6, h: 3.65, fill: { color: C.bgDark }, line: { type: "none" }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 7.9, y: 1.55, w: 1.6, h: 0.08, fill: { color: C.mint }, line: { type: "none" } });
s.addText("vs 無控制", { x: 7.9, y: 1.65, w: 1.6, h: 0.3, fontSize: 11, fontFace: F.head, bold: true, color: C.mint, align: "center", margin: 0 });
s.addText("單棟年省", { x: 7.9, y: 1.92, w: 1.6, h: 0.25, fontSize: 9, fontFace: F.body, italic: true, color: "B8E0D2", align: "center", margin: 0 });

const sv = [
  { name: "LSTM",     amt: "44 萬",  color: C.amber },
  { name: "LightGBM", amt: "90 萬",  color: C.cyan, highlight: true },
  { name: "Perfect",  amt: "128 萬", color: C.mint },
];
sv.forEach((row, i) => {
  const y = 2.3 + i * 0.95;
  s.addText(row.name, { x: 7.9, y, w: 1.6, h: 0.3, fontSize: 11, fontFace: F.head, bold: true, color: "B8E0D2", align: "center", margin: 0 });
  s.addText(row.amt, { x: 7.9, y: y + 0.28, w: 1.6, h: 0.55, fontSize: row.highlight ? 26 : 20, fontFace: F.head, bold: true, color: row.color, align: "center", margin: 0 });
});

// Bottom takeaway
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 5.3, w: 9, h: 0.3, fill: { color: C.bgDark }, line: { type: "none" } });
s.addText("我的 LightGBM 模型對比無控制可省 NT$ 90 萬/年/棟。10 棟組合 = NT$ 900 萬/年。", {
  x: 0.7, y: 5.3, w: 8.6, h: 0.3, fontSize: 11.5, fontFace: F.body, bold: true, color: C.white, italic: true, valign: "middle", margin: 0,
});

// =========================================================
// Slide 14 (NEW) — How are the 10-30% savings achieved?
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "節能 10-30% 怎麼來的？", "How the Savings Are Achieved", "預測準了，可以透過三個具體機制省電 — 不是憑空喊出來的數字");

s.addText("「預測 → 控制 → 節能」的因果鏈：模型告訴你未來 6 小時的冷負載，控制系統就能做出原本做不到的最佳化決策。", {
  x: 0.5, y: 1.05, w: 9, h: 0.45, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const mechanisms = [
  {
    num: "1",
    title: "時段轉移",
    en: "Load Shifting / Pre-cooling",
    range: "5 – 15%",
    body: "預測明天下午會熱 → 今天凌晨先預冷建築（用冷水/冷凍設施儲存「冷量」）。把運轉時間搬到電價便宜的時段。",
    taiwan: "台灣電價差：尖峰 NT$ 7.07 vs 離峰 NT$ 1.96 = 每 kWh 移轉省 5 元",
    color: C.cyan,
  },
  {
    num: "2",
    title: "避免過度製冷",
    en: "Over-cooling Avoidance",
    range: "3 – 10%",
    body: "傳統控制是「現在熱就開」的反應式。預測能提前看到「半小時後氣溫會下降」，可以不用先開冰水機浪費電。",
    taiwan: "減少 1 小時冰水機空轉 = 省 115 kWh × NT$ 4.94 = NT$ 568 / 次",
    color: C.amber,
  },
  {
    num: "3",
    title: "最佳負載率",
    en: "Optimal Part-Load Ratio",
    range: "3 – 8%",
    body: "冰水機 COP (效率) 在 40-80% 部分負載率最佳。預測能讓系統選擇「最有效率的容量點」運轉，而不是反覆全開全關。",
    taiwan: "COP 從 3.5 → 5.0 = 同樣冷量少耗 30% 電力",
    color: C.cyan,
  },
];

mechanisms.forEach((m, i) => {
  const x = 0.5 + i * 3.1;
  const y = 1.65;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.9, h: 3.4, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.9, h: 0.08, fill: { color: m.color }, line: { type: "none" } });

  // Number badge in circle
  s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.2, w: 0.55, h: 0.55, fill: { color: m.color }, line: { type: "none" } });
  s.addText(m.num, { x: x + 0.2, y: y + 0.2, w: 0.55, h: 0.55, fontSize: 22, fontFace: F.head, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });

  // Range badge on right
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 1.85, y: y + 0.25, w: 0.9, h: 0.45, fill: { color: C.bgDark }, line: { type: "none" }, rectRadius: 0.05 });
  s.addText(m.range, { x: x + 1.85, y: y + 0.25, w: 0.9, h: 0.45, fontSize: 12, fontFace: F.head, bold: true, color: C.mint, align: "center", valign: "middle", margin: 0 });

  // Title + EN
  s.addText(m.title, { x: x + 0.2, y: y + 0.85, w: 2.5, h: 0.35, fontSize: 15, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(m.en, { x: x + 0.2, y: y + 1.2, w: 2.5, h: 0.3, fontSize: 9.5, fontFace: F.body, italic: true, color: C.muted, margin: 0 });

  // Body explanation
  s.addText(m.body, { x: x + 0.2, y: y + 1.55, w: 2.55, h: 1.25, fontSize: 10.5, fontFace: F.body, color: C.text, margin: 0, valign: "top" });

  // Taiwan-specific impact box
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: y + 2.85, w: 2.55, h: 0.5, fill: { color: C.bg }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.2, y: y + 2.85, w: 0.05, h: 0.5, fill: { color: m.color }, line: { type: "none" } });
  s.addText(m.taiwan, { x: x + 0.32, y: y + 2.85, w: 2.4, h: 0.5, fontSize: 9, fontFace: F.body, italic: true, color: C.navy, valign: "middle", margin: 0 });
});

// Sum-up bar at bottom
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 5.2, w: 9, h: 0.35, fill: { color: C.bgDark }, line: { type: "none" } });
s.addText("三個機制加總 → 10-30% (上頁數字的依據)。實際省多少看建築原本控制有多「笨」 — 越傳統的系統，預測控制效益越大。", {
  x: 0.7, y: 5.2, w: 8.6, h: 0.35, fontSize: 11, fontFace: F.body, color: C.white, italic: true, valign: "middle", margin: 0,
});

// =========================================================
// Slide 15 — Multi-site Platform
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "平台化設計", "Multi-site Platform", "這是這個專案最對應職缺的部分 — 從客製化轉型平台化的核心");

s.addText("不只是「能跑」— 還要能讓新案場零程式碼上線、讓前後端可以平行開發。", {
  x: 0.5, y: 1.0, w: 9, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

// LEFT: API endpoints table
s.addText("REST API 介面", { x: 0.5, y: 1.45, w: 5.5, h: 0.35, fontSize: 14, fontFace: F.head, bold: true, color: C.navy, margin: 0 });
const endpoints = [
  ["GET",  "/api/v1/buildings",                "列出建築 (site_id 篩選)"],
  ["GET",  "/api/v1/buildings/{id}/readings",  "歷史讀數查詢"],
  ["POST", "/api/v1/predict",                  "送特徵 → 6h 預測"],
  ["GET",  "/api/v1/predictions/{id}",         "查預測歷史 (audit)"],
  ["GET",  "/api/v1/models",                   "模型清單與指標"],
  ["GET",  "/api/v1/health",                   "健康檢查"],
];
endpoints.forEach((ep, i) => {
  const y = 1.9 + i * 0.5;
  const methodColor = ep[0] === "POST" ? C.amber : C.cyan;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 5.5, h: 0.42, fill: { color: C.card }, line: { color: C.border, width: 0.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.6, h: 0.42, fill: { color: methodColor }, line: { type: "none" } });
  s.addText(ep[0], { x: 0.5, y, w: 0.6, h: 0.42, fontSize: 10, fontFace: "Consolas", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  s.addText(ep[1], { x: 1.2, y, w: 2.7, h: 0.42, fontSize: 10.5, fontFace: "Consolas", color: C.text, valign: "middle", margin: 0 });
  s.addText(ep[2], { x: 4.0, y, w: 1.95, h: 0.42, fontSize: 9.5, fontFace: F.body, color: C.muted, valign: "middle", margin: 0 });
});

// RIGHT: 4 design principles
s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.45, w: 3.2, h: 3.55, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
s.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 1.45, w: 3.2, h: 0.08, fill: { color: C.amber }, line: { type: "none" } });
s.addText("平台化關鍵設計", { x: 6.5, y: 1.6, w: 2.9, h: 0.4, fontSize: 14, fontFace: F.head, bold: true, color: C.text, margin: 0 });

const designs = [
  { t: "Schema 隔離", d: "buildings.site_id 是所有查詢的篩選 key" },
  { t: "跨建築模型", d: "building 特徵讓同一模型能服務不同建築" },
  { t: "API contract first", d: "schema 定下來，前後端可平行開發" },
  { t: "零程式碼上線", d: "新案場只要 INSERT 一筆建築紀錄" },
];
designs.forEach((d, i) => {
  const y = 2.05 + i * 0.72;
  s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: y + 0.08, w: 0.1, h: 0.32, fill: { color: C.amber }, line: { type: "none" } });
  s.addText(d.t, { x: 6.7, y, w: 2.7, h: 0.32, fontSize: 12, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(d.d, { x: 6.7, y: y + 0.3, w: 2.7, h: 0.4, fontSize: 9.5, fontFace: F.body, color: C.muted, margin: 0 });
});

s.addText("FastAPI 自動產生 OpenAPI 文件 — 面試 demo 時打開 /docs 就能互動測試。", {
  x: 0.5, y: 5.15, w: 9, h: 0.3, fontSize: 11.5, fontFace: F.body, italic: true, color: C.text, align: "center", margin: 0,
});

// =========================================================
// Slide 13 — Engineering Practices
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "工程實踐", "Engineering Practices", "對應職缺：「以長期可維運為優先」「良好的文件習慣」");

s.addText("展示我不只「跑得出結果」，還能交付可維運的程式碼。", {
  x: 0.5, y: 1.0, w: 9, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const practices = [
  { stat: "10/10", label: "Unit Tests Pass", body: "pytest 測試 preprocessing + API endpoints，每次 commit 前驗證" },
  { stat: "1-cmd", label: "One-shot Deploy",  body: "docker compose up 一行指令啟動 PostgreSQL + API + Dashboard" },
  { stat: "5", label: "Decoupled Layers", body: "data / model / API / DB / UI 五層清晰分離，可以單獨替換任一層" },
  { stat: "ABC", label: "Model Interface", body: "BaseForecaster 抽象介面，未來新模型只要 implement 就能加入" },
  { stat: "✓", label: "MLflow Tracking", body: "每次訓練的 metrics、超參數、模型檔案都自動記錄，可比較可回溯" },
  { stat: "✓", label: "Schema Validation", body: "Pydantic 強制檢查 API contract，型別錯誤在最外層就攔截" },
];
practices.forEach((p, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.5 + col * 3.15;
  const y = 1.45 + row * 1.95;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.95, h: 1.8, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h: 1.8, fill: { color: C.cyan }, line: { type: "none" } });
  s.addText(p.stat, { x: x + 0.2, y: y + 0.12, w: 2.7, h: 0.55, fontSize: 26, fontFace: F.head, bold: true, color: C.cyan, margin: 0 });
  s.addText(p.label, { x: x + 0.2, y: y + 0.7, w: 2.7, h: 0.35, fontSize: 13, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(p.body, { x: x + 0.2, y: y + 1.05, w: 2.7, h: 0.7, fontSize: 10, fontFace: F.body, color: C.muted, margin: 0, valign: "top" });
});

// =========================================================
// Slide 14 — Live Demo
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
addHeader(s, "現場 Demo", "Live Demo", "接下來實際打開瀏覽器給您看 — 三個服務同時運行中");

s.addText("所有服務都跑在我的 Docker 容器裡，這就是「平台化」的具體成果。", {
  x: 0.5, y: 1.0, w: 9, h: 0.35, fontSize: 12, fontFace: F.body, italic: true, color: C.muted, margin: 0,
});

const demos = [
  { num: "01", title: "Swagger API 文件", url: "localhost:8000/docs", desc: "FastAPI 自動產生互動式 API 文件 · 可以直接 POST /predict 看回傳" },
  { num: "02", title: "Streamlit 儀表板", url: "localhost:8501",      desc: "4 個分頁：Overview · Prediction · Model Comparison · Data Quality" },
  { num: "03", title: "MLflow 實驗追蹤",  url: "localhost:5000",      desc: "比較 LightGBM 與 LSTM 在每個 fold 的 RMSE / MAE，可下載 artefacts" },
  { num: "04", title: "EDA 探索分析",    url: "notebooks/01_EDA.ipynb", desc: "Jupyter notebook 展示資料分布、缺值、特徵與目標的關聯" },
];
demos.forEach((d, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.5 + col * 4.7;
  const y = 1.5 + row * 1.85;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.5, h: 1.65, fill: { color: C.card }, line: { color: C.border, width: 0.5 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h: 1.65, fill: { color: C.cyan }, line: { type: "none" } });
  s.addText(d.num, { x: x + 0.25, y: y + 0.15, w: 0.7, h: 0.5, fontSize: 28, fontFace: F.head, bold: true, color: C.cyan, margin: 0 });
  s.addText(d.title, { x: x + 1.0, y: y + 0.2, w: 3.4, h: 0.4, fontSize: 15, fontFace: F.head, bold: true, color: C.text, margin: 0 });
  s.addText(d.url, { x: x + 1.0, y: y + 0.6, w: 3.4, h: 0.3, fontSize: 11, fontFace: "Consolas", color: C.amber, margin: 0 });
  s.addText(d.desc, { x: x + 0.25, y: y + 1.0, w: 4.1, h: 0.6, fontSize: 10, fontFace: F.body, color: C.muted, margin: 0, valign: "top" });
});

s.addText("docker compose ps 證明三個容器都是 healthy 狀態。", {
  x: 0.5, y: 5.25, w: 9, h: 0.3, fontSize: 12, fontFace: F.body, italic: true, color: C.text, align: "center", margin: 0,
});

// =========================================================
// Slide 15 — Closing
// =========================================================
s = pres.addSlide();
s.background = { color: C.bgDark };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.25, h: 5.625, fill: { color: C.cyan }, line: { type: "none" } });

s.addText("為什麼我適合愛淨節能科技", { x: 0.7, y: 0.35, w: 9, h: 0.55, fontSize: 26, fontFace: F.head, bold: true, color: C.white, margin: 0 });
s.addText("Why I'm a fit for this role", { x: 0.7, y: 0.88, w: 9, h: 0.35, fontSize: 13, fontFace: F.body, color: C.mint, italic: true, margin: 0 });

const fits = [
  { k: "端到端 ML pipeline 落地能力", v: "從 ASHRAE 原始資料到 production-ready API 和 Dashboard 都自己完成" },
  { k: "多步時序預測實務經驗", v: "Walk-forward CV、離線/線上一致性、6 步預測都實作出來" },
  { k: "平台化思維", v: "API contract first、multi-site schema、新案場零程式碼上線的設計" },
  { k: "扎實工程素養", v: "Unit Tests · Docker · MLflow · Pydantic schema validation 都有實作" },
  { k: "資料敘事 (BI 背景)", v: "Streamlit dashboard 對齊不同利害關係人 — 從工程師到老闆都看得懂" },
  { k: "持續學習意願", v: "從零學 HVAC 領域，一週內把這個 demo 完整交付，證明學習速度" },
];
fits.forEach((f, i) => {
  const y = 1.4 + i * 0.55;
  s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: y + 0.1, w: 0.12, h: 0.32, fill: { color: C.mint }, line: { type: "none" } });
  s.addText(f.k, { x: 0.95, y, w: 3.0, h: 0.5, fontSize: 13, fontFace: F.head, bold: true, color: C.white, margin: 0, valign: "middle" });
  s.addText(f.v, { x: 3.95, y, w: 5.8, h: 0.5, fontSize: 11.5, fontFace: F.body, color: "B8E0D2", margin: 0, valign: "middle" });
});

s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.85, w: 8.6, h: 0.55, fill: { color: C.cyan }, line: { type: "none" } });
s.addText("謝謝聆聽 · Thank you. Questions?", {
  x: 0.7, y: 4.85, w: 8.6, h: 0.55, fontSize: 18, fontFace: F.head, bold: true, color: C.bgDark, align: "center", valign: "middle", margin: 0,
});

// ────────────────────────────────────────────────────────
pres.writeFile({ fileName: "Chiller_Forecast_Interview.pptx" })
  .then((f) => console.log("Wrote:", f))
  .catch((e) => { console.error(e); process.exit(1); });
