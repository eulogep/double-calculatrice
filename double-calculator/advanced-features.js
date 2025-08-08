// Fonctionnalités avancées pour la calculatrice
class AdvancedFeatures {
    constructor(calculator) {
        this.calculator = calculator;
        this.initializeAdvancedFeatures();
    }

    initializeAdvancedFeatures() {
        this.addKeyboardShortcuts();
        this.addVoiceCommands();
        this.addGestureSupport();
        this.addAdvancedAnimations();
        this.addPerformanceMonitoring();
    }

    // Raccourcis clavier avancés
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S : Sauvegarder
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.calculator.saveState();
            }
            
            // Ctrl + L : Charger
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.calculator.loadState();
            }
            
            // Ctrl + E : Export
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.calculator.exportData();
            }
            
            // Ctrl + D : Mode sombre
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.calculator.toggleTheme();
            }
            
            // Ctrl + M : Mode scientifique
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.switchToMode('scientific');
            }
            
            // Ctrl + F : Mode financier
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.switchToMode('financial');
            }
            
            // Ctrl + C : Mode convertisseur
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                this.switchToMode('converter');
            }
        });
    }

    // Commandes vocales (simulation)
    addVoiceCommands() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'fr-FR';
            
            // Bouton pour activer la reconnaissance vocale
            const voiceBtn = document.createElement('button');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.className = 'voice-btn';
            voiceBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                border: none;
                cursor: pointer;
                z-index: 1000;
                box-shadow: var(--shadow-lg);
                transition: all 0.3s ease;
            `;
            
            voiceBtn.addEventListener('click', () => {
                recognition.start();
                voiceBtn.style.background = 'var(--danger-color)';
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            });
            
            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
                voiceBtn.style.background = 'var(--primary-color)';
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };
            
            recognition.onerror = () => {
                voiceBtn.style.background = 'var(--primary-color)';
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };
            
            document.body.appendChild(voiceBtn);
        }
    }

    // Traitement des commandes vocales
    processVoiceCommand(command) {
        if (command.includes('calculer') || command.includes('calcul')) {
            this.calculator.calculateStandard();
        } else if (command.includes('effacer') || command.includes('clear')) {
            this.calculator.clearAll();
        } else if (command.includes('mode scientifique')) {
            this.switchToMode('scientific');
        } else if (command.includes('mode financier')) {
            this.switchToMode('financial');
        } else if (command.includes('mode convertisseur')) {
            this.switchToMode('converter');
        } else if (command.includes('thème sombre')) {
            this.calculator.setTheme('dark');
        } else if (command.includes('thème clair')) {
            this.calculator.setTheme('light');
        }
        
        this.calculator.showNotification(`Commande reçue: ${command}`);
    }

    // Support des gestes (simulation avec la souris)
    addGestureSupport() {
        let startX, startY, startTime;
        
        document.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('mouseup', (e) => {
            const endX = e.clientX;
            const endY = e.clientY;
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Swipe gauche (changer de mode)
            if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50 && duration < 500) {
                if (deltaX > 0) {
                    this.nextMode();
                } else {
                    this.previousMode();
                }
            }
            
            // Swipe vers le haut (afficher l'historique)
            if (Math.abs(deltaY) > 100 && Math.abs(deltaX) < 50 && duration < 500) {
                if (deltaY < 0) {
                    this.calculator.toggleHistory();
                }
            }
        });
    }

    // Animations avancées
    addAdvancedAnimations() {
        // Animation des boutons au survol
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05) rotate(2deg)';
                btn.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1) rotate(0deg)';
                btn.style.boxShadow = '';
            });
        });
        
        // Animation des résultats
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'bounceIn 0.6s ease-out';
                }
            });
        });
        
        document.querySelectorAll('.result, .calculator').forEach(el => {
            observer.observe(el);
        });
    }

    // Monitoring des performances
    addPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measurePerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Afficher les FPS en mode développement
                if (window.location.hostname === 'localhost') {
                    console.log(`FPS: ${fps}`);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measurePerformance);
        };
        
        requestAnimationFrame(measurePerformance);
    }

    // Navigation entre les modes
    switchToMode(mode) {
        const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (modeBtn) {
            modeBtn.click();
        }
    }

    nextMode() {
        const modes = ['standard', 'scientific', 'financial', 'converter'];
        const currentIndex = modes.indexOf(this.calculator.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.switchToMode(modes[nextIndex]);
    }

    previousMode() {
        const modes = ['standard', 'scientific', 'financial', 'converter'];
        const currentIndex = modes.indexOf(this.calculator.currentMode);
        const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
        this.switchToMode(modes[prevIndex]);
    }
}

// Fonctionnalités de statistiques avancées
class StatisticsFeatures {
    constructor(calculator) {
        this.calculator = calculator;
        this.stats = {
            totalCalculations: 0,
            averageResult: 0,
            mostUsedOperator: '+',
            calculationHistory: []
        };
    }

    addCalculation(expression, result) {
        this.stats.totalCalculations++;
        this.stats.calculationHistory.push({
            expression,
            result,
            timestamp: new Date()
        });
        
        this.updateStatistics();
    }

    updateStatistics() {
        const results = this.stats.calculationHistory
            .map(calc => parseFloat(calc.result))
            .filter(result => !isNaN(result));
        
        if (results.length > 0) {
            this.stats.averageResult = results.reduce((a, b) => a + b, 0) / results.length;
        }
        
        // Trouver l'opérateur le plus utilisé
        const operatorCount = {};
        this.stats.calculationHistory.forEach(calc => {
            const operator = calc.expression.match(/[\+\-\*\/\^]/)?.[0];
            if (operator) {
                operatorCount[operator] = (operatorCount[operator] || 0) + 1;
            }
        });
        
        if (Object.keys(operatorCount).length > 0) {
            this.stats.mostUsedOperator = Object.entries(operatorCount)
                .sort(([,a], [,b]) => b - a)[0][0];
        }
    }

    getStatistics() {
        return {
            totalCalculations: this.stats.totalCalculations,
            averageResult: this.stats.averageResult.toFixed(2),
            mostUsedOperator: this.stats.mostUsedOperator,
            totalHistoryItems: this.stats.calculationHistory.length
        };
    }

    displayStatistics() {
        const stats = this.getStatistics();
        const statsHtml = `
            <div class="stats-panel">
                <h3>Statistiques</h3>
                <div class="stat-item">
                    <span>Calculs totaux:</span>
                    <span>${stats.totalCalculations}</span>
                </div>
                <div class="stat-item">
                    <span>Résultat moyen:</span>
                    <span>${stats.averageResult}</span>
                </div>
                <div class="stat-item">
                    <span>Opérateur le plus utilisé:</span>
                    <span>${stats.mostUsedOperator}</span>
                </div>
            </div>
        `;
        
        // Créer une modal pour afficher les statistiques
        const modal = document.createElement('div');
        modal.className = 'modal stats-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Statistiques de la Calculatrice</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${statsHtml}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Fermer la modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// Fonctionnalités de personnalisation
class CustomizationFeatures {
    constructor(calculator) {
        this.calculator = calculator;
        this.customThemes = {
            'esiea': {
                '--primary-color': '#1e88e5',
                '--secondary-color': '#10b981',
                '--accent-color': '#f59e0b'
            },
            'dark-pro': {
                '--primary-color': '#6366f1',
                '--secondary-color': '#8b5cf6',
                '--accent-color': '#f97316'
            },
            'nature': {
                '--primary-color': '#059669',
                '--secondary-color': '#10b981',
                '--accent-color': '#f59e0b'
            }
        };
    }

    applyCustomTheme(themeName) {
        const theme = this.customThemes[themeName];
        if (theme) {
            Object.entries(theme).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
            localStorage.setItem('custom-theme', themeName);
        }
    }

    createCustomTheme(name, colors) {
        this.customThemes[name] = colors;
        localStorage.setItem('custom-themes', JSON.stringify(this.customThemes));
    }
}

// Export des classes pour utilisation globale
window.AdvancedFeatures = AdvancedFeatures;
window.StatisticsFeatures = StatisticsFeatures;
window.CustomizationFeatures = CustomizationFeatures;
