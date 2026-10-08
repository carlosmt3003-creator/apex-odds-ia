/* =====================================================
   ROULET BANK
   Gestão + simulador estatístico
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const modalRoleta =
    document.getElementById("modalRoleta");

const btnEscolherRoleta =
    document.getElementById("btnEscolherRoleta");

const fecharModal =
    document.getElementById("fecharModal");

const roulettePanel =
    document.getElementById("roulettePanel");

const rouletteName =
    document.getElementById("rouletteName");

const rouletteDescription =
    document.getElementById("rouletteDescription");

const rouletteOptions =
    document.querySelectorAll(".roulette-option");


const bancaAtual =
    document.getElementById("bancaAtual");

const metaFinalDisplay =
    document.getElementById("metaFinalDisplay");

const diasDisplay =
    document.getElementById("diasDisplay");

const metaDiaria =
    document.getElementById("metaDiaria");

const entradaBase =
    document.getElementById("entradaBase");

const stopLoss =
    document.getElementById("stopLoss");

const stopWin =
    document.getElementById("stopWin");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");


const bancaInicialInput =
    document.getElementById("bancaInicial");

const metaFinalInput =
    document.getElementById("metaFinal");

const diasInput =
    document.getElementById("dias");

const salvarConfig =
    document.getElementById("salvarConfig");


const btnDuvidas =
    document.getElementById("btnDuvidas");

const btnColunas =
    document.getElementById("btnColunas");

const btnCurvas =
    document.getElementById("btnCurvas");


const historyInput =
    document.getElementById("historyInput");

const historyCount =
    document.getElementById("historyCount");

const addHistory =
    document.getElementById("addHistory");

const clearHistory =
    document.getElementById("clearHistory");


const analyzeButton =
    document.getElementById("analyzeButton");

const analyzeAgain =
    document.getElementById("analyzeAgain");

const loader =
    document.getElementById("loader");

const result =
    document.getElementById("result");

const loadingStatus =
    document.getElementById("loadingStatus");

const loadingProgress =
    document.getElementById("loadingProgress");

const loadHistory =
    document.getElementById("loadHistory");

const loadCombinations =
    document.getElementById("loadCombinations");

const loadStatistics =
    document.getElementById("loadStatistics");


const resultType =
    document.getElementById("resultType");

const resultCombination =
    document.getElementById("resultCombination");

const analyzedSpins =
    document.getElementById("analyzedSpins");

const combinationCount =
    document.getElementById("combinationCount");

const coverage =
    document.getElementById("coverage");


const resultadoInput =
    document.getElementById("resultado");

const registrarResultado =
    document.getElementById("registrarResultado");

const bankHistory =
    document.getElementById("bankHistory");

const resetAll =
    document.getElementById("resetAll");


/* =====================================================
   ESTADO
===================================================== */

let appData =
    JSON.parse(
        localStorage.getItem("rouletteBankData")
    ) || {

        roulette: null,

        mode: "duzias",

        history: [],

        bank: {

            initial: 200,

            target: 500,

            days: 16,

            current: 200,

            day: 1,

            results: []

        }

    };


/* =====================================================
   GARANTIR ESTRUTURA
===================================================== */

if (!appData.bank) {

    appData.bank = {

        initial: 200,
        target: 500,
        days: 16,
        current: 200,
        day: 1,
        results: []

    };

}


if (!Array.isArray(appData.history)) {

    appData.history = [];

}


if (!Array.isArray(appData.bank.results)) {

    appData.bank.results = [];

}


