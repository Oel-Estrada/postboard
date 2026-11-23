# Plan de implementación de postboard

> **Para quien ejecute el plan:** se ejecuta fase a fase (una fase por prompt) y pieza a pieza
> (un commit por pieza). Cada pieza sigue el ciclo TDD descrito en «Ciclo de cada pieza». Las
> casillas `- [ ]` sirven para marcar el avance. Las reglas de `CLAUDE.md` mandan sobre este
> plan.

**Objetivo:** una app pequeña en React + TypeScript que lista los usuarios de JSONPlaceholder con
búsqueda por nombre y, al elegir uno, muestra sus posts y permite crear uno nuevo con un
formulario validado.

**Arquitectura:** es una SPA de una sola pantalla con un diseño maestro-detalle. La capa de API
usa `fetch` nativo y un cliente común que convierte `res.ok === false` en error. Hay hooks
propios para cada petición, con `AbortController`, y componentes presentacionales que se
prueban con Testing Library. El usuario seleccionado vive en el estado de `App`; no hay router.

**Stack:** pnpm, Vite, React, TypeScript `strict`, Tailwind CSS v4 (`@tailwindcss/vite`),
Vitest, Testing Library, jsdom, MSW y Playwright (solo Chromium).

**Especificación:** el enunciado y las reglas de `CLAUDE.md`, junto con las decisiones de diseño
de este documento (sección 1).

---

## 1. Decisiones de diseño (P2)

Las tomamos en la fase P2. Las cuatro primeras las elegiste tú entre opciones con
recomendación; el resto son decisiones mías y van marcadas como tales.

### Enfoques considerados

| Decisión | Elegido | Descartado y por qué |
| --- | --- | --- |
| Carpetas | **Por tipo**: `api/`, `hooks/`, `components/`, `lib/`, `test/` | Por funcionalidad (`features/users`, `features/posts`): con solo dos funcionalidades añade carpetas sin aportar nada. |
| Lista y detalle | **Maestro-detalle**: dos columnas en escritorio y una en móvil con «Back to users» | Pantallas separadas: en escritorio desperdicia espacio y obliga a volver atrás para cambiar de usuario. |
| Formulario | **Siempre visible** encima de la lista de posts | Tras un botón «New post»: añade un estado abierto/cerrado, la gestión del foco y más tests sin aportar nada al enunciado. |
| Dirección visual | **Fichero de oficina** | «Correspondencia» (posts como cartas): más editorial, pero es más fácil pasarse con la decoración. |

### Decisiones mías (puedes corregirlas)

- **Sin router.** La selección es estado de React. `react-router` sería una dependencia nueva y
  el enunciado no pide URLs.
- **El post nuevo va arriba** de la lista, porque es lo primero que el usuario quiere comprobar.
- **Los posts creados duran mientras el usuario siga seleccionado.** Si cambias de usuario, se
  pierden, igual que en la API real, que no guarda nada. Se anotará en «qué haría con más
  tiempo» del README.
- **Fuentes del sistema.** Con Google Fonts, los E2E tocarían la red real; con `@fontsource`
  tendríamos una dependencia nueva.
- **Los errores de red y HTTP muestran el mismo texto** en la interfaz. El detalle técnico
  queda en el `Error`, no en pantalla.
- **«Try again»** en cada error de carga. Es poco código y deja el estado de error en algo que
  se puede resolver, no en un callejón sin salida.
- **Validación al enviar.** Al editar un campo con error, su error desaparece. Los valores se
  recortan (`trim`) antes de enviarlos.

### Dirección visual: «Fichero de oficina»

La idea es un archivador de oficina: una columna de fichas de usuario y una carpeta abierta con
sus posts. Es sobria, fría y ordenada.

| Token | Hex | Uso |
| --- | --- | --- |
| `paper` | `#EEF1F4` | Fondo de la página y de la columna de usuarios |
| `card` | `#FFFFFF` | Panel de detalle, inputs y la pestaña del usuario seleccionado |
| `ink` | `#1B2638` | Texto principal |
| `muted` | `#5A6578` | Texto secundario (username, email, empresa, contador) |
| `rule` | `#D5DBE3` | Bordes y separadores |
| `accent` | `#2D5B8A` | Selección, anillo de foco y botón principal; ningún otro uso |
| `danger` | `#B42318` | Errores de validación y de carga |

- **Tipografía:** la interfaz usa `system-ui, "Segoe UI", Roboto, sans-serif`. Los títulos de
  los posts y el nombre del usuario en el detalle usan
  `Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif`. La escala es
  14 / 16 / 20 / 28 px y el texto de los posts no pasa de `65ch`.
- **Alineación:** todo a la izquierda.
- **El elemento memorable (el único):** el usuario seleccionado se convierte en una pestaña
  blanca que se une al panel de detalle. El borde izquierdo del panel se interrumpe a su altura,
  como la pestaña de una carpeta archivadora.
- **Monograma:** las iniciales del usuario van en un cuadrado de 2.25rem con radio de 4px,
  fondo `paper` y texto `muted`. En el usuario seleccionado el fondo pasa a ser `accent` y el
  texto blanco.
