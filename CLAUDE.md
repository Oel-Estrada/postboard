# CLAUDE.md — Reglas de trabajo de postboard

Prueba técnica para un proceso de selección. Este archivo define qué hay que construir, con qué
herramientas y cómo se trabaja. Es de obligado cumplimiento en todas las fases.

## Enunciado (literal, no se cambia)

App pequeña en React + TypeScript que use https://jsonplaceholder.typicode.com

1. Lista de usuarios con búsqueda por nombre.
2. Al elegir un usuario, ver sus publicaciones y crear una nueva con un formulario validado
   (título y texto obligatorios). La API no guarda datos; basta con que la nueva aparezca en la lista.
3. Estados de carga y de error visibles.
4. Al menos 3 tests con Vitest y Testing Library.
5. README: cómo ejecutarlo, decisiones, qué haría con más tiempo, cómo usé la IA
   (qué le pedí, qué acepté y qué corregí).

Commits progresivos que muestren cómo pienso; nunca un único commit con todo.

## Hechos de la API (comprobados)

- `GET /users` devuelve 10 usuarios.
- `GET /posts?userId={id}` devuelve los posts de ese usuario.
- `GET /users/999` devuelve 404.
- `POST /posts` responde 201, **no guarda nada** y **siempre devuelve `id: 101`**. Por eso cada
  post creado necesita un id local único (`crypto.randomUUID()`) para no repetir `key` en React.

## Stack

- **pnpm** como gestor de paquetes (nunca npm ni yarn).
- **Vite + React 19 + TypeScript** en modo `strict`.
- **Tailwind CSS v4** con `@tailwindcss/vite`: `@import "tailwindcss";` en el CSS y sin
  `tailwind.config.js`.
- **Tests unitarios y de integración:** Vitest, `@testing-library/react`,
  `@testing-library/user-event`, `@testing-library/jest-dom` y jsdom. **MSW** para simular la red.
- **E2E:** `@playwright/test`, solo Chromium, en su propia fase.
- **Datos:** `fetch` nativo y hooks propios.
- No se añade ninguna dependencia fuera de esta lista sin explicar antes por qué y recibir
  aprobación explícita.

## Tests (regla obligatoria)

- Cada función, hook y componente nuevo se crea **con su test en el mismo commit**, siguiendo TDD:
  test en rojo → código mínimo → refactor. Nunca se hace commit de código sin su test.
### Pirámide de tests

El objetivo es demostrar que se sabe testear en las tres capas, no acumular cantidad.

- **Unitarios (la mayoría):** una pieza aislada. Funciones puras, funciones de API y hooks con
  MSW, y componentes que solo pintan.
- **Integración (menos):** varias piezas reales juntas, con MSW: `UsersPanel`, `PostForm`,
  `PostsPanel` y `App`. Se llaman `*.integration.test.tsx`, para que la pirámide se vea en el
  árbol.
- **E2E (muy pocos):** Playwright con la app real y la red simulada con `page.route`; solo
  flujos que cruzan toda la app.
- **Cantidad:** cada test cubre un comportamiento distinto que merezca defenderse. Nada de
  variaciones del mismo caso ni tests de lo trivial (los tipos no se testean).

### Cómo se prueba cada cosa

- **API:** el error HTTP, el error de red y la cancelación con la señal se prueban una sola vez,
  en el cliente común (`request`). Cada función de la API solo comprueba su ruta, su método y
  su cuerpo. Vitest + MSW.
- **Hooks:** `renderHook` + MSW, cubriendo carga, éxito, error y, si aplica, cancelación con
  `AbortController`.
- **Componentes:** Testing Library + user-event, buscando por rol, label o texto. `data-testid`
  solo si no hay otra opción.
- **E2E:** Playwright, con la red simulada mediante `page.route`.
- Vitest no ejecuta la carpeta `e2e/` y Playwright no ejecuta los tests unitarios.
- Un commit por pieza (por ejemplo, un hook con su test), no un commit por fase.

## Seguridad

- `pnpm-workspace.yaml` con `minimumReleaseAge: 1440` y `allowBuilds` solo para paquetes
  revisados y aprobados por el usuario.
- `packageManager` fijado en `package.json`.
- Sin secretos ni archivos `.env`.
- `.gitignore` con `node_modules`, `dist`, `coverage`, `test-results` y `playwright-report`.
- `pnpm audit` antes de entregar.
- Los tests (unitarios y E2E) **nunca** tocan la red real.

## Reglas de código

- `AbortController` para cancelar peticiones que se quedan obsoletas.
- Si `res.ok` es `false`, la respuesta se trata como error.
- **Accesibilidad:**
  - `<label>` asociado a cada input.
  - `aria-describedby` enlazando cada input con su error de validación.
  - `role="alert"` en los mensajes de error.
  - `role="status"` / `aria-live` en los indicadores de carga.
- La búsqueda filtra en el cliente, sin distinguir mayúsculas y quitando espacios.
- La validación rechaza campos vacíos o que solo contienen espacios.

### Textos de la interfaz

- Todo texto visible o accesible (contenido, labels, placeholders, `aria-label`, mensajes de
  error y de estado, título de la página) vive en `src/i18n/messages.ts`. Los componentes nunca
  lo escriben a mano.
