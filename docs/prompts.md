# Prompts

Registro literal de los prompts de cada fase, en orden. No se resumen ni se corrigen.

## P1 — Reglas de trabajo

**Fecha:** 2026-11-23 09:53 (UTC+03:00)

```text
Antes de nada: crea docs/prompts.md y añade una sección "## P1 — Reglas de trabajo" con la
fecha y la hora y este prompt COMPLETO y LITERAL, dentro de un bloque de código, sin resumirlo
ni corregirlo. Va en el mismo commit que esta fase.

No uses skills de superpowers en esta fase: solo es configuración.

Vamos a hacer una prueba técnica para un proceso de selección. En este prompt NO escribas
código de la app: solo prepara las reglas de trabajo.

1. `git init`.
2. Crea CLAUDE.md con este contenido (redáctalo bien, en español):

### Enunciado (literal, no se cambia)
App pequeña en React + TypeScript que use https://jsonplaceholder.typicode.com
1. Lista de usuarios con búsqueda por nombre.
2. Al elegir un usuario, ver sus publicaciones y crear una nueva con un formulario validado
   (título y texto obligatorios). La API no guarda datos; basta con que la nueva aparezca en la lista.
3. Estados de carga y de error visibles.
4. Al menos 3 tests con Vitest y Testing Library.
5. README: cómo ejecutarlo, decisiones, qué haría con más tiempo, cómo usé la IA
   (qué le pedí, qué acepté y qué corregí).
Commits progresivos que muestren cómo pienso; nunca un único commit con todo.

### Hechos de la API (comprobados)
- GET /users → 10 usuarios. GET /posts?userId={id} → sus posts. GET /users/999 → 404.
- POST /posts responde 201, NO guarda y SIEMPRE devuelve id 101 → los posts creados necesitan
  un id local único (crypto.randomUUID) para no repetir `key`.

### Stack
- pnpm (nunca npm ni yarn), Vite + React + TypeScript en modo strict.
- Tailwind CSS v4 con @tailwindcss/vite (`@import "tailwindcss";`, sin tailwind.config.js).
- Vitest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom
  + jsdom. MSW para simular la red en los tests unitarios y de integración.
- @playwright/test (solo Chromium) para E2E, en su propia fase.
- fetch nativo y hooks propios. Ninguna dependencia fuera de esta lista sin explicarme por qué
  y que yo la apruebe.

### Tests (regla obligatoria)
- Cada función, hook y componente nuevo se crea CON su test en el mismo commit
  (TDD: test en rojo → código mínimo → refactor). Nunca se hace commit de código sin su test.
- Funciones de API: Vitest + MSW (éxito, error HTTP, error de red).
- Hooks: renderHook + MSW (carga, éxito, error y, si aplica, cancelación con AbortController).
- Componentes: Testing Library + user-event, buscando por rol, label o texto (data-testid solo
  si no hay otra opción).
- E2E con Playwright: flujos principales, red simulada con page.route.
- Vitest no ejecuta la carpeta e2e/ y Playwright no ejecuta los tests unitarios.
- Un commit por pieza (por ejemplo, un hook con su test), no un commit por fase.

### Seguridad
- pnpm-workspace.yaml con `minimumReleaseAge: 1440` y `allowBuilds` solo para paquetes que yo
  haya revisado. `packageManager` fijado en package.json.
- Sin secretos ni .env. .gitignore con node_modules, dist, coverage, test-results y
  playwright-report. `pnpm audit` antes de entregar.
- Los tests (unitarios y E2E) NUNCA tocan la red real.

### Reglas de código
- AbortController para peticiones que se quedan obsoletas; si res.ok es false, es un error.
- Accesibilidad: <label> en los inputs, aria-describedby en los errores de validación,
  role="alert" en los errores y role="status"/aria-live en las cargas.
- La búsqueda filtra en el cliente, sin distinguir mayúsculas y quitando espacios.
- La validación rechaza campos vacíos o con solo espacios.

### Idioma
- En inglés: nombres de variables, funciones, tipos, componentes, hooks y archivos; JSDoc;
  comentarios; descripciones de los tests (describe/it/test); mensajes de commit; textos de
  la interfaz.
- En español: README.md y los documentos de decisiones y prompts (CLAUDE.md, AI_LOG.md,
  docs/plan.md, docs/prompts.md).
- JSDoc breve en todo lo exportado (funciones de API, hooks y componentes): qué hace, sus
  parámetros, qué devuelve o qué errores lanza. No en lo interno ni en lo obvio.

### Forma de trabajar
- Una fase por prompt; dentro de la fase, un commit por pieza. Antes de cada commit: PARA,
  explícame qué hiciste y por qué, enséñame `git status` y un diff resumido, y espera mi OK.
- Commits con Conventional Commits, en inglés. No hagas push nunca.
- Si una decisión tiene alternativas, dame tu recomendación en 1-2 frases y sigue; no me des listas.
- Comandos: pnpm dev | pnpm test | pnpm test:e2e | pnpm build | pnpm lint | pnpm typecheck.

### Registro de IA
En AI_LOG.md, por cada fase: fecha y hora, qué te pedí, qué propusiste, qué acepté y qué
corregí o rechacé (y por qué). Es la ÚNICA fuente de la sección de IA del README; no inventes nada.

3. Crea AI_LOG.md con la entrada de esta fase y un .gitignore básico.
4. Enséñame todo y espera mi OK para hacer el commit "docs: add working rules and AI log".
```

## P2 — Plan

