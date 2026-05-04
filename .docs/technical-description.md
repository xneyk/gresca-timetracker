# Descripció Tècnica del Sistema — Gresca TimeTracker

Aquest document detalla l'arquitectura, el flux de dades i les decisions tècniques preses en el desenvolupament de l'aplicació.

## 1. Arquitectura de l'Aplicació
L'aplicació està construïda sobre **Next.js 15**, utilitzant el **App Router**. Es basa en un model de comunicació híbrid entre **Server Components** per a la renderització inicial i **Client Components** per a la interactivitat en temps real.

### Estructura de Capes:
- **Frontend (UI)**: Components de React amb Tailwind CSS 4 per a estils atòmics i moderns.
- **Lògica de Negoci (Backend)**: Implementada mitjançant **Server Actions** (`src/lib/actions/`). Això permet cridar funcions del servidor directament des dels components de client de forma tipada i segura.
- **Persistència (Database)**: PostgreSQL gestionat a través de l'ORM **Prisma**.

---

## 2. Flux de Dades i Comunicació

### Gestió de Sessions de Treball
A diferència d'altres trackers que guarden l'estat localment, Gresca TimeTracker prioritza la **persistència absoluta**:
1. **Inici**: Es crea un registre a `WorkSession` i un primer esdeveniment a `SessionEvent` de tipus `WORK`.
2. **Interactivitat**: El client rep el `startedAt` del servidor. El cronòmetre (`TimeTracker.tsx`) calcula la diferència entre l'hora actual del sistema i el `startedAt` guardat a la base de dades.
3. **Pausa/Represa**: Cada canvi d'estat tanca l'esdeveniment actual (posant un `endedAt`) i en crea un de nou.
4. **Finalització**: Es tanquen tots els esdeveniments oberts i es calcula el `totalWorkedTime` sumant només els segments de tipus `WORK`.

### Sincronització
S'utilitza `revalidatePath` de Next.js per assegurar que, en fer qualsevol acció (com començar o aturar una sessió), les dades de l'Historial i del Dashboard d'Equip s'actualitzin automàticament sense necessitat de recarregar la pàgina.

---

## 3. Seguretat i Autenticació

### NextAuth + GitHub OAuth
L'autenticació es gestiona amb **NextAuth.js**. En fer login:
- S'utilitza el compte de GitHub com a font de veritat.
- El perfil de l'usuari es guarda a la taula `User` de la base de dades.

### Middleware i Autorització
- **Access Control**: S'ha implementat un sistema d'estats (`PENDING`, `APPROVED`, `REJECTED`).
- **Middleware**: Un middleware de Next.js s'encarrega de protegir les rutes. Si un usuari no està loguejat, és redirigit a la pàgina de sign-in.
- **Rols**: Els administradors tenen accés exclusiu a `/admin` i poden veure/eliminar sessions de qualsevol membre mitjançant Server Actions que validen el rol del `getServerSession`.

---

## 4. Stack Tecnològic Detallat

| Tecnologia | Funció | Raonament |
| :--- | :--- | :--- |
| **Next.js 15** | Framework Fullstack | Millor rendiment amb RSC i Server Actions. |
| **TypeScript** | Llenguatge | Seguretat en el tipat de dades en tota la pila. |
| **Prisma** | ORM | Productivitat i gestió senzilla de migracions. |
| **PostgreSQL** | Base de dades | Robustesa i suport natiu per a relacions complexes. |
| **Tailwind CSS 4** | Estils | Rapidesa en el disseny i zero CSS runtime. |
| **Lucide React** | Iconografia | Llibreria d'icones lleugera i consistent. |

---

## 5. Lògica Temporal (Timezones)
L'aplicació guarda totes les dates en format **UTC+0** a la base de dades per garantir la integritat de les dades.
- **Backend**: Utilitza `Intl.DateTimeFormat` amb la zona `Europe/Madrid` per calcular els límits de "Today", "Week" i "Month" segons el context de l'usuari final, convertint-ho després a UTC per a la consulta a la DB.
- **Frontend**: `date-fns` s'encarrega de renderitzar les dates UTC en l'hora local del navegador de cada membre de l'equip.

---

## 6. CI/CD i Infraestructura
- **GitHub Actions**: Pipeline automatitzat per a Linting i validació de Build en cada Push.
- **DigitalOcean App Platform**: Hosting gestionat que escala automàticament i ofereix integració nativa amb bases de dades gestionades.
- **Prisma Migrate**: Les migracions s'executen durant el procés de deploy (`npx prisma migrate deploy`) per assegurar que l'schema de producció estigui sempre sincronitzat amb el codi.
