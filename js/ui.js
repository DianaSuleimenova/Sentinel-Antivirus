// ======================================
// Sentinel Antivirus — UI
// Отрисовка состояний интерфейса.
// ======================================

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");

const scanStatus = document.getElementById("scanStatus");
const scanFileName = document.getElementById("scanFileName");
const scanFileSize = document.getElementById("scanFileSize");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const progressStage = document.getElementById("progressStage");
const scanLog = document.getElementById("scanLog");

const verdictCard = document.getElementById("verdictCard");
const verdictIcon = document.getElementById("verdictIcon");
const verdictTitle = document.getElementById("verdictTitle");
const verdictFile = document.getElementById("verdictFile");
const riskScoreValue = document.getElementById("riskScoreValue");
const riskScoreFill = document.getElementById("riskScoreFill");
const verdictReasons = document.getElementById("verdictReasons");
const scanAnotherBtn = document.getElementById("scanAnotherBtn");

const statTotal = document.getElementById("statTotal");
const statScanned = document.getElementById("statScanned");
const statDangerous = document.getElementById("statDangerous");
const statSafe = document.getElementById("statSafe");

const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const themeToggle = document.getElementById("themeToggle");

const VERDICT_LABELS = {
    safe:"Safe",
    suspicious:"Suspicious",
    dangerous:"Dangerous"
};

const VERDICT_ICONS = {
    safe:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5L9.5 17L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    suspicious:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 4L21 20H3L12 4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>',
    dangerous:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

function escapeHtml(str){

    const div = document.createElement("div");

    div.textContent = str;

    return div.innerHTML;

}

// ---------- Состояния панели сканера ----------

function showDropzone(){

    dropzone.hidden = false;

    scanStatus.hidden = true;

    verdictCard.hidden = true;

    scanLog.innerHTML = "";

}

function showScanning(file){

    dropzone.hidden = true;

    scanStatus.hidden = false;

    verdictCard.hidden = true;

    scanFileName.textContent = file.name;

    scanFileSize.textContent = formatBytes(file.size);

    progressFill.style.width = "0%";

    progressPercent.textContent = "0%";

    progressStage.textContent = "Инициализация…";

    scanLog.innerHTML = "";

}

function updateScanProgress(percent, stageText){

    progressFill.style.width = `${percent}%`;

    progressPercent.textContent = `${percent}%`;

    progressStage.textContent = stageText;

}

function appendScanLog(message, type){

    const line = document.createElement("div");

    line.className = "scan-log-line";

    const time = new Date().toLocaleTimeString("ru-RU", {

        hour:"2-digit",

        minute:"2-digit",

        second:"2-digit"

    });

    line.innerHTML = `<span class="t">[${time}]</span><span class="${type}">${escapeHtml(message)}</span>`;

    scanLog.appendChild(line);

    scanLog.scrollTop = scanLog.scrollHeight;

}

function showVerdict(file, result){

    dropzone.hidden = true;

    scanStatus.hidden = true;

    verdictCard.hidden = false;

    verdictCard.className = `verdict-card is-${result.verdict}`;

    verdictIcon.innerHTML = VERDICT_ICONS[result.verdict];

    verdictTitle.textContent = VERDICT_LABELS[result.verdict];

    verdictFile.textContent = file.name;

    riskScoreValue.textContent = `${result.score}/100`;

    riskScoreFill.style.width = `${result.score}%`;

    const barColor = result.verdict === "dangerous"
        ? "var(--danger)"
        : result.verdict === "suspicious"
            ? "var(--warn)"
            : "var(--accent)";

    riskScoreFill.style.background = barColor;

    verdictReasons.innerHTML = "";

    result.reasons.forEach(reason => {

        const li = document.createElement("li");

        li.className = reason.flag ? "reason-flag" : "";

        li.textContent = `${reason.flag ? "⚠" : "✓"} ${reason.text}`;

        verdictReasons.appendChild(li);

    });

}

// ---------- Статистика ----------

function renderStats(stats){

    statTotal.textContent = stats.total;

    statScanned.textContent = stats.scanned;

    statDangerous.textContent = stats.dangerous;

    statSafe.textContent = stats.safe;

}

// ---------- История ----------

function renderHistory(history){

    historyList.querySelectorAll(".history-item").forEach(el => el.remove());

    if(history.length === 0){

        historyEmpty.hidden = false;

        return;

    }

    historyEmpty.hidden = true;

    history.forEach(entry => {

        const item = document.createElement("div");

        item.className = `history-item verdict-${entry.verdict}`;

        item.title = `${VERDICT_LABELS[entry.verdict]} • риск ${entry.score}/100`;

        item.innerHTML = `
            <span class="history-item-dot"></span>
            <div class="history-item-info">
                <div class="history-item-name">${escapeHtml(entry.name)}</div>
                <div class="history-item-meta">${entry.sizeText} • ${entry.timeText}</div>
            </div>
        `;

        historyList.appendChild(item);

    });

}

// ---------- Тема ----------

function applyTheme(theme){

    document.documentElement.setAttribute("data-theme", theme);

    saveTheme(theme);

}

function initTheme(){

    const saved = getSavedTheme();

    const prefersLight = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;

    const theme = saved || (prefersLight ? "light" : "dark");

    document.documentElement.setAttribute("data-theme", theme);

}

function toggleUiTheme(){

    const current = document.documentElement.getAttribute("data-theme");

    applyTheme(current === "dark" ? "light" : "dark");

}
