import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import astro from 'eslint-plugin-astro'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['.astro/', '.turbo/', 'dist/', 'node_modules/', 'src/content/']
  },
  js.configs.recommended,
  ts.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.astro']
      }
    }
  },
  prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  }
)
