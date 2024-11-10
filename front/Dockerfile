# Étape unique: Utilisation de Node.js pour exécuter l'application
FROM node:20

# Définir le répertoire de travail pour l'exécution
WORKDIR /app

# Ajouter les arguments de build pour les variables locales
ARG SECRET_KEY_SESSION
ARG SECRET_KEY_AUTH
ARG DN_FRONT
ARG DN_AUTH
ARG DN_PDF
ARG DN_CLIENT

# Définir des variables d'environnement à partir des arguments
ENV SECRET_KEY_SESSION=$SECRET_KEY_SESSION
ENV SECRET_KEY_AUTH=$SECRET_KEY_AUTH
ENV DN_FRONT=$DN_FRONT
ENV DN_AUTH=$DN_AUTH
ENV DN_PDF=$DN_PDF
ENV DN_CLIENT=$DN_CLIENT

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port 3001 (puisque ton application l'utilise)
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]
