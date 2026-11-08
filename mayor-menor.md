# Mayor y menor

La aplicación del índice está en `Mayor_Menor.html` (Caja mayor y caja menor). Conserva la dinámica de arrastrar dos números al lado correcto de `>` o `<`.

- De uno a cuatro ejercicios por página, con separación adaptable entre tarjetas, cajas y fichas.
- De una a seis cifras. Como antes, al menos el 75% de los números tienen la cantidad de cifras elegida; los restantes usan entre una y esa cantidad. No se repiten números dentro de una página.
- Ayuda en las cajas y lectura automática mediante casillas de configuración. Se conserva el botón de escuchar cada comparación.
- Números en Verdana negrita, sin compresión horizontal; las fichas tienen cifras blancas con borde negro. Cada ejercicio utiliza una fuente uniforme que se ajusta al número más largo y al espacio disponible.
- Idioma español/inglés, selección de voces reales y velocidad de 0.7x a 1.5x. La disponibilidad de voces depende del navegador; se prioriza una femenina natural disponible.

En vertical, título y herramientas quedan arriba. En horizontal quedan en una columna izquierda. Solo el panel de herramientas tiene desplazamiento: la instrucción, los cuatro ejercicios, el banco y Revisar se mantienen dentro del alto útil. Abrir la configuración no desplaza la actividad. Las fichas arrastradas compensan el zoom y permanecen centradas debajo del dedo; cancelar el arrastre no elimina una respuesta.

Las preferencias se guardan en `mayorMenor.config.v1` (cantidad, cifras, ayuda y lectura) e `idiomaVoz.mayorMenor.v1` (idioma, velocidad y voz por idioma). El nombre utiliza `nombreNinoGabrielApps`. Se tolera el bloqueo del almacenamiento y se limitan valores inválidos a los rangos permitidos.

Archivos auxiliares: `mayor-menor-ajustes.js`, `mayor-menor-adaptable.css` y `mayor-menor-textos.js`; reutiliza el módulo compartido de idioma y voz.

`tools/probar_mayor_menor.cjs` comprueba cuatro ejercicios de seis cifras con ayuda en nueve tamaños de pantalla, siete valores de zoom (50–200%), arrastre táctil, generación numérica, validación, lecturas inglesas, preferencias tras recarga y almacenamiento bloqueado. También entra y sale de pantalla completa en tres tamaños con cuatro valores de zoom y abre/desplaza la configuración sin sacar el juego de la vista. La prueba compartida de idioma/voz comprueba que la ampliación del módulo no altera las otras tres aplicaciones.
