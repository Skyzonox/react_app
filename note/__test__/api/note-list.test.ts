// Test de récupération de toutes les notes
import { getToken, saveNoteId } from '../utils/api-utils';
// Ajouter node-fetch pour les environnements Node.js
import fetch from 'node-fetch';

describe('API Notes List', () => {
    test('récupération des notes avec le token', async () => {
        try {
            // Récupérer le token depuis le test précédent
            const authToken = getToken();
            console.log('Token utilisé:', authToken);

            // Appel API pour récupérer les notes
            const response = await fetch('https://keep.kevindupas.com/api/notes', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            // Afficher le statut de la réponse
            console.log('Statut de la réponse:', response.status);

            // Vérifier que la requête a réussi
            expect(response.ok).toBe(true);

            // Récupérer le texte brut puis le parser
            const rawText = await response.text();
            console.log('Début de la réponse brute:', rawText.substring(0, 100));

            // Parser le JSON manuellement
            const responseData = JSON.parse(rawText);

            // Vérifier la structure de la réponse
            expect(responseData).toBeDefined();
            expect(responseData.data).toBeDefined();
            expect(Array.isArray(responseData.data)).toBe(true);

            // Extraire le tableau de notes
            const notes = responseData.data;

            // Afficher les notes pour démo
            console.log(`${notes.length} notes récupérées`);
            if (notes.length > 0) {
                console.log('Première note:', notes[0]);
            }

            // Si nous avons des notes, sauvegarder l'ID de la première pour le test suivant
            if (notes.length > 0) {
                saveNoteId(notes[0].id);
                console.log('ID de note sauvegardé:', notes[0].id);
            } else {
                console.log('Aucune note trouvée, création d\'une nouvelle note...');
                // Si pas de notes, créer une note pour le test suivant
                const createResponse = await fetch('https://keep.kevindupas.com/api/notes', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'Note de test',
                        content: 'Contenu créé pour les tests'
                    })
                });

                const createRawText = await createResponse.text();
                console.log('Réponse de création:', createRawText);

                const newNote = JSON.parse(createRawText);
                expect(createResponse.ok).toBe(true);
                expect(newNote.id).toBeDefined();

                saveNoteId(newNote.id);
                console.log('Note créée avec ID:', newNote.id);
            }
        } catch (error) {
            console.error('Erreur lors du test:', error);
            throw error;
        }
    }, 15000);
});