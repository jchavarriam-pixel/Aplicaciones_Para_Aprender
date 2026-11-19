# Mayor y menor

La aplicación del índice está en `Mayor_Menor.html` (Caja mayor y caja menor). Conserva la dinámica de arrastrar dos números al lado correcto de `>` o `<`.

Abre directamente en el ejercicio con las preferencias guardadas y la configuración plegada. Si no existe un nombre guardado, usa Gabriel, que puede cambiarse debajo del título. No hay pantalla inicial ni botón para empezar. Los cambios de cantidad, cifras, ayuda, lectura, idioma, voz y velocidad se aplican al cerrar el formulario de configuración y generan una nueva ronda. El botón **Nueva ronda** conserva la ubicación de Nueva página.

- De uno a cuatro ejercicios por página, con separación adaptable entre tarjetas, cajas y fichas.
- De una a seis cifras. Como antes, al menos el 75% de los números tienen la cantidad de cifras elegida; los restantes usan entre una y esa cantidad. No se repiten números dentro de una página.
- Ayuda en las cajas y lectura automática mediante casillas de configuración. Se conserva el botón de escuchar cada comparación.
- Números en Verdana negrita, sin compresión horizontal; las fichas tienen cifras blancas con borde negro. Cada ejercicio utiliza una fuente uniforme que se ajusta al número más largo y al espacio disponible.
- Idioma español/inglés, selección de voces reales y velocidad de 0.7x a 1.5x. La disponibilidad de voces depende del navegador; se prioriza una femenina natural disponible.

En vertical, título y herramientas quedan arriba. En horizontal quedan en una columna izquierda. Solo el panel de herramientas tiene desplazamiento: la instrucción, los cuatro ejercicios, el banco y Revisar se mantienen dentro del alto útil. Abrir la configuración no desplaza la actividad. Las fichas arrastradas compensan el zoom y permanecen centradas debajo del dedo; cancelar el arrastre no elimina una respuesta.

Las tarjetas tienen altura natural limitada y el conjunto se centra cuando sobra espacio. Las fichas son rectángulos horizontales compactos, limitados por el tamaño interior real de sus destinos; no se estiran para llenar sus filas. La ayuda se muestra en las cajas vacías y deja espacio al número cuando se completa la caja. Con poco espacio, el mensaje auxiliar pasa al panel de herramientas.

La celebración comparte las escenas de cohete, volcán, tren y globo con «Mayor, Menor o Igual». Se inicia con el control propio de cada escena y ofrece «Nueva ronda» en todo momento. La configuración de Caja mayor y caja menor guarda de forma independiente la escena elegida, el sonido y la duración de la felicitación.

Las preferencias se guardan en `mayorMenor.config.v1` (cantidad, cifras, ayuda y lectura) e `idiomaVoz.mayorMenor.v1` (idioma, velocidad y voz por idioma). El nombre utiliza `nombreNinoGabrielApps`. Se tolera el bloqueo del almacenamiento y se limitan valores inválidos a los rangos permitidos.

Archivos auxiliares: `mayor-menor-ajustes.js`, `mayor-menor-adaptable.css`, `mayor-menor-panel.css` y `mayor-menor-textos.js`. Reutiliza los módulos compartidos de idioma, voz y celebraciones.

`tools/probar_mayor_menor.cjs` comprueba cuatro ejercicios de seis cifras con ayuda en nueve tamaños de pantalla, siete valores de zoom (50–200%), arrastre táctil, generación numérica, validación, lecturas inglesas, preferencias tras recarga y almacenamiento bloqueado. También entra y sale de pantalla completa en tres tamaños con cuatro valores de zoom y abre/desplaza la configuración sin sacar el juego de la vista. La prueba compartida de idioma/voz comprueba que la ampliación del módulo no altera las otras tres aplicaciones.

## Panel actualizado

El panel usa un encabezado azul suave, el nombre compartido debajo del título, una guía breve de tres pasos, un resumen de la ronda y botones con una jerarquía uniforme. El selector aclara el límite: «Hasta 1 dígito», «Hasta 2 dígitos», …, «Hasta 6 dígitos», con las traducciones «Up to …» en inglés. Los valores guardados y la generación numérica conservan su funcionamiento.

En vertical, el alto del panel se calcula a partir del espacio real que necesitan las tarjetas y las fichas, sin sumar dos veces los elementos de una misma fila. Con tres o cuatro ejercicios, el botón existente de Configuración se coloca como un engranaje junto al título para mantenerlo accesible; no se crea un segundo botón. El panel puede desplazarse si necesita más espacio. Se priorizan los números legibles y el control Revisar.

`tools/probar_mayor_menor_panel.cjs` verifica los textos en ambos idiomas, la aplicación de preferencias al cerrar, siete tamaños con zoom del 50 % al 200 %, fichas legibles en vertical, acceso a Configuración, arrastre táctil, rango numérico, persistencia, nombre compartido, pantalla completa, panel plegable y almacenamiento bloqueado.
