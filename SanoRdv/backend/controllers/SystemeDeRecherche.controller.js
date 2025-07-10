import Medecin from '../models/medecin.model.js';
import { 
    levenshteinDistance, 
    normalizeSearchText,
    getNextLetters,
    similarityScore,
    fuzzyMatch,
    phonetiqueFrancais
} from '../utils/stringUtils.js';

// Cache intelligent multi-niveaux
const searchCache = {
    // Cache des données de base
    baseData: {
        lastUpdated: null,
        allSpecialites: [],
        allNoms: [],
        allPrenoms: [],
        allLocalites: [],
        medecinsIndex: new Map(),
        specialitesIndex: new Map(),
        localitesIndex: new Map()
    },
    
    // Cache des recherches récentes
    searchHistory: new Map(),
    
    // Index préfixé pour recherche rapide
    prefixIndex: {
        specialites: new Map(),
        noms: new Map(),
        localites: new Map(),
        combined: new Map()
    },
    
    // Cache des suggestions de lettres
    letterSuggestions: new Map(),
    
    // Statistiques d'utilisation
    stats: {
        popularSearches: new Map(),
        commonPrefixes: new Map(),
        userPatterns: new Map()
    }
};

// Configuration du système de recherche
const SEARCH_CONFIG = {
    MIN_QUERY_LENGTH: 1,
    MAX_SUGGESTIONS: 20,
    CACHE_DURATION: 3600000, // 1 heure
    DEBOUNCE_DELAY: 200,
    SIMILARITY_THRESHOLD: 0.4,
    PHONETIC_THRESHOLD: 0.6,
    MAX_CACHE_SIZE: 1000,
    FUZZY_MATCH_DISTANCE: 2
};

