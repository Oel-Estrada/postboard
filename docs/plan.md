# Plan de implementación de postboard

> **Para quien ejecute el plan:** se ejecuta fase a fase (una fase por prompt) y pieza a pieza
> (un commit por pieza). Cada pieza sigue el ciclo TDD descrito en «Ciclo de cada pieza». Las
> casillas `- [ ]` sirven para marcar el avance. Las reglas de `CLAUDE.md` mandan sobre este
> plan.

**Objetivo:** una app pequeña en React + TypeScript que lista los usuarios de JSONPlaceholder con
búsqueda por nombre y, al elegir uno, muestra sus posts y permite crear uno nuevo con un
formulario validado. Los posts creados se conservan en `localStorage`.

**Arquitectura:** es una SPA de una sola pantalla, mobile-first. En móvil se pasa de la lista al
detalle; desde `md` hay dos columnas (maestro-detalle).
- **Capa de API:** usa `fetch` nativo y un cliente común que convierte `res.ok === false` en
  error.
- **Carga de datos:** hooks propios con `useEffect` + `AbortController`.
- **Formulario:** usa las actions de React 19 (`useActionState`, `useFormStatus` y
  `useOptimistic`).
- **Posts creados:** se guardan por usuario en `localStorage`, con lectura defensiva.
- **Selección:** el usuario seleccionado vive en el estado de `App`; no hay router.

**Stack:** pnpm, Vite, React 19, TypeScript `strict`, Tailwind CSS v4 (`@tailwindcss/vite`),
Vitest, Testing Library, jsdom, MSW y Playwright (solo Chromium).

**Especificación:** el enunciado y las reglas de `CLAUDE.md`, junto con las decisiones de diseño
de este documento (sección 1).

---

## 1. Decisiones de diseño (P2 y P2b)

En P2 elegiste las cuatro primeras entre opciones con recomendación. En P2b añadiste la
persistencia, el comportamiento responsive y las actions de React 19. El resto son decisiones
mías y van marcadas como tales.

### Enfoques considerados

| Decisión | Elegido | Descartado y por qué |
| --- | --- | --- |
| Carpetas | **Por tipo**: `api/`, `hooks/`, `components/`, `lib/`, `test/` | Por funcionalidad (`features/users`, `features/posts`): con solo dos funcionalidades añade carpetas sin aportar nada. |
| Lista y detalle | **Mobile-first**: en móvil se pasa de la lista al detalle, con «Back to users»; desde `md`, dos columnas | Pantallas separadas también en escritorio: desperdicia espacio y obliga a volver atrás para cambiar de usuario. |
| Formulario | **Siempre visible** encima de la lista de posts | Tras un botón «New post»: añade un estado abierto/cerrado, la gestión del foco y más tests sin aportar nada al enunciado. |
| Dirección visual | **Fichero de oficina** | «Correspondencia» (posts como cartas): más editorial, pero es más fácil pasarse con la decoración. |
| Posts creados (P2b) | **`localStorage` por usuario**, con clave versionada y lectura defensiva | Solo en memoria: se perdían al cambiar de usuario o al recargar. |
| Formulario (P2b) | **Actions de React 19**: `<form action>` + `useActionState`, `useFormStatus` y `useOptimistic` | Un `onSubmit` con estado manual y un hook `useCreatePost`: es más código para lo mismo, y React 19 ya resuelve el estado pendiente, el reset y la vuelta atrás si falla. |
| Carga de datos (P2b) | **`useEffect` + `AbortController`** en hooks propios | `use()` + Suspense: sin una caché, cada render repetiría la petición. `useTransition`/`useDeferredValue` en la búsqueda: con 10 usuarios no aportan. |
| Textos de la interfaz (P3) | **Centralizados en `src/i18n/messages.ts`**, sin librería | Literales en cada componente: un cambio de texto obliga a tocar el componente y todos sus tests. Una librería de i18n (`react-intl`, `i18next`): dependencia nueva para un solo idioma que el enunciado no pide. |

### Decisiones mías (puedes corregirlas)

- **Sin router.** La selección es estado de React. `react-router` sería una dependencia nueva y
  el enunciado no pide URLs. Por eso, tras recargar hay que volver a elegir al usuario; sus
  posts creados siguen ahí.
- **Los posts creados van arriba** de los de la API, y entre ellos el más reciente primero.
- **Una clave de `localStorage` por usuario**: `postboard:created-posts:v1:{userId}`. Así, si
  los datos de un usuario están corruptos, no afectan a los demás. Si una lista tiene entradas
  válidas e inválidas, se quedan las válidas y se descartan las demás (incluidas las de otro
  `userId`).
- **El POST no se cancela al cambiar de usuario.** No es una petición obsoleta: el post existe
  y su resultado se guarda para el usuario que lo publicó. Se usa el `userId` capturado al
  enviar, y la escritura va fuera del estado del componente, que puede estar ya desmontado. Por
  eso desaparece el hook `useCreatePost` del plan de P2.
- **`<title>` por usuario** con el soporte de metadatos de React 19: `Postboard` o
  `{name} · Postboard`.
- **Linter:** el que traiga la plantilla de Vite. Si es Oxlint, se usa `.oxlintrc.json` sin
  añadir ESLint, con las reglas de React hooks, TypeScript y `jsx-a11y`.
- **El post optimista y el guardado comparten `key`.** Así React no vuelve a montar el elemento
  cuando el POST confirma.
- **Validación dentro de la action, al enviar.** Los errores se recalculan en cada envío. Ya no
  se borra el error al editar el campo, porque con las actions las entradas no son
  controladas. Va a «qué haría con más tiempo». Se usa `<form noValidate>` para mostrar mensajes propios. Se revisará con
  modern-web-guidance en P6.
- **El foco va al título del panel solo en móvil**, que es donde la lista desaparece. En
  escritorio la lista sigue visible y el foco se queda en el usuario elegido. Al pulsar «Back to
  users», el foco vuelve a ese usuario de la lista.
- **Fuentes del sistema.** Con Google Fonts, los E2E tocarían la red real; con `@fontsource`
  tendríamos una dependencia nueva.
- **Los errores de red y HTTP muestran el mismo texto** en la interfaz. El detalle técnico
  queda en el `Error`, no en pantalla.
- **«Try again»** en cada error de carga.

### Dirección visual: «Fichero de oficina»

La idea es un archivador de oficina: una columna de fichas de usuario y una carpeta abierta con
sus posts. Es sobria, fría y ordenada.

| Token | Hex | Uso |
| --- | --- | --- |
| `paper` | `#EEF1F4` | Fondo de la página y de la columna de usuarios |
| `card` | `#FFFFFF` | Panel de detalle, inputs y la pestaña del usuario seleccionado |
| `ink` | `#1B2638` | Texto principal |
| `muted` | `#5A6578` | Texto secundario (username, email, empresa, contador y «Publishing…») |
| `rule` | `#D5DBE3` | Bordes y separadores |
| `accent` | `#2D5B8A` | Selección, anillo de foco y botón principal; ningún otro uso |
| `danger` | `#B42318` | Errores de validación y de carga |

- **Tipografía:** la interfaz usa `system-ui, "Segoe UI", Roboto, sans-serif`. Los títulos de
  los posts y el nombre del usuario en el detalle usan
  `Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif`. La escala es
  14 / 16 / 20 / 28 px y el texto de los posts no pasa de `65ch`.
