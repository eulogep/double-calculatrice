import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const rootDirectory = process.cwd();
const reportDirectory = resolve(rootDirectory, 'lighthouse-reports');
const reportBasePath = resolve(reportDirectory, 'index');
const reportJsonPath = `${reportBasePath}.report.json`;
const auditUrl = 'http://127.0.0.1:4173/index.html';
const thresholds = {
    performance: 0.65,
    accessibility: 0.9
};

function run(command, argumentsList, options = {}) {
    return new Promise((resolveProcess, rejectProcess) => {
        const child = spawn(command, argumentsList, { stdio: 'inherit', ...options });
        child.on('error', rejectProcess);
        child.on('exit', (code) => {
            if (code === 0) resolveProcess();
            else rejectProcess(new Error(`${command} a quitté avec le code ${code}.`));
        });
    });
}

async function waitForServer(url, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) return;
        } catch {
            // Le serveur est encore en cours de démarrage.
        }
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
    }
    throw new Error(`Le serveur local n’est pas prêt après ${timeoutMs} ms.`);
}

function startServer() {
    return spawn('python3', ['-u', '-m', 'http.server', '4173', '--bind', '127.0.0.1'], {
        cwd: rootDirectory,
        stdio: 'inherit'
    });
}

function getScore(report, category) {
    const score = report.categories?.[category]?.score;
    if (typeof score !== 'number') {
        throw new Error(`Le score Lighthouse « ${category} » est introuvable.`);
    }
    return score;
}

async function main() {
    await rm(reportDirectory, { recursive: true, force: true });
    await mkdir(reportDirectory, { recursive: true });

    const server = startServer();
    try {
        await waitForServer(auditUrl);
        await run(
            resolve(rootDirectory, 'node_modules/.bin/lighthouse'),
            [
                auditUrl,
                '--only-categories=performance,accessibility',
                '--output=json',
                '--output=html',
                `--output-path=${reportBasePath}`,
                `--chrome-path=${chromium.executablePath()}`,
                '--chrome-flags=--headless --no-sandbox --disable-setuid-sandbox',
                '--quiet',
                '--no-enable-error-reporting'
            ],
            { cwd: rootDirectory }
        );

        if (!existsSync(reportJsonPath)) {
            throw new Error('Le rapport JSON Lighthouse attendu n’a pas été généré.');
        }

        const report = JSON.parse(await readFile(reportJsonPath, 'utf8'));
        if (report.runtimeError) {
            throw new Error(
                `Lighthouse a signalé une erreur d’exécution : ${report.runtimeError.message}`
            );
        }

        const performance = getScore(report, 'performance');
        const accessibility = getScore(report, 'accessibility');
        console.table([
            {
                catégorie: 'Performance',
                score: Math.round(performance * 100),
                seuil: Math.round(thresholds.performance * 100),
                statut: performance >= thresholds.performance ? 'conforme' : 'avertissement'
            },
            {
                catégorie: 'Accessibilité',
                score: Math.round(accessibility * 100),
                seuil: Math.round(thresholds.accessibility * 100),
                statut: accessibility >= thresholds.accessibility ? 'conforme' : 'échec bloquant'
            }
        ]);

        if (performance < thresholds.performance) {
            console.warn(
                `Performance sous le seuil d’avertissement : ${Math.round(performance * 100)}/100 < ${Math.round(thresholds.performance * 100)}/100.`
            );
        }
        if (accessibility < thresholds.accessibility) {
            throw new Error(
                `Accessibilité sous le seuil requis : ${Math.round(accessibility * 100)}/100 < ${Math.round(thresholds.accessibility * 100)}/100.`
            );
        }
    } finally {
        server.kill('SIGTERM');
    }
}

await main();