**Fecha:** 2026-11-23 10:17 (UTC+03:00)

```text
Antes de nada: añade al final de docs/prompts.md una sección "## P2 — Plan" con la fecha y la
hora y este prompt COMPLETO y LITERAL, dentro de un bloque de código, sin resumirlo ni
corregirlo. Va en el mismo commit que esta fase.

Lee CLAUDE.md. Las reglas de CLAUDE.md mandan sobre las skills: si alguna skill quiere guardar
documentos en docs/superpowers/ o hacer commits por su cuenta, no lo hagas; todo va en
docs/plan.md y ningún commit sin mi OK.
Usa superpowers:brainstorming en versión corta: el enunciado de CLAUDE.md ya es
la especificación, así que pregúntame como mucho 5 cosas, solo las decisiones de verdad abiertas
(estructura de carpetas, cómo se muestran la lista y el detalle, dirección visual).
Para la dirección visual usa la skill frontend-design: propón una dirección sobria y cuidada
con Tailwind, que no parezca una plantilla, pero sin pasarte de alcance.
Luego usa superpowers:writing-plans para escribir docs/plan.md (en español) dividido en estas
fases:
- P3 scaffold y librerías
- P4 capa de API
- P5 usuarios y búsqueda
- P6 posts y formulario
- P7 pulido visual
- P8 tests E2E
- P9 README y verificación final.

Para cada fase lista sus piezas (función, hook o componente, con su nombre en inglés) y, por
cada pieza, sus tests y su mensaje de commit, siguiendo las reglas de tests e idioma de
CLAUDE.md. En P8 lista los flujos E2E.
El plan describe piezas, firmas, casos de test y commits, pero NO incluye la implementación
completa: el código se escribe con TDD en cada fase. Al terminar el plan, no ofrezcas ni
empieces la ejecución.

No escribas código. Actualiza AI_LOG.md y espera mi OK para el commit.
```

## P2b - Revisión del plan

**Fecha:** 2026-11-23 10:31 (UTC+03:00)

```text
Antes de nada: añade al final de docs/prompts.md una sección "## P2b - Revisión del plan"
con la fecha y la hora y este mensaje COMPLETO y LITERAL, dentro de un bloque de código.
Va en el commit de la revisión (paso 2).

1. Commit del plan tal como está: en la entrada P2 de AI_LOG.md pon que acepté tus 4
   recomendaciones y que mis correcciones van en la entrada P2b. Haz el commit
   "docs: add implementation plan".

2. Después revisa docs/plan.md y CLAUDE.md con estos cambios:

a) Persistencia de los posts creados en localStorage (sustituye la decisión de que se
   pierden al cambiar de usuario):
   - Por usuario, con una clave versionada (por ejemplo `postboard:created-posts:v1`).
   - Se guarda solo cuando el POST responde bien.
   - Lectura defensiva: try/catch (storage no disponible o lleno), JSON.parse protegido y
     validación de la forma con un type guard. Si los datos no son válidos se ignoran sin
     romper la app.
   - Los posts creados se muestran arriba de los de la API, siempre como texto (nunca
     dangerouslySetInnerHTML).
   - Piezas nuevas con sus tests: las funciones de storage (puras) y su hook. Tests: se
     guarda y se recupera tras remontar, aislado por usuario, los datos corruptos o con forma
     inválida se ignoran, y un storage que lanza error no rompe la app.
   - E2E: crear un post, recargar la página y que siga ahí.

b) Responsive, mobile-first:
   - En móvil (< md): vista lista → detalle. Al elegir un usuario se muestra su panel con un
     botón "Back to users" y el foco va al título del panel. Desde md, dos columnas.
   - Áreas táctiles de al menos 44px y sin scroll horizontal a 320px.
   - Va en la fase donde se crea el layout (no solo en P7), con test del cambio de vista.
     P7 lo pule y P8 añade un flujo E2E con viewport móvil (375px).

c) React 19 (la plantilla ya lo trae). Usa sus APIs donde aporten, sin forzarlas:
   - Formulario con `<form action>` + useActionState: valida con validatePost, hace el POST
     y devuelve { errors, submitted }. Usa defaultValue con lo enviado para no perder lo
     escrito si falla; el reset automático de React limpia el formulario cuando todo va bien.
   - useFormStatus en un SubmitButton hijo del form para el estado pending (botón
     desactivado y "Publishing…").
   - useOptimistic para que el post aparezca al instante marcado como pendiente y
     desaparezca, con el error visible, si el POST falla.
   - No uses useTransition ni useDeferredValue para la búsqueda (con 10 usuarios no aportan)
     ni use() + Suspense para cargar datos sin una caché: los hooks con useEffect +
     AbortController se quedan. Si ves otro sitio donde una API de React 19 aporte de
     verdad, propónmelo.
   - Revisa cómo encaja esto con los casos ya planificados (doble clic = una sola petición,
     error del POST que no pierde lo escrito, keys únicas) y ajusta los tests.

d) Skill modern-web-guidance: en las fases de UI (P5–P7), consúltala con pnpx antes de
   escribir formularios y validación, el layout responsive y la accesibilidad. Añade a
   CLAUDE.md una política de navegadores: features Baseline "Widely available" sin
   fallback; "Newly available" solo con detección y un fallback simple, sin dependencias
   nuevas.

e) Añade a CLAUDE.md: React 19 (en formularios, preferencia por actions), la regla de
   lectura defensiva de localStorage y la regla responsive mobile-first.

Actualiza en el plan las piezas, firmas, tests y commits afectados, renumera si hace falta y
dime cuántas piezas quedan. Añade a AI_LOG.md una entrada P2b (qué pedí, qué propusiste, qué
acepté y qué corregí). Enséñame el diff resumido y espera mi OK para el commit
"docs: revise plan with persistence, responsive layout and React 19 actions".
```

