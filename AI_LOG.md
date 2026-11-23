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

## P7 — Pulido visual

**Fecha:** 2026-11-23 18:32 (UTC+03:00)

**Duración:** 18:32–20:09 (≈97 min)

**Qué pedí:** ejecutar solo la fase P7 del plan (P7.1 a P7.4 y su cierre) con la skill
`frontend-design`, aplicando la dirección visual «Fichero de oficina» con Tailwind v4 (tokens
en `@theme`, sin `tailwind.config.js`, fuentes del sistema y sin dependencias nuevas):

- Solo estilo: sin cambiar la lógica, sin tocar los tests existentes, sin componentes nuevos y
  con los textos solo desde `messages`.
- Antes de tocar CSS, consultar modern-web-guidance con las cuatro búsquedas del plan y
  comprobar el contraste de la paleta (texto normal, al menos 4,5:1), proponiendo los ajustes
  antes de aplicarlos.
- Mobile-first: sin scroll horizontal a 320px, áreas táctiles de 44px y foco visible.
- `pnpm dev` levantado toda la fase, y parar antes de cada commit para mi OK visual a 320, 375
  y 1280 px con la salida real de las cuatro comprobaciones.
- Límite de 1,5 h, priorizando P7.1–P7.3 si no daba tiempo.

Durante la fase revisé cada pieza en el navegador y fui cambiando el diseño con varios mensajes
(todos literales en `docs/prompts.md`). Las decisiones de diseño de esos mensajes son mías y
están abajo.

**Qué propuso la IA:**

- **P7.1, tokens:** además de los 7 colores y las 2 fuentes del plan, vaciar los espacios de
  nombres de color y de tamaño (`--color-*: initial` y `--text-*: initial`). Así solo existen
  la paleta y la escala 14 / 16 / 20 / 28; un color fuera del sistema ni siquiera genera clase.
  También `color-scheme: light` y el foco en `:focus-visible` (2px en `accent` con 2px de
  separación). La sintaxis de `@theme` se comprobó en Context7.
- **Contraste medido antes de tocar CSS:** todo el texto pasa (`ink` 13,4/15,2:1, `muted`
  5,2/5,9:1, blanco sobre `accent` 7,1:1, `danger` 5,8/6,6:1, y el anillo de `accent` 6,2:1
  sobre `paper`). Falla un borde: `rule` sobre `card` da 1,39:1, y el plan lo usaba como borde
  de los inputs. WCAG 1.4.11 pide 3:1 en el borde que delimita un control. La IA propuso el
  borde `muted` (5,89:1) y dejar `rule` para separadores y para el panel.
- **P7.2, la pestaña:**
  - La ficha seleccionada es 1px más ancha, va con `z-10` y sin borde derecho, así que tapa el
    píxel del borde izquierdo del panel (medido: la pestaña acaba en 313 y el panel empieza en
    312).
  - El panel se estira a la altura de la fila para no ser nunca más corto que la pestaña.
  - El monograma lleva un borde `rule`, porque `paper` sobre `paper` no se veía (desvío del
    plan).
  - `sticky` solo con al menos 45rem de alto, para no esconder los últimos usuarios en una
    ventana baja.
- **P7.3:**
  - Un token `accent-deep` con `color-mix(in oklab, accent 80%, black)` para el hover de
    «Publish post».
  - El post pendiente con borde discontinuo además del texto en `muted`, para no depender solo
    del color.
  - Un indicador de carga decorativo que solo gira con `motion-safe`.
  - «Post published.» a la derecha del botón con `order-last`, sin mover la región en el DOM.
- **Columna fija con scroll propio:** primero con `direction: rtl` para llevar la barra de
  scroll a la izquierda (lo rechacé, ver abajo). Después, medir `scrollbar-gutter: stable`
  frente a sin él, y partir los cambios en dos commits atómicos (`messages.ts` repartido con un
  parche parcial).
- **P7.5:** sin el truco del `outline` transparente para animar el foco, porque en el modo de
  alto contraste de Windows ese contorno se pinta siempre. Sin fallback para
  `@starting-style`: si un navegador no lo soporta, el post nuevo aparece sin animación.
- **Aviso de tiempo** a las 19:29 (57 de 90 minutos): P7.1–P7.3 hechas, me pasaría unos 25–30
  minutos con todo lo pendiente, y propuso columna → P7.4 → cierre.

