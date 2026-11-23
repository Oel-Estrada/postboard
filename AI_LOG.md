# AI_LOG

Registro de cómo se ha usado la IA (Claude Code) en cada fase. Es la única fuente de la sección
de IA del README.

Además de Claude Code, usé una segunda sesión de Claude como revisor: revisaba cada prompt antes de lanzarlo y cada salida antes de aprobar un commit. Algunas de mis correcciones salieron de esa revisión; la decisión final fue siempre mía.

## P1 — Reglas de trabajo

**Fecha:** 2026-11-23 09:53 (UTC+03:00)

**Qué pedí:** preparar las reglas de trabajo sin escribir código de la app: `git init`,
`CLAUDE.md` con el enunciado, los hechos comprobados de la API, el stack, las reglas de tests,
seguridad, código, idioma y forma de trabajar; `AI_LOG.md`, un `.gitignore` básico y
`docs/prompts.md` con el prompt literal. Sin usar skills de superpowers.

**Qué propuso la IA:**

- `CLAUDE.md` reorganizado por secciones, con el enunciado copiado literalmente y el resto
  redactado en español; los comandos en una tabla.
- Una regla añadida en "Forma de trabajar": guardar cada prompt de fase completo y literal en
  `docs/prompts.md`, para que no dependa de que se pida en cada prompt.
- `.gitignore` con lo exigido (`node_modules`, `dist`, `coverage`, `test-results`,
  `playwright-report`) más `.env*`, logs, `*.tsbuildinfo` y archivos de sistema/editor.
- `.gitattributes` con `* text=auto eol=lf`, porque Git en Windows avisaba de la conversión
  LF → CRLF.

**Qué acepté:** la estructura de `CLAUDE.md`, la regla de guardar los prompts en
`docs/prompts.md`, los extras del `.gitignore` y la propuesta de `.gitattributes` (finales de
línea LF).

**Qué corregí o rechacé (y por qué):** la rama `master` → `main` (es la convención actual y la
rama por defecto en GitHub).

## P2 — Plan

**Fecha:** 2026-11-23 10:17 (UTC+03:00)

**Qué pedí:** un plan en `docs/plan.md`, en español, dividido en las fases P3-P9, con las
piezas de cada fase (nombres en inglés), sus tests y su mensaje de commit, y los flujos E2E en
P8. Antes, una versión corta de `superpowers:brainstorming` (como mucho 5 preguntas) y la
dirección visual con `frontend-design`. Sin código, sin `docs/superpowers/` y sin commits sin
mi OK.

**Qué propuso la IA:**

- 4 preguntas, cada una con opciones y recomendación:
  - Carpetas: por tipo o por funcionalidad.
  - Pantalla: maestro-detalle o pantallas separadas.
  - Formulario: siempre visible o tras un botón «New post».
  - Dirección visual: «Fichero de oficina» o «Correspondencia».
- Una dirección visual sobria con tokens concretos. Gris frío de papel, tinta azul pizarra y un
  único acento azul tinta solo para la selección y el foco. Fuentes del sistema (serif para los
  títulos) para no tocar la red en los E2E ni añadir `@fontsource`. Un solo elemento
  memorable: el usuario seleccionado se une al panel de detalle como la pestaña de una carpeta.
- Decisiones propias, marcadas como tales en el plan:
  - Sin router.
  - El post nuevo va arriba.
  - Los posts creados se pierden al cambiar de usuario (irá en «qué haría con más tiempo»).
  - El mismo texto para el error de red y el HTTP.
  - «Try again» en los errores de carga.
  - Validación al enviar, recortando los valores.
- Un plan con los contratos compartidos (tipos y firmas), los textos fijos de la interfaz para
  que tests y E2E coincidan, y datos de prueba comunes a Vitest y Playwright. En total son 33
  piezas, con un commit cada una.
- 5 puntos de revisión que el enunciado no menciona, cada uno con su test:
  - Cambio rápido de usuario (respuestas obsoletas).
  - Dos posts con `id: 101`.
  - Doble clic en publicar.
  - Búsqueda con espacios o sin resultados.
  - Error solo en los posts.
- MSW con `onUnhandledRequest: 'error'` y `page.route` bloqueando todo lo externo, para
  garantizar que ningún test toca la red.
- Ignoró dos instrucciones por defecto de las skills, porque `CLAUDE.md` y el prompt mandan:
  - Guardar el diseño y el plan en `docs/superpowers/`.
  - Ofrecer la ejecución al terminar.

**Qué acepté:** las cuatro recomendaciones: carpetas por tipo, maestro-detalle, formulario
siempre visible y dirección «Fichero de oficina». El plan se guarda tal cual en el commit
`docs: add implementation plan`.

**Qué corregí o rechacé (y por qué):** las correcciones van en la entrada P2b (revisión del
plan).

## P2b - Revisión del plan

**Fecha:** 2026-11-23 10:31 (UTC+03:00)

**Qué pedí:** primero, el commit del plan tal como estaba. Después, revisar `docs/plan.md` y
`CLAUDE.md` con cinco cambios:

- **a)** Persistencia de los posts creados en `localStorage`:
  - Por usuario y con una clave versionada.
  - Se guarda solo si el POST va bien.
  - Lectura defensiva con `try/catch`, `JSON.parse` protegido y un type guard.
  - Siempre como texto.
  - Funciones puras y un hook, con sus tests, y un E2E de recarga.
- **b)** Responsive mobile-first:
  - En móvil, de la lista al detalle, con «Back to users» y el foco al título del panel.
  - Áreas táctiles de 44px y sin scroll horizontal a 320px.
  - En la fase del layout, con test; un E2E a 375px.
- **c)** React 19 en el formulario: `<form action>` + `useActionState` (con
  `{ errors, submitted }` y `defaultValue`), `useFormStatus` en un `SubmitButton` y
  `useOptimistic`. Sin `useTransition`, `useDeferredValue` ni `use()` + Suspense. Que la IA
  proponga otros usos de React 19 que aporten de verdad.
- **d)** Consultar `modern-web-guidance` (con `pnpx`) en P5-P7 y añadir a `CLAUDE.md` una
  política de navegadores basada en Baseline.
- **e)** Añadir a `CLAUDE.md` las reglas de React 19, de `localStorage` y de mobile-first.