### P2b - Ajustes antes del commit

**Fecha:** 2026-11-23 10:49 (UTC+03:00)

```text
OK a la revisión P2b, con estos ajustes antes del commit:
1. Linter: el plan da por hecho `eslint.config.js` en P3.1. La plantilla actual de Vite trae
   Oxlint. El plan debe decir: el linter que traiga la plantilla (si es Oxlint,
   `.oxlintrc.json`, sin añadir ESLint), con reglas de React hooks, TypeScript y jsx-a11y.
2. Cambio de usuario con un POST pendiente: añade en P6.9 el test
   `it('stores the post for the original user when switching users while publishing')`.
   Con el POST retrasado, se cambia a otro usuario antes de que responda: el post no aparece
   en el nuevo, y al volver al original está. Si para que pase la escritura en storage tiene
   que usar el userId capturado al enviar (no el del render actual), refléjalo en el plan.
3. `<title>` por usuario: sí. "Postboard" sin usuario y "{name} · Postboard" con uno
   seleccionado, con el `<title>` de React 19 y su test. Ponlo en la pieza que corresponda.
4. isNarrowViewport: el corte de 48rem sale de una constante compartida, con un comentario
   que diga que coincide con `md` de Tailwind.
5. Acepto el resto: clave por usuario, el POST que no se cancela, quitar useCreatePost, los
   errores recalculados en cada envío (anótalo para "qué haría con más tiempo": limpiar el
   error del campo al editarlo), el doble clic decidido por el test, headingRef como prop y
   la regla de foco que añadiste.
Actualiza AI_LOG.md en P2b (acepté y corregí: puntos 1 a 4), enséñame el diff resumido y haz el
commit "docs: revise plan with persistence, responsive layout and React 19 actions".
```

## P3 — Scaffold y librerías

**Fecha:** 2026-11-23 10:57 (UTC+03:00)

```text
Antes de nada: añade al final de docs/prompts.md una sección "## P3 — Scaffold y librerías"
con la fecha y la hora y este prompt COMPLETO y LITERAL, dentro de un bloque de código, sin
resumirlo ni corregirlo. Va en el mismo commit que esta fase.

No uses brainstorming ni writing-plans: el plan ya está aprobado en docs/plan.md.
Usa superpowers:executing-plans (en esta misma sesión, sin subagentes) y termina con
superpowers:verification-before-completion.

Lee CLAUDE.md y docs/plan.md. Ejecuta SOLO la fase P3:
- Lo primero, antes del scaffold: crea pnpm-workspace.yaml en la raíz con
  `minimumReleaseAge: 1440` (allowBuilds se rellena solo con lo que yo apruebe).
- IMPORTANTE: la carpeta no está vacía. NO ejecutes create-vite en la raíz ni aceptes vaciar
  ningún directorio. Haz el scaffold en una subcarpeta temporal
  (`pnpm create vite@latest _scaffold --template react-ts`, sin modo interactivo y sin
  instalar), mueve los archivos a la raíz SIN sobrescribir CLAUDE.md, AI_LOG.md, docs/,
  .gitignore, .gitattributes ni pnpm-workspace.yaml (junta los .gitignore), borra _scaffold,
  pon `"name": "postboard"` en package.json y limpia la plantilla.
- Fija packageManager ANTES de instalar nada. Si algún paquete pide ejecutar scripts de
  instalación, dime cuál es y por qué, y espera a que lo apruebe.
- Lint: quédate con el linter que traiga la plantilla (si es Oxlint, no añadas ESLint).
  Activa sus reglas de React hooks (rules-of-hooks y exhaustive-deps), TypeScript y jsx-a11y
  sin añadir dependencias. Si para algo de esto hiciera falta una dependencia nueva, pídeme OK.
- Tailwind v4, Vitest + Testing Library + jsdom + MSW, un setup de tests (con MSW en modo
  `onUnhandledRequest: 'error'`) y los scripts test, typecheck y lint. Vitest debe excluir e2e/.
- Un test trivial que pase, para comprobar que la configuración funciona.
Comprueba que `pnpm test`, `pnpm build`, `pnpm typecheck` y `pnpm lint` pasan, y enséñame la
salida real. Propón 2 commits (scaffold y tooling de tests). Actualiza AI_LOG.md y espera mi OK
antes de cada uno.
```

### P3 - Commits atómicos y textos centralizados

**Fecha:** 2026-11-23 11:10 (UTC+03:00)