**Qué acepté:** los tokens con los espacios de nombres vaciados, el borde `muted` en los
inputs, la técnica de la pestaña con el panel estirado, el borde del monograma, `accent-deep`,
el borde discontinuo del pendiente, los dos commits de la columna, quitar `scrollbar-gutter:
stable` con su medición y el reparto del tiempo.

**Mis decisiones de diseño (revisión visual):**

- **Correcciones al plan:**
  - **Borde `muted` en los inputs** en vez de `rule` (1,39:1 frente a los 3:1 de WCAG 1.4.11).
  - **Pulgar de la barra de scroll en `muted`** en vez de `rule`. Yo había pedido `rule`; la
    guía de scrollbars pide 3:1 contra el fondo y `rule` sobre `paper` da 1,23:1 (en la captura
    apenas se veía). `muted` da 5,19:1.
- **Regla de color 60-30-10:** 60 % `paper` (fondo), 30 % `card` + `ink` (superficies y texto)
  y 10 % `accent` solo para la acción principal («Publish post»), el usuario seleccionado y el
  foco. `danger` solo para errores; nada más en `accent`.
- **Avatar circular** (`rounded-full`) en vez del cuadrado del plan, con las iniciales de
  `getInitials` y **sin servicios externos de avatares**. En el detalle, un avatar grande con el
  mismo estilo que el seleccionado en la lista.
- **`cursor-pointer` en todos los botones,** porque Tailwind v4 deja los botones con
  `cursor: default`. Cada botón tiene además su propio hover.
- **Revisión de diseño de P7.3, lo que se aplicó:**
  1. **Cabecera con jerarquía:** avatar grande, nombre en serif a 28px y email y empresa
     pequeños en `muted`, separados del resto con una línea.
  2. **Formulario** como bloque con «New post» de título, labels encima, inputs como cajas
     visibles con `min-h-11` y textarea de 4 filas. Luego, **sin borde y con fondo `paper`**
     dentro del panel: nada de tarjeta dentro de tarjeta.
  3. **«Publish post»** relleno en `accent`, con hover más oscuro y un estado deshabilitado que
     se nota (`cursor-not-allowed` y atenuado).
  4. **Posts como tarjetas** (borde `rule`, padding y separación), con el título en serif y el
     cuerpo de 65ch como máximo. El pendiente, atenuado y con «Publishing…» visible.
  5. **«Posts (n)»** como título de sección.
  6. **«Post published.» con estilo de éxito:** ✓ en SVG `aria-hidden` y un token nuevo,
     `success` (`#1E6B3A`: 5,75:1 sobre `paper` y 6,52:1 sobre `card`). No desaparece solo
     (WCAG 2.2.1) y la región `status` no cambia.
  7. **Títulos con la primera letra en mayúscula solo con CSS** (`::first-letter`), y **peso
     400**: primero bajé a 500, pero no se distinguía de la negrita.
  8. **Estado vacío cuidado:** icono decorativo y texto en `muted`, con el mismo texto.
  9. **Columna de usuarios fija desde `md`,** con el buscador y su label siempre arriba y
     **solo la lista con scroll**.
  10. **Lupa** en SVG decorativa y **placeholders** desde `messages` (en el buscador, en Title y
      en Text), sin sustituir a los labels.
  11. **Seleccionado con barra de acento** a la izquierda y **hover más visible** en el resto.
  12. **Fichas más compactas** (46px, con `min-h-11`) para que los 10 usuarios quepan en una
      ventana de unos 650px de alto (medido: el último acaba en 618px).
  13. **Barra de scroll fina y discreta a la derecha**, sin el truco de `direction: rtl`.
  14. **«Back to users» como botón secundario** (borde `muted`, fondo `card`, padding, hover y
      `cursor-pointer`) con una flecha SVG decorativa y el mismo texto (P7.4).
  15. **Animaciones sutiles (P7.5),** solo con CSS y dentro de `prefers-reduced-motion:
      no-preference`:
      - Transiciones de 150 ms en hover, pulsación y foco (el anillo anima `outline-offset`).
      - 200 ms en la pestaña y su monograma; la barra de acento crece con `@starting-style`.
      - Entrada del post nuevo (solo el pendiente) con `@starting-style`.