- **Alineación:** todo a la izquierda.
- **El elemento memorable (el único), desde `md`:** el usuario seleccionado se convierte en una
  pestaña blanca que se une al panel de detalle. El borde izquierdo del panel se interrumpe a su
  altura, como la pestaña de una carpeta archivadora. En móvil no hay pestaña: el usuario
  seleccionado se marca con el monograma en `accent`.
- **Monograma:** las iniciales del usuario van en un cuadrado de 2.25rem con radio de 4px,
  fondo `paper` y texto `muted`. En el usuario seleccionado el fondo pasa a ser `accent` y el
  texto blanco.
- **Post pendiente:** el texto en `muted` y la etiqueta «Publishing…». Sin animaciones.
- **Lo que no lleva:** gradientes, sombras en cada tarjeta, etiquetas en mayúsculas sobre los
  títulos, separadores con punto medio ni animaciones de entrada. Los bordes usan
  `rule`; solo el panel lleva radio (6px). El foco es visible siempre (`outline` de 2px en
  `accent`). Las áreas táctiles miden al menos 44px (`min-h-11`).

```
 móvil (<48rem), vista lista      móvil, vista detalle          escritorio (≥48rem)
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────┬────────────────────────┐
│ Postboard            │   │ Postboard            │   │ Search users     │                        │
│ Search users         │   │ [‹ Back to users]    │   │ [__________]     │ Leanne Graham (serif)  │
│ [________________]   │   │                      │   │ [EH] Ervin H.    │ Sincere@april.biz      │
│ [LG] Leanne Graham   │ → │ Leanne Graham ←foco  │   │┌────────────────┘│ Romaguera-Crona        │
│      @Bret           │   │ Sincere@april.biz    │   ││[LG] Leanne G.    │ New post               │
│ [EH] Ervin Howell    │   │ New post             │   │└────────────────┐│ Title [_______]        │
│      @Antonette      │   │ Title [__________]   │   │ [CB] Clementine  │ Text  [_______]        │
│ ...                  │   │ Text  [__________]   │   │                  │        [Publish post]  │
│                      │   │      [Publish post]  │   │                  │ Posts (10)             │
│                      │   │ Posts (10) ...       │   │                  │ ...                    │
└──────────────────────┘   └──────────────────────┘   └──────────────────┴────────────────────────┘
```

### Objetivos, no objetivos y antiobjetivos

- **Objetivos:**
  - Cumplir los 5 puntos del enunciado con estados de carga y error accesibles.
  - Que los posts creados sobrevivan a una recarga.
  - Que la app sea usable a 320px.
  - Tests en cada pieza y un historial de commits que se pueda leer.
- **No objetivos:**
  - Router.
  - Sincronizar `localStorage` entre pestañas.
  - Paginación.
  - Editar o borrar posts.
  - Librerías de estado o de datos (React Query, Zustand) y librerías de formularios.
- **Antiobjetivos** (sería un fallo aunque funcionase):
  - Que un test toque la red real.
  - Que se repitan `key` porque la API devuelve siempre `id: 101`.
  - Que los posts de un usuario aparezcan en el detalle de otro.
  - Que unos datos corruptos en `localStorage` rompan la app.
  - Que algo guardado se interprete como HTML.
  - Que haya dependencias sin aprobar.
  - Que la interfaz parezca una plantilla.

---

## 2. Restricciones globales

Se aplican a todas las piezas y salen de `CLAUDE.md`:

- Solo **pnpm**; `packageManager` fijado en `package.json`.
- `pnpm-workspace.yaml` con `minimumReleaseAge: 1440` y `allowBuilds` solo para paquetes que
  hayas revisado y aprobado.
- TypeScript en modo `strict` y React 19.
- Tailwind v4: `@import "tailwindcss";` en el CSS y sin `tailwind.config.js`.
- No se añade ninguna dependencia fuera del stack sin explicarla y recibir aprobación.
- `res.ok === false` se trata como error, y las peticiones obsoletas se cancelan con
  `AbortController`.
- La búsqueda filtra en el cliente, sin distinguir mayúsculas y quitando espacios.
- La validación rechaza campos vacíos o con solo espacios.
- Accesibilidad: un `<label>` por input; `aria-describedby` entre cada input y su error;
  `role="alert"` en los errores; `role="status"` o `aria-live` en las cargas.
- React 19: en los formularios se prefieren las actions; la carga de datos va en hooks con
  `useEffect` + `AbortController`.
- `localStorage` con lectura defensiva: `try/catch`, `JSON.parse` protegido, type guard y claves
  versionadas. Lo guardado se pinta siempre como texto.
- Mobile-first: áreas táctiles de al menos 44px y sin scroll horizontal a 320px.
- Navegadores: Baseline «Widely available» sin fallback; «Newly available» solo con detección
  y un fallback simple.
- En inglés van el código, los nombres de archivo, el JSDoc, los comentarios, las descripciones
  de los tests, los commits y los textos de la interfaz. En español van `README.md`, `AI_LOG.md`
  y `docs/*.md`.
- Todo texto visible o accesible vive en `src/i18n/messages.ts` (sección 3). Los componentes no
  escriben textos a mano y los tests (unitarios y E2E) los importan de `messages`. Única
  excepción: el `<title>` estático de `index.html`.
- JSDoc breve en todo lo exportado (API, hooks y componentes).
- Los tests no tocan nunca la red real: MSW con `onUnhandledRequest: 'error'` en Vitest y
  `page.route` con bloqueo de todo lo externo en Playwright.
- Vitest no ejecuta `e2e/` y Playwright no ejecuta `src/`.
- Commits atómicos con Conventional Commits, en inglés y sin push: cada commit hace una sola
  cosa y pasa por sí solo `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build`, y el código
  va siempre con su test. Antes de cada commit se para para pedir tu OK, enseñando `git status`,
  un diff resumido y, en los de código, el rojo de la pieza y la salida real de los cuatro
  comandos.
- El prompt y la entrada de `AI_LOG.md` de cada fase van en su propio commit de docs al cerrarla.

## 3. Textos de la interfaz (`src/i18n/messages.ts`)

Todos los textos viven en el objeto `messages`, agrupado por área y sin `as const` (otro idioma
se declararía con `satisfies typeof messages`). Los textos con datos son funciones. Los
componentes y los tests importan las claves; ninguno repite el literal. Cada pieza añade solo
las claves que usa, en su mismo commit.