- **Lo que no lleva:** gradientes, sombras en cada tarjeta, etiquetas en mayúsculas sobre los
  títulos, separadores con punto medio ni animaciones de entrada. Los bordes usan
  `rule`; solo el panel lleva radio (6px). El foco es visible siempre (`outline` de 2px en
  `accent`). No hay animaciones automáticas, así que `prefers-reduced-motion` no tiene nada que
  reducir.

```
┌──────────────────────────────────────────────────────────────────┐
│ Postboard                                                        │
├──────────────────────┬───────────────────────────────────────────┤
│ Search users         │                                           │
│ [______________]     │  Leanne Graham          (serif, 28px)     │
│                      │  Sincere@april.biz                        │
│ [EH] Ervin Howell    │  Romaguera-Crona                          │
│      @Antonette      │                                           │
│┌────────────────────┘│  New post                                 │
││[LG] Leanne Graham    │  Title [_____________________]            │
││     @Bret            │  Text  [_____________________]            │
│└────────────────────┐│                      [Publish post]       │
│ [CB] Clementine B.   │  ───────────────────────────────          │
│      @Samantha       │  Posts (10)                               │
│                      │  sunt aut facere repellat (serif)         │
│                      │  quia et suscipit...                      │
└──────────────────────┴───────────────────────────────────────────┘
          móvil (<768px): una columna; al seleccionar, solo el detalle
          con «Back to users» encima.
```

### Objetivos, no objetivos y antiobjetivos

- **Objetivos:** cumplir los 5 puntos del enunciado con estados de carga y error accesibles, con
  tests en cada pieza y un historial de commits que se pueda leer.
- **No objetivos:** router, persistencia (`localStorage`), paginación, editar o borrar posts,
  librerías de estado o de datos (React Query, Zustand) y librerías de formularios.
- **Antiobjetivos** (sería un fallo aunque funcionase): que un test toque la red real; que se
  repitan `key` porque la API devuelve siempre `id: 101`; que los posts de un usuario anterior
  aparezcan en el detalle de otro; que haya dependencias sin aprobar; que la interfaz parezca
  una plantilla.

---

## 2. Restricciones globales

Se aplican a todas las piezas y salen de `CLAUDE.md`:

- Solo **pnpm**; `packageManager` fijado en `package.json`.
- `pnpm-workspace.yaml` con `minimumReleaseAge: 1440` y `allowBuilds` solo para paquetes que
  hayas revisado y aprobado.
- TypeScript en modo `strict`.
- Tailwind v4: `@import "tailwindcss";` en el CSS y sin `tailwind.config.js`.
- No se añade ninguna dependencia fuera del stack sin explicarla y recibir aprobación.
- `res.ok === false` se trata como error, y las peticiones obsoletas se cancelan con
  `AbortController`.
- La búsqueda filtra en el cliente, sin distinguir mayúsculas y quitando espacios.
- La validación rechaza campos vacíos o con solo espacios.
- Accesibilidad: un `<label>` por input; `aria-describedby` entre cada input y su error;
  `role="alert"` en los errores; `role="status"` o `aria-live` en las cargas.
- En inglés van el código, los nombres de archivo, el JSDoc, los comentarios, las descripciones
  de los tests, los commits y los textos de la interfaz. En español van `README.md`, `AI_LOG.md`
  y `docs/*.md`.
- JSDoc breve en todo lo exportado (API, hooks y componentes).
- Los tests no tocan nunca la red real: MSW con `onUnhandledRequest: 'error'` en Vitest y
  `page.route` con bloqueo de todo lo externo en Playwright.
- Vitest no ejecuta `e2e/` y Playwright no ejecuta `src/`.
- Commits con Conventional Commits, en inglés y sin push. Antes de cada commit se para para
  pedir tu OK, enseñando `git status` y un diff resumido.

## 3. Textos de la interfaz (fijos)

Los tests y los E2E buscan estos textos exactos. Si cambia uno, cambia en todos los sitios.

| Dónde | Texto |
| --- | --- |
| Título de la app (`h1`) | `Postboard` |
| Label de la búsqueda | `Search users` |
| Carga de usuarios | `Loading users…` |
| Error de usuarios | `Couldn't load users.` |
| Botón de reintento | `Try again` |
| Búsqueda sin resultados | `No users match "{query}".` (con la búsqueda ya recortada) |
| Detalle sin usuario seleccionado | `Select a user to see their posts.` |
| Carga de posts | `Loading posts…` |
| Error de posts | `Couldn't load posts.` |
| Usuario sin posts | `This user has no posts yet.` |
| Título de la sección de posts (`h3`) | `Posts ({count})` |
| Título del formulario (`h3`) | `New post` |
| Labels | `Title`, `Text` |
| Errores de validación | `Enter a title.`, `Enter the post text.` |
| Botón de envío | `Publish post` (`Publishing…` mientras se envía) |
| Aviso de éxito (`role="status"`) | `Post published.` |
| Error al publicar | `Couldn't publish the post. Try again.` |
| Volver en móvil | `Back to users` |

## 4. Contratos compartidos

Son las firmas en las que se apoyan las piezas. Cada pieza crea la suya; aquí están juntas para
que los nombres y los tipos no se desvíen.