**Qué propuso la IA:**

- Comprobó en Context7 (react.dev) el patrón `defaultValue` + reset automático de
  `useActionState`, `useFormStatus` en un hijo del formulario, y que `useOptimistic` se puede
  llamar dentro de una action y vuelve al valor real si falla.
- **Persistencia:**
  - Una clave por usuario (`postboard:created-posts:v1:{userId}`), para que los datos corruptos
    de uno no afecten a los demás.
  - Funciones puras que reciben el `Storage` (`readCreatedPosts`, `writeCreatedPosts`,
    `isPostEntry`), más `getBrowserStorage`, porque solo acceder a `localStorage` ya puede
    lanzar.
  - Si una lista tiene entradas válidas e inválidas, se quedan las válidas.
  - El hook `useCreatedPosts` sigue funcionando en memoria si la escritura falla.
- **Formulario:**
  - Quitar el hook `useCreatePost`: las actions ya resuelven el estado pendiente y el error.
    Además, el POST no debe cancelarse al cambiar de usuario, porque su resultado sigue siendo
    válido para su usuario.
  - El post optimista y el guardado comparten `key` para que React no vuelva a montar el
    elemento.
  - El estado de la action incluye `published` (para anunciar `Post published.`) y el error del
    POST como `errors.form`.
  - El error de un campo ya no se borra al editarlo; se recalcula en cada envío, como es
    habitual con las actions.
  - Para el doble clic, confiar en `useFormStatus`. Si el test muestra que el segundo envío se
    encola, añadir un guard en `onSubmit`.
- **Responsive:**
  - Separar `selectedUser` de `mobileView`, para que «Back to users» conserve la selección y
    devuelva el foco al usuario.
  - Mover el foco solo en móvil, con un helper `isNarrowViewport` basado en `matchMedia`.
  - Ocultar las vistas en jsdom no se puede comprobar, porque no hay CSS real. Lo comprueba el
    E2E.
- **React 19 donde aporta:** el ref como prop (`headingRef` en `PostsPanel`, sin
  `forwardRef`) para mover el foco. Propuso además, sin meterlo en el plan, usar `<title>`
  dentro de los componentes para que la pestaña muestre el usuario seleccionado.
- **Políticas en `CLAUDE.md`:**
  - La política de navegadores, tal como se pidió.
  - La consulta de `modern-web-guidance` en las fases de UI.
  - Una regla extra: mover el foco de forma explícita cuando un cambio de vista oculta lo que lo
    tenía.
- **El plan queda en 37 piezas (antes 33):**
  - P5: +1 (`isNarrowViewport`). El layout móvil pasa de P7 a P5.
  - P6: +2 (`createdPostsStorage`, `useCreatedPosts` y `SubmitButton` entran; `useCreatePost`
    sale).
  - P8: +1 (persistencia).
  - P7 sigue con 4: «Back to users» se sustituye por un pulido responsive.

**Qué acepté** (ajustes de las 10:49):

- La clave de `localStorage` por usuario.
- Que el POST no se cancele al cambiar de usuario.
- Quitar `useCreatePost`.
- Que los errores se recalculen en cada envío. Limpiar el error del campo al editarlo queda
  anotado en «qué haría con más tiempo».
- Que el test decida cómo se resuelve el doble clic.
- `headingRef` como prop.
- La regla de foco añadida a `CLAUDE.md`.

**Qué corregí o rechacé (y por qué):** la revisión entera corrige el plan de P2:

- La persistencia en `localStorage` sustituye a «los posts creados se pierden al cambiar de
  usuario».
- El layout pasa a ser mobile-first, en la fase del layout y no solo en P7.
- El formulario pasa a usar las actions de React 19.
- Se añaden la consulta de `modern-web-guidance` y las nuevas reglas de `CLAUDE.md`.

Sobre la propuesta de la IA corregí cuatro cosas más:

1. **Linter.** El plan daba por hecho `eslint.config.js`, pero la plantilla actual de Vite trae
   Oxlint. Se usa el linter de la plantilla (con Oxlint, `.oxlintrc.json`, sin añadir ESLint),
   con reglas de React hooks, TypeScript y `jsx-a11y`.
2. **Cambio de usuario con un POST pendiente.** Faltaba ese caso. Se añade en P6.9 el test
   «stores the post for the original user when switching users while publishing».
   - Para que pase, la IA ajustó P6.4 y P6.8: `saveCreatedPost` escribe con el `userId`
     capturado al enviar (`entry.userId`), fuera de cualquier updater de `setState`. Si el
     componente se ha desmontado, React no ejecuta los updaters y el post se perdería.
   - Se añade un test del hook para la escritura tras desmontar.
   - Queda como límite conocido volver al usuario *antes* de que responda el POST.
3. **`<title>` por usuario.** Acepté la propuesta: `Postboard` o `{name} · Postboard`, con el
   `<title>` de React 19. Va en una pieza nueva, P5.11, con su test unitario y un E2E. Si el
   `<title>` de `index.html` tuviera prioridad, se quitaría de allí.
4. **Corte de 48rem.** Sale de una constante compartida (`MD_BREAKPOINT_REM` en
   `src/lib/breakpoints.ts`), con un comentario que dice que coincide con `md` de Tailwind.

Con el `<title>`, el plan queda en **38 piezas** (P5 pasa a 11).

## P3 — Scaffold y librerías

**Fecha:** 2026-11-23 10:57 (UTC+03:00)

**Duración:** 10:57–12:09 (≈72 min)

**Qué pedí:** ejecutar solo la fase P3 del plan con `superpowers:executing-plans`, en la misma
sesión y sin subagentes:

- Antes del scaffold, `pnpm-workspace.yaml` con `minimumReleaseAge: 1440`.
- El scaffold en una subcarpeta temporal (`_scaffold`), sin vaciar la raíz ni sobrescribir lo
  que ya existía, juntando los `.gitignore` y limpiando la plantilla.
- `packageManager` fijado antes de instalar, y parar si algún paquete pide scripts de
  instalación.
- El linter de la plantilla (Oxlint) con reglas de React hooks, TypeScript y `jsx-a11y`, sin
  dependencias nuevas.
