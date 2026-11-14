# Reglas del proyecto

## Protocolo de ajuste

Al comenzar a crear o modificar cualquier aplicación, aplicar este protocolo como parte inicial del trabajo autorizado:

1. **Voz:** permitir escoger voz y velocidad de reproducción. Ofrecer hasta tres voces femeninas y tres masculinas reales por idioma, priorizando las más naturales y una femenina como predeterminada; indicar las voces no disponibles sin simularlas. Incluir velocidades de 0.7x a 1.5x en pasos de 0.1x.
2. **Idioma:** ofrecer español e inglés. El idioma elegido debe aplicarse a textos, instrucciones, ayudas, respuestas, etiquetas accesibles y lecturas; las voces deben corresponder al idioma activo.
3. **Pantalla:** adaptar la actividad a PC, tabletas y teléfonos, en vertical y horizontal, con zoom y pantalla completa. En vertical, poner título, instrucciones, configuración y demás herramientas arriba y aprovechar todo el ancho para la actividad. En horizontal, poner todas esas herramientas, incluido el título, en una columna izquierda y aprovechar toda la altura para la actividad.
4. **Visibilidad:** mantener visibles la instrucción de la actividad, los ejercicios/objetos y sus espacios de respuesta, hasta Revisar o el siguiente control principal. Abrir o desplazar la configuración no debe sacar el ejercicio de la vista. Si hace falta, dar desplazamiento propio al panel de herramientas; adaptar las ilustraciones sin deformarlas ni alterar su escala comparativa.
5. **Persistencia:** guardar localmente las preferencias, incluidas voz por idioma, velocidad, idioma, ayudas y opciones de cada actividad. Reutilizar las preferencias existentes y tolerar el bloqueo del almacenamiento sin impedir jugar.
6. **Comprobación:** verificar ambas orientaciones, distintos tamaños de pantalla, el zoom de la aplicación (50% a 200%), y entrada/salida de pantalla completa. Comprobar expresamente que el área del ejercicio y el control principal quedan dentro de la vista, que los controles no se superponen, y que el arrastre táctil sigue al dedo con zoom cuando corresponda.

Aplicar el protocolo progresivamente a las aplicaciones que se trabajen. No supone modificar de una vez todas las aplicaciones del repositorio. Las peticiones específicas de cada actividad se suman a este protocolo.

## Aprovechar el espacio horizontal disponible

- En toda aplicación nueva o modificada, incluido el índice, el contenido principal debe aprovechar todo el ancho disponible del navegador, con márgenes laterales pequeños y adaptables. Evitar límites fijos de `max-width` en el contenedor principal que dejen grandes franjas vacías en pantallas anchas.
- Distribuir tarjetas, paneles y controles con diseños flexibles o cuadrículas adaptables: ajustar las columnas al espacio disponible y repartir el ancho sobrante. No fijar una cantidad de columnas que desperdicie espacio útil.
- Mantener legibles los textos y utilizables los controles táctiles. Se permiten límites de ancho en elementos interiores concretos, como párrafos, diálogos o imágenes, cuando ayuden a la lectura o preserven sus proporciones; estos límites no deben restringir el ancho de toda la aplicación.
- Adaptar la distribución a teléfonos y tabletas, en orientación vertical y horizontal, y a pantallas grandes. Evitar desbordamientos y desplazamiento horizontal, incluso al cambiar el zoom.
- Al crear o modificar una aplicación, comprobar su aprovechamiento horizontal y su adaptación a distintos tamaños. Aplicar esta regla progresivamente a las aplicaciones que se trabajen; no implica modificar todas las aplicaciones existentes en una sola tarea.
- Excepción acordada para el pareo de Reconocer números: usar dos columnas laterales compactas del mismo ancho, con una tercera columna central reservada a las líneas. Todas las tarjetas de números y palabras deben tener el mismo ancho y alto, tomando como referencia el contenido más largo y el espacio disponible. Conservar margen interior en las columnas y una separación pequeña entre las etiquetas y los cohetes o planetas. No estirar las columnas para llenar la pantalla: priorizar simetría y proximidad entre cada etiqueta y su punto de unión.
- En el pareo, cuando haya pocos elementos, mantener una separación vertical moderada y columnas compactas; no repartir tres o cuatro pares por toda la altura de la pantalla. Centrar verticalmente el bloque cuando sobre espacio. Con listas más grandes, adaptar la distribución para aprovechar la altura disponible y mantener visibles los elementos.
- Reconocer números está en `Reconocer_Numeros/reconocer_numeros.html`, con sus recursos en la misma carpeta. En el corral, conservar el número como etiqueta separada de la imagen: el animal puede cambiar de orientación, pero el número siempre debe permanecer derecho. Reutilizar los cuatro estilos y sus GIF de caminar/reposo, sin crear un archivo distinto por cada número.
- En el modo Corral, distinguir visualmente el potrero de césped, la cerca y el corral de tierra. El punto para soltar la vaca es la entrada marcada: cuando es correcta, debe caminar hasta una plaza del corral antes de quedar en reposo, sin aparecer directamente en su destino.
- Ajustar la escena del Corral a la altura útil y al ancho de la pantalla, sin una altura mínima fija que la saque de la vista. En horizontal, colocar la guía al lado y el corral de tierra a la derecha del potrero; en vertical, dejar el corral debajo. Redistribuir vacas y plazas al girar o cambiar el zoom, conservando las capturas y el espacio libre de la entrada.

## Orden de las actividades en el índice

- Mantener las aplicaciones de cada materia en una progresión sugerida de aprendizaje: primero habilidades básicas y luego actividades que integren más conocimientos. Al añadir una aplicación al índice, asignarle su lugar en `secuenciaAprendizaje`, su materia y sus filtros temáticos. Conservar esta secuencia al buscar o filtrar.

## Configuración en los ajustes individuales

Al ajustar una aplicación individualmente, usar un formulario adicional para idioma, voz, velocidad, opciones de práctica, ejercicios por ronda y ayudas. Aplicar los cambios al salir del formulario. Recordar esta petición al iniciar los siguientes ajustes individuales si no se menciona. En la barra de herramientas: título, «Así jugamos», modos, Configuración, Nueva ronda, Revisar y créditos al final; arriba en vertical y a la izquierda en horizontal. Evitar duplicar Nueva ronda.

- El nombre editable del niño debe aparecer inmediatamente debajo del título de la aplicación, reutilizando el campo existente y el nombre guardado. No duplicarlo dentro de Configuración.
- En los formularios de configuración, colocar idioma, voz y velocidad al final de las opciones. Aplicar esta ubicación en las aplicaciones que se ajusten de aquí en adelante.

- Los créditos y la dedicatoria deben permanecer al final del documento, fuera de las barras de herramientas y del área del ejercicio. Pueden quedar por debajo de la pantalla; no reservarles espacio que reduzca la actividad o esconda sus controles.