```ts
// src/types.ts
export interface User { id: number; name: string; username: string; email: string; company: { name: string } }
export interface Post { userId: number; id: number; title: string; body: string }
export interface NewPost { userId: number; title: string; body: string }
/** Post with a React key that is unique even when the API repeats ids (POST always returns 101). */
export interface PostEntry extends Post { key: string }
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

// src/api/client.ts
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com'
export class HttpError extends Error { readonly status: number }
export function request<T>(path: string, init?: RequestInit): Promise<T>

// src/api/users.ts
export function getUsers(signal?: AbortSignal): Promise<User[]>
// src/api/posts.ts
export function getPostsByUser(userId: number, signal?: AbortSignal): Promise<Post[]>
export function createPost(input: NewPost, signal?: AbortSignal): Promise<Post>

// src/lib
export function filterUsersByName(users: User[], query: string): User[]
export function getInitials(name: string): string
export interface PostFormValues { title: string; body: string }
export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>
export function validatePost(values: PostFormValues): PostFormErrors

// src/hooks
export function useUsers(): AsyncState<User[]> & { retry: () => void }
export function useUserPosts(userId: number):
  AsyncState<PostEntry[]> & { retry: () => void; addPost: (post: Post) => void }
export function useCreatePost(): {
  createPost: (input: NewPost) => Promise<Post | null>
  isSubmitting: boolean
  error: Error | null
}
```

Claves de React: un post traído de la API usa `post-${id}`; uno creado usa
`crypto.randomUUID()`.

## 5. Estructura de archivos

```
src/
  api/         client.ts, users.ts, posts.ts                 (+ *.test.ts)
  hooks/       useUsers.ts, useUserPosts.ts, useCreatePost.ts (+ *.test.ts)
  components/  UserSearch, UserList, LoadingMessage, ErrorMessage, UsersPanel,
               PostForm, PostList, PostsPanel                (.tsx + .test.tsx)
  lib/         filterUsersByName.ts, getInitials.ts, validatePost.ts (+ *.test.ts)
  test/        setup.ts, server.ts, server.test.ts, handlers.ts, fixtures.ts
  types.ts, App.tsx, App.test.tsx, main.tsx, index.css
e2e/           mockApi.ts, users.spec.ts, posts.spec.ts, errors.spec.ts, mobile.spec.ts
```

**Datos de prueba** (`src/test/fixtures.ts`, compartidos con los E2E): son datos reales de
JSONPlaceholder recortados. Hay 4 usuarios: Leanne Graham (1, `@Bret`), Ervin Howell (2,
`@Antonette`), Clementine Bauch (3, `@Samantha`) y Clementina DuBuque (10, `@Moriah.Stanton`).
Hay 3 posts: 2 de Leanne y 1 de Ervin. Clementine no tiene posts, para probar el estado vacío,
y la búsqueda «clem» encuentra a dos usuarios.

**Handlers por defecto** (`src/test/handlers.ts`): `GET /users` devuelve los usuarios de
prueba; `GET /posts?userId=` devuelve los posts de prueba filtrados por `userId`; y
`POST /posts` devuelve 201 con `{ ...body, id: 101 }`, igual que la API real. Los errores se
simulan en cada test con `server.use(...)`: `new HttpResponse(null, { status: 500 })` para el
error HTTP y `HttpResponse.error()` para el error de red.

## 6. Ciclo de cada pieza

1. Escribir el test (o los tests) de la pieza.
2. Ejecutar `pnpm test <ruta>` y verlo fallar por la razón esperada (falta el módulo o falla la
   aserción).
3. Escribir el código mínimo con la firma de la sección 4 y JSDoc si se exporta.
4. Ejecutar `pnpm test <ruta>` y verlo en verde. Refactorizar si hace falta, en verde.
5. Ejecutar `pnpm typecheck` y `pnpm lint` sin errores.
6. **PARAR:** explicar qué se ha hecho, enseñar `git status` y un diff resumido, y esperar tu
   OK.
7. Hacer el commit con el mensaje de la pieza.

El prompt de cada fase se añade a `docs/prompts.md` y su entrada a `AI_LOG.md`. Ambos van en el
último commit de la fase, salvo que el prompt de la fase diga otra cosa.

## 7. Puntos de revisión

Son las situaciones que el enunciado no menciona y que más pueden fallar a quien use la app.
Cada una tiene un test en la pieza que la resuelve.

1. **Cambio rápido de usuario:** la respuesta tardía del usuario anterior no puede pisar los
   posts del actual. Lo cubre `useUserPosts`: «aborts the previous request when userId
   changes».
2. **Dos posts creados con `id: 101`:** los dos tienen que verse y sin repetir `key`. Lo cubren
   `useUserPosts` («gives created posts unique keys…») y `PostsPanel` («shows two created
   posts…»).
3. **Doble clic en «Publish post»:** solo se envía una petición. Lo cubre `PostForm`
   («disables the button while publishing…»).
4. **Búsqueda con espacios, mayúsculas o sin resultados:** no puede quedarse en blanco. Lo
   cubren `filterUsersByName` y `UsersPanel` («shows a no-match message»).
5. **Fallan los posts pero no los usuarios:** el error sale solo en el detalle y «Try again» lo
   recupera. Lo cubre `PostsPanel` («shows an error and recovers with Try again»).

---

## P3 — Scaffold y librerías

