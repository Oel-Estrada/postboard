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