- **Lo que descarté, y por qué:**
  - **Botón desactivado con los campos vacíos:** el formulario valida al enviar, muestra los
    errores y mueve el foco al primer campo (P6). Un botón desactivado no dice qué falta, y
    `forms` de modern-web-guidance solo lo desactiva después de un envío válido.
  - **Contador de caracteres y textarea que crece sola:** el enunciado no lo pide y es lógica
    nueva en una fase de solo estilo.
  - **Un color por usuario:** rompe la regla 60-30-10 (`accent` solo para la selección) y la
    paleta cerrada de P7.1.
  - **Fecha, editar y borrar posts:** la API no da fechas y editar o borrar son no objetivos del
    plan.
  - **`line-clamp` y paginación:** la paginación es un no objetivo del plan, y recortar el texto
    escondería contenido que hoy se lee entero.
  - **Drawer en móvil y formulario en un modal:** cambiarían la navegación y la gestión del
    foco de P5.10 y P6, y esto era una fase de solo estilo.
  - **Un retraso simulado en el código:** metería código falso en la app. Para ver los estados
    de carga y de error están el throttling y el modo offline de DevTools, y los tests ya
    simulan la red con MSW.
- **P7.6, View Transitions: no se hace** (va a «qué haría con más tiempo», más abajo).

**Qué corregí o rechacé (y por qué):**

1. **El truco de `direction: rtl` para la columna.** La IA puso la barra de scroll a la
   izquierda para que no quedara entre la pestaña y el panel. Lo rechacé: el buscador tenía que
   quedarse fijo arriba, fuera del scroll, y la barra a la derecha, fina y discreta.
2. **`scrollbar-gutter: stable` se quitó tras medirlo.** Lo había pedido yo, pero en Chrome
   sobre Windows reserva el hueco de la barra siempre. Medición en un iframe de 1000×650, con la
   lista entera visible (`scrollHeight` 474 = `clientHeight` 474):
   - Con `stable`: hueco de 10px, la pestaña acaba en 302,6 y el panel empieza en 312. La unión
     se rompe aunque no haya scroll.
   - Sin `stable`: hueco de 0, la pestaña llega a 313 y queda unida.
   - Con la lista desbordada (iframe de 1000×480), la barra aparece en los dos casos y la
     pestaña queda a 10px del panel, que es lo que acepté. El coste de no usar `stable` es que,
     en una ventana baja, la lista gana 10px de ancho cuando deja de desbordarse al filtrar.
3. **El cuadrado del monograma, el formulario con borde y los títulos en semibold y en 500**
   se sustituyeron por mis decisiones de la revisión (arriba).

**Context7 (Tailwind CSS):** la sintaxis de `@theme` en v4: `--text-*--line-height` para el
interlineado de cada tamaño y `--namespace-*: initial` para vaciar un espacio de nombres.

**Guías de modern-web-guidance:** se hicieron las cuatro búsquedas del plan («focus visible
styles», «color contrast text», «prevent horizontal overflow» y «touch target size») y se
leyeron `accessibility`, `color`, `form-factor-adaptation` y `natural-interactions`. Más tarde
también `customize-scrollbar-color-and-thickness` y `same-document-transitions` (esta última
para el análisis de P7.6). Influyeron así:

- **`accessibility` y `natural-interactions`:**
  - El foco va en `:focus-visible` con un color propio que pasa de 3:1 contra el fondo de la
    página.
  - Cada estado (hover, pulsación y foco) se ve distinto.
  - El indicador de carga es `aria-hidden` y las regiones vivas vacías no se ocultan con
    `display: none`, para no perder el aviso.
- **`color`:**
  - La comprobación de 3:1 en los bordes de los controles (el borde `muted` de los inputs).
  - El hover oscuro con `color-mix` en oklab.
  - El post pendiente marcado también por la forma (borde discontinuo), no solo por el color.
- **`form-factor-adaptation`:**
  - `min-w-0` en los elementos flex que llevan texto.
  - `overflow-wrap: break-word` en el `body` y `anywhere` solo en el email.
  - No recortar los controles con `overflow` en un padre.
  - 44px en todo lo táctil, medido en la lista y en el detalle a 320 y 375.
- **`customize-scrollbar-color-and-thickness`:**
  - El pulgar a 3:1 (de ahí `muted`).
  - `scrollbar-width` y `scrollbar-color` detrás de `@supports`, porque son Baseline «Newly
    available».
- **`same-document-transitions`:** la API es Baseline «Newly available» (desde 2025-10-14), así
  que va con detección y el fallback de actualizar sin animación. Se desactiva con
  `prefers-reduced-motion: reduce` sobre `::view-transition-*`, y la guía recuerda que la
  transición no mueve el foco.

**Desviaciones del plan:**

- **Commits de más:** `style: make the users column sticky and clearer`, `style: add form
  placeholders and lighter post titles` y `style: add subtle motion` (P7.5). P7.6 no se hizo.
