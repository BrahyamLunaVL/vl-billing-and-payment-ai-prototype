---
name: create-new-screen
description: Crea una pantalla o sección completa de la aplicación (TypeScript) a partir de un frame de Figma, reutilizando componentes de React que ya existen en el proyecto (sin recrearlos) y detectando cuáles elementos del diseño todavía no tienen componente. Úsalo cuando el usuario pida crear, ensamblar o implementar una pantalla, vista, sección o página completa basada en un diseño de Figma, indicando el frame, los componentes ya creados que debe usar, y cómo deben funcionar los elementos de la pantalla. Dispara este skill incluso si el usuario no menciona la palabra "skill", por ejemplo "arma la pantalla de Login con este Figma", "implementa la sección de Checkout usando estos componentes". NO uses este skill para crear un componente individual reutilizable — para eso usa create-new-component. NO uses este skill para editar una pantalla ya existente en el código — en ese caso pregunta al usuario cómo proceder antes de sobrescribir.
---

# Create New Screen (desde Figma)

Este skill ensambla una pantalla/sección completa de la aplicación a partir de un frame de Figma, llamando a los componentes de React que ya existen en el proyecto (nunca recreando su código), e identificando junto con el usuario qué hacer con los elementos del diseño que todavía no tienen componente asociado.

## Cuándo NO usar este skill

- Para crear un componente individual reutilizable → usa `create-new-component`.
- Para editar/sincronizar una pantalla que ya existe en el código con un diseño actualizado → detente y pregunta al usuario cómo proceder; este skill asume que la pantalla es nueva.
- Antes de generar archivos, verifica si ya existe una pantalla con ese nombre en el proyecto. Si existe, avisa al usuario y no la sobrescribas sin confirmación explícita.

## Inputs esperados

Extrae estos datos de la petición del usuario. Si falta alguno esencial, pregúntalo antes de continuar:

1. **Link del archivo de Figma** (obligatorio).
2. **Nombre del frame** que contiene la pantalla dentro de ese archivo (obligatorio).
3. **Lista de componentes ya creados** que deben reutilizarse dentro de la pantalla (obligatorio) — el usuario debe indicar el nombre de cada componente (y, si lo sabe, su ruta en el repo). Estos se usan mediante `import` + llamado en JSX, **nunca reescribiendo su implementación interna**.
4. **Funcionamiento de los elementos de la pantalla** (obligatorio) — cómo deben comportarse las interacciones (clicks, formularios, navegación, llamadas a componentes con ciertas props según el estado, etc.).

## Proceso

### 1. Localizar el frame en Figma

- Usa las herramientas de Figma disponibles (`get_design_context`, `get_metadata`, `search_design_system`, etc.) para encontrar el frame indicado dentro del archivo.
- Si hay varias coincidencias de nombre, pide al usuario que confirme cuál es.
- Si no se encuentra, informa y pide verificar el nombre del frame o el link.

### 2. Inventariar los elementos del frame

Extrae la lista de nodos/componentes que conforman el frame (headers, listas, botones, tarjetas, inputs, etc.) junto con su jerarquía/layout general.

### 3. Cruzar elementos del diseño contra los componentes ya creados

Para cada elemento del frame que parezca corresponder a un componente:

- **Si coincide con algo en la lista que dio el usuario** → márcalo para reutilizar: se importará y se llamará en JSX, sin generar su código interno.
- **Si NO coincide con ningún componente de la lista** → **detente y pregúntale al usuario**, por cada elemento sin resolver:
  1. ¿Es un componente que ya existe en el proyecto pero olvidó mencionarlo? (pide el nombre/ruta correcto)
  2. ¿Debe crearse como un componente nuevo y reutilizable? (en ese caso, sugiere usar el skill `create-new-component` para ese elemento antes de continuar, o pregunta si quiere que lo hagas en el mismo flujo)
  3. ¿Debe codificarse manualmente, directamente dentro del archivo de la pantalla, sin convertirlo en un componente aparte?

