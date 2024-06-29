# integration-externe
Sujet Intégration Externe

- Sergio GONZALEZ
- Cyril BARTZ
- Bryan VALCASARA

## Le projet est constitué de 4 dossiers
- authentification
- client
- pdf
- front

Pour chaque projet installer les modules

```
npm install -y
```

Puis lancer chaque projet séparément

```
npm run start
```

# authentification
Il s'agit du serveur back-end qui s'occupe de l'authentification

Il est sera accessible avec l'url http://localhost:3000

# client
Il s'agit du code front-end que le client final recoit

Il est sera accessible avec l'url http://localhost:5173/

# pdf
Il s'agit du serveur back-end qui s'occupe de la gestion des pdfs

Il est sera accessible avec l'url http://localhost:3001/

# front
Il s'agit du serveur back-end qui communique avec le front-end `client`, le back-end `authentification` et le back-end `pdf`

Il est sera accessible avec l'url http://localhost:3002/