### P3.1 Proyecto base con Vitest

- **Archivos:** `package.json`, `pnpm-workspace.yaml`, `tsconfig*.json`, `vite.config.ts`,
  `eslint.config.js`, `index.html` (`<title>Postboard</title>`), `src/main.tsx`, `src/App.tsx`,
  `src/App.test.tsx` y `src/test/setup.ts` (importa `@testing-library/jest-dom/vitest`).
- **Pasos:**
  - Crear la base con la plantilla `react-ts` de Vite usando pnpm.
  - Borrar la demo de la plantilla (logos, `App.css` y el contador).
  - `App` renderiza solo `<h1>Postboard</h1>`.
  - Fijar `packageManager`.
  - Crear `pnpm-workspace.yaml` con `minimumReleaseAge: 1440`. `allowBuilds` se rellena solo con
    lo que `pnpm install` diga que necesita compilar, y tras enseñártelo.
  - Añadir Vitest, `@testing-library/react`, `@testing-library/user-event`,
    `@testing-library/jest-dom` y `jsdom`.
  - Configurar `test` en `vite.config.ts`: `environment: 'jsdom'`,
    `setupFiles: './src/test/setup.ts'`, `include: ['src/**/*.test.{ts,tsx}']`.
  - Scripts: `dev`, `build`, `preview`, `lint`, `typecheck` (`tsc -b`), `test` (`vitest run`)
    y `test:watch` (`vitest`).
- **Antes de seguir:** consultar en Context7 la sintaxis actual de `allowBuilds` y
  `minimumReleaseAge` en pnpm y la configuración de Vitest dentro de Vite.
- **Test (`src/App.test.tsx`):** `it('renders the app heading')`. Comprueba que hay un
  `heading` de nivel 1 con el nombre `Postboard`.
- **Verificación:** `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build` en verde.
- [ ] **Commit:** `chore: scaffold vite react-ts project with vitest`

### P3.2 Tailwind CSS v4

- **Archivos:** `vite.config.ts` (plugin `@tailwindcss/vite`) y `src/index.css`
  (`@import "tailwindcss";`).
- **Pasos:** instalar `tailwindcss` y `@tailwindcss/vite`, sin `tailwind.config.js`. Los tokens
  visuales se añaden en P7.
- **Test:** no hay código nuevo que probar. `App.test.tsx` sigue en verde.
- **Verificación:** `pnpm build` genera CSS con las utilidades usadas, y en `pnpm dev` una clase
  de prueba se aplica.
- [ ] **Commit:** `chore: add tailwind css v4`

### P3.3 Servidor MSW para los tests

- **Archivos:** `src/test/server.ts`, `src/test/handlers.ts` (vacío por ahora:
  `export const handlers = []`), `src/test/setup.ts` y `src/test/server.test.ts`.
- **Pasos:** instalar `msw`. En `setup.ts`: `beforeAll(() => server.listen({ onUnhandledRequest:
  'error' }))`, `afterEach(() => server.resetHandlers())` y `afterAll(() => server.close())`.
  La importación de `@testing-library/jest-dom/vitest` ya está desde P3.1.
- **Test (`server.test.ts`):** `it('rejects requests that have no handler')`. Comprueba que
  `fetch('https://jsonplaceholder.typicode.com/unhandled')` es rechazado. Es la garantía de que
  ningún test toca la red real.
- [ ] **Commit:** `test: add msw server that blocks unhandled requests`

---

## P4 — Capa de API

### P4.1 `request` y `HttpError`

- **Archivos:** `src/api/client.ts` y `src/api/client.test.ts`.
- **Firma:** la de la sección 4. `request` llama a `fetch(API_BASE_URL + path, init)` y lanza
  `HttpError(status, message)` si `res.ok` es `false`; si no, devuelve `res.json()`. Los errores
  de red y de cancelación se propagan sin envolver, porque los hooks necesitan reconocer el
  `AbortError`.
- **Tests** (con handlers en el propio test sobre `/things`):
  - `it('resolves with the parsed JSON body')`
  - `it('throws an HttpError with the status when the response is not ok')`: con 500,
    `rejects.toBeInstanceOf(HttpError)` y `status === 500`.
  - `it('rejects when the network fails')`: con `HttpResponse.error()` es rechazado y no es un
    `HttpError`.
  - `it('rejects with an AbortError when the signal is aborted')`: el handler tarda
    (`await delay()`), se llama a `controller.abort()` y el error tiene
    `name === 'AbortError'`.
- [ ] **Commit:** `feat(api): add fetch client that treats non-ok responses as errors`

### P4.2 `getUsers`

- **Archivos:** `src/types.ts` (`User`, `AsyncState`), `src/api/users.ts`,
  `src/api/users.test.ts`, `src/test/fixtures.ts` (`users`) y `src/test/handlers.ts`
  (`GET /users`).
- **Tests:**
  - `it('returns the users from GET /users')`: igual a `users`.
  - `it('throws an HttpError when the API answers 500')`
  - `it('rejects when the network fails')`
- [ ] **Commit:** `feat(api): add getUsers`

### P4.3 `getPostsByUser`

- **Archivos:** `src/types.ts` (`Post`, `PostEntry`), `src/api/posts.ts`,
  `src/api/posts.test.ts`, `fixtures.ts` (`posts`) y `handlers.ts` (`GET /posts`).
