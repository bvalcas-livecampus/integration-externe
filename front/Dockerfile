# Étape unique: Utilisation de Node.js pour exécuter l'application
FROM node:20

# Définir le répertoire de travail pour l'exécution
WORKDIR /app

# Ajouter les arguments de build pour les variables locales
ARG DN_front
ARG SECRET_KEY_SESSION
ARG SECRET_KEY_AUTH
ARG DN_auth
ARG DN_pdf
ARG DN_client

# Définir des variables d'environnement à partir des arguments
ENV DN_front=$DN_front
ENV SECRET_KEY_SESSION=$SECRET_KEY_SESSION
ENV SECRET_KEY_AUTH=$SECRET_KEY_AUTH
ENV DN_auth=$DN_auth
ENV DN_pdf=$DN_pdf
ENV DN_client=$DN_client

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