```text
No hagas el commit. Cambio de planteamiento en dos puntos. Nada está commiteado, así que
reorganiza lo que tienes.

1. Commits atómicos y con sentido. Cada commit hace una sola cosa, pasa test, typecheck, lint
   y build por sí solo, y el código va siempre con su test (sin excepciones como "App sin
   test"). Ignora el "Propón 2 commits" del prompt de P3 y sigue las piezas del plan. El prompt
   y el AI_LOG de cada fase van en su propio commit de docs al cerrar la fase, sin mezclarlos
   con código.

2. Textos de la interfaz centralizados. Todo texto visible o accesible (contenido, labels,
   placeholders, aria-label, mensajes de error y de estado, título de la página) vive en
   src/i18n/messages.ts. Los componentes nunca lo escriben a mano.
   - Un objeto `messages` agrupado por área (app, users, posts, form…), sin `as const`, para
     que otro idioma pueda declararse con `satisfies typeof messages`. Los textos con datos
     son funciones (por ejemplo `pageTitle(name)`, `noUsersMatch(query)`, `postsCount(count)`).
   - Sin librería de i18n ni selector de idioma: no lo pide el enunciado. Va a "más tiempo".
   - Cada pieza añade solo las claves que usa, en su mismo commit.
   - Los tests unitarios y E2E importan los textos de messages en vez de repetir literales.
     Las funciones de messages se prueban a través de los componentes que las usan.
   - Única excepción: el <title> estático de index.html, que se pinta antes de que cargue JS.

Orden de commits (para antes de cada uno y espera mi OK, como siempre):
a. `docs: centralize ui copy and require atomic commits`: añade las dos reglas a CLAUDE.md y
   actualiza docs/plan.md (sección 3: la tabla pasa a ser clave de messages → texto; secciones
   4, 5 y 6, y las piezas que usen textos). Solo docs.
b. P3.1 `chore: scaffold vite react-ts project with vitest`: el scaffold más Vitest, Testing
   Library, user-event, jest-dom y jsdom, setup.ts, los scripts test y test:watch (Vitest solo
   ejecuta src/ y excluye e2e/), src/i18n/messages.ts con el título de la app y App.test.tsx.
   Enséñame el rojo. SIN Tailwind: desinstálalo ahora y vuelve a añadirlo en P3.2.
c. P3.2 `chore: add tailwind css v4`.
d. P3.3 `test: add msw server that blocks unhandled requests`. El rojo no puede tocar la red
   real: tiene que fallar porque aún no existe el módulo del servidor, no por hacer una
   petición de verdad.
e. `docs: log p3 prompt and ai decisions`: docs/prompts.md (el prompt de P3 y este mensaje,
   literales) y AI_LOG.md. En AI_LOG anota que separar los textos y los commits atómicos
   fueron correcciones mías.

En cada commit de código, enséñame la salida real de pnpm test, typecheck, lint y build.
```

### P3 - OK al commit (a)

**Fecha:** 2026-11-23 11:19 (UTC+03:00)

```text
OK al commit (a). Sigue con P3.1.
```

### P3 - @testing-library/dom explícito

**Fecha:** 2026-11-23 11:32 (UTC+03:00)

```text
Antes del commit: añade @testing-library/dom de forma explícita a devDependencies.
Testing Library 16 lo declara como peerDependency (no es una dependencia suya) y su README
pide instalarlo; ahora funciona solo porque pnpm instala los peers automáticamente. Lo
apruebo: es parte de Testing Library. Va en este mismo commit de P3.1. Anótalo en AI_LOG
(commit e) como corrección mía. Vuelve a pasar los cuatro comandos y enséñame el diff de
package.json antes del commit.
```

### P3 - OK al commit de P3.1

**Fecha:** 2026-11-23 11:35 (UTC+03:00)

```text
OK al commit de P3.1.
```

### P3 - Pirámide de tests

**Fecha:** 2026-11-23 11:39 (UTC+03:00)

```text
Antes de seguir con P3.2: cambio en la estrategia de tests. Es una prueba técnica: quiero
demostrar que sé testear en las tres capas siguiendo la pirámide, no acumular cantidad. El
plan prevé unos 134 tests (21 E2E) y es demasiado.

Haz un commit de docs `docs: shape the test plan as a testing pyramid` que:
1. Añada a CLAUDE.md (sección Tests) las tres capas y la regla de cantidad:
   - Unitarios (la mayoría): una pieza aislada. Funciones puras, funciones de API y hooks
     con MSW, componentes que solo pintan.
   - Integración (menos): varias piezas reales juntas con MSW: UsersPanel, PostForm,
     PostsPanel y App.
   - E2E (muy pocos): Playwright con la app real y la red simulada con page.route; solo
     flujos que cruzan toda la app.
   - Cada test cubre un comportamiento distinto que merezca defenderse: nada de variaciones
     del mismo caso ni tests de lo trivial (los tipos no se testean).
   - Los tests de integración se llaman *.integration.test.tsx, para que la pirámide se vea
     en el árbol.
2. Recorte docs/plan.md a un presupuesto orientativo: ~30 unitarios, ~10 de integración y 4
   E2E (unos 45 en total). Conserva siempre los 5 puntos de revisión de la sección 7, el test
   de XSS y el de localStorage corrupto. En la API, los casos de error HTTP, error de red y
   señal se prueban una vez en `request`, y cada función (getUsers, getPostsByUser,
   createPost) solo comprueba su ruta, su método y su cuerpo. E2E: (1) buscar un usuario y
   abrir sus posts; (2) crear un post y que siga ahí tras recargar; (3) un error de la API y
   "Try again" lo recupera; (4) móvil a 375px: lista → detalle → "Back to users". La
   validación del formulario vacío y el <title> pasan a integración.
3. Añada al plan una tabla resumen por capa y por pieza (cuántos tests y de qué tipo), que
   luego irá al README.
Antes del commit, enséñame la tabla resumen y la lista de tests eliminados. No toques código.
Después sigue con P3.2 como estaba previsto.
```

### P3 - Ajustes a la pirámide

**Fecha:** 2026-11-23 11:51 (UTC+03:00)

