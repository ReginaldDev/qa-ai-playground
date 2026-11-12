import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// Mock leve do Monaco Editor para ambiente JSDOM (testes unitários e de componentes rápidos)
vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    language,
  }: {
    value: string;
    language: string;
  }) =>
    React.createElement('textarea', {
      'data-testid': 'monaco-editor-mock',
      'data-language': language,
      readOnly: true,
      value,
    }),
}));

// Mock da Clipboard API e URL.createObjectURL para testes de exportação/cópia
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-blob');
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}

