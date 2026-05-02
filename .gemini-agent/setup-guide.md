# Guia de Configuració i Desplegament

## Configuració Local (Desenvolupament)

Seguiu aquests passos per aixecar el projecte en el vostre entorn local.

### 1. Clonar el repositori i instal·lar dependències
```bash
git clone <url-del-repositori>
cd gresca-timetracker
npm install
```

### 2. Variables d'Entorn
Creeu un fitxer `.env` a l'arrel del projecte amb el següent contingut:

```env
# Base de Dades (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/gresca_db"

# NextAuth (Seguretat)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="un-secret-molt-llarg-i-segur" # Podeu generar-ne un amb `openssl rand -base64 32`

# GitHub OAuth
GITHUB_ID="el-vostre-github-client-id"
GITHUB_SECRET="el-vostre-github-client-secret"
```

### 3. Configuració de la Base de Dades
Aixequeu una instància de PostgreSQL (podeu usar el `docker-compose.yml` inclòs) i executeu les migracions de Prisma:

```bash
docker-compose up -d
npx prisma migrate dev --name init
```

### 4. Executar el projecte
```bash
npm run dev
```
L'aplicació estarà disponible a `http://localhost:3000`.

---

## Desplegament a Producció (Vercel)

El projecte està optimitzat per ser desplegat a **Vercel**.

### 1. Base de Dades
Necessitareu una base de dades PostgreSQL accessible des d'internet (Vercel Postgres, Supabase, Railway, etc.). Obteniu la cadena de connexió (`DATABASE_URL`).

### 2. Configurar GitHub OAuth per a Producció
1. Aneu a GitHub -> Settings -> Developer Settings -> OAuth Apps.
2. Creeu una nova App o actualitzeu la existent.
3. **Homepage URL**: `https://el-vostre-domini.vercel.app`
4. **Authorization callback URL**: `https://el-vostre-domini.vercel.app/api/auth/callback/github`

### 3. Desplegament
1. Connecteu el vostre repositori a Vercel.
2. Afegiu les variables d'entorn definides al punt anterior (assegureu-vos que `NEXTAUTH_URL` apunti al domini de producció).
3. Vercel detectarà automàticament que és un projecte Next.js.
4. Afegiu el següent comando de Build per assegurar que Prisma genera el client correctament:
   `prisma generate && next build`

### 4. Primers Passos en Producció
1. El primer usuari que faci login haurà de ser marcat com a `ADMIN` manualment a la base de dades per poder aprovar la resta d'usuaris:
   ```sql
   UPDATE "User" SET role = 'ADMIN', status = 'APPROVED' WHERE email = 'el-vostre-email@gmail.com';
   ```

---

## Manteniment

### Actualitzar l'Schema de la Base de Dades
Si feu canvis a `schema.prisma`:
1. `npx prisma migrate dev` (en local)
2. El deploy automàtic de Vercel (si està configurat amb el comando de build anterior) no executa migracions. Cal executar `npx prisma migrate deploy` manualment o mitjançant una GitHub Action abans del deploy.