```text
Bien la pirámide. Antes del commit, dos ajustes:
1. PostsPanel: recupera en un solo test de integración la marcha atrás del post optimista:
   si el POST falla, el post pendiente desaparece, sale el error y no se guarda nada en
   storage. Es lo que demuestra useOptimistic y ningún otro test lo cubre (PostForm solo
   prueba que no se pierde lo escrito). La integración pasa a 14 y el total a 51.
2. E2E móvil: hazlo a 320px en lugar de 375px y añade en el mismo test la comprobación de
   que no hay scroll horizontal (scrollWidth <= clientWidth). No es un test nuevo. Las áreas
   táctiles de 44px se quedan en revisión manual.
No juntes UserSearch con UsersPanel ni SubmitButton con PostForm: cada componente se queda con
su test propio. 50-51 tests está bien.

Ten en cuenta que te pedí hacer antes el commit de P3.2. Como no comparten archivos, vale este
orden: commit de docs (solo CLAUDE.md y docs/plan.md) y después el de P3.2 (sus 5 archivos, ya
aprobados), sin volver a preguntarme si los cuatro comandos pasan. Luego sigue con P3.3.
```

### P3 - OK a P3.3 y cierre de la fase

**Fecha:** 2026-11-23 11:58 (UTC+03:00)

```text
OK al commit de P3.3.

Después, un commit de docs aparte, `docs: use msw 3 onUnhandledFrame option in the plan`,
que solo cambie docs/plan.md (sección 2 y P3.3). No toques docs/prompts.md (los prompts son
literales) ni la entrada de P2 en AI_LOG.md (es historia). Hazlo sin volver a preguntarme.

Luego prepara el commit de cierre `docs: log p3 prompt and ai decisions` y PARA antes de
hacerlo:
- docs/prompts.md: el prompt de P3 y, en orden, TODOS los mensajes que te he mandado en esta
  fase, literales, cada uno con su hora.
- AI_LOG.md, entrada de P3, sin inventar nada:
  - Corregí yo: commits atómicos y textos de la UI en src/i18n/messages.ts (rechacé el primer
    commit, que mezclaba scaffold, Tailwind y el prompt, y dejaba App sin test);
    @testing-library/dom explícito por ser peerDependency; la pirámide de tests (de ~129 a 51),
    con mis dos ajustes (marcha atrás optimista en PostsPanel y E2E móvil a 320px sin scroll
    horizontal) y sin juntar componentes para ahorrar tests; acepté el orden docs → P3.2
    cuando no seguiste el que te pedí.
  - Propuso la IA y acepté: comprobar el evento request:unhandled en el test de MSW;
    onUnhandledFrame de MSW 3 en vez de fijar la 2.x; defineConfig de vitest/config porque
    Oxlint rechaza la referencia triple-slash; cleanup() en setup.ts; "strict": true
    explícito; probar Oxlint con un archivo con errores a propósito.
Enséñame el diff de los dos archivos antes del commit.
```

### P3 - Duración, nota del revisor y commit de cierre

**Fecha:** 2026-11-23 12:09 (UTC+03:00)

```text
Ya he quitado yo la "x" suelta de docs/prompts.md; git status solo muestra los dos archivos
preparados. Antes del commit:
1. En la entrada de P3 de AI_LOG.md, debajo de la fecha, añade la línea
   "**Duración:** 10:57–HH:MM (≈N min)", con la hora del commit de cierre. La necesito para
   el tiempo empleado.
2. Al principio de AI_LOG.md (antes de P1), añade esta nota tal cual: "Además de Claude Code,
   usé una segunda sesión de Claude como revisor: revisaba cada prompt antes de lanzarlo y
   cada salida antes de aprobar un commit. Algunas de mis correcciones salieron de esa
   revisión; la decisión final fue siempre mía."
El matiz del punto 5 déjalo como está. Hecho esto, haz el commit
`docs: log p3 prompt and ai decisions` sin volver a preguntarme y enséñame `git log --oneline`
de la fase y `git status`.
```

## P4 — Capa de API

**Fecha:** 2026-11-23 12:12 (UTC+03:00)

```text
Antes de nada: añade al final de docs/prompts.md una sección "## P4 — Capa de API" con la
fecha y la hora y este prompt COMPLETO y LITERAL, dentro de un bloque de código, sin resumirlo
ni corregirlo. Igual que en P3, añade también, literal y con su hora, cada mensaje que te mande
durante la fase. Todo eso va en el commit de docs que cierra la fase, con AI_LOG.md.

No uses brainstorming ni writing-plans: el plan ya está aprobado en docs/plan.md.

Lee CLAUDE.md y docs/plan.md. Ejecuta SOLO la fase P4 (P4.1 a P4.4 y su cierre) con
superpowers:executing-plans (en esta misma sesión, sin subagentes) y
superpowers:test-driven-development: por cada pieza, primero el test en rojo (enséñame que
falla, sin tocar la red real), luego el código mínimo, luego refactor. Un commit por pieza,
con su test y solo con los archivos de la pieza.
Tests: los del plan (pirámide; no añadas otros sin decírmelo). `request` cubre una vez el
éxito, el error HTTP (res.ok false), el error de red y la cancelación con AbortController;
getUsers, getPostsByUser y createPost solo comprueban su ruta, su método y su cuerpo.
Antes de escribir código, consulta en Context7 la API actual de MSW 3 para los handlers
(http, HttpResponse, delay) y cómo leer el método, la query y el cuerpo dentro de un handler.
Si el test de cancelación falla por el entorno de tests (por ejemplo, porque jsdom y el fetch
de Node no se entienden con la señal) y no por el código, para y explícamelo antes de cambiar
la configuración.
En cada pieza, enséñame el rojo y la salida real de pnpm test, typecheck, lint y build, y
espera mi OK antes de cada commit. Termina con superpowers:verification-before-completion.
Al cerrar la fase, actualiza AI_LOG.md (con la línea **Duración:** inicio–fin de la fase) y
prepara el commit de cierre `docs: log p4 prompt and ai decisions`; para antes de hacerlo.
```