- Tailwind v4, Vitest + Testing Library + jsdom + MSW, un setup de tests, Vitest sin `e2e/` y un
  test trivial.

Durante la fase cambié el planteamiento con varios mensajes (todos literales en
`docs/prompts.md`): commits atómicos, textos de la interfaz centralizados, `@testing-library/dom`
explícito y una pirámide de tests.

**Qué propuso la IA:**

- Un primer reparto en 2 commits: el scaffold con Tailwind, Oxlint y el prompt de la fase, y
  después el tooling de tests. `App` quedaba sin test hasta el segundo commit.
- Comprobó en Context7 la sintaxis de pnpm (`minimumReleaseAge` y `allowBuilds`), los plugins
  de Oxlint, Tailwind v4 con `@tailwindcss/vite`, la configuración de Vitest y la API de MSW.
- `packageManager: pnpm@10.29.3`. Ninguna dependencia pidió scripts de instalación, así que
  `allowBuilds` no se ha añadido.
- `"strict": true` explícito en los dos `tsconfig` (la plantilla no lo pone).
- Oxlint con el plugin `jsx-a11y`, `react/exhaustive-deps` y la categoría `correctness` como
  error, comprobado con un archivo con errores a propósito que después se borró.
- `defineConfig` de `vitest/config` en `vite.config.ts`, porque Oxlint rechaza la referencia
  triple-slash (`/// <reference types="vitest/config" />`) que da la documentación.
- `cleanup()` de Testing Library en `setup.ts`, porque con los globals de Vitest apagados no se
  registra solo.
- En el test de MSW, comprobar además el evento `request:unhandled`: sin eso, un fallo de la red
  real también haría pasar el test.
- MSW 3 renombró `onUnhandledRequest` a `onUnhandledFrame`. Propuso usar la v3 con
  `onUnhandledFrame: 'error'` en vez de fijar la 2.x.
- Para la pirámide, recortar el plan de unos 129 tests a 50, y juntar `UserSearch` con
  `UsersPanel` y `SubmitButton` con `PostForm` si había que bajar más.

**Qué acepté:**

- Comprobar el evento `request:unhandled` en el test de MSW.
- `onUnhandledFrame` de MSW 3 en vez de fijar la 2.x (y su commit de docs para el plan).
- `defineConfig` de `vitest/config`.
- `cleanup()` en `setup.ts`.
- `"strict": true` explícito.
- Probar Oxlint con un archivo con errores a propósito.

**Qué corregí o rechacé (y por qué):**

1. **Commits atómicos.** Rechacé el primer commit: mezclaba el scaffold, Tailwind y el prompt,
   y dejaba `App` sin test. Cada commit hace una sola cosa, pasa test, typecheck, lint y build
   por sí solo y lleva su test; el prompt y el AI_LOG de cada fase van en su propio commit de
   docs al cerrarla.
2. **Textos de la interfaz en `src/i18n/messages.ts`**, sin `as const`, con funciones para los
   textos con datos, y los tests importándolos en vez de repetir literales. Sin librería de
   i18n.
3. **`@testing-library/dom` explícito** en `devDependencies`: Testing Library 16 lo declara como
   `peerDependency` y solo funcionaba porque pnpm instala los peers automáticamente.
4. **La pirámide de tests** (unitarios, integración y E2E), de unos 129 tests a 51, con dos
   ajustes míos: recuperar la marcha atrás del post optimista en `PostsPanel` y hacer el E2E
   móvil a 320px comprobando que no hay scroll horizontal. Rechacé juntar componentes para
   ahorrar tests: cada componente se queda con su test.
5. **Orden de los commits.** Acepté el orden docs → P3.2 cuando la IA no siguió el que le pedí
   (el commit de P3.2 antes que el de la pirámide).

## P4 — Capa de API

**Fecha:** 2026-11-23 12:12 (UTC+03:00)

**Duración:** 12:12–13:27 (≈75 min)

**Qué pedí:** ejecutar solo la fase P4 del plan (P4.1 a P4.4 y su cierre) con
`superpowers:executing-plans`, en la misma sesión y sin subagentes, y con
`superpowers:test-driven-development`:

- Por cada pieza, primero el test en rojo sin tocar la red real, después el código mínimo y el
  refactor, y un commit por pieza solo con sus archivos.
- Los tests del plan: `request` cubre una vez el éxito, el error HTTP, el error de red y la
  cancelación; `getUsers`, `getPostsByUser` y `createPost` solo su ruta, su método y su cuerpo.
- Antes de escribir código, consultar en Context7 la API de MSW 3 (`http`, `HttpResponse`,
  `delay` y cómo leer el método, la query y el cuerpo en un handler).
- Parar y explicarlo si el test de cancelación fallaba por el entorno (jsdom y el `fetch` de
  Node) y no por el código.

Durante la fase cambié el planteamiento con varios mensajes (todos literales en
`docs/prompts.md`): validar con zod, la API clásica de zod y que cada tipo entre con su primer
uso.

**Qué propuso la IA:**

- De Context7 y de los tipos instalados de MSW 3.0.7: `http`, `HttpResponse` y `delay` se
  importan de `msw`; el resolver recibe `{ request, params, cookies }`; la query se lee con
  `new URL(request.url).searchParams` (MSW la ignora al buscar el handler) y el cuerpo con
  `request.json()`.
- `request` con `HttpError` (con `status`) para `res.ok === false`, dejando pasar sin envolver
  los errores de red y el `AbortError`. El test de cancelación pasó con jsdom y el `fetch` de
  Node, así que no hubo que tocar la configuración.
- **Mutaciones en cada pieza:** como el rojo de cada pieza era «falta el módulo», romper el
  código a propósito (sin comprobar `res.ok`, sin pasar la señal, otro método, otra ruta, sin
  cabecera, otro cuerpo, un esquema equivocado) y comprobar que falla solo el test que toca.
- **Una mutación sobrevive en P4.3:** un `userId=1` escrito a mano en `getPostsByUser` pasa el
  test, porque con un solo caso no se distingue. No se añadió un segundo caso (sería una
  variación del mismo test): lo cubre en P6.2 el test de `useUserPosts` «aborts the previous
  request when userId changes», que pide los usuarios 1 y 2 y exige que `data` sea solo de
  Ervin.
