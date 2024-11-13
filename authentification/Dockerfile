# Utiliser l'image Node.js officielle
FROM node:20

# Définir le répertoire de travail pour l'application
WORKDIR /app

# Ajouter les arguments de build pour les variables locales
ARG SECRET_KEY_AUTH
ARG DN_FRONT

# Définir des variables d'environnement
ENV SECRET_KEY_AUTH=$SECRET_KEY_AUTH
ENV DN_FRONT=$DN_FRONT

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]