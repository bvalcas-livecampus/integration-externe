# fork integration-externe
Sujet Intégration Externe

- Sergio GONZALEZ
- Cyril BARTZ
- Bryan VALCASARA

## Le projet est constitué de 4 dossiers
- authentification
- client
- pdf
- front

Chaque dossier est pourvu d'un Dockerfile qui permet à chaque projet de pouvoir être lancé rapidement et simplement via une commande Docker.

Les variables d'environnements sont récupérés depuis les variables d'environnement système.

Vous pouvez consulté la documentation sur ce projet : https://github.com/bvalcas-livecampus/CI-CD_project/blob/main/README.md

```
docker-compose build
```

```
docker-compose up -d
```

```
docker-compose down
```

Vous devez ajouter ces valeurs à votre DNS local 

```
127.0.0.1   front
127.0.0.1   client
127.0.0.1   pdf
127.0.0.1   auth
```