| Clave de `messages` | Texto | Dónde | Pieza |
| --- | --- | --- | --- |
| `app.title` | `Postboard` | `h1` y `<title>` sin usuario | P3.1 |
| `app.pageTitle(name)` | `{name} · Postboard` | `<title>` con usuario | P5.11 |
| `app.selectUser` | `Select a user to see their posts.` | Detalle sin usuario | P5.10 |
| `app.backToUsers` | `Back to users` | Volver en móvil | P5.10 |
| `common.tryAgain` | `Try again` | Botón de reintento | P5.7 |
| `users.searchLabel` | `Search users` | Label de la búsqueda | P5.3 |
| `users.usernameHandle(username)` | `@{username}` | Username en la lista | P5.5 |
| `users.loading` | `Loading users…` | Carga de usuarios | P5.8 |
| `users.loadError` | `Couldn't load users.` | Error de usuarios | P5.8 |
| `users.noUsersMatch(query)` | `No users match "{query}".` (con la búsqueda ya recortada) | Búsqueda sin resultados | P5.8 |
| `form.titleRequired` | `Enter a title.` | Error de validación | P6.1 |
| `form.bodyRequired` | `Enter the post text.` | Error de validación | P6.1 |
| `form.submit` | `Publish post` | Botón de envío | P6.5 |
| `form.submitting` | `Publishing…` | Botón mientras se envía | P6.5 |
| `form.heading` | `New post` | Título del formulario (`h3`) | P6.6 |
| `form.titleLabel` | `Title` | Label | P6.6 |
| `form.bodyLabel` | `Text` | Label | P6.6 |
| `form.published` | `Post published.` | Aviso de éxito (`role="status"`) | P6.6 |
| `form.publishError` | `Couldn't publish the post. Try again.` | Error al publicar (`role="alert"`) | P6.6 |
| `posts.pending` | `Publishing…` | Post pendiente en la lista | P6.7 |
| `posts.empty` | `This user has no posts yet.` | Usuario sin posts | P6.7 |
| `posts.loading` | `Loading posts…` | Carga de posts | P6.8 |
| `posts.loadError` | `Couldn't load posts.` | Error de posts | P6.8 |
| `posts.postsCount(count)` | `Posts ({count})` | Título de la sección de posts (`h3`) | P6.8 |

El `<title>Postboard</title>` de `index.html` es la única excepción: se pinta antes de que cargue
JS. En la prosa de este plan y en las descripciones de los tests (`it('…')`) los textos se
nombran por su valor para que se lean bien; en el código y en las aserciones siempre se usa la
clave.

## 4. Contratos compartidos

Son las firmas en las que se apoyan las piezas. Cada pieza crea la suya; aquí están juntas para
que los nombres y los tipos no se desvíen.

```ts
// src/i18n/messages.ts (claves y textos en la sección 3)
/** English UI copy. Another locale can be declared as `{ ... } satisfies typeof messages`. */
export const messages = {
  app: { title: 'Postboard', pageTitle: (name: string) => `${name} · Postboard`, /* … */ },
  users: { noUsersMatch: (query: string) => `No users match "${query}".`, /* … */ },
  posts: { postsCount: (count: number) => `Posts (${count})`, /* … */ },
  // common, form …
}

// src/types.ts
export interface User { id: number; name: string; username: string; email: string; company: { name: string } }
export interface Post { userId: number; id: number; title: string; body: string }
export interface NewPost { userId: number; title: string; body: string }
/** Post with a React key that is unique even when the API repeats ids (POST always returns 101). */
export interface PostEntry extends Post { key: string }
/** A post on screen; `pending` while its POST is in flight (optimistic). */
export interface DisplayPost extends PostEntry { pending?: boolean }
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
// src/lib/breakpoints.ts
/** Matches Tailwind's `md` breakpoint (48rem). Keep both in sync. */
export const MD_BREAKPOINT_REM = 48
export const NARROW_VIEWPORT_QUERY = `(width < ${MD_BREAKPOINT_REM}rem)`
export function isNarrowViewport(): boolean            // matchMedia(NARROW_VIEWPORT_QUERY), false if unavailable
export interface PostFormValues { title: string; body: string }
export type PostFormErrors = Partial<Record<keyof PostFormValues | 'form', string>>
export function validatePost(values: PostFormValues): PostFormErrors   // only 'title' | 'body'
// src/lib/createdPostsStorage.ts
export const CREATED_POSTS_KEY_PREFIX = 'postboard:created-posts:v1'
export function getCreatedPostsKey(userId: number): string             // `${prefix}:${userId}`
export function isPostEntry(value: unknown): value is PostEntry
export function getBrowserStorage(): Storage | null                    // null if access throws
export function readCreatedPosts(storage: Storage | null, userId: number): PostEntry[]
export function writeCreatedPosts(storage: Storage | null, userId: number, posts: PostEntry[]): boolean

// src/hooks
export function useUsers(): AsyncState<User[]> & { retry: () => void }
export function useUserPosts(userId: number): AsyncState<PostEntry[]> & { retry: () => void }
export function useCreatedPosts(userId: number): {
  createdPosts: PostEntry[]
  saveCreatedPost: (entry: PostEntry) => void   // writes under entry.userId (works after unmount) + prepends; never throws
}

// src/components (props)
UsersPanel  { selectedUserId: number | null; onSelectUser: (user: User) => void }
PostsPanel  { user: User; headingRef?: Ref<HTMLHeadingElement> }   // React 19: ref as a prop
PostForm    { onPublish: (values: PostFormValues) => Promise<void> } // rejects on failure
interface PostFormState { errors: PostFormErrors; submitted: PostFormValues; published: boolean }
```

**Claves de React:**
- Un post de la API usa `post-{id}`.
- Un post creado usa `crypto.randomUUID()`, generado una sola vez en `PostsPanel` y compartido
  por la versión optimista y la guardada.

## 5. Estructura de archivos

