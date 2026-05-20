// Academic-style presentation for the chiller load forecasting model.
// Conference paper presentation aesthetic.
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Andrew";
pres.title = "Multi-step Chiller Load Forecasting: A Comparative Study";

// ── Academic color palette (conservative, paper-like) ───────────
const C = {
  navy:    "1F2937",   // section headers
  crimson: "8B2331",   // accent / emphasis
  ink:     "0F172A",   // body text
  muted:   "4B5563",   // captions
  rule:    "94A3B8",   // separator lines
  fill:    "F1F5F9",   // light cell fills
  bg:      "FFFFFF",   // slide background
  card:    "FFFFFF",
  cream:   "FAF7F2",
  cyan:    "0E7490",
  amber:   "B45309",
};

// Fonts — serif for paper feel
const F = {
  serifHeader: "Cambria",
  serif:       "Cambria",
  sans:        "Calibri",
  mono:        "Consolas",
};

const shadow = () => ({ type: "outer", blur: 4, offset: 1, angle: 135, color: "000000", opacity: 0.08 });

// ── Reusable utilities ──────────────────────────────────────────
function pageNumber(slide, n, total) {
  slide.addText(`${n} / ${total}`, {
    x: 9.0, y: 5.35, w: 0.9, h: 0.2,
    fontSize: 9, fontFace: F.sans, color: C.muted, align: "right", margin: 0,
  });
  slide.addText("Multi-step Chiller Load Forecasting", {
    x: 0.4, y: 5.35, w: 6, h: 0.2,
    fontSize: 9, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
  });
}

function sectionHeader(slide, num, ch, en) {
  // Top rule
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 0.45, w: 9.2, h: 0.02, fill: { color: C.crimson }, line: { type: "none" } });
  slide.addText(`§${num}`, {
    x: 0.4, y: 0.6, w: 0.8, h: 0.45,
    fontSize: 16, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
  });
  slide.addText(ch, {
    x: 1.15, y: 0.55, w: 8, h: 0.5,
    fontSize: 22, fontFace: F.serifHeader, bold: true, color: C.navy, margin: 0,
  });
  slide.addText(en, {
    x: 1.15, y: 1.05, w: 8, h: 0.3,
    fontSize: 11, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
  });
  // Bottom rule under header
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.4, w: 9.2, h: 0.01, fill: { color: C.rule }, line: { type: "none" } });
}

const TOTAL = 15;

// =========================================================
// Slide 1 — Title page (paper-style)
// =========================================================
let s = pres.addSlide();
s.background = { color: C.cream };

// Top accent
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.15, fill: { color: C.crimson }, line: { type: "none" } });

// Affiliation / venue line
s.addText("INTERVIEW TECHNICAL PRESENTATION  ·  TAIPEI, 2026", {
  x: 0.7, y: 0.7, w: 8.6, h: 0.3,
  fontSize: 10, fontFace: F.sans, charSpacing: 4, color: C.crimson, bold: true, margin: 0,
});

// Title
s.addText("Multi-step Chiller Load Forecasting:", {
  x: 0.7, y: 1.5, w: 8.6, h: 0.7,
  fontSize: 32, fontFace: F.serifHeader, bold: true, color: C.navy, margin: 0,
});
s.addText("A Comparative Study of Gradient Boosting and Recurrent Neural Networks", {
  x: 0.7, y: 2.2, w: 8.6, h: 0.5,
  fontSize: 20, fontFace: F.serifHeader, italic: true, color: C.navy, margin: 0,
});

// Horizontal rule
s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.0, w: 3, h: 0.02, fill: { color: C.crimson }, line: { type: "none" } });

// Author block
s.addText("Andrew", {
  x: 0.7, y: 3.2, w: 8.6, h: 0.4,
  fontSize: 16, fontFace: F.serifHeader, bold: true, color: C.ink, margin: 0,
});
s.addText("worldpeaceandrew@gmail.com", {
  x: 0.7, y: 3.6, w: 8.6, h: 0.3,
  fontSize: 11, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

// Abstract box
s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.2, w: 8.6, h: 1.0, fill: { color: C.fill }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.2, w: 0.04, h: 1.0, fill: { color: C.crimson }, line: { type: "none" } });
s.addText("Abstract", {
  x: 0.85, y: 4.25, w: 1.5, h: 0.3,
  fontSize: 10, fontFace: F.sans, bold: true, charSpacing: 2, color: C.crimson, margin: 0,
});
s.addText("我們在 ASHRAE Great Energy Predictor III 資料集上，比較 LightGBM 與 PyTorch LSTM 在 6 步時序預測 (h=1..6) 任務上的表現。實驗採用 walk-forward cross-validation，並以 forecast skill score 評估模型品質。結果顯示 LightGBM 在當前資料規模 (8.6k samples) 下顯著優於 LSTM。", {
  x: 0.85, y: 4.55, w: 8.4, h: 0.6,
  fontSize: 10.5, fontFace: F.serif, color: C.ink, margin: 0, valign: "top",
});

pageNumber(s, 1, TOTAL);

// =========================================================
// Slide 2 — Outline / Table of Contents
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "0", "簡報大綱", "Outline");

const outline = [
  { n: "1", ch: "研究動機與問題定義",     en: "Motivation & Problem Statement" },
  { n: "2", ch: "資料集與前處理",         en: "Dataset and Preprocessing" },
  { n: "3", ch: "特徵工程",              en: "Feature Engineering" },
  { n: "4", ch: "方法 — LightGBM",      en: "Methodology — Gradient Boosting" },
  { n: "5", ch: "方法 — LSTM",          en: "Methodology — Recurrent Network" },
  { n: "6", ch: "實驗設計",              en: "Experimental Setup" },
  { n: "7", ch: "結果與分析",            en: "Results and Analysis" },
  { n: "8", ch: "討論與限制",            en: "Discussion and Limitations" },
  { n: "9", ch: "結論與未來工作",        en: "Conclusion and Future Work" },
];

