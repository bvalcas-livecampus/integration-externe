# Étape 1: Construction de l'application Vite.js
FROM node:20 AS builder

# Définir le répertoire de travail pour la construction
WORKDIR /app

# Ajouter les arguments de build pour les variables locales
ARG DN_FRONT

# Définir des variables d'environnement à partir des arguments
ENV VITE_DN_FRONT=$DN_FRONT

# Copier le fichier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./ 

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . . 

# Construire l'application (le résultat sera dans le dossier /app/dist)
RUN npm run build

# Étape 2: Serveur Nginx
FROM nginx:alpine

# Copier les fichiers de construction générés par Vite.js depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier le fichier de configuration Nginx personnalisé (si nécessaire)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 8080 pour servir les fichiers
EXPOSE 8080

# Démarrer Nginx par défaut
CMD ["nginx", "-g", "daemon off;"]
