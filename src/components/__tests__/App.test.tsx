import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('App & Módulos QA — Testes de Componentes e Navegação', () => {
  beforeEach(() => {
    render(<App />);
  });

  it('deve renderizar a Sidebar com a assinatura do autor Reginaldo Junior e link seguro', () => {
    const authorLink = screen.getByRole('link', { name: /Reginaldo Junior/i });
    expect(authorLink).toBeInTheDocument();
    expect(authorLink).toHaveAttribute('href', 'https://reginalddev.github.io/HomePage/');
    expect(authorLink).toHaveAttribute('target', '_blank');
    expect(authorLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('deve iniciar no módulo Smart Data Mocking e permitir limpar ou aplicar templates QA', () => {
    expect(
      screen.getByRole('heading', { name: /Smart Data Mocking/i })
    ).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Descrição da Massa de Dados/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Gere apenas 3 registros');

    const clearBtn = screen.getByRole('button', { name: /Limpar/i });
    fireEvent.click(clearBtn);
    expect(textarea.value).toBe('');

    const checkoutPresetBtn = screen.getByRole('button', {
      name: /Checkout & Pagamentos \(Limites\)/i,
    });
    fireEvent.click(checkoutPresetBtn);
    expect(textarea.value).toContain('Gere apenas 3 registros de transações de checkout');
  });

  it('deve navegar para o BDD Test Generator e alternar extensões entre Playwright, Cypress e Robot Framework', () => {
    const bddNavBtn = screen.getByRole('button', { name: /BDD Test Generator/i });
    fireEvent.click(bddNavBtn);

    expect(
      screen.getByRole('heading', { name: /BDD Test Generator/i })
    ).toBeInTheDocument();

    // Padrão inicial: Playwright (.spec.ts)
    expect(screen.getByText('bdd-test.spec.ts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download \(\.spec\.ts\)/i })).toBeInTheDocument();

    // Alterna para Cypress (.cy.ts)
    fireEvent.click(screen.getByRole('button', { name: 'Cypress' }));
    expect(screen.getByText('bdd-test.cy.ts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download \(\.cy\.ts\)/i })).toBeInTheDocument();

    // Alterna para Robot Framework (.robot)
    fireEvent.click(screen.getByRole('button', { name: 'Robot Framework' }));
    expect(screen.getByText('bdd-test.robot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download \(\.robot\)/i })).toBeInTheDocument();
  });

  it('deve navegar para o API Contract Check e adaptar o editor conforme o Framework de Validação', () => {
    const contractNavBtn = screen.getByRole('button', { name: /API Contract Check/i });
    fireEvent.click(contractNavBtn);

    expect(
      screen.getByRole('heading', { name: /API Contract Check/i })
    ).toBeInTheDocument();

    const select = screen.getByLabelText(/Framework de Validação/i);

    // Padrão: Playwright API + Zod (.spec.ts)
    expect(screen.getByText('api-contract.spec.ts')).toBeInTheDocument();

    // Alterna para Cypress + AJV (.cy.ts)
    fireEvent.change(select, { target: { value: 'Cypress + AJV' } });
    expect(screen.getByText('api-contract.cy.ts')).toBeInTheDocument();

    // Alterna para Postman (Chai) (.js)
    fireEvent.change(select, { target: { value: 'Postman (Chai)' } });
    expect(screen.getByText('postman-contract.js')).toBeInTheDocument();
    const editor = screen.getByTestId('monaco-editor-mock');
    expect(editor).toHaveAttribute('data-language', 'javascript');
  });

  it('deve permitir navegação rápida através das abas Mobile-First no Header', () => {
    const mobileBddTab = screen.getByRole('tab', { name: /BDD Gen/i });
    fireEvent.click(mobileBddTab);
    expect(
      screen.getByRole('heading', { name: /BDD Test Generator/i })
    ).toBeInTheDocument();

    const mobileContractTab = screen.getByRole('tab', { name: /API Contract/i });
    fireEvent.click(mobileContractTab);
    expect(
      screen.getByRole('heading', { name: /API Contract Check/i })
    ).toBeInTheDocument();
  });
});