- **Tests:**
  - `it('requests the posts of the given user')`: el handler recibe `userId=1` y el resultado
    son los 2 posts de Leanne.
  - `it('throws an HttpError when the API answers 404')`
  - `it('rejects when the network fails')`
- [ ] **Commit:** `feat(api): add getPostsByUser`

### P4.4 `createPost`

- **Archivos:** `src/types.ts` (`NewPost`), `src/api/posts.ts`, `src/api/posts.test.ts` y
  `handlers.ts` (`POST /posts`).
- **Firma:** `POST /posts` con `body: JSON.stringify(input)` y
  `headers: { 'Content-Type': 'application/json; charset=UTF-8' }`.
- **Tests:**
  - `it('sends the new post as JSON and returns the created post')`: el handler recibe
    `{ userId: 1, title, body }` y el resultado tiene `id: 101`.
  - `it('throws an HttpError when the API answers 500')`
  - `it('rejects when the network fails')`
- [ ] **Commit:** `feat(api): add createPost`

---

## P5 — Usuarios y búsqueda

### P5.1 `filterUsersByName`

- **Archivos:** `src/lib/filterUsersByName.ts` y `.test.ts`.
- **Comportamiento:** busca solo en `name`. Recorta la búsqueda, ignora mayúsculas y usa
  `includes`. Si la búsqueda está vacía, devuelve todos.
- **Tests:**
  - `it('returns every user when the query is empty or only spaces')`: con `''` y `'   '`.
  - `it('matches regardless of case')`: `'LEANNE'` → Leanne Graham.
  - `it('ignores leading and trailing spaces')`: `'  clem  '` → Clementine y Clementina.
  - `it('matches a full name with an inner space')`: `'leanne graham'`.
  - `it('returns an empty list when nothing matches')`
  - `it('does not match by username')`: `'Bret'` → `[]`.
- [ ] **Commit:** `feat: add case-insensitive user name filter`

### P5.2 `useUsers`

- **Archivos:** `src/hooks/useUsers.ts` y `.test.ts`.
- **Comportamiento:** al montar, llama a `getUsers(controller.signal)` y aborta al desmontar. Si
  la señal está abortada, ignora el resultado. `retry()` vuelve a `loading` y repite la
  petición.
- **Tests** (`renderHook` + MSW):
  - `it('starts in the loading state')`
  - `it('returns the users on success')`
  - `it('returns an error when the API answers 500')`
  - `it('returns an error when the network fails')`
  - `it('aborts the request on unmount')`: el handler guarda `request.signal`; tras `unmount()`,
    `signal.aborted === true`.
  - `it('fetches again on retry after an error')`: primero 500 (`{ once: true }`); tras
    `retry()`, `success`.
- [ ] **Commit:** `feat: add useUsers hook with abort on unmount`

### P5.3 `UserSearch`

- **Archivos:** `src/components/UserSearch.tsx` y `.test.tsx`.
- **Props:** `{ value: string; onChange: (value: string) => void }`. Es un `input type="search"`
  con `<label>` «Search users».
- **Tests:**
  - `it('is labelled "Search users"')`: `getByRole('searchbox', { name: 'Search users' })`.
  - `it('reports what the user types')`: `user.type` llama a `onChange` con cada valor.
- [ ] **Commit:** `feat: add UserSearch component`

### P5.4 `getInitials`

- **Archivos:** `src/lib/getInitials.ts` y `.test.ts`.
- **Comportamiento:** descarta las palabras que terminan en `.` (tratamientos como Mrs.) y toma
  la primera letra de las dos primeras palabras que quedan, en mayúsculas.
- **Tests:**
  - `it('takes the first letter of the first two words')`: `'Leanne Graham'` → `'LG'`.
  - `it('skips honorifics')`: `'Mrs. Dennis Schulist'` → `'DS'`.
  - `it('ignores trailing suffixes')`: `'Nicholas Runolfsdottir V'` → `'NR'`.
  - `it('handles a single word')`: `'Bret'` → `'B'`.
- [ ] **Commit:** `feat: add getInitials helper`

### P5.5 `UserList`

- **Archivos:** `src/components/UserList.tsx` y `.test.tsx`.
- **Props:** `{ users: User[]; selectedUserId: number | null; onSelect: (user: User) => void }`.
  Es un `<ul>` con un `<button>` por usuario que muestra el monograma (`aria-hidden`), el nombre
  y el `@username`. El seleccionado lleva `aria-current="true"`.
- **Tests:**
  - `it('renders a button per user with name and username')`
  - `it('marks the selected user as current')`: `getByRole('button', { current: true })`
    contiene «Leanne Graham».
  - `it('calls onSelect with the clicked user')`
- [ ] **Commit:** `feat: add UserList component`

### P5.6 `LoadingMessage`

- **Archivos:** `src/components/LoadingMessage.tsx` y `.test.tsx`.
- **Props:** `{ children: ReactNode }`. Es un `<p role="status">` (que ya implica
  `aria-live="polite"`).
- **Test:** `it('announces the message as a status')`: `getByRole('status')` contiene el texto.
- [ ] **Commit:** `feat: add LoadingMessage component`