```
src/
  api/         client.ts, users.ts, posts.ts                          (+ *.test.ts)
  hooks/       useUsers.ts, useUserPosts.ts, useCreatedPosts.ts       (+ *.test.ts)
  i18n/        messages.ts           (sin test propio: se prueba a través de los componentes)
  components/  UserSearch, UserList, LoadingMessage, ErrorMessage, UsersPanel,
               SubmitButton, PostForm, PostList, PostsPanel          (.tsx + .test.tsx)
  lib/         filterUsersByName.ts, getInitials.ts, breakpoints.ts, isNarrowViewport.ts,
               validatePost.ts, createdPostsStorage.ts                (+ *.test.ts)
  test/        setup.ts, server.ts, server.test.ts, handlers.ts, fixtures.ts
  types.ts, App.tsx, App.test.tsx, main.tsx, index.css
e2e/           mockApi.ts, users.spec.ts, posts.spec.ts, persistence.spec.ts,
               errors.spec.ts, mobile.spec.ts
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

**Entorno de tests:** `setup.ts` limpia `localStorage` después de cada test (desde P6.3). jsdom
no tiene `matchMedia`, así que por defecto los tests ven escritorio. Los tests de móvil lo
simulan con `vi.stubGlobal('matchMedia', …)` y `matches: true`.

## 6. Ciclo de cada pieza

1. **Solo en P5-P7, antes de escribir UI:** consultar modern-web-guidance con las búsquedas que
   indique la pieza:
   `pnpx modern-web-guidance@latest search "<consulta>" --skill-version 2026_11_10-47b4c80e` y
   después `pnpx modern-web-guidance@latest retrieve "<id>"`. Se aplica la política de
   navegadores de `CLAUDE.md` y se anota en `AI_LOG.md` qué guía influyó y en qué.
2. Escribir el test (o los tests) de la pieza. Los textos se buscan con las claves de
   `messages`, nunca con el literal.
3. Ejecutar `pnpm test <ruta>` y verlo fallar por la razón esperada (falta el módulo o falla la
   aserción). El rojo nunca puede tocar la red real.
4. Escribir el código mínimo con la firma de la sección 4 y JSDoc si se exporta. Si la pieza
   pinta textos, añade a `src/i18n/messages.ts` solo las claves que usa.
5. Ejecutar `pnpm test <ruta>` y verlo en verde. Refactorizar si hace falta, en verde.
6. Ejecutar `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build`: el commit tiene que pasar
   los cuatro por sí solo.
7. **PARAR:** explicar qué se ha hecho, enseñar `git status`, un diff resumido, el rojo y la
   salida real de los cuatro comandos, y esperar tu OK.
8. Hacer el commit con el mensaje de la pieza. Solo incluye los archivos de la pieza.

**Cierre de cada fase:** el prompt de la fase se añade a `docs/prompts.md` y su entrada a
`AI_LOG.md`. Ambos van en un commit propio de docs, `docs: log pN prompt and ai decisions`, sin
código, también con tu OK.

## 7. Puntos de revisión

Son las situaciones que el enunciado no menciona y que más pueden fallar a quien use la app.
Cada una tiene un test en la pieza que la resuelve.

1. **Cambio rápido de usuario:** la respuesta tardía del usuario anterior no puede pisar los
   posts del actual. Lo cubre `useUserPosts`: «aborts the previous request when userId
   changes».
2. **Dos posts creados con `id: 101`:** los dos tienen que verse y sin repetir `key`, ni en la
   versión optimista ni en la guardada. Lo cubre `PostsPanel` («shows two created posts…»).
3. **Doble clic en «Publish post»:** solo se envía una petición. Lo cubre `PostForm`
   («publishes once on a double click»).
   - El botón se desactiva con `useFormStatus`.
   - `useActionState` pone las acciones en cola, así que si el test muestra que el segundo clic
     llega a encolarse, se añade un guard en `onSubmit` que haga `preventDefault()` mientras
     haya un envío en curso.
4. **`localStorage` corrupto, lleno o bloqueado:** la app funciona igual, sin persistencia. Lo
   cubren `createdPostsStorage`, `useCreatedPosts` y `PostsPanel` («still publishes when
   storage is unavailable»).
5. **Fallan los posts pero no los usuarios:** el error sale solo en el detalle, los posts
   creados siguen visibles y «Try again» lo recupera. Lo cubre `PostsPanel` («shows an error
   and recovers with Try again»).

---

## P3 — Scaffold y librerías

### P3.1 Proyecto base con Vitest

- **Archivos:** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.gitignore`,
  `tsconfig*.json`, `vite.config.ts`, la configuración del linter que traiga la plantilla (con
  Oxlint, `.oxlintrc.json`), `index.html` (`<title>Postboard</title>`), `public/favicon.svg`,
  `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/i18n/messages.ts` (solo
  `app.title`) y `src/test/setup.ts` (importa `@testing-library/jest-dom/vitest`). Sin
  Tailwind ni `src/index.css`: llegan en P3.2.
- **Pasos:**
  - Crear la base con la plantilla `react-ts` de Vite usando pnpm, en una subcarpeta temporal
    para no tocar lo que ya hay en la raíz. Comprobar que trae React 19.
  - Borrar la demo de la plantilla (logos, `App.css`, `index.css`, `icons.svg`, el README y el
    contador).
  - `App` renderiza solo `<h1>{messages.app.title}</h1>`.
  - Fijar `packageManager`.
  - Crear `pnpm-workspace.yaml` con `minimumReleaseAge: 1440`. `allowBuilds` se rellena solo con
    lo que `pnpm install` diga que necesita compilar, y tras enseñártelo.
  - Añadir Vitest, `@testing-library/react`, `@testing-library/user-event`,
    `@testing-library/jest-dom` y `jsdom`.
  - Configurar `test` en `vite.config.ts`: `environment: 'jsdom'`,
    `setupFiles: './src/test/setup.ts'`, `include: ['src/**/*.test.{ts,tsx}']` y `e2e/` en
    `exclude`.
  - **Linter:** se usa el que traiga la plantilla. Si es Oxlint, se configura en
    `.oxlintrc.json` y **no se añade ESLint**. Se activan los plugins y reglas de React hooks
    (`rules-of-hooks` y `exhaustive-deps`), TypeScript y `jsx-a11y`. `pnpm lint` ejecuta ese
    linter.
  - Scripts: `dev`, `build`, `preview`, `lint`, `typecheck` (`tsc -b`), `test` (`vitest run`)
    y `test:watch` (`vitest`).
- **Antes de seguir:** consultar en Context7 la sintaxis actual de `allowBuilds` y
  `minimumReleaseAge` en pnpm, la configuración de Vitest dentro de Vite y la de los plugins de
  Oxlint (`react`, `typescript` y `jsx-a11y`).
- **Test (`src/App.test.tsx`):** `it('renders the app heading')`. Comprueba que hay un
  `heading` de nivel 1 con el nombre `messages.app.title`. El rojo: el test se escribe antes de
  que exista `src/i18n/messages.ts`, así que falla porque falta el módulo.
- **Verificación:** `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build` en verde.
- [ ] **Commit:** `chore: scaffold vite react-ts project with vitest`

### P3.2 Tailwind CSS v4

- **Archivos:** `package.json`, `pnpm-lock.yaml`, `vite.config.ts` (plugin `@tailwindcss/vite`),
  `src/index.css` (`@import "tailwindcss";`) y `src/main.tsx` (importa `index.css`).
- **Pasos:** instalar `tailwindcss` y `@tailwindcss/vite`, sin `tailwind.config.js`. Los tokens
  visuales se añaden en P7.
- **Test:** es solo configuración, sin código de la app nuevo. `App.test.tsx` sigue en verde.
- **Verificación:** `pnpm build` genera CSS con las utilidades usadas (se comprueba con una
  clase de prueba que no se queda en el commit).
- [ ] **Commit:** `chore: add tailwind css v4`

### P3.3 Servidor MSW para los tests

- **Archivos:** `package.json`, `pnpm-lock.yaml`, `src/test/server.ts`, `src/test/handlers.ts`
  (vacío por ahora: `export const handlers = []`), `src/test/setup.ts` y
  `src/test/server.test.ts`.
- **Pasos:** instalar `msw`. En `setup.ts`: `beforeAll(() => server.listen({ onUnhandledRequest:
  'error' }))`, `afterEach(() => server.resetHandlers())` y `afterAll(() => server.close())`.
- **Test (`server.test.ts`):** `it('rejects requests that have no handler')`. Comprueba que
  `fetch('https://jsonplaceholder.typicode.com/unhandled')` es rechazado **y** que MSW la
  registra como no manejada (evento `request:unhandled` de `server.events`). Sin lo segundo, un
  fallo de la red real también haría pasar el test. Es la garantía de que ningún test toca la
  red real.
- **El rojo no toca la red:** el test importa `server` de `./server` y se escribe antes que
  `server.ts` y que el cambio de `setup.ts`, así que falla al importar, antes de hacer ninguna
  petición.
- [ ] **Commit:** `test: add msw server that blocks unhandled requests`

### Cierre de P3

- **Archivos:** `docs/prompts.md` (el prompt de P3 y la corrección posterior, literales) y
  `AI_LOG.md`.
- [ ] **Commit:** `docs: log p3 prompt and ai decisions`

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

### Cierre de P4

- [ ] **Commit:** `docs: log p4 prompt and ai decisions` (`docs/prompts.md` y `AI_LOG.md`)

---

## P5 — Usuarios, búsqueda y layout

**modern-web-guidance de la fase:** «accessible search input», «loading status live region»,
«error alert message», «responsive two column layout», «focus management view change» y
«touch target size».

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
  con `<label>` `messages.users.searchLabel`.
