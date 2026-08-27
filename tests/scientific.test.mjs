import { evaluateScientificExpression, factorial } from '../scientific.mjs';

describe('factorial', () => {
    test('calcule les cas de base et les valeurs entières', () => {
        expect(factorial(0)).toBe(1);
        expect(factorial(1)).toBe(1);
        expect(factorial(5)).toBe(120);
        expect(factorial(10)).toBe(3628800);
    });

    test('accepte 170 comme limite représentable', () => {
        expect(Number.isFinite(factorial(170))).toBe(true);
        expect(Number.isNaN(factorial(171))).toBe(true);
    });

    test('rejette les valeurs négatives, décimales et non numériques', () => {
        expect(Number.isNaN(factorial(-1))).toBe(true);
        expect(Number.isNaN(factorial(2.5))).toBe(true);
        expect(Number.isNaN(factorial('5'))).toBe(true);
    });
});

describe('evaluateScientificExpression', () => {
    test('évalue les opérations arithmétiques simples', () => {
        expect(evaluateScientificExpression('2 + 3')).toBe(5);
        expect(evaluateScientificExpression('10 - 4')).toBe(6);
        expect(evaluateScientificExpression('6 * 7')).toBe(42);
        expect(evaluateScientificExpression('20 / 5')).toBe(4);
    });

    test('respecte la priorité des opérations et les parenthèses', () => {
        expect(evaluateScientificExpression('2 + 3 * 4')).toBe(14);
        expect(evaluateScientificExpression('(2 + 3) * 4')).toBe(20);
        expect(evaluateScientificExpression('2 ^ 3 ^ 2')).toBe(512);
    });

    test('gère les nombres décimaux et les signes unaires', () => {
        expect(evaluateScientificExpression('-2.5 + .5')).toBe(-2);
        expect(evaluateScientificExpression('-(3 + 2)')).toBe(-5);
        expect(evaluateScientificExpression('2 * -4')).toBe(-8);
    });

    test('refuse la division par zéro', () => {
        expect(() => evaluateScientificExpression('10 / 0')).toThrow('Division par zéro');
    });

    test.each(['', '2 +', '2 ** 3', '2 + alert(1)', 'Math.sqrt(9)', '2..5', '1e3'])(
        'refuse une expression non autorisée : %s',
        (expression) => {
            expect(() => evaluateScientificExpression(expression)).toThrow();
        }
    );
});
