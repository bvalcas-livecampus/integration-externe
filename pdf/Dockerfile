# Utilisation de l'image officielle Node.js
FROM node:20

# Définir le répertoire de travail
WORKDIR /app

# Ajouter les arguments de build pour les variables locales
ARG DN_front

# Définir des variables d'environnement
ENV DN_front=front

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port 3002
EXPOSE 3002

# Démarrer l'application
CMD ["npm", "start"]