- **Textos:** `users.searchLabel`.
- **Tests:**
  - `it('has a visible search label')`:
    `getByRole('searchbox', { name: messages.users.searchLabel })`.
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
  Es un `<ul>` con un `<button>` por usuario (`min-h-11`) que muestra el monograma
  (`aria-hidden`), el nombre y `messages.users.usernameHandle(username)` (`@username`). El
  seleccionado lleva `aria-current="true"`.
- **Textos:** `users.usernameHandle`.
- **Tests:**
  - `it('renders a button per user with name and username')`
  - `it('marks the selected user as current')`: `getByRole('button', { current: true })`
    contiene «Leanne Graham».
  - `it('calls onSelect with the clicked user')`
- [ ] **Commit:** `feat: add UserList component`

### P5.6 `LoadingMessage`

- **Archivos:** `src/components/LoadingMessage.tsx` y `.test.tsx`.
- **Props:** `{ children: ReactNode }`. Es un `<p role="status">` (que ya implica
  `aria-live="polite"`). No tiene textos propios: el texto llega de quien lo usa, ya sacado de
  `messages`.
- **Test:** `it('announces the message as a status')`: `getByRole('status')` contiene el texto.
- [ ] **Commit:** `feat: add LoadingMessage component`

### P5.7 `ErrorMessage`

- **Archivos:** `src/components/ErrorMessage.tsx` y `.test.tsx`.
- **Props:** `{ children: ReactNode; onRetry?: () => void }`. Es un contenedor con
  `role="alert"`; si hay `onRetry`, lleva un botón `messages.common.tryAgain`.
- **Textos:** `common.tryAgain`.
- **Tests:**
  - `it('announces the message as an alert')`
  - `it('calls onRetry when Try again is clicked')`
  - `it('hides Try again when there is no onRetry')`
- [ ] **Commit:** `feat: add ErrorMessage component`

### P5.8 `UsersPanel`

- **Archivos:** `src/components/UsersPanel.tsx` y `.test.tsx`.
- **Props:** las de la sección 4. Une `useUsers`, `UserSearch`, `filterUsersByName`,
  `UserList`, `LoadingMessage` y `ErrorMessage`. El texto de la búsqueda es estado local.
- **Textos:** `users.loading`, `users.loadError` y `users.noUsersMatch`.
- **Tests** (MSW):
  - `it('shows a loading status and then the users')`
  - `it('filters users as the user types')`: escribir `'  CLEM'` deja 2 botones.
  - `it('shows a no-match message')`: `'zzz'` → `messages.users.noUsersMatch('zzz')`.
  - `it('shows an error and recovers with Try again')`: primero 500 → alerta
    `messages.users.loadError`; tras clic en `messages.common.tryAgain`, la lista.
  - `it('calls onSelectUser with the clicked user')`
- [ ] **Commit:** `feat: add UsersPanel with search, loading and error states`

### P5.9 `isNarrowViewport`

- **Archivos:** `src/lib/breakpoints.ts`, `src/lib/isNarrowViewport.ts` y `.test.ts`.
- **Comportamiento:**
  - El corte sale de una constante compartida: `MD_BREAKPOINT_REM = 48` en `breakpoints.ts`,
    con un comentario que dice que coincide con `md` de Tailwind. De ahí se construye
    `NARROW_VIEWPORT_QUERY`.
  - Devuelve `window.matchMedia(NARROW_VIEWPORT_QUERY).matches`. Si `matchMedia` no existe,
    devuelve `false`.
  - La sintaxis de rangos en media queries se confirma con modern-web-guidance.
- **Tests:**
  - `it('queries the viewport below the md breakpoint')`: `matchMedia` recibe
    `NARROW_VIEWPORT_QUERY`, que es `'(width < 48rem)'`.
  - `it('is true when the narrow media query matches')`
  - `it('is false when it does not match')`
  - `it('is false when matchMedia is not available')`
- [ ] **Commit:** `feat: add isNarrowViewport helper`

### P5.10 `App`: layout mobile-first

- **Archivos:** `src/App.tsx` y `src/App.test.tsx`.
- **Comportamiento:**
  - **Estado:** `selectedUser: User | null` y `mobileView: 'list' | 'detail'`.
  - **Base (móvil):** se muestra solo la vista activa (la otra con `hidden`). En `detail` hay
    un botón `messages.app.backToUsers` (`min-h-11`) encima del panel. Desde `md`, rejilla de dos columnas
    con las dos vistas visibles (`md:block`) y el botón oculto (`md:hidden`).
  - **Al elegir un usuario:** `mobileView = 'detail'`. Si `isNarrowViewport()`, el foco va al
    `h2` del detalle (`tabIndex={-1}`).
  - **«Back to users»:** `mobileView = 'list'`, se mantiene la selección y el foco vuelve al
    botón del usuario seleccionado. `UsersPanel` no se desmonta, así que la búsqueda se
    conserva.
  - **El detalle en esta fase:** `messages.app.selectUser` o el `h2` con el nombre. P6 lo
    sustituye por `PostsPanel`.
  - **Textos:** `app.selectUser` y `app.backToUsers`.
  - Que cada vista se oculte de verdad solo se puede comprobar con CSS real. Lo comprueba el
    E2E móvil de P8; aquí se prueba el comportamiento.
- **Tests:** se mantiene el del encabezado y se añaden:
  - `it('asks to select a user before showing posts')`
  - `it('shows the selected user in the detail area')`: clic en «Ervin Howell» → `heading`
    «Ervin Howell».
  - `it('moves focus to the detail heading on a narrow viewport')`: con `matchMedia` simulado
    (`matches: true`).
  - `it('keeps focus on the user list on a wide viewport')`
  - `it('goes back to the list and focuses the selected user')`: tras «Back to users», el botón
    desaparece y el foco está en el botón `current` de Ervin.
  - `it('keeps the search text after going back')`
- [ ] **Commit:** `feat: add mobile-first list and detail layout`

### P5.11 `<title>` por usuario

- **Archivos:** `src/App.tsx` y `src/App.test.tsx`.
- **Comportamiento:** `App` renderiza `<title>` con el soporte de metadatos de React 19, que lo
  sube a `<head>`. Sin usuario seleccionado es `messages.app.title`; con uno,
  `messages.app.pageTitle(name)` (`{name} · Postboard`). Se mantiene aunque `mobileView`
  vuelva a `list`, porque la selección sigue.
- **Textos:** `app.pageTitle`.
- **Comprobación en el navegador:** `index.html` ya trae `<title>Postboard</title>`. Si con los
  dos `<title>` el de `index.html` gana en `document.title`, se quita de `index.html` y `App`
  pasa a ser la única fuente. Lo confirma el E2E de P8.1.
- **Tests:**
  - `it('uses Postboard as the page title when no user is selected')`
  - `it('shows the selected user in the page title')`: clic en «Ervin Howell» →
    `document.title === messages.app.pageTitle('Ervin Howell')`.
- [ ] **Commit:** `feat: show the selected user in the page title`

### Cierre de P5

- [ ] **Commit:** `docs: log p5 prompt and ai decisions` (`docs/prompts.md` y `AI_LOG.md`)

---

## P6 — Posts, formulario y persistencia

**Antes de seguir:** consultar en Context7 cómo `useActionState` resetea el formulario y usa
`defaultValue`, y cómo funcionan `useFormStatus` y `useOptimistic`.