### P4 - OK a P4.1 y enfoque de P4.2–P4.4

**Fecha:** 2026-11-23 12:19 (UTC+03:00)

```text
OK al commit de P4.1. Muy bien la comprobación de mutaciones (romper el código a propósito y
ver que falla solo el test que toca): anótala en AI_LOG como propuesta tuya aceptada.
Para P4.2–P4.4 vale tu enfoque (handlers por defecto + request:start), con dos cuidados: lee
el cuerpo con request.clone() para no consumirlo antes que el handler, y quita los listeners
después de cada test, como en server.test.ts.
Respóndeme en español a partir de ahora (AI_LOG y docs/prompts.md siguen en español, como
dice CLAUDE.md).
```

### P4 - Validación con zod

**Fecha:** 2026-11-23 12:28 (UTC+03:00)

```text
Cambio de planteamiento antes de cerrar P4.2: vamos a validar con zod todo lo que entra de
fuera. Apruebo la dependencia `zod`. Motivo: un mismo enfoque valida las tres fronteras de la
app: la respuesta de la API (hoy `res.json() as T` confía a ciegas), el formulario y lo que se
lee de localStorage (sustituye la comprobación de tipos escrita a mano). Además, los tipos se
infieren de los esquemas, así que el tipo y la validación no se pueden desincronizar.

Antes de nada, consulta en Context7 la versión actual de zod y su API para: esquemas de objeto
y de array, trim + min con mensaje propio, parse/safeParse y z.infer.

1. Deja P4.2 sin commitear (no lo pierdas) y haz primero un commit de docs
   `docs: validate external data with zod` que:
   - En CLAUDE.md: añada zod al stack y esta regla: los datos que entran de fuera (API,
     formulario, localStorage) se validan con un esquema de zod; sus tipos se infieren del
     esquema (z.infer); los mensajes de error del formulario salen de messages.
   - En docs/plan.md:
     - la decisión en la sección 1, con lo descartado (validar a mano, no validar la API);
     - los contratos de la sección 4: dónde viven los esquemas y sus tipos (elige un sitio y
       justifícalo en una frase). `request` no cambia: cada función de la API hace parse de lo
       que recibe;
     - las piezas afectadas: P4.2–P4.4, P6.1 (validatePost con un esquema, mismo contrato y
       mismos tests) y P6.3 (isPostEntry con safeParse);
     - un solo test nuevo, en getUsers: que unos datos con forma inesperada se rechazan (no lo
       repitas en cada función);
     - la tabla de la pirámide actualizada.
   Enséñame el diff resumido antes del commit.
2. Después rehaz P4.2 con zod: instala zod en ese commit (es su primer uso) y añade el esquema
   de User con su tipo inferido, getUsers validando la respuesta y el test nuevo. AsyncState
   sale de este commit y entra en P5.2 con su primer uso (cada pieza añade solo lo que usa);
   no cambies el plan por eso, anótalo en AI_LOG como desviación. Enséñame el rojo, las
   mutaciones, la salida real de los cuatro comandos y cuánto crece el bundle con zod, y
   espera mi OK.
```

### P4 - OK al commit de docs y tipos en su primer uso

**Fecha:** 2026-11-23 12:45 (UTC+03:00)

```text
OK al commit de docs. Y sí: PostEntry igual que AsyncState. Regla general a partir de ahora:
cada tipo y cada esquema entran en la pieza de su primer uso; si eso se aparta del plan, no me
preguntes: anótalo en AI_LOG como desviación y sigue.
Después rehaz P4.2 con zod desde el stash (cuando esté aplicado y comprobado, borra el stash y
la copia de respaldo), y para antes del commit con el rojo, las mutaciones, la salida real de
los cuatro comandos y cuánto crece el bundle con zod.
```

### P4 - zod clásico y OK a P4.2

**Fecha:** 2026-11-23 12:53 (UTC+03:00)

```text
Sigue con la API clásica de zod: es la que conoce cualquier equipo y se lee mejor, y +24 kB
gzip es aceptable aquí. Anota en AI_LOG la medición (clásica +23,8 kB gzip frente a zod/mini
+4,8 kB) y la decisión, y deja zod/mini en "qué haría con más tiempo". OK al commit de P4.2;
sigue con P4.3.
```

### P4 - OK a P4.3

**Fecha:** 2026-11-23 13:09 (UTC+03:00)

```text
OK al commit de P4.3. Anota en AI_LOG la mutación que sobrevive (userId escrito a mano) y que
la cubre el test de cambio de usuario de useUserPosts en P6.2. Sigue con P4.4.
```

### P4 - OK a P4.4 y cierre de la fase

**Fecha:** 2026-11-23 13:17 (UTC+03:00)

