# Frontend (React + Vite + TypeScript)

Aplicación web para consultar tu información académica del SII del ITC y simular tu trayectoria con el
**What-If Simulator**.

- Solo habla con **nuestro backend** (`/api/v1`); nunca llama al SII directamente.
- Cada endpoint tiene su propia vista.
- La interfaz sigue el estilo de tarjetas de cristal sobre un fondo degradado animado.

## Tabla de contenido
- [Stack](#stack)
- [Vistas](#vistas)
- [Arquitectura: Feature-Based](#arquitectura-feature-based)
- [Manejo de sesión](#manejo-de-sesión)
- [Despliegue local](#despliegue-local)
- [Scripts](#scripts)
- [Variables de entorno](#variables-de-entorno)
- [Problemas comunes](#problemas-comunes)
- [Despliegue en Vercel](#despliegue-en-vercel)

---

## Stack

| Pieza | Uso |
|---|---|
| **React 19** + **TypeScript** | Interfaz con tipado estricto |
| **Vite 8** | Servidor de desarrollo y *build* |
| **Tailwind CSS v4** | Estilos y *design tokens* (`src/shared/styles/index.css`) |
| **React Router** | Rutas y *guards* (protegida, solo pública, admin) |
| **TanStack Query** | Caché y estados de carga y error de las peticiones |
| **axios** | Cliente HTTP con el token Bearer y el manejo de `401` |
| **zustand** | Sesión en memoria (el token nunca va a `localStorage`/`sessionStorage`) |
| **zod** | Validación del formulario de login |
| **@xyflow/react** | Grafo interactivo de la retícula en el simulador |
| **vitest** · **oxlint** | Pruebas y *lint*; el *lint* hace cumplir las fronteras entre capas |

## Vistas

| Ruta | Vista | Endpoint del backend |
|---|---|---|
| `/login` | Inicio de sesión | `POST /auth/login` |
| `/dashboard` | Perfil, avance de créditos, promedio y agenda de la semana | `GET /students/me` |
| `/calificaciones` | Parciales por materia, semáforo de desempeño y búsqueda en tiempo real | `GET /students/me/grades` |
| `/kardex` | Historial por semestre, promedios y filtros | `GET /students/me/kardex` |
| `/horario` | Agenda semanal (lista en móvil) | `GET /students/me/schedule` |
| `/simulador` | Retícula interactiva, ruta crítica, cuellos de botella y escenarios en vivo | `GET /whatif/analysis` · `POST /whatif/simulate` |
| `/simulador/escenarios` | Escenarios guardados | `GET /whatif/scenarios` |
| `/simulador/escenarios/:id` | Detalle de un escenario | `GET · PUT · DELETE /whatif/scenarios/{id}` |
| `/admin/reticula` | Edición de materias, requisitos y reglas *(solo admins)* | `/admin/*` |

## Arquitectura: Feature-Based

```
src/
├── app/          Arranque: providers, router y guards, layout (AppShell, TopNav)
├── shared/       Sin conocimiento de features: cliente HTTP, kit de UI, utilidades, estilos
└── features/
    ├── auth/  student/  grades/  kardex/  schedule/  whatif/  admin/
    │   ├── api/      Llamadas HTTP al backend y DTOs tipados (sin React)
    │   ├── model/    Tipos y funciones puras: mapeos, filtros, reglas de presentación (con pruebas)
    │   ├── hooks/    Orquestan api + model: TanStack Query y estado de la vista
    │   ├── ui/       Páginas y componentes: solo reciben props y usan hooks, sin lógica de negocio
    │   └── index.ts  API pública de la feature
```

**Separación estricta entre lógica y UI.** `.oxlintrc.json` hace fallar el *lint* si:
- un archivo de `ui/` importa de `api/` o usa `axios` directamente;
- `api/` o `model/` importan React, `ui/` o `hooks/`;
- una feature importa archivos internos de otra feature en lugar de usar su `index.ts`;
- `shared/` importa de una feature.

## Manejo de sesión

- **Access token:** vive **solo en memoria** (store de zustand). No está en `localStorage` ni en
  `sessionStorage`, así que un script inyectado no puede leerlo del almacenamiento.
- **Recargar la página:** la memoria se borra. Al arrancar, la app llama a `POST /auth/refresh`; el
  navegador envía la cookie `HttpOnly` (que JavaScript no puede leer) y el backend devuelve el token.
  Mientras tanto se muestra *"Restaurando sesión…"*. Si no hay cookie o la sesión expiró, va a `/login`.
- **Nuevo login:** cada login reemplaza el token anterior y limpia toda la caché.
- **Logout:** olvida el token y la caché al instante, y llama a `POST /auth/logout` para que el
  servidor revoque la sesión y borre la cookie. Si esa llamada falla, la sesión local se cierra igual.
- **Peticiones:** cada petición envía `Authorization: Bearer <token>`.
- **Expiración (30 min):**
  - un temporizador cierra la sesión y redirige a `/login` con el mensaje *"Tu sesión expiró"*;
  - un `401` del backend hace lo mismo;
  - la barra superior muestra el tiempo restante.
- **Después de volver a iniciar sesión**, regresas a la vista donde estabas.

---

## Despliegue local

### Requisitos
- **Node.js 20 o superior** y npm. Revisa tu versión con `node -v`.
- El **backend corriendo** en `http://localhost:8000`. Consulta [`../backend/README.md`](../backend/README.md).

### Flujo

```
1. Levantar el backend  →  2. Instalar dependencias  →  3. Configurar .env
        →  4. Levantar Vite  →  5. Iniciar sesión con tu cuenta del SII
```

**1. Backend.** En otra terminal, sigue el flujo del README del backend hasta que
<http://localhost:8000/health> responda `{"status":"ok"}`.

**2. Instalar dependencias** (desde la raíz del repositorio):

```bash
cd frontend
npm install
```

**3. Configurar variables de entorno:**

```bash
cp .env.example .env
```

Por defecto apunta a `VITE_API_BASE_URL=http://localhost:8000/api/v1`.

**4. Levantar el servidor de desarrollo:**

```bash
npm run dev
```

Abre <http://localhost:5173>.

**5. Iniciar sesión** con tu correo institucional y tu contraseña del SII. El backend las valida contra
el SII; ni el frontend ni el backend guardan la contraseña.

> Si cambias `.env`, reinicia `npm run dev`. Vite solo lee las variables al arrancar.

### Revisar antes de hacer *commit*

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con *hot reload* |
| `npm run build` | Revisión de tipos y *build* de producción en `dist/` |
| `npm run preview` | Sirve el *build* de `dist/` localmente |
| `npm run lint` | oxlint, incluidas las reglas de fronteras entre capas |
| `npm run typecheck` | `tsc` sin generar archivos |
| `npm test` / `npm run test:watch` | Pruebas con vitest |

## Variables de entorno

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | local: `http://localhost:8000/api/v1` · Vercel: `/api/v1` | URL base de **nuestro** backend; nunca la del SII |

La variable se incrusta en el código al compilar. Si la cambias en Vercel, hay que volver a desplegar.

## Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| Error de CORS en la consola | El backend no tiene este origen en `CORS_ORIGINS`. En local es `http://localhost:5173`. |
| "El SII no está disponible" | El SII no respondió a tiempo o el backend está apagado. Revisa `/health` del backend. |
| Las peticiones van a `localhost` en producción | Falta `VITE_API_BASE_URL` en Vercel (revisa el nombre exacto) o no se volvió a desplegar. |
| Al recargar siempre pide login | La cookie no llega: en Vercel usa `VITE_API_BASE_URL=/api/v1` (proxy) en lugar de la URL de Render. |
| El primer login en producción tarda unos 40 s | Render (plan gratuito) estaba dormido. Abre `/health` antes de usar la app. |

## Despliegue en Vercel

- **Root Directory:** `frontend`. Vercel detecta el *preset* de Vite.
- **Variable:** `VITE_API_BASE_URL=/api/v1`, o no la definas: un *build* de producción usa `/api/v1` por defecto. **No** pongas la URL de Render: el navegador trataría la cookie como de terceros y la descartaría.
- **Proxy:** `vercel.json` reenvía `/api/*` a `https://backend-examen-3.onrender.com/api/*`. Así el
  navegador ve frontend y API en el mismo sitio y acepta la cookie de refresh (Safari y Chrome bloquean
  cookies de terceros). Si cambias el servicio de Render, actualiza esa URL.
- **Rutas:** `vercel.json` redirige el resto de rutas a `index.html`. Así, recargar en `/kardex` u otra
  ruta no da 404.
- **Auto-deploy:** cada *push* a la rama de producción vuelve a desplegar.
