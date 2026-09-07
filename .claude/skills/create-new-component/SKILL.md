---
name: create-new-component
description: Crea un componente de React NUEVO (en TypeScript) a partir de un componente existente en un archivo de Figma, incluyendo su archivo de estilos, sus tests y su historia de Storybook. Úsalo cuando el usuario pida crear, generar o implementar un componente de React basado en un diseño de Figma, proporcionando (o pudiendo proporcionar) el link del archivo de Figma, el nombre del componente a buscar dentro de ese archivo, los estados que debe tener, y opcionalmente cómo debe funcionar alguna interacción. Dispara este skill incluso si el usuario no menciona la palabra "skill", por ejemplo con frases como "crea el componente Navbar basado en este Figma", "implementa este botón del diseño", "necesito este componente en código". NO uses este skill para actualizar, modificar, o sincronizar un componente que ya existe en el código — este skill es exclusivamente para componentes nuevos que aún no existen en el repositorio.
---

# Create New Component (desde Figma)

Este skill genera un componente de React nuevo (TypeScript) replicando un componente ya diseñado en Figma, respetando las convenciones del proyecto actual, junto con su archivo de estilos, sus pruebas y su historia de Storybook.

## Cuándo NO usar este skill

- Si el usuario pide actualizar, ajustar o sincronizar un componente que **ya existe** en el código con cambios hechos en Figma → eso es un flujo distinto (actualización), no de creación.
- Antes de generar cualquier archivo, verifica si ya existe un componente con ese nombre en el proyecto (busca en las carpetas típicas de componentes, ej. `src/components/`). **Si ya existe, detente y avísale al usuario** — no lo sobrescribas ni lo modifiques. Este skill solo sirve para crear componentes desde cero.

## Inputs esperados

Extrae estos datos de la petición del usuario. Si falta alguno esencial, pregúntalo antes de continuar:

1. **Link del archivo de Figma** (obligatorio) — URL del archivo donde vive el componente a replicar.
2. **Nombre del componente en Figma** (obligatorio) — el nombre exacto o aproximado del componente/frame a buscar dentro de ese archivo.
3. **Estados del componente** (opcional pero recomendado) — ej. "default, hover, disabled, error". Si el usuario no los da explícitamente, revisa si el componente en Figma ya tiene variantes definidas (component set) y úsalas como base, confirmando con el usuario antes de asumir demasiado.
4. **Interacción/comportamiento** (opcional) — cómo debe comportarse el componente ante eventos del usuario (click, hover, focus, submit, etc.). Si no se especifica y el componente no lo requiere por naturaleza (ej. un ícono decorativo), no inventes interacción.

## Proceso

### 1. Localizar el componente en Figma

- Usa las herramientas de Figma disponibles (`get_design_context`, `search_design_system`, `get_metadata`, etc.) contra el archivo indicado para encontrar el nodo cuyo nombre coincide con el que dio el usuario.
- Si hay varias coincidencias (ej. el mismo nombre en distintas páginas o con distintas variantes), muéstraselas al usuario y pide que confirme cuál es.
- Si no se encuentra ningún nodo con ese nombre, informa al usuario y pide que verifique el nombre o el link.

### 2. Extraer el contexto de diseño

A partir del nodo encontrado, obtén:
- Estructura/jerarquía visual (layout, spacing, auto-layout).
- Estilos: colores, tipografía, bordes, sombras, radios — preferentemente como variables/tokens de Figma si existen, no valores sueltos.
- Variantes o estados ya definidos en el component set (si aplica), para contrastarlos con los estados que pidió el usuario.

### 3. Revisar las convenciones del proyecto

Antes de escribir código, inspecciona 1-2 componentes ya existentes en el repo (misma carpeta de componentes) para detectar:
- Estructura de carpetas (¿cada componente en su propia carpeta, o archivos sueltos en `src/components/`?).
- Convenciones de tipado: cómo definen props (`interface` vs `type`), si usan `React.FC` o tipan el retorno de forma implícita, nombres de tipos (`NavbarProps`, etc.).
- Framework de testing que ya usan (Jest + React Testing Library es lo más común, pero confírmalo mirando un test existente o el `package.json`).
- Convención de Storybook: formato de las historias (CSF3 con `Meta`/`StoryObj` es el estándar actual), y cómo estructuran los `args` para cada variante.
- Estilo de imports, nombres de props, convención de nombres de funciones/handlers.

Sigue esos mismos patrones al generar el nuevo componente — el objetivo es que el código nuevo sea indistinguible del resto del proyecto en estilo.

### 4. Generar los archivos

Este proyecto trabaja en **TypeScript**. Genera siempre cuatro archivos con el mismo nombre base, en minúscula (ej. si el componente es "Navbar" → `navbar.tsx`, `navbar.css`, `navbar.test.tsx`, `navbar.stories.tsx`):

- **`nombre.tsx`**: el componente de React como función tipada, implementando:
  - Una interfaz/type de props (ej. `NavbarProps`) con los estados e interacciones como props cuando tenga sentido (ej. `variant`, `disabled`, `onClick`).
  - Los estados definidos (vía `useState` u otro patrón que ya use el proyecto) para estado interno que no dependa de props externas.
  - La interacción descrita por el usuario, si aplica.
  - `import './nombre.css';` al inicio del archivo.
- **`nombre.css`**: estilos del componente en un archivo separado — nunca CSS-in-JS ni Tailwind, a menos que el usuario lo pida explícitamente para ese componente puntual. Traduce fielmente colores, tipografía, espaciados y estados visuales (hover, disabled, etc.) extraídos de Figma, usando selectores de clase claros (ej. `.navbar`, `.navbar--active`, `.navbar__item`).
- **`nombre.test.tsx`**: pruebas básicas usando el framework detectado en el paso 3 (por defecto, si no hay convención previa, usa Jest + React Testing Library). Cubre como mínimo:
  - Que el componente se renderiza sin errores.
  - Que cada estado definido se refleja correctamente (ej. clase o atributo correspondiente cuando `disabled` es true).
  - Que la interacción especificada dispara el comportamiento esperado (ej. `onClick` se llama al hacer click), si aplica.
- **`nombre.stories.tsx`**: historia de Storybook en formato CSF3 (`Meta`, `StoryObj`), con una story por cada estado/variante identificado (ej. `Default`, `Hover`, `Disabled`).

### 5. Confirmar antes de escribir

Antes de crear los archivos, resume brevemente al usuario: nombre del componente, estados que implementarás, e interacción (si aplica). Si algo quedó ambiguo (ej. Figma tenía una variante que el usuario no mencionó), pregúntalo antes de generar el código final.

## Notas

- Este skill siempre produce un componente **nuevo**. Si en el futuro se necesita actualizar un componente ya creado cuando el diseño de Figma cambie, eso requiere un skill distinto (ej. `update-component-from-figma`), no este.
- Si el usuario no indica dónde debe vivir el nuevo componente dentro del repo, ubícalo en la misma carpeta donde están los demás componentes del proyecto.
- Si el repo no tiene Jest/Testing Library o Storybook configurados todavía, avisa al usuario antes de generar `nombre.test.tsx` o `nombre.stories.tsx`, ya que esos archivos no funcionarán sin las dependencias correspondientes instaladas.
