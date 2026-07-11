# Tayamo Sport

Site web de Tayamo Sport — club sportif proposant des activités et réservations en ligne.

## Technologies

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM + PostgreSQL
- Resend (emails transactionnels)
- Bilingue : Arabe (RTL) + Français (LTR)

## Prérequis

- Node.js >= 18
- PostgreSQL
- Compte [Resend](https://resend.com) pour les emails

## Installation

```bash
npm install
```

## Configuration

Copiez le fichier `.env.example` en `.env` et remplissez les variables :

```bash
cp .env.example .env
```

| Variable          | Description                          |
| ----------------- | ------------------------------------ |
| `DATABASE_URL`    | URL de connexion PostgreSQL          |
| `RESEND_API_KEY`  | Clé API Resend                       |
| `ADMIN_PASSWORD`  | Mot de passe pour l'interface admin  |

## Base de données

```bash
npx prisma migrate dev --name init
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```
"# tayamo" 
