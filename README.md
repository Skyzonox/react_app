# Application de Notes React Native 📱📝

## Description
Application mobile de prise de notes et de création de tâches développée avec React Native et Expo. Les notes sont synchronisées via une API web avec interface d'administration pour la gestion.

## Fonctionnalités
- **Prise de notes** - Créer et éditer des notes texte
- **Gestion des tâches** - Todo list avec cases à cocher
- **Synchronisation cloud** - Sauvegarde via API REST
- **Interface admin** - Gestion des notes via navigateur web
- **Authentification** - Connexion utilisateur requise

## Technologies
- **React Native** - Framework mobile multiplateforme
- **Expo** - Plateforme de développement React Native
- **API REST** - Synchronisation des données
- **JavaScript** - Logique applicative

## API et Services
- **API Notes** : `https://keep.kevindupas.com/api/notes`
- **Interface Admin** : `https://keep.kevindupas.com/admin`
- **Authentification** requise pour accéder aux données

## Installation et développement
```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en mode développement
expo start

# 3. Scanner le QR code avec Expo Go
# ou utiliser un émulateur
```

## Utilisation
1. **Se connecter** via l'app mobile
2. **Créer des notes** et tâches localement
3. **Synchroniser** avec l'API cloud
4. **Gérer** via l'interface admin web si besoin

## Structure de l'API
- **POST /api/notes** - Créer une note
- **GET /api/notes** - Récupérer les notes
- **PUT /api/notes** - Modifier une note
- **DELETE /api/notes** - Supprimer une note

## Interface d'administration
- Accès via navigateur web
- Gestion complète des notes utilisateur
- Interface responsive
- Connexion sécurisée requise

## Compétences développées
- Développement mobile React Native
- Intégration d'API REST
- Gestion d'état avec React
- Interface utilisateur mobile