// Initialisation et mise à jour du cache
async function initializeSearchSystem() {
    console.log('🚀 Initialisation du système de recherche avancé...');
    
    try {
        await updateBaseCache();
        await buildPrefixIndexes();
        await loadSearchStatistics();
        
        console.log('✅ Système de recherche initialisé avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        return false;
    }
}

async function updateBaseCache() {
    const now = Date.now();
    const cache = searchCache.baseData;
    
    if (!cache.lastUpdated || now - cache.lastUpdated > SEARCH_CONFIG.CACHE_DURATION) {
        console.log('🔄 Mise à jour du cache de base...');
        
        // Récupération parallèle des données
        const [medecins, specialites, localites] = await Promise.all([
            Medecin.find({ isActive: true })
                .select('nom prenom specialite localite telephone email')
                .lean(),
            Medecin.distinct('specialite', { isActive: true }),
            Medecin.distinct('localite', { isActive: true })
        ]);
        
        // Construction des index
        cache.allSpecialites = specialites.sort();
        cache.allLocalites = localites.sort();
        cache.allNoms = [...new Set(medecins.map(m => m.nom))].sort();
        cache.allPrenoms = [...new Set(medecins.map(m => m.prenom))].sort();
        
        // Index des médecins pour recherche rapide
        cache.medecinsIndex.clear();
        medecins.forEach(medecin => {
            const key = `${medecin.nom}_${medecin.prenom}`.toLowerCase();
            cache.medecinsIndex.set(key, medecin);
        });
        
        cache.lastUpdated = now;
        console.log(`✅ Cache mis à jour: ${medecins.length} médecins, ${specialites.length} spécialités`);
    }
}

async function buildPrefixIndexes() {
    console.log('🏗️ Construction des index préfixés...');
    const { prefixIndex } = searchCache;
    
    // Vider les index existants
    Object.values(prefixIndex).forEach(index => index.clear());
    
    const { allSpecialites, allNoms, allPrenoms, allLocalites } = searchCache.baseData;
    
    // Construction des index préfixés
    buildPrefixIndex(allSpecialites, prefixIndex.specialites, 'specialite');
    buildPrefixIndex([...allNoms, ...allPrenoms], prefixIndex.noms, 'nom');
    buildPrefixIndex(allLocalites, prefixIndex.localites, 'localite');
    
    // Index combiné pour recherche globale
    const allTerms = [...allSpecialites, ...allNoms, ...allPrenoms, ...allLocalites];
    buildPrefixIndex(allTerms, prefixIndex.combined, 'all');
}

function buildPrefixIndex(terms, index, type) {
    terms.forEach(term => {
        if (!term) return;
        
        const normalized = normalizeSearchText(term);
        for (let i = 1; i <= normalized.length; i++) {
            const prefix = normalized.substring(0, i);
            
            if (!index.has(prefix)) {
                index.set(prefix, {
                    exact: [],
                    fuzzy: [],
                    phonetic: [],
                    type: type
                });
            }
            
            const entry = index.get(prefix);
            
            // Correspondance exacte
            if (normalized.startsWith(prefix)) {
                entry.exact.push({
                    original: term,
                    normalized: normalized,
                    score: calculatePrefixScore(prefix, normalized)
                });
            }
            
            // Correspondance floue
            if (fuzzyMatch(prefix, normalized, SEARCH_CONFIG.FUZZY_MATCH_DISTANCE)) {
                entry.fuzzy.push({
                    original: term,
                    normalized: normalized,
                    score: calculateFuzzyScore(prefix, normalized)
                });
            }
            
            // Correspondance phonétique
            const phoneticScore = phonetiqueFrancais(prefix, normalized);
            if (phoneticScore > SEARCH_CONFIG.PHONETIC_THRESHOLD) {
                entry.phonetic.push({
                    original: term,
                    normalized: normalized,
                    score: phoneticScore
                });
            }
        }
    });
    
    // Tri des résultats par score
    index.forEach((entry, prefix) => {
        entry.exact.sort((a, b) => b.score - a.score);
        entry.fuzzy.sort((a, b) => b.score - a.score);
        entry.phonetic.sort((a, b) => b.score - a.score);
    });
}

// Système de recherche principal
export const rechercheAvanceeParLettre = async (req, res) => {
    try {
        const startTime = Date.now();
        await updateBaseCache();
        
        const { 
            q: query = '', 
            type = 'all',
            limit = SEARCH_CONFIG.MAX_SUGGESTIONS,
            includeStats = false,
            fuzzyEnabled = true,
            phoneticEnabled = true
        } = req.query;
        
        // Validation des paramètres
        if (query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
            return res.json(await getInitialSuggestions(type, limit));
        }
        
        // Recherche progressive
        const results = await performProgressiveSearch(query, {
            type,
            limit: parseInt(limit),
            fuzzyEnabled: fuzzyEnabled === 'true',
            phoneticEnabled: phoneticEnabled === 'true'
        });
        
        // Mise à jour des statistiques
        updateSearchStats(query, results);
        
        const responseTime = Date.now() - startTime;
        
        return res.json({
            success: true,
            query,
            responseTime,
            ...results,
            ...(includeStats === 'true' && { 
                stats: getSearchStatistics(query) 
            })
        });
        
    } catch (error) {
        console.error('❌ Erreur recherche avancée:', error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la recherche"
        });
    }
};

