
"use strict";

/* ==========================================
   SELETORES
========================================== */

const $ = selector => document.querySelector(selector);


/* ==========================================
   CONFIGURAÇÕES
========================================== */

const CONFIG = {
    colorAnalysis: 10000,
    colorCooldown: 40000
};


/* ==========================================
   ENTRADAS DE CORES
========================================== */

const colorEntries = [
    "VISITANTE OU EMPATE",
    "MANDANTE OU EMPATE",
    "VISITANTE",
    "VISITANTE +1.5",
    "VISITANTE +3.5",
    "MANDANTE",
    "MANDANTE +1.5",
    "MANDANTE +3.5"
];


/* ==========================================
   ESTADO DO SISTEMA
========================================== */

let savedHistory = [];

try {
    savedHistory = JSON.parse(
        localStorage.getItem("megaHistory") || "[]"
    );

    if (!Array.isArray(savedHistory)) {
        savedHistory = [];
    }
} catch {
    savedHistory = [];
}

const state = {
    colors: {
        running: false,
        blockedUntil: 0,
        timer: null,
        cooldownTimer: null
    },

    sound: false,
    audio: null,
    history: savedHistory
};


/* ==========================================
   EVENTOS SEGUROS
========================================== */

function on(selector, event, callback) {
    const element = $(selector);

    if (element) {
        element.addEventListener(event, callback);
    }
}


/* ==========================================
   SISTEMA DE SOM
========================================== */

function playSound(frequency = 600) {
    if (!state.sound) return;

    try {
        state.audio ||= new AudioContext();

        const oscillator = state.audio.createOscillator();
        const gain = state.audio.createGain();

        oscillator.frequency.value = frequency;
        gain.gain.value = 0.05;

        oscillator.connect(gain);
        gain.connect(state.audio.destination);

        oscillator.start();
        oscillator.stop(state.audio.currentTime + 0.12);

    } catch (error) {
        console.warn("Áudio indisponível.");
    }
}


/* ==========================================
   HISTÓRICO
========================================== */

function saveHistory(type, result) {
    const item = {
        type,
        result,
        date: new Date().toLocaleString("pt-BR")
    };

    state.history.unshift(item);

    state.history = state.history.slice(0, 40);

    localStorage.setItem(
        "megaHistory",
        JSON.stringify(state.history)
    );

    renderHistory();
}


function renderHistory() {
    const container = $("#historyList");

    if (!container) return;

    if (!state.history.length) {
        container.textContent = "Nenhum registro disponível.";
        return;
    }

    container.innerHTML = state.history.map(item => {
        const result = String(item.result || "").toUpperCase();

        const isGreen = result.includes("GREEN");
        const isRed = result.includes("RED");

        let statusClass = "";

        if (isGreen) {
            statusClass = "history-green";
        } else if (isRed) {
            statusClass = "history-red";
        }

        return `
            <div class="history-item ${statusClass}">
                <div class="history-info">
                    <strong>${escapeHTML(item.type)}</strong>

                    <div class="history-date">
                        ${escapeHTML(item.date)}
                    </div>
                </div>

                <strong class="history-result">
                    ${escapeHTML(item.result)}
                </strong>
            </div>
        `;
    }).join("");
}


/* ==========================================
   PROTEÇÃO DE TEXTO HTML
========================================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


/* ==========================================
   SISTEMA DE ANÁLISE
========================================== */

function runAnalysis(config) {
    const {
        key,
        duration,
        cooldown,
        button,
        status,
        progress,
        countdown,
        callback
    } = config;

    if (!button || !status || !progress || !countdown) {
        return;
    }

    const system = state[key];

    if (!system) return;

    if (system.running || Date.now() < system.blockedUntil) {
        return;
    }

    system.running = true;

    button.disabled = true;

    const started = Date.now();
    const ends = started + duration;

    status.textContent = "Processamento em andamento...";

    progress.style.width = "0%";

    countdown.textContent = "";

    playSound(500);

    clearInterval(system.timer);

    system.timer = setInterval(() => {
        const remaining = Math.max(0, ends - Date.now());

        const percent = Math.min(
            100,
            ((duration - remaining) / duration) * 100
        );

        progress.style.width = percent + "%";

        status.textContent =
            `Analisando... ${Math.ceil(remaining / 1000)}s`;

        if (remaining <= 0) {
            clearInterval(system.timer);

            system.timer = null;

            try {
                callback();
            } finally {
                system.running = false;

                system.blockedUntil = Date.now() + cooldown;

                playSound(850);

                startCooldown({
                    system,
                    button,
                    countdown,
                    status,
                    progress
                });
            }
        }

    }, 100);
}


/* ==========================================
   TEMPO DE BLOQUEIO
========================================== */

function startCooldown({
    system,
    button,
    countdown,
    status,
    progress
}) {
    const update = () => {
        const remaining = Math.max(
            0,
            system.blockedUntil - Date.now()
        );

        if (remaining <= 0) {
            clearInterval(system.cooldownTimer);

            system.cooldownTimer = null;

            button.disabled = false;

            countdown.textContent = "";

            status.textContent = "Sistema disponível";

            progress.style.width = "0%";

            playSound(700);

            return;
        }

        button.disabled = true;

        countdown.textContent =
            `NOVAMENTE EM ${Math.ceil(remaining / 1000)} SEGUNDOS`;
    };

    update();

    clearInterval(system.cooldownTimer);

    system.cooldownTimer = setInterval(update, 200);
}


