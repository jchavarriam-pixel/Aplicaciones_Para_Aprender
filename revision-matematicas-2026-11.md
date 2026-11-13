# Revisión de Matemática — noviembre de 2026

Punto de control previo publicado: `control-matematicas-2026-11-12`, commit `83a7afe`.
Revisión final: 13 de noviembre de 2026.

## Alcance

Nueve aplicaciones adaptadas, conservando los enlaces y la progresión del índice:

- Mayor, menor o igual.
- Ordenar números.
- Antecesor y sucesor.
- Aprende a restar quitando.
- Sumas y restas.
- Sumas y restas por valor posicional.
- Situaciones problema.
- Laboratorio de sólidos 3D.
- Fracciones propias (cuatro actividades).

Las cuatro aplicaciones de Matemática previamente adaptadas conservan su implementación. Se comprobó la compatibilidad del módulo compartido de idioma y voz.

## Cambios

- Coordenadas de arrastre compensadas por el zoom. Se eliminaron transiciones en las figuras arrastradas que producían retraso respecto al dedo.
- Pareos de fracciones y sólidos con líneas alineadas con sus puntos de unión.
- Español e inglés, voces disponibles del dispositivo, velocidad de 0.7x a 1.5x y preferencias locales independientes por aplicación. Se conservan las preferencias previas de idioma de problemas y sólidos cuando existen.
- Herramientas arriba en vertical y a la izquierda en horizontal, con desplazamiento propio para mantener el ejercicio y su control principal visibles al abrir ajustes.
- Distribuciones compactas, sin deformar figuras. Antecesor y sucesor pagina las secuencias cuando hace falta y conserva respuestas al cambiar de página.
- Almacenamiento protegido: su bloqueo no impide iniciar las actividades.
- Créditos compartidos que se reorganizan según el espacio disponible. Los autores ya no quedan comprimidos en una columna de letras. Se conserva la dedicatoria a Gabriel.

## Comprobación realizada

Chrome automatizado mediante Playwright, archivos locales, con emulación táctil de Chrome. No sustituye una prueba física en cada modelo de tableta o teléfono.

- Distribución: 360×640, 640×360, 768×1024, 1024×768 y 1920×1080; zoom 50%, 85%, 100%, 150% y 200%, con comprobaciones adicionales a 125% en arrastre.
- Entrada y salida de pantalla completa, en ambas orientaciones, con apertura de configuración y verificación de que el control principal continúa dentro de la vista.
- Arrastre táctil, posición de la figura bajo el dedo y entrega a la casilla; pareos de fracciones y sólidos, en pantalla normal y completa a distintos zooms.
- Ordenar 3, 8 y 15 números; secuencias de cinco cifras con distractores, teclado y respuesta mixta; operaciones de cuatro cifras; modalidades de fracciones con sobrantes y respuestas visuales de sólidos.
- Conservación de respuestas al paginar secuencias y validación de respuestas de suma, resta y valor posicional.
- Idioma y velocidad tras recargar; lectura con idioma correspondiente; funcionamiento con almacenamiento bloqueado.
- Capturas de teléfono y tableta revisadas; errores de JavaScript y textos estáticos en inglés comprobados.
- Créditos en paneles estrechos, índice y aplicaciones revisadas, a distintos zooms.
- Regresión de idioma-voz.js en Explora y compara, Ordenar objetos y Reconocer números.

Pruebas reproducibles: tools/probar_matematicas_*.cjs, tools/probar_creditos_adaptables.cjs y tools/probar_idioma_voz.cjs. Requieren Node, Playwright y Chrome instalado en la ruta indicada en los archivos.

Las voces naturales dependen de las instaladas o proporcionadas por el navegador. La interfaz indica las que no están disponibles, sin simularlas.
