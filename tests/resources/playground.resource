*** Settings ***
Documentation     Keywords e Page Objects reutilizáveis do QA AI Playground (Robot Framework + Playwright Browser Library).
Library           Browser

*** Variables ***
${BASE_URL}                 http://localhost:4173
${HEADLESS}                 ${True}
${DESKTOP_WIDTH}            1280
${DESKTOP_HEIGHT}           800
${MOBILE_WIDTH}             375
${MOBILE_HEIGHT}            812

# Seletores Globais & Layout
${SIDEBAR_NAV}              nav[aria-label="Navegação Principal"]
${AUTHOR_LINK}              aside a[href="https://reginalddev.github.io/HomePage/"]
${MOBILE_MENU_OPEN_BTN}     button[aria-label="Abrir menu de módulos"]
${MOBILE_MENU_CLOSE_BTN}    button[aria-label="Fechar menu de navegação"]
${MOBILE_TABLIST}           div[role="tablist"][aria-label="Troca rápida de módulos QA"]

# Seletores Módulo 1: Smart Data Mocking
${MOCK_PROMPT_INPUT}        id=qa-prompt-input
${MOCK_LOCALE_SELECT}       id=locale-select
${MOCK_GENERATE_BTN}        button[type="submit"] >> text=Gerar Dados
${MOCK_CLEAR_BTN}           button >> text=Limpar

# Seletores Módulo 2: BDD Test Generator
${BDD_PROMPT_INPUT}         id=bdd-gherkin-input
${BDD_FRAMEWORK_GROUP}      div[role="group"][aria-label="Framework de Automação"]
${BDD_GENERATE_BTN}         button[type="submit"] >> text=Gerar Automação

# Seletores Módulo 3: API Contract Check
${CONTRACT_JSON_INPUT}      id=api-contract-json-input
${CONTRACT_FW_SELECT}       id=contract-framework-select
${CONTRACT_GENERATE_BTN}    button[type="submit"] >> text=Gerar Teste de Contrato

*** Keywords ***
Abrir QA AI Playground Em Modo Desktop
    New Browser    chromium    headless=${HEADLESS}
    New Context    viewport={'width': ${DESKTOP_WIDTH}, 'height': ${DESKTOP_HEIGHT}}
    New Page       ${BASE_URL}
    Get Title      ==    QA AI Playground — DevTools Suite
    Wait For Elements State    text=QA AI Playground    visible    timeout=10s

Navegar Para Modulo Na Sidebar
    [Arguments]    ${nome_modulo}
    Click    ${SIDEBAR_NAV} >> text=${nome_modulo}

Validar Cabecalho Do Modulo Ativo
    [Arguments]    ${titulo_esperado}
    Wait For Elements State    h1 >> text=${titulo_esperado}    visible    timeout=5s

Selecionar Framework BDD
    [Arguments]    ${framework}
    Click    ${BDD_FRAMEWORK_GROUP} >> button >> text=${framework}

Validar Extensao Do Editor BDD
    [Arguments]    ${arquivo_esperado}    ${extensao_download}
    Wait For Elements State    span >> text=${arquivo_esperado}               visible    timeout=5s
    Wait For Elements State    button >> text=Download (${extensao_download})    visible    timeout=5s

Selecionar Framework De Contrato API
    [Arguments]    ${framework}
    Select Options By    ${CONTRACT_FW_SELECT}    value    ${framework}

Validar Extensao Do Editor De Contrato API
    [Arguments]    ${arquivo_esperado}    ${extensao_download}
    Wait For Elements State    span >> text=${arquivo_esperado}               visible    timeout=5s
    Wait For Elements State    button >> text=Download (${extensao_download})    visible    timeout=5s

