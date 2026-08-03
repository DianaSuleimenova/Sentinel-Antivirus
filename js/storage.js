// ======================================
// Sentinel Antivirus — Storage
// Обёртка над localStorage: история сканирований,
// статистика и сохранённая тема оформления.
// ======================================

const STORAGE_KEYS = {
    history: "sentinel_history",
    stats: "sentinel_stats",
    theme: "sentinel_theme"
};

const DEFAULT_STATS = {
    total: 0,
    scanned: 0,
    dangerous: 0,
    safe: 0
};

function getHistory(){

    try{

        const raw = localStorage.getItem(STORAGE_KEYS.history);

        return raw ? JSON.parse(raw) : [];

    }catch(e){

        console.warn("Sentinel: не удалось прочитать историю", e);

        return [];

    }

}

function addHistoryEntry(entry){

    const history = getHistory();

    history.unshift(entry);

    // ограничиваем историю последними 50 записями
    const trimmed = history.slice(0, 50);

    try{

        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(trimmed));

    }catch(e){

        console.warn("Sentinel: не удалось сохранить историю", e);

    }

    return trimmed;

}

function clearHistory(){

    try{

        localStorage.removeItem(STORAGE_KEYS.history);

    }catch(e){

        console.warn("Sentinel: не удалось очистить историю", e);

    }

}

function getStats(){

    try{

        const raw = localStorage.getItem(STORAGE_KEYS.stats);

        return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS };

    }catch(e){

        console.warn("Sentinel: не удалось прочитать статистику", e);

        return { ...DEFAULT_STATS };

    }

}

function saveStats(stats){

    try{

        localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));

    }catch(e){

        console.warn("Sentinel: не удалось сохранить статистику", e);

    }

}

function resetStatsAndHistory(){

    clearHistory();

    saveStats({ ...DEFAULT_STATS });

}

function getSavedTheme(){

    try{

        return localStorage.getItem(STORAGE_KEYS.theme);

    }catch(e){

        return null;

    }

}

function saveTheme(theme){

    try{

        localStorage.setItem(STORAGE_KEYS.theme, theme);

    }catch(e){

        console.warn("Sentinel: не удалось сохранить тему", e);

    }

}