**modern-web-guidance de la fase:** «form validation error messages», «accessible form errors»,
«required form fields» y «prevent duplicate form submission».

### P6.1 `validatePost`

- **Archivos:** `src/lib/validatePost.ts` y `.test.ts`.
- **Textos:** `form.titleRequired` y `form.bodyRequired`.
- **Tests:**
  - `it('requires a title and a text')`: `{ title: '', body: '' }` →
    `{ title: messages.form.titleRequired, body: messages.form.bodyRequired }`.
  - `it('rejects fields that only contain spaces')`
  - `it('returns no errors for valid values')`: → `{}`.
  - `it('reports only the missing field')`
- [ ] **Commit:** `feat: add post form validation`

### P6.2 `useUserPosts`

- **Archivos:** `src/hooks/useUserPosts.ts` y `.test.ts`.
- **Comportamiento:** cada vez que cambia `userId`, aborta la petición anterior y llama a
  `getPostsByUser(userId, signal)`. Los posts se mapean a `PostEntry` con la clave
  `post-{id}`. `retry()` repite la petición. No sabe nada de los posts creados.
- **Tests** (`renderHook` + MSW):
  - `it('starts in the loading state')`
  - `it('returns the user posts with stable keys')`: las claves son `post-1` y `post-2`.
  - `it('returns an error when the API answers 500')`
  - `it('returns an error when the network fails')`
  - `it('aborts the previous request when userId changes')`: el usuario 1 responde con retraso
    y el 2 al momento. Tras `rerender({ userId: 2 })`, `data` es solo de Ervin, también después
    de que llegue la respuesta del 1, y la señal del 1 está abortada.
  - `it('aborts the request on unmount')`
  - `it('fetches again on retry after an error')`
- [ ] **Commit:** `feat: add useUserPosts hook with abort on user change`

### P6.3 `createdPostsStorage`

Son funciones puras: reciben el `Storage` como parámetro y no tocan globales, salvo
`getBrowserStorage`.

- **Archivos:** `src/lib/createdPostsStorage.ts` y `.test.ts`, y `src/test/setup.ts`
  (`afterEach(() => localStorage.clear())`).
- **Comportamiento:**
  - `readCreatedPosts`:
    - Devuelve `[]` si `storage` es `null`, si no hay nada guardado, si `getItem` lanza, si
      `JSON.parse` falla o si el valor no es un array.
    - Si es un array, se queda con las entradas que pasan `isPostEntry` y cuyo `userId` es el
      pedido.
  - `isPostEntry`: comprueba que `userId` e `id` son números finitos y que `title`, `body` y
    `key` son strings.
  - `writeCreatedPosts`: hace `setItem` en `try/catch` y devuelve `false` si falla (cuota llena
    o bloqueo).
  - `getBrowserStorage`: devuelve `window.localStorage` dentro de un `try/catch`, porque solo
    acceder a él puede lanzar `SecurityError`.
- **Tests:**
  - `it('builds a versioned key per user')`: `getCreatedPostsKey(1)` →
    `'postboard:created-posts:v1:1'`.
  - `it('returns an empty list when nothing is stored')`
  - `it('writes posts and reads them back')`
  - `it('keeps each user separate')`
  - `it('ignores data that is not valid JSON')`
  - `it('ignores data that is not a list')`: `'{}'`, `'null'` y `'42'`.
  - `it('drops entries with an invalid shape and keeps the valid ones')`
  - `it('drops entries that belong to another user')`
  - `it('returns an empty list when reading throws')`: `vi.spyOn(Storage.prototype, 'getItem')`
    lanza.
  - `it('reports false instead of throwing when writing fails')`: `setItem` lanza
    `QuotaExceededError`.
  - `it('returns null when localStorage cannot be accessed')`: el getter de
    `window.localStorage` lanza.
- [ ] **Commit:** `feat: add defensive created posts storage`

### P6.4 `useCreatedPosts`

- **Archivos:** `src/hooks/useCreatedPosts.ts` y `.test.ts`.
- **Comportamiento:**
  - El estado inicial se lee una sola vez:
    `useState(() => readCreatedPosts(getBrowserStorage(), userId))`.
  - `saveCreatedPost(entry)` hace dos cosas independientes:
    - **Escribe en storage** con `entry.userId` (el capturado al enviar, que viaja en el post) y
      no con el `userId` del render actual. Lee lo guardado en ese momento y escribe
      `writeCreatedPosts(storage, entry.userId, [entry, ...readCreatedPosts(storage,
      entry.userId)])`. La escritura va fuera de cualquier updater de `setState`: si el
      componente ya se desmontó (el usuario cambió mientras se publicaba), React no ejecuta los
      updaters y el post se perdería.
    - **Actualiza el estado** con `setCreatedPosts(prev => [entry, ...prev])`. Si el componente
      ya no está montado, no hace nada.
  - Si la escritura falla, el post sigue en memoria.
  - Nunca lanza.
- **Tests** (`renderHook`):
  - `it('starts with the posts stored for the user')`
  - `it('saves a post and recovers it after remounting')`
  - `it('keeps posts isolated per user')`
  - `it('ignores corrupt stored data')`
  - `it('starts empty when reading storage throws')`
  - `it('keeps the post in memory when writing storage throws')`
  - `it('stores the post under its own userId even after unmounting')`: tras `unmount()`, se
    llama a `saveCreatedPost` y `readCreatedPosts(localStorage, 1)` lo contiene.
- [ ] **Commit:** `feat: add useCreatedPosts hook backed by localStorage`

### P6.5 `SubmitButton`

- **Archivos:** `src/components/SubmitButton.tsx` y `.test.tsx`.
- **Comportamiento:** `useFormStatus()`. Mientras `pending`, el botón está `disabled` y dice
  `messages.form.submitting`; si no, dice `messages.form.submit`. Es `type="submit"` y tiene
  `min-h-11`. Tiene que renderizarse dentro de un `<form>`.
- **Textos:** `form.submit` y `form.submitting`.
- **Tests:**
  - `it('shows Publish post when the form is idle')`
  - `it('is disabled and shows Publishing… while the form action is pending')`: se renderiza
    dentro de `<form action={() => new Promise(() => {})}>` y se hace clic.
- [ ] **Commit:** `feat: add SubmitButton with form pending state`

### P6.6 `PostForm`

- **Archivos:** `src/components/PostForm.tsx` y `.test.tsx`.
- **Props y estado:** los de la sección 4. Usa `useActionState(publishAction, initialState)`,
  con `<form action={formAction} noValidate>` y el `h3` `messages.form.heading`.
- **Textos:** `form.heading`, `form.titleLabel`, `form.bodyLabel`, `form.published` y
  `form.publishError`.
- **`publishAction(prev, formData)`:**
  1. Lee `title` y `body` (texto sin recortar) y los recorta.
  2. Si `validatePost` da errores, devuelve `{ errors, submitted: lo escrito, published: false }`
     y no llama a `onPublish`.
  3. Si no, hace `await onPublish(recortados)`:
     - Si va bien, devuelve `{ errors: {}, submitted: { title: '', body: '' }, published: true }`.
     - Si lanza, devuelve `{ errors: { form: messages.form.publishError }, submitted: lo
       escrito, published: false }`.
