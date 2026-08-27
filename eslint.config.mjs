import eslint from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: ['node_modules/**', 'coverage/**', 'dist/**']
    },
    eslint.configs.recommended,
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                AdvancedFeatures: 'readonly',
                Chart: 'readonly',
                CustomizationFeatures: 'readonly',
                IntersectionObserver: 'readonly',
                StatisticsFeatures: 'readonly',
                particlesJS: 'readonly',
                SpeechRecognition: 'readonly',
                webkitSpeechRecognition: 'readonly'
            }
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }]
        }
    },
    {
        files: ['tests/**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.jest
            }
        }
    }
];
