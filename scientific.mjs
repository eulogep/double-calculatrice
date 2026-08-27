function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) return NaN;
    if (n === 0 || n === 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i += 1) {
        result *= i;
    }
    return result;
}

function evaluateScientificExpression(expression) {
    if (typeof expression !== 'string' || !expression.trim() || !/^[0-9+\-*/^().\s]+$/.test(expression)) {
        throw new Error('Expression non autorisée');
    }

    const normalizedExpression = expression.replace(/\s+/g, '');
    const tokens = normalizedExpression.match(/(?:\d+(?:\.\d*)?|\.\d+|[()+\-*/^])/g);
    if (!tokens || tokens.join('') !== normalizedExpression) {
        throw new Error('Expression invalide');
    }

    let position = 0;
    const peek = () => tokens[position];
    const consume = () => tokens[position++];

    const parsePrimary = () => {
        const token = peek();
        if (token === '+') {
            consume();
            return parsePrimary();
        }
        if (token === '-') {
            consume();
            return -parsePrimary();
        }
        if (token === '(') {
            consume();
            const value = parseExpression();
            if (consume() !== ')') throw new Error('Parenthèse manquante');
            return value;
        }
        if (!token || !/^\d|^\.\d/.test(token)) throw new Error('Nombre attendu');
        consume();
        return Number(token);
    };

    const parsePower = () => {
        const base = parsePrimary();
        if (peek() === '^') {
            consume();
            return Math.pow(base, parsePower());
        }
        return base;
    };

    const parseTerm = () => {
        let value = parsePower();
        while (peek() === '*' || peek() === '/') {
            const operator = consume();
            const right = parsePower();
            if (operator === '/' && right === 0) throw new Error('Division par zéro');
            value = operator === '*' ? value * right : value / right;
        }
        return value;
    };

    function parseExpression() {
        let value = parseTerm();
        while (peek() === '+' || peek() === '-') {
            const operator = consume();
            const right = parseTerm();
            value = operator === '+' ? value + right : value - right;
        }
        return value;
    }

    const result = parseExpression();
    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error('Expression invalide');
    }
    return result;
}

export { evaluateScientificExpression, factorial };
