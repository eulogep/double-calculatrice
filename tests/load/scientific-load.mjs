import { evaluateScientificExpression } from '../../scientific.mjs';

const scenarios = [
    ['1 + 1', 2],
    ['2 * (3 + 4)', 14],
    ['(12.5 - 2.5) / 2', 5],
    ['2 ^ 10', 1024],
    ['-5 + 12 * 3', 31],
    ['(2 + 3) ^ 3', 125],
    ['18 / 3 + 7 * 2', 20],
    ['3.5 * 4 - 1.5', 12.5],
    ['((4 + 6) * 2) - 3', 17],
    ['2 ^ 3 ^ 2', 512]
];

const iterations = Number(process.env.LOAD_TEST_ITERATIONS ?? 10000);
const maxDurationMs = Number(process.env.LOAD_TEST_MAX_MS ?? 5000);
const expectedEvaluations = scenarios.length * iterations;
const startedAt = performance.now();
let completedEvaluations = 0;

for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (const [expression, expected] of scenarios) {
        const result = evaluateScientificExpression(expression);
        if (result !== expected) {
            throw new Error(
                `Résultat incorrect pour « ${expression} » : ${result} au lieu de ${expected}`
            );
        }
        completedEvaluations += 1;
    }
}

const durationMs = performance.now() - startedAt;
const evaluationsPerSecond = Math.round((completedEvaluations / durationMs) * 1000);

console.table({
    'Expressions évaluées': completedEvaluations,
    'Durée (ms)': Math.round(durationMs),
    'Évaluations par seconde': evaluationsPerSecond,
    'Seuil maximal (ms)': maxDurationMs
});

if (completedEvaluations !== expectedEvaluations) {
    throw new Error('Le nombre d’évaluations effectuées ne correspond pas à la charge attendue');
}

if (durationMs > maxDurationMs) {
    throw new Error(
        `Le test de charge a dépassé le seuil de ${maxDurationMs} ms (${Math.round(durationMs)} ms)`
    );
}
