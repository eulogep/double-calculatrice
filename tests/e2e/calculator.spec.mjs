import { expect, test } from '@playwright/test';

const key = (calculator, value) => calculator.locator(`.key[data-key="${value}"]`);

async function enterOperand(calculator, value) {
    await key(calculator, 'C').click();
    for (const digit of String(value)) {
        await key(calculator, digit).click();
    }
}

test.describe('Calculatrice Pro', () => {
    test('calcule le produit de deux opérandes', async ({ page }) => {
        await page.goto('/index.html');
        const firstCalculator = page.locator('#calc1');
        const secondCalculator = page.locator('#calc2');

        await enterOperand(firstCalculator, 15);
        await enterOperand(secondCalculator, 7);
        await page.locator('.op-btn[data-op="*"]').click();
        await page.locator('#equals').click();

        await expect(page.locator('#result')).toHaveText('105');
    });

    test('exécute une fonction scientifique et efface le résultat', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('.mode-btn[data-mode="scientific"]').click();
        const scientificInput = page.locator('.sci-input');

        await page.locator('.sci-btn[data-key="9"]').click();
        await page.locator('.sci-btn[data-func="sqrt"]').click();
        await expect(scientificInput).toHaveValue('3');

        await page.locator('.sci-btn[data-func="clear"]').click();
        await expect(scientificInput).toHaveValue('0');
    });

    test('convertit une longueur en conservant le résultat affiché', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('.mode-btn[data-mode="converter"]').click();
        await page.locator('#from-value').fill('100');
        await page.locator('#from-value').dispatchEvent('input');

        await expect(page.locator('#from-unit')).toHaveValue('m');
        await expect(page.locator('#to-unit')).toHaveValue('km');
        await expect(page.locator('#to-value')).toHaveValue('0.1');
    });

    test('persiste le thème et l’option d’animation', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('#settings-btn').click();
        await page.locator('#theme-selector').selectOption('dark');
        await page.locator('#animations-enabled').uncheck();
        await page.locator('#save-settings').click();

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
        await expect(page.locator('html')).toHaveClass(/animations-disabled/);
        expect(await page.evaluate(() => localStorage.getItem('calculator-theme'))).toBe('dark');
        expect(await page.evaluate(() => localStorage.getItem('calculator-animations'))).toBe(
            'false'
        );
    });
});
