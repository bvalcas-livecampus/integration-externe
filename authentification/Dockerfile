# Utiliser l'image Node.js officielle
FROM node:20

# Définir le répertoire de travail pour l'application
WORKDIR /app

# Ajouter les arguments de build pour les variables locales
ARG SECRET_KEY
ARG DN_front

# Définir des variables d'environnement
ARG SECRET_KEY=$SECRET_KEY
ENV DN_front=$DN_front

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