// Recherche progressive intelligente
async function performProgressiveSearch(query, options) {
    const normalized = normalizeSearchText(query);
    const { type, limit, fuzzyEnabled, phoneticEnabled } = options;
    
    // Vérification du cache de recherche
    const cacheKey = `${normalized}_${type}_${limit}`;
    if (searchCache.searchHistory.has(cacheKey)) {
        const cached = searchCache.searchHistory.get(cacheKey);
        if (Date.now() - cached.timestamp < SEARCH_CONFIG.CACHE_DURATION / 4) {
            return { ...cached.results, fromCache: true };
        }
    }
    
    // Phase 1: Recherche par préfixe exact
    const exactResults = getExactPrefixMatches(normalized, type, limit);
    
    // Phase 2: Recherche floue si nécessaire
    let fuzzyResults = [];
    if (fuzzyEnabled && exactResults.suggestions.length < limit) {
        fuzzyResults = getFuzzyMatches(normalized, type, limit - exactResults.suggestions.length);
    }
    
    // Phase 3: Recherche phonétique si nécessaire  
    let phoneticResults = [];
    if (phoneticEnabled && (exactResults.suggestions.length + fuzzyResults.length) < limit) {
        phoneticResults = getPhoneticMatches(normalized, type, limit - exactResults.suggestions.length - fuzzyResults.length);
    }
    
    // Phase 4: Recherche dans les médecins
    const medecinResults = await rechercherMedecins(normalized, type, limit);
    
    // Combinaison et déduplication des résultats
    const combinedResults = combineAndRankResults({
        exact: exactResults.suggestions,
        fuzzy: fuzzyResults,
        phonetic: phoneticResults,
        medecins: medecinResults,
        query: normalized,
        originalQuery: query
    });
    
    // Génération des suggestions de lettres suivantes
    const nextLetters = generateSmartNextLetters(normalized, combinedResults);
    
    // Construction de la réponse
    const results = {
        suggestions: combinedResults.slice(0, limit),
        nextLetters,
        totalFound: combinedResults.length,
        searchMethods: {
            exact: exactResults.suggestions.length,
            fuzzy: fuzzyResults.length,
            phonetic: phoneticResults.length,
            medecins: medecinResults.length
        },
        queryAnalysis: analyzeQuery(query)
    };
    
    // Mise en cache
    if (searchCache.searchHistory.size >= SEARCH_CONFIG.MAX_CACHE_SIZE) {
        const oldestKey = searchCache.searchHistory.keys().next().value;
        searchCache.searchHistory.delete(oldestKey);
    }
    
    searchCache.searchHistory.set(cacheKey, {
        results,
        timestamp: Date.now()
    });
    
    return results;
}

// Recherche par préfixe exact
function getExactPrefixMatches(query, type, limit) {
    const results = [];
    const indexes = getRelevantIndexes(type);
    
    indexes.forEach(index => {
        if (index.has(query)) {
            const matches = index.get(query);
            results.push(...matches.exact.slice(0, limit));
        }
    });
    
    return {
        suggestions: results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(formatSuggestion)
    };
}

// Recherche floue
function getFuzzyMatches(query, type, limit) {
    const results = [];
    const indexes = getRelevantIndexes(type);
    
    indexes.forEach(index => {
        index.forEach((matches, prefix) => {
            if (levenshteinDistance(query, prefix) <= SEARCH_CONFIG.FUZZY_MATCH_DISTANCE) {
                results.push(...matches.fuzzy);
            }
        });
    });
    
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(formatSuggestion);
}

// Recherche phonétique
function getPhoneticMatches(query, type, limit) {
    const results = [];
    const indexes = getRelevantIndexes(type);
    
    indexes.forEach(index => {
        index.forEach((matches, prefix) => {
            const phoneticScore = phonetiqueFrancais(query, prefix);
            if (phoneticScore > SEARCH_CONFIG.PHONETIC_THRESHOLD) {
                results.push(...matches.phonetic.map(match => ({
                    ...match,
                    phoneticScore
                })));
            }
        });
    });
    
    return results
        .sort((a, b) => (b.phoneticScore || 0) - (a.phoneticScore || 0))
        .slice(0, limit)
        .map(formatSuggestion);
}

// Recherche dans les médecins
async function rechercherMedecins(query, type, limit) {
    if (type !== 'all' && type !== 'medecins') return [];
    
    const searchQuery = {
        isActive: true,
        $or: [
            { nom: { $regex: query, $options: 'i' } },
            { prenom: { $regex: query, $options: 'i' } },
            { specialite: { $regex: query, $options: 'i' } },
            { localite: { $regex: query, $options: 'i' } }
        ]
    };
    
    const medecins = await Medecin.find(searchQuery)
    .select('nom prenom specialite localite photo anneeExperience nationalite') // ✅ champs complets
    .limit(limit)
    .lean();

    
    return medecins.map(medecin => ({
        type: 'medecin',
        original: `${medecin.prenom} ${medecin.nom}`,
        data: medecin,
        score: calculateMedecinScore(medecin, query)
    }));
}

