/*
============================================================
ESCENAS EXTERNAS PARA Situaciones_Problema_Sumas_Restas.html
============================================================

Este archivo debe estar en la MISMA carpeta que el HTML principal.

Para agregar una escena nueva:
1. Copie el bloque de ejemplo.
2. Cambie el id, textos, objetos y funciones visuales.
3. Mantenga registerScene({...}) al final de cada escena.

IMPORTANTE:
- No use <script> dentro de este archivo.
- Este archivo es JavaScript puro.
- En GitHub Pages funcionará si se llama exactamente: escenas.js
*/

(function () {
  function addCookieSceneStyles() {
    if (document.getElementById("cookieSceneStyles")) return;

    const style = document.createElement("style");
    style.id = "cookieSceneStyles";
    style.textContent = `
      .miniPlate {
        position: absolute;
        left: 30px;
        top: 84px;
        width: 92px;
        height: 42px;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, #ffffff 0 42%, #bfdbfe 43% 100%);
        border: 5px solid #60a5fa;
        box-shadow: 0 8px 12px rgba(15,23,42,.14);
      }

      .miniCookie {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #b45309;
        border: 3px solid #78350f;
        box-shadow: inset 4px 4px rgba(255,255,255,.18), 0 4px 6px rgba(15,23,42,.18);
        z-index: 4;
      }

      .miniCookie::before {
        content: "";
        position: absolute;
        left: 4px;
        top: 5px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #451a03;
        box-shadow: 8px 2px #451a03, 5px 9px #451a03;
      }

      .cookiePlate {
        position: absolute;
        left: 14%;
        top: 44%;
        width: 44%;
        height: 22%;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, #ffffff 0 44%, #dbeafe 45% 72%, #60a5fa 73% 100%);
        border: 6px solid #2563eb;
        z-index: 5;
        box-shadow: 0 12px 18px rgba(15,23,42,.15), inset 0 0 0 8px rgba(255,255,255,.45);
      }

      .cookiePiece {
        position: absolute;
        width: clamp(25px, 4.3vw, 42px);
        height: clamp(25px, 4.3vw, 42px);
        border-radius: 50%;
        background: #b45309;
        border: 4px solid #78350f;
        transform: translate(-50%, -50%);
        z-index: 12;
        box-shadow: inset 5px 5px rgba(255,255,255,.18), 0 7px 9px rgba(15,23,42,.18);
        will-change: left, top, transform, opacity;
      }

      .cookiePiece::before {
        content: "";
        position: absolute;
        left: 24%;
        top: 28%;
        width: 10%;
        height: 10%;
        border-radius: 50%;
        background: #451a03;
        box-shadow:
          13px 3px #451a03,
          8px 15px #451a03,
          20px 17px #451a03;
      }
    `;
    document.head.appendChild(style);
  }

  function renderGalletasPreview(box) {
    addCookieSceneStyles();
    box.innerHTML = `
      <div class="miniPlate"></div>
      <span class="miniCookie" style="left:55px;top:89px"></span>
      <span class="miniCookie" style="left:78px;top:84px"></span>
      <span class="miniCookie" style="left:98px;top:96px"></span>
      <span class="miniCookie" style="left:66px;top:106px"></span>
    `;
  }

  const cookiePositions = [
    { x: 27, y: 50 }, { x: 34, y: 48 }, { x: 42, y: 50 }, { x: 49, y: 53 },
    { x: 31, y: 57 }, { x: 39, y: 58 }, { x: 47, y: 60 }, { x: 25, y: 61 },
    { x: 36, y: 54 }, { x: 44, y: 56 }, { x: 53, y: 59 }, { x: 29, y: 55 }
  ];

  function createCookie(id, pos) {
    const cookie = document.createElement("div");
    cookie.className = "cookiePiece";
    cookie.dataset.id = id;
    cookie.style.left = `${pos.x}%`;
    cookie.style.top = `${pos.y}%`;
    return cookie;
  }

  function renderGalletasScene() {
    addCookieSceneStyles();
    addIndoorKitchen();

    const table = document.createElement("div");
    table.className = "topTable";

    const plate = document.createElement("div");
    plate.className = "cookiePlate";

    scene.append(table, plate);

    state.movingIds = shuffle(Array.from({ length: state.total }, (_, i) => i)).slice(0, state.change);

    for (let i = 0; i < state.total; i++) {
      scene.appendChild(createCookie(i, cookiePositions[i % cookiePositions.length]));
    }
  }

  function animateGalletasTaken() {
    if (state.animated) return;
    state.animated = true;

    feedback.className = "feedback";
    feedback.textContent = isEnglish()
      ? `Watch how ${state.change === 1 ? "one cookie is taken away" : "some cookies are taken away"}. The cookies left on the plate are the answer.`
      : `Observa cómo ${state.change === 1 ? "se retira una galleta" : "se retiran algunas galletas"}. Las galletas que quedan en el plato son la respuesta.`;

    updateText();

    state.movingIds.forEach((id, index) => {
      const cookie = scene.querySelector(`.cookiePiece[data-id="${id}"]`);
      if (!cookie) return;

      const delay = index * 230;
      setTimeout(() => {
        const anim = cookie.animate([
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0 },
          { transform: "translate(90px, -80px) scale(.9) rotate(12deg)", opacity: .9, offset: .55 },
          { transform: "translate(160px, -130px) scale(.55) rotate(28deg)", opacity: 0, offset: 1 }
        ], {
          duration: 1100,
          easing: "ease-in-out",
          fill: "forwards"
        });

        anim.onfinish = () => {
          cookie.style.opacity = "0";
        };
      }, delay + 60);
    });

    scene.querySelectorAll(".cookiePiece").forEach(cookie => {
      if (!state.movingIds.includes(Number(cookie.dataset.id))) {
        cookie.animate([
          { transform: "translate(-50%, -50%) scale(1)" },
          { transform: "translate(-50%, -50%) scale(1.08)" },
          { transform: "translate(-50%, -50%) scale(1)" }
        ], { duration: 850, delay: 1000, easing: "ease-in-out" });
      }
    });

    speak(state.currentProblem.speak(getName(), state.total, state.change));
  }

  registerScene({
    id: "galletasPlato",
    operation: "subtraction",

    itemSingular: "galleta",
    itemPlural: "galletas",
    itemSingularEn: "cookie",
    itemPluralEn: "cookies",

    minTotal: 5,
    maxTotal: 12,
    minChange: 1,
    maxChange: 6,

    texts: {
      es: {
        title: "Galletas en el plato",
        short: "Algunas galletas se retiran del plato. Hay que contar cuántas quedan.",
        badge: "🍪 Resta",
        animateLabel: "🍪 Ver cómo se retiran",
        sceneTitle: "Observa cuántas galletas quedan en el plato",
        answerQuestion: "¿Cuántas galletas quedan en el plato?"
      },
      en: {
        title: "Cookies on the plate",
        short: "Some cookies are taken from the plate. Count how many are left.",
        badge: "🍪 Subtraction",
        animateLabel: "🍪 Watch cookies being taken",
        sceneTitle: "Watch how many cookies are left on the plate",
        answerQuestion: "How many cookies are left on the plate?"
      }
    },

    renderPreview: renderGalletasPreview,
    renderScene: renderGalletasScene,
    animate: animateGalletasTaken,

    story: (name, total, change, highlight = false) => {
      if (isEnglish()) {
        return `On a plate ${thereIs(total)} <strong>${total}</strong> ${itemWord(problems.galletasPlato, total)}, and <strong>${change}</strong> ${itemWord(problems.galletasPlato, change)} <span class="${highlight ? "keyAction" : ""}">are taken away</span>. How many cookies are left on the plate?`;
      }
      return `En un plato hay <strong>${total}</strong> ${itemWord(problems.galletasPlato, total)} y <span class="${highlight ? "keyAction" : ""}">se retiran</span> <strong>${change}</strong> ${itemWord(problems.galletasPlato, change)}. ¿Cuántas galletas quedan en el plato?`;
    },

    speak: (name, total, change) => {
      if (isEnglish()) {
        return `On a plate ${thereIs(total)} ${total} ${itemWord(problems.galletasPlato, total)}, and ${change} ${itemWord(problems.galletasPlato, change)} are taken away. How many cookies are left on the plate?`;
      }
      return `En un plato hay ${total} ${itemWord(problems.galletasPlato, total)} y se retiran ${change} ${itemWord(problems.galletasPlato, change)}. ¿Cuántas galletas quedan en el plato?`;
    },

    hintData: (total, change) => isEnglish()
      ? `Start amount: ${thereIs(total)} <strong>${total}</strong> ${itemWord(problems.galletasPlato, total)} on the plate. Change: <strong>${change}</strong> ${itemWord(problems.galletasPlato, change)} are taken away.`
      : `Dato inicial: hay <strong>${total}</strong> ${itemWord(problems.galletasPlato, total)} en el plato. Cambio: se retiran <strong>${change}</strong> ${itemWord(problems.galletasPlato, change)}.`,

    hintKeyword: () => isEnglish()
      ? `The key words are <strong>taken away</strong>. When something is taken away, the amount decreases.`
      : `La palabra clave es <strong>se retiran</strong>. Cuando se retira algo, la cantidad disminuye.`,

    hintOperation: (total, change) => isEnglish()
      ? `Because the amount decreases, use <strong>subtraction</strong>: <strong>${total} − ${change}</strong>.`
      : `Como la cantidad disminuye, se usa una <strong>resta</strong>: <strong>${total} − ${change}</strong>.`
  });
})();