```text
OK al commit de P4.4. Después haz la verificación final de la fase y prepara el commit de
cierre `docs: log p4 prompt and ai decisions`; para antes de hacerlo y enséñame el diff de
docs/prompts.md y AI_LOG.md.
En la entrada de P4 de AI_LOG, con su **Duración:**, que no falte:
- Corregí yo: validar con zod todo lo que entra de fuera (API, formulario y localStorage),
  con su commit de docs; la API clásica de zod frente a zod/mini, con la medición
  (+23,8 kB frente a +4,8 kB gzip), y zod/mini a "qué haría con más tiempo"; que cada tipo y
  esquema entre con su primer uso (AsyncState pasa a P5.2 y PostEntry a P6.2, como
  desviaciones del plan).
- Propuso la IA y acepté: las mutaciones en cada pieza (con la mutación de P4.3 que
  sobrevive y que cubrirá P6.2); probar los handlers compartidos con request:start y
  clone(); el refactor de recordRequests().
- Incidente: el modo automático de permisos bloqueó un git checkout que habría borrado
  trabajo sin commitear; se restauró desde copias y no se perdió nada.
```

### P4 - Hora de fin y OK al cierre

**Fecha:** 2026-11-23 13:27 (UTC+03:00)

```text
Usa la hora del commit como fin, igual que en P3. OK al commit de cierre de P4.
```

## P5 — Usuarios, búsqueda y layout

**Fecha:** 2026-11-23 13:28 (UTC+03:00)

```text
Antes de nada: añade al final de docs/prompts.md una sección "## P5 — Usuarios, búsqueda y
layout" con la fecha y la hora y este prompt COMPLETO y LITERAL, dentro de un bloque de código,
sin resumirlo ni corregirlo. Igual que en P3 y P4, añade también, literal y con su hora, cada
mensaje que te mande durante la fase. Todo eso va en el commit de docs que cierra la fase, con
AI_LOG.md. Respóndeme en español.

No uses brainstorming ni writing-plans: el plan ya está aprobado en docs/plan.md.

Lee CLAUDE.md y docs/plan.md. Ejecuta SOLO la fase P5 (P5.1 a P5.11 y su cierre) con
superpowers:executing-plans (en esta misma sesión, sin subagentes) y
superpowers:test-driven-development: por cada pieza, primero el test en rojo (enséñame que
falla, sin tocar la red real), luego el código mínimo, luego refactor. Un commit por pieza,
con su test y solo con los archivos de la pieza. Como en P4: si el rojo es solo "falta el
módulo", comprueba con mutaciones que cada test falla por su propio motivo, y restaura siempre
desde copias, nunca con git checkout.
Tests: los del plan (pirámide; no añadas otros sin decírmelo; los de integración en
*.integration.test.tsx). Textos solo desde src/i18n/messages.ts. AsyncState entra en
src/types.ts en P5.2, su primer uso.
Antes de escribir UI, consulta la skill modern-web-guidance con las búsquedas que indica el
plan para esta fase y aplica la política de navegadores de CLAUDE.md; anota en AI_LOG qué guía
influyó y en qué. Consulta en Context7 lo que dependa de librerías: renderHook de Testing
Library, la opción { once: true } de los handlers de MSW 3 y el soporte de <title> de React 19.
En cada pieza, enséñame el rojo y la salida real de pnpm test, typecheck, lint y build, y
espera mi OK antes de cada commit. Termina con superpowers:verification-before-completion.
Al cerrar la fase, actualiza AI_LOG.md (con la línea **Duración:** inicio–fin, con la hora del
commit de cierre) y prepara el commit de cierre `docs: log p5 prompt and ai decisions`; para
antes de hacerlo.
```

### P5 - OK a P5.1

**Fecha:** 2026-11-23 13:37 (UTC+03:00)

```text
OK al commit de P5.1. Sigue con P5.2.
```

### P5 - Test de StrictMode en useUsers

**Fecha:** 2026-11-23 13:46 (UTC+03:00)

```text
Sí, añádelo: es un comportamiento distinto y real (la app arranca en StrictMode, y sin esa
comprobación se ve un instante "Couldn't load users." al cargar en desarrollo). Que P6.2
cubra el mismo patrón en otro hook no protege este.
Usa renderHook(..., { reactStrictMode: true }), apunta los estados por los que pasa el hook y
exige que nunca llegue a 'error' y que acabe en 'success'. Llámalo
"does not flash an error when StrictMode aborts the first request". Comprueba que falla con la
mutación y pasa sin ella. Actualiza la tabla de la pirámide del plan en el commit de cierre
(53 tests) y anótalo en AI_LOG como test añadido a propuesta tuya. Enséñame el test y los
cuatro comandos antes del commit de P5.2.
```

### P5 - Quitar la dependencia del tiempo y OK a P5.2

**Fecha:** 2026-11-23 13:58 (UTC+03:00)

```text
Buen diagnóstico. Antes del commit, prueba a quitar la dependencia del tiempo: en vez de
delay(100), que el handler marque que ha llegado la segunda petición y espere a una promesa
que resuelve el test:

  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let reached = false
  server.use(http.get(`${API_BASE_URL}/users`, async () => {
    reached = true
    await gate
    return HttpResponse.json(users)
  }))
  // renderHook igual que ahora, con reactStrictMode: true
  await waitFor(() => expect(reached).toBe(true))
  release()
  // waitFor de 'success' y expect(statuses).not.toContain('error')

Así el orden lo fija el test y no el reloj. Repite la mutación 3 veces: si falla las 3 y pasa
sin ella, quédate con esta versión. Si no detecta el fallo, vuelve al delay(100) con su
comentario. En los dos casos, anota en AI_LOG qué enfoque quedó y por qué. Con eso, OK al
commit de P5.2 (sin volver a preguntarme) y sigue con P5.3.
```

