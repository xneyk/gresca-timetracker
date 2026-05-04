# Gresca TimeTracker — Especificacions Tècniques i Requisits

## Descripció del Projecte
**Gresca TimeTracker** és una aplicació de gestió de temps (time tracking) dissenyada per a equips de treball que necessiten un registre precís, persistent i compartit de la seva dedicació als projectes.

L'aplicació resol el problema del registre manual d'hores, automatitzant el càlcul de temps de treball i pauses, i centralitzant la informació per fomentar la transparència i la coordinació de l'equip.

## Funcionalitats Principals

### 1. Autenticació i Seguretat
* **GitHub OAuth**: Inici de sessió obligatori amb comptes de GitHub.
* **Sistema de Whitelist**: Els nous usuaris queden en estat `PENDING` i no poden accedir a cap funcionalitat fins que un administrador els aprova.
* **Control de Rols**:
    * `ADMIN`: Pot aprovar usuaris, canviar rols i veure tota l'activitat de l'equip.
    * `MEMBER`: Pot registrar temps i veure l'activitat de l'equip.

### 2. Motor de Seguiment de Temps (Time Tracking)
* **Persistència al Backend**: El temps no es perd en tancar el navegador. Les sessions i els seus esdeveniments (WORK/BREAK) es guarden en temps real.
* **Dualitat Treball/Descans**: Distinció clara entre el temps productiu i les pauses.
* **Resum de Sessió**: Timeline visual que desglossa cada segment de la sessió en finalitzar.

### 3. Visualització de Dades (Dashboards)
* **Dashboard Personal**: Control de la sessió activa i estadístiques diàries.
* **Dashboard d'Equip**: 
    * Leaderboard ordenat per temps total treballat.
    * Filtratge temporal dinàmic (Avui, Setmana, Mes, Tot el temps).
    * Activitat recent amb identificació visual (avatars) de l'equip.
* **Historial Detallat**: Accés al resum de qualsevol sessió passada (pròpia o de l'equip per a usuaris autoritzats).

## Stack Tecnològic

### Core
* **Framework**: [Next.js 15](https://nextjs.org/) (App Router).
* **Llenguatge**: [TypeScript](https://www.typescriptlang.org/).
* **Estils**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern, ràpid i flexible).
* **Iconografia**: [Lucide React](https://lucide.dev/).

### Data & Backend
* **Base de Dades**: PostgreSQL.
* **ORM**: [Prisma](https://www.prisma.io/).
* **Autenticació**: [NextAuth.js v4](https://next-auth.js.org/).

## Model de Dades (Prisma Schema)

### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  image         String?
  role          UserRole  @default(MEMBER)
  status        UserStatus @default(PENDING)
  workSessions  WorkSession[]
}
```

### WorkSession
```prisma
model WorkSession {
  id              String         @id @default(cuid())
  userId          String
  startedAt       DateTime       @default(now())
  endedAt         DateTime?
  totalWorkedTime Int?           // Segons acumulats
  events          SessionEvent[]
}
```

### SessionEvent
```prisma
model SessionEvent {
  id            String      @id @default(cuid())
  workSessionId String
  type          EventType   // WORK | BREAK
  startedAt     DateTime    @default(now())
  endedAt       DateTime?
}
```

## Requisits del Sistema
* Node.js 18.x o superior.
* Instància de PostgreSQL.
* Aplicació OAuth creada a GitHub.