- **Probar los handlers compartidos:** los tests de P4.2–P4.4 usan los handlers por defecto de
  `handlers.ts` y capturan la petición con el evento `request:start`, en vez de repetir los
  handlers en cada test.
- **Refactor de `recordRequests()`** en `posts.test.ts`, cuando la captura se repitió en el
  segundo test, con un solo `afterEach` que quita el listener.
- Los datos de prueba son los registros reales de JSONPlaceholder (usuarios 1, 2, 3 y 10, y
  posts 1, 2 y 11), descargados una vez con `curl`; los tests no tocan la red.
- Con zod: de Context7, la versión 4.6.7 (`latest` en npm y con más de 24 h, así que cumple
  `minimumReleaseAge`) y su API (`z.object`, `z.array`, `.trim().min(1, mensaje)`,
  `parse`/`safeParse`, `z.flattenError` y `z.infer`). Propuso `src/schemas.ts` para todos los
  esquemas, cada uno junto a su tipo, y `src/types.ts` solo para los tipos internos.
- Medir el bundle con zod: en los commits de P4 no crece, porque la app aún no importa la capa
  de API y Vite deja zod fuera. Importando `getUsers` de forma temporal en `main.tsx`:
  - API clásica: 303,88 kB (92,42 kB gzip), **+23,8 kB gzip** (+35 %).
  - `zod/mini`: 234,21 kB (73,42 kB gzip), **+4,8 kB gzip** (+7 %).

  Recomendó `zod/mini`.
- Verificación final: los cuatro comandos en HEAD (5 archivos y 10 tests) y también en cada
  commit de código de la fase por separado, en un worktree temporal.

**Qué acepté:**

- Las mutaciones en cada pieza, incluida la que sobrevive en P4.3 y que cubrirá P6.2.
- Probar los handlers compartidos con `request:start` y `request.clone()`.
- El refactor de `recordRequests()`.

**Qué corregí o rechacé (y por qué):**

1. **Validar con zod todo lo que entra de fuera** (API, formulario y `localStorage`), con los
   tipos inferidos de los esquemas, para que el tipo y la validación no puedan desincronizarse y
   las tres fronteras se validen igual. `res.json() as T` confiaba a ciegas en la API. Fue en su
   propio commit de docs (`docs: validate external data with zod`), con P4.2 guardado en un
   stash mientras tanto. Se añadió un solo test, en `getUsers`, para la forma inesperada.
2. **La API clásica de zod en vez de `zod/mini`**, a pesar de la medición (+23,8 kB frente a
   +4,8 kB gzip): es la que conoce cualquier equipo y se lee mejor, y +24 kB gzip es aceptable
   aquí. `zod/mini` irá en «qué haría con más tiempo».
3. **Cada tipo y cada esquema entran en la pieza de su primer uso.** Si eso se aparta del plan,
   se anota aquí como desviación, sin preguntar.
4. **Al capturar las peticiones:** leer el cuerpo de `request.clone()` para no consumirlo antes
   que el handler, y quitar los listeners después de cada test, como en `server.test.ts`.

**Desviaciones del plan:**

- `AsyncState` no entra en P4.2: pasa a P5.2 (`useUsers`), su primer uso.
- `PostEntry` (y `postEntrySchema`) no entra en P4.3: pasa a P6.2 (`useUserPosts`), su primer uso.

**Incidente:** al restaurar una mutación de P4.4, el modo automático de permisos bloqueó un
`git checkout src/test/handlers.ts` que habría borrado el handler `POST /posts`, todavía sin
commitear. Se restauró desde copias y no se perdió nada.

## P5 — Usuarios, búsqueda y layout

**Fecha:** 2026-11-23 13:28 (UTC+03:00)

**Duración:** 13:28–15:46 (≈138 min)

**Qué pedí:** ejecutar solo la fase P5 del plan (P5.1 a P5.11 y su cierre) con
`superpowers:executing-plans`, en la misma sesión y sin subagentes, y con
`superpowers:test-driven-development`:

- Por cada pieza, el test en rojo sin tocar la red real, el código mínimo y el refactor, y un
  commit por pieza solo con sus archivos. Si el rojo era solo «falta el módulo», comprobar con
  mutaciones que cada test falla por su motivo, restaurando siempre desde copias.
- Los tests del plan (pirámide; nada nuevo sin decírmelo) y los textos solo desde
  `src/i18n/messages.ts`. `AsyncState` entra en `src/types.ts` en P5.2.
- Antes de la UI, consultar modern-web-guidance con las búsquedas del plan y aplicar la
  política de navegadores. Consultar en Context7 `renderHook`, la opción `{ once: true }` de MSW
  3 y el `<title>` de React 19.

Durante la fase fui ajustando con varios mensajes (todos literales en `docs/prompts.md`): el
test de StrictMode, la compuerta en vez del reloj, la regla de los textos con datos, el
`asyncUtilTimeout`, los commits sin esperar cuando todo pasa y la revisión del layout en el
navegador.

**Qué propuso la IA:**

- **Context7:**
  - `renderHook` devuelve `result.current`, `rerender` y `unmount`, y acepta
    `{ reactStrictMode: true }`.
  - En MSW 3, un handler de un solo uso se declara con `{ once: true }` como tercer argumento.
    Se confirmó también en los tipos instalados (`RequestHandlerOptions.once`).
  - El `<title>` de React 19 se sube a `<head>` desde cualquier componente, necesita un solo
    string como hijo (template literal) y no hay que pintar dos a la vez.
- **Mutaciones en cada pieza**, como en P4. Las que sobrevivían se anotaron y, si no estaban
  previstas por el plan, se pararon para preguntar:
  - P5.2: ignorar el resultado de una petición abortada → test de StrictMode (ver abajo).
  - P5.4: quitar `toUpperCase()` → aserción `'ervin howell'` → `'EH'`.
  - P5.5 y P5.8: el clic y la selección (`onClick`, `onSelectUser`, `selectedUserId`)
    sobrevivían, como prevé el plan; desde P5.10 los detecta la integración de `App`.
  - P5.8: la rama de error de `UsersPanel` sobrevive; se queda para el E2E de errores de P8.3.
  - P5.8: con `'zzz'` sobrevivía no recortar la búsqueda en el mensaje; el test escribe
    `'  zzz '` y espera `noUsersMatch('zzz')`.
  - P5.9: el fallback sin `matchMedia` sobrevivía hasta P5.11.
  - P5.10: dar el foco al `h2` también en escritorio sobrevivía hasta P5.11.