// Combinaison et classement des résultats
function combineAndRankResults({ exact, fuzzy, phonetic, medecins, query }) {
    const allResults = [
        ...exact.map(r => ({ ...r, method: 'exact', boost: 1.0 })),
        ...fuzzy.map(r => ({ ...r, method: 'fuzzy', boost: 0.8 })),
        ...phonetic.map(r => ({ ...r, method: 'phonetic', boost: 0.6 })),
        ...medecins.map(r => ({ ...r, method: 'medecin', boost: 0.9 }))
    ];
    
    // Déduplication basée sur le contenu original
    const uniqueResults = new Map();
    allResults.forEach(result => {
          if (!result.original) {
        console.warn('Warning: result.original is undefined:', result);
        return; // skip this entry
    }
        const key = result.original.toLowerCase();
        if (!uniqueResults.has(key) || uniqueResults.get(key).score < result.score) {
            uniqueResults.set(key, {
                ...result,
                finalScore: result.score * result.boost
            });
        }
    });
    
    return Array.from(uniqueResults.values())
        .sort((a, b) => b.finalScore - a.finalScore);
}

// Génération intelligente des lettres suivantes
function generateSmartNextLetters(query, results) {
    const nextLetters = new Set();
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    
    // Analyse des résultats existants
    results.forEach(result => {
        const normalized = normalizeSearchText(result.original);
        if (normalized.length > query.length) {
            const nextChar = normalized.charAt(query.length);
            if (nextChar && alphabet.includes(nextChar)) {
                nextLetters.add(nextChar.toUpperCase());
            }
        }
    });
    
    // Si pas assez de lettres, analyse globale
    if (nextLetters.size < 5) {
        const globalNext = getNextLetters(query, [
            ...searchCache.baseData.allSpecialites,
            ...searchCache.baseData.allNoms,
            ...searchCache.baseData.allPrenoms,
            ...searchCache.baseData.allLocalites
        ]);
        
        globalNext.forEach(letter => nextLetters.add(letter));
    }
    
    return Array.from(nextLetters).sort().slice(0, 8);
}

// Fonctions utilitaires
function getRelevantIndexes(type) {
    const { prefixIndex } = searchCache;
    
    switch (type) {
        case 'specialites': return [prefixIndex.specialites];
        case 'medecins': 
        case 'noms': return [prefixIndex.noms];
        case 'localites': return [prefixIndex.localites];
        case 'all': 
        default: return Object.values(prefixIndex);
    }
}

function formatSuggestion(match) {
    return {
        text: match.original,
        type: match.type || 'suggestion',
        score: match.score,
        ...(match.data && { data: match.data })
    };
}

function calculatePrefixScore(prefix, term) {
    const ratio = prefix.length / term.length;
    const position = term.indexOf(prefix);
    return (ratio * 50) + (position === 0 ? 30 : 10);
}

function calculateFuzzyScore(prefix, term) {
    const distance = levenshteinDistance(prefix, term);
    return Math.max(0, 40 - (distance * 10));
}

function calculateMedecinScore(medecin, query) {
    let score = 0;
    const fields = ['nom', 'prenom', 'specialite', 'localite'];
    
    fields.forEach(field => {
        if (medecin[field]) {
            const fieldValue = normalizeSearchText(medecin[field]);
            const queryNorm = normalizeSearchText(query);
            
            if (fieldValue.includes(queryNorm)) {
                score += field === 'nom' || field === 'prenom' ? 40 : 30;
            }
            
            if (fieldValue.startsWith(queryNorm)) {
                score += 20;
            }
        }
    });
    
    return score;
}

function analyzeQuery(query) {
    return {
        length: query.length,
        isNumeric: /^\d+$/.test(query),
        hasSpaces: query.includes(' '),
        hasSpecialChars: /[^a-zA-Z0-9\s]/.test(query),
        estimatedType: estimateQueryType(query)
    };
}

function estimateQueryType(query) {
    const normalized = normalizeSearchText(query);
    const { allSpecialites, allNoms, allPrenoms } = searchCache.baseData;
    
    if (allSpecialites.some(s => normalizeSearchText(s).startsWith(normalized))) {
        return 'specialite';
    }
    if (allNoms.some(n => normalizeSearchText(n).startsWith(normalized))) {
        return 'nom';
    }
    if (allPrenoms.some(p => normalizeSearchText(p).startsWith(normalized))) {
        return 'prenom';
    }
    
    return 'unknown';
}