- Es un objeto `messages` agrupado por área (`app`, `common`, `users`, `posts`, `form`…), **sin
  `as const`**, para que otro idioma pueda declararse con `satisfies typeof messages`. Los textos
  con datos son funciones (por ejemplo `pageTitle(name)`, `noUsersMatch(query)` o
  `postsCount(count)`).
- Sin librería de i18n ni selector de idioma: el enunciado no lo pide. Va a «qué haría con más
  tiempo».
- Cada pieza añade solo las claves que usa, en su mismo commit.
- Los tests unitarios y E2E importan los textos de `messages` en vez de repetir literales. Las
  funciones de `messages` se prueban a través de los componentes que las usan.
- Única excepción: el `<title>` estático de `index.html`, que se pinta antes de que cargue JS.

### React 19

- Las APIs de React 19 se usan donde aportan, sin forzarlas.
- **Formularios:** se prefieren las actions: `<form action>` con `useActionState`,
  `useFormStatus` para el estado pendiente y `useOptimistic` para mostrar el resultado al
  instante.
- La carga de datos sigue en hooks propios con `useEffect` + `AbortController`. No se usa
  `use()` + Suspense sin una caché, ni `useTransition`/`useDeferredValue` donde no hacen falta
  (por ejemplo, para filtrar 10 usuarios).

### localStorage (lectura defensiva)

- El acceso a `localStorage` y todas sus lecturas y escrituras van en `try/catch`: puede no
  estar disponible, estar lleno o lanzar `SecurityError`.
- `JSON.parse` siempre protegido, y la forma de los datos se valida con un type guard antes de
  usarlos. Los datos no válidos se ignoran sin romper la app.
- Claves con prefijo y versión (`postboard:<nombre>:v1`) para poder cambiar el formato sin
  leer datos antiguos.
- Lo guardado se pinta siempre como texto (nunca `dangerouslySetInnerHTML`).

### Responsive, mobile-first

- Los estilos base son los de móvil; los cambios para pantallas grandes van con los prefijos de
  Tailwind (`md:` en adelante).
- Áreas táctiles de al menos 44 px y sin scroll horizontal a 320 px de ancho.
- Si un cambio de vista en móvil oculta lo que tenía el foco, el foco se mueve de forma
  explícita al nuevo contenido.

### Política de navegadores

- Las features **Baseline «Widely available»** se usan sin fallback.
- Las **Baseline «Newly available»** solo se usan con detección de la feature y un fallback
  simple, sin dependencias nuevas.
- En las fases de UI se consulta la skill `modern-web-guidance` (con `pnpx`) antes de escribir
  formularios y validación, layout responsive y accesibilidad, y se aplica esta política a lo
  que recomiende.

## Idioma

- **En inglés:** nombres de variables, funciones, tipos, componentes, hooks y archivos; JSDoc;
  comentarios; descripciones de los tests (`describe`/`it`/`test`); mensajes de commit; textos de
  la interfaz (en `src/i18n/messages.ts`).
- **En español:** `README.md` y los documentos de decisiones y prompts (`CLAUDE.md`, `AI_LOG.md`,
  `docs/plan.md`, `docs/prompts.md`).
- **JSDoc breve en todo lo exportado** (funciones de API, hooks y componentes): qué hace, sus
  parámetros y qué devuelve o qué errores lanza. No en lo interno ni en lo obvio.

## Forma de trabajar

- Una fase por prompt; dentro de cada fase, un commit por pieza del plan.
- **Commits atómicos:** cada commit hace una sola cosa y pasa por sí solo `pnpm test`,
  `pnpm typecheck`, `pnpm lint` y `pnpm build`. El código va siempre con su test, sin
  excepciones.
- **Cierre de fase:** el prompt de la fase (`docs/prompts.md`) y su entrada en `AI_LOG.md` van
  en su propio commit de docs al cerrar la fase (`docs: log pN prompt and ai decisions`), sin
  mezclarlos con código.
- **Antes de cada commit, PARAR:** explicar qué se hizo y por qué, enseñar `git status` y un diff
  resumido, y esperar el OK del usuario. En los commits de código se enseña además la salida
  real de `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build`, y el test en rojo de la
  pieza.
- Commits con Conventional Commits, en inglés. **Nunca hacer push.**
- Si una decisión tiene alternativas, dar una recomendación en 1-2 frases y seguir; no dar listas.
- Cada prompt de fase se guarda completo y literal en `docs/prompts.md`.

### Comandos

| Comando          | Uso                        |
| ---------------- | -------------------------- |
| `pnpm dev`       | Servidor de desarrollo     |
| `pnpm test`      | Tests unitarios (Vitest)   |
| `pnpm test:e2e`  | Tests E2E (Playwright)     |
| `pnpm build`     | Build de producción        |
| `pnpm lint`      | Linter                     |
| `pnpm typecheck` | Comprobación de tipos      |

## Registro de IA

En `AI_LOG.md`, por cada fase: fecha y hora, qué se pidió, qué propuso la IA, qué se aceptó y qué
se corrigió o rechazó (y por qué). Es la **única** fuente de la sección de IA del README; no se
inventa nada.