- **Test añadido a propuesta de la IA (P5.2):** «does not flash an error when StrictMode
  aborts the first request». La app arranca en `StrictMode`, que monta el efecto dos veces; sin
  comprobar la señal abortada, se ve un instante «Couldn't load users.» al cargar en
  desarrollo.
  - **Con el handler por defecto el test pasaba también con la mutación.** La primera petición
    se aborta antes de llegar a MSW y rechaza enseguida, la segunda responde casi a la vez, y
    React junta `error` y `success` en un solo render.
  - La IA propuso un `delay(100)` en el handler. Funcionaba, pero dependía del reloj.
- **Diagnóstico del fallo intermitente** (ver «Incidentes»).
- **Comprobar el `<title>` en el navegador** (servidor de desarrollo y Chrome): React inserta su
  `<title>` delante del de `index.html` (`insertBefore(…, 'head > title')` en `react-dom`), así
  que `document.title` es `Ervin Howell · Postboard`. El `<title>` de `index.html` se queda,
  como dice el plan.
- **Verificación de la fase:** los cuatro comandos en HEAD y en cada commit de la fase por
  separado, en un worktree temporal.

**Qué acepté:**

- El test de StrictMode, como comportamiento distinto y real (54 tests en la pirámide, con el de
  `messages`).
- Las mutaciones y los ajustes que las cubren: `'ervin howell'` y `'  zzz '`.
- Las dos excepciones de Oxlint, cada una con su comentario:
  - `jsx-a11y/no-redundant-roles` en `<ul role="list">` (`UserList`): Tailwind quita las
    viñetas y Safari deja entonces de anunciar el `<ul>` como lista.
  - `jsx-a11y/prefer-tag-over-role` en `<p role="status">` (`LoadingMessage`): Oxlint propone
    `<output>`, que es para el resultado de un cálculo o de una acción, y no todos los lectores
    de pantalla anuncian su región viva implícita.
- Dejar la prueba de la rama de error de `UsersPanel` para el E2E de P8.3, como dice el plan.

**Qué corregí o rechacé (y por qué):**

1. **El test de StrictMode sin depender del reloj.** En vez de `delay(100)`, el handler marca
   que ha llegado la segunda petición y espera a una promesa que suelta el test
   (`reached` + `gate`). Así el orden lo fija el test. Con la mutación falla 3 de 3 veces y sin
   ella pasa 3 de 3; se quedó esta versión.
2. **Los textos con datos se prueban contra literales.** Al añadir `usernameHandle` con perl,
   el texto quedó como `` `@` `` sin el nombre y el test de `UserList` seguía en verde, porque
   compara contra la misma función rota de `messages`. Se cambió la regla en CLAUDE.md y en el
   plan (commit `docs: test interpolated ui texts with literals`): las funciones de `messages`
   que interpolan datos se prueban en `src/i18n/messages.test.ts` comparando con literales, un
   test con una aserción por función, y cada pieza añade la suya (`usernameHandle`,
   `noUsersMatch` y `pageTitle` en esta fase). Se comprobó que falla con la versión rota.
3. **El fallo intermitente se arregla buscando la causa, no subiendo el tiempo a ciegas.** Antes
   del commit del `asyncUtilTimeout`, 10 ejecuciones seguidas de la suite completa en verde, con
   la condición de parar si alguna fallaba.
4. **Dos comprobaciones más en el test del `<title>`** (sin crear un test nuevo): el test corre
   sin simular `matchMedia` (escritorio), así que, tras elegir a Ervin, el foco sigue en su botón
   de la lista. Cubre la mutación de P5.10 que daba el foco al `h2` también en escritorio y hace
   pasar el test por el fallback de `isNarrowViewport`.
5. **Revisé el layout en el navegador** (escritorio y móvil) antes de aprobar P5.10. El diseño
   se cuida en P7.

**Guías de modern-web-guidance:** se hicieron las seis búsquedas del plan («accessible search
input», «loading status live region», «error alert message», «responsive two column layout»,
«focus management view change» y «touch target size») y una más («media query range syntax»).
Se leyeron `accessibility`, `forms`, `css-layout`, `css`, `responsive-design` y
`form-factor-adaptation`. Influyeron así:

- **`forms`:** el buscador va dentro de `<search>` (Baseline «Widely available») y el input
  lleva `autoCorrect="off"`, `autoCapitalize="none"` y `spellCheck={false}`, porque los nombres
  no son prosa.
- **`accessibility`:**
  - `role="list"` en el `<ul>` de `UserList` (el caso de Safari con `list-style: none`).
  - `<header>` y `<main>` como landmarks en `App`.
  - El `h2` del detalle con `tabIndex={-1}` para recibir el foco.
  - El título de la página con el dato propio delante (`{name} · Postboard`) y actualizado al
    cambiar de vista.
  - «No users match "…"» en un `<p aria-live="polite">` que se pinta siempre con la lista, para
    que se anuncie (los resultados de una búsqueda son un aviso «polite»).
- **Conflicto con CLAUDE.md:** la guía desaconseja usar regiones vivas para estados como
  «Loading…». Manda CLAUDE.md, así que `LoadingMessage` sigue con `role="status"`.
- **`form-factor-adaptation`:** áreas táctiles de 44px (`min-h-11`) en los botones y el
  buscador, como ya decía el plan.
- **Sintaxis de rangos** (`(width < 48rem)`): ninguna guía la trata. Es Baseline «Widely
  available» y Tailwind v4 genera la misma, así que se usa sin fallback.

**Desviaciones del plan:**

- P5.2 tiene 4 tests (el de StrictMode); la pirámide pasa a 54 con el de `messages`.
- P5.4: una aserción más (`'ervin howell'` → `'EH'`).
- P5.5 añade `src/i18n/messages.test.ts`, y P5.8 y P5.11 añaden su aserción.
- P5.8: el test escribe `'  zzz '` en vez de `'zzz'`.
- P5.11: el test del `<title>` comprueba también el foco en escritorio.
- Un commit que no estaba en el plan: `test: allow slower first requests in async utils`.