/*
============================================================
ESCENA NUEVA: LÁPICES EN LA MESA
============================================================
*/

function addPencilSceneStyles() {
  if (document.getElementById("pencilSceneStyles")) return;

  const style = document.createElement("style");
  style.id = "pencilSceneStyles";
  style.textContent = `
    .miniPencil {
      position: absolute;
      width: 44px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(90deg, #facc15 0 72%, #fef3c7 72% 84%, #78350f 84% 100%);
      border: 2px solid #92400e;
      z-index: 5;
      transform: rotate(-12deg);
    }

    .pencilTable {
      position: absolute;
      left: 12%;
      top: 56%;
      width: 68%;
      height: 18%;
      border-radius: 24px 24px 14px 14px;
      background: linear-gradient(#fbbf24, #d97706);
      border: 6px solid #92400e;
      z-index: 3;
      box-shadow: 0 14px 20px rgba(15,23,42,.18);
    }

    .pencilObject {
      position: absolute;
      width: clamp(48px, 7vw, 74px);
      height: clamp(11px, 1.6vw, 17px);
      border-radius: 999px;
      background: linear-gradient(90deg, #facc15 0 72%, #fef3c7 72% 84%, #78350f 84% 100%);
      border: 3px solid #92400e;
      transform: translate(-50%, -50%) rotate(var(--rot, -10deg));
      z-index: 12;
      box-shadow: 0 6px 8px rgba(15,23,42,.18);
      will-change: left, top, transform, opacity;
    }

    .pencilObject::before {
      content: "";
      position: absolute;
      left: -10%;
      top: 12%;
      width: 16%;
      height: 76%;
      clip-path: polygon(0 50%, 100% 0, 100% 100%);
      background: #fde68a;
      border-left: 3px solid #92400e;
    }

    .pencilObject::after {
      content: "";
      position: absolute;
      right: -7%;
      top: 8%;
      width: 12%;
      height: 84%;
      border-radius: 999px;
      background: #fca5a5;
      border: 2px solid #be123c;
    }
  `;
  document.head.appendChild(style);
}

