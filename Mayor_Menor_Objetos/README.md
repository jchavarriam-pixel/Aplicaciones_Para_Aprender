# Explora y compara

Abrir `mayor_menor_objetos.html` directamente o desde el índice principal. La aplicación funciona como archivo local y desde servidor, sin librerías externas para jugar.

## Cuatro modos

1. **Grande y pequeño:** dos opciones del mismo tipo de objeto. Se puede buscar siempre grande, siempre pequeño o variar.
2. **Grande, mediano y pequeño:** tres grados de tamaño. Se puede practicar cualquiera de los tres o mezclarlos.
3. **Características:** tres opciones, con comparación **más**, **menos** o **mixta**. Se eligen las características desde la configuración.

4. **Capacidad y agua:** comparar cuánto contiene un recipiente y cuánto puede contener en total. Se eligen agua, capacidad o ambas preguntas, junto con más, menos o mixto.

Las 18 categorías del modo 3 son tamaño, altura, longitud, anchura, grosor, claridad del color, forma, superficie, limpieza, humedad, orden, abertura, contenido, cantidad, separación, distancia, inclinación y clima. Cada categoría tiene al menos dos variantes de imágenes; clima incluye sol/nubes, lluvia y nieve. La inclinación se describe con derecho frente a inclinado; por ejemplo: ¿cuál está más derecho?

Las comparaciones se apoyan en grados ordenados. Por ejemplo, menos delgado corresponde al cilindro más grueso cuando lo único que varía es su diámetro. En cantidad se pregunta dónde hay más/menos objetos; en distancia se nombra la referencia (casa o banco). Las preguntas usan es o está según corresponda a la característica.

## Selección y dinámica

Tocar una opción la ilumina con un halo dorado, una marca y la etiqueta Seleccionado. El halo rodea la tarjeta: conserva el color y el tamaño del dibujo, para no alterar la característica evaluada. La animación es breve y se desactiva con la preferencia de movimiento reducido, manteniendo el resplandor fijo.

Después se pulsa Revisar. Los errores permiten otra elección; los aciertos muestran una explicación, una estrella y el botón Siguiente. No hay avance automático. Las posiciones se mezclan por separado: el mediano no aparece siempre al centro. Cada ejercicio tiene una sola respuesta válida. Las rondas no repiten una imagen y, en modo 3, reparten las categorías antes de repetirlas.

Se eligen rondas de 4, 8 o 12 ejercicios. Si las categorías seleccionadas ofrecen menos imágenes, la ronda usa las disponibles y lo indica en configuración. No se permite dejar todas las categorías desactivadas.

## Imágenes

- Se conservaron los ocho pares originales de `imagenes/`.
- Se generaron **38 imágenes nuevas** con tres grados cada una, en `imagenes/caracteristicas/`. Cada archivo conserva sus tres paneles; la interfaz muestra cada panel por separado y mezcla su posición.
- Se reutilizan las seis ilustraciones transparentes de `../Ordenar_Objetos_Tamano/imagenes/` para ofrecer más familias en tamaño, usando escalas visuales progresivas. No se duplican sus archivos.
- El catálogo y la dirección de cada rasgo están en `caracteristicas.js`. Los prompts de los pares originales están en `prompts-imagenes.md`; los de las variantes nuevas y sus revisiones están en `prompts-caracteristicas.md`.

Las ilustraciones nuevas se generaron con la herramienta integrada de imágenes y se optimizaron a WebP. Se revisaron visualmente los tres grados y se corrigieron dos generaciones para conservar la cantidad de libros y eliminar una pelota adicional en distancia.

## Preferencias y compatibilidad

Se conserva la clave `mayorMenorObjetos.config.v1`. Se guardan modo, tamaño objetivo, tipo de comparación, categorías, cantidad, voz y ayuda. Las preferencias antiguas mayor/menor se migran a grande/pequeño. El nombre comparte `nombreNinoGabrielApps`. Si el navegador bloquea el almacenamiento, se puede seguir jugando.

Las pestañas cambian de modo inmediatamente. Cantidad, tamaño objetivo y categorías se aplican con Nueva ronda; voz y ayuda cambian de inmediato. La carga de imágenes permite reintentar y descarta respuestas de cargas antiguas al cambiar rápidamente de actividad.

Se mantienen créditos, referencia a Gabriel, controles de zoom y pantalla completa. Se comprobó el uso táctil, la adaptación a teléfono/tableta y zoom al 85 %, los cuatro modos, el guardado, la migración de preferencias y las respuestas únicas de todos los rasgos y comparadores.

## Recortes, escala y alineación

`recortes.js` define el área completa de cada dibujo sobre su archivo original. No se supone que los objetos estén dentro de mitades o tercios exactos: se localizan los espacios en blanco entre ellos. Las escenas y los grupos mantienen sus límites de panel originales.

