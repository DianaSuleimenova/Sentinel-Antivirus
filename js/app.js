// ======================================
// Sentinel Antivirus — App
// Связывает storage.js, scanner.js и ui.js.
// ======================================

let scanQueue = [];
let isScanning = false;

function enqueueFiles(fileList){

    const files = Array.from(fileList || []);

    if(files.length === 0) return;

    const stats = getStats();

    stats.total += files.length;

    saveStats(stats);

    renderStats(stats);

    scanQueue.push(...files);

    if(!isScanning){

        processNextInQueue();

    }

}

function processNextInQueue(){

    if(scanQueue.length === 0){

        isScanning = false;

        showDropzone();

        return;

    }

    isScanning = true;

    const file = scanQueue.shift();

    showScanning(file);

    scanFile(file, {

        onProgress:updateScanProgress,

        onLog:appendScanLog,

        onComplete:(result) => handleScanComplete(file, result)

    });

}

function handleScanComplete(file, result){

    showVerdict(file, result);

    const stats = getStats();

    stats.scanned += 1;

    if(result.verdict === "safe"){

        stats.safe += 1;

    }else{

        stats.dangerous += 1;

    }

    saveStats(stats);

    renderStats(stats);

    const entry = {

        name:file.name,

        verdict:result.verdict,

        score:result.score,

        sizeText:formatBytes(file.size),

        timeText:new Date().toLocaleString("ru-RU", {

            day:"2-digit",

            month:"2-digit",

            hour:"2-digit",

            minute:"2-digit"

        })

    };

    const history = addHistoryEntry(entry);

    renderHistory(history);

}

// ---------- Drag & Drop / выбор файла ----------

function openFileDialog(){

    fileInput.click();

}

dropzone.addEventListener("click", openFileDialog);

dropzone.addEventListener("keydown", (e) => {

    if(e.key === "Enter" || e.key === " "){

        e.preventDefault();

        openFileDialog();

    }

});

browseBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    openFileDialog();

});

fileInput.addEventListener("change", () => {

    enqueueFiles(fileInput.files);

    fileInput.value = "";

});

["dragenter", "dragover"].forEach(evt => {

    dropzone.addEventListener(evt, (e) => {

        e.preventDefault();

        dropzone.classList.add("is-dragover");

    });

});

["dragleave", "dragend"].forEach(evt => {

    dropzone.addEventListener(evt, (e) => {

        e.preventDefault();

        dropzone.classList.remove("is-dragover");

    });

});

dropzone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropzone.classList.remove("is-dragover");

    enqueueFiles(e.dataTransfer.files);

});

// ---------- Вердикт → следующий файл ----------

scanAnotherBtn.addEventListener("click", processNextInQueue);

// ---------- История ----------

clearHistoryBtn.addEventListener("click", () => {

    clearHistory();

    renderHistory([]);

});

// ---------- Тема ----------

themeToggle.addEventListener("click", toggleUiTheme);

// ---------- Инициализация ----------

function init(){

    initTheme();

    renderStats(getStats());

    renderHistory(getHistory());

    showDropzone();

}

document.addEventListener("DOMContentLoaded", init);
