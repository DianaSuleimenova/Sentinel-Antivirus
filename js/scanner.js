// ======================================
// Sentinel Antivirus — Scanner
// Эвристический анализ (расширение + имя файла)
// и симуляция процесса сканирования.
// ======================================

const DANGEROUS_EXTENSIONS = [
    "exe", "bat", "cmd", "vbs", "scr", "ps1", "js"
];

const SUSPICIOUS_KEYWORDS = [
    "crack", "keygen", "hack", "virus", "trojan", "ransom"
];

const SCAN_STAGES = [
    "Инициализация движка…",
    "Проверка сигнатур…",
    "Анализ расширения файла…",
    "Проверка имени файла…",
    "Эвристический анализ…",
    "Формирование отчёта…"
];

function getExtension(filename){

    const parts = filename.split(".");

    if(parts.length < 2) return "";

    return parts[parts.length - 1].toLowerCase();

}

function getBaseName(filename){

    const ext = getExtension(filename);

    if(!ext) return filename.toLowerCase();

    return filename.slice(0, filename.length - ext.length - 1).toLowerCase();

}

function formatBytes(bytes){

    if(bytes === 0) return "0 Б";

    const units = ["Б", "КБ", "МБ", "ГБ"];

    const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    const value = bytes / Math.pow(1024, i);

    return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`;

}

// Эвристический анализ одного файла.
// Возвращает объект с вердиктом, оценкой риска и причинами.

function analyzeFile(file){

    const ext = getExtension(file.name);

    const baseName = getBaseName(file.name);

    const reasons = [];

    let score = 0;

    const isDangerousExt = DANGEROUS_EXTENSIONS.includes(ext);

    if(isDangerousExt){

        score += 50;

        reasons.push({

            flag:true,

            text:`Потенциально опасное расширение «.${ext}»`

        });

    }

    const matchedKeywords = SUSPICIOUS_KEYWORDS.filter(
        word => baseName.includes(word)
    );

    matchedKeywords.forEach(word => {

        score += 30;

        reasons.push({

            flag:true,

            text:`Имя файла содержит подозрительное слово «${word}»`

        });

    });

    score = Math.min(score, 100);

    let verdict = "safe";

    if(score >= 50){

        verdict = "dangerous";

    }else if(score > 0){

        verdict = "suspicious";

    }

    if(reasons.length === 0){

        reasons.push({

            flag:false,

            text:"Расширение и имя файла не вызывают подозрений"

        });

    }

    return {

        name:file.name,

        size:file.size,

        ext,

        score,

        verdict,

        reasons

    };

}

// Симулирует процесс сканирования файла с прогрессом и логом.
// callbacks: { onProgress(percent, stageText), onLog(message, type), onComplete(result) }

function scanFile(file, callbacks){

    const result = analyzeFile(file);

    // Длительность зависит от размера файла (в разумных пределах),
    // чтобы сканирование выглядело правдоподобно, а не как фиксированный таймер.
    const sizeFactor = Math.min(Math.log10(file.size + 1024) / 6, 1);

    const totalDuration = 1100 + sizeFactor * 1600;

    const stageCount = SCAN_STAGES.length;

    const stageDuration = totalDuration / stageCount;

    let currentStage = 0;

    function runStage(){

        if(currentStage >= stageCount){

            const logType = result.verdict === "dangerous"
                ? "bad"
                : result.verdict === "suspicious"
                    ? "warn"
                    : "ok";

            const logText = result.verdict === "dangerous"
                ? "Обнаружена угроза"
                : result.verdict === "suspicious"
                    ? "Файл помечен как подозрительный"
                    : "Угроз не обнаружено";

            callbacks.onLog && callbacks.onLog(logText, logType);

            callbacks.onProgress && callbacks.onProgress(100, "Готово");

            setTimeout(() => {

                callbacks.onComplete && callbacks.onComplete(result);

            }, 350);

            return;

        }

        const stageText = SCAN_STAGES[currentStage];

        const percent = Math.round(((currentStage + 1) / stageCount) * 100);

        callbacks.onLog && callbacks.onLog(stageText, "t");

        callbacks.onProgress && callbacks.onProgress(percent, stageText);

        currentStage += 1;

        setTimeout(runStage, stageDuration);

    }

    setTimeout(runStage, 120);

}