function renderLapicesPreview(box) {
  addPencilSceneStyles();

  box.innerHTML = `
    <div class="miniRoad" style="background:#fde68a;height:46%;"></div>
    <div class="miniPencil" style="left:38px;top:82px;"></div>
    <div class="miniPencil" style="left:58px;top:100px;transform:rotate(8deg);"></div>
    <div class="miniPencil" style="left:78px;top:84px;transform:rotate(-18deg);"></div>
    <div class="miniPencil" style="left:96px;top:103px;transform:rotate(14deg);"></div>
  `;
}

const pencilTablePositions = [
  { x: 29, y: 58, r: -12 },
  { x: 39, y: 61, r: 9 },
  { x: 49, y: 58, r: -6 },
  { x: 59, y: 62, r: 13 },
  { x: 35, y: 68, r: -18 },
  { x: 45, y: 70, r: 6 },
  { x: 55, y: 69, r: -9 },
  { x: 65, y: 68, r: 15 },
  { x: 25, y: 66, r: 10 },
  { x: 72, y: 60, r: -15 },
  { x: 32, y: 73, r: 4 },
  { x: 62, y: 74, r: -8 },
  { x: 50, y: 74, r: 12 },
  { x: 70, y: 72, r: -4 }
];

const pencilOutsidePositions = [
  { x: 83, y: 42, r: -10 },
  { x: 88, y: 49, r: 8 },
  { x: 82, y: 56, r: -16 },
  { x: 90, y: 62, r: 12 },
  { x: 84, y: 68, r: -6 },
  { x: 91, y: 73, r: 15 }
];

