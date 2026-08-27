import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourcePath = resolve(process.cwd(), 'main.js');
const applyChanges = process.argv.includes('--apply');
const checkOnly = !applyChanges || process.argv.includes('--check');

if (process.argv.slice(2).some((argument) => !['--apply', '--check'].includes(argument))) {
    throw new Error('Usage : node scripts/refactor-sonar-js.mjs [--check] [--apply]');
}

function replaceSection(source, { label, appliedMarker, startMarker, endMarker, replacement }) {
    if (source.includes(appliedMarker)) {
        return { source, status: `${label} déjà appliqué` };
    }

    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker, start);

    if (start === -1 || end === -1 || end <= start) {
        throw new Error(`Section introuvable ou inattendue : ${label}`);
    }

    return {
        source: `${source.slice(0, start)}${replacement}${source.slice(end)}`,
        status: `${label} prêt à être appliqué`
    };
}

const sections = [
    {
        label: 'Raccourcis clavier',
        appliedMarker: '    isEditableKeyboardTarget(target) {',
        startMarker: '    bindKeyboardEvents() {',
        endMarker: '\n\n    // Méthodes de calcul',
        replacement: `    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            const { key } = event;
            const shortcutKey = key.toLowerCase();
            if (this.isEditableKeyboardTarget(event.target)) return;

            this.handleStandardKeyboardInput(key);

            if (event.ctrlKey) {
                event.preventDefault();
                this.handleControlShortcut(shortcutKey);
            }

            this.handleModeKeyboardShortcut(shortcutKey, event.ctrlKey);
        });
    }

    isEditableKeyboardTarget(target) {
        return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
    }

    handleStandardKeyboardInput(key) {
        if (/[0-9.]/.test(key)) {
            this.handleKeyPress(key, this.currentField);
            return;
        }

        if (['+', '-', '*', '/'].includes(key)) {
            this.selectedOperator = key;
            this.updateOperatorButtons();
            return;
        }

        if (key === 'Enter' || key === '=') {
            this.calculateStandard();
            return;
        }

        if (key === 'Escape') {
            this.clearAll();
            return;
        }

        if (key === 'Backspace') {
            this.handleKeyPress('Del', this.currentField);
        }
    }

    handleControlShortcut(key) {
        const shortcuts = {
            s: () => this.saveState(),
            l: () => this.loadState(),
            e: () => this.exportData(),
            d: () => this.toggleTheme(),
            m: () => this.switchMode('scientific'),
            f: () => this.switchMode('financial'),
            c: () => this.switchMode('converter'),
            h: () => this.toggleHistory(),
            1: () => this.switchMode('standard'),
            2: () => this.switchMode('scientific'),
            3: () => this.switchMode('financial'),
            4: () => this.switchMode('converter')
        };
        shortcuts[key]?.();
    }

    handleModeKeyboardShortcut(key, hasControlKey) {
        if (this.currentMode === 'scientific') {
            this.handleScientificKeyboardShortcut(key, hasControlKey);
        }

        if (this.currentMode === 'financial') {
            this.handleFinancialKeyboardShortcut(key);
        }
    }

    handleScientificKeyboardShortcut(key, hasControlKey) {
        if (hasControlKey) return;

        const functions = {
            s: 'sin',
            c: 'cos',
            t: 'tan',
            l: 'log',
            n: 'ln',
            r: 'sqrt',
            a: 'abs',
            p: 'pi',
            e: 'e'
        };
        const func = functions[key];
        if (func) this.handleScientificFunction(func);
    }

    handleFinancialKeyboardShortcut(key) {
        const functions = {
            v: 'pv',
            f: 'fv',
            p: 'pmt',
            r: 'rate',
            n: 'nper',
            i: 'irr',
            w: 'npv',
            o: 'roi'
        };
        const func = functions[key];
        if (func) this.calculateFinancial(func);
    }`
    },
    {
        label: 'Calculs financiers',
        appliedMarker: '    getFinancialParameters() {',
        startMarker: '    calculateFinancial(func) {',
        endMarker: '\n\n    // Méthodes de conversion',
        replacement: `    calculateFinancial(func) {
        const parameters = this.getFinancialParameters();
        const result = this.calculateFinancialResult(func, parameters);

        if (!Number.isFinite(result)) {
            this.finInput.value = 'Erreur';
            this.showNotification('Paramètres financiers incompatibles ou incomplets.');
            return;
        }

        const formattedResult = this.formatNumber(result);
        this.finInput.value = formattedResult;
        this.addToHistory(\`Fin: \${func.toUpperCase()} = \${formattedResult}\`);
    }

    getFinancialParameters() {
        const readValue = (input) => Number.parseFloat(input?.value);
        const values = [
            readValue(this.finInputs.pv),
            readValue(this.finInputs.rate),
            readValue(this.finInputs.nper),
            readValue(this.finInputs.pmt)
        ].map((value) => (Number.isFinite(value) ? value : 0));
        const [initialCapital, annualRate, periods, payment] = values;
        const monthlyRate = annualRate / 100 / 12;
        const totalPeriods = periods * 12;

        return {
            initialCapital,
            payment,
            monthlyRate,
            totalPeriods,
            annuityFactor: this.calculateAnnuityFactor(monthlyRate, totalPeriods)
        };
    }

    calculateAnnuityFactor(monthlyRate, totalPeriods) {
        if (monthlyRate === 0) return totalPeriods;
        return (1 - Math.pow(1 + monthlyRate, -totalPeriods)) / monthlyRate;
    }

    calculateFinancialResult(func, parameters) {
        const calculators = {
            pv: () => parameters.payment * parameters.annuityFactor,
            fv: () => this.calculateFutureValue(parameters),
            pmt: () => this.calculatePayment(parameters),
            rate: () => this.calculateCashFlowRate(parameters, 12),
            nper: () => this.calculatePeriodCount(parameters),
            irr: () => this.calculateCashFlowRate(parameters, 1),
            npv: () => parameters.initialCapital + parameters.payment * parameters.annuityFactor,
            roi: () => this.calculateReturnOnInvestment(parameters),
            compound: () =>
                parameters.initialCapital * Math.pow(1 + parameters.monthlyRate, parameters.totalPeriods),
            simple: () =>
                parameters.initialCapital * (1 + parameters.monthlyRate * parameters.totalPeriods)
        };
        const calculator = calculators[func];
        return calculator ? calculator() : Number.NaN;
    }

    calculateFutureValue({ initialCapital, payment, monthlyRate, totalPeriods }) {
        const paymentFactor =
            monthlyRate === 0
                ? totalPeriods
                : (Math.pow(1 + monthlyRate, totalPeriods) - 1) / monthlyRate;
        return initialCapital * Math.pow(1 + monthlyRate, totalPeriods) + payment * paymentFactor;
    }

    calculatePayment({ initialCapital, monthlyRate, totalPeriods }) {
        if (monthlyRate === 0) {
            if (totalPeriods === 0) return Number.NaN;
            return initialCapital / totalPeriods;
        }

        const paymentFactor =
            (Math.pow(1 + monthlyRate, totalPeriods) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, totalPeriods));
        return initialCapital / paymentFactor;
    }

    calculateCashFlowRate({ initialCapital, payment, totalPeriods }, annualizationMultiplier) {
        if (totalPeriods <= 0 || initialCapital + payment * totalPeriods <= 0) {
            return Number.NaN;
        }

        const periodicRate =
            Math.pow(
                (initialCapital + payment * totalPeriods) / Math.max(initialCapital, Number.EPSILON),
                1 / totalPeriods
            ) - 1;
        return periodicRate * annualizationMultiplier * 100;
    }

    calculatePeriodCount({ initialCapital, payment, monthlyRate }) {
        if (monthlyRate === 0) {
            if (payment === 0) return Number.NaN;
            return -initialCapital / payment;
        }

        return Math.log(payment / (payment - initialCapital * monthlyRate)) / Math.log(1 + monthlyRate);
    }

    calculateReturnOnInvestment({ initialCapital, payment, totalPeriods }) {
        if (initialCapital === 0) return Number.NaN;
        return ((payment * totalPeriods - initialCapital) / Math.abs(initialCapital)) * 100;
    }`
    },
    {
        label: 'Gestion des touches standard',
        appliedMarker: '    clearCalculatorInput(input) {',
        startMarker: '    handleKeyPress(key, input) {',
        endMarker: '\n\n    handleScientificKeyPress',
        replacement: `    handleKeyPress(key, input) {
        if (!key || !input) return;

        const specialKeyHandlers = {
            C: () => this.clearCalculatorInput(input),
            Del: () => this.deleteCalculatorDigit(input),
            '±': () => this.toggleCalculatorSign(input),
            '%': () => this.convertCalculatorPercentage(input)
        };
        const specialKeyHandler = specialKeyHandlers[key];
        if (specialKeyHandler) {
            specialKeyHandler();
            return;
        }

        if (key === '.' && input.value.includes('.')) return;
        input.value = input.value === '0' && key !== '.' ? key : input.value + key;
    }

    clearCalculatorInput(input) {
        input.value = '0';
        if (this.resultElt) this.resultElt.textContent = '0';
    }

    deleteCalculatorDigit(input) {
        input.value = input.value.length > 1 ? input.value.slice(0, -1) : '0';
    }

    toggleCalculatorSign(input) {
        input.value = input.value.startsWith('-') ? input.value.slice(1) : \`-\${input.value}\`;
    }

    convertCalculatorPercentage(input) {
        input.value = this.formatNumber(Number.parseFloat(input.value) / 100);
    }`
    }
];

let source = await readFile(sourcePath, 'utf8');
const results = [];
for (const section of sections) {
    const result = replaceSection(source, section);
    source = result.source;
    results.push(result.status);
}

console.log(results.map((status) => `• ${status}`).join('\n'));
const hasPendingChanges = results.some((status) => status.endsWith('prêt à être appliqué'));

if (checkOnly) {
    console.log(
        '\nAucun fichier n’a été modifié. Relancez avec --apply pour écrire les changements.'
    );
    process.exit(0);
}

if (!hasPendingChanges) {
    console.log(`\nAucune réécriture nécessaire : ${sourcePath} est déjà conforme au refactoring.`);
    process.exit(0);
}

const temporaryPath = `${sourcePath}.tmp`;
await writeFile(temporaryPath, source);
await rename(temporaryPath, sourcePath);
console.log(
    `\nRefactoring appliqué à ${sourcePath}. Vérifiez ensuite le diff et exécutez la suite de tests.`
);