- **Render:**
  - Los inputs llevan `defaultValue={state.submitted.title|body}`. Así, el reset automático de
    React los vacía si todo va bien y conserva lo escrito si falla.
  - Cada input tiene su `<label>` y, si hay error, `aria-invalid="true"` y `aria-describedby`
    apuntando a su `<p role="alert">`.
  - `errors.form` va en un `role="alert"` y `published` muestra `messages.form.published` en
    un `role="status"`.
  - `SubmitButton` va dentro del formulario.
- **Tests** (`onPublish` es un `vi.fn()`):
  - `it('labels the title and text fields')`
  - `it('shows both errors and does not publish when submitted empty')`: dos alertas, los inputs
    con `aria-invalid` y descripción accesible (`toHaveAccessibleDescription`), y `onPublish`
    sin llamar.
  - `it('rejects fields that only contain spaces')`: además, los espacios escritos se
    conservan.
  - `it('publishes trimmed values')`: `onPublish` recibe `{ title: 'Hello', body: 'World' }`.
  - `it('clears the form and announces success after publishing')`
  - `it('keeps what was typed and shows an error when publishing fails')`: `onPublish` lanza
    → alerta `messages.form.publishError` y los inputs con sus valores.
  - `it('publishes once on a double click')`: `onPublish` devuelve una promesa pendiente y, tras
    `dblClick`, se ha llamado una vez y el botón está desactivado con
    `messages.form.submitting`.
- [ ] **Commit:** `feat: add PostForm using form actions`

### P6.7 `PostList`

- **Archivos:** `src/components/PostList.tsx` y `.test.tsx`.
- **Props:** `{ posts: DisplayPost[] }`.
  - Es un `<ul>` de `<article>`, cada uno con un `h4` (el título) y un `<p>` (el cuerpo), con
    `key` igual a `post.key`.
  - Todo se pinta como texto JSX, sin `dangerouslySetInnerHTML`.
  - Un post `pending` lleva `aria-busy="true"` y la etiqueta `messages.posts.pending`.
  - Si no hay posts, muestra `messages.posts.empty`.
- **Textos:** `posts.pending` y `posts.empty`.
- **Tests:**
  - `it('renders each post title and text')`
  - `it('shows an empty message when there are no posts')`
  - `it('marks pending posts as publishing')`
  - `it('renders markup in titles and text as plain text')`: un título
    `<img src=x onerror=alert(1)>` aparece literal y no hay ningún `img`.
- [ ] **Commit:** `feat: add PostList component`

### P6.8 `PostsPanel`

- **Archivos:** `src/components/PostsPanel.tsx` y `.test.tsx`.
- **Props:** las de la sección 4. `headingRef` usa el ref como prop de React 19, sin
  `forwardRef`.
- **Comportamiento:**
  - **Cabecera:** el `h2` (nombre, `tabIndex={-1}`, `ref={headingRef}`), y el email y la empresa
    en líneas separadas.
  - **Estado:** `useUserPosts(user.id)` y `useCreatedPosts(user.id)`. Además,
    `const [visibleCreated, addPendingPost] = useOptimistic(createdPosts, (current, pending:
    DisplayPost) => [pending, ...current])`.
  - **`onPublish(values)`:** se ejecuta dentro de la action, así que puede usar `useOptimistic`
    sin `startTransition`:
    1. Captura `const userId = user.id` al empezar y genera `key = crypto.randomUUID()`.
       Llama a `addPendingPost({ ...values, userId, id: 0, key, pending: true })`.
    2. Hace `const post = await createPost({ userId, ...values })` y, después,
       `saveCreatedPost({ ...post, userId, key })`. El `userId` explícito no depende de que la
       API lo devuelva, y la escritura va a la clave del usuario que publicó, aunque el panel ya
       sea de otro.
    3. Si `createPost` lanza, el error se propaga a `PostForm`. Al terminar la action, el post
       optimista desaparece solo y no se guarda nada.
  - **Lista:** `PostForm`, luego el `h3` `messages.posts.postsCount(count)` y `PostList` con
    `[...visibleCreated, ...(fetched si success)]`. Debajo, `LoadingMessage` o `ErrorMessage`
    para la parte de la API, con `messages.posts.loading` y `messages.posts.loadError`. Los
    creados se ven aunque la API falle.
- **Textos:** `posts.loading`, `posts.loadError` y `posts.postsCount`.
- **Tests** (MSW):
  - `it('shows the user header')`
  - `it('shows a loading status and then the posts')`
  - `it('shows an error and recovers with Try again')`: el error sale solo aquí y los posts
    creados siguen visibles.
  - `it('shows a new post as pending until the API confirms it')`: con el POST retrasado se ve
    `messages.posts.pending` en la lista; después desaparece y el post queda arriba.
  - `it('removes the pending post and shows an error when publishing fails')`: con POST 500,
    el post desaparece, se ve la alerta y el formulario conserva lo escrito.
  - `it('shows two created posts even though the API returns the same id')`: dos títulos, el
    contador sube en 2 y no hay ningún `console.error` de claves repetidas (con un spy).
  - `it('shows created posts above the API posts')`
  - `it('keeps created posts after remounting')`
  - `it('does not store a post when publishing fails')`: la clave de `localStorage` no
    existe.
  - `it('still publishes when storage is unavailable')`: `setItem` lanza y el post aparece
    igualmente.
- [ ] **Commit:** `feat: add PostsPanel with optimistic and persisted posts`

### P6.9 `App` con el detalle de posts

- **Archivos:** `src/App.tsx` y `src/App.test.tsx`.
- **Comportamiento:** el detalle renderiza
  `<PostsPanel key={user.id} user={user} headingRef={detailHeadingRef} />`. La `key` reinicia
  el formulario y el estado optimista al cambiar de usuario. El foco en móvil (de P5.10) pasa a
  usar ese `headingRef`.
- **Tests:** los de P5.10 se mantienen y se añaden:
  - `it('shows the posts of the selected user')`
  - `it('creates a post for the selected user')`: el flujo completo, del clic en el usuario al
    post visible arriba.
  - `it('keeps each user created posts when switching users')`: se crea un post para Leanne, se
    va a Ervin (no aparece) y se vuelve a Leanne (sigue ahí).
  - `it('stores the post for the original user when switching users while publishing')`:
    1. Con el POST retrasado, se publica para Leanne y se cambia a Ervin antes de que responda.
       El post no aparece en Ervin, tampoco cuando el POST termina.
    2. Se espera la respuesta y se vuelve a Leanne: el post está arriba.
    3. Pasa gracias a la escritura con `entry.userId` fuera del estado (P6.4 y P6.8).
- **Límite conocido** (va a «qué haría con más tiempo»): si se vuelve al usuario original
  *antes* de que responda el POST, el panel nuevo ya leyó el storage y no verá el post hasta el
  siguiente montaje. Se resolvería con `useSyncExternalStore` sobre un pequeño almacén con
  suscripción.
- [ ] **Commit:** `feat: show selected user posts in app`

### Cierre de P6

- [ ] **Commit:** `docs: log p6 prompt and ai decisions` (`docs/prompts.md` y `AI_LOG.md`)

---

## P7 — Pulido visual

Aquí no cambia el comportamiento. Los tests de P3 a P6 deben seguir en verde sin tocarlos. Para
revisar cada pieza se arranca la app con `pnpm dev` y se hacen capturas a 320, 375 y 1280 px.