// Gestion des statistiques
function updateSearchStats(query, results) {
    const stats = searchCache.stats;
    
    // Recherches populaires
    const count = stats.popularSearches.get(query) || 0;
    stats.popularSearches.set(query, count + 1);
    
    // Préfixes communs
    for (let i = 1; i <= query.length; i++) {
        const prefix = query.substring(0, i);
        const prefixCount = stats.commonPrefixes.get(prefix) || 0;
        stats.commonPrefixes.set(prefix, prefixCount + 1);
    }
    
    // Nettoyage périodique des stats
    if (stats.popularSearches.size > 1000) {
        const sorted = [...stats.popularSearches.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 500);
        stats.popularSearches.clear();
        sorted.forEach(([key, value]) => stats.popularSearches.set(key, value));
    }
}

function getSearchStatistics(query) {
    const stats = searchCache.stats;
    return {
        popularSearches: [...stats.popularSearches.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10),
        relatedPrefixes: [...stats.commonPrefixes.entries()]
            .filter(([prefix]) => prefix.startsWith(query.substring(0, 2)))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
    };
}

async function getInitialSuggestions(type, limit) {
    await updateBaseCache();
    
    const suggestions = {
        specialitesPopulaires: searchCache.baseData.allSpecialites.slice(0, 8),
        localitesPopulaires: searchCache.baseData.allLocalites.slice(0, 6),
        lettresInitiales: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    };
    
    return {
        success: true,
        message: "Tapez pour commencer la recherche",
        suggestions,
        searchReady: true
    };
}

async function loadSearchStatistics() {
    // Ici vous pourriez charger les statistiques depuis une base de données
    console.log('📊 Statistiques de recherche chargées');
}

// Auto-complétion avancée
export const autocompletionAvancee = async (req, res) => {
    try {
        await updateBaseCache();
        
        const { 
            query, 
            context = '',
            limit = 10,
            includePhonetic = true 
        } = req.query;
        
        if (!query || query.length < 1) {
            return res.status(400).json({
                success: false,
                message: "Paramètre 'query' requis"
            });
        }
        
        const results = await performAdvancedAutocompletion(query, {
            context,
            limit: parseInt(limit),
            includePhonetic: includePhonetic === 'true'
        });
        
        return res.json({
            success: true,
            query,
            ...results
        });
        
    } catch (error) {
        console.error('❌ Erreur autocomplétion avancée:', error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

async function performAdvancedAutocompletion(query, options) {
    const { context, limit, includePhonetic } = options;
    const normalized = normalizeSearchText(query);
    
    // Recherche contextuelle si contexte fourni
    let contextualResults = [];
    if (context) {
        contextualResults = getContextualSuggestions(normalized, context, limit);
    }
    
    // Recherche standard
    const standardResults = await performProgressiveSearch(normalized, {
        type: 'all',
        limit: limit - contextualResults.length,
        fuzzyEnabled: true,
        phoneticEnabled: includePhonetic
    });
    
    return {
        contextual: contextualResults,
        standard: standardResults.suggestions,
        nextLetters: standardResults.nextLetters,
        totalSuggestions: contextualResults.length + standardResults.suggestions.length
    };
}

function getContextualSuggestions(query, context, limit) {
    // Implémentation de suggestions contextuelles
    // Par exemple, si le contexte est "cardiologue", suggérer des termes liés
    const contextMap = {
        'cardiologue': ['cardiologie', 'cœur', 'cardiovasculaire'],
        'pediatre': ['pédiatrie', 'enfant', 'nourrisson'],
        'dermatologue': ['dermatologie', 'peau', 'allergie']
    };
    
    const contextTerms = contextMap[normalizeSearchText(context)] || [];
    return contextTerms
        .filter(term => normalizeSearchText(term).includes(query))
        .slice(0, limit)
        .map(term => ({
            text: term,
            type: 'contextual',
            score: 90
        }));
}

// Initialisation au démarrage
initializeSearchSystem();

// Export des fonctions principales
export {
    initializeSearchSystem,
    performProgressiveSearch,
    getSearchStatistics
};