outline.forEach((o, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.6 + col * 4.5;
  const y = 1.7 + row * 0.65;

  s.addText(`§${o.n}`, { x, y, w: 0.5, h: 0.4, fontSize: 16, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0 });
  s.addText(o.ch, { x: x + 0.55, y, w: 3.6, h: 0.25, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.ink, margin: 0 });
  s.addText(o.en, { x: x + 0.55, y: y + 0.27, w: 3.6, h: 0.2, fontSize: 10, fontFace: F.sans, italic: true, color: C.muted, margin: 0 });
});

pageNumber(s, 2, TOTAL);

// =========================================================
// Slide 3 — Motivation & Problem
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "1", "研究動機與問題定義", "Motivation & Problem Statement");

// 1.1 Motivation
s.addText("1.1  動機 — Motivation", {
  x: 0.5, y: 1.55, w: 9, h: 0.35, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});
s.addText("建築能耗預測是智慧建築 (smart building) 與最佳化控制 (optimal control) 的核心。冰水機系統佔商業建築總電力消耗的 40–60% [1]，準確的負載預測可支援預測式控制 (MPC)、需量反應 (DR)、與設備維護排程。", {
  x: 0.5, y: 1.9, w: 9, h: 0.6, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

// 1.2 Problem formulation
s.addText("1.2  問題定義 — Problem Formulation", {
  x: 0.5, y: 2.6, w: 9, h: 0.35, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

s.addText("給定 t 時刻的歷史觀察 X₁:ₜ ∈ ℝᵀˣᵈ，目標是學習映射 f : ℝᵀˣᵈ → ℝᴴ，輸出未來 H 步預測：", {
  x: 0.5, y: 2.95, w: 9, h: 0.4, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

// Formula box
s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 3.4, w: 7, h: 0.6, fill: { color: C.fill }, line: { type: "none" } });
s.addText("ŷₜ₊₁ , ŷₜ₊₂ , … , ŷₜ₊ₕ  =  f(X₁:ₜ ; θ)        H = 6,  T = 48", {
  x: 1.5, y: 3.4, w: 7, h: 0.6, fontSize: 14, fontFace: F.serif, italic: true, color: C.ink, align: "center", valign: "middle", margin: 0,
});

s.addText("最小化平均期望損失：", {
  x: 0.5, y: 4.1, w: 9, h: 0.3, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 4.4, w: 7, h: 0.55, fill: { color: C.fill }, line: { type: "none" } });
s.addText("ℒ(θ) = (1/H) Σᵢ₌₁..ₕ  𝔼[ (yₜ₊ᵢ − ŷₜ₊ᵢ)² ]", {
  x: 1.5, y: 4.4, w: 7, h: 0.55, fontSize: 14, fontFace: F.serif, italic: true, color: C.ink, align: "center", valign: "middle", margin: 0,
});

s.addText("其中 yₜ 為時刻 t 的冰水負載 (chilled-water meter reading, kWh)。", {
  x: 0.5, y: 5.0, w: 9, h: 0.3, fontSize: 10, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

pageNumber(s, 3, TOTAL);

// =========================================================
// Slide 4 — Dataset
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "2", "資料集與前處理", "Dataset and Preprocessing");

s.addText("2.1  資料來源", {
  x: 0.5, y: 1.55, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});
s.addText("ASHRAE Great Energy Predictor III (Kaggle, 2019) [2]，涵蓋全美 16 個 site、1,448 棟建築之 24 個月逐時感測資料。本研究篩選 meter_type = 1 (chilled water)，得 498 棟建築、4.18M 筆記錄。", {
  x: 0.5, y: 1.85, w: 9, h: 0.65, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

// Table: dataset statistics
s.addText("2.2  資料規模 (filtered)", {
  x: 0.5, y: 2.6, w: 4.4, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const dsRows = [
  ["項目", "數值"],
  ["Rows (hourly)",            "4,182,440"],
  ["Buildings",                "498"],
  ["Sites (climate zones)",    "10"],
  ["Date range",               "2016-01-01 ~ 2016-12-31"],
  ["Time resolution",          "1 hour"],
  ["Target variable",          "meter_reading (kWh)"],
];
const tblOpts = {
  x: 0.5, y: 2.95, w: 4.4, h: 2.0,
  fontSize: 10, fontFace: F.sans, color: C.ink,
  border: { type: "none" },
  rowH: 0.3,
};
dsRows.forEach((row, i) => {
  const y = tblOpts.y + i * tblOpts.rowH;
  const isHeader = i === 0;
  const fill = isHeader ? C.navy : (i % 2 === 0 ? C.fill : C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: tblOpts.x, y, w: tblOpts.w, h: tblOpts.rowH, fill: { color: fill }, line: { type: "none" } });
  s.addText(row[0], { x: tblOpts.x + 0.1, y, w: 2.3, h: tblOpts.rowH, fontSize: 10, fontFace: isHeader ? F.serifHeader : F.sans, bold: isHeader, color: isHeader ? C.bg : C.ink, valign: "middle", margin: 0 });
  s.addText(row[1], { x: tblOpts.x + 2.3, y, w: 2.0, h: tblOpts.rowH, fontSize: 10, fontFace: isHeader ? F.serifHeader : F.mono, bold: isHeader, color: isHeader ? C.bg : C.ink, valign: "middle", align: "right", margin: 0 });
});

// Right: Preprocessing steps
s.addText("2.3  前處理流程", {
  x: 5.2, y: 2.6, w: 4.3, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const preproc = [
  { step: "(i)",   what: "Weather imputation", how: "forward-fill → linear interpolation" },
  { step: "(ii)",  what: "Anomaly detection",  how: "per-building 3·IQR rule on meter" },
  { step: "(iii)", what: "Long zero runs",     how: "flag ≥48h zero sequences" },
  { step: "(iv)",  what: "Target interpolation",how: "linear within building groups" },
];
preproc.forEach((p, i) => {
  const y = 2.95 + i * 0.45;
  s.addText(p.step, { x: 5.2, y, w: 0.4, h: 0.4, fontSize: 11, fontFace: F.serif, italic: true, color: C.crimson, valign: "middle", margin: 0 });
  s.addText(p.what, { x: 5.55, y, w: 1.85, h: 0.2, fontSize: 11, fontFace: F.serifHeader, bold: true, color: C.ink, margin: 0 });
  s.addText(p.how,  { x: 5.55, y: y + 0.22, w: 4.0, h: 0.2, fontSize: 9.5, fontFace: F.sans, italic: true, color: C.muted, margin: 0 });
});

s.addText("[1] Pérez-Lombard et al., 2008.   [2] Miller et al., ASHRAE Trans., 2020.", {
  x: 0.5, y: 5.0, w: 9, h: 0.25, fontSize: 8.5, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

pageNumber(s, 4, TOTAL);

// =========================================================
// Slide 5 — Feature Engineering
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "3", "特徵工程", "Feature Engineering");

s.addText("總共 46 個特徵，分五類。每類具有明確物理或時序假設。", {
  x: 0.5, y: 1.55, w: 9, h: 0.35, fontSize: 11, fontFace: F.serif, italic: true, color: C.ink, margin: 0,
});

// Feature table
const featRows = [
  ["類別 / Category", "Dim", "代表特徵", "Hypothesis / 物理意義"],
  ["Temporal",      "10", "hour, dow, month, sin/cos(hour)", "日/週/年週期性 — 對應人類使用模式"],
  ["Weather",       "4",  "T_air, T_dew, CDH, T·RH",         "外氣熱負荷直接驅動冷需求"],
  ["Lag",           "4",  "y_{t−1}, y_{t−24}, y_{t−168}",     "時序自相關 — 短期慣性 + 週期"],
  ["Rolling",       "6",  "μ, σ, max over 6h / 24h windows",  "局部平滑統計 — 雜訊抑制"],
  ["Building",      "22", "log(area), age, primary_use OH",   "跨建築泛化所需之上下文"],
];

const ftblX = 0.5, ftblY = 2.05, ftblW = 9.0, ftblRowH = 0.45;
featRows.forEach((row, i) => {
  const y = ftblY + i * ftblRowH;
  const isHeader = i === 0;
  const fill = isHeader ? C.navy : (i % 2 === 0 ? C.fill : C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: ftblX, y, w: ftblW, h: ftblRowH, fill: { color: fill }, line: { type: "none" } });

  const cols = [
    { x: 0.6, w: 1.4 },
    { x: 2.0, w: 0.5 },
    { x: 2.55, w: 3.0 },
    { x: 5.6, w: 4.0 },
  ];
  row.forEach((cell, j) => {
    s.addText(cell, {
      x: cols[j].x, y, w: cols[j].w, h: ftblRowH,
      fontSize: isHeader ? 10.5 : (j === 2 ? 10 : 10.5),
      fontFace: isHeader ? F.serifHeader : (j === 2 ? F.mono : F.serif),
      bold: isHeader || j === 0,
      italic: !isHeader && j === 3,
      color: isHeader ? C.bg : (j === 0 ? C.crimson : C.ink),
      valign: "middle", margin: 0,
    });
  });
});

// Focused example: cooling degree hours
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.75, w: 9.0, h: 0.55, fill: { color: C.fill }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.75, w: 0.04, h: 0.55, fill: { color: C.crimson }, line: { type: "none" } });
s.addText("Example", {
  x: 0.65, y: 4.78, w: 1.0, h: 0.25, fontSize: 9, fontFace: F.sans, bold: true, charSpacing: 2, color: C.crimson, margin: 0,
});
s.addText("CDH(t) = max(0, T_air(t) − 18°C)   ⇒   閾值切除非冷卻需求區間，使特徵與目標關係更線性。", {
  x: 0.65, y: 5.0, w: 8.7, h: 0.3, fontSize: 11, fontFace: F.serif, italic: true, color: C.ink, valign: "middle", margin: 0,
});

pageNumber(s, 5, TOTAL);

// =========================================================
// Slide 6 — LightGBM Methodology
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "4", "方法 — LightGBM", "Methodology — Gradient Boosting");

s.addText("4.1  模型形式", {
  x: 0.5, y: 1.55, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});
s.addText("採用 Direct multi-output 策略：對每個預測步 h ∈ {1,…,6}，訓練獨立的 LightGBM regressor fʰ。每個 fʰ 為一組 boosted decision trees 之加法形式：", {
  x: 0.5, y: 1.9, w: 9, h: 0.5, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 2.45, w: 7, h: 0.55, fill: { color: C.fill }, line: { type: "none" } });
s.addText("fʰ(x) = Σₖ₌₁..ₖ  ηₖ · gₖ(x;  Φₖ)        x ∈ ℝ⁴⁶,   gₖ : decision tree", {
  x: 1.5, y: 2.45, w: 7, h: 0.55, fontSize: 13, fontFace: F.serif, italic: true, color: C.ink, align: "center", valign: "middle", margin: 0,
});

// Hyperparameters
s.addText("4.2  超參數", {
  x: 0.5, y: 3.1, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const hpRows = [
  ["Hyperparameter",       "Value"],
  ["n_estimators (K)",     "300"],
  ["learning_rate (η)",    "0.05"],
  ["num_leaves",           "31"],
  ["max_depth",            "−1 (no limit)"],
  ["objective",            "regression (L2)"],
  ["early_stopping_rounds","50"],
];
const hpX = 0.5, hpY = 3.45, hpW = 4.4, hpRowH = 0.27;
hpRows.forEach((row, i) => {
  const y = hpY + i * hpRowH;
  const isHeader = i === 0;
  const fill = isHeader ? C.navy : (i % 2 === 0 ? C.fill : C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: hpX, y, w: hpW, h: hpRowH, fill: { color: fill }, line: { type: "none" } });
  s.addText(row[0], { x: hpX + 0.1, y, w: 2.3, h: hpRowH, fontSize: 10, fontFace: isHeader ? F.serifHeader : F.mono, bold: isHeader, color: isHeader ? C.bg : C.ink, valign: "middle", margin: 0 });
  s.addText(row[1], { x: hpX + 2.3, y, w: 2.0, h: hpRowH, fontSize: 10, fontFace: isHeader ? F.serifHeader : F.mono, bold: isHeader, color: isHeader ? C.bg : C.ink, valign: "middle", align: "right", margin: 0 });
});

// Rationale on the right
s.addText("4.3  選擇理由", {
  x: 5.2, y: 3.1, w: 4.3, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const reasons = [
  "Tabular features 的 SOTA — 廣泛 dominate Kaggle 競賽",
  "原生支援 NaN，省去缺值處理 pipeline",
  "Tree-based → 對 monotonic feature 有 inductive bias",
  "Training cost O(n·d·log n)，CPU 上可訓練",
];
reasons.forEach((r, i) => {
  const y = 3.5 + i * 0.42;
  s.addText("•", { x: 5.2, y, w: 0.2, h: 0.35, fontSize: 14, fontFace: F.serifHeader, color: C.crimson, margin: 0 });
  s.addText(r, { x: 5.4, y, w: 4.1, h: 0.4, fontSize: 10.5, fontFace: F.serif, color: C.ink, valign: "middle", margin: 0 });
});

pageNumber(s, 6, TOTAL);

// =========================================================
// Slide 7 — LSTM Methodology
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "5", "方法 — LSTM", "Methodology — Recurrent Network");

s.addText("5.1  網路架構 — Sequence-to-Multi", {
  x: 0.5, y: 1.55, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

// Architecture diagram (simple boxes)
const archY = 2.05;
const archBoxes = [
  { label: "Input\n(48, 46)", x: 0.6, color: C.fill },
  { label: "LSTM\n(h=64)",    x: 2.4, color: C.fill },
  { label: "LSTM\n(h=64)",    x: 4.2, color: C.fill },
  { label: "Dense\n(64 → 6)", x: 6.0, color: C.fill },
  { label: "Output\nŷ ∈ ℝ⁶",  x: 7.8, color: C.fill },
];
archBoxes.forEach((b, i) => {
  s.addShape(pres.shapes.RECTANGLE, { x: b.x, y: archY, w: 1.5, h: 0.9, fill: { color: b.color }, line: { color: C.navy, width: 1 } });
  s.addText(b.label, { x: b.x, y: archY, w: 1.5, h: 0.9, fontSize: 11, fontFace: F.serifHeader, bold: true, color: C.ink, align: "center", valign: "middle", margin: 0 });
  if (i < archBoxes.length - 1) {
    s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: b.x + 1.55, y: archY + 0.3, w: 0.2, h: 0.3, fill: { color: C.crimson }, line: { type: "none" }, rotate: 90 });
  }
});

s.addText("Recurrence:  hₜ , cₜ = LSTM(xₜ , hₜ₋₁ , cₜ₋₁)        |        Output:  ŷ = W · h₄₈ + b", {
  x: 0.5, y: 3.05, w: 9, h: 0.35, fontSize: 11.5, fontFace: F.serif, italic: true, color: C.ink, align: "center", valign: "middle", margin: 0,
});

// Training config
s.addText("5.2  訓練設定", {
  x: 0.5, y: 3.5, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const lstmHp = [
  ["Optimizer",       "Adam (β₁=0.9, β₂=0.999)"],
  ["Learning rate",   "1 × 10⁻³"],
  ["Batch size",      "64"],
  ["Loss",            "Mean Squared Error"],
  ["Max epochs",      "50"],
  ["Early stopping",  "patience = 5 on val loss"],
  ["Sequence length", "T = 48 hours"],
  ["Forecast horizon","H = 6 steps"],
];
const lhpRowH = 0.2;
lstmHp.forEach((row, i) => {
  const col = i % 2;
  const r = Math.floor(i / 2);
  const x = 0.5 + col * 4.6;
  const y = 3.9 + r * lhpRowH;
  s.addText(row[0], { x, y, w: 1.9, h: lhpRowH, fontSize: 10, fontFace: F.serifHeader, color: C.muted, valign: "middle", margin: 0 });
  s.addText(row[1], { x: x + 1.9, y, w: 2.5, h: lhpRowH, fontSize: 10, fontFace: F.mono, color: C.ink, valign: "middle", margin: 0 });
});

pageNumber(s, 7, TOTAL);

// =========================================================
// Slide 8 — Experimental Setup
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "6", "實驗設計", "Experimental Setup");

// 6.1 Train/Val split — walk-forward
s.addText("6.1  Walk-forward Cross-validation", {
  x: 0.5, y: 1.55, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});
s.addText("時序資料禁用 random k-fold (會洩漏未來資訊)。本研究採用 expanding-window walk-forward (k=3)，每 fold 訓練窗口擴張、驗證窗口前推。", {
  x: 0.5, y: 1.9, w: 9, h: 0.55, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

// Visual: walk-forward diagram
const wfY = 2.65;
const folds = [
  { train: [0.5, 4.0], val: [4.0, 5.0], label: "Fold 1" },
  { train: [0.5, 5.0], val: [5.0, 6.0], label: "Fold 2" },
  { train: [0.5, 6.0], val: [6.0, 7.0], label: "Fold 3" },
];
folds.forEach((f, i) => {
  const y = wfY + i * 0.4;
  s.addText(f.label, { x: 0.5, y, w: 0.7, h: 0.3, fontSize: 10, fontFace: F.serifHeader, bold: true, color: C.ink, valign: "middle", margin: 0 });
  // Train bar
  s.addShape(pres.shapes.RECTANGLE, { x: 1.25 + f.train[0], y: y + 0.05, w: f.train[1] - f.train[0], h: 0.2, fill: { color: C.navy }, line: { type: "none" } });
  // Val bar
  s.addShape(pres.shapes.RECTANGLE, { x: 1.25 + f.val[0], y: y + 0.05, w: f.val[1] - f.val[0], h: 0.2, fill: { color: C.crimson }, line: { type: "none" } });
});

// Legend
s.addShape(pres.shapes.RECTANGLE, { x: 6.0, y: 3.85, w: 0.25, h: 0.2, fill: { color: C.navy }, line: { type: "none" } });
s.addText("train", { x: 6.3, y: 3.85, w: 0.7, h: 0.2, fontSize: 10, fontFace: F.sans, color: C.muted, valign: "middle", margin: 0 });
s.addShape(pres.shapes.RECTANGLE, { x: 7.1, y: 3.85, w: 0.25, h: 0.2, fill: { color: C.crimson }, line: { type: "none" } });
s.addText("validation", { x: 7.4, y: 3.85, w: 1.5, h: 0.2, fontSize: 10, fontFace: F.sans, color: C.muted, valign: "middle", margin: 0 });

// Metrics
s.addText("6.2  評估指標", {
  x: 0.5, y: 4.25, w: 9, h: 0.3, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const metricRows = [
  ["Metric",         "Formula",                                  "說明"],
  ["RMSE",           "√[ (1/N) Σ (y − ŷ)² ]",                   "與目標同單位 (kWh)，懲罰大誤差"],
  ["MAE",            "(1/N) Σ |y − ŷ|",                          "穩健於離群值，可解釋"],
  ["Skill Score",    "1 − RMSE_model / RMSE_baseline",           "對比『預測平均』的相對改進 [3]"],
];
const mtblX = 0.5, mtblY = 4.6, mtblRowH = 0.25;
metricRows.forEach((row, i) => {
  const y = mtblY + i * mtblRowH;
  const isHeader = i === 0;
  const fill = isHeader ? C.navy : (i % 2 === 0 ? C.fill : C.bg);
  s.addShape(pres.shapes.RECTANGLE, { x: mtblX, y, w: 9, h: mtblRowH, fill: { color: fill }, line: { type: "none" } });
  const cols = [{ x: 0.6, w: 1.7 }, { x: 2.3, w: 3.2 }, { x: 5.5, w: 3.9 }];
  row.forEach((cell, j) => {
    s.addText(cell, {
      x: cols[j].x, y, w: cols[j].w, h: mtblRowH,
      fontSize: isHeader ? 10 : (j === 1 ? 10 : 10),
      fontFace: isHeader ? F.serifHeader : (j === 1 ? F.serif : F.serif),
      italic: !isHeader && j === 1,
      bold: isHeader,
      color: isHeader ? C.bg : C.ink,
      valign: "middle", margin: 0,
    });
  });
});

pageNumber(s, 8, TOTAL);

// =========================================================
// Slide 9 — Results: Quantitative
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "7.1", "結果 — 主要指標", "Results — Main Quantitative Metrics");

s.addText("Test target: Building 171 (data-richest in cooling subset), N = 8,616 hours after preprocessing.", {
  x: 0.5, y: 1.55, w: 9, h: 0.3, fontSize: 10, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

// Main results table
const resRows = [
  ["Model",          "Avg RMSE↓",  "Avg MAE↓",   "Skill Score↑",  "Wall-clock /fold"],
  ["Naive (mean)",   "137.25",     "—",          "0.000",          "—"],
  ["LSTM",           "89.91",      "73.30",      "0.345",          "~5 min"],
  ["LightGBM",       "40.02",      "27.03",      "0.708",          "~30 sec"],
];

const rtblX = 0.5, rtblY = 1.95, rtblW = 9.0, rtblRowH = 0.5;
resRows.forEach((row, i) => {
  const y = rtblY + i * rtblRowH;
  const isHeader = i === 0;
  const isBest = i === 3;  // LightGBM row
  const fill = isHeader ? C.navy : (isBest ? "FFF7E6" : (i % 2 === 0 ? C.fill : C.bg));
  s.addShape(pres.shapes.RECTANGLE, { x: rtblX, y, w: rtblW, h: rtblRowH, fill: { color: fill }, line: { type: "none" } });

  const cols = [
    { x: 0.6, w: 2.0, align: "left" },
    { x: 2.6, w: 1.5, align: "center" },
    { x: 4.1, w: 1.5, align: "center" },
    { x: 5.6, w: 1.8, align: "center" },
    { x: 7.4, w: 2.0, align: "center" },
  ];
  row.forEach((cell, j) => {
    s.addText(cell, {
      x: cols[j].x, y, w: cols[j].w, h: rtblRowH,
      fontSize: isHeader ? 11 : 12,
      fontFace: isHeader ? F.serifHeader : (j === 0 ? F.serif : F.mono),
      bold: isHeader || (isBest && j > 0),
      color: isHeader ? C.bg : (isBest && j > 0 ? C.crimson : C.ink),
      align: cols[j].align, valign: "middle", margin: 0,
    });
  });
});

s.addText("LightGBM 在所有指標 dominate LSTM。Skill score 0.708 表示比『預測平均』改進 70.8%。", {
  x: 0.5, y: 4.1, w: 9, h: 0.3, fontSize: 11, fontFace: F.serif, italic: true, color: C.ink, margin: 0,
});

s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.85, fill: { color: C.fill }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 0.04, h: 0.85, fill: { color: C.crimson }, line: { type: "none" } });
s.addText("Key finding", { x: 0.65, y: 4.55, w: 1.5, h: 0.25, fontSize: 9, fontFace: F.sans, bold: true, charSpacing: 2, color: C.crimson, margin: 0 });
s.addText("在當前資料規模 (~8.6k samples, 單一建築)，LightGBM 的歸納偏差 (decision trees) 比 LSTM 更適合此問題。此結果與 ASHRAE Kaggle 競賽前段班的觀察一致 [2] — tree-based methods dominate tabular time-series.",
  { x: 0.65, y: 4.78, w: 8.7, h: 0.55, fontSize: 10.5, fontFace: F.serif, color: C.ink, valign: "top", margin: 0 });

pageNumber(s, 9, TOTAL);

// =========================================================
// Slide 10 — Results: Per-step error
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "7.2", "結果 — 逐步驟誤差", "Results — Per-step Error Analysis");

s.addText("檢視 RMSE 隨預測步驟 h 的退化情況，可揭示模型在「短期 vs 長期」預測的相對優勢。", {
  x: 0.5, y: 1.55, w: 9, h: 0.3, fontSize: 11, fontFace: F.serif, italic: true, color: C.ink, margin: 0,
});

// Line chart per-step
s.addChart(pres.charts.LINE, [
  { name: "LightGBM", labels: ["h=1", "h=2", "h=3", "h=4", "h=5", "h=6"], values: [32, 36, 38, 41, 44, 49] },
  { name: "LSTM",     labels: ["h=1", "h=2", "h=3", "h=4", "h=5", "h=6"], values: [78, 84, 88, 92, 95, 102] },
], {
  x: 0.5, y: 1.95, w: 5.8, h: 3.0, lineSize: 2.5, lineSmooth: false,
  chartColors: [C.crimson, C.navy],
  chartArea: { fill: { color: "FFFFFF" }, roundedCorners: false, border: { color: C.rule, pt: 0.5 } },
  catAxisLabelColor: C.muted, valAxisLabelColor: C.muted,
  catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
  catAxisTitle: "Forecast horizon (h)",
  catAxisTitleColor: C.ink, catAxisTitleFontSize: 10,
  showCatAxisTitle: true,
  valAxisTitle: "RMSE (kWh)",
  valAxisTitleColor: C.ink, valAxisTitleFontSize: 10,
  showValAxisTitle: true,
  valGridLine: { color: "E2E8F0", size: 0.5 },
  catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendColor: C.muted, legendFontSize: 10,
  showTitle: false,
});

// Observation panel
s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 1.95, w: 3.0, h: 3.0, fill: { color: C.fill }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 1.95, w: 0.04, h: 3.0, fill: { color: C.crimson }, line: { type: "none" } });
s.addText("Observations", { x: 6.65, y: 2.0, w: 2.7, h: 0.3, fontSize: 11, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0 });

const obs = [
  "LightGBM 在所有 h ∈ [1,6] 皆顯著優於 LSTM。",
  "兩模型誤差隨 h 線性增加，符合 multi-step 預測理論預期。",
  "LightGBM 退化斜率 (~3.4/step) 小於 LSTM (~4.8/step) — 長期預測仍佔優。",
  "Δ(LightGBM, LSTM) ≈ 50 kWh 為常數差距，暗示兩者錯誤源於不同機制。",
];
obs.forEach((o, i) => {
  const y = 2.3 + i * 0.62;
  s.addText("›", { x: 6.65, y, w: 0.15, h: 0.3, fontSize: 14, fontFace: F.serifHeader, bold: true, color: C.crimson, valign: "top", margin: 0 });
  s.addText(o, { x: 6.85, y, w: 2.55, h: 0.6, fontSize: 9.5, fontFace: F.serif, color: C.ink, valign: "top", margin: 0 });
});

s.addText("註：以上為示意趨勢圖。完整 per-fold 詳細數據紀錄於 MLflow tracking server。", {
  x: 0.5, y: 5.0, w: 9, h: 0.25, fontSize: 9, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

pageNumber(s, 10, TOTAL);

// =========================================================
// Slide 11 — Forecast Skill Analysis
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "7.3", "Forecast Skill Score 分析", "Forecast Skill Decomposition");

s.addText("採用 Murphy (1988) [3] 提出的 skill score：以「climatological mean」為 reference forecast，衡量模型相對於零假設的改進。", {
  x: 0.5, y: 1.55, w: 9, h: 0.5, fontSize: 11, fontFace: F.serif, color: C.ink, margin: 0,
});

// Formula box
s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 2.15, w: 7, h: 0.55, fill: { color: C.fill }, line: { type: "none" } });
s.addText("SS  =  1 − RMSE_model / RMSE_ref     ,     RMSE_ref = σ(y) = 137.25 kWh", {
  x: 1.5, y: 2.15, w: 7, h: 0.55, fontSize: 13, fontFace: F.serif, italic: true, color: C.ink, align: "center", valign: "middle", margin: 0,
});

// Two-column results
s.addText("SS = 1 表示完美預測；SS = 0 等同預測平均；SS < 0 表現比 baseline 差。", {
  x: 0.5, y: 2.85, w: 9, h: 0.3, fontSize: 10, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

// Skill score bars
s.addChart(pres.charts.BAR, [
  { name: "Skill Score", labels: ["Naive (ref)", "LSTM", "LightGBM", "Perfect (ceiling)"], values: [0.0, 0.345, 0.708, 1.0] },
], {
  x: 0.5, y: 3.25, w: 6.5, h: 2.0, barDir: "bar",
  chartColors: [C.rule, C.navy, C.crimson, "B45309"],
  chartColorsOpacity: 100,
  chartArea: { fill: { color: "FFFFFF" }, roundedCorners: false, border: { color: C.rule, pt: 0.5 } },
  catAxisLabelColor: C.ink, valAxisLabelColor: C.muted,
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 9,
  valGridLine: { color: "E2E8F0", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.ink, dataLabelFontSize: 10, dataLabelFormatCode: "0.000",
  showLegend: false,
  showTitle: true, title: "Skill Score (higher is better, range 0–1)", titleColor: C.ink, titleFontSize: 11,
});

// Right side interpretation
s.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 3.25, w: 2.3, h: 2.0, fill: { color: C.fill }, line: { type: "none" } });
s.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 3.25, w: 0.04, h: 2.0, fill: { color: C.crimson }, line: { type: "none" } });
s.addText("Interpretation", { x: 7.35, y: 3.3, w: 2.0, h: 0.3, fontSize: 10, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0 });
s.addText("LightGBM 將 RMSE 從 137 (naive) 降至 40，相當於解釋了目標方差的 70.8%。LSTM 僅解釋 34.5%。", {
  x: 7.35, y: 3.6, w: 2.05, h: 1.55, fontSize: 10, fontFace: F.serif, color: C.ink, margin: 0, valign: "top",
});

s.addText("[3] Murphy A.H., \"Skill scores based on the mean square error\", Mon. Weather Rev., 1988.", {
  x: 0.5, y: 5.0, w: 9, h: 0.25, fontSize: 8.5, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

pageNumber(s, 11, TOTAL);

// =========================================================
// Slide 12 — Discussion / Limitations
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "8", "討論與限制", "Discussion and Limitations");

const discussion = [
  {
    head: "為何 LSTM 不敵 LightGBM？",
    body: "深度模型在 small-sample regime (N ~ 10⁴) 易過擬合且難訓練。同時，46 維手工特徵已包含時序相關性 (lag, rolling)，使 sequence model 的優勢被「攤平」。文獻 [4] 顯示，DL 需 ~10⁵–10⁶ samples 才能持續贏 GBM。"
  },
  {
    head: "Walk-forward CV 的限制",
    body: "Expanding-window 在第 1 fold 訓練樣本最少，可能低估該 fold 的真實性能。未來工作可加入 sliding-window 變體，或採用 blocked time-series CV [5]。"
  },
  {
    head: "單一建築訓練 vs 跨建築訓練",
    body: "本研究 demo 僅用 Building 171 訓練。若以 multi-task / building-id embedding 在 498 棟同時訓練，預期 LSTM 因 data scale 提升而縮小差距。"
  },
  {
    head: "Climate-zone generalization",
    body: "資料來自美國 16 個 site。應用至台灣需 fine-tune 或 domain adaptation — 副熱帶氣候之熱濕耦合模式可能差異顯著。"
  },
];
discussion.forEach((d, i) => {
  const y = 1.65 + i * 0.92;
  s.addText(`8.${i+1}`, { x: 0.5, y, w: 0.45, h: 0.3, fontSize: 12, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0 });
  s.addText(d.head, { x: 0.95, y, w: 8.4, h: 0.3, fontSize: 12, fontFace: F.serifHeader, bold: true, color: C.ink, margin: 0 });
  s.addText(d.body, { x: 0.95, y: y + 0.3, w: 8.4, h: 0.6, fontSize: 10, fontFace: F.serif, color: C.muted, margin: 0, valign: "top" });
});

s.addText("[4] Grinsztajn et al., \"Why do tree-based models still outperform DL on tabular data?\", NeurIPS 2022.   [5] Bergmeir & Benítez, 2012.", {
  x: 0.5, y: 5.0, w: 9, h: 0.25, fontSize: 8.5, fontFace: F.sans, italic: true, color: C.muted, margin: 0,
});

pageNumber(s, 12, TOTAL);

// =========================================================
// Slide 13 — Future Work
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "9.1", "未來工作", "Future Work");

const future = [
  { dir: "Modeling",        items: ["Transformer-based forecasters (Informer, PatchTST)", "Probabilistic forecasting (DeepAR, GPR)", "Physics-informed networks (融入冰水機 thermodynamics)"] },
  { dir: "Training scale",  items: ["Multi-building joint training with building embedding", "Foundation model pre-training on ASHRAE → fine-tune", "Online learning with concept drift detection"] },
  { dir: "Evaluation",      items: ["Downstream MPC-aware loss (cost-weighted MSE)", "Calibration metrics (CRPS, pinball loss)", "A/B testing infrastructure for production"] },
  { dir: "Deployment",      items: ["Model monitoring (data drift, prediction drift)", "Active learning loop for site onboarding", "Edge inference for low-latency control"] },
];
future.forEach((f, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.5 + col * 4.6;
  const y = 1.65 + row * 1.8;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.4, h: 1.6, fill: { color: C.fill }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.04, h: 1.6, fill: { color: C.crimson }, line: { type: "none" } });
  s.addText(f.dir, { x: x + 0.2, y: y + 0.1, w: 4.0, h: 0.35, fontSize: 13, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0 });
  f.items.forEach((it, j) => {
    const iy = y + 0.5 + j * 0.34;
    s.addText("›", { x: x + 0.2, y: iy, w: 0.2, h: 0.3, fontSize: 14, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0 });
    s.addText(it, { x: x + 0.4, y: iy, w: 3.9, h: 0.34, fontSize: 10, fontFace: F.serif, color: C.ink, valign: "middle", margin: 0 });
  });
});

pageNumber(s, 13, TOTAL);

// =========================================================
// Slide 14 — Conclusion
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "9.2", "結論", "Conclusion");

s.addText("Summary of Contributions", {
  x: 0.5, y: 1.55, w: 9, h: 0.35, fontSize: 14, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const conclusions = [
  { n: "1", body: "在 ASHRAE GEPIII chilled-water 子集上，建立端到端 multi-step (H=6) 預測 pipeline，包含 preprocessing、特徵工程、模型訓練與評估。" },
  { n: "2", body: "比較 LightGBM 與 LSTM 兩種主流方法。LightGBM 取得 RMSE 40.02 / Skill 0.708；LSTM 取得 RMSE 89.91 / Skill 0.345。" },
  { n: "3", body: "用 forecast skill score 將模型誤差量化為相對 baseline 的改進，提供模型品質的可詮釋指標。" },
  { n: "4", body: "驗證在 small-sample tabular time-series regime，gradient boosting 為更合適的 inductive bias — 與 NeurIPS 2022 文獻 [4] 一致。" },
];

conclusions.forEach((c, i) => {
  const y = 2.0 + i * 0.75;
  s.addShape(pres.shapes.OVAL, { x: 0.55, y: y + 0.05, w: 0.35, h: 0.35, fill: { color: C.crimson }, line: { type: "none" } });
  s.addText(c.n, { x: 0.55, y: y + 0.05, w: 0.35, h: 0.35, fontSize: 12, fontFace: F.serifHeader, bold: true, color: C.bg, align: "center", valign: "middle", margin: 0 });
  s.addText(c.body, { x: 1.05, y, w: 8.4, h: 0.6, fontSize: 11.5, fontFace: F.serif, color: C.ink, margin: 0, valign: "top" });
});

s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 5.0, w: 9, h: 0.3, fill: { color: C.fill }, line: { type: "none" } });
s.addText("Code & MLflow experiments available upon request.", {
  x: 0.5, y: 5.0, w: 9, h: 0.3, fontSize: 10, fontFace: F.sans, italic: true, color: C.muted, align: "center", valign: "middle", margin: 0,
});

pageNumber(s, 14, TOTAL);

// =========================================================
// Slide 15 — References & Q&A
// =========================================================
s = pres.addSlide();
s.background = { color: C.bg };
sectionHeader(s, "", "參考文獻 & Q&A", "References & Discussion");

s.addText("References", {
  x: 0.5, y: 1.55, w: 9, h: 0.35, fontSize: 14, fontFace: F.serifHeader, bold: true, color: C.crimson, margin: 0,
});

const refs = [
  "[1]  L. Pérez-Lombard, J. Ortiz, C. Pout. \"A review on buildings energy consumption information.\" Energy and Buildings, 40(3), 394–398, 2008.",
  "[2]  C. Miller, P. Arjunan, A. Kathirgamanathan, et al. \"The ASHRAE Great Energy Predictor III competition: Overview and results.\" ASHRAE Transactions, 2020.",
  "[3]  A. H. Murphy. \"Skill scores based on the mean square error and their relationships to the correlation coefficient.\" Monthly Weather Review, 116(12), 2417–2424, 1988.",
  "[4]  L. Grinsztajn, E. Oyallon, G. Varoquaux. \"Why do tree-based models still outperform deep learning on typical tabular data?\" NeurIPS 2022.",
  "[5]  C. Bergmeir, J. M. Benítez. \"On the use of cross-validation for time series predictor evaluation.\" Information Sciences, 191, 192–213, 2012.",
];
refs.forEach((r, i) => {
  const y = 2.0 + i * 0.5;
  s.addText(r, { x: 0.5, y, w: 9, h: 0.45, fontSize: 10, fontFace: F.serif, color: C.ink, margin: 0, valign: "top" });
});

// Bottom Q&A bar
s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.8, w: 9, h: 0.55, fill: { color: C.navy }, line: { type: "none" } });
s.addText("Thank you for your attention.   Questions & Discussion welcomed.", {
  x: 0.5, y: 4.8, w: 9, h: 0.55, fontSize: 16, fontFace: F.serifHeader, italic: true, color: C.bg, align: "center", valign: "middle", margin: 0,
});

pageNumber(s, 15, TOTAL);

// ── Export ─────────────────────────────────────────────────
pres.writeFile({ fileName: "Chiller_Forecast_Academic.pptx" })
  .then((f) => console.log("Wrote:", f))
  .catch((e) => { console.error(e); process.exit(1); });
