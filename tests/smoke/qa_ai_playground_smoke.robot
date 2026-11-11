*** Settings ***
Documentation     Suite de Smoke Test E2E do QA AI Playground utilizando Robot Framework + Playwright (Browser Library).
...               Valida os 3 módulos principais (Smart Data Mock, BDD Test Generator, API Contract Check),
...               créditos do autor e responsividade Mobile-First.
Resource          ../resources/playground.resource
Suite Setup       Abrir QA AI Playground Em Modo Desktop
Suite Teardown    Close Browser

*** Test Cases ***
CT01 - Smoke Test: Layout Base E Assinatura Do Autor Na Sidebar
    [Documentation]    Verifica o carregamento inicial da aplicação, a Sidebar e o link de assinatura do autor.
    [Tags]             smoke    layout    author
    Wait For Elements State    ${SIDEBAR_NAV}    visible
    Wait For Elements State    ${AUTHOR_LINK}    visible
    Get Text                   ${AUTHOR_LINK}    ==    Reginaldo Junior
    Get Attribute              ${AUTHOR_LINK}    target    ==    _blank

CT02 - Smoke Test: Modulo 1 - Smart Data Mocking (Fase 1 & 2)
    [Documentation]    Valida os controles de entrada, templates QA, limpeza, botão de geração e exportação de fixture JSON.
    [Tags]             smoke    smart-data-mock
    Navegar Para Modulo Na Sidebar    Smart Data Mock
    Validar Cabecalho Do Modulo Ativo    Smart Data Mocking

    # Verifica estado inicial do input e editor
    Wait For Elements State    ${MOCK_PROMPT_INPUT}             visible
    Wait For Elements State    span >> text=mock-data.json      visible
    Wait For Elements State    button >> text=Fixture (.json)   visible

    # Testa troca de template QA e botão Limpar
    Click                      button >> text=Checkout & Pagamentos (Limites)
    ${texto_template}=         Get Text    ${MOCK_PROMPT_INPUT}
    Should Contain             ${texto_template}    transações de checkout

    Click                      ${MOCK_CLEAR_BTN}
    Get Text                   ${MOCK_PROMPT_INPUT}    ==    ${EMPTY}

    # Preenche novamente via template e valida seletor de Locale
    Click                      button >> text=Usuários + Edge Cases & Campos Vazios
    Select Options By          ${MOCK_LOCALE_SELECT}    value    en-US
    Select Options By          ${MOCK_LOCALE_SELECT}    value    pt-BR
    Wait For Elements State    ${MOCK_GENERATE_BTN}     enabled

CT03 - Smoke Test: Modulo 2 - BDD Test Generator Multi-Framework (Fase 3)
    [Documentation]    Valida a navegação para o gerador BDD e a adaptação dinâmica de arquivo/extensão para Playwright, Cypress e Robot Framework.
    [Tags]             smoke    bdd-generator
    Navegar Para Modulo Na Sidebar    BDD Test Generator
    Validar Cabecalho Do Modulo Ativo    BDD Test Generator

    # Valida Playwright (.spec.ts) por padrão
    Validar Extensao Do Editor BDD    bdd-test.spec.ts    .spec.ts

    # Alterna para Cypress (.cy.ts)
    Selecionar Framework BDD          Cypress
    Validar Extensao Do Editor BDD    bdd-test.cy.ts      .cy.ts

    # Alterna para Robot Framework (.robot)
    Selecionar Framework BDD          Robot Framework
    Validar Extensao Do Editor BDD    bdd-test.robot      .robot

    # Testa carregamento de template Gherkin
    Click                             button >> text=Adicionar produto ao carrinho
    ${gherkin_text}=                  Get Text    ${BDD_PROMPT_INPUT}
    Should Contain                    ${gherkin_text}    Carrinho de Compras
    Wait For Elements State           ${BDD_GENERATE_BTN}    enabled

CT04 - Smoke Test: Modulo 3 - API Contract Check (Fase 4)
    [Documentation]    Valida o módulo de contrato de API e a troca dinâmica entre Playwright + Zod, Cypress + AJV e Postman (Chai).
    [Tags]             smoke    api-contract
    Navegar Para Modulo Na Sidebar    API Contract Check
    Validar Cabecalho Do Modulo Ativo    API Contract Check

    # Valida Playwright API + Zod (.spec.ts)
    Validar Extensao Do Editor De Contrato API    api-contract.spec.ts    .spec.ts

    # Alterna para Cypress + AJV (.cy.ts)
    Selecionar Framework De Contrato API          Cypress + AJV
    Validar Extensao Do Editor De Contrato API    api-contract.cy.ts      .cy.ts

    # Alterna para Postman (Chai) (.js)
    Selecionar Framework De Contrato API          Postman (Chai)
    Validar Extensao Do Editor De Contrato API    postman-contract.js     .js

    # Testa carregamento de payload de exemplo
    Click                      button >> text=Perfil de Usuário & Roles
    ${json_payload}=           Get Text    ${CONTRACT_JSON_INPUT}
    Should Contain             ${json_payload}    Quality Engineering
    Wait For Elements State    ${CONTRACT_GENERATE_BTN}    enabled

CT05 - Smoke Test: Responsividade Mobile-First (Drawer & Quick Tabs)
    [Documentation]    Redimensiona a viewport para celular (375x812) e valida a navegação Mobile-First (Abas rápidas + Menu Hambúrguer / Drawer).
    [Tags]             smoke    mobile-first    responsive
    Set Viewport Size    ${MOBILE_WIDTH}    ${MOBILE_HEIGHT}

    # Verifica que a barra rápida de abas mobile está visível e funcional
    Wait For Elements State    ${MOBILE_TABLIST}    visible
    Click                      ${MOBILE_TABLIST} >> text=Smart Mock
    Validar Cabecalho Do Modulo Ativo    Smart Data Mocking

    Click                      ${MOBILE_TABLIST} >> text=BDD Gen
    Validar Cabecalho Do Modulo Ativo    BDD Test Generator

    # Abre o Drawer lateral pelo botão Hambúrguer e navega para API Contract Check
    Wait For Elements State    ${MOBILE_MENU_OPEN_BTN}     visible
    Click                      ${MOBILE_MENU_OPEN_BTN}
    Wait For Elements State    ${MOBILE_MENU_CLOSE_BTN}    visible
    Click                      ${SIDEBAR_NAV} >> text=API Contract Check
    Validar Cabecalho Do Modulo Ativo    API Contract Check

