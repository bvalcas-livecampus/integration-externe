# Étape unique: Utilisation de Node.js pour exécuter l'application
FROM node:20

# Définir le répertoire de travail pour l'exécution
WORKDIR /app

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