**Incidentes:**

- **Fallo intermitente:** «returns the users after a loading state» (P5.2) falló 2 de 9 veces
  con la suite completa y nunca aislado.
  - **Causa:** es la primera petición de cada worker y llega en frío (interceptor de MSW,
    `fetch` y el primer `parse` de zod), con 12 workers en paralelo. Tardaba 1,3–2,2 s frente al
    límite de 1000 ms de `waitFor`, y el estado seguía en `loading`.
  - **Arreglo:** `configure({ asyncUtilTimeout: 5000 })` en `src/test/setup.ts`, con un
    comentario. Solo cambia cuánto esperan `waitFor`/`findBy`, no lo que comprueban. Después,
    10 de 10 ejecuciones en verde, con el primer test tardando entre 776 y 1641 ms.
- **Mutaciones mal aplicadas:**
  - Una sustitución de perl cambió solo el JSDoc (la primera aparición) en vez del JSX
    (`LoadingMessage`).
  - Otra no se aplicó y el aviso no saltó, porque iba detrás de un `| head` (`UsersPanel`).
  - Ambas se repitieron bien. Desde entonces, el helper enseña la línea mutada y avisa si el
    archivo no cambia.
- **La mutación del fallback de `isNarrowViewport`** pasaba la línea `Tests`, pero
  `pnpm test` salía con código 1: Vitest detecta el `TypeError` no capturado del manejador del
  clic. El helper miraba solo la línea `Tests`; en P5.11 se comprobó también el código de
  salida de la suite completa, y así hay que hacerlo en las fases siguientes.
- **La verificación commit a commit falló la segunda vez:** la primera ejecución borró el
  worktree pero dejó su carpeta con `node_modules`, y en la segunda `git worktree add` falló y
  el script siguió fuera del repositorio (todo «FAIL»). La IA llegó a anotar el éxito en su
  registro antes de leer el resultado y lo retiró al verlo. Se rehízo el script con una ruta
  nueva, abortando si falla la preparación y borrando la carpeta al acabar. Los 13 commits de
  la fase pasan los cuatro comandos por separado. El repositorio principal no se tocó.

**Menores que quedan anotados** (de la revisión final; no se arreglan en esta fase):

- **Dos `<title>` en `<head>`:** el de React, que gana porque va delante, y el estático de
  `index.html`, que se queda porque se ve antes de que cargue el JS (como dice el plan).
- **«Back to users» puede perder el foco:** si el usuario elegido ya no está en la lista
  filtrada (se elige en escritorio, se filtra y se estrecha la ventana), el foco cae en `body`.
  Va a «qué haría con más tiempo».

## P6 — Posts, formulario y persistencia

**Fecha:** 2026-11-23 15:50 (UTC+03:00)

**Duración:** 15:50–18:32 (≈162 min)

**Qué pedí:** ejecutar solo la fase P6 del plan (P6.1 a P6.9 y su cierre) con
`superpowers:executing-plans`, en la misma sesión y sin subagentes, y con
`superpowers:test-driven-development`:

- Por cada pieza, el test en rojo sin tocar la red real, el código mínimo, el refactor y un
  commit solo con sus archivos. Si el rojo era solo «falta el módulo», mutaciones juzgadas por
  el código de salida de `pnpm test`, no solo por la línea `Tests`, restaurando siempre desde
  copias.
- Solo los tests del plan, y los textos solo desde `messages`, con la aserción literal de
  `postsCount` en `messages.test.ts`. `PostEntry` y `postEntrySchema` entran en P6.2.
- El test de cambio de usuario de `useUserPosts` tiene que detectar la mutación de P4.3
  (`userId` escrito a mano en `getPostsByUser`). «Publishing…» se busca siempre acotado.
- Antes del formulario, consultar modern-web-guidance y Context7 (`useActionState`,
  `useFormStatus` y `useOptimistic`).
- Paradas: las piezas unitarias se commitean sin esperar si las cuatro puertas pasan y las
  mutaciones mueren; si no, parar. Parar siempre antes de P6.6, P6.8 y P6.9 (con `pnpm dev`).

Durante la fase fui ajustando con varios mensajes (todos literales en `docs/prompts.md`): los
tests ampliados de P6.2 y P6.4, el `testTimeout` y la medición en frío, el doble clic, las
regiones `status` acotadas, la causa del bug de P6.8 y el foco con `useLayoutEffect`.

**Qué propuso la IA:**

- **Mutaciones en cada pieza.** Las que sobrevivían pararon el trabajo con una propuesta ya
  comprobada (aserciones nuevas dentro de los tests del plan, sin tests nuevos):
  - **P6.2 `useUserPosts`:** quitar la comprobación de `signal.aborted` en la rama de error
    sobrevivía: al cambiar de usuario se veía un instante «error». El test de cambio de usuario
    retiene también la respuesta de Ervin (dos compuertas, como en P5.2), guarda cada estado y
    comprueba que nunca pasa por `error`. Muere 3 de 3. La mutación de P4.3 ya moría: el test
    se queda esperando los posts de Ervin.
  - **P6.4 `useCreatedPosts`:** escribir en el storage *dentro* del updater de
    `setCreatedPosts` sobrevivía. El test publica **dos** posts tras desmontar (ver «eager
    state» en «Desviaciones»). Muere 3 de 3.
  - **P6.8 `PostsPanel`:** una `key` nueva al guardar sobrevivía; se cubrió primero con un
    `MutationObserver` y después con la aserción del mismo nodo (ver abajo).
- **Medición del arranque en frío** (a petición mía, unos 3 minutos y sin tocar el repo): por
  qué la primera petición de cada archivo tardaba 1–2,5 s.

  | | Aislado (3 veces) | En la suite completa (3 veces) |
  | --- | --- | --- |
  | Primer fetch con MSW | 49–80 ms (el segundo, 10–13) | 87–709 ms (el segundo, 14–98) |
  | Primer parse de zod | 2,9–4,3 ms (el segundo, 0,1) | 5,6–27,5 ms |
  | Primer render en jsdom (síncrono) | 31–59 ms (el segundo, 3–4) | 50–343 ms |
  | Del render a ver los usuarios | 130–172 ms | 216–716 ms |

  Ninguna pieza lo explica sola y zod no influye: aislado, todo suma menos de 0,2 s. En la suite
  completa todo va entre 2 y 14 veces más lento, porque 18 archivos, cada uno con su worker y su
  jsdom, compiten por la CPU («setup» y «environment» son el 70–80 % del tiempo total).