function createPencil(id, pos, extraClass = "") {
  const pencil = document.createElement("div");
  pencil.className = `pencilObject ${extraClass}`.trim();
  pencil.dataset.id = id;
  pencil.style.left = `${pos.x}%`;
  pencil.style.top = `${pos.y}%`;
  pencil.style.setProperty("--rot", `${pos.r || 0}deg`);
  return pencil;
}

function renderLapicesScene() {
  addPencilSceneStyles();
  addIndoorKitchen();

  const table = document.createElement("div");
  table.className = "pencilTable";
  scene.appendChild(table);

  state.movingIds = [];

  for (let i = 0; i < state.total; i++) {
    const pos = pencilTablePositions[i % pencilTablePositions.length];
    scene.appendChild(createPencil(i, pos));
  }

  for (let i = 0; i < state.change; i++) {
    const id = state.total + i;
    state.movingIds.push(id);
    const pos = pencilOutsidePositions[i % pencilOutsidePositions.length];
    scene.appendChild(createPencil(id, pos, "newPencil"));
  }
}

function animateLapicesArrive() {
  if (state.animated) return;
  state.animated = true;

  feedback.className = "feedback";
  feedback.textContent = isEnglish()
    ? `Watch how ${state.change === 1 ? "one pencil arrives" : "some pencils arrive"}. The pencils on the table are the answer.`
    : `Observa cómo ${state.change === 1 ? "llega un lápiz" : "llegan algunos lápices"}. Los lápices que quedan en la mesa son la respuesta.`;

  updateText();

  state.movingIds.forEach((id, index) => {
    const pencil = scene.querySelector(`.pencilObject[data-id="${id}"]`);
    if (!pencil) return;

    const target = pencilTablePositions[(state.total + index) % pencilTablePositions.length];
    const delay = index * 240;

    setTimeout(() => {
      const anim = pencil.animate([
        {
          left: pencil.style.left,
          top: pencil.style.top,
          transform: "translate(-50%, -50%) rotate(0deg) scale(1)",
          opacity: 1,
          offset: 0
        },
        {
          left: "72%",
          top: "48%",
          transform: "translate(-50%, -50%) rotate(12deg) scale(1.05)",
          opacity: 1,
          offset: .45
        },
        {
          left: `${target.x}%`,
          top: `${target.y}%`,
          transform: `translate(-50%, -50%) rotate(${target.r || 0}deg) scale(1)`,
          opacity: 1,
          offset: 1
        }
      ], {
        duration: 1200,
        easing: "cubic-bezier(.2,.82,.25,1)",
        fill: "forwards"
      });

      anim.onfinish = () => {
        pencil.style.left = `${target.x}%`;
        pencil.style.top = `${target.y}%`;
        pencil.style.setProperty("--rot", `${target.r || 0}deg`);
      };
    }, delay + 80);
  });

  speak(state.currentProblem.speak(getName(), state.total, state.change));
}

