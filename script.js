
"use strict";

(() => {
    // =========================================
    // CONFIGURAÇÕES
    // =========================================

    const TIME_ZONE = "America/Sao_Paulo";
    const SESSION_STORAGE_KEY = "megaSicBacAnalyzer_sessions_v1";
    const ANALYSIS_STORAGE_KEY = "megaSicBacAnalyzer_analysis_v1";

    const ANALYSIS_DURATION = 15;
    const MAX_HISTORY = 50;

    const SESSIONS = [
        {
            id: 1,
            name: "Manhã",
            start: "09:00",
            end: "09:30"
        },
        {
            id: 2,
            name: "Tarde",
            start: "16:00",
            end: "18:00"
        },
        {
            id: 3,
            name: "Noite",
            start: "23:00",
            end: "23:30"
        }
    ];

    // Cadastre as estratégias quando estiverem definidas.
    
const FIXED_STRATEGIES = [
    "PLAYER OU EMPATE",
    "BANKER OU EMPATE",
    "PLAYER",
    "BANKER"
];

// Gera todas as combinações de 3 números diferentes.
const COMBINATION_STRATEGIES = [];

for (let a = 1; a <= 6; a++) {
    for (let b = a + 1; b <= 6; b++) {
        for (let c = b + 1; c <= 6; c++) {
            COMBINATION_STRATEGIES.push(
                `Entre nos duplos : ${a} - ${b} - ${c}`
            );
        }
    }
}

// Junta as 4 entradas fixas às 20 combinações.
const STRATEGIES = [
    ...FIXED_STRATEGIES,
    ...COMBINATION_STRATEGIES
];


    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    // =========================================
    // ARMAZENAMENTO
    // =========================================

    function loadJSON(key, fallback) {
        try {
            const saved = JSON.parse(localStorage.getItem(key));
            return saved ?? fallback;
        } catch {
            return fallback;
        }
    }

    let sessionData = loadJSON(
        SESSION_STORAGE_KEY,
        { completed: {}, history: [] }
    );

    let analysisHistory = loadJSON(ANALYSIS_STORAGE_KEY, []);

    if (!sessionData || typeof sessionData !== "object") {
        sessionData = { completed: {}, history: [] };
    }

    if (!sessionData.completed || typeof sessionData.completed !== "object") {
        sessionData.completed = {};
    }

    if (!Array.isArray(analysisHistory)) {
        analysisHistory = [];
    }

    function saveSessions() {
        localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(sessionData)
        );
    }

    function saveAnalysisHistory() {
        analysisHistory = analysisHistory.slice(0, MAX_HISTORY);

        localStorage.setItem(
            ANALYSIS_STORAGE_KEY,
            JSON.stringify(analysisHistory)
        );
    }

    // =========================================
    // HORÁRIO DE BRASÍLIA
    // =========================================

    function getBrasiliaNow() {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date());

        const values = {};

        parts.forEach((part) => {
            if (part.type !== "literal") {
                values[part.type] = part.value;
            }
        });

        return {
            date: `${values.year}-${values.month}-${values.day}`,
            hour: Number(values.hour),
            minute: Number(values.minute),
            second: Number(values.second)
        };
    }

    function toSeconds(time) {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 3600 + minutes * 60;
    }

    function formatTime(totalSeconds) {
        const seconds = Math.max(0, Math.ceil(totalSeconds));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return [
            String(hours).padStart(2, "0"),
            String(minutes).padStart(2, "0"),
            String(remainingSeconds).padStart(2, "0")
        ].join(":");
    }

    function getSessionState() {
        const now = getBrasiliaNow();

        const currentSeconds =
            now.hour * 3600 +
            now.minute * 60 +
            now.second;

        const completedToday = sessionData.completed[now.date] || {};

        for (const session of SESSIONS) {
            const start = toSeconds(session.start);
            const end = toSeconds(session.end);

            if (completedToday[session.id]) {
                continue;
            }

            if (currentSeconds >= start && currentSeconds < end) {
                return {
                    status: "active",
                    session,
                    remaining: end - currentSeconds,
                    date: now.date
                };
            }

            if (currentSeconds < start) {
                return {
                    status: "waiting",
                    session,
                    remaining: start - currentSeconds,
                    date: now.date
                };
            }
        }

        return {
            status: "finished",
            session: null,
            remaining: 0,
            date: now.date
        };
    }

    function isSessionActive() {
        return getSessionState().status === "active";
    }

    // =========================================
    // ELEMENTOS DA ANÁLISE
    // =========================================

    const analysisPanel = $("#analysisPanel");
    const analyzeButton = $("#btnAnalyze");
    const analysisStatus = $("#analysisStatus");
    const indicatorText = $("#indicatorText");
    const countdown = $("#analysisCountdown");
    const progressBar = $("#analysisProgressBar");
    const analysisResult = $("#analysisResult");
    const historyList = $("#analysisHistoryList");
    const clearHistoryButton = $("#clearAnalysisHistory");

    let analysisInterval = null;
    let analysisEndAt = 0;

    // =========================================
    // CONTROLE DO BOTÃO ANALISAR
    // =========================================

    function updateAnalyzeButton() {
        if (!analyzeButton) return;

        // Durante uma análise, o botão continua bloqueado.
        if (analysisInterval !== null) {
            analyzeButton.disabled = true;
            analyzeButton.textContent = "ANALISANDO...";
            return;
        }

        const state = getSessionState();
        const active = state.status === "active";

        analyzeButton.disabled = !active;

        if (active) {
            analyzeButton.innerHTML =
                '<span class="analyze-icon">⌕</span>' +
                '<span>ANALISAR ENTRADA</span>' +
                '<span class="button-arrow">→</span>';

            analyzeButton.title =
                `Sessão ${state.session.name} liberada`;
        } else {
            analyzeButton.textContent = "ANÁLISE BLOQUEADA";
            analyzeButton.title =
                "Disponível somente durante as sessões programadas";
        }
    }

    // =========================================
    // ATUALIZAÇÃO DAS SESSÕES
    // =========================================

    function updateSessions() {
        const state = getSessionState();
        const now = getBrasiliaNow();

        const currentSeconds =
            now.hour * 3600 +
            now.minute * 60 +
            now.second;

        $$(".schedule-card").forEach((card, index) => {
            const session = SESSIONS[index];
            if (!session) return;

            const start = toSeconds(session.start);
            const end = toSeconds(session.end);

            const completed =
                sessionData.completed[now.date]?.[session.id] === true;

            let label = "AGUARDANDO";
            let cardStatus = "waiting";

            if (completed) {
                label = "CONCLUÍDA";
                cardStatus = "completed";
            } else if (
                state.status === "active" &&
                state.session.id === session.id
            ) {
                label = "LIBERADA";
                cardStatus = "active";
            } else if (currentSeconds >= end) {
                label = "ENCERRADA";
                cardStatus = "finished";
            } else if (currentSeconds < start) {
                label = "AGUARDANDO";
                cardStatus = "waiting";
            }

            card.dataset.status = cardStatus;
            card.classList.toggle("is-active", cardStatus === "active");
            card.classList.toggle(
                "is-completed",
                cardStatus === "completed"
            );

            const statusElement = card.querySelector(".schedule-status");
            const timeElement = card.querySelector(".schedule-time");

            if (statusElement) {
                statusElement.textContent = label;
            }

            if (timeElement) {
                timeElement.textContent =
                    `${session.start} — ${session.end}`;
            }
        });

        const timerInfo = $(".timer-info");
        const timerDisplay = $(".timer-display");

        if (timerInfo) {
            const paragraph = timerInfo.querySelector("p");

            if (paragraph) {
                if (state.status === "active") {
                    paragraph.textContent =
                        `Sessão ${state.session.name} liberada — Brasília`;
                } else if (state.status === "waiting") {
                    paragraph.textContent =
                        `Próxima sessão: ${state.session.start} — Brasília`;
                } else {
                    paragraph.textContent =
                        "Todas as sessões de hoje foram encerradas.";
                }
            }
        }

        if (timerDisplay) {
            const display = timerDisplay.querySelector("span");

            if (display) {
                display.textContent = formatTime(state.remaining);
            }
        }

        const statusText = $(".system-status span:last-child");

        if (statusText) {
            statusText.textContent =
                state.status === "active"
                    ? "SESSÃO LIBERADA"
                    : state.status === "waiting"
                        ? "AGUARDANDO HORÁRIO"
                        : "SESSÕES ENCERRADAS";
        }

        // Atualiza a data sem substituir o título principal do cartão.
        const dateCard = $(".date-card");

        if (dateCard) {
            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                timeZone: TIME_ZONE,
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }).format(new Date());

            const small = dateCard.querySelector("small");

            if (small) {
                small.textContent =
                    `${formattedDate} · Horário de Brasília`;
            }
        }

        // O botão acompanha o horário real de Brasília.
        updateAnalyzeButton();
    }

    // =========================================
    // ABRIR A PLATAFORMA NO IFRAME
    // =========================================

    const platformUrlInput = $("#platformUrl");
    const openPlatformButton = $(".btn-open");
    const platformFrame = $("#platformFrame");
    const iframePlaceholder = $(".iframe-placeholder");

    function openPlatform() {
        if (!platformUrlInput || !platformFrame) return;

        let url = platformUrlInput.value.trim();

        if (!url) {
            alert("Digite o link da plataforma.");
            platformUrlInput.focus();
            return;
        }

        if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
        }

        try {
            const parsedUrl = new URL(url);

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Endereço inválido");
            }

            platformFrame.src = parsedUrl.href;

            if (iframePlaceholder) {
                iframePlaceholder.style.display = "none";
            }
        } catch {
            alert("Endereço inválido. Exemplo: https://exemplo.com");
        }
    }

    if (openPlatformButton) {
        openPlatformButton.addEventListener("click", openPlatform);
    }

    if (platformUrlInput) {
        platformUrlInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                openPlatform();
            }
        });
    }

    // =========================================
    // RESULTADOS E HISTÓRICO
    // =========================================

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function showWaitingResult(message) {
        if (!analysisResult) return;

        analysisResult.innerHTML = `
            <div class="result-placeholder">
                <span class="placeholder-symbol">✦</span>
                <strong>${escapeHTML(message)}</strong>
               
            </div>
        `;
    }

    function showAnalysisResult(entry, estimate) {
        if (!analysisResult) return;

        analysisResult.innerHTML = `
            <div class="result-content">
                <div class="result-title">Entrada Analisada</div>
                <div class="result-entry">${escapeHTML(entry)}</div>
                <div class="result-meta">Fazer até 2 Gales</div>
                <div class="result-meta">
                    Estimativa de WIN: ${estimate}%
                </div>
                
            </div>
        `;
    }

    function renderAnalysisHistory() {
        if (!historyList) return;

        if (analysisHistory.length === 0) {
            historyList.innerHTML =
                '<p class="history-empty">Nenhuma análise registrada.</p>';
            return;
        }

        historyList.innerHTML = analysisHistory.map((item) => `
            <div class="history-item">
                <strong>${escapeHTML(item.entry)}</strong>
                <span>
                    ${escapeHTML(item.date)} · Até 2 Gales ·
                    Estimativa de WIN ${item.estimate}%
                </span>
            </div>
        `).join("");
    }

    // =========================================
    // ANÁLISE DE 40 SEGUNDOS
    // =========================================

    function finishAnalysis() {
        if (analysisInterval !== null) {
            clearInterval(analysisInterval);
            analysisInterval = null;
        }

        if (analysisPanel) {
            analysisPanel.classList.remove("is-analyzing");
        }

        if (analysisStatus) {
            analysisStatus.textContent = "Análise finalizada";
        }

        if (indicatorText) {
            indicatorText.textContent = "CONCLUÍDO";
        }

        if (countdown) {
            countdown.textContent = "00:00";
        }

        if (progressBar) {
            progressBar.style.width = "100%";
        }

        if (STRATEGIES.length === 0) {
            showWaitingResult(
                "Análise concluída — aguardando cadastro das entradas"
            );

            updateAnalyzeButton();
            return;
        }

        const selected =
            STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];

        const entry = typeof selected === "string"
            ? selected
            : selected.description || selected.name || "Entrada sem descrição";

        const estimate = Math.floor(Math.random() * 19) + 70;

        showAnalysisResult(entry, estimate);

        analysisHistory.unshift({
            entry,
            estimate,
            date: new Intl.DateTimeFormat("pt-BR", {
                timeZone: TIME_ZONE,
                dateStyle: "short",
                timeStyle: "short"
            }).format(new Date())
        });

        saveAnalysisHistory();
        renderAnalysisHistory();
        updateAnalyzeButton();
    }

    function updateAnalysisCountdown() {
        if (analysisInterval === null) return;

        const remaining = Math.max(
            0,
            (analysisEndAt - Date.now()) / 1000
        );

        if (countdown) {
            countdown.textContent = formatTime(remaining);
        }

        if (progressBar) {
            const percentage =
                ((ANALYSIS_DURATION - remaining) / ANALYSIS_DURATION) * 100;

            progressBar.style.width =
                `${Math.min(100, Math.max(0, percentage))}%`;
        }

        if (remaining <= 0) {
            finishAnalysis();
        }
    }

    function startAnalysis() {
        // Verificação de segurança: bloqueia cliques fora da sessão.
        if (!isSessionActive()) {
            updateAnalyzeButton();

            showWaitingResult(
                "Análise bloqueada — aguarde o próximo horário"
            );

            return;
        }

        // Impede iniciar outra análise enquanto uma estiver em andamento.
        if (analysisInterval !== null) return;

        const state = getSessionState();

        // Exige tempo suficiente para concluir os 40 segundos.
        if (state.remaining < ANALYSIS_DURATION) {
            showWaitingResult(
                "Sessão encerrando — aguarde a próxima sessão"
            );

            return;
        }

        if (analysisPanel) {
            analysisPanel.classList.add("is-analyzing");
        }

        if (analyzeButton) {
            analyzeButton.disabled = true;
            analyzeButton.textContent = "ANALISANDO...";
        }

        if (analysisStatus) {
            analysisStatus.textContent = "Análise em andamento";
        }

        if (indicatorText) {
            indicatorText.textContent = "ANALISANDO";
        }

        if (countdown) {
            countdown.textContent = "00:40";
        }

        if (progressBar) {
            progressBar.style.width = "0%";
        }

        showWaitingResult("Análise finalizada. Prepare-se para a próxima rodada.");

        analysisEndAt = Date.now() + ANALYSIS_DURATION * 1000;

        updateAnalysisCountdown();
        analysisInterval = setInterval(updateAnalysisCountdown, 200);

        updateAnalyzeButton();
    }

    if (analyzeButton) {
        // Não liberar o botão manualmente.
        analyzeButton.addEventListener("click", startAnalysis);
    }

    if (clearHistoryButton) {
        clearHistoryButton.addEventListener("click", () => {
            if (!confirm("Deseja apagar o histórico de análises?")) {
                return;
            }

            analysisHistory = [];
            saveAnalysisHistory();
            renderAnalysisHistory();
        });
    }

    // =========================================
    // RESET DAS SESSÕES
    // =========================================

    const resetButton = $(".btn-reset");

    if (resetButton) {
        resetButton.disabled = false;

        resetButton.addEventListener("click", () => {
            if (!confirm(
                "Limpar as sessões concluídas salvas neste navegador?"
            )) {
                return;
            }

            sessionData = {
                completed: {},
                history: []
            };

            saveSessions();
            updateSessions();
        });
    }

    // =========================================
    // INICIALIZAÇÃO
    // =========================================

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            updateSessions();
            updateAnalysisCountdown();
        }
    });

    updateSessions();
    renderAnalysisHistory();

    setInterval(updateSessions, 1000);
})();
