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
