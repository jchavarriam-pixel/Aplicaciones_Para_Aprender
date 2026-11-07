# Ordenar objetos por tamaño

Abrir `ordenar_objetos_tamano.html` directamente o desde el índice principal: Matemáticas → Comparación de tamaños / Orden y secuencias. Actividad posterior a Mayor y menor con objetos.

## Dinámica

- Elegir de dos a seis objetos por ronda (tres inicialmente).
- Cada ronda utiliza un solo tipo de objeto: pelotas, tazas, manzanas, mochilas, osos de peluche o botellas. Una ilustración original se muestra en tamaños progresivos para que cambie exclusivamente el tamaño.
- Acomodar los objetos del más grande al más pequeño, de izquierda a derecha. En teléfono, continuar en la siguiente fila según las posiciones indicadas.
- Arrastrar con dedo o ratón, o tocar primero un objeto y después el espacio de destino. Al colocar un objeto sobre otro, ambos intercambian sus lugares. Los objetos pueden volver al banco.
- Pulsar Revisar cuando todos estén colocados. Los espacios correctos quedan verdes; los demás se pueden corregir. Al completar, se felicita al niño y se muestra una celebración breve, respetando movimiento reducido.

El orden inicial se mezcla y no se presenta ya resuelto. En selección aleatoria, las seis familias forman un mazo sin repetición hasta agotar una vuelta y se evita repetir la última familia al comenzar otra.

## Archivos y preferencias

Las ilustraciones generadas están en `imagenes/`, como seis WebP con transparencia. Los prompts utilizados están en `prompts-imagenes.md`.

La configuración se guarda en `ordenarObjetosTamano.config.v1`: cantidad, familia, lectura y números de posición. El nombre usa la clave compartida `nombreNinoGabrielApps`. Cantidad y familia se aplican al iniciar otra ronda; lectura y números de posición cambian inmediatamente. El bloqueo del almacenamiento no impide jugar.

Incluye los créditos de Gabriel, autores y TEC, así como los controles compartidos de zoom y pantalla completa. El arrastre compensa el zoom de la página y permite desplazar todo el documento al acercar el dedo al borde de la pantalla. Mantiene los espacios de origen para evitar que los objetos cambien de posición durante el arrastre.
