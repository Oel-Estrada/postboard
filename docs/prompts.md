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