- **`testTimeout: 15000`** (commit propio): en P5 subimos `asyncUtilTimeout` a 5000 ms, pero el
  límite de cada test también era 5000 ms, así que un `findBy` podía gastarse todo el tiempo
  del test. Con la máquina cargada, el test de móvil de `App` falló 4 de 6 veces.
- **Diagnósticos con tests temporales** (borrados después) para encontrar la causa de cada
  fallo antes de tocar nada: el «FirstSecond» de P6.8, el foco de P6.6 y la sonda en frío.
- **Verificación de la fase:** los cuatro comandos en `HEAD` y en cada commit de la fase por
  separado, en un worktree temporal que se borró al acabar.

**Qué acepté:**

- Las aserciones nuevas de P6.2, P6.4, P6.6 y P6.8, siempre dentro de los tests del plan.
- `testTimeout: 15000`, tras 10 ejecuciones seguidas de la suite completa en verde.
- En P6.6, el foco al primer campo con error tras un envío no válido (lo recomienda la guía
  `forms`), comprobado dentro del primer test.
- En P6.8: el `user.clear()` del helper, el `MutationObserver`, la aserción del mismo nodo, y
  las del `h2`, el email, la empresa y que no salga «This user has no posts yet.» mientras carga.
- Que el hook `useUserPosts` no vuelva a `loading` al cambiar `userId` (ver «Desviaciones»).
- Los dos comentarios que desactivan reglas de Oxlint en una línea, como en P5:
  `prefer-tag-over-role` en el `<p role="status">` de `PostForm` y `no-redundant-roles` en el
  `<ul role="list">` de `PostList`.

**Qué corregí o rechacé (y por qué):**

1. **Arreglar la causa del bug de P6.8, no el síntoma.**
   - **Qué pasaba:** el post recién publicado salía dos veces con la misma `key` (el pendiente y
     el ya guardado), React reconciliaba mal el DOM y el test de los dos posts con `id: 101` lo
     detectó.
   - **Causa:** `saveCreatedPost` actualizaba el estado después del `await`, y React no marca
     como Transition las actualizaciones que van después de un `await` dentro de una action
     (documentación de React, `useTransition` → «React doesn't treat my state update after
     await as a Transition»; lo confirmé en Context7). El post guardado se pintaba mientras
     `useOptimistic` aún mostraba el pendiente.
   - **La IA propuso** filtrar en el reducer de `useOptimistic` la entrada con la misma `key`.
     Funcionaba, pero tapaba el síntoma.
   - **Arreglo:** `startTransition(() => saveCreatedPost(...))` en `PostsPanel`, con
     `startTransition` importado de `react` y un comentario. Así el post guardado y la retirada
     del optimista llegan en el mismo render.
   - **El filtro se quitó:** con `startTransition`, el `MutationObserver` ve como mucho un
     «Hello» (5 de 5) y la mutación «sin startTransition» muere 3 de 3.
2. **La aserción del mismo nodo.** Con `startTransition`, una `key` nueva al guardar ya no se
   ve duplicada: solo hace que React sustituya el `article` en vez de actualizarlo. El test 1
   comprueba que el `article` pendiente es el mismo nodo que queda publicado (el `aria-busy` se
   apaga en el mismo elemento). Muere 3 de 3.
3. **El test del doble clic del plan habría pasado siempre.** Usaba una promesa que nunca
   resuelve, pero `useActionState` encola las acciones: un segundo envío solo se ejecutaría al
   terminar el primero, y con esa promesa no se vería nunca. El test suelta la promesa tras el
   doble clic, espera «Post published.» y comprueba una sola llamada. Resultado: el segundo
   clic no llega a encolarse porque `useFormStatus` desactiva el botón a tiempo, así que no hizo
   falta la guarda en `onSubmit`. Con el botón que nunca se desactiva, `onPublish` se llama dos
   veces y el test falla.
4. **El fallo intermitente del foco** (commit `fix: move focus to the first invalid field with
   the errors`).
   - **Qué pasaba:** en la verificación final, «shows accessible errors…» falló 1 de 10 veces en
     `HEAD`: el foco estaba en `body`, no en el título.
   - **Causa:** el foco se movía en un `useEffect`, y React puede ejecutar los efectos pasivos
     después del commit que pinta las alertas. Mientras tanto el foco estaba en `body`, porque
     el botón se había desactivado durante la action. Un test temporal con un
     `MutationObserver` lo demostró: con `useEffect`, cuando aparecían las alertas el foco
     estaba en `body` o en el botón (3 de 3); con `useLayoutEffect`, en el título (3 de 3).
   - **Por qué `useLayoutEffect` y no `waitFor`:** esperar al foco en el test habría arreglado
     el síntoma y dejado ese instante con el foco perdido, también para un lector de pantalla.
     Un efecto de layout se ejecuta dentro del mismo commit que inserta las alertas, así que
     nadie puede verlas sin que el foco ya esté en el campo.
   - Después, 10 ejecuciones seguidas de la suite completa en verde y la mutación del foco
     sigue muriendo.
5. **Las dos regiones `role="status"`** (la del formulario, siempre presente, y la de «Loading
   posts…») se buscan acotadas: por su texto o con `within`, nunca con `getByRole('status')`
   global.

**Context7 (React):**

- **`useActionState`:** cuando la action termina sin lanzar, React vacía los campos no
  controlados. Con `defaultValue` tomado del estado, lo escrito se conserva si la validación o
  la publicación fallan, y se vacía si todo va bien.
- **`useFormStatus`:** tiene que llamarse desde un componente dentro del `<form>`
  (`SubmitButton`).
- **`useOptimistic`:** dentro de una action se puede llamar sin `startTransition`, y el valor
  optimista dura hasta que termina la action.
- **`startTransition` después de un `await`:** ver la corrección 1.