if (
    ![
        "duzias",
        "colunas",
        "curvas"
    ].includes(appData.mode)
) {

    appData.mode = "duzias";

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveData() {

    localStorage.setItem(
        "rouletteBankData",
        JSON.stringify(appData)
    );

}


/* =====================================================
   DINHEIRO
===================================================== */

function money(value) {

    return Number(value).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   MODAL ROLETA
===================================================== */

btnEscolherRoleta.addEventListener(
    "click",
    () => {

        modalRoleta.classList.add("show");

    }
);


fecharModal.addEventListener(
    "click",
    () => {

        modalRoleta.classList.remove("show");

    }
);


modalRoleta.addEventListener(
    "click",
    event => {

        if (event.target === modalRoleta) {

            modalRoleta.classList.remove("show");

        }

    }
);


/* =====================================================
   ESCOLHER ROLETA
===================================================== */

rouletteOptions.forEach(
    option => {

        option.addEventListener(
            "click",
            () => {

                const roulette =
                    option.dataset.roulette;


                appData.roulette =
                    roulette;


                saveData();


                rouletteName.textContent =
                    roulette;


                if (
                    roulette ===
                    "Roleta Brasileira"
                ) {

                    rouletteDescription.textContent =
                        "Roleta europeia com 37 casas: 0 a 36.";

                }

                else if (
                    roulette ===
                    "Immersive"
                ) {

                    rouletteDescription.textContent =
                        "Mesa Immersive selecionada.";

                }

                else {

                    rouletteDescription.textContent =
                        "Mesa selecionada.";

                }


                roulettePanel.classList.remove(
                    "hidden"
                );


                modalRoleta.classList.remove(
                    "show"
                );

            }
        );

    }
);


/* =====================================================
   BANCA
===================================================== */

function updateBank() {

    const bank =
        appData.bank;


    const profitNeeded =
        bank.target -
        bank.initial;


    const daily =
        profitNeeded /
        bank.days;


    const entry =
        bank.current * 0.02;


    const loss =
        bank.current * 0.05;


    const win =
        Math.max(
            daily,
            bank.current * 0.02
        );


    bancaAtual.textContent =
        money(bank.current);


    metaFinalDisplay.textContent =
        money(bank.target);


    diasDisplay.textContent =
        bank.days;


    metaDiaria.textContent =
        money(daily);


    entradaBase.textContent =
        money(entry);


    stopLoss.textContent =
        money(loss);


    stopWin.textContent =
        money(win);


    let percent =
        (
            (bank.current - bank.initial) /
            (bank.target - bank.initial)
        ) * 100;


    if (!Number.isFinite(percent)) {

        percent = 0;

    }


    percent =
        Math.max(
            0,
            Math.min(100, percent)
        );


    progressBar.style.width =
        `${percent}%`;


    progressText.textContent =
        `${percent.toFixed(1)}% da meta`;


    renderBankHistory();

}


/* =====================================================
   CONFIGURAÇÃO DA BANCA
===================================================== */

salvarConfig.addEventListener(
    "click",
    () => {

        const initial =
            Number(
                bancaInicialInput.value
            );


        const target =
            Number(
                metaFinalInput.value
            );


        const days =
            Number(
                diasInput.value
            );


        if (
            initial <= 0 ||
            target <= initial ||
            days <= 0
        ) {

            alert(
                "Informe valores válidos."
            );

            return;

        }


        appData.bank.initial =
            initial;


        appData.bank.target =
            target;


        appData.bank.days =
            days;


        if (
            appData.bank.results.length === 0
        ) {

            appData.bank.current =
                initial;

        }


        saveData();

        updateBank();

    }
);


/* =====================================================
   MODO DE ANÁLISE
===================================================== */

function setMode(mode) {

    if (
        mode !== "duzias" &&
        mode !== "colunas" &&
        mode !== "curvas"
    ) {

        mode = "duzias";

    }


    appData.mode =
        mode;


    saveData();


    btnDuvidas.classList.toggle(
        "active",
        mode === "duzias"
    );


    btnColunas.classList.toggle(
        "active",
        mode === "colunas"
    );


    btnCurvas.classList.toggle(
        "active",
        mode === "curvas"
    );


    result.classList.add(
        "hidden"
    );

}


btnDuvidas.addEventListener(
    "click",
    () => setMode("duzias")
);


btnColunas.addEventListener(
    "click",
    () => setMode("colunas")
);


btnCurvas.addEventListener(
    "click",
    () => setMode("curvas")
);


/* =====================================================
   COMBINAÇÕES DE DÚZIAS
===================================================== */

const combinationsDuzias = [

    {
        name: "DÚZIA 1 + DÚZIA 2",
        values: [1, 2]
    },

    {
        name: "DÚZIA 1 + DÚZIA 3",
        values: [1, 3]
    },

    {
        name: "DÚZIA 2 + DÚZIA 3",
        values: [2, 3]
    }

];


/* =====================================================
   COMBINAÇÕES DE COLUNAS
===================================================== */

const combinationsColunas = [

    {
        name: "COLUNA 1 + COLUNA 2",
        values: [1, 2]
    },

    {
        name: "COLUNA 1 + COLUNA 3",
        values: [1, 3]
    },

    {
        name: "COLUNA 2 + COLUNA 3",
        values: [2, 3]
    }

];


/* =====================================================
   ORDEM FÍSICA DA ROLETA EUROPEIA
===================================================== */

const europeanWheel = [

    0,
    32,
    15,
    19,
    4,
    21,
    2,
    25,
    17,
    34,
    6,
    27,
    13,
    36,
    11,
    30,
    8,
    23,
    10,
    5,
    24,
    16,
    33,
    1,
    20,
    14,
    31,
    9,
    22,
    18,
    29,
    7,
    28,
    12,
    35,
    3,
    26

];


/* =====================================================
   PEGAR 5 CASAS FÍSICAS
===================================================== */

function getPhysicalNeighbors(
    number,
    radius = 2
) {

    const index =
        europeanWheel.indexOf(number);


    if (index === -1) {

        return [];

    }


    const values = [];


    for (
        let offset = -radius;
        offset <= radius;
        offset++
    ) {

        const position =
            (
                index +
                offset +
                europeanWheel.length
            ) %
            europeanWheel.length;


        values.push(
            europeanWheel[position]
        );

    }


    return values;

}


/* =====================================================
   CRIAR CURVA
===================================================== */

function buildCurveCombination(
    numberA,
    numberB
) {

    const neighborsA =
        getPhysicalNeighbors(
            numberA,
            2
        );


    const neighborsB =
        getPhysicalNeighbors(
            numberB,
            2
        );


    const values =
        [
            ...new Set([
                ...neighborsA,
                ...neighborsB
            ])
        ]
        .filter(
            number => number !== 0
        );


    return {

        name:
            `CURVA ${numberA} + ${numberB}`,

        values,

        base:
            [
                numberA,
                numberB
            ]

    };

}


/* =====================================================
   4 CURVAS SOLICITADAS
===================================================== */

const combinationsCurvas = [

    buildCurveCombination(
        9,
        17
    ),

    buildCurveCombination(
        8,
        18
    ),

    buildCurveCombination(
        26,
        30
    ),

    buildCurveCombination(
        19,
        20
    )

];


/* =====================================================
   MOSTRAR NÚMEROS DA CURVA
===================================================== */

function formatCurveValues(
    values
) {

    return values.join(
        " • "
    );

}


/* =====================================================
   INTERPRETAR NÚMERO
===================================================== */

function getCategory(
    number,
    mode
) {

    if (number === 0) {

        return null;

    }


    if (mode === "duzias") {

        if (number <= 12) {

            return 1;

        }


        if (number <= 24) {

            return 2;

        }


        return 3;

    }


    if (mode === "colunas") {

        return (
            (number - 1) % 3
        ) + 1;

    }


    return null;

}


/* =====================================================
   HISTÓRICO
===================================================== */

function parseHistory() {

    const values =
        historyInput.value
            .trim()
            .split(/\s+/)
            .map(Number)
            .filter(
                number =>
                    Number.isInteger(number) &&
                    number >= 0 &&
                    number <= 36
            );


    return values;

}


function updateHistoryCount() {

    const values =
        parseHistory();


    historyCount.textContent =
        `${values.length} GIROS`;

}


historyInput.addEventListener(
    "input",
    updateHistoryCount
);


addHistory.addEventListener(
    "click",
    () => {

        const values =
            parseHistory();


        if (!values.length) {

            alert(
                "Digite pelo menos um número de 0 a 36."
            );

            return;

        }


        appData.history =
            values;


        saveData();


        historyCount.textContent =
            `${values.length} GIROS`;


        alert(
            `${values.length} giros armazenados.`
        );

    }
);


clearHistory.addEventListener(
    "click",
    () => {

        historyInput.value =
            "";


        appData.history =
            [];


        saveData();


        updateHistoryCount();

    }
);


/* =====================================================
   COBERTURA HISTÓRICA
===================================================== */

function calculateCoverage(
    combination,
    mode,
    history
) {

    if (!history.length) {

        return 0;

    }


    let covered = 0;


    history.forEach(
        number => {

            /*
                CURVAS:
                compara diretamente
                os números físicos.
            */

            if (
                mode === "curvas"
            ) {

                if (
                    combination.values.includes(
                        number
                    )
                ) {

                    covered++;

                }

                return;

            }


            /*
                DÚZIAS / COLUNAS
            */

            const category =
                getCategory(
                    number,
                    mode
                );


            if (
                combination.values.includes(
                    category
                )
            ) {

                covered++;

            }

        }
    );


    return (
        covered /
        history.length
    ) * 100;

}


/* =====================================================
   PROTEÇÃO ZERO
===================================================== */

function createZeroProtection() {

    let zeroProtection =
        document.querySelector(
            ".zero-protection"
        );


    if (!zeroProtection) {

        zeroProtection =
            document.createElement(
                "div"
            );


        zeroProtection.className =
            "zero-protection";


        resultCombination
            .parentElement
            .appendChild(
                zeroProtection
            );

    }


    zeroProtection.innerHTML = `

        <span>
            0
        </span>

        PROTEÇÃO ZERO ATIVA

    `;

}


/* =====================================================
   ANÁLISE
===================================================== */

function startAnalysis() {

    let history =
        appData.history;


    if (!history.length) {

        history =
            parseHistory();

    }


    if (!history.length) {

        alert(
            "Adicione o histórico antes da análise."
        );

        return;

    }


    analyzeButton.classList.add(
        "hidden"
    );


    result.classList.add(
        "hidden"
    );


    loader.classList.remove(
        "hidden"
    );


    loadingProgress.style.width =
        "0%";


    loadHistory.classList.remove(
        "done"
    );


    loadCombinations.classList.remove(
        "done"
    );


    loadStatistics.classList.remove(
        "done"
    );


    let combinations;


    if (
        appData.mode === "duzias"
    ) {

        combinations =
            combinationsDuzias;

    }

    else if (
        appData.mode === "colunas"
    ) {

        combinations =
            combinationsColunas;

    }

    else {

        combinations =
            combinationsCurvas;

    }


    const stages = [

        {
            percent: 25,

            text:
                "Processando histórico...",

            element:
                loadHistory

        },

        {
            percent: 55,

            text:
                "Verificando combinações...",

            element:
                loadCombinations

        },

        {
            percent: 82,

            text:
                "Calculando estatísticas...",

            element:
                loadStatistics

        },

        {
            percent: 100,

            text:
                "Simulação concluída.",

            element:
                null

        }

    ];


    let stage = 0;


    function nextStage() {

        if (
            stage >= stages.length
        ) {

            finishAnalysis(
                history,
                combinations
            );

            return;

        }


        const current =
            stages[stage];


        loadingStatus.textContent =
            current.text;


        loadingProgress.style.width =
            `${current.percent}%`;


        if (current.element) {

            current.element.textContent =
                "✓ " +
                current.element.textContent
                    .replace(/^. /, "")
                    .replace(/^✓ /, "")
                    .replace(/^○ /, "");


            current.element.classList.add(
                "done"
            );

        }


        stage++;


        setTimeout(
            nextStage,
            750
        );

    }


    nextStage();

}


/* =====================================================
   FINALIZAR ANÁLISE
===================================================== */

function finishAnalysis(
    history,
    combinations
) {

    /*
        Escolha aleatória apenas como
        simulação da combinação.
    */

    const randomIndex =
        Math.floor(
            Math.random() *
            combinations.length
        );


    const selected =
        combinations[randomIndex];


    /*
        =================================================
        WIN SIMULADO
        =================================================

        Gera um valor aleatório inteiro
        entre 70% e 88%.

        ATENÇÃO:
        isso NÃO representa a probabilidade
        matemática real da roleta.
    */

    const selectedCoverage =
        Math.floor(
            Math.random() *
            (88 - 70 + 1)
        ) + 70;


    /* =================================================
       TIPO DE ANÁLISE
    ================================================= */

    if (
        appData.mode === "duzias"
    ) {

        resultType.textContent =
            "DÚZIAS";

    }

    else if (
        appData.mode === "colunas"
    ) {

        resultType.textContent =
            "COLUNAS";

    }

    else {

        resultType.textContent =
            "CURVAS";

    }


    /* =================================================
       COMBINAÇÃO ESCOLHIDA
    ================================================= */

    resultCombination.textContent =
        selected.name;


    /* =================================================
       DETALHES DAS CURVAS
    ================================================= */

    if (
        appData.mode === "curvas"
    ) {

        const oldDetails =
            document.querySelector(
                ".curve-values"
            );


        if (oldDetails) {

            oldDetails.remove();

        }


        const details =
            document.createElement(
                "div"
            );


        details.className =
            "curve-values";


        details.textContent =
            formatCurveValues(
                selected.values
            );


        resultCombination
            .parentElement
            .insertBefore(
                details,
                resultCombination
            );

    }


    /* =================================================
       ESTATÍSTICAS
    ================================================= */

    analyzedSpins.textContent =
        history.length;


    combinationCount.textContent =
        combinations.length;


    /*
        Mostra o valor simulado
        entre 70% e 88%.
    */

    coverage.textContent =
        `${selectedCoverage}%`;


    /* =================================================
       ZERO
    ================================================= */

    createZeroProtection();


    /* =================================================
       MOSTRAR RESULTADO
    ================================================= */

    loader.classList.add(
        "hidden"
    );


    result.classList.remove(
        "hidden"
    );


    analyzeButton.classList.remove(
        "hidden"
    );

}


/* =====================================================
   BOTÕES
===================================================== */

analyzeButton.addEventListener(
    "click",
    startAnalysis
);


analyzeAgain.addEventListener(
    "click",
    startAnalysis
);


/* =====================================================
   RESULTADOS DA BANCA
===================================================== */

registrarResultado.addEventListener(
    "click",
    () => {

        const value =
            Number(
                resultadoInput.value
            );


        if (
            !Number.isFinite(value) ||
            value === 0
        ) {

            alert(
                "Digite um resultado diferente de zero."
            );

            return;

        }


        appData.bank.current +=
            value;


        appData.bank.results.push({

            day:
                appData.bank.day,

            result:
                value,

            bank:
                appData.bank.current,

            date:
                new Date()
                    .toLocaleDateString(
                        "pt-BR"
                    )

        });


        appData.bank.day++;


        resultadoInput.value =
            "";


        saveData();

        updateBank();

    }
);


/* =====================================================
   HISTÓRICO DA BANCA
===================================================== */

function renderBankHistory() {

    bankHistory.innerHTML =
        "";


    const results =
        appData.bank.results;


    if (!results.length) {

        bankHistory.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        color:#59677a;
                    "
                >

                    Nenhum resultado registrado.

                </td>

            </tr>

        `;

        return;

    }


    [...results]
        .reverse()
        .forEach(
            item => {

                const row =
                    document.createElement(
                        "tr"
                    );


                let status =
                    "NEUTRO";


                let className =
                    "neutral";


                if (
                    item.result > 0
                ) {

                    status =
                        "LUCRO";

                    className =
                        "profit";

                }


                if (
                    item.result < 0
                ) {

                    status =
                        "PREJUÍZO";

                    className =
                        "loss-text";

                }


                row.innerHTML = `

                    <td>
                        DIA ${item.day}
                    </td>

                    <td class="${className}">

                        ${
                            item.result > 0
                                ? "+"
                                : ""
                        }

                        ${money(item.result)}

                    </td>

                    <td>
                        ${money(item.bank)}
                    </td>

                    <td class="${className}">
                        ${status}
                    </td>

                `;


                bankHistory.appendChild(
                    row
                );

            }
        );

}


/* =====================================================
   RESET
===================================================== */

resetAll.addEventListener(
    "click",
    () => {

        const confirmReset =
            confirm(
                "Apagar toda a banca, histórico e configurações?"
            );


        if (!confirmReset) {

            return;

        }


        localStorage.removeItem(
            "rouletteBankData"
        );


        location.reload();

    }
);


/* =====================================================
   CARREGAR DADOS
===================================================== */

function loadData() {

    bancaInicialInput.value =
        appData.bank.initial;


    metaFinalInput.value =
        appData.bank.target;


    diasInput.value =
        appData.bank.days;


    historyInput.value =
        appData.history.join(
            " "
        );


    historyCount.textContent =
        `${appData.history.length} GIROS`;


    /* =================================================
       ROLETA
    ================================================= */

    if (appData.roulette) {

        const roulette =
            appData.roulette;


        rouletteName.textContent =
            roulette;


        if (
            roulette ===
            "Roleta Brasileira"
        ) {

            rouletteDescription.textContent =
                "Roleta europeia com 37 casas: 0 a 36.";

        }

        else if (
            roulette ===
            "Immersive"
        ) {

            rouletteDescription.textContent =
                "Mesa Immersive selecionada.";

        }

        else {

            rouletteDescription.textContent =
                "Mesa selecionada.";

        }


        roulettePanel.classList.remove(
            "hidden"
        );

    }


    /* =================================================
       MODO
    ================================================= */

    btnDuvidas.classList.toggle(
        "active",
        appData.mode === "duzias"
    );


    btnColunas.classList.toggle(
        "active",
        appData.mode === "colunas"
    );


    btnCurvas.classList.toggle(
        "active",
        appData.mode === "curvas"
    );


    updateBank();

}


/* =====================================================
   INICIAR
===================================================== */

loadData();