/* ==========================================
   ANÁLISE DE CORES
========================================== */

on("#colorButton", "click", () => {
    runAnalysis({
        key: "colors",

        duration: CONFIG.colorAnalysis,

        cooldown: CONFIG.colorCooldown,

        button: $("#colorButton"),

        status: $("#colorStatus"),

        progress: $("#colorProgress"),

        countdown: $("#colorCountdown"),

        callback: () => {
            const entry = colorEntries[
                Math.floor(Math.random() * colorEntries.length)
            ];

            const percentage = Math.floor(Math.random() * 18) + 80;

            const resultElement = $("#colorResult");

            if (!resultElement) return;

            resultElement.textContent = entry;

            resultElement.classList.remove(
                "home-color",
                "away-color",
                "draw-color",
                "banker-color",
                "player-color"
            );

            if (entry.includes("MANDANTE")) {
                resultElement.classList.add("home-color");

            } else if (entry.includes("VISITANTE")) {
                resultElement.classList.add("away-color");

            } else if (entry.includes("EMPATE")) {
                resultElement.classList.add("draw-color");
            }

            const percentageElement = $("#colorPercentage");

            if (percentageElement) {
                percentageElement.textContent = percentage + "%";
            }

            saveHistory("CORES", entry);

            const status = $("#colorStatus");

            if (status) {
                status.textContent = "Análise concluída";
            }
        }
    });
});


/* ==========================================
   ÁREA DO JOGO — IFRAME
========================================== */

on("#toggleGame", "click", () => {
    const card = $("#gameCard");
    const button = $("#toggleGame");

    if (!card || !button) return;

    card.classList.toggle("expanded");

    button.textContent = card.classList.contains("expanded")
        ? "Recolher"
        : "Expandir";
});


/* ==========================================
   CARREGAR CONFIGURAÇÕES
========================================== */

function loadSettings() {
    const theme = localStorage.getItem("megaTheme") || "dark";

    const sound = localStorage.getItem("megaSound") === "true";

    const iframe = localStorage.getItem("megaIframe") || "";

    const themeToggle = $("#themeToggle");
    const soundToggle = $("#soundToggle");
    const iframeInput = $("#iframeUrl");

    document.body.classList.toggle("light", theme === "light");

    if (themeToggle) {
        themeToggle.checked = theme === "dark";
    }

    if (soundToggle) {
        soundToggle.checked = sound;
    }

    if (iframeInput) {
        iframeInput.value = iframe;
    }

    state.sound = sound;

    if (iframe) {
        loadIframe(iframe);
    }
}


/* ==========================================
   CONFIGURAR IFRAME
========================================== */

function loadIframe(url) {
    try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
            throw new Error("Endereço inválido");
        }

        const frame = $("#gameFrame");
        const card = $("#gameCard");

        if (!frame || !card) return;

        frame.src = parsed.href;

        card.classList.add("has-frame");

    } catch {
        alert("Informe um endereço HTTP ou HTTPS válido.");
    }
}


/* ==========================================
   SALVAR CONFIGURAÇÕES
========================================== */

on("#saveSettings", "click", () => {
    const themeToggle = $("#themeToggle");
    const soundToggle = $("#soundToggle");
    const iframeInput = $("#iframeUrl");

    const theme = themeToggle
        ? (themeToggle.checked ? "dark" : "light")
        : "dark";

    const sound = soundToggle
        ? soundToggle.checked
        : false;

    const iframe = iframeInput
        ? iframeInput.value.trim()
        : "";

    localStorage.setItem("megaTheme", theme);

    localStorage.setItem("megaSound", sound);

    localStorage.setItem("megaIframe", iframe);

    document.body.classList.toggle("light", theme === "light");

    state.sound = sound;

    if (iframe) {
        loadIframe(iframe);
    }

    playSound(750);
});


/* ==========================================
   ABRIR CONFIGURAÇÕES
========================================== */

on("#settingsButton", "click", () => {
    const settings = $("#configuracoes");

    if (settings) {
        settings.scrollIntoView({
            behavior: "smooth"
        });
    }
});


/* ==========================================
   LIMPAR HISTÓRICO
========================================== */

on("#clearHistory", "click", () => {
    if (!confirm("Deseja limpar todo o histórico?")) {
        return;
    }

    state.history = [];

    localStorage.removeItem("megaHistory");

    renderHistory();
});


/* ==========================================
   REGISTRO MANUAL GREEN E RED
========================================== */

function registerManualResult(result) {
    const resultElement = $("#colorResult");

    if (!resultElement) return;

    const name = resultElement.textContent.trim();

    if (
        !name ||
        name === "AGUARDANDO"
    ) {
        alert("Realize uma análise antes de registrar o resultado.");

        return;
    }

    saveHistory("CORES", `${result} - ${name}`);

    playSound(result === "GREEN" ? 850 : 350);
}


/* ==========================================
   BOTÕES GREEN E RED
========================================== */

on("#colorGreen", "click", () => {
    registerManualResult("GREEN");
});

on("#colorRed", "click", () => {
    registerManualResult("RED");
});


/* ==========================================
   INICIALIZAÇÃO
========================================== */

renderHistory();

loadSettings();