**modern-web-guidance de la fase:** «focus visible styles», «color contrast text», «prevent
horizontal overflow» y «touch target size».

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
- **Pasos:**
  - Monograma; nombre en `ink` y `@username` en `muted`.
  - Desde `md`, el usuario seleccionado usa fondo `card`, monograma en `accent` y se extiende
    sobre el borde del panel (margen negativo y `z-index`), formando la pestaña.
  - Columna de usuarios de `18rem` y `sticky` desde `md`.
- **Verificación:** los tests siguen en verde, y en las capturas la pestaña queda unida al panel
  sin una línea en medio.
- [ ] **Commit:** `style: connect the selected user to the detail panel as a folder tab`

### P7.3 Detalle, formulario y estados

- **Archivos:** `PostsPanel.tsx`, `PostForm.tsx`, `SubmitButton.tsx`, `PostList.tsx`,
  `LoadingMessage.tsx` y `ErrorMessage.tsx`.
- **Pasos:**
  - Nombre del usuario y títulos de los posts en serif; cuerpo con un máximo de `65ch`;
    separadores en `rule`.
  - Inputs en `card` con borde `rule`, y con borde `danger` si `aria-invalid`.
  - Botón principal en `accent`, con estado deshabilitado.
  - Post pendiente en `muted`. Errores en `danger`.
- [ ] **Commit:** `style: refine post detail, form and status messages`

### P7.4 Pulido responsive

- **Archivos:** `App.tsx`, `UserList.tsx`, `PostsPanel.tsx` y `PostList.tsx`.
- **Pasos:**
  - Repasar que todas las áreas táctiles midan `min-h-11`.
  - Partir las palabras largas (emails, títulos) con `overflow-wrap: anywhere` / `break-words`
    para que no haya scroll horizontal a 320px.
  - Márgenes laterales de móvil y estilo del botón «Back to users».
- **Verificación:** capturas a 320 y 375 px sin desbordamiento, y los tests siguen en verde.
- [ ] **Commit:** `style: polish mobile layout and touch targets`

### Cierre de P7

- [ ] **Commit:** `docs: log p7 prompt and ai decisions` (`docs/prompts.md` y `AI_LOG.md`)

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
  `pnpm exec playwright install chromium`. Cada test tiene un contexto nuevo, así que empieza
  con `localStorage` vacío.
- **`mockApi(page, options?)`:** primero registra una ruta que aborta cualquier petición que no
  vaya a `localhost`. Después registra las de `https://jsonplaceholder.typicode.com/**`, que
  sirven los datos de `src/test/fixtures.ts`, con opciones para forzar 500, red caída o retraso
  por endpoint. Devuelve un registro de las peticiones `POST`.
- **Textos:** los specs importan `messages` de `src/i18n/messages.ts` (igual que importan
  `fixtures.ts`) y nunca repiten un literal de la interfaz.
- **Flujos (`users.spec.ts`):**
  - `test('lists the users from the API')`: 4 usuarios.
  - `test('filters users by name ignoring case and spaces')`: `'  CLEM '` → 2 usuarios.
  - `test('shows a message when no user matches')`
  - `test('shows the selected user in the page title')`: `toHaveTitle(messages.app.title)` y,
    tras elegir a Leanne, `toHaveTitle(messages.app.pageTitle('Leanne Graham'))`.
- [ ] **Commit:** `test(e2e): add playwright with mocked api and user search flow`

### P8.2 Flujo de posts

- **Archivos:** `e2e/posts.spec.ts`.
- **Flujos:**
  - `test('shows the posts of the selected user after a loading status')`: con retraso en
    `GET /posts`, se ve `messages.posts.loading` y después los posts.
  - `test('publishes a post that shows as pending and then at the top of the list')`: con
    retraso en `POST`.
  - `test('publishes two posts in a row and shows both')`
  - `test('blocks empty or blank fields and sends no request')`: se ven los dos errores y hay 0
    `POST`.
- [ ] **Commit:** `test(e2e): add posts and new post flows`

### P8.3 Flujo de persistencia

- **Archivos:** `e2e/persistence.spec.ts`.
- **Flujos:**
  - `test('keeps a published post after reloading the page')`: se crea un post para Leanne, se
    recarga, se vuelve a elegir a Leanne y el post está arriba.
  - `test('ignores corrupt stored data')`: con `page.addInitScript` se mete basura en la clave
    de Leanne y la app carga sus posts de la API sin errores.
- [ ] **Commit:** `test(e2e): add created posts persistence flow`

### P8.4 Flujo de errores

- **Archivos:** `e2e/errors.spec.ts`.
- **Flujos:**
  - `test('recovers from a users error with Try again')`
  - `test('shows a posts error when the network fails')`
  - `test('removes the pending post and keeps the form values when publishing fails')`
- [ ] **Commit:** `test(e2e): add loading and error state flows`

### P8.5 Flujo móvil

- **Archivos:** `e2e/mobile.spec.ts`.
- **Flujos:**
  - `test('goes from the list to the posts and back on a 375px screen')`: viewport 375×812.
    - Al elegir un usuario, la lista se oculta (`toBeHidden`) y el foco está en el título del
      panel.
    - Tras «Back to users», el detalle se oculta, el foco está en el usuario y la búsqueda se
      conserva.
  - `test('has no horizontal scroll at 320px')`: viewport 320×640, en la vista de lista y en la
    de detalle, `scrollWidth <= clientWidth`.
  - `test('keeps touch targets at least 44px tall')`: los botones de usuario, «Back to users»,
    los inputs y «Publish post» tienen un `boundingBox().height >= 44`.
- [ ] **Commit:** `test(e2e): add small screen navigation flow`

**Verificación de la fase:** `pnpm test:e2e` en verde, `pnpm test` no recoge nada de `e2e/` y
Playwright no recoge nada de `src/`.

### Cierre de P8

- [ ] **Commit:** `docs: log p8 prompt and ai decisions` (`docs/prompts.md` y `AI_LOG.md`)

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
  - **Qué haría con más tiempo:** como mínimo:
    - La URL por usuario (router).
    - Sincronizar los posts entre pestañas (evento `storage`).
    - Limpiar el error de un campo al editarlo (ahora se recalcula en cada envío).
    - Otros idiomas: una librería de i18n y un selector de idioma sobre `messages` (cada idioma
      se declararía con `satisfies typeof messages`).
    - Ver un post que termina de publicarse después de volver a su usuario (límite de P6.9).
    - La cobertura de tests.
    - Lo que se anote en las fases.
  - **Cómo usé la IA:** qué pedí, qué acepté y qué corregí. Sale **solo** de `AI_LOG.md`.
- [ ] **Commit:** `docs: add readme`

### P9.2 Verificación final

- **Comandos** (todos en verde, con la salida copiada en el resumen): `pnpm lint`,
  `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` y `pnpm audit`.
- **Revisiones manuales:**
  - Navegación solo con teclado, con el foco visible y el foco del cambio de vista en móvil.
  - Lector de pantalla: los errores se anuncian y las cargas se anuncian como `status`.
  - `git log` muestra un commit por pieza.
  - No hay `.env` ni secretos.
- Si algo falla, se corrige en un commit `fix:` aparte, con su test.
- [ ] **Commit (cierre de P9):** `docs: log p9 prompt and ai decisions` (la entrada de P9 en
  `AI_LOG.md`, con la verificación final, y el prompt en `docs/prompts.md`)
