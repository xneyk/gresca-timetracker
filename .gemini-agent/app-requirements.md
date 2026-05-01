# Gresca Track — Sistema de Time Tracking per Projectes Universitaris

## Metodologia a seguir
El document **action-plan.json** conté el plà d'acció a realitzar. Cada tasca té un atribut progress el qual es troba en:

* "to-be-done" si no s'ha començat
* "in-progress" tant mateix com es comença a treballar en dita tasca
* "done" quan es finalitza.

Cal mantenir-lo actualitzat.

## Descripció del projecte

**Gresca TimeTrack** és una aplicació de time tracking pensada per a equips de treball universitaris que necessiten registrar de forma senzilla, precisa i automatitzada les hores dedicades a un projecte.

La idea neix d’un problema molt habitual: haver d’apuntar manualment les hores de treball (hora d’inici, pauses i hora de finalització), fet que genera interrupcions, errors i pèrdua de concentració.

Aquesta eina permetrà als membres de l’equip:

* Iniciar sessió amb el seu compte de GitHub
* Començar una sessió de treball amb un sol clic
* Pausar la sessió quan facin un descans (doncs el timer mostrara el temps que portes actualment en descans).
* Reprendre la sessió quan tornin (el timer mostrara doncs el temps que portes desde que has représ la sessió).
* Finalitzar la sessió i obtenir un resum detallat del temps invertit
* Consultar les sessions pròpies i les de la resta de membres de l’equip

---

## Problema a resoldre

Actualment, el registre manual del temps presenta diversos inconvenients:

* Obliga a mirar constantment l’hora
* És fàcil oblidar pauses o reinicis
* Pot generar errors en el recompte total
* Trenca el flux de treball
* Fa més difícil justificar hores invertides en el projecte
* No hi ha visibilitat global de la dedicació de l’equip

---

## Solució proposada

Desenvolupar una aplicació web simple i ràpida que automatitzi el registre del temps de treball i centralitzi tota l’activitat de l’equip en un dashboard compartit.

El funcionament seria:

1. L’usuari entra a l’aplicació
2. Fa login amb GitHub
3. Si és un usuari nou, queda pendent d’aprovació per un administrador
4. Si està autoritzat, pot accedir al sistema
5. Prem **Start session**
6. El sistema comença a comptar temps
7. Si necessita descansar:

   * prem **Take a break**
   * el temps de treball s’atura
   * es registra el temps de descans
8. Quan torna:

   * prem **Resume work**
   * continua comptant el temps de treball
9. Quan acaba:

   * prem **Finish session**
   * es genera un resum complet
10. Les dades passen a estar visibles al dashboard de l’equip

---

## Sistema d’accés privat (control d’usuaris)

Tot i que l’aplicació estarà desplegada públicament, l’accés funcional ha d’estar restringit exclusivament als membres autoritzats del projecte.

### Model de control d’accés

Quan un usuari fa login amb GitHub per primera vegada:

* El sistema crea una **sol·licitud d’accés**
* El compte queda en estat **pending**
* Un administrador revisa la petició
* Si l’aprova, el compte passa a **approved**
* Només els comptes aprovats poden iniciar sessions de treball

### Estats d’usuari

* `pending` → pendent d’aprovació
* `approved` → accés concedit
* `rejected` → accés denegat
* `admin` → gestió d’usuaris i sistema

### Avantatges

* Manté el projecte privat a nivell funcional
* Permet desplegar-lo públicament sense risc
* Control centralitzat d’accés
* Escalable per futurs membres

---

## Funcionalitats principals

### Autenticació amb GitHub

Permetre iniciar sessió de forma ràpida i segura utilitzant OAuth amb GitHub.

**Flux d’autenticació:**

GitHub Login → Validació → Estat usuari → Accés o espera d’aprovació

---

### Gestió de sessions

Cada usuari pot:

* Iniciar sessió de treball
* Pausar
* Reprendre
* Finalitzar

Cada acció queda registrada amb timestamp.

---

### Sistema de pauses

El sistema diferencia entre:

* Temps real de treball
* Temps de descans

Això permet obtenir mètriques més precises.

---

### Dashboard d’equip

Tots els membres autoritzats poden accedir a un dashboard compartit per visualitzar l’activitat de l’equip.

### Informació visible al dashboard

Per cada membre:

* Sessions realitzades
* Temps total treballat
* Temps total de descans
* Última activitat
* Nombre de sessions

### Visualitzacions possibles

* Hores per dia
* Hores per setmana
* Hores totals per membre
* Ranking de dedicació
* Activitat recent

### Beneficis

* Transparència dins l’equip
* Seguiment global del projecte
* Facilita coordinació i planificació
* Permet detectar desequilibris de càrrega

---

### Panell d’administració

Els administradors poden:

* Aprovar nous usuaris
* Rebutjar accessos
* Veure tots els membres registrats
* Gestionar permisos
* Consultar activitat global

---

### Resum de sessió

En finalitzar una sessió, es mostra un resum estructurat.

## Exemple de resum

```text
Session summary

You have worked on Gresca for: 2h 10min

Started at: 16:00

Working: 47min
Rest: 14min
Working: 1h 23min

Ended at: 18:24
```

---

## Estructura de dades

### User

```json
{
  "id": "uuid",
  "githubId": "12345",
  "name": "Joan",
  "avatar": "url",
  "role": "member",
  "status": "pending"
}
```

### Session

```json
{
  "id": "uuid",
  "userId": "uuid",
  "projectName": "Gresca",
  "startedAt": "timestamp",
  "endedAt": "timestamp",
  "totalWorkedTime": 7800
}
```

### Session Events

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "type": "work | break",
  "startedAt": "timestamp",
  "endedAt": "timestamp"
}
```

### Access Requests

```json
{
  "id": "uuid",
  "userId": "uuid",
  "requestedAt": "timestamp",
  "reviewedBy": "adminId",
  "status": "pending"
}
```

---

## Flux d’usuari

```text
Login → Pending approval → Approved → Start Session → Work → Break → Resume → Finish → Summary → Dashboard
```

---

## Stack tecnològic proposat

### Frontend

* Next.js
* TailwindCSS
* TypeScript

### Backend

* Next.js API Routes

### Base de dades

* PostgreSQL

### ORM

* Prisma

### Autenticació

* NextAuth + GitHub OAuth

### Autorització

* Middleware de validació d’estat d’usuari
* Sistema de rols (admin/member)

### Hosting

* Vercel

---

## MVP (Minimum Viable Product)

Funcionalitats mínimes per la primera versió:

* Login amb GitHub
* Sistema d’aprovació d’usuaris
* Iniciar sessió
* Pausar sessió
* Reprendre sessió
* Finalitzar sessió
* Resum de sessió
* Historial de sessions
* Dashboard d’equip
* Panell d’administració

---

## Visió final

Convertir Gresca Track en una eina interna de control horari per equips de treball que combini simplicitat, control d’accés i transparència col·laborativa.