### P5.7 `ErrorMessage`

- **Archivos:** `src/components/ErrorMessage.tsx` y `.test.tsx`.
- **Props:** `{ children: ReactNode; onRetry?: () => void }`. Es un contenedor con
  `role="alert"`; si hay `onRetry`, lleva un botón «Try again».
- **Tests:**
  - `it('announces the message as an alert')`
  - `it('calls onRetry when Try again is clicked')`
  - `it('hides Try again when there is no onRetry')`
- [ ] **Commit:** `feat: add ErrorMessage component`

### P5.8 `UsersPanel`

- **Archivos:** `src/components/UsersPanel.tsx` y `.test.tsx`.
- **Props:** `{ selectedUserId: number | null; onSelectUser: (user: User) => void }`. Une
  `useUsers`, `UserSearch`, `filterUsersByName`, `UserList`, `LoadingMessage` y `ErrorMessage`.
  El texto de la búsqueda es estado local.
- **Tests** (MSW):
  - `it('shows a loading status and then the users')`
  - `it('filters users as the user types')`: escribir `'  CLEM'` deja 2 botones.
  - `it('shows a no-match message')`: `'zzz'` → `No users match "zzz".`
  - `it('shows an error and recovers with Try again')`: primero 500 → alerta
    `Couldn't load users.`; tras clic, la lista.
  - `it('calls onSelectUser with the clicked user')`
- [ ] **Commit:** `feat: add UsersPanel with search, loading and error states`

### P5.9 `App` con la columna de usuarios

- **Archivos:** `src/App.tsx` y `src/App.test.tsx`.
- **Comportamiento:** el estado es `selectedUser: User | null`. Monta `UsersPanel` y, en el
  detalle, `Select a user to see their posts.` o un `h2` con el nombre del usuario (que P6
  sustituye por `PostsPanel`). Usa una rejilla de dos columnas a partir de `md`.
- **Tests:** se mantiene el del encabezado y se añaden:
  - `it('asks to select a user before showing posts')`
  - `it('shows the selected user in the detail area')`: clic en «Ervin Howell» → `heading`
    «Ervin Howell».
- [ ] **Commit:** `feat: show users panel and selection in app`

---

## P6 — Posts y formulario

### P6.1 `validatePost`

- **Archivos:** `src/lib/validatePost.ts` y `.test.ts`.
- **Tests:**
  - `it('requires a title and a text')`: `{ title: '', body: '' }` →
    `{ title: 'Enter a title.', body: 'Enter the post text.' }`.
  - `it('rejects fields that only contain spaces')`
  - `it('returns no errors for valid values')`: → `{}`.
  - `it('reports only the missing field')`
- [ ] **Commit:** `feat: add post form validation`

### P6.2 `useUserPosts`

- **Archivos:** `src/hooks/useUserPosts.ts` y `.test.ts`.
- **Comportamiento:** cada vez que cambia `userId`, aborta la petición anterior y llama a
  `getPostsByUser(userId, signal)`. Los posts traídos se mapean a `PostEntry` con la clave
  `post-{id}`. `addPost(post)` añade `{ ...post, key: crypto.randomUUID() }` al
  principio de `data`. `retry()` repite la petición.
- **Tests** (`renderHook` + MSW):
  - `it('starts in the loading state')`
  - `it('returns the user posts with stable keys')`: las claves son `post-1` y `post-2`.
  - `it('returns an error when the API answers 500')`
  - `it('returns an error when the network fails')`
  - `it('aborts the previous request when userId changes')`: el usuario 1 responde con retraso
    y el 2 al momento. Tras `rerender({ userId: 2 })`, `data` es solo de Ervin, también después
    de que llegue la respuesta del 1, y la señal del 1 está abortada.
  - `it('aborts the request on unmount')`
  - `it('adds created posts first with unique keys even when ids repeat')`: dos `addPost` con
    `id: 101` dan dos entradas al principio con `key` distintas.
  - `it('fetches again on retry after an error')`
- [ ] **Commit:** `feat: add useUserPosts hook with abort on user change`

### P6.3 `useCreatePost`

- **Archivos:** `src/hooks/useCreatePost.ts` y `.test.ts`.
- **Comportamiento:** `createPost(input)` pone `isSubmitting` a `true`, llama a la API y
  devuelve el `Post`. Si falla, guarda `error` y devuelve `null`. Al desmontar, aborta la
  petición en curso.
- **Tests:**
  - `it('is submitting while the request is pending')`
  - `it('resolves with the created post')`: `id: 101` y `error === null`.
  - `it('stores the error and resolves null when the API answers 500')`
  - `it('stores the error and resolves null when the network fails')`
  - `it('aborts a pending request on unmount')`
- [ ] **Commit:** `feat: add useCreatePost hook`

### P6.4 `PostForm`

- **Archivos:** `src/components/PostForm.tsx` y `.test.tsx`.
- **Props:** `{ userId: number; onCreated: (post: Post) => void }`. Usa `validatePost` y
  `useCreatePost`, y lleva `<form noValidate>` con el `h3` «New post». Cada input tiene
  `<label>` y, si hay error, `aria-invalid="true"` y `aria-describedby` apuntando al `<p>` del
  error (`role="alert"`). Antes de enviar, recorta los valores. Si sale bien: limpia el
  formulario, muestra `Post published.` (`role="status"`) y llama a `onCreated`. Si falla:
  muestra `Couldn't publish the post. Try again.` y conserva los valores.
