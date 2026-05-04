# Gresca TimeTracker

**Gresca TimeTracker** és una aplicació web moderna per al seguiment de temps de treball en equip, optimitzada per a projectes col·laboratius on la transparència i la precisió són clau.

## 🚀 Funcionalitats Clau

- **Persistent & Real-time**: El comptador no s'atura ni es perd en tancar la sessió o refrescar la pàgina.
- **Treball vs. Descans**: Registre detallat de segments de treball i pauses per a mètriques reals.
- **Dashboard d'Equip**: Leaderboard dinàmic, activitat recent visual i estadístiques globals.
- **Control d'Accés**: Integració amb GitHub OAuth i sistema d'aprovació d'usuaris per part d'administradors.
- **Admin Panel**: Gestió total d'usuaris, rols i sol·licituds d'accés.

## 🛠️ Stack Tecnològic

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4.
- **Backend**: Next.js Server Actions & API Routes.
- **Base de Dades**: PostgreSQL amb Prisma ORM.
- **Autenticació**: NextAuth.js.

## 📖 Documentació Detallada

Per a més informació, consulteu els fitxers a la carpeta `.docs/`:

- [Especificacions i Requisits](.docs/app-requirements.md)
- [Guia de Configuració i Desplegament](.docs/setup-guide.md)
- [Estat del Projecte i Roadmap](.docs/project-status.md)

## 🛠️ Configuració Ràpida (Docker)

1. Configura el fitxer `.env` (mira la [guia de configuració](.docs/setup-guide.md)).
2. Aixeca el projecte: `docker compose up -d`
3. Executa migracions (primera vegada): `docker exec gresca-app npx prisma migrate deploy`


---
Desenvolupat per a equips que valoren el seu temps.
