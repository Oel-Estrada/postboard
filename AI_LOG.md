# AI_LOG

Registro de cómo se ha usado la IA (Claude Code) en cada fase. Es la única fuente de la sección
de IA del README.

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