- **Tests** (MSW y un contador de peticiones en el handler de `POST`):
  - `it('labels the title and text fields')`
  - `it('shows both errors and sends nothing when submitted empty')`: dos alertas, los inputs
    con `aria-invalid` y `aria-describedby` apuntando al error (`toHaveAccessibleDescription`),
    y 0 peticiones.
  - `it('rejects fields that only contain spaces')`
  - `it('clears a field error when the field is edited')`
  - `it('publishes trimmed values and reports the created post')`: el handler recibe
    `{ userId, title: 'Hello', body: 'World' }` y `onCreated` recibe `id: 101`.
  - `it('disables the button while publishing so a double click sends one request')`: el botón
    pone `Publishing…` y está deshabilitado; con doble clic hay 1 petición.
  - `it('clears the form and announces success after publishing')`
  - `it('keeps the values and shows an error when publishing fails')`
- [ ] **Commit:** `feat: add validated PostForm component`

### P6.5 `PostList`

- **Archivos:** `src/components/PostList.tsx` y `.test.tsx`.
- **Props:** `{ posts: PostEntry[] }`. Es un `<ul>` de `<article>`, cada uno con un `h4` (el
  título) y un `<p>` (el cuerpo), con `key` igual a `post.key`. Si no hay posts, muestra
  `This user has no posts yet.`.
- **Tests:**
  - `it('renders each post title and text')`
  - `it('shows an empty message when there are no posts')`
- [ ] **Commit:** `feat: add PostList component`

### P6.6 `PostsPanel`

- **Archivos:** `src/components/PostsPanel.tsx` y `.test.tsx`.
- **Props:** `{ user: User }`. Lleva una cabecera con el `h2` (nombre), el email y la empresa
  en líneas separadas. Debajo, `PostForm` (con `onCreated={addPost}`), y luego el `h3`
  `Posts ({count})` con `PostList`, o `LoadingMessage` o `ErrorMessage`, según `useUserPosts`.
- **Tests** (MSW):
  - `it('shows the user header')`
  - `it('shows a loading status and then the posts')`
  - `it('shows an error and recovers with Try again')`: el error sale solo aquí.
  - `it('shows a created post at the top of the list')`
  - `it('shows two created posts even though the API returns the same id')`: dos títulos, el
    contador sube en 2 y no hay ningún `console.error` de claves repetidas (con un spy).
- [ ] **Commit:** `feat: add PostsPanel with posts and new post form`

### P6.7 `App` con el detalle de posts

- **Archivos:** `src/App.tsx` y `src/App.test.tsx`.
- **Comportamiento:** el detalle renderiza `<PostsPanel key={user.id} user={user} />`. La `key`
  reinicia el formulario y los posts creados al cambiar de usuario.
- **Tests:**
  - `it('shows the posts of the selected user')`
  - `it('creates a post for the selected user')`: el flujo completo, del clic en el usuario al
    post visible arriba.
  - `it('drops the previous user posts when another user is selected')`
- [ ] **Commit:** `feat: show selected user posts in app`

---

## P7 — Pulido visual

Aquí no cambia el comportamiento. Los tests de P3 a P6 deben seguir en verde sin tocarlos. Para
revisar cada pieza se arranca la app con `pnpm dev` y se hacen capturas a 1280 px y a 390 px.

### P7.1 Tokens y base

- **Archivos:** `src/index.css`.
- **Pasos:**
  - Definir en `@theme` los colores de la sección 1 (`--color-paper`, `--color-card`,
    `--color-ink`, `--color-muted`, `--color-rule`, `--color-accent`, `--color-danger`) y las
    fuentes `--font-sans` y `--font-serif`.
  - Base: `body` en `paper`/`ink` y `:focus-visible` con `outline` de 2px en `accent` y
    `outline-offset` de 2px.
- [ ] **Commit:** `style: add office file color and type tokens`

### P7.2 Columna de usuarios y pestaña de selección

- **Archivos:** `UserList.tsx`, `UserSearch.tsx`, `UsersPanel.tsx` y `App.tsx`.
- **Pasos:** monograma; nombre en `ink` y `@username` en `muted`. El usuario seleccionado usa
  fondo `card`, monograma en `accent` y se extiende sobre el borde del panel (margen negativo y
  `z-index`), formando la pestaña. Columna de usuarios de `18rem` y `sticky` en escritorio.
- **Verificación:** los tests siguen en verde, y en las capturas la pestaña queda unida al panel
  sin una línea en medio.
- [ ] **Commit:** `style: connect the selected user to the detail panel as a folder tab`

### P7.3 Detalle, formulario y estados

- **Archivos:** `PostsPanel.tsx`, `PostForm.tsx`, `PostList.tsx`, `LoadingMessage.tsx` y
  `ErrorMessage.tsx`.
- **Pasos:** nombre del usuario y títulos de los posts en serif; cuerpo con un máximo de `65ch`;
  separadores en `rule`. Inputs en `card` con borde `rule`, y con borde `danger` si
  `aria-invalid`. Botón principal en `accent` con estado deshabilitado. Errores en `danger`.
