import express from 'express';
import { rechercheAvanceeParLettre, autocompletionAvancee } from '../controllers/SystemeDeRecherche.controller.js';

const router = express.Router();

// Route pour la recherche avancée par lettre
router.get('/recherche-avancee', rechercheAvanceeParLettre);

// Route pour l'autocomplétion avancée
router.get('/autocompletion-avancee', autocompletionAvancee);

// Route pour tester la recherche
router.get('/test/test-search', async (req, res) => {
    try {
        const searchQuery = req.query.q || 'test';
        const searchType = req.query.type || 'all';
        const searchLimit = req.query.limit || 10;

        const searchResult = await rechercheAvanceeParLettre(
            {
                query: {
                    q: searchQuery,
                    type: searchType,
                    limit: searchLimit,
                    includeStats: true,
                    fuzzyEnabled: true,
                    phoneticEnabled: true
                }
            },
            {
                json: (data) => {
                    res.json({
                        success: true,
                        message: "Test de recherche terminé avec succès",
                        data: data
                    });
                }
            }
        );
    } catch (error) {
        console.error('Erreur lors du test de recherche:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du test de recherche",
            error: error.message
        });
    }
});

// Route pour tester l'autocomplétion
router.get('/test/test-autocomplete', async (req, res) => {
    try {
        const autocompleteQuery = req.query.q || 'test';
        const autocompleteLimit = req.query.limit || 10;

        const autocompleteResult = await autocompletionAvancee(
            {
                query: {
                    query: autocompleteQuery,
                    limit: autocompleteLimit,
                    includePhonetic: true
                }
            },
            {
                json: (data) => {
                    res.json({
                        success: true,
                        message: "Test d'autocomplétion terminé avec succès",
                        data: data
                    });
                }
            }
        );
    } catch (error) {
        console.error('Erreur lors du test d\'autocomplétion:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du test d'autocomplétion",
            error: error.message
        });
    }
});

export default router;
