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

Per a més informació, consulteu els fitxers a la carpeta `.gemini-agent/`:

- [Especificacions i Requisits](.gemini-agent/app-requirements.md)
- [Guia de Configuració i Desplegament](.gemini-agent/setup-guide.md)
- [Estat del Projecte i Roadmap](.gemini-agent/project-status.md)

## 🛠️ Configuració Ràpida

1. Instal·la dependències: `npm install`
2. Configura el fitxer `.env` (mira la [guia de configuració](.gemini-agent/setup-guide.md)).
3. Executa migracions: `npx prisma migrate dev`
4. Inicia en mode desenvolupament: `npm run dev`

---
Desenvolupat per a equips que valoren el seu temps.
