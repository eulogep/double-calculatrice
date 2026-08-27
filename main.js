// Configuration globale
import { evaluateScientificExpression, factorial } from './scientific.mjs';

const CONFIG = {
    decimalPrecision: 2,
    animationsEnabled: true,
    theme: 'auto',
    maxHistoryItems: 50
};

// Classes principales
class Calculator {
    constructor() {
        this.currentMode = 'standard';
        this.history = [];
        this.currentExpression = '';
        this.memory = 0;
        this.lastResult = 0;
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.initializeChart();
        this.loadHistory();
    }

    initializeElements() {
        // Éléments de base
        this.operand1 = document.querySelector('#calc1 .operand');
        this.operand2 = document.querySelector('#calc2 .operand');
        this.resultElt = document.querySelector('#result');
        this.equalsBtn = document.querySelector('#equals');
        this.operatorBtns = document.querySelectorAll('.op-btn');

        // Éléments scientifiques
        this.sciInput = document.querySelector('.sci-input');
        this.sciExpression = document.querySelector('.sci-expression');

        // Éléments financiers
        this.finInput = document.querySelector('.fin-input');
        this.finInputs = {
            pv: document.querySelector('#pv-input'),
            rate: document.querySelector('#rate-input'),
            nper: document.querySelector('#nper-input'),
            pmt: document.querySelector('#pmt-input')
        };

        // Éléments convertisseur
        this.converterInputs = {
            fromValue: document.querySelector('#from-value'),
            toValue: document.querySelector('#to-value'),
            fromUnit: document.querySelector('#from-unit'),
            toUnit: document.querySelector('#to-unit'),
            conversionType: document.querySelector('#conversion-type')
        };

        // Panneau d'historique
        this.historyPanel = document.querySelector('.history-panel');
        this.historyList = document.querySelector('.history-list');
        this.historyChart = document.querySelector('#history-chart');

        // Modal de paramètres
        this.settingsModal = document.querySelector('#settings-modal');

        // Variables d'état
        this.currentField = this.operand1;
        this.selectedOperator = '+';
        this.sciExpression = '';
        this.sciResult = 0;
    }

    bindEvents() {
        // Gestion du thème
        this.bindThemeEvents();

        // Gestion des modes
        this.bindModeEvents();

        // Gestion des calculatrices standard
        this.bindStandardCalculatorEvents();

        // Gestion de la calculatrice scientifique
        this.bindScientificCalculatorEvents();

        // Gestion de la calculatrice financière
        this.bindFinancialCalculatorEvents();

        // Gestion du convertisseur
        this.bindConverterEvents();

        // Gestion de l'historique
        this.bindHistoryEvents();

        // Gestion des paramètres
        this.bindSettingsEvents();

        // Gestion des actions
        this.bindActionEvents();

        // Gestion du clavier
        this.bindKeyboardEvents();
    }

    bindThemeEvents() {
        const themeToggle = document.querySelector('#theme-toggle');
        const themeSelector = document.querySelector('#theme-selector');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
    }

    bindModeEvents() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        const calculatorModes = document.querySelectorAll('.calculator-mode');

        modeBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);

                // Mise à jour des boutons
                modeBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                // Mise à jour des modes
                calculatorModes.forEach((m) => m.classList.remove('active'));
                const targetMode = document.querySelector(`#${mode}-mode`);
                if (targetMode) targetMode.classList.add('active');
            });
        });
    }

    bindStandardCalculatorEvents() {
        // Sélection de l'opérateur
        this.operatorBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                this.selectedOperator = btn.dataset.op;
                this.operatorBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Clic sur "="
        if (this.equalsBtn) {
            this.equalsBtn.addEventListener('click', () => {
                this.calculateStandard();
            });
        }

        // Claviers numériques
        ['#calc1', '#calc2'].forEach((calcId) => {
            const container = document.querySelector(calcId);
            if (!container) return;

            const input = container.querySelector('.operand');
            if (!input) return;

            container.addEventListener('click', () => {
                this.currentField = input;
            });

            container.querySelectorAll('.key').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleKeyPress(btn.dataset.key, input);
                });
            });
        });
    }

    bindScientificCalculatorEvents() {
        const sciKeypad = document.querySelector('.sci-keypad');
        if (!sciKeypad) return;

        sciKeypad.addEventListener('click', (e) => {
            if (e.target.classList.contains('sci-btn')) {
                const key = e.target.dataset.key;
                const func = e.target.dataset.func;

                if (key) {
                    this.handleScientificKeyPress(key);
                } else if (func) {
                    this.handleScientificFunction(func);
                }
            }
        });
    }

    bindFinancialCalculatorEvents() {
        const finBtns = document.querySelectorAll('.fin-btn');

        finBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const func = btn.dataset.func;
                this.calculateFinancial(func);
            });
        });
    }

    bindConverterEvents() {
        // Changement de type de conversion
        if (this.converterInputs.conversionType) {
            this.converterInputs.conversionType.addEventListener('change', () => {
                this.updateConverterUnits();
            });
        }

        // Changement de valeur
        if (this.converterInputs.fromValue) {
            this.converterInputs.fromValue.addEventListener('input', () => {
                this.convert();
            });
        }

        // Changement d'unité
        if (this.converterInputs.fromUnit) {
            this.converterInputs.fromUnit.addEventListener('change', () => {
                this.convert();
            });
        }

        if (this.converterInputs.toUnit) {
            this.converterInputs.toUnit.addEventListener('change', () => {
                this.convert();
            });
        }

        // Bouton d'échange
        const swapBtn = document.querySelector('#swap-btn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                this.swapConverterUnits();
            });
        }
    }

    bindHistoryEvents() {
        // Bouton pour effacer l'historique
        const clearHistoryBtn = document.querySelector('#clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }
    }

    bindSettingsEvents() {
        // Bouton des paramètres
        const settingsBtn = document.querySelector('#settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        const saveSettingsBtn = document.querySelector('#save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
                this.hideSettings();
            });
        }

        // Fermeture de la modal
        const modalClose = document.querySelector('#settings-modal .modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideSettings();
            });
        }

        // Clic en dehors de la modal
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.hideSettings();
                }
            });
        }
    }

    bindActionEvents() {
        // Sauvegarde
        const saveBtn = document.querySelector('#save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveState();
            });
        }

        // Chargement
        const loadBtn = document.querySelector('#load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadState();
            });
        }

        // Export
        const exportBtn = document.querySelector('#export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Partage
        const shareBtn = document.querySelector('#share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareCalculator();
            });
        }

        // Statistiques
        const statsBtn = document.querySelector('#stats-btn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                if (this.statisticsFeatures) {
                    this.statisticsFeatures.displayStatistics();
                }
            });
        }

        // Reconnaissance vocale
        const voiceBtn = document.querySelector('#voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.initializeVoiceRecognition();
            });
        }

        // Aide
        const helpBtn = document.querySelector('#help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }

        // Démo
        const demoBtn = document.querySelector('#demo-btn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.startDemo();
            });
        }
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            const isEditable =
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) ||
                e.target.isContentEditable;
            if (isEditable) return;

            const key = e.key;

            // Nombres et opérateurs
            if (/[0-9.]/.test(key)) {
                this.handleKeyPress(key, this.currentField);
            } else if (['+', '-', '*', '/'].includes(key)) {
                this.selectedOperator = key;
                this.updateOperatorButtons();
            } else if (key === 'Enter' || key === '=') {
                this.calculateStandard();
            } else if (key === 'Escape') {
                this.clearAll();
            } else if (key === 'Backspace') {
                this.handleKeyPress('Del', this.currentField);
            }

            // Raccourcis clavier avancés
            if (e.ctrlKey) {
                e.preventDefault();
                switch (key) {
                    case 's':
                        this.saveState();
                        break;
                    case 'l':
                        this.loadState();
                        break;
                    case 'e':
                        this.exportData();
                        break;
                    case 'd':
                        this.toggleTheme();
                        break;
                    case 'm':
                        this.switchMode('scientific');
                        break;
                    case 'f':
                        this.switchMode('financial');
                        break;
                    case 'c':
                        this.switchMode('converter');
                        break;
                    case 'h':
                        this.toggleHistory();
                        break;
                    case '1':
                        this.switchMode('standard');
                        break;
                    case '2':
                        this.switchMode('scientific');
                        break;
                    case '3':
                        this.switchMode('financial');
                        break;
                    case '4':
                        this.switchMode('converter');
                        break;
                }
            }

            // Raccourcis pour les fonctions scientifiques
            if (this.currentMode === 'scientific') {
                switch (key) {
                    case 's':
                        if (!e.ctrlKey) this.handleScientificFunction('sin');
                        break;
                    case 'c':
                        if (!e.ctrlKey) this.handleScientificFunction('cos');
                        break;
                    case 't':
                        if (!e.ctrlKey) this.handleScientificFunction('tan');
                        break;
                    case 'l':
                        if (!e.ctrlKey) this.handleScientificFunction('log');
                        break;
                    case 'n':
                        if (!e.ctrlKey) this.handleScientificFunction('ln');
                        break;
                    case 'r':
                        if (!e.ctrlKey) this.handleScientificFunction('sqrt');
                        break;
                    case 'a':
                        if (!e.ctrlKey) this.handleScientificFunction('abs');
                        break;
                    case 'p':
                        if (!e.ctrlKey) this.handleScientificFunction('pi');
                        break;
                    case 'e':
                        if (!e.ctrlKey) this.handleScientificFunction('e');
                        break;
                }
            }

            // Raccourcis pour les fonctions financières
            if (this.currentMode === 'financial') {
                switch (key) {
                    case 'v':
                        this.calculateFinancial('pv');
                        break;
                    case 'f':
                        this.calculateFinancial('fv');
                        break;
                    case 'p':
                        this.calculateFinancial('pmt');
                        break;
                    case 'r':
                        this.calculateFinancial('rate');
                        break;
                    case 'n':
                        this.calculateFinancial('nper');
                        break;
                    case 'i':
                        this.calculateFinancial('irr');
                        break;
                    case 'w':
                        this.calculateFinancial('npv');
                        break;
                    case 'o':
                        this.calculateFinancial('roi');
                        break;
                }
            }
        });
    }

    // Méthodes de calcul
    calculateStandard() {
        const op1 = Number.parseFloat(this.operand1?.value);
        const op2 = Number.parseFloat(this.operand2?.value);
        const firstOperand = Number.isFinite(op1) ? op1 : 0;
        const secondOperand = Number.isFinite(op2) ? op2 : 0;
        let result;

        switch (this.selectedOperator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '-':
                result = firstOperand - secondOperand;
                break;
            case '*':
                result = firstOperand * secondOperand;
                break;
            case '/':
                if (secondOperand === 0) {
                    this.displayResult('Erreur');
                    this.showNotification('Impossible de diviser par zéro.');
                    return;
                }
                result = firstOperand / secondOperand;
                break;
            case '^':
                result = Math.pow(firstOperand, secondOperand);
                break;
            case '√':
                if (firstOperand < 0) {
                    this.displayResult('Erreur');
                    this.showNotification('La racine carrée d’un nombre négatif est indéfinie.');
                    return;
                }
                result = Math.sqrt(firstOperand);
                break;
            default:
                result = firstOperand + secondOperand;
        }

        if (!Number.isFinite(result)) {
            this.displayResult('Erreur');
            this.showNotification('Le résultat n’est pas représentable.');
            return;
        }

        const formattedResult = this.formatNumber(result);
        const expression = `${firstOperand} ${this.selectedOperator} ${secondOperand}`;
        this.displayResult(formattedResult);
        this.addToHistory(`${expression} = ${formattedResult}`);

        if (this.statisticsFeatures) {
            this.statisticsFeatures.addCalculation(expression, formattedResult);
        }
    }

    calculateScientific() {
        const expression = this.sciExpression.replace(/×/g, '*').replace(/÷/g, '/').trim();

        try {
            const result = evaluateScientificExpression(expression);
            if (!Number.isFinite(result)) throw new Error('Résultat invalide');

            this.sciResult = this.formatNumber(result);
            this.sciInput.value = this.sciResult;
            this.sciExpression = String(this.sciResult);
            this.addToHistory(`Sci: ${expression} = ${this.sciResult}`);
        } catch {
            this.sciInput.value = 'Erreur';
            this.sciExpression = '';
            this.showNotification('Expression scientifique invalide.');
        }
    }

    calculateFinancial(func) {
        const readValue = (input) => Number.parseFloat(input?.value);
        const pv = readValue(this.finInputs.pv);
        const rate = readValue(this.finInputs.rate);
        const nper = readValue(this.finInputs.nper);
        const pmt = readValue(this.finInputs.pmt);
        const values = [pv, rate, nper, pmt].map((value) => (Number.isFinite(value) ? value : 0));
        const [initialCapital, annualRate, periods, payment] = values;

        const r = annualRate / 100 / 12; // Taux mensuel
        const n = periods * 12; // Nombre de périodes mensuelles
        const annuityFactor = r === 0 ? n : (1 - Math.pow(1 + r, -n)) / r;

        let result;

        switch (func) {
            case 'pv':
                result = payment * annuityFactor;
                break;
            case 'fv':
                result =
                    initialCapital * Math.pow(1 + r, n) +
                    payment * (r === 0 ? n : (Math.pow(1 + r, n) - 1) / r);
                break;
            case 'pmt':
                result =
                    r === 0
                        ? n === 0
                            ? NaN
                            : initialCapital / n
                        : initialCapital / ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
                break;
            case 'rate':
                result =
                    n > 0 && initialCapital + payment * n > 0
                        ? (Math.pow(
                              (initialCapital + payment * n) /
                                  Math.max(initialCapital, Number.EPSILON),
                              1 / n
                          ) -
                              1) *
                          12 *
                          100
                        : NaN;
                break;
            case 'nper':
                result =
                    r === 0
                        ? payment === 0
                            ? NaN
                            : -initialCapital / payment
                        : Math.log(payment / (payment - initialCapital * r)) / Math.log(1 + r);
                break;
            case 'irr':
                result =
                    n > 0 && initialCapital + payment * n > 0
                        ? (Math.pow(
                              (initialCapital + payment * n) /
                                  Math.max(initialCapital, Number.EPSILON),
                              1 / n
                          ) -
                              1) *
                          100
                        : NaN;
                break;
            case 'npv':
                result = initialCapital + payment * annuityFactor;
                break;
            case 'roi':
                result =
                    initialCapital === 0
                        ? NaN
                        : ((payment * n - initialCapital) / Math.abs(initialCapital)) * 100;
                break;
            case 'compound':
                result = initialCapital * Math.pow(1 + r, n);
                break;
            case 'simple':
                result = initialCapital * (1 + r * n);
                break;
            default:
                result = NaN;
        }

        if (!Number.isFinite(result)) {
            this.finInput.value = 'Erreur';
            this.showNotification('Paramètres financiers incompatibles ou incomplets.');
            return;
        }

        const formattedResult = this.formatNumber(result);
        this.finInput.value = formattedResult;
        this.addToHistory(`Fin: ${func.toUpperCase()} = ${formattedResult}`);
    }

    // Méthodes de conversion
    convert() {
        const value = parseFloat(this.converterInputs.fromValue.value) || 0;
        const fromUnit = this.converterInputs.fromUnit.value;
        const toUnit = this.converterInputs.toUnit.value;
        const type = this.converterInputs.conversionType.value;

        const result = this.performConversion(value, fromUnit, toUnit, type);
        this.converterInputs.toValue.value = this.formatNumber(result);
    }

    performConversion(value, fromUnit, toUnit, type) {
        const conversions = {
            length: {
                m: 1,
                km: 1000,
                cm: 0.01,
                mm: 0.001,
                mi: 1609.34,
                yd: 0.9144,
                ft: 0.3048,
                in: 0.0254
            },
            weight: {
                kg: 1,
                g: 0.001,
                mg: 0.000001,
                lb: 0.453592,
                oz: 0.0283495
            },
            temperature: {
                C: (val) => val,
                F: (val) => ((val - 32) * 5) / 9,
                K: (val) => val - 273.15
            },
            area: {
                m2: 1,
                km2: 1000000,
                cm2: 0.0001,
                ha: 10000,
                ac: 4046.86
            },
            volume: {
                m3: 1,
                l: 0.001,
                ml: 0.000001,
                gal: 0.00378541
            }
        };

        const conv = conversions[type];
        if (!conv || !(fromUnit in conv) || !(toUnit in conv)) return value;

        if (type === 'temperature') {
            // Conversion spéciale pour la température
            const toCelsius = conv[fromUnit](value);
            const fromCelsius = (temp) => {
                if (toUnit === 'F') return (temp * 9) / 5 + 32;
                if (toUnit === 'K') return temp + 273.15;
                return temp;
            };
            return fromCelsius(toCelsius);
        } else {
            // Conversion standard
            const baseValue = value * conv[fromUnit];
            return baseValue / conv[toUnit];
        }
    }

    updateConverterUnits() {
        const type = this.converterInputs.conversionType.value;
        const units = {
            length: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'],
            weight: ['kg', 'g', 'mg', 'lb', 'oz'],
            temperature: ['C', 'F', 'K'],
            area: ['m2', 'km2', 'cm2', 'ha', 'ac'],
            volume: ['m3', 'l', 'ml', 'gal']
        };

        const unitList = units[type] || [];

        if (this.converterInputs.fromUnit) {
            this.converterInputs.fromUnit.innerHTML = unitList
                .map((u) => `<option value="${u}">${u}</option>`)
                .join('');
        }
        if (this.converterInputs.toUnit) {
            this.converterInputs.toUnit.innerHTML = unitList
                .map((u) => `<option value="${u}">${u}</option>`)
                .join('');
        }

        if (this.converterInputs.fromUnit) {
            this.converterInputs.fromUnit.value = unitList[0];
        }
        if (this.converterInputs.toUnit) {
            this.converterInputs.toUnit.value = unitList[1] || unitList[0];
        }

        this.convert();
    }

    swapConverterUnits() {
        const tempValue = this.converterInputs.fromValue.value;
        const tempUnit = this.converterInputs.fromUnit.value;

        this.converterInputs.fromValue.value = this.converterInputs.toValue.value;
        this.converterInputs.fromUnit.value = this.converterInputs.toUnit.value;

        this.converterInputs.toValue.value = tempValue;
        this.converterInputs.toUnit.value = tempUnit;

        this.convert();
    }

    // Méthodes de gestion des touches
    handleKeyPress(key, input) {
        if (!key || !input) return;

        if (key === 'C') {
            input.value = '0';
            if (this.resultElt) this.resultElt.textContent = '0';
            return;
        }

        if (key === 'Del') {
            input.value = input.value.length > 1 ? input.value.slice(0, -1) : '0';
            return;
        }

        if (key === '±') {
            input.value = input.value.startsWith('-') ? input.value.slice(1) : '-' + input.value;
            return;
        }

        if (key === '%') {
            input.value = this.formatNumber(parseFloat(input.value) / 100);
            return;
        }

        if (key === '.' && input.value.includes('.')) return;

        if (input.value === '0' && key !== '.') {
            input.value = key;
        } else {
            input.value += key;
        }
    }

    handleScientificKeyPress(key) {
        if (!this.sciInput) return;

        if (key === 'C') {
            this.sciInput.value = '0';
            this.sciExpression = '';
        } else if (key === '=') {
            this.calculateScientific();
        } else {
            if (this.sciInput.value === '0') {
                this.sciInput.value = key;
            } else {
                this.sciInput.value += key;
            }
            this.sciExpression = this.sciInput.value;
        }
    }

    handleScientificFunction(func) {
        if (!this.sciInput) return;

        const value = parseFloat(this.sciInput.value) || 0;
        let result;

        switch (func) {
            case 'sin':
                result = Math.sin((value * Math.PI) / 180);
                break;
            case 'cos':
                result = Math.cos((value * Math.PI) / 180);
                break;
            case 'tan':
                result = Math.tan((value * Math.PI) / 180);
                break;
            case 'asin':
                result = (Math.asin(value) * 180) / Math.PI;
                break;
            case 'acos':
                result = (Math.acos(value) * 180) / Math.PI;
                break;
            case 'atan':
                result = (Math.atan(value) * 180) / Math.PI;
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'exp':
                result = Math.exp(value);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'abs':
                result = Math.abs(value);
                break;
            case 'fact':
                result = factorial(value);
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'floor':
                result = Math.floor(value);
                break;
            case 'ceil':
                result = Math.ceil(value);
                break;
            case 'round':
                result = Math.round(value);
                break;
            case 'pow':
                this.sciExpression += '^';
                this.sciInput.value += '^';
                return;
            case 'clear':
                this.handleScientificKeyPress('C');
                return;
            case 'equals':
                this.calculateScientific();
                return;
        }

        if (!Number.isFinite(result)) {
            this.sciInput.value = 'Erreur';
            this.sciExpression = '';
            this.showNotification('Cette fonction ne peut pas être appliquée à la valeur saisie.');
            return;
        }

        this.sciInput.value = this.formatNumber(result);
        this.sciExpression = this.sciInput.value;
    }

    // Méthodes d'affichage
    displayResult(result) {
        if (!this.resultElt) return;

        this.resultElt.classList.remove('show');
        this.resultElt.textContent = result;
        setTimeout(() => this.resultElt.classList.add('show'), 10);
    }

    updateOperatorButtons() {
        this.operatorBtns.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.op === this.selectedOperator);
        });
    }

    // Méthodes de thème
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        const requestedTheme = ['auto', 'light', 'dark'].includes(theme) ? theme : 'auto';
        const resolvedTheme =
            requestedTheme === 'auto'
                ? window.matchMedia?.('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : requestedTheme;

        document.documentElement.setAttribute('data-theme', resolvedTheme);
        localStorage.setItem('calculator-theme', requestedTheme);

        const themeSelector = document.querySelector('#theme-selector');
        if (themeSelector) themeSelector.value = requestedTheme;

        const themeToggle = document.querySelector('#theme-toggle i');
        if (themeToggle) {
            themeToggle.className = resolvedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Méthodes de gestion des modes
    switchMode(mode) {
        const validModes = ['standard', 'scientific', 'financial', 'converter'];
        if (!validModes.includes(mode)) return;

        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach((button) => {
            const isActive = button.dataset.mode === mode;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });
        document.querySelectorAll('.calculator-mode').forEach((panel) => {
            const isActive = panel.id === `${mode}-mode`;
            panel.classList.toggle('active', isActive);
            panel.setAttribute('aria-hidden', String(!isActive));
        });
        this.updateModeDisplay();
    }

    updateModeDisplay() {
        const activePanel = document.querySelector(`#${this.currentMode}-mode`);
        if (activePanel) activePanel.focus?.({ preventScroll: true });
    }

    // Méthodes d'historique
    addToHistory(entry) {
        const timestamp = new Date().toLocaleTimeString();
        const historyItem = {
            id: Date.now(),
            entry,
            timestamp,
            mode: this.currentMode
        };

        this.history.unshift(historyItem);

        if (this.history.length > CONFIG.maxHistoryItems) {
            this.history.pop();
        }

        this.updateHistoryDisplay();
        this.updateHistoryChart();
        this.saveHistory();
    }

    updateHistoryDisplay() {
        if (!this.historyList) return;

        this.historyList.innerHTML = this.history
            .map(
                (item) => `
            <div class="history-item" data-id="${this.escapeHtml(item.id)}">
                <div class="history-entry">${this.escapeHtml(item.entry)}</div>
                <div class="history-timestamp">${this.escapeHtml(item.timestamp)}</div>
            </div>
        `
            )
            .join('');
    }

    escapeHtml(value) {
        return String(value ?? '').replace(
            /[&<>'"]/g,
            (character) =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                })[character]
        );
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.updateHistoryChart();
        this.saveHistory();
        this.showNotification('Historique effacé !');
    }

    toggleHistory() {
        if (this.historyPanel) {
            this.historyPanel.classList.toggle('show');
        }
    }

    // Méthodes de graphiques
    initializeChart() {
        if (!this.historyChart || typeof Chart === 'undefined') return;

        const ctx = this.historyChart.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Résultats',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateHistoryChart() {
        if (!this.chart) return;

        const numericResults = this.history
            .filter((item) => {
                const result = item.entry.split('=')[1]?.trim();
                return !isNaN(parseFloat(result));
            })
            .map((item) => parseFloat(item.entry.split('=')[1]?.trim()))
            .slice(0, 10);

        this.chart.data.labels = Array.from({ length: numericResults.length }, (_, i) => i + 1);
        this.chart.data.datasets[0].data = numericResults;
        this.chart.update();
    }

    // Méthodes de paramètres
    showSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.add('show');
        }
    }

    hideSettings() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('show');
        }
    }

    loadSettings() {
        const storedTheme = localStorage.getItem('calculator-theme');
        const savedTheme = ['auto', 'light', 'dark'].includes(storedTheme) ? storedTheme : 'auto';
        const parsedPrecision = Number.parseInt(
            localStorage.getItem('calculator-precision') || '2',
            10
        );
        const savedPrecision = Number.isInteger(parsedPrecision)
            ? Math.min(10, Math.max(0, parsedPrecision))
            : 2;
        const savedAnimations = localStorage.getItem('calculator-animations') !== 'false';

        this.setTheme(savedTheme);
        document.documentElement.classList.toggle('animations-disabled', !savedAnimations);

        const precisionInput = document.querySelector('#decimal-precision');
        if (precisionInput) precisionInput.value = String(savedPrecision);

        const animationsInput = document.querySelector('#animations-enabled');
        if (animationsInput) animationsInput.checked = savedAnimations;

        const themeSelector = document.querySelector('#theme-selector');
        if (themeSelector) themeSelector.value = savedTheme;

        CONFIG.decimalPrecision = savedPrecision;
        CONFIG.animationsEnabled = savedAnimations;
    }

    saveSettings() {
        const precisionInput = document.querySelector('#decimal-precision');
        const parsedPrecision = Number.parseInt(precisionInput?.value ?? '2', 10);
        const precision = Number.isInteger(parsedPrecision)
            ? Math.min(10, Math.max(0, parsedPrecision))
            : 2;
        const animations = document.querySelector('#animations-enabled')?.checked ?? true;
        const themeSelector = document.querySelector('#theme-selector');
        const theme = ['auto', 'light', 'dark'].includes(themeSelector?.value)
            ? themeSelector.value
            : 'auto';

        localStorage.setItem('calculator-precision', String(precision));
        localStorage.setItem('calculator-animations', String(animations));
        localStorage.setItem('calculator-theme', theme);

        CONFIG.decimalPrecision = precision;
        CONFIG.animationsEnabled = animations;
        document.documentElement.classList.toggle('animations-disabled', !animations);
        if (precisionInput) precisionInput.value = String(precision);
        this.setTheme(theme);

        this.showNotification('Paramètres sauvegardés !');
    }

    // Méthodes de sauvegarde/chargement
    saveState() {
        const state = {
            operand1: this.operand1?.value || '0',
            operand2: this.operand2?.value || '0',
            operator: this.selectedOperator,
            mode: this.currentMode,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('calculator-state', JSON.stringify(state));
        this.showNotification('État sauvegardé avec succès !');
    }

    loadState() {
        const saved = localStorage.getItem('calculator-state');
        if (!saved) {
            this.showNotification('Aucune sauvegarde trouvée.');
            return;
        }

        try {
            const state = JSON.parse(saved);
            if (this.operand1) this.operand1.value = state.operand1 || '0';
            if (this.operand2) this.operand2.value = state.operand2 || '0';
            this.selectedOperator = state.operator || '+';

            this.updateOperatorButtons();
            this.switchMode(state.mode || 'standard');
            this.calculateStandard();
            this.showNotification('État restauré avec succès !');
        } catch {
            this.showNotification('La sauvegarde est illisible.');
        }
    }

    saveHistory() {
        localStorage.setItem('calculator-history', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculator-history');
        if (!saved) return;

        try {
            const parsedHistory = JSON.parse(saved);
            this.history = Array.isArray(parsedHistory)
                ? parsedHistory.slice(0, CONFIG.maxHistoryItems)
                : [];
        } catch {
            this.history = [];
            localStorage.removeItem('calculator-history');
        }

        this.updateHistoryDisplay();
        this.updateHistoryChart();
    }

    // Méthodes d'export/import
    exportData() {
        const data = {
            history: this.history,
            settings: CONFIG,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calculatrice-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Données exportées avec succès !');
    }

    async shareCalculator() {
        const shareData = {
            title: 'Calculatrice Pro ESIEA',
            text: 'Découvrez ma calculatrice professionnelle développée avec les dernières technologies !',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                this.showNotification('Lien partagé !');
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(window.location.href);
                this.showNotification('Lien copié dans le presse-papiers !');
            } else {
                throw new Error('Partage indisponible');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                this.showNotification('Le partage n’est pas disponible dans ce navigateur.');
            }
        }
    }

    // Reconnaissance vocale
    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'fr-FR';

            recognition.start();
            this.showNotification('Écoute en cours... Parlez maintenant !');

            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };

            recognition.onerror = () => {
                this.showNotification('Erreur de reconnaissance vocale');
            };

            recognition.onend = () => {
                this.showNotification('Reconnaissance vocale terminée');
            };
        } else {
            this.showNotification('Reconnaissance vocale non supportée par ce navigateur');
        }
    }

    // Traitement des commandes vocales
    processVoiceCommand(command) {
        this.showNotification(`Commande reçue: ${command}`);

        if (command.includes('calculer') || command.includes('calcul')) {
            this.calculateStandard();
        } else if (command.includes('effacer') || command.includes('clear')) {
            this.clearAll();
        } else if (command.includes('mode scientifique')) {
            this.switchMode('scientific');
        } else if (command.includes('mode financier')) {
            this.switchMode('financial');
        } else if (command.includes('mode convertisseur')) {
            this.switchMode('converter');
        } else if (command.includes('thème sombre')) {
            this.setTheme('dark');
        } else if (command.includes('thème clair')) {
            this.setTheme('light');
        } else if (command.includes('plus') || command.includes('addition')) {
            this.selectedOperator = '+';
            this.updateOperatorButtons();
        } else if (command.includes('moins') || command.includes('soustraction')) {
            this.selectedOperator = '-';
            this.updateOperatorButtons();
        } else if (command.includes('fois') || command.includes('multiplication')) {
            this.selectedOperator = '*';
            this.updateOperatorButtons();
        } else if (command.includes('diviser') || command.includes('division')) {
            this.selectedOperator = '/';
            this.updateOperatorButtons();
        }
    }

    // Affichage de l'aide
    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal help-modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-question-circle"></i> Aide - Calculatrice Pro</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h4>Raccourcis clavier généraux</h4>
                        <ul>
                            <li><strong>Ctrl + S:</strong> Sauvegarder</li>
                            <li><strong>Ctrl + L:</strong> Charger</li>
                            <li><strong>Ctrl + E:</strong> Exporter</li>
                            <li><strong>Ctrl + D:</strong> Changer de thème</li>
                            <li><strong>Ctrl + H:</strong> Afficher l'historique</li>
                            <li><strong>Escape:</strong> Effacer tout</li>
                            <li><strong>Enter ou =:</strong> Calculer</li>
                            <li><strong>Backspace:</strong> Supprimer le dernier caractère</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Changement de mode</h4>
                        <ul>
                            <li><strong>Ctrl + 1:</strong> Mode Standard</li>
                            <li><strong>Ctrl + 2:</strong> Mode Scientifique</li>
                            <li><strong>Ctrl + 3:</strong> Mode Financier</li>
                            <li><strong>Ctrl + 4:</strong> Mode Convertisseur</li>
                            <li><strong>Ctrl + M:</strong> Mode Scientifique</li>
                            <li><strong>Ctrl + F:</strong> Mode Financier</li>
                            <li><strong>Ctrl + C:</strong> Mode Convertisseur</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Fonctions scientifiques (Mode Scientifique)</h4>
                        <ul>
                            <li><strong>S:</strong> Sinus</li>
                            <li><strong>C:</strong> Cosinus</li>
                            <li><strong>T:</strong> Tangente</li>
                            <li><strong>L:</strong> Logarithme base 10</li>
                            <li><strong>N:</strong> Logarithme naturel</li>
                            <li><strong>R:</strong> Racine carrée</li>
                            <li><strong>A:</strong> Valeur absolue</li>
                            <li><strong>P:</strong> Constante π</li>
                            <li><strong>E:</strong> Constante e</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Fonctions financières (Mode Financier)</h4>
                        <ul>
                            <li><strong>V:</strong> Valeur Présente</li>
                            <li><strong>F:</strong> Valeur Future</li>
                            <li><strong>P:</strong> Paiement</li>
                            <li><strong>R:</strong> Taux</li>
                            <li><strong>N:</strong> Périodes</li>
                            <li><strong>I:</strong> TRI</li>
                            <li><strong>W:</strong> VAN</li>
                            <li><strong>O:</strong> ROI</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Commandes vocales</h4>
                        <ul>
                            <li>"Calculer" - Effectuer le calcul</li>
                            <li>"Effacer" - Réinitialiser</li>
                            <li>"Mode scientifique" - Changer de mode</li>
                            <li>"Plus/Moins/Fois/Diviser" - Changer d'opérateur</li>
                            <li>"Thème sombre/clair" - Changer de thème</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Fonctionnalités</h4>
                        <ul>
                            <li><strong>Mode Standard:</strong> Calculs basiques avec deux opérandes</li>
                            <li><strong>Mode Scientifique:</strong> Fonctions trigonométriques, logarithmes, etc.</li>
                            <li><strong>Mode Financier:</strong> Calculs financiers (VAN, TRI, ROI, etc.)</li>
                            <li><strong>Mode Convertisseur:</strong> Conversion d'unités</li>
                            <li><strong>Historique:</strong> Sauvegarde automatique des calculs</li>
                            <li><strong>Thèmes:</strong> Mode clair/sombre automatique</li>
                            <li><strong>Responsive:</strong> Adaptation à tous les écrans</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(helpModal);
        helpModal.classList.add('show');

        // Fermer la modal
        helpModal.querySelector('.modal-close').addEventListener('click', () => {
            helpModal.remove();
        });

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
    }

    // Démonstration automatique
    startDemo() {
        this.showNotification('Démo en cours...');

        const demoSteps = [
            { delay: 1000, action: () => this.switchMode('standard') },
            {
                delay: 2000,
                action: () => {
                    this.operand1.value = '15';
                    this.operand2.value = '7';
                }
            },
            {
                delay: 3000,
                action: () => {
                    this.selectedOperator = '+';
                    this.updateOperatorButtons();
                }
            },
            { delay: 4000, action: () => this.calculateStandard() },
            { delay: 5000, action: () => this.switchMode('scientific') },
            {
                delay: 6000,
                action: () => {
                    this.sciInput.value = '45';
                }
            },
            { delay: 7000, action: () => this.handleScientificFunction('sin') },
            { delay: 8000, action: () => this.switchMode('financial') },
            {
                delay: 9000,
                action: () => {
                    this.finInputs.pv.value = '1000';
                    this.finInputs.rate.value = '5';
                    this.finInputs.nper.value = '10';
                }
            },
            { delay: 10000, action: () => this.calculateFinancial('fv') },
            { delay: 11000, action: () => this.switchMode('converter') },
            {
                delay: 12000,
                action: () => {
                    this.converterInputs.fromValue.value = '100';
                }
            },
            { delay: 13000, action: () => this.convert() },
            { delay: 14000, action: () => this.switchMode('standard') },
            { delay: 15000, action: () => this.showNotification('Démo terminée !') }
        ];

        let currentStep = 0;
        const runDemoStep = () => {
            if (currentStep < demoSteps.length) {
                const step = demoSteps[currentStep];
                setTimeout(() => {
                    step.action();
                    currentStep++;
                    runDemoStep();
                }, step.delay);
            }
        };

        runDemoStep();
    }

    // Méthodes utilitaires
    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return num;
        return parseFloat(num.toFixed(CONFIG.decimalPrecision));
    }

    clearAll() {
        if (this.operand1) this.operand1.value = '0';
        if (this.operand2) this.operand2.value = '0';
        if (this.resultElt) this.resultElt.textContent = '0';
        if (this.sciInput) this.sciInput.value = '0';
        this.sciExpression = '';
        this.sciResult = 0;
        if (this.finInput) this.finInput.value = '0';
        if (this.converterInputs.fromValue) this.converterInputs.fromValue.value = '0';
        if (this.converterInputs.toValue) this.converterInputs.toValue.value = '0';
        this.currentField = this.operand1;
        this.selectedOperator = '+';
        this.updateOperatorButtons();
    }

    showNotification(message) {
        // Création d'une notification temporaire
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialisation
    init() {
        this.updateConverterUnits();
        console.log('Calculatrice Pro initialisée avec succès !');

        // Initialiser les fonctionnalités avancées
        this.initializeAdvancedFeatures();

        // Initialiser les effets visuels personnalisés
        this.initializeAllVisualEffects();
    }

    // Initialisation des fonctionnalités avancées
    initializeAdvancedFeatures() {
        // Attendre que les fonctionnalités avancées soient chargées
        setTimeout(() => {
            if (window.AdvancedFeatures) {
                this.advancedFeatures = new AdvancedFeatures(this);
                console.log('Fonctionnalités avancées initialisées');
            }

            if (window.StatisticsFeatures) {
                this.statisticsFeatures = new StatisticsFeatures(this);
                console.log('Fonctionnalités de statistiques initialisées');
            }

            if (window.CustomizationFeatures) {
                this.customizationFeatures = new CustomizationFeatures(this);
                console.log('Fonctionnalités de personnalisation initialisées');
            }
        }, 100);
    }

    // Initialisation des effets visuels personnalisés
    initializeCustomEffects() {
        this.createCustomParticles();
        this.initializeNeonEffects();
        this.initializeMorphingEffects();
    }

    // Création des particules personnalisées
    createCustomParticles() {
        const particlesContainer = document.getElementById('custom-particles');
        if (!particlesContainer) return;

        // Supprimer les particules existantes
        particlesContainer.innerHTML = '';

        // Créer 50 particules
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'custom-particle';

            // Position aléatoire
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = Math.random() * 10 + 5 + 's';

            particlesContainer.appendChild(particle);
        }
    }

    // Initialisation des effets néon
    initializeNeonEffects() {
        // Effet de néon pour les boutons au clic
        document.addEventListener('click', (e) => {
            if (
                e.target.classList.contains('key') ||
                e.target.classList.contains('op-btn') ||
                e.target.classList.contains('sci-btn') ||
                e.target.classList.contains('fin-btn')
            ) {
                // Créer un effet de ripple
                this.createRippleEffect(e);

                // Effet de néon temporaire
                e.target.style.animation = 'neonGlow 0.5s ease-in-out';
                setTimeout(() => {
                    e.target.style.animation = '';
                }, 500);
            }
        });

        // Effet de néon pour les résultats
        const resultElements = document.querySelectorAll('.result');
        resultElements.forEach((result) => {
            result.addEventListener('animationend', () => {
                if (result.classList.contains('show')) {
                    result.style.animation = 'neonPulse 2s ease-in-out infinite';
                }
            });
        });
    }

    // Création d'effet de ripple
    createRippleEffect(event) {
        const button = event.target;
        const ripple = document.createElement('div');

        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(59, 130, 246, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = event.offsetX - 10 + 'px';
        ripple.style.top = event.offsetY - 10 + 'px';
        ripple.style.pointerEvents = 'none';

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Initialisation des effets de morphing
    initializeMorphingEffects() {
        // Effet de morphing pour les calculatrices
        const calculators = document.querySelectorAll('.calculator');
        calculators.forEach((calc) => {
            calc.addEventListener('mouseenter', () => {
                calc.style.animation = 'morphing 3s ease-in-out infinite';
            });

            calc.addEventListener('mouseleave', () => {
                calc.style.animation = '';
            });
        });

        // Effet de morphing pour les modales
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach((modal) => {
            modal.addEventListener('animationend', () => {
                if (modal.closest('.modal').classList.contains('show')) {
                    modal.style.animation = 'morphing 6s ease-in-out infinite';
                }
            });
        });
    }

    // Animation de typewriter pour les titres
    initializeTypewriterEffect() {
        const titles = document.querySelectorAll('.demo-title');
        titles.forEach((title) => {
            const text = title.textContent;
            title.textContent = '';
            title.style.borderRight = '3px solid var(--primary-color)';

            let i = 0;
            const typewriter = setInterval(() => {
                title.textContent += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(typewriter);
                    title.style.borderRight = 'none';
                }
            }, 100);
        });
    }

    // Effet de glitch pour les notifications
    createGlitchNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification glitch-notification';
        notification.textContent = message;
        notification.style.animation = 'glitch 0.3s ease-in-out';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Animation de rotation 3D pour les icônes
    initialize3DRotation() {
        const icons = document.querySelectorAll('.feature-icon i, .nav-logo, .mode-btn i');
        icons.forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'rotate3DEnhanced 1.5s ease-in-out';
            });

            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
    }

    // Effet de wave amélioré pour les boutons spéciaux
    initializeWaveEffects() {
        const waveButtons = document.querySelectorAll('.equals, .action-btn, .voice-btn');
        waveButtons.forEach((button) => {
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'waveEnhanced 0.8s ease-in-out';
            });

            button.addEventListener('animationend', () => {
                button.style.animation = '';
            });
        });
    }

    // Animation de gradient pour les éléments spéciaux
    initializeGradientEffects() {
        const gradientElements = document.querySelectorAll('.equals, .tech-badge, .demo-section');
        gradientElements.forEach((element) => {
            element.addEventListener('mouseenter', () => {
                element.style.animation = 'gradientShift 2s ease infinite';
            });

            element.addEventListener('mouseleave', () => {
                element.style.animation = '';
            });
        });
    }

    // Effet de néon pour les inputs focus
    initializeNeonInputs() {
        const inputs = document.querySelectorAll('.operand, .sci-input, .fin-input');
        inputs.forEach((input) => {
            input.addEventListener('focus', () => {
                input.style.animation = 'neonGlow 1s ease-in-out infinite';
            });

            input.addEventListener('blur', () => {
                input.style.animation = '';
            });
        });
    }

    // Animation de pulse pour les éléments interactifs
    initializePulseEffects() {
        const pulseElements = document.querySelectorAll('.key, .op-btn, .sci-btn, .fin-btn');
        pulseElements.forEach((element) => {
            element.addEventListener('focus', () => {
                element.style.animation = 'pulseNeon 1s ease-in-out infinite';
            });

            element.addEventListener('blur', () => {
                element.style.animation = '';
            });
        });
    }

    // Effet de morphing pour les conteneurs
    initializeMorphingContainers() {
        const containers = document.querySelectorAll('.calculators-wrapper, .feature-grid');
        containers.forEach((container) => {
            container.addEventListener('mouseenter', () => {
                container.style.animation = 'morphing 6s ease-in-out infinite';
            });

            container.addEventListener('mouseleave', () => {
                container.style.animation = '';
            });
        });
    }

    // Animation de slide avec perspective pour les modales
    initializeSlidePerspective() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach((modal) => {
            modal.addEventListener('animationend', () => {
                if (modal.classList.contains('show')) {
                    const content = modal.querySelector('.modal-content');
                    if (content) {
                        content.style.animation = 'slidePerspective 0.5s ease-out';
                    }
                }
            });
        });
    }

    // Effet de néon pour les résultats de calcul
    initializeResultNeon() {
        const results = document.querySelectorAll('.result');
        results.forEach((result) => {
            result.addEventListener('animationend', () => {
                if (result.classList.contains('show')) {
                    result.style.animation = 'neonPulse 2s ease-in-out infinite';
                }
            });
        });
    }

    // Animation de morphing pour les panneaux
    initializePanelMorphing() {
        const panels = document.querySelectorAll('.history-panel, .stats-panel');
        panels.forEach((panel) => {
            panel.addEventListener('mouseenter', () => {
                panel.style.animation = 'morphing 5s ease-in-out infinite';
            });

            panel.addEventListener('mouseleave', () => {
                panel.style.animation = '';
            });
        });
    }

    // Effet de néon pour les boutons de mode
    initializeModeButtonNeon() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach((button) => {
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'neonGlow 1.5s ease-in-out infinite';
            });

            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('active')) {
                    button.style.animation = '';
                }
            });
        });
    }

    // Animation de rotation pour les icônes de navigation
    initializeNavigationRotation() {
        const navIcons = document.querySelectorAll('.nav-logo, .theme-btn, .settings-btn');
        navIcons.forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'rotate3D 1s ease-in-out';
            });

            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
    }

    // Effet de wave pour les boutons de fermeture
    initializeCloseButtonWave() {
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach((button) => {
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'wave 0.4s ease-in-out';
            });

            button.addEventListener('animationend', () => {
                button.style.animation = '';
            });
        });
    }

    // Animation de morphing pour les inputs de conversion
    initializeConverterMorphing() {
        const converterInputs = document.querySelectorAll('.converter-inputs');
        converterInputs.forEach((input) => {
            input.addEventListener('mouseenter', () => {
                input.style.animation = 'morphing 4s ease-in-out infinite';
            });

            input.addEventListener('mouseleave', () => {
                input.style.animation = '';
            });
        });
    }

    // Animation de pulse pour les éléments de liste
    initializeListPulse() {
        const listItems = document.querySelectorAll('.history-item');
        listItems.forEach((item) => {
            item.addEventListener('mouseenter', () => {
                item.style.animation = 'pulseActive 0.4s ease-in-out';
            });

            item.addEventListener('animationend', () => {
                item.style.animation = '';
            });
        });
    }

    // Effet de néon pour les boutons de paramètres
    initializeSettingsNeon() {
        const settingsButtons = document.querySelectorAll('.setting-group button');
        settingsButtons.forEach((button) => {
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'neonGlow 1.5s ease-in-out infinite';
            });

            button.addEventListener('mouseleave', () => {
                button.style.animation = '';
            });
        });
    }

    // Animation de wave pour les boutons de swap
    initializeSwapWave() {
        const swapButtons = document.querySelectorAll('.swap-btn');
        swapButtons.forEach((button) => {
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'wave 0.5s ease-in-out';
            });

            button.addEventListener('animationend', () => {
                button.style.animation = '';
            });
        });
    }

    // Effet de morphing pour les sélecteurs
    initializeSelectorMorphing() {
        const selectors = document.querySelectorAll('.converter-selector');
        selectors.forEach((selector) => {
            selector.addEventListener('mouseenter', () => {
                selector.style.animation = 'morphing 3s ease-in-out infinite';
            });

            selector.addEventListener('mouseleave', () => {
                selector.style.animation = '';
            });
        });
    }

    // Animation de rotation pour les icônes de mode
    initializeModeIconRotation() {
        const modeIcons = document.querySelectorAll('.mode-selector .mode-btn i');
        modeIcons.forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'rotate3D 0.6s ease-in-out';
            });

            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
    }

    // Effet de néon pour les éléments de statistiques
    initializeStatsNeon() {
        const statValues = document.querySelectorAll('.stat-item span:last-child');
        statValues.forEach((value) => {
            value.addEventListener('mouseenter', () => {
                value.style.animation = 'neonPulse 2s ease-in-out infinite';
            });

            value.addEventListener('mouseleave', () => {
                value.style.animation = '';
            });
        });
    }

    // Animation de gradient pour les cartes de démonstration
    initializeDemoGradient() {
        const demoSections = document.querySelectorAll('.demo-section');
        demoSections.forEach((section) => {
            section.addEventListener('mouseenter', () => {
                section.style.animation = 'gradientShift 10s ease infinite';
            });

            section.addEventListener('mouseleave', () => {
                section.style.animation = '';
            });
        });
    }

    // Effet de morphing pour les grilles de fonctionnalités
    initializeFeatureGridMorphing() {
        const featureGrids = document.querySelectorAll('.feature-grid');
        featureGrids.forEach((grid) => {
            grid.addEventListener('mouseenter', () => {
                grid.style.animation = 'morphing 8s ease-in-out infinite';
            });

            grid.addEventListener('mouseleave', () => {
                grid.style.animation = '';
            });
        });
    }

    // Animation de pulse pour les badges technologiques
    initializeTechBadgePulse() {
        const techBadges = document.querySelectorAll('.tech-badge');
        techBadges.forEach((badge) => {
            badge.addEventListener('mouseenter', () => {
                badge.style.animation = 'pulseActive 0.5s ease-in-out';
            });

            badge.addEventListener('animationend', () => {
                badge.style.animation = '';
            });
        });
    }

    // Effet de néon pour les liens de navigation
    initializeNavLinkNeon() {
        const navLinks = document.querySelectorAll('.demo-button');
        navLinks.forEach((link) => {
            link.addEventListener('mouseenter', () => {
                link.style.animation = 'neonGlow 1.5s ease-in-out infinite';
            });

            link.addEventListener('mouseleave', () => {
                link.style.animation = '';
            });
        });
    }

    // Animation de rotation pour les icônes de démonstration
    initializeDemoIconRotation() {
        const demoIcons = document.querySelectorAll('.demo-button i');
        demoIcons.forEach((icon) => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animation = 'rotate3D 0.8s ease-in-out';
            });

            icon.addEventListener('animationend', () => {
                icon.style.animation = '';
            });
        });
    }

    // Initialisation complète des effets visuels
    initializeAllVisualEffects() {
        this.initializeCustomEffects();
        this.initializeNeonEffects();
        this.initializeMorphingEffects();
        this.initializeTypewriterEffect();
        this.initialize3DRotation();
        this.initializeWaveEffects();
        this.initializeGradientEffects();
        this.initializeNeonInputs();
        this.initializePulseEffects();
        this.initializeMorphingContainers();
        this.initializeSlidePerspective();
        this.initializeResultNeon();
        this.initializePanelMorphing();
        this.initializeModeButtonNeon();
        this.initializeNavigationRotation();
        this.initializeCloseButtonWave();
        this.initializeConverterMorphing();
        this.initializeListPulse();
        this.initializeSettingsNeon();
        this.initializeSwapWave();
        this.initializeSelectorMorphing();
        this.initializeModeIconRotation();
        this.initializeStatsNeon();
        this.initializeDemoGradient();
        this.initializeFeatureGridMorphing();
        this.initializeTechBadgePulse();
        this.initializeNavLinkNeon();
        this.initializeDemoIconRotation();
    }
}

// Styles pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    calculator.init();

    // Exposition globale pour le débogage
    window.calculator = calculator;
});