- **Tokens nuevos:** `accent-deep` (hover) y `success` («Post published.»). Los espacios de
  nombres de color y de tamaño están vaciados.
- **Claves nuevas en `messages`:** `users.searchPlaceholder`, `form.titlePlaceholder` y
  `form.bodyPlaceholder`.
- **Cambios de marcado sin lógica nueva:**
  - `div` envolventes en `PostsPanel` (cabecera y sección de posts), en `PostForm` (fila del
    botón) y en `UserSearch` (la lupa).
  - SVG decorativos, `rows={4}` y los `placeholder`.
  - `getInitials` usado también en `PostsPanel`.
- **Sin modo oscuro:** `color-scheme: light`, porque la paleta del plan es solo clara. Va a «qué
  haría con más tiempo».
- **Verificación final:** cada uno de los 7 commits de P7, por su cuenta en un worktree
  temporal, pasó `pnpm test` (23 archivos y 50 tests), `typecheck`, `lint` y `build`. Ningún
  test, `package.json` ni lockfile cambió en la fase.

**Incidentes:**

- **El `oxlint-disable-next-line` desplazado, cuatro veces.** Al añadir un comentario o partir
  una etiqueta en varias líneas, la directiva dejó de estar justo encima de la línea con el
  `role` (`UserList` dos veces, `LoadingMessage` y `PostForm`). `pnpm lint` lo detectó cada vez,
  antes del commit.
- **Errores de la IA detectados antes del commit:**
  - Un `)` de más en `ErrorMessage`.
  - Una clase `group` sin uso.
  - `md:flex` en una sola rama del condicional de la columna.
  - Un `empty:hidden` en la región `aria-live` de la búsqueda, que la habría sacado del árbol de
    accesibilidad.
- **El navegador se colgó 45s** al cambiar a mano el texto de nodos que gestiona React para
  probar una palabra larga. Se repitió añadiendo un elemento aparte y quitándolo después.
- **La extensión de Chrome se desconectó** en P7.5, así que la IA no pudo comprobar las animaciones
  en el navegador; las revisé yo en mi OK visual.
- **El servidor de desarrollo no se paró del todo** (igual que en P6): al parar `pnpm dev`, el
  proceso de Vite siguió escuchando en el 5173. Se comprobó que era el lanzado en la fase, se
  cerró y el puerto quedó libre.
- **`git worktree remove` falló en Windows** («Directory not empty», por `node_modules`). Se
  borró la carpeta a mano y se hizo `git worktree prune`.
- **Tiempo:** el límite de 90 minutos se superó por las piezas que añadí durante la fase. La IA avisó
  a las 19:29 y yo reprioricé: P7.6 fuera y P7.5 con 10 minutos como máximo.

**Qué haría con más tiempo:**

- **P7.6, View Transitions entre la lista y el detalle y al cambiar de usuario:**
  - Usar la API nativa `document.startViewTransition` (Baseline «Newly available» desde
    2025-10-14) con detección y fallback, como pide CLAUDE.md, mediante un helper
    `src/lib/withViewTransition.ts` con su test: sin soporte llama a la actualización
    directamente y con soporte se la pasa a `startViewTransition`.
  - Se usaría solo en el cambio lista ↔ detalle y en el cambio de usuario. Dentro del callback
    tendría que ir el `flushSync` actual, para que el DOM esté actualizado cuando el navegador
    toma la captura nueva, y el foco tendría que seguir moviéndose como hoy: la guía recuerda
    que la transición no lo gestiona.
  - Con `prefers-reduced-motion: reduce`, sin animación (`animation: none` sobre
    `::view-transition-*`).
  - **Por qué no `<ViewTransition>` de React:** solo anima las actualizaciones que van dentro de
    `startTransition`, y aquí el cambio de vista usa `flushSync` para que el foco llegue al
    contenido nuevo (P5.10). Habría que rehacer esa gestión del foco.
- **Modo oscuro** con `prefers-color-scheme` y `color-scheme: light dark`, con una segunda
  paleta y su contraste comprobado.
- **Revisar el estilo con el modo de alto contraste de Windows** (`forced-colors`): la pestaña y
  la barra de acento dependen de fondos y de un pseudo-elemento.

## P8 — Tests E2E

**Fecha:** 2026-11-23 20:09 (UTC+03:00)

**Duración:** 20:09–20:49 (≈40 min)

**Qué pedí:** ejecutar solo la fase P8 del plan (P8.1 a P8.4 y su cierre) con
`superpowers:executing-plans`, en la misma sesión y sin subagentes: 4 E2E, uno por flujo, sin
repetir lo que ya cubren los unitarios y la integración.