Cada ejercicio utiliza un mismo lienzo, margen, línea de base y factor de escala para todas sus opciones. Los recortes se centran por su contenido visible; ningún dibujo se amplía por separado para llenar la tarjeta. Así se conservan las diferencias reales de tamaño, altura, longitud y anchura. Las tarjetas y sus etiquetas tienen medidas uniformes; seleccionar o corregir una opción no mueve el dibujo. Las cintas y otras ilustraciones muy anchas usan una tarjeta más baja para evitar espacio vacío excesivo.

Las 64 imágenes están medidas, incluidos los ocho pares anteriores, las seis ilustraciones transparentes reutilizadas y las doce escenas de capacidad. Para volver a medir después de cambiar una ilustración: ejecutar `tools/medir_recortes_objetos.cjs` con Node.js y Sharp. La opción `--revision` crea hojas temporales de inspección. La aplicación normal solo necesita los archivos estáticos y no ejecuta ese proceso.

Las escenas de clima se muestran más grandes y con un margen interior reducido. En teléfonos verticales se distribuyen en dos columnas con la tercera tarjeta centrada y del mismo ancho, para conservar la misma escala entre opciones. En horizontal se mantienen tres escenas lado a lado.

## Capacidad y cantidad de agua

El modo 4 incorpora 12 escenas originales en SVG con 36 recipientes: vasos, tazas, jarras, botellas, cuencos y matraces. Se conservan las diferentes formas y los tamaños físicos relativos al presentarlos. Todos están centrados y alineados por su base.

Cada recipiente tiene dos valores independientes en mililitros: agua actual y capacidad total. La respuesta se calcula con el valor preguntado, no con la altura del dibujo ni con el porcentaje que parece lleno. Cada escena tiene tres valores distintos en ambas medidas, por lo que las cuatro combinaciones (más/menos agua, más/menos capacidad) tienen una respuesta única. En modo mixto aparecen las cuatro preguntas equilibradas.

Las ilustraciones se producen con `tools/crear_recipientes_capacidad.cjs`. Los perfiles representan cuerpos de revolución; su radio se calcula a partir de su capacidad y altura, y la altura del agua se obtiene integrando secciones horizontales. La ilustración conserva el mismo factor de escala físico entre los tres recipientes de cada escena. El catálogo con capacidades y volúmenes es `capacidades.js`; las imágenes están en `imagenes/capacidad/`. Son recursos vectoriales locales y no requieren librerías al jugar.

La ayuda puede mostrar vasitos iguales de 100 mL, mililitros o ninguna medida. Solo se muestra el valor que se está comparando: Tiene para agua actual, Le caben para capacidad total. La elección de ayuda cambia inmediatamente; el tema de práctica se aplica en una nueva ronda. Ambas opciones se guardan junto con el resto de preferencias. Las figuras de los vasitos son iguales en todas las opciones y permiten comparar formas distintas con una unidad común.

La comprobación incluye 48 comparaciones posibles, escenas donde el recipiente con más agua no es el de mayor capacidad, rondas completas, preferencias y presentación vertical/horizontal con zoom.

## Llenado animado

Cada pregunta del modo 4 comienza con los tres recipientes vacíos. Tras una pausa breve, reciben agua a un caudal común de 100 mL/s (un vasito por segundo). En preguntas de capacidad se llenan hasta su capacidad total y cada chorro se detiene al llegar al borde; los recipientes menores terminan antes. En preguntas sobre agua actual, se detienen en los volúmenes propios del ejercicio.

La elección se habilita al finalizar. Durante el llenado, las medidas y los vasitos muestran el agua que ha entrado. Los vasitos se llenan uno a uno; un vasito parcialmente lleno representa exactamente el volumen restante después de los vasitos completos. Al terminar, la indicación corresponde al agua actual o a la capacidad total, según la pregunta. El botón Repetir animación permite comenzar de nuevo incluso durante el llenado, sin alterar las estrellas conseguidas ni una respuesta ya corregida. Se cancela el ciclo anterior antes de reiniciar.

`dibujos-capacidad.js` conserva las plantillas SVG vacías y curvas de volumen/altura precalculadas; lo genera la misma herramienta `tools/crear_recipientes_capacidad.cjs`. `animacion-capacidad.js` mueve únicamente el agua, la superficie y el chorro. Los recipientes mantienen su base, tamaño y centrado. Cada SVG utiliza identificadores únicos para que sus recortes y degradados no interfieran con los de las otras opciones.

Se utiliza un solo ciclo de animación, limitado a 30 actualizaciones por segundo, sin lecturas de diseño por fotograma. Se pausa al ocultar la página y continúa al volver; cambiar de modo, pregunta o ronda cancela los ciclos anteriores. Los cambios de orientación y zoom conservan el nivel porque la animación utiliza coordenadas vectoriales. Con movimiento reducido se muestran directamente los niveles finales después de la presentación en vacío.

