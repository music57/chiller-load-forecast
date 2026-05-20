# Chiller Forecast Demo — Zeabur 部署指南

## 一、本地測試

```bash
# 1. 訓練模型 (一次性，會在 streamlit_demo/models/ 產生模型檔)
cd chiller-forecast
python streamlit_demo/train_holdout.py

# 2. 直接跑 Streamlit (本地開發)
streamlit run streamlit_demo/app.py

# 3. 或用 Docker 跑 (模擬 Zeabur 環境)
docker build -f streamlit_demo/Dockerfile -t chiller-demo .
docker run -p 8501:8501 chiller-demo
```

訪問 http://localhost:8501

---

## 二、推上 Zeabur

### 前置作業

`streamlit_demo/models/` 跟 `streamlit_demo/data/` 兩個資料夾必須有東西（執行 `train_holdout.py` 會自動產生）。

確認以下檔案存在：
- `streamlit_demo/models/lightgbm/`（含 `meta.json` + 6 個 `lgbm_step_*.pkl`）
- `streamlit_demo/models/lstm/lstm_weights.pt` 與 `lstm_meta.json`
- `streamlit_demo/models/feature_columns.json`
- `streamlit_demo/models/split_meta.json`
- `streamlit_demo/data/building_171.parquet`

### 部署方式 A：直接從 GitHub

1. 把整個專案 push 到 GitHub
2. 登入 Zeabur，**New Project → Deploy from GitHub**
3. 選擇本 repo，Zeabur 會偵測到 `streamlit_demo/Dockerfile`
4. **Settings → Build Path**：填 `streamlit_demo/Dockerfile`
   **Context**：填 `.` (專案根目錄，因為 Dockerfile 要 COPY src/)
5. 等 build 完成（~5-10 分鐘，主要是 torch + lightgbm）
6. Zeabur 自動取得網址，點開即可

### 部署方式 B：用 Zeabur CLI

```bash
npm install -g @zeabur/cli
zeabur auth login
zeabur deploy
```

### 環境變數（可選）

目前 app 不需要任何環境變數。Zeabur 預設會 expose port 8501。
若要改 port，修改 `Dockerfile` 的 `EXPOSE` 跟 `--server.port`。

---

## 三、檔案結構

```
chiller-forecast/                ← Docker build context
├── src/                          ← 共用程式碼（會被 COPY 進 image）
│   ├── data/
│   ├── models/
│   └── ...
└── streamlit_demo/
    ├── Dockerfile                ← 用這個 build
    ├── app.py                    ← Streamlit 主程式
    ├── requirements.txt
    ├── zeabur.json
    ├── train_holdout.py          ← 訓練腳本（本地用，不會進 image）
    ├── data/
    │   └── building_171.parquet  ← Demo 資料 (~150 KB)
    └── models/
        ├── lightgbm/             ← Jan-Sep 訓練的 LightGBM
        ├── lstm/                 ← Jan-Sep 訓練的 LSTM
        ├── feature_columns.json  ← 46 個特徵欄位
        └── split_meta.json       ← Train/test 切分資訊
```

---

## 四、Demo 流程（給主管 / 面試官）

打開網址後，從上往下滑：

1. **§1 資料來源** — ASHRAE GEPIII，498 棟建築，4.18M 筆
2. **§2 資料清理** — 4 步前處理流程
3. **§3 機器學習架構** — LightGBM vs LSTM 對比 + held-out RMSE
4. **§4 Live Demo** — 拉時間滑桿，即時看兩個模型預測
5. **§5 商業價值** — 拉日期範圍，看不同情境的電費試算

整段約 5-10 分鐘 demo。

---

## 五、常見問題

**Q: Build 為什麼那麼久？**
- 主要是 PyTorch CPU 版要下載 ~200 MB。第二次 build 會用 cache 快很多。

**Q: Zeabur 的免費方案撐得住嗎？**
- 容器需求約 1.5-2 GB RAM（torch + lightgbm + dataframe in memory）。
- 免費方案有限制，建議選 Pro 或實際測過再 demo。

**Q: 想要更換訓練資料？**
- 改 `train_holdout.py` 裡的 `BUILDING_ID` 跟 `SPLIT_DATE`，重跑一次 push 即可。
