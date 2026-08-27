const { chromium } = require('@playwright/test');

module.exports = {
    ci: {
        collect: {
            startServerCommand: 'python3 -u -m http.server 4173 --bind 127.0.0.1',
            startServerReadyPattern: 'Serving HTTP',
            startServerReadyTimeout: 30000,
            url: ['http://127.0.0.1:4173/index.html'],
            numberOfRuns: 1,
            chromePath: chromium.executablePath(),
            settings: {
                onlyCategories: ['performance', 'accessibility'],
                chromeFlags: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        },
        assert: {
            assertions: {
                'categories:performance': ['warn', { minScore: 0.65 }],
                'categories:accessibility': ['error', { minScore: 0.9 }]
            }
        },
        upload: {
            target: 'temporary-public-storage'
        }
    }
};