## Recipientes con profundidad y vasitos proporcionales

Los recipientes tienen boca y fondo ovalados, bases curvas, reflejos de vidrio y superficies de agua elípticas. La proyección ovalada de la base no modifica las capacidades asignadas: las curvas de llenado siguen calculándose a partir del volumen y el perfil interior. Las bases de todos los recipientes se apoyan en la misma altura del dibujo. En vasos, jarras, tazas y matraces se acentúan las diferencias visuales de altura, conservando sus capacidades y cantidades de agua.

Todos los vasitos de referencia son cilindros iguales de 100 mL. Sus dimensiones en pantalla son iguales entre opciones; el número de vasitos depende del volumen objetivo. Se presentan centrados, con hasta seis por fila (cuatro en teléfono). Cada fotograma sincroniza su agua con la del recipiente: 250 mL equivalen a dos vasitos completos y la mitad del tercero. Solo se actualizan las partes que cambian, sin reconstruir los vasitos durante la animación. Los mililitros, cuando se escoge esa ayuda, también aumentan progresivamente.

Los archivos de la aplicación incluyen una versión de recursos para que el navegador cargue juntos el nuevo dibujo, sus recortes y la animación actualizada.

## Niveles de agua y capacidad

La configuración del modo 4 permite elegir Nivel 1 (diferencias de 3 vasitos), Nivel 2 (2 vasitos) o Nivel 3 (1 vasito). Un vasito equivale a 100 mL. En cada ejercicio, al ordenar los tres valores, la distancia entre valores consecutivos es exactamente la indicada. Esto se cumple tanto para el agua que contienen como para la capacidad total. La elección se guarda localmente y se aplica al iniciar una nueva ronda; las cuentas, las figuras, el agua y la respuesta correcta utilizan el mismo catálogo.

Se generan 12 escenas por nivel. En cada una se utiliza la misma forma y anchura para los tres recipientes y se hace crecer la altura en proporción a su capacidad. Con la misma escala física para las tres opciones, el nivel 1 presenta diferencias de tamaño más marcadas que el 2, y el 2 más que el 3. El radio y el nivel del agua se calculan según el volumen, sin agrandar arbitrariamente un dibujo. Se conservan además las 12 escenas anteriores en la opción Variado, con comparaciones de formas y cantidades más diversas: 48 escenas en total. Las rondas de cada nivel no repiten escena. El nivel inicial es el 1, con diferencias más fáciles de distinguir.

## Estructuras iguales o mixtas

La opción Estructura de los recipientes ofrece Misma estructura (predeterminada) y Mixtos. La primera filtra ejercicios donde las tres formas coinciden. Mixtos alterna de forma equilibrada ejercicios de igual forma y ejercicios con formas diferentes, sin repetir una escena dentro de la ronda. Se aplica al empezar una nueva ronda y se guarda en el navegador, independientemente del nivel, del tipo de pregunta y de la ayuda escogida.

Se agregan 12 escenas de formas diferentes a cada nivel: ahora hay 24 por nivel, más las 12 anteriores de Variado, para un total de 84. En los nuevos ejercicios mixtos se conserva el crecimiento de altura con la capacidad, y el radio se recalcula para el perfil de cada forma. Los valores de agua y capacidad mantienen las diferencias exactas de 3, 2 o 1 vasito. La escala física continúa siendo común a los tres recipientes. Los acabados añaden brillo suave del vidrio y reflejos en el borde; son capas SVG sin filtros ni animaciones adicionales.


## Idioma y voz

La configuración permite español o inglés, voz femenina o masculina y velocidad de 0.7x a 1.5x en pasos de 0.1x. Las preferencias se guardan localmente; cada idioma recuerda su voz. Se prioriza la voz femenina más natural disponible. Las voces no ofrecidas por el navegador se indican como no disponibles. Véase [la documentación compartida](../idioma-voz.md).
# Distribución adaptable

Los cuatro modos comparten `adaptable.css` y `adaptable.js`. En vertical, la guía se compacta sobre el juego; en teléfonos horizontales, los modos, las ayudas y el control de llenado pasan al lateral. En pantallas amplias se aprovecha el ancho disponible. La altura de las ilustraciones se calcula con el espacio útil y se vuelve a ajustar al girar, cambiar el zoom, abrir ajustes o cambiar los textos, sin modificar la escala relativa de las opciones. En pantallas muy pequeñas se conserva el desplazamiento vertical para mantener dibujos y controles legibles.

`tools/probar_comparar_adaptable.cjs` verifica los cuatro modos en nueve tamaños entre 360×640 y 1920×1080, las proporciones, la ausencia de desbordamiento horizontal, la estabilidad del ajuste, los aciertos y la configuración, además de inglés y zoom de 85%, 125% y 150%.