**Guías de modern-web-guidance:** se hicieron las cuatro búsquedas del plan («form validation
error messages», «accessible form errors», «required form fields» y «prevent duplicate form
submission») y se leyeron `forms`, `required-field-feedback` y `accessible-error-announcement`.
Influyeron así:

- **`forms`:**
  - Cada campo con `name`, `<textarea>` para el texto y `required` junto con `noValidate`.
  - El foco al primer campo con error tras un envío fallido.
  - Desactivar el botón solo *después* de un envío válido, para evitar el doble envío. Ya lo
    hace `useFormStatus`: un envío no válido termina enseguida.
  - Sin desactivar la corrección automática: título y texto son prosa.
- **`required-field-feedback`:** `aria-describedby` solo mientras hay error, porque el texto
  enlazado se lee aunque esté oculto.
- **`accessible-error-announcement`:** «Post published.» va en un `role="status"` que se pinta
  siempre y solo cambia de texto, porque una región viva que aparece de golpe no siempre se
  anuncia.
- **Conflicto con CLAUDE.md:** la guía desaconseja que cada error sea una región viva. Manda
  CLAUDE.md, así que los errores siguen con `role="alert"`.
- La guía pide un indicador visual de campo obligatorio y estilos con `:user-invalid`. Es
  diseño y va en P7.

**Desviaciones del plan:**

- **Aserciones nuevas dentro de los tests del plan** (ningún test nuevo):
  - P6.2: la compuerta de Ervin y el historial de estados.
  - P6.4: dos posts tras desmontar.
  - P6.6: el foco y el doble clic que suelta la promesa.
  - P6.8: el `MutationObserver`, el mismo nodo, la cabecera y que no salga «no posts» mientras
    carga.
- **La premisa del plan sobre los updaters era cierta solo a medias (P6.4).** El plan decía que
  React no ejecuta los updaters de un componente desmontado. Si el hook no tiene
  actualizaciones pendientes, React ejecuta el updater al momento (el «eager state»), aunque el
  componente ya no exista; por eso un solo post tras desmontar no distinguía escribir dentro o
  fuera del updater. Con un segundo post ya hay una actualización pendiente, React no ejecuta el
  updater y ese post se perdería. Escribir fuera del updater, como dice el plan, sigue siendo lo
  correcto.
- **`useUserPosts` no vuelve a `loading` al cambiar `userId`.** En la app no se nota, porque
  `App` monta `PostsPanel` con `key={user.id}` y cada usuario estrena el hook. Sin esa `key`, se
  verían un instante los posts del usuario anterior.
- **`PostsPanel` solo pinta la lista cuando la API responde o hay posts creados,** para que no
  diga «This user has no posts yet.» mientras carga.
- **`createdPostsStorage`:** el `try` de la lectura envuelve solo `getItem` y `JSON.parse`, para
  que quitar `Array.isArray` no lo tape el `catch`.
- **Dos commits que no estaban en el plan:** `test: give each test more time than its async
  waits` y `fix: move focus to the first invalid field with the errors`.

**Mutaciones que no cambian el comportamiento** (anotadas; ningún test puede detectarlas):

- **P6.2:** quitar la comprobación de `signal.aborted` en la rama de éxito. Una petición
  abortada nunca resuelve con éxito; se deja como defensa, igual que en `useUsers`.
- **P6.3:** quitar la guarda `if (!storage)` de `writeCreatedPosts`. `null.setItem` lanza dentro
  del `try` y la función devuelve `false` igualmente. TypeScript obliga a mantener la guarda.
- **P6.8:** guardar con el `userId` de la respuesta. MSW y la API real devuelven el `userId`
  enviado. El `userId` explícito se queda, como pide el plan.
- **P6.9:** leer `user.id` después del `await` en vez de capturarlo antes. `handlePublish` se
  crea en cada render y su `user` es el de ese render, así que es el mismo valor.
- **P6.7:** `key={post.id}` en `PostList` sobrevivía en sus propios tests, como prevé el plan.
  Lo mata el test de los dos posts con `id: 101` de P6.8 (comprobado).

**Incidentes:**

- **`user-event` y el reset del formulario (P6.8).** El segundo post de un test se publicaba
  como «FirstSecond». `user-event` 14.6.13 guarda su propia copia de lo que ha escrito en cada
  campo, y el `form.reset()` de React no la actualiza. Se confirmó en un test aislado; en un
  navegador real no pasa. El helper `publish` hace `user.clear()` antes de escribir, con un
  comentario.
- **Una carrera en mis propios tests de P6.6:** `findByRole('status')` devolvía la región al
  momento, porque se pinta siempre vacía, y el texto se comprobaba antes de que llegara.
  Apareció porque la mutación «sin `h3`» rompía tests que no tenían que ver. Ahora esperan al
  texto con `waitFor`.
- **Escapes de Perl en las mutaciones.** Perl interpretó `${titleId}` como una variable suya y
  una mutación cambió dos cosas a la vez. Se repitió con la sustitución bien escapada.
- **El servidor de desarrollo no se paró del todo.** Al parar `pnpm dev`, el proceso de Vite
  siguió escuchando en el 5173. Se cerró a mano y se comprobó que el puerto quedaba libre.
- **La verificación commit a commit descartó una salida.** En `27ef243` la ejecución usada para
  contar los tests dio 1 fallo y el script no guardaba la salida. Repetida 8 veces no se
  reprodujo; en `HEAD` sí (1 de 10), y así se encontró el fallo del foco (corrección 4).

**Menores que quedan anotados** (de la revisión final; van a «qué haría con más tiempo»):

- **Volver al usuario original antes de que responda el `POST`.** El panel nuevo ya leyó el
  storage y no verá el post hasta el siguiente montaje (límite conocido del plan). Se
  resolvería con `useSyncExternalStore` sobre un pequeño almacén con suscripción.
- **«Posts (0)» mientras cargan los posts de la API.**
- **Tras un error al publicar** (no de validación), el foco queda en `body`, porque el botón se
  desactivó durante la action.
- **«Post published.» sigue visible** mientras se escribe el siguiente post.
- **El arranque en frío de los tests.** Medir con `maxWorkers` limitado, con `isolate: false`
  (Vitest dice que ahorraría ~1,7 s por archivo) o con un entorno más ligero que jsdom, en vez
  de seguir subiendo tiempos de espera.