- Consultar en Context7 la configuración actual de Playwright (`webServer`, `page.route` y
  `projects`).
- Instalar `@playwright/test`, avisando si pedía scripts de instalación, y no descargar Chromium
  sin mi OK.
- Servir los E2E con el build de producción (`pnpm build && pnpm preview` en un puerto fijo con
  `--strictPort`) en vez de `pnpm dev`.
- `mockApi` que aborta todo lo que no vaya a `localhost` y sirve JSONPlaceholder con
  `src/test/fixtures.ts`. Para el error de P8.3, un interruptor que el test apaga justo antes de
  «Try again», y no un «falla una vez» que cuente peticiones.
- Textos importados de `messages`; typecheck y lint cubriendo `e2e/` y `playwright.config.ts`;
  Vitest sin `e2e/` y Playwright sin `src/`, comprobado.
- En vez del rojo, romper la app a propósito una vez por spec y enseñar que ese spec falla,
  restaurando desde copia.
- Un commit por spec (el primero con la configuración), sin esperarme si pasan las cuatro puertas
  y `pnpm test:e2e` tres veces seguidas.

Durante la fase mandé un mensaje más (literal en `docs/prompts.md`): descargar solo el headless
shell.

**Qué propuso la IA:**

- **`playwright.config.ts`:**
  - Solo `e2e/` y solo el proyecto `chromium`, con `reporter: 'list'` y
    `trace: 'retain-on-failure'`.
  - Servidor: `pnpm build && pnpm preview --port 4173 --strictPort`.
  - **`reuseExistingServer: false`** (el plan decía `!process.env.CI`): un preview ya levantado
    podría estar sirviendo un build viejo, y así el error es explícito si el 4173 está ocupado.
  - **`retries: 0`**, para que un E2E intermitente falle en vez de pasar al segundo intento.
- **`tsconfig.e2e.json`,** añadido a las referencias de `tsconfig.json`, con
  `moduleResolution: bundler` (como `src/`, porque los specs importan `messages` y `fixtures`) y
  `DOM` en `lib` para los `page.evaluate`.
- **`e2e/mockApi.ts`:**
  - Registra primero la ruta que aborta todo lo que no vaya a `localhost`. Context7 confirma que,
    si varias rutas coinciden, Playwright prueba primero la última registrada, así que el
    bloqueo queda como último recurso.
  - Después sirve `GET /users`, `GET /posts?userId=` y `POST /posts` (201, sin guardar nada y
    siempre con `id: 101`, como la API real). Las rutas se comprueban con funciones sobre la
    URL, no con globs, para no depender de cómo trata el glob el `?` de la query.
  - Devuelve el interruptor `setUsersFailing(failing)`.
- **Specs:**
  - **Búsqueda:** `'  clem'` deja 2 usuarios; Clementine muestra el estado vacío; Leanne muestra
    sus 2 posts y el `<title>` con `pageTitle`.
  - **Persistencia:** espera a «Post published.» antes de recargar, para no recargar con el post
    aún pendiente. Tras recargar comprueba 3 artículos, el nuevo arriba y sin `aria-busy`.
  - **Errores:** alerta de `loadError`, `setUsersFailing(false)`, «Try again» y la lista
    completa.
  - **Móvil, a 320×640:**
    - Sin scroll horizontal en la lista y en el detalle.
    - El foco va al título del detalle y vuelve a la ficha.
    - La búsqueda se conserva.
    - La lista se busca con `includeHidden: true`, para que `toBeHidden` compruebe la misma lista
      y no la siguiente visible.
- **Un spec que pasa a la primera no prueba nada,** así que cada uno se vio fallar con la app rota
  a propósito (tabla abajo).

**Qué acepté:** `reuseExistingServer: false` y `retries: 0`, el `tsconfig.e2e.json`, el diseño de
`mockApi` con el interruptor y los cuatro specs.

**Qué corregí o rechacé (y por qué):**

1. **Solo el headless shell.** La IA iba a pedir `pnpm exec playwright install chromium`, que
   descarga Chrome for Testing (207 MB) y Chrome Headless Shell (123 MB). Pedí solo
   `pnpm exec playwright install --only-shell chromium`: los E2E van sin interfaz y el Chrome
   completo solo hace falta para `--headed` o `--ui`. Se descargó solo
   `chromium_headless_shell-1255`, y **los cuatro specs corren con él**: el Chromium 1255
   completo no está instalado, así que no pueden haber usado otro navegador. En P9, el README
   usará este mismo comando.

