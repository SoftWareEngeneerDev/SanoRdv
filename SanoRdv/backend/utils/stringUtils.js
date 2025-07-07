/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Normalise le texte pour la recherche
 * @param {string} text 
 * @returns {string}
 */
export const normalizeSearchText = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
};

/**
 * Trouve les lettres suivantes probables
 * @param {string} currentText 
 * @param {string[]} words 
 * @returns {string[]}
 */
export const getNextLetters = (currentText, words) => {
    const matches = words.filter(word => 
        word.toLowerCase().startsWith(currentText.toLowerCase())
    );
    
    const nextLetters = matches.map(word => 
        word[currentText.length]?.toLowerCase() || ''
    ).filter(Boolean);

    return [...new Set(nextLetters)].slice(0, 5);
};

/**
 * Calcule un score de similarité entre 0 et 1
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export const similarityScore = (a, b) => {
    const distance = levenshteinDistance(
        normalizeSearchText(a),
        normalizeSearchText(b)
    );
    return 1 - (distance / Math.max(a.length, b.length));
};

/**
 * Vérifie une correspondance floue entre deux chaînes selon une distance max
 * @param {string} str1 
 * @param {string} str2 
 * @param {number} maxDistance 
 * @returns {boolean}
 */
export const fuzzyMatch = (str1, str2, maxDistance) => {
    const distance = levenshteinDistance(
        normalizeSearchText(str1),
        normalizeSearchText(str2)
    );
    return distance <= maxDistance;
};

/**
 * Calcule un score phonétique simplifié entre deux chaînes
 * @param {string} a 
 * @param {string} b 
 * @returns {number} score entre 0 et 1
 */
export const phonetiqueFrancais = (a, b) => {
    // Supprime les voyelles pour une comparaison simplifiée
    const stripVowels = str => str.toLowerCase().replace(/[aeiouy]/g, '');
    const aStripped = stripVowels(a);
    const bStripped = stripVowels(b);

    if (aStripped === bStripped) return 1;
    
    const distance = levenshteinDistance(aStripped, bStripped);
    const maxLen = Math.max(aStripped.length, bStripped.length);

    if (maxLen === 0) return 1;

    return 1 - (distance / maxLen);
};
