# Guia de Configuració i Desplegament

## Configuració Local (Docker)

La forma més senzilla d'aixecar el projecte en local és utilitzant Docker.

### 1. Clonar i preparar
```bash
git clone <url-del-repositori>
cd gresca-timetracker
cp .env.example .env
```

### 2. Configurar variables d'entorn
Edita el fitxer `.env` amb les teves credencials de GitHub OAuth i genera un `NEXTAUTH_SECRET`.

### 3. Aixecar el projecte
```bash
docker compose up -d
docker exec gresca-timetracker npx prisma migrate deploy
```
L'aplicació estarà disponible a `http://localhost:3000`.

---

## Desplegament a Producció (VPS Ubuntu)

Aquest projecte està configurat per ser desplegat en un VPS propi mitjançant Docker Compose.

### 1. Preparació del VPS
1. Instal·la Docker i Docker Compose.
2. Clona el repositori: `git clone <url> ~/gresca-timetracker`.
3. Crea el fitxer `.env` manualment al servidor amb les dades de producció.
4. Ajusta el `nginx.conf` amb el teu domini real.

### 2. Secrets de GitHub
Afegeix aquests secrets a `Settings > Secrets and variables > Actions`:
- `SSH_HOST`: IP del servidor.
- `SSH_USER`: Usuari (ex: root).
- `SSH_KEY`: Clau privada SSH.

### 3. Configuració de GitHub OAuth per a Producció
Recorda configurar la **Authorization callback URL** a GitHub com:
`https://el-teu-domini.com/api/auth/callback/github`

### 4. Primers Passos en Producció (Crear Admin)
El primer usuari que faci login haurà de ser marcat com a `ADMIN` manualment des de la terminal del VPS:
```bash
docker exec -it gresca-db psql -U gresca_admin -d gresca_track -c "UPDATE \"User\" SET role = 'ADMIN', status = 'APPROVED' WHERE email = 'el-vostre-email@gmail.com';"
```

---

## CI/CD (GitHub Actions)

Cada vegada que es fa un `push` a `main`, el workflow `.github/workflows/deploy.yml`:
1. Valida el codi (Linting).
2. Es connecta via SSH al VPS.
3. Actualitza el codi (`git pull`).
4. Reconstrueix la imatge i reinicia els contenidors (`docker compose up -d --build`).
5. Executa les migracions de Prisma (`prisma migrate deploy`).
