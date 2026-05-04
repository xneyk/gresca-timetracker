# Estat del Projecte: Gresca TimeTracker

## Descripció General
**Gresca TimeTracker** és una aplicació de gestió de temps dissenyada per a equips universitaris. Permet el registre precís d'hores de treball, diferenciant entre temps d'activitat real i pauses, tot centralitzat en un dashboard d'equip.

## Funcionalitats Implementades

### 1. Autenticació i Accés
*   **Login amb GitHub**: Integració completa amb NextAuth.
*   **Sistema d'Aprovació**: Els nous usuaris queden en estat `PENDING` fins que un administrador els aprova.
*   **Gestió de Rols**: Diferenciació entre `ADMIN` i `MEMBER`.
*   **Logout**: Funcionalitat de tancament de sessió accessible des de la capçalera.

### 2. Sistema de Time Tracking (Persistent)
*   **Comptador en temps real**: Timer visual que mostra el temps de l'interval actual.
*   **Persistència Total**: El temporitzador no es reinicia en refrescar la pàgina o tancar el navegador; es sincronitza automàticament amb el backend.
*   **Estats**:
    *   **Work (🚀 START WORK / RESUME WORK)**: Registra el temps de treball.
    *   **Break (☕ TAKE A BREAK)**: Atura el temps de treball i registra el temps de descans.
*   **Eliminació de Sessions**: Els usuaris poden eliminar les seves pròpies sessions i els administradors poden eliminar qualsevol sessió, amb diàleg de confirmació per seguretat.
*   **Resum de Sessió**: Timeline detallat en finalitzar, mostrant tots els intervals de treball i descans.

### 3. Dashboards i Visualització
*   **Dashboard Personal**:
    *   Timer actiu.
    *   Estadístiques del dia (Temps total i sessions).
    *   **Timeline en viu**: Visualització dels esdeveniments de la sessió actual en curs.
*   **Dashboard d'Equip (Leaderboard)**:
    *   Rànquing de membres basat en el temps total treballat.
    *   **Filtres Temporals**: Possibilitat de filtrar per Avui, Setmana, Mes o Tot el temps.
    *   **Activitat Recent**: Feed en viu de les últimes sessions finalitzades pels membres.
*   **Perfils Individuals**: Pàgina detallada per a cada membre amb el seu historial de sessions.

### 4. Panell d'Administració
*   **Gestió de Sol·licituds**: Llista de peticions d'accés pendents amb opció d'aprovar o rebutjar.
*   **Gestió de Membres**: Taula amb tots els usuaris on es pot canviar el rol (Admin/Member) de forma dinàmica.

## Arquitectura Tècnica
*   **Framework**: Next.js (App Router).
*   **Llenguatge**: TypeScript.
*   **Estils**: Tailwind CSS amb la font **Plus Jakarta Sans**.
*   **Base de Dades**: PostgreSQL gestionat amb **Prisma ORM**.
*   **Iconografia**: Lucide React (Coet per treball, Cafè per descans, Bandera per finalitzar).

## Estat de les Fases (Action Plan)
*   **Fases 0 a 9**: 100% Completades.
*   **Fase 10 (Testing)**: Lògica de càlcul i edge cases validats.
*   **Fase 11 (Deploy & CD)**: Configurat amb GitHub Actions i DigitalOcean App Platform. Prêt per al primer desplegament.

## Detalls de Disseny
*   **Layout**: Compacte (`max-w-2xl`) per al dashboard per millorar la llegibilitat.
*   **Tipografia**: Plus Jakarta Sans en tot el projecte.
*   **Colors**: Blau (Treball), Ambre (Descans), Vermell (Finalitzar/Danger).