### P5 - OK a P5.3 y commit de P5.4 sin esperar

**Fecha:** 2026-11-23 14:18 (UTC+03:00)

```text
OK al commit de P5.3. Haz P5.4 y, si los cuatro comandos pasan y las mutaciones fallan donde
deben, haz su commit sin esperarme. Para antes del commit de P5.5 y enséñame las dos piezas.
```

### P5 - Mayúsculas en getInitials y textos con datos probados con literales

**Fecha:** 2026-11-23 14:33 (UTC+03:00)

```text
P5.4: opción 1. Añade la aserción getInitials('ervin howell') → 'EH' al primer test.
P5.5: bien el oxlint-disable comentado y el nombre accesible completo.

El tropiezo de usernameHandle demuestra que las funciones de messages que montan el texto con
datos no quedan cubiertas a través de los componentes: el test compara contra la misma función
rota. Corrígelo así:
- Commit de docs `docs: test interpolated ui texts with literals`: en CLAUDE.md, cambia "las
  funciones de messages se prueban a través de los componentes" por "las funciones de messages
  que interpolan datos se prueban en src/i18n/messages.test.ts comparando con literales (un
  test, una aserción por función; cada pieza añade la suya)". Actualiza el plan (secciones 3
  y 5, y la pirámide: 54 tests). Anota el tropiezo en AI_LOG.
- En P5.5 añade src/i18n/messages.test.ts con
  it('interpolates data into the texts that need it'), con usernameHandle('Bret') → '@Bret'.
  Comprueba que falla con la versión rota ('@' sin el nombre).

Orden: commit de P5.4, el de docs y el de P5.5. Si los cuatro comandos pasan y las mutaciones
fallan donde deben, haz esos commits sin esperarme y sigue con P5.6 y P5.7 igual. Si alguna
mutación sobrevive, para. Para antes del commit de P5.8 (UsersPanel) y enséñame lo que hayas
hecho desde aquí.
```

### P5 - Fallo intermitente: asyncUtilTimeout

**Fecha:** 2026-11-23 14:46 (UTC+03:00)

```text
Bien el diagnóstico y bien parar. Haz el commit `test: allow slower first requests in async
utils` con configure({ asyncUtilTimeout: 5000 }) en src/test/setup.ts y su comentario.
Antes de commitearlo, ejecuta la suite completa 10 veces seguidas y enséñame el resumen (todas
en verde). Si alguna falla, para: habrá que buscar la causa, no subir más el tiempo. Anota en
AI_LOG el fallo intermitente, la causa y el arreglo.
Si las 10 pasan, sigue como antes: commit de P5.6 y P5.7 sin esperarme si los cuatro comandos
pasan y las mutaciones fallan donde deben. Bien mantener <p role="status"> frente a <output>
con su comentario. Para antes del commit de P5.8 (UsersPanel).
```

### P5 - OK a P5.8, P5.9 sin esperar y revisión de P5.10 en el navegador

**Fecha:** 2026-11-23 15:06 (UTC+03:00)

```text
OK al commit de P5.8. El test de error lo dejamos para el E2E de P8.3, como dice el plan.
Haz P5.9 y, si los cuatro comandos pasan y las mutaciones fallan donde deben, haz su commit
sin esperarme. Después haz P5.10 y para antes de su commit: además de lo de siempre, levanta
`pnpm dev` en segundo plano y dame la URL, porque quiero revisar el layout en el navegador
(escritorio y móvil) antes de aprobarlo.
```

### P5 - Revisión en el navegador, P5.11 y cierre

**Fecha:** 2026-11-23 15:18 (UTC+03:00)

```text
He revisado el layout en el navegador: la selección y la búsqueda funcionan; el diseño se
cuida en P7. OK a los commits de P5.9 y P5.10.
En P5.11, como su test corre sin simular matchMedia (escritorio), añádele dos comprobaciones
sin crear un test nuevo:
- tras elegir a Ervin, el foco sigue en su botón de la lista (cubre la mutación de P5.10 que
  da el foco al h2 también en escritorio);
- con eso, el test pasa por el fallback de isNarrowViewport (comprueba que ahora falla la
  mutación que sobrevivía en P5.9).
Comprueba con el servidor de desarrollo si el <title> de index.html le gana al de React 19;
si gana, quítalo de index.html, como dice el plan, y dímelo.
Si los cuatro comandos pasan y las mutaciones fallan donde deben, haz el commit de P5.11 sin
esperarme. Después haz la verificación final y prepara el cierre de la fase
(`docs: log p5 prompt and ai decisions`), con la pirámide actualizada a 54 tests y todo lo de
esta fase en AI_LOG: el test de StrictMode con la compuerta, el fallo intermitente y el
asyncUtilTimeout, el tropiezo de usernameHandle y messages.test.ts, las guías de
modern-web-guidance aplicadas y los dos oxlint-disable. Para antes de ese commit y deja el
servidor de desarrollo levantado para que revise el título de la pestaña.
```

### P5 - OK al cierre

**Fecha:** 2026-11-23 15:46 (UTC+03:00)

```text
OK al commit de cierre de P5. Asegúrate de que AI_LOG recoge también los dos menores (los dos
<title> en <head> y el foco que se pierde con "Back to users" si el usuario elegido quedó
fuera del filtro, que va a "qué haría con más tiempo"). Después del commit, para el servidor
de desarrollo.
```