- [ ] **Commit:** `style: refine post detail, form and status messages`

### P7.4 «Back to users» en móvil

Esta pieza añade comportamiento, así que lleva test.

- **Archivos:** `src/App.tsx` y `src/App.test.tsx`.
- **Comportamiento:** por debajo de `md`, si hay un usuario seleccionado, se oculta la columna
  de usuarios y se muestra un botón «Back to users» (`md:hidden`) que pone `selectedUser` a
  `null`. La búsqueda se conserva, porque `UsersPanel` se oculta con CSS y no se desmonta.
- **Tests:**
  - `it('returns to the user list with Back to users')`: tras el clic vuelve el texto
    `Select a user to see their posts.` y ningún botón tiene `aria-current`.
  - `it('keeps the search text after going back')`
- [ ] **Commit:** `feat: add back to users navigation for small screens`

---

## P8 — Tests E2E

**Antes de seguir:** consultar en Context7 la configuración de `webServer` y `page.route` en
Playwright.

### P8.1 Playwright, simulación de la red y flujo de usuarios

- **Archivos:** `playwright.config.ts`, `e2e/mockApi.ts`, `e2e/users.spec.ts` y `package.json`
  (script `test:e2e`: `playwright test`).
- **Configuración:** `testDir: './e2e'`; solo el proyecto `chromium`;
  `webServer: { command: 'pnpm dev --port 5173 --strictPort', url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI }`. Se instala `@playwright/test` y se ejecuta
  `pnpm exec playwright install chromium`.
- **`mockApi(page, options?)`:** primero registra una ruta que aborta cualquier petición que no
  vaya a `localhost`. Después registra las de `https://jsonplaceholder.typicode.com/**`, que
  sirven los datos de `src/test/fixtures.ts`, con opciones para forzar 500, red caída o retraso
  por endpoint. Devuelve un registro de las peticiones `POST`.
- **Flujos (`users.spec.ts`):**
  - `test('lists the users from the API')`: 4 usuarios.
  - `test('filters users by name ignoring case and spaces')`: `'  CLEM '` → 2 usuarios.
  - `test('shows a message when no user matches')`
- [ ] **Commit:** `test(e2e): add playwright with mocked api and user search flow`

### P8.2 Flujo de posts

- **Archivos:** `e2e/posts.spec.ts`.
- **Flujos:**
  - `test('shows the posts of the selected user after a loading status')`: con retraso en
    `GET /posts`, se ve `Loading posts…` y después los posts.
  - `test('publishes a post that appears at the top of the list')`
  - `test('publishes two posts in a row and shows both')`
  - `test('blocks empty or blank fields and sends no request')`: se ven los dos errores y hay 0
    `POST`.
- [ ] **Commit:** `test(e2e): add posts and new post flows`

### P8.3 Flujo de errores

- **Archivos:** `e2e/errors.spec.ts`.
- **Flujos:**
  - `test('recovers from a users error with Try again')`
  - `test('shows a posts error when the network fails')`
  - `test('keeps the form values when publishing fails')`
- [ ] **Commit:** `test(e2e): add loading and error state flows`

### P8.4 Flujo móvil

- **Archivos:** `e2e/mobile.spec.ts` (viewport 390×844).
- **Flujo:** `test('goes from the list to the posts and back on a small screen')`. La lista y el
  detalle no se ven a la vez, y al volver se conserva la búsqueda.
- [ ] **Commit:** `test(e2e): add small screen navigation flow`

**Verificación de la fase:** `pnpm test:e2e` en verde, `pnpm test` no recoge nada de `e2e/` y
Playwright no recoge nada de `src/`.

---

## P9 — README y verificación final

### P9.1 README

- **Archivo:** `README.md`, en español.
- **Secciones:**
  - **Cómo ejecutarlo:** requisitos (Node y la versión de pnpm de `packageManager`),
    `pnpm install`, `pnpm dev`, `pnpm test`,
    `pnpm exec playwright install chromium && pnpm test:e2e`, `pnpm build`, `pnpm lint` y
    `pnpm typecheck`.
  - **Decisiones:** las de la sección 1 de este plan, más las que surjan en P3-P8 según el
    `AI_LOG.md`.
  - **Qué haría con más tiempo:** como mínimo, conservar los posts creados al cambiar de
    usuario, la URL por usuario y la cobertura de tests, más lo que se anote en las fases.
  - **Cómo usé la IA:** qué pedí, qué acepté y qué corregí. Sale **solo** de `AI_LOG.md`.
- [ ] **Commit:** `docs: add readme`

### P9.2 Verificación final

- **Comandos** (todos en verde, con la salida copiada en el resumen): `pnpm lint`,
  `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` y `pnpm audit`.
- **Revisiones manuales:**
  - Navegación solo con teclado, con el foco visible.
  - Lector de pantalla: los errores se anuncian y las cargas se anuncian como `status`.
  - `git log` muestra un commit por pieza.
  - No hay `.env` ni secretos.
- Si algo falla, se corrige en un commit `fix:` aparte, con su test.
- [ ] **Commit:** `docs: add final verification to ai log` (la entrada de P9 en `AI_LOG.md` y
  el prompt en `docs/prompts.md`)