**Context7 (Playwright):**

- **`page.route`:** si una petición coincide con varias rutas, gana la última registrada;
  `route.fallback()` pasa a las anteriores, y `fulfill` y `abort` no siguen la cadena.
- **`webServer`:** `command`, `url` (`port` está obsoleto), `reuseExistingServer` y `timeout`
  (60 s por defecto; aquí 120 s porque el comando incluye el build).
- **`projects`:** `devices['Desktop Chrome']`, y el viewport por spec con `test.use`.

**Comprobaciones de configuración:**

- **`@playwright/test` 1.65.1** añade 3 paquetes (`@playwright/test`, `playwright` y
  `playwright-core`) y **ninguno tiene scripts de instalación**: lo comprobé en sus
  `package.json`, y pnpm deja `pendingBuilds: []`. No hubo que tocar `allowBuilds`.
- **Typecheck y lint cubren `e2e/` y `playwright.config.ts`:** un error de tipos temporal en
  cada uno hizo fallar `pnpm typecheck`, y un `debugger` en `e2e/` hizo fallar `pnpm lint`. Se
  borraron después.
- **Vitest no recoge nada de `e2e/`** (0 archivos en `vitest list`) y **Playwright solo recoge
  `e2e/`** (`--list`: 4 tests en 4 archivos).

**La app rota a propósito, una vez por spec** (restaurada siempre desde copia y comprobada sin
diff):

| Spec | Rotura | Fallo |
| --- | --- | --- |
| `search` | `filterUsersByName` sin `trim()` | `toHaveCount(2)`: recibió 0 |
| `persistence` | `writeCreatedPosts` guarda bajo la clave + `':lost'` | tras recargar, `toHaveCount(3)`: recibió 2 |
| `errors` | `retry` no incrementa el intento (no vuelve a pedir) | `toHaveCount(4)`: recibió 0 |
| `mobile` | `App` no mueve el foco al detalle en móvil | `toBeFocused()`: `inactive` |

**Desviaciones del plan:**

- **Servidor de los E2E:** `pnpm build && pnpm preview --port 4173 --strictPort` en vez de
  `pnpm dev --port 5173`. Se prueba lo que se entrega y no actúa el doble efecto de StrictMode
  de desarrollo. Decisión mía.
- **`reuseExistingServer: false`** en vez de `!process.env.CI` (ver arriba).
- **Error de P8.3:** un interruptor (`setUsersFailing`) en vez de que `GET /users` falle una vez
  contando peticiones. Así el resultado no depende de cuántas peticiones haga la app. Decisión
  mía.
- **Solo el headless shell de Chromium** (`--only-shell`) en vez de `playwright install
  chromium`.
- **Archivo de más:** `tsconfig.e2e.json`, para que `tsc -b` compruebe `e2e/` y
  `playwright.config.ts`.

**Incidentes:**

- **La primera rotura de P8.2 no compilaba.** Quitar el `setItem` dejaba `storage` sin usar,
  `tsc` fallaba y el `webServer` no llegaba a arrancar. Ese fallo no probaba nada sobre el spec,
  así que se descartó y se rompió de otra forma que sí compila (la clave + `':lost'`).

**Verificación final** (`superpowers:verification-before-completion`, salida real):

- `pnpm test`: 23 archivos y 50 tests, exit 0.
- `pnpm test:e2e`: 4 de 4 en 7,4 s, exit 0.
- `pnpm typecheck`, `pnpm lint` y `pnpm build`: exit 0.
- Antes de cada uno de los 4 commits, las cuatro puertas en verde y la suite E2E tres veces
  seguidas en verde. Ninguna ejecución intermitente.
- Los puertos 4173 y 5173 quedan libres. `test-results/` lo ignora git.
- **Revisión final:** auto-revisión, sin subagentes, por indicación mía. Sin hallazgos Critical
  ni Important.

**Menores que quedan anotados:**

- `search.spec.ts` toma la lista de usuarios como la primera lista de la página. Si la
  maquetación pusiera otra lista antes, habría que acotarla.
- `mockApi` solo deja pasar `localhost`: si el `baseURL` pasara a `127.0.0.1`, se abortaría
  también la app. Fallaría de forma ruidosa, no en silencio.

**Qué haría con más tiempo:**

- Ejecutar los E2E en CI (con `forbidOnly` ya activo con `CI`) y subir el informe y las trazas
  de los fallos.