registerScene({
  id: "lapicesMesa",
  operation: "addition",

  itemSingular: "lápiz",
  itemPlural: "lápices",
  itemSingularEn: "pencil",
  itemPluralEn: "pencils",

  minTotal: 4,
  maxTotal: 10,
  minChange: 1,
  maxChange: 6,

  texts: {
    es: {
      title: "Lápices en la mesa",
      short: "Hay lápices en la mesa y llegan más. Hay que contar cuántos hay ahora.",
      badge: "✏️ Suma",
      animateLabel: "✏️ Ver cómo llegan",
      sceneTitle: "Observa cuántos lápices hay en la mesa",
      answerQuestion: "¿Cuántos lápices hay ahora en la mesa?"
    },
    en: {
      title: "Pencils on the table",
      short: "There are pencils on the table and more arrive. Count how many there are now.",
      badge: "✏️ Addition",
      animateLabel: "✏️ Watch pencils arrive",
      sceneTitle: "Watch how many pencils are on the table",
      answerQuestion: "How many pencils are on the table now?"
    }
  },

  renderPreview: renderLapicesPreview,
  renderScene: renderLapicesScene,
  animate: animateLapicesArrive,

  story: (name, total, change, highlight = false) => {
    if (isEnglish()) {
      return `On a table ${thereIs(total)} <strong>${total}</strong> ${itemWord(problems.lapicesMesa, total)}, and <strong>${change}</strong> more ${itemWord(problems.lapicesMesa, change)} <span class="${highlight ? "keyAction" : ""}">arrive</span>. How many pencils are on the table now?`;
    }

    return `En una mesa hay <strong>${total}</strong> ${itemWord(problems.lapicesMesa, total)} y <span class="${highlight ? "keyAction" : ""}">llegan</span> <strong>${change}</strong> ${itemWord(problems.lapicesMesa, change)} más. ¿Cuántos lápices hay ahora en la mesa?`;
  },

  speak: (name, total, change) => {
    if (isEnglish()) {
      return `On a table ${thereIs(total)} ${total} ${itemWord(problems.lapicesMesa, total)}, and ${change} more ${itemWord(problems.lapicesMesa, change)} arrive. How many pencils are on the table now?`;
    }

    return `En una mesa hay ${total} ${itemWord(problems.lapicesMesa, total)} y llegan ${change} ${itemWord(problems.lapicesMesa, change)} más. ¿Cuántos lápices hay ahora en la mesa?`;
  },

  hintData: (total, change) => isEnglish()
    ? `Start amount: ${thereIs(total)} <strong>${total}</strong> ${itemWord(problems.lapicesMesa, total)} on the table. Change: <strong>${change}</strong> more arrive.`
    : `Dato inicial: hay <strong>${total}</strong> ${itemWord(problems.lapicesMesa, total)} en la mesa. Cambio: llegan <strong>${change}</strong> más.`,

  hintKeyword: () => isEnglish()
    ? `The key word is <strong>arrive</strong>. When more objects arrive, the amount increases.`
    : `La palabra clave es <strong>llegan</strong>. Si llegan más objetos, la cantidad aumenta.`,

  hintOperation: (total, change) => isEnglish()
    ? `Because the amount increases, use <strong>addition</strong>: <strong>${total} + ${change}</strong>.`
    : `Como la cantidad aumenta, se usa una <strong>suma</strong>: <strong>${total} + ${change}</strong>.`
});