No sigas construyendo la pantalla completa dando por hecho una de estas tres opciones — esta confirmación es obligatoria para cada elemento no resuelto antes de escribir el código final. Puedes agrupar la pregunta para varios elementos a la vez si es más práctico, pero no debes asumir la respuesta.

### 4. Revisar las convenciones del proyecto para pantallas

Inspecciona 1-2 pantallas/secciones ya existentes en el repo (si las hay) para detectar:
- Carpeta donde viven las pantallas (ej. `src/screens/`, `src/pages/`, `src/views/`).
- Cómo importan y organizan los componentes hijos dentro de una pantalla.
- Convenciones de manejo de estado a nivel de pantalla (ej. `useState`, `useReducer`, context, librería de estado global).

Si el repo no tiene pantallas previas, sigue la misma convención de estructura usada por `create-new-component` (archivo + CSS separado) ubicando el archivo en una carpeta razonable (pregunta al usuario si no es evidente dónde debería ir).

### 5. Implementar las interacciones — una por una si el usuario lo pide así

El usuario puede indicar que hay **múltiples interacciones** y que quiere desarrollarlas de una en una. En ese caso:

- Antes de empezar a codificar, arma una lista clara de todas las interacciones/acciones que el usuario describió, en el orden en que las mencionó.
- Implementa **solo la primera** interacción de la lista (o la que el usuario indique explícitamente), dejando el resto de la pantalla estructurada pero sin esa funcionalidad todavía (o con un comentario `// TODO` claro si aplica).
- Antes de continuar con la siguiente interacción, espera a que el usuario indique explícitamente que quiere avanzar (ej. "ahora sigamos con el botón de enviar", "implementa la siguiente"). No asumas que debes continuar automáticamente con la próxima de la lista.
- Lleva un registro simple del estado (qué interacciones ya se implementaron, cuál está en curso, cuáles faltan) y muéstraselo al usuario cuando pregunte o cuando termines una interacción, para que sepa en qué punto va.
- Si el usuario no menciona que quiere hacerlo por partes, puedes implementar todas las interacciones descritas de una vez, siempre que estén claras.

### 6. Generar los archivos

Este proyecto trabaja en **TypeScript**. Al finalizar (o al completar el alcance que el usuario pidió en ese momento), genera/actualiza cuatro archivos con el mismo nombre base:

- **`nombre-pantalla.tsx`**: el archivo de la pantalla, importando y llamando a los componentes reutilizados, con el código manual para los elementos que el usuario indicó que debían ir directo aquí, y las interacciones ya implementadas.
- **`nombre-pantalla.css`**: estilos propios de la pantalla (layout general, spacing entre secciones) — los estilos internos de cada componente reutilizado NO se tocan aquí, esos ya viven en su propio CSS.
- **`nombre-pantalla.test.tsx`**: pruebas básicas (Jest + Testing Library, o el framework que ya use el repo) que verifiquen que la pantalla renderiza, que los componentes esperados están presentes, y que las interacciones implementadas hasta el momento funcionan.
- **`nombre-pantalla.stories.tsx`**: historia de Storybook (CSF3) de la pantalla, con mocks/props de ejemplo para los componentes que lo requieran.

Si el trabajo se hizo por partes (interacciones una por una), actualiza estos archivos de forma incremental en cada paso, no solo al final.

### 7. Confirmar y resumir

Antes de dar por terminada la pantalla (o cada interacción, si se trabaja por partes), resume: qué componentes se reutilizaron, qué elementos quedaron pendientes de decisión, y qué interacción(es) se implementaron en este paso.

## Notas

- Nunca reescribas la implementación interna de un componente reutilizado — si necesita cambios, eso corresponde al skill `update-component-from-figma`, no a este.
- Ante cualquier duda sobre si un elemento del diseño ya es un componente existente, pregunta antes de asumir — es preferible interrumpir el flujo que generar código duplicado.
