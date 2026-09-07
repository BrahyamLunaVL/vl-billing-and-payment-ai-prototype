---
name: update-component-from-figma
description: Actualiza un componente de React (TypeScript) que YA EXISTE en el repositorio, para que refleje cambios hechos en su diseño de Figma, preservando la lógica de negocio, handlers y props personalizadas que el equipo haya agregado y que no vengan del diseño. Úsalo cuando el usuario pida editar, actualizar, sincronizar o ajustar un componente existente según una nueva versión en Figma — por ejemplo "actualiza el Navbar con los cambios de este Figma", "sincroniza el botón con el nuevo diseño", "el diseño del Card cambió, actualízalo en código". Dispara este skill incluso si el usuario no menciona la palabra "skill". NO uses este skill si el componente aún no existe en el código — en ese caso usa create-new-component en su lugar.
---

# Update Component from Figma

Este skill actualiza un componente de React (TypeScript) ya existente en el proyecto para que coincida con una versión actualizada de su diseño en Figma, sin destruir lógica que el equipo haya añadido y que no proviene del diseño.

## Cuándo NO usar este skill

- Si el componente **no existe todavía** en el repositorio → usa el skill `create-new-component` en su lugar. Verifica esto buscando el archivo antes de continuar; si no lo encuentras, dile al usuario y sugiere el otro skill.
- Este skill nunca crea un componente desde cero.

## Inputs esperados

Extrae estos datos de la petición del usuario. Si falta alguno esencial, pregúntalo antes de continuar:

1. **Nombre del componente a editar** (obligatorio) — el nombre del componente ya existente en el código (ej. "Navbar").
2. **Link del archivo de Figma** (obligatorio) — URL del archivo donde está la versión actualizada del diseño.
3. **Nombre del componente de referencia en Figma** (obligatorio) — el nombre del nodo/frame dentro de ese archivo que se debe usar como fuente de verdad para la actualización (puede coincidir o no con el nombre del componente en código).

## Proceso

### 1. Localizar el componente existente en el repo

- Busca los archivos actuales del componente (`nombre.tsx`, `nombre.css`, y si existen, `nombre.test.tsx` y `nombre.stories.tsx`) en las carpetas de componentes del proyecto.
- Si no se encuentra, detente e infórmale al usuario que este skill requiere que el componente ya exista — sugiere usar `create-new-component` si de verdad es nuevo.
- Lee el contenido completo de `nombre.tsx` para entender su implementación actual: props, estados internos, handlers, lógica condicional, integraciones (llamadas a hooks propios, contexto, etc.).

### 2. Obtener el diseño actualizado de Figma

- Usa las herramientas de Figma disponibles (`get_design_context`, `search_design_system`, `get_metadata`, etc.) contra el archivo y nombre indicados para encontrar el nodo de referencia.
- Si hay varias coincidencias, pide al usuario que confirme cuál usar.
- Si no se encuentra, informa y pide verificar el nombre o el link.
- Extrae del nodo: layout, estilos (colores, tipografía, spacing, bordes, sombras — preferentemente como tokens/variables), y variantes/estados definidos en el component set.

### 3. Comparar diseño actual vs. implementación actual

Antes de tocar código, identifica explícitamente las diferencias entre lo que hay en Figma ahora y lo que hay implementado:
- **Cambios visuales**: colores, tipografía, spacing, tamaños, bordes, sombras que difieren.
- **Cambios estructurales**: elementos agregados/quitados en el layout, nuevos estados o variantes que no existían antes (o estados que fueron removidos del diseño).
- **Cambios que NO debes tocar**: cualquier lógica de negocio, handlers de eventos, llamadas a APIs, integraciones con estado global, o props que no tengan relación directa con el diseño visual. Si detectas que un estado fue removido en Figma pero tiene lógica asociada en el código (ej. un `onClick` ligado a esa variante), **no lo elimines automáticamente** — pregúntale al usuario si de verdad quiere quitar esa funcionalidad o si solo cambió visualmente.

Presenta este resumen de diferencias al usuario antes de aplicar los cambios, especialmente si hay algo ambiguo o que implique quitar código existente.

### 4. Aplicar los cambios

Con la confirmación del usuario (o si los cambios son puramente visuales y no ambiguos):
- Edita `nombre.tsx` para reflejar los cambios estructurales/de estado necesarios, preservando el resto de la implementación intacta.
- Edita `nombre.css` para reflejar los nuevos valores visuales.
- Actualiza el tipo/interfaz de props si se agregaron o quitaron estados relevantes.
- Sigue las mismas convenciones de código que ya tiene el archivo (no las cambies aunque difieran de otros componentes del repo — respeta el estilo del archivo que estás editando).

### 5. Tests y Storybook: pregunta caso por caso

Este proyecto no actualiza automáticamente `nombre.test.tsx` ni `nombre.stories.tsx` por defecto. Cada vez que hagas una actualización de componente, **pregunta explícitamente al usuario**:
- Si los cambios afectan estados/variantes visuales → pregunta si quiere que actualices también `nombre.stories.tsx` para reflejar las variantes nuevas/eliminadas.
- Si los cambios afectan comportamiento (props, lógica condicional, handlers) → pregunta si quiere que actualices también `nombre.test.tsx`.
- Si los cambios son mínimos y puramente cosméticos (ej. un color), puedes sugerir que probablemente no haga falta tocar tests/stories, pero deja la decisión final al usuario.

### 6. Resumen final

Al terminar, resume qué archivos modificaste y qué cambios aplicaste en cada uno, para que el usuario pueda revisar antes de hacer commit.

## Notas

- Este skill asume que el componente fue originalmente creado (o al menos sigue la misma estructura de 4 archivos) que usa `create-new-component`: `nombre.tsx`, `nombre.css`, `nombre.test.tsx`, `nombre.stories.tsx`.
- Prioriza siempre no romper funcionalidad existente por encima de lograr un match visual perfecto con Figma. Ante la duda, pregunta antes de modificar o eliminar código.
