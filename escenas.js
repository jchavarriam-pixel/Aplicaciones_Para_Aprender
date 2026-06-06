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



/*
============================================================
ESCENA NUEVA: DANIEL Y LOS GLOBOS EN EL PARQUE
============================================================
Pegar este bloque dentro de escenas.js, justo antes del cierre final:
})();
*/

function addDanielBalloonSceneStyles() {
  if (document.getElementById("danielBalloonSceneStylesV2")) return;

  const style = document.createElement("style");
  style.id = "danielBalloonSceneStylesV2";
  style.textContent = `
    .miniDanielParkGround {
      position: absolute;
      inset: auto 0 0 0;
      height: 44%;
      background: linear-gradient(#bbf7d0, #86efac);
      border-top: 4px solid #22c55e;
    }

    .miniDanielChild {
      position: absolute;
      left: 24px;
      top: 74px;
      width: 42px;
      height: 62px;
      z-index: 5;
    }

    .miniDanielChild::before {
      content: "";
      position: absolute;
      left: 10px;
      top: 0;
      width: 23px;
      height: 23px;
      border-radius: 50%;
      background: #fed7aa;
      border: 3px solid #c2410c;
    }

    .miniDanielChild::after {
      content: "";
      position: absolute;
      left: 5px;
      top: 27px;
      width: 34px;
      height: 34px;
      border-radius: 13px 13px 8px 8px;
      background: #60a5fa;
      border: 3px solid #1d4ed8;
    }

    .miniDanielBalloon {
      position: absolute;
      width: 17px;
      height: 23px;
      border-radius: 50% 50% 45% 45%;
      background: var(--balloon-color, #ef4444);
      border: 2px solid rgba(15,23,42,.34);
      z-index: 7;
      box-shadow: inset 4px 5px rgba(255,255,255,.24), 0 5px 7px rgba(15,23,42,.16);
    }

    .miniDanielBalloon::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 96%;
      width: 2px;
      height: 39px;
      background: rgba(71,85,105,.56);
      transform-origin: top;
      transform: rotate(var(--string-rot, 14deg));
    }

    .miniWindMark {
      position: absolute;
      right: 12px;
      top: 38px;
      width: 58px;
      height: 20px;
      border-top: 4px solid rgba(37,99,235,.35);
      border-radius: 50%;
      z-index: 4;
    }

    .miniWindMark::after {
      content: "";
      position: absolute;
      right: -8px;
      top: -10px;
      width: 18px;
      height: 18px;
      border-top: 4px solid rgba(37,99,235,.35);
      border-radius: 50%;
    }

    .danielParkGround {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 40%;
      background: linear-gradient(#bbf7d0, #86efac);
      border-top: 5px solid #22c55e;
      z-index: 1;
    }

    .danielParkGround::after {
      content: "";
      position: absolute;
      left: 40%;
      bottom: -6%;
      width: 31%;
      height: 112%;
      background: linear-gradient(#fde68a, #facc15);
      border-left: 5px solid #eab308;
      border-right: 5px solid #eab308;
      transform: skewX(-10deg);
      opacity: .84;
    }

    .danielParkBush {
      position: absolute;
      border-radius: 50%;
      background: #22c55e;
      border: 4px solid #15803d;
      z-index: 2;
      box-shadow: inset 0 6px rgba(255,255,255,.16);
    }

    .danielParkBush.b1 { left: 5%; top: 61%; width: 16%; height: 13%; }
    .danielParkBush.b2 { right: 5%; top: 60%; width: 18%; height: 14%; background: #4ade80; }

    .danielChild {
      position: absolute;
      left: 10%;
      top: 42%;
      width: 19%;
      height: 47%;
      z-index: 12;
    }

    .danielChild .head {
      position: absolute;
      left: 35%;
      top: 0;
      width: 100%;
      aspect-ratio: 1;
      border-radius: 32%;
      background: #fed7aa;
      border: 4px solid #c2410c;
      z-index: 4;
    }

    .danielChild .hair {
      position: absolute;
      left: 31%;
      top: -2%;
      width: 40%;
      height: 15%;
      border-radius: 50% 50% 24% 24%;
      background: #78350f;
      z-index: 5;
    }

    .danielChild .body {
      position: absolute;
      left: 29%;
      top: 25%;
      width: 43%;
      height: 43%;
      border-radius: 20px 20px 10px 10px;
      background: #60a5fa;
      border: 4px solid #1d4ed8;
      z-index: 3;
    }

    .danielChild .arm {
      position: absolute;
      left: 60%;
      top: 38%;
      width: 48%;
      height: 12%;
      border-radius: 999px;
      background: #fed7aa;
      border: 3px solid #c2410c;
      transform: rotate(-25deg);
      transform-origin: left center;
      z-index: 2;
    }

    .danielChild .hand {
      position: absolute;
      left: 101%;
      top: 30%;
      width: 15%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: #fed7aa;
      border: 3px solid #c2410c;
      z-index: 25;
      box-shadow: 0 4px 6px rgba(15,23,42,.12);
    }

    .danielChild .leg {
      position: absolute;
      top: 66%;
      width: 13%;
      height: 31%;
      border-radius: 999px;
      background: #1d4ed8;
      z-index: 2;
    }

    .danielChild .leg.left { left: 34%; transform: rotate(6deg); }
    .danielChild .leg.right { left: 55%; transform: rotate(-5deg); }

    .danielBalloonStrings {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 16;
      pointer-events: none;
      overflow: visible;
    }

    .danielBalloonStrings line {
      stroke: rgba(71,85,105,.72);
      stroke-width: .55;
      stroke-linecap: round;
      filter: drop-shadow(0 1px 1px rgba(255,255,255,.85));
      transition: opacity .35s ease;
    }

    .danielBalloon {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: clamp(28px, 4.4vw, 46px);
      height: clamp(38px, 5.9vw, 62px);
      border-radius: 50% 50% 46% 46%;
      background: var(--balloon-color, #ef4444);
      border: 4px solid rgba(15,23,42,.34);
      transform: translate(-50%, -50%);
      z-index: 19;
      box-shadow: inset 7px 10px rgba(255,255,255,.25), 0 8px 12px rgba(15,23,42,.18);
      will-change: left, top, transform, opacity;
    }

    .danielBalloon::before {
      content: "";
      position: absolute;
      left: 42%;
      bottom: -10%;
      width: 18%;
      height: 16%;
      background: inherit;
      border: 3px solid rgba(15,23,42,.26);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }

    .danielBalloon.flown {
      z-index: 32;
    }

    .danielWindLine {
      position: absolute;
      left: var(--wx);
      top: var(--wy);
      width: var(--ww);
      height: 18px;
      border-top: 5px solid rgba(37,99,235,.32);
      border-radius: 50%;
      z-index: 30;
      opacity: 0;
      transform: rotate(var(--wr, -8deg));
      animation: danielWindSweep 1800ms ease-in-out forwards;
    }

    .danielWindLine::after {
      content: "";
      position: absolute;
      right: -10px;
      top: -11px;
      width: 18px;
      height: 18px;
      border-top: 5px solid rgba(37,99,235,.32);
      border-radius: 50%;
    }

    @keyframes danielWindSweep {
      0% { opacity: 0; transform: translateX(-50px) rotate(var(--wr, -8deg)); }
      22% { opacity: 1; }
      78% { opacity: 1; }
      100% { opacity: 0; transform: translateX(120px) rotate(var(--wr, -8deg)); }
    }
  `;
  document.head.appendChild(style);
}

function renderDanielGlobosPreview(box) {
  addDanielBalloonSceneStyles();
  box.innerHTML = `
    <div class="miniDanielParkGround"></div>
    <div class="miniWindMark"></div>
    <div class="miniDanielChild"></div>
    <span class="miniDanielBalloon" style="left:76px;top:44px;--balloon-color:#ef4444;--string-rot:20deg"></span>
    <span class="miniDanielBalloon" style="left:96px;top:31px;--balloon-color:#3b82f6;--string-rot:10deg"></span>
    <span class="miniDanielBalloon" style="left:116px;top:47px;--balloon-color:#22c55e;--string-rot:-4deg"></span>
    <span class="miniDanielBalloon" style="left:131px;top:27px;--balloon-color:#f97316;--string-rot:-12deg"></span>
  `;
}

const danielHandPoint = { x: 30.7, y: 60.2 };

const danielBalloonColors = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#06b6d4", "#eab308"];

const danielBalloonPositions = [
  { x: 39, y: 24 }, { x: 46, y: 16 }, { x: 53, y: 22 }, { x: 60, y: 15 },
  { x: 66, y: 25 }, { x: 43, y: 34 }, { x: 51, y: 31 }, { x: 59, y: 34 },
  { x: 67, y: 36 }, { x: 74, y: 29 }, { x: 48, y: 43 }, { x: 57, y: 43 },
  { x: 66, y: 45 }, { x: 75, y: 40 }
];

const danielBalloonFlyTargets = [
  { x: 88, y: 12, r: 20 }, { x: 96, y: 23, r: -15 }, { x: 83, y: 7, r: 18 },
  { x: 99, y: 12, r: -20 }, { x: 90, y: 35, r: 16 }, { x: 78, y: 10, r: -18 }
];

function createDanielBalloon(id, pos) {
  const balloon = document.createElement("div");
  balloon.className = "danielBalloon";
  balloon.dataset.id = id;
  balloon.style.left = `${pos.x}%`;
  balloon.style.top = `${pos.y}%`;
  balloon.style.setProperty("--x", `${pos.x}%`);
  balloon.style.setProperty("--y", `${pos.y}%`);
  balloon.style.setProperty("--balloon-color", danielBalloonColors[id % danielBalloonColors.length]);
  return balloon;
}

function createDanielBalloonStrings(count) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("danielBalloonStrings");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");

  for (let i = 0; i < count; i++) {
    const pos = danielBalloonPositions[i % danielBalloonPositions.length];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.dataset.id = i;
    line.setAttribute("x1", String(danielHandPoint.x));
    line.setAttribute("y1", String(danielHandPoint.y));
    line.setAttribute("x2", String(pos.x));
    line.setAttribute("y2", String(pos.y + 6));
    svg.appendChild(line);
  }

  return svg;
}

function addDanielWindLines() {
  const lines = [
    { x: "40%", y: "18%", w: "150px", r: "-8deg" },
    { x: "54%", y: "31%", w: "190px", r: "-5deg" },
    { x: "63%", y: "10%", w: "130px", r: "-12deg" }
  ];

  lines.forEach((line, index) => {
    const wind = document.createElement("div");
    wind.className = "danielWindLine";
    wind.style.setProperty("--wx", line.x);
    wind.style.setProperty("--wy", line.y);
    wind.style.setProperty("--ww", line.w);
    wind.style.setProperty("--wr", line.r);
    wind.style.animationDelay = `${index * 180}ms`;
    scene.appendChild(wind);
    setTimeout(() => wind.remove(), 2500);
  });
}

function renderDanielGlobosScene() {
  addDanielBalloonSceneStyles();
  addSkyAndGround();

  const ground = document.createElement("div");
  ground.className = "danielParkGround";

  const bush1 = document.createElement("div");
  bush1.className = "danielParkBush b1";

  const bush2 = document.createElement("div");
  bush2.className = "danielParkBush b2";

  const daniel = document.createElement("div");
  daniel.className = "danielChild";
  daniel.innerHTML = `
    <div class="hair"></div>
    <div class="head"></div>
    <div class="body"></div>
    <div class="arm"></div>
    <div class="hand"></div>
    <div class="leg left"></div>
    <div class="leg right"></div>
  `;

  scene.append(ground, bush1, bush2, daniel, createDanielBalloonStrings(state.total));

  const ids = Array.from({ length: state.total }, (_, i) => i);
  state.movingIds = shuffle(ids).slice(0, state.change);

  for (let i = 0; i < state.total; i++) {
    scene.appendChild(createDanielBalloon(i, danielBalloonPositions[i % danielBalloonPositions.length]));
  }
}

function animateDanielGlobosWind() {
  if (state.animated) return;
  state.animated = true;

  feedback.className = "feedback";
  feedback.textContent = isEnglish()
    ? `Watch how the strong wind carries away ${state.change === 1 ? "one balloon" : "some balloons"}. The balloons Daniel keeps are the answer.`
    : `Observa cómo el fuerte viento se lleva ${state.change === 1 ? "un globo" : "algunos globos"}. Los globos que conserva Daniel son la respuesta.`;

  updateText();
  addDanielWindLines();

  const movingSet = new Set(state.movingIds);

  state.movingIds.forEach((id, index) => {
    const balloon = scene.querySelector(`.danielBalloon[data-id="${id}"]`);
    const stringLine = scene.querySelector(`.danielBalloonStrings line[data-id="${id}"]`);
    if (!balloon) return;

    const start = danielBalloonPositions[id % danielBalloonPositions.length];
    const target = danielBalloonFlyTargets[index % danielBalloonFlyTargets.length];
    const delay = index * 240;

    setTimeout(() => {
      balloon.classList.add("flown");
      if (stringLine) {
        stringLine.animate([
          { opacity: 1 },
          { opacity: .35 },
          { opacity: 0 }
        ], { duration: 520, easing: "ease-out", fill: "forwards" });
      }

      const anim = balloon.animate([
        {
          left: `${start.x}%`,
          top: `${start.y}%`,
          transform: "translate(-50%, -50%) rotate(0deg) scale(1)",
          opacity: 1,
          offset: 0
        },
        {
          left: `${(start.x + target.x) / 2}%`,
          top: `${Math.max(5, start.y - 13)}%`,
          transform: "translate(-50%, -50%) rotate(16deg) scale(1.04)",
          opacity: 1,
          offset: .45
        },
        {
          left: `${target.x}%`,
          top: `${target.y}%`,
          transform: `translate(-50%, -50%) rotate(${target.r}deg) scale(.9)`,
          opacity: .82,
          offset: 1
        }
      ], {
        duration: 1500,
        easing: "cubic-bezier(.2,.82,.25,1)",
        fill: "forwards"
      });

      anim.onfinish = () => {
        balloon.style.left = `${target.x}%`;
        balloon.style.top = `${target.y}%`;
        balloon.style.transform = `translate(-50%, -50%) rotate(${target.r}deg) scale(.9)`;
        balloon.style.opacity = ".82";
      };
    }, delay + 90);
  });

  scene.querySelectorAll(".danielBalloon").forEach(balloon => {
    if (!movingSet.has(Number(balloon.dataset.id))) {
      balloon.animate([
        { transform: "translate(-50%, -50%) rotate(-2deg) scale(1)" },
        { transform: "translate(-50%, -52%) rotate(3deg) scale(1.04)" },
        { transform: "translate(-50%, -50%) rotate(-2deg) scale(1)" }
      ], { duration: 1200, delay: 900, easing: "ease-in-out" });
    }
  });

  speak(state.currentProblem.speak(getName(), state.total, state.change));
}

registerScene({
  id: "danielGlobosParque",
  operation: "subtraction",

  itemSingular: "globo",
  itemPlural: "globos",
  itemSingularEn: "balloon",
  itemPluralEn: "balloons",

  minTotal: 4,
  maxTotal: 12,
  minChange: 1,
  maxChange: 6,

  texts: {
    es: {
      title: "Daniel y los globos",
      short: "Daniel juega en el parque con sus globos y el viento se lleva algunos.",
      badge: "🎈 Resta",
      animateLabel: "🎈 Ver viento",
      sceneTitle: "Observa cuántos globos conserva Daniel",
      answerQuestion: "¿Cuántos globos le quedan a Daniel?"
    },
    en: {
      title: "Daniel and the balloons",
      short: "Daniel plays in the park with his balloons and the wind carries some away.",
      badge: "🎈 Subtraction",
      animateLabel: "🎈 Watch the wind",
      sceneTitle: "Watch how many balloons Daniel keeps",
      answerQuestion: "How many balloons does Daniel have left?"
    }
  },

  renderPreview: renderDanielGlobosPreview,
  renderScene: renderDanielGlobosScene,
  animate: animateDanielGlobosWind,

  story: (name, total, change, highlight = false) => {
    const remaining = total - change;
    if (isEnglish()) {
      return `Daniel is in the park playing with his balloons. He has <strong>${total}</strong> ${itemWord(problems.danielGlobosParque, total)}, and a strong wind <span class="${highlight ? "keyAction" : ""}">carries away</span> <strong>${change}</strong> ${itemWord(problems.danielGlobosParque, change)}. How many balloons does Daniel have left?`;
    }
    return `Daniel está en el parque jugando con sus globos. Tiene <strong>${total}</strong> ${itemWord(problems.danielGlobosParque, total)} y un fuerte viento <span class="${highlight ? "keyAction" : ""}">se lleva</span> <strong>${change}</strong> ${itemWord(problems.danielGlobosParque, change)}. ¿Cuántos globos ${remaining === 1 ? "le queda" : "le quedan"} a Daniel?`;
  },

  speak: (name, total, change) => {
    const remaining = total - change;
    if (isEnglish()) {
      return `Daniel is in the park playing with his balloons. He has ${total} ${itemWord(problems.danielGlobosParque, total)}, and a strong wind carries away ${change} ${itemWord(problems.danielGlobosParque, change)}. How many balloons does Daniel have left?`;
    }
    return `Daniel está en el parque jugando con sus globos. Tiene ${total} ${itemWord(problems.danielGlobosParque, total)} y un fuerte viento se lleva ${change} ${itemWord(problems.danielGlobosParque, change)}. ¿Cuántos globos ${remaining === 1 ? "le queda" : "le quedan"} a Daniel?`;
  },

  hintData: (total, change) => isEnglish()
    ? `Start amount: Daniel has <strong>${total}</strong> ${itemWord(problems.danielGlobosParque, total)}. Change: the wind carries away <strong>${change}</strong> ${itemWord(problems.danielGlobosParque, change)}.`
    : `Dato inicial: Daniel tiene <strong>${total}</strong> ${itemWord(problems.danielGlobosParque, total)}. Cambio: el viento se lleva <strong>${change}</strong> ${itemWord(problems.danielGlobosParque, change)}.`,

  hintKeyword: () => isEnglish()
    ? `The key words are <strong>carries away</strong>. When something is carried away, the amount decreases.`
    : `La palabra clave es <strong>se lleva</strong>. Si el viento se lleva globos, la cantidad disminuye.`,

  hintOperation: (total, change) => isEnglish()
    ? `Because the amount decreases, use <strong>subtraction</strong>: <strong>${total} − ${change}</strong>.`
    : `Como la cantidad disminuye, se usa una <strong>resta</strong>: <strong>${total} − ${change}</strong>.`
});



/*
######################################################################################
*/

/*
============================================================
ESCENA NUEVA: JUAN Y MARÍA COLOCAN DULCES EN UN PLATO
Versión ajustada:
- Se ve un confite en la mano de Juan y uno en la mano de María.
- Los dulces salen desde la mano hacia el plato.
- Los dulces finales quedan dentro del plato, no flotando arriba.
============================================================
*/

(function () {
  function addJuanMariaCandySceneStylesV3() {
    if (document.getElementById("juanMariaCandySceneStylesV3")) return;

    const style = document.createElement("style");
    style.id = "juanMariaCandySceneStylesV3";
    style.textContent = `
      .miniCandyTableJM3 {
        position: absolute;
        left: 18px;
        right: 18px;
        bottom: 20px;
        height: 44px;
        border-radius: 20px 20px 12px 12px;
        background: linear-gradient(#fbbf24, #d97706);
        border: 4px solid #92400e;
        z-index: 2;
      }

      .miniCandyPlateJM3 {
        position: absolute;
        left: 50px;
        top: 78px;
        width: 55px;
        height: 30px;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, #ffffff 0 45%, #dbeafe 46% 74%, #60a5fa 75% 100%);
        border: 4px solid #2563eb;
        z-index: 4;
      }

      .miniChildCandyJM3 {
        position: absolute;
        width: 26px;
        height: 50px;
        z-index: 6;
      }

      .miniChildCandyJM3::before {
        content: "";
        position: absolute;
        left: 5px;
        top: 0;
        width: 19px;
        height: 19px;
        border-radius: 50%;
        background: #fed7aa;
        border: 3px solid #c2410c;
      }

      .miniChildCandyJM3::after {
        content: "";
        position: absolute;
        left: 3px;
        top: 22px;
        width: 23px;
        height: 29px;
        border-radius: 11px 11px 6px 6px;
        background: var(--shirt-color, #60a5fa);
        border: 3px solid var(--shirt-border, #1d4ed8);
      }

      .miniCandyPieceJM3 {
        position: absolute;
        width: 19px;
        height: 12px;
        border-radius: 999px;
        background: var(--candy-color, #ef4444);
        border: 2px solid rgba(15,23,42,.34);
        z-index: 8;
        transform: rotate(var(--rot, 0deg));
        box-shadow: inset 3px 2px rgba(255,255,255,.28), 0 3px 5px rgba(15,23,42,.16);
      }

      .miniCandyPieceJM3::before,
      .miniCandyPieceJM3::after {
        content: "";
        position: absolute;
        top: 1px;
        width: 8px;
        height: 10px;
        background: var(--candy-color, #ef4444);
        border: 2px solid rgba(15,23,42,.22);
        clip-path: polygon(0 50%, 100% 0, 100% 100%);
      }

      .miniCandyPieceJM3::before {
        left: -8px;
        transform: rotate(180deg);
      }

      .miniCandyPieceJM3::after {
        right: -8px;
      }

      .candyRoomWallJM3 {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 70%;
        background:
          linear-gradient(90deg, rgba(226,232,240,.50) 0 2px, transparent 2px 100%),
          linear-gradient(#fff7ed, #fffbeb);
        background-size: 46px 100%, 100% 100%;
        z-index: 0;
      }

      .candyRoomFloorJM3 {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 34%;
        background: linear-gradient(#fde68a, #fcd34d);
        border-top: 5px solid #f59e0b;
        z-index: 1;
      }

      .candyWindowJM3 {
        position: absolute;
        left: 7%;
        top: 8%;
        width: 18%;
        height: 23%;
        border-radius: 14px;
        background: linear-gradient(#dbeafe, #eff6ff);
        border: 5px solid #60a5fa;
        box-shadow: inset 0 0 0 4px rgba(255,255,255,.65);
        z-index: 1;
      }

      .candyWindowJM3::before,
      .candyWindowJM3::after {
        content: "";
        position: absolute;
        background: #60a5fa;
      }

      .candyWindowJM3::before {
        left: 48%;
        top: 0;
        width: 5px;
        height: 100%;
      }

      .candyWindowJM3::after {
        left: 0;
        top: 48%;
        width: 100%;
        height: 5px;
      }

      .candyMainTableJM3 {
        position: absolute;
        left: 18%;
        top: 60%;
        width: 64%;
        height: 17%;
        border-radius: 28px 28px 16px 16px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.34) 0 18%, transparent 18% 100%),
          linear-gradient(#fbbf24, #d97706);
        border: 6px solid #92400e;
        border-bottom-width: 9px;
        z-index: 3;
        box-shadow: 0 18px 24px rgba(15,23,42,.18), inset 0 10px rgba(255,255,255,.22);
      }

      .candyMainTableJM3::after {
        content: "";
        position: absolute;
        left: 9%;
        right: 9%;
        bottom: -48%;
        height: 48%;
        border-radius: 0 0 20px 20px;
        background:
          linear-gradient(90deg, #92400e 0 8%, transparent 8% 92%, #92400e 92% 100%),
          linear-gradient(#d97706, #b45309);
        border: 4px solid #92400e;
        border-top: 0;
        z-index: -1;
      }

      .candyPlateJM3 {
        position: absolute;
        left: 50%;
        top: 56%;
        width: 38%;
        height: 18%;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, #ffffff 0 44%, #dbeafe 45% 72%, #60a5fa 73% 100%);
        border: 6px solid #2563eb;
        transform: translateX(-50%);
        z-index: 7;
        box-shadow: 0 12px 18px rgba(15,23,42,.15), inset 0 0 0 8px rgba(255,255,255,.45);
      }

      .candyPlateJM3::after {
        content: "";
        position: absolute;
        left: 12%;
        right: 12%;
        top: 24%;
        height: 48%;
        border-radius: 50%;
        border: 4px solid rgba(37,99,235,.30);
        background: rgba(255,255,255,.38);
      }

      .candyChildJM3 {
        position: absolute;
        width: 20%;
        height: 47%;
        top: 38%;
        z-index: 12;
      }

      .candyChildJM3.juan {
        left: 4%;
      }

      .candyChildJM3.maria {
        right: 4%;
      }

      .candyChildJM3 .head {
        position: absolute;
        left: 35%;
        top: 0;
        width: 32%;
        aspect-ratio: 1;
        border-radius: 50%;
        background: #fed7aa;
        border: 4px solid #c2410c;
        z-index: 5;
      }

      .candyChildJM3 .hair {
        position: absolute;
        left: 31%;
        top: -2%;
        width: 40%;
        height: 15%;
        border-radius: 50% 50% 24% 24%;
        background: var(--hair-color, #78350f);
        z-index: 6;
      }

      .candyChildJM3 .body {
        position: absolute;
        left: 29%;
        top: 25%;
        width: 43%;
        height: 43%;
        border-radius: 20px 20px 10px 10px;
        background: var(--shirt-color, #60a5fa);
        border: 4px solid var(--shirt-border, #1d4ed8);
        z-index: 3;
      }

      .candyChildJM3 .arm {
        position: absolute;
        top: 39%;
        width: 52%;
        height: 12%;
        border-radius: 999px;
        background: #fed7aa;
        border: 3px solid #c2410c;
        z-index: 4;
      }

      .candyChildJM3.juan .arm {
        left: 62%;
        transform: rotate(-20deg);
        transform-origin: left center;
      }

      .candyChildJM3.maria .arm {
        right: 62%;
        transform: rotate(20deg);
        transform-origin: right center;
      }

      .candyChildJM3 .hand {
        position: absolute;
        top: 35%;
        width: 15%;
        aspect-ratio: 1;
        border-radius: 50%;
        background: #fed7aa;
        border: 3px solid #c2410c;
        z-index: 17;
        box-shadow: 0 4px 6px rgba(15,23,42,.12);
      }

      .candyChildJM3.juan .hand {
        left: 104%;
      }

      .candyChildJM3.maria .hand {
        right: 104%;
      }

      .candyChildJM3 .leg {
        position: absolute;
        top: 66%;
        width: 13%;
        height: 31%;
        border-radius: 999px;
        background: var(--pants-color, #1d4ed8);
        z-index: 2;
      }

      .candyChildJM3 .leg.left {
        left: 34%;
        transform: rotate(6deg);
      }

      .candyChildJM3 .leg.right {
        left: 55%;
        transform: rotate(-5deg);
      }

      .candyNameLabelJM3 {
        position: absolute;
        top: -15%;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(255,255,255,.92);
        border: 2px solid #bfdbfe;
        color: #1e40af;
        font-size: clamp(.72rem, 1.5vw, .95rem);
        font-weight: 950;
        white-space: nowrap;
        z-index: 20;
        box-shadow: 0 5px 10px rgba(15,23,42,.10);
      }

      .candyHandBowlJM3 {
        position: absolute;
        top: 50%;
        width: 38%;
        height: 18%;
        border-radius: 50%;
        background: #fbbf24;
        border: 4px solid #92400e;
        z-index: 14;
        box-shadow: inset 0 0 0 5px rgba(255,255,255,.18), 0 6px 10px rgba(15,23,42,.14);
      }

      .candyChildJM3.juan .candyHandBowlJM3 {
        left: 83%;
      }

      .candyChildJM3.maria .candyHandBowlJM3 {
        right: 83%;
      }

      .handCandyJM3 {
        position: absolute;
        width: clamp(24px, 3.6vw, 36px);
        height: clamp(15px, 2.2vw, 22px);
        border-radius: 999px;
        background: var(--candy-color, #ef4444);
        border: 4px solid rgba(15,23,42,.34);
        transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
        z-index: 30;
        box-shadow: inset 5px 4px rgba(255,255,255,.25), 0 7px 9px rgba(15,23,42,.18);
      }

      .handCandyJM3::before,
      .handCandyJM3::after {
        content: "";
        position: absolute;
        top: 6%;
        width: 28%;
        height: 88%;
        background: inherit;
        border: 3px solid rgba(15,23,42,.23);
        clip-path: polygon(0 50%, 100% 0, 100% 100%);
      }

      .handCandyJM3::before {
        left: -24%;
        transform: rotate(180deg);
      }

      .handCandyJM3::after {
        right: -24%;
      }

      .handCandyJM3.juanCandy {
        left: 27.3%;
        top: 57.3%;
        --candy-color: #ef4444;
        --rot: -10deg;
      }

      .handCandyJM3.mariaCandy {
        left: 72.7%;
        top: 57.3%;
        --candy-color: #3b82f6;
        --rot: 10deg;
      }

      .handCandyJM3.isEmpty {
        opacity: 0;
        transition: opacity .25s ease;
      }

      .candyPieceJM3 {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: clamp(25px, 4vw, 40px);
        height: clamp(15px, 2.5vw, 24px);
        border-radius: 999px;
        background: var(--candy-color, #ef4444);
        border: 4px solid rgba(15,23,42,.34);
        transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
        z-index: 24;
        box-shadow: inset 6px 4px rgba(255,255,255,.24), 0 7px 9px rgba(15,23,42,.18);
        will-change: left, top, transform, opacity;
      }

      .candyPieceJM3::before,
      .candyPieceJM3::after {
        content: "";
        position: absolute;
        top: 6%;
        width: 28%;
        height: 88%;
        background: inherit;
        border: 3px solid rgba(15,23,42,.23);
        clip-path: polygon(0 50%, 100% 0, 100% 100%);
      }

      .candyPieceJM3::before {
        left: -24%;
        transform: rotate(180deg);
      }

      .candyPieceJM3::after {
        right: -24%;
      }

      .candyPieceJM3.inHand {
        opacity: 0;
      }

      .candyPieceJM3.onPlate {
        opacity: 1;
        z-index: 18;
      }

      .candySparkleJM3 {
        position: absolute;
        left: var(--sx);
        top: var(--sy);
        font-size: clamp(17px, 2.5vw, 28px);
        z-index: 35;
        animation: candySparkJM3 950ms ease-out forwards;
        pointer-events: none;
      }

      @keyframes candySparkJM3 {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(.4) rotate(0deg); }
        25% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -115%) scale(1.15) rotate(25deg); }
      }
    `;
    document.head.appendChild(style);
  }

  function renderJuanMariaDulcesPreviewV3(box) {
    addJuanMariaCandySceneStylesV3();

    box.innerHTML = `
      <div class="miniCandyTableJM3"></div>
      <div class="miniCandyPlateJM3"></div>

      <div class="miniChildCandyJM3" style="left:14px;top:70px;--shirt-color:#60a5fa;--shirt-border:#1d4ed8"></div>
      <div class="miniChildCandyJM3" style="right:14px;top:70px;--shirt-color:#f9a8d4;--shirt-border:#be185d"></div>

      <span class="miniCandyPieceJM3" style="left:62px;top:91px;--candy-color:#ef4444;--rot:12deg"></span>
      <span class="miniCandyPieceJM3" style="left:78px;top:101px;--candy-color:#22c55e;--rot:-8deg"></span>
      <span class="miniCandyPieceJM3" style="left:95px;top:91px;--candy-color:#3b82f6;--rot:6deg"></span>
      <span class="miniCandyPieceJM3" style="left:109px;top:102px;--candy-color:#f97316;--rot:-14deg"></span>
    `;
  }

  const candyJuanHandPointJM3 = { x: 27.3, y: 57.3, r: -8 };
  const candyMariaHandPointJM3 = { x: 72.7, y: 57.3, r: 8 };

  function candyHandStackPositionJM3(owner, index) {
    const base = owner === "juan" ? candyJuanHandPointJM3 : candyMariaHandPointJM3;

    return {
      x: base.x + (index % 3) * 0.10,
      y: base.y + (index % 3) * 0.08,
      r: base.r + (index % 2 === 0 ? -3 : 3)
    };
  }

  const candyPlatePositionsJM3 = [
    { x: 42, y: 61, r: -12 }, { x: 48, y: 60, r: 9 },  { x: 54, y: 60, r: -6 }, { x: 60, y: 61, r: 13 },
    { x: 45, y: 64, r: -18 }, { x: 51, y: 64, r: 6 }, { x: 57, y: 64, r: -9 }, { x: 63, y: 64, r: 15 },
    { x: 39, y: 66, r: 10 },  { x: 66, y: 66, r: -15 }, { x: 44, y: 68, r: 4 }, { x: 50, y: 68, r: -8 },
    { x: 56, y: 68, r: 12 },  { x: 62, y: 68, r: -4 }, { x: 47, y: 70, r: 16 }, { x: 53, y: 70, r: -12 },
    { x: 59, y: 70, r: 7 },   { x: 41, y: 69, r: -6 }, { x: 65, y: 69, r: 11 }, { x: 50, y: 62, r: -15 },
    { x: 56, y: 62, r: 14 },  { x: 46, y: 66, r: -2 }, { x: 60, y: 66, r: 2 }, { x: 53, y: 67, r: -18 },
    { x: 58, y: 63, r: 18 }
  ];

  const candyColorsJM3 = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#06b6d4", "#eab308"];

  function createCandyJM3(id, owner, pos, colorIndex) {
    const candy = document.createElement("div");
    candy.className = `candyPieceJM3 candy-${owner} inHand`.trim();
    candy.dataset.id = id;
    candy.dataset.owner = owner;
    candy.style.left = `${pos.x}%`;
    candy.style.top = `${pos.y}%`;
    candy.style.setProperty("--x", `${pos.x}%`);
    candy.style.setProperty("--y", `${pos.y}%`);
    candy.style.setProperty("--rot", `${pos.r || 0}deg`);
    candy.style.setProperty("--candy-color", candyColorsJM3[colorIndex % candyColorsJM3.length]);
    return candy;
  }

  function addCandySparkleJM3(x, y, delay = 0) {
    setTimeout(() => {
      const sparkle = document.createElement("div");
      sparkle.className = "candySparkleJM3";
      sparkle.textContent = "✨";
      sparkle.style.setProperty("--sx", `${x}%`);
      sparkle.style.setProperty("--sy", `${y}%`);
      scene.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }, delay);
  }

  function renderJuanMariaDulcesSceneV3() {
    addJuanMariaCandySceneStylesV3();
    addIndoorKitchen();

    const wall = document.createElement("div");
    wall.className = "candyRoomWallJM3";

    const floor = document.createElement("div");
    floor.className = "candyRoomFloorJM3";

    const windowHome = document.createElement("div");
    windowHome.className = "candyWindowJM3";

    const table = document.createElement("div");
    table.className = "candyMainTableJM3";

    const plate = document.createElement("div");
    plate.className = "candyPlateJM3";

    const juan = document.createElement("div");
    juan.className = "candyChildJM3 juan";
    juan.style.setProperty("--shirt-color", "#60a5fa");
    juan.style.setProperty("--shirt-border", "#1d4ed8");
    juan.style.setProperty("--pants-color", "#1d4ed8");
    juan.style.setProperty("--hair-color", "#78350f");
    juan.innerHTML = `
      <div class="candyNameLabelJM3">Juan</div>
      <div class="hair"></div>
      <div class="head"></div>
      <div class="body"></div>
      <div class="arm"></div>
      <div class="hand"></div>
      <div class="leg left"></div>
      <div class="leg right"></div>
      <div class="candyHandBowlJM3"></div>
    `;

    const maria = document.createElement("div");
    maria.className = "candyChildJM3 maria";
    maria.style.setProperty("--shirt-color", "#f9a8d4");
    maria.style.setProperty("--shirt-border", "#be185d");
    maria.style.setProperty("--pants-color", "#be185d");
    maria.style.setProperty("--hair-color", "#7c2d12");
    maria.innerHTML = `
      <div class="candyNameLabelJM3">María</div>
      <div class="hair"></div>
      <div class="head"></div>
      <div class="body"></div>
      <div class="arm"></div>
      <div class="hand"></div>
      <div class="leg left"></div>
      <div class="leg right"></div>
      <div class="candyHandBowlJM3"></div>
    `;

    const handCandyJuan = document.createElement("div");
    handCandyJuan.className = "handCandyJM3 juanCandy";
    handCandyJuan.dataset.owner = "juan";

    const handCandyMaria = document.createElement("div");
    handCandyMaria.className = "handCandyJM3 mariaCandy";
    handCandyMaria.dataset.owner = "maria";

    scene.append(wall, floor, windowHome, table, plate, juan, maria, handCandyJuan, handCandyMaria);

    state.movingIds = [];

    for (let i = 0; i < state.total; i++) {
      const candy = createCandyJM3(
        `juan-${i}`,
        "juan",
        candyHandStackPositionJM3("juan", i),
        i
      );
      state.movingIds.push(`juan-${i}`);
      scene.appendChild(candy);
    }

    for (let i = 0; i < state.change; i++) {
      const candy = createCandyJM3(
        `maria-${i}`,
        "maria",
        candyHandStackPositionJM3("maria", i),
        state.total + i
      );
      state.movingIds.push(`maria-${i}`);
      scene.appendChild(candy);
    }
  }

  function animateJuanMariaDulcesV3() {
    if (state.animated) return;
    state.animated = true;

    feedback.className = "feedback";
    feedback.textContent = isEnglish()
      ? `Watch how Juan places ${state.total} ${itemWord(problems.juanMariaDulcesPlato, state.total)} and then María places ${state.change} more ${itemWord(problems.juanMariaDulcesPlato, state.change)} on the same plate.`
      : `Observa cómo Juan coloca ${state.total} ${itemWord(problems.juanMariaDulcesPlato, state.total)} y luego María coloca ${state.change} ${itemWord(problems.juanMariaDulcesPlato, state.change)} en el mismo plato.`;

    updateText();

    for (let i = 0; i < state.total; i++) {
      const candy = scene.querySelector(`.candyPieceJM3[data-id="juan-${i}"]`);
      if (!candy) continue;

      const start = candyHandStackPositionJM3("juan", i);
      const target = candyPlatePositionsJM3[i % candyPlatePositionsJM3.length];
      const delay = i * 210;

      setTimeout(() => {
        const anim = candy.animate([
          {
            left: `${start.x}%`,
            top: `${start.y}%`,
            transform: `translate(-50%, -50%) rotate(${start.r || 0}deg) scale(.72)`,
            opacity: 1,
            offset: 0
          },
          {
            left: "38%",
            top: "52%",
            transform: "translate(-50%, -50%) rotate(-12deg) scale(.82)",
            opacity: 1,
            offset: .55
          },
          {
            left: `${target.x}%`,
            top: `${target.y}%`,
            transform: `translate(-50%, -50%) rotate(${target.r || 0}deg) scale(.92)`,
            opacity: 1,
            offset: 1
          }
        ], {
          duration: 1050,
          easing: "cubic-bezier(.2,.82,.25,1)",
          fill: "forwards"
        });

        anim.onfinish = () => {
          candy.classList.remove("inHand");
          candy.classList.add("onPlate");
          candy.style.left = `${target.x}%`;
          candy.style.top = `${target.y}%`;
          candy.style.opacity = "1";
          candy.style.transform = `translate(-50%, -50%) rotate(${target.r || 0}deg) scale(.92)`;
        };

        addCandySparkleJM3(target.x, target.y, 720);
      }, delay + 90);
    }

    const juanHandCandy = scene.querySelector(".handCandyJM3.juanCandy");
    setTimeout(() => {
      juanHandCandy?.classList.add("isEmpty");
    }, state.total * 210 + 220);

    const mariaStartDelay = state.total * 210 + 650;

    for (let i = 0; i < state.change; i++) {
      const candy = scene.querySelector(`.candyPieceJM3[data-id="maria-${i}"]`);
      if (!candy) continue;

      const start = candyHandStackPositionJM3("maria", i);
      const targetIndex = state.total + i;
      const target = candyPlatePositionsJM3[targetIndex % candyPlatePositionsJM3.length];
      const delay = mariaStartDelay + i * 210;

      setTimeout(() => {
        const anim = candy.animate([
          {
            left: `${start.x}%`,
            top: `${start.y}%`,
            transform: `translate(-50%, -50%) rotate(${start.r || 0}deg) scale(.72)`,
            opacity: 1,
            offset: 0
          },
          {
            left: "62%",
            top: "52%",
            transform: "translate(-50%, -50%) rotate(12deg) scale(.82)",
            opacity: 1,
            offset: .55
          },
          {
            left: `${target.x}%`,
            top: `${target.y}%`,
            transform: `translate(-50%, -50%) rotate(${target.r || 0}deg) scale(.92)`,
            opacity: 1,
            offset: 1
          }
        ], {
          duration: 1050,
          easing: "cubic-bezier(.2,.82,.25,1)",
          fill: "forwards"
        });

        anim.onfinish = () => {
          candy.classList.remove("inHand");
          candy.classList.add("onPlate");
          candy.style.left = `${target.x}%`;
          candy.style.top = `${target.y}%`;
          candy.style.opacity = "1";
          candy.style.transform = `translate(-50%, -50%) rotate(${target.r || 0}deg) scale(.92)`;
        };

        addCandySparkleJM3(target.x, target.y, 720);
      }, delay + 90);
    }

    const mariaHandCandy = scene.querySelector(".handCandyJM3.mariaCandy");
    setTimeout(() => {
      mariaHandCandy?.classList.add("isEmpty");
    }, mariaStartDelay + state.change * 210 + 220);

    setTimeout(() => {
      scene.querySelectorAll(".candyPieceJM3.onPlate").forEach(candy => {
        candy.animate([
          { transform: candy.style.transform || "translate(-50%, -50%) scale(.92)" },
          { transform: "translate(-50%, -50%) scale(1.04)" },
          { transform: candy.style.transform || "translate(-50%, -50%) scale(.92)" }
        ], {
          duration: 750,
          easing: "ease-in-out"
        });
      });
    }, mariaStartDelay + state.change * 220 + 600);

    speak(state.currentProblem.speak(getName(), state.total, state.change));
  }

  registerScene({
    id: "juanMariaDulcesPlato",
    operation: "addition",

    itemSingular: "dulce",
    itemPlural: "dulces",
    itemSingularEn: "candy",
    itemPluralEn: "candies",

    minTotal: 3,
    maxTotal: 10,
    minChange: 1,
    maxChange: 8,

    texts: {
      es: {
        title: "Juan y María colocan dulces",
        short: "Juan coloca dulces en un plato y María coloca más dulces en el mismo plato.",
        badge: "🍬 Suma",
        animateLabel: "🍬 Ver cómo colocan",
        sceneTitle: "Observa cuántos dulces hay en el plato",
        answerQuestion: "¿Cuántos dulces hay en el plato?"
      },
      en: {
        title: "Juan and María place candies",
        short: "Juan places candies on a plate and María places more candies on the same plate.",
        badge: "🍬 Addition",
        animateLabel: "🍬 Watch them place candies",
        sceneTitle: "Watch how many candies are on the plate",
        answerQuestion: "How many candies are on the plate?"
      }
    },

    renderPreview: renderJuanMariaDulcesPreviewV3,
    renderScene: renderJuanMariaDulcesSceneV3,
    animate: animateJuanMariaDulcesV3,

    story: (name, total, change, highlight = false) => {
      if (isEnglish()) {
        return `Juan places <strong>${total}</strong> ${itemWord(problems.juanMariaDulcesPlato, total)} on a plate, and María <span class="${highlight ? "keyAction" : ""}">places</span> <strong>${change}</strong> more ${itemWord(problems.juanMariaDulcesPlato, change)} on the same plate. How many candies are on the plate?`;
      }

      return `Juan coloca <strong>${total}</strong> ${itemWord(problems.juanMariaDulcesPlato, total)} en un plato y María <span class="${highlight ? "keyAction" : ""}">coloca</span> <strong>${change}</strong> ${itemWord(problems.juanMariaDulcesPlato, change)} en el mismo plato. ¿Cuántos dulces hay en el plato?`;
    },

    speak: (name, total, change) => {
      if (isEnglish()) {
        return `Juan places ${total} ${itemWord(problems.juanMariaDulcesPlato, total)} on a plate, and María places ${change} more ${itemWord(problems.juanMariaDulcesPlato, change)} on the same plate. How many candies are on the plate?`;
      }

      return `Juan coloca ${total} ${itemWord(problems.juanMariaDulcesPlato, total)} en un plato y María coloca ${change} ${itemWord(problems.juanMariaDulcesPlato, change)} en el mismo plato. ¿Cuántos dulces hay en el plato?`;
    },

    hintData: (total, change) => isEnglish()
      ? `Start amount: Juan places <strong>${total}</strong> ${itemWord(problems.juanMariaDulcesPlato, total)}. Change: María places <strong>${change}</strong> more ${itemWord(problems.juanMariaDulcesPlato, change)}.`
      : `Dato inicial: Juan coloca <strong>${total}</strong> ${itemWord(problems.juanMariaDulcesPlato, total)}. Cambio: María coloca <strong>${change}</strong> ${itemWord(problems.juanMariaDulcesPlato, change)} más.`,

    hintKeyword: () => isEnglish()
      ? `The key word is <strong>places more</strong>. When María places more candies on the same plate, the amount increases.`
      : `La palabra clave es <strong>coloca más</strong>. Si María coloca más dulces en el mismo plato, la cantidad aumenta.`,

    hintOperation: (total, change) => isEnglish()
      ? `Because the amount increases, use <strong>addition</strong>: <strong>${total} + ${change}</strong>.`
      : `Como la cantidad aumenta, se usa una <strong>suma</strong>: <strong>${total} + ${change}</strong>.`
  });
})();













/*
============================================================
ESCENA ACTUALIZADA: VISTA AÉREA DEL AULA
Versión ajustada:
1. Pupitres separados por filas, pero manteniendo la estética anterior.
2. Sillas más pegadas a las mesas.
3. Estudiantes con figura vista desde arriba.
4. Estudiantes entran por la puerta.
5. Estudiantes se sientan en la silla, no en la mesa.
6. Los estudiantes mantienen el mismo tamaño durante toda la animación.
7. La cabeza queda orientada hacia la pizarra.
============================================================
*/

(function () {
  function addAulaAereaSceneStylesV5() {
    if (document.getElementById("aulaAereaSceneStylesV5")) return;

    const style = document.createElement("style");
    style.id = "aulaAereaSceneStylesV5";
    style.textContent = `
      .miniAulaFloorV5 {
        position: absolute;
        left: 10px;
        top: 14px;
        width: 104px;
        height: 118px;
        border-radius: 16px;
        background: #f8fafc;
        border: 4px solid #94a3b8;
        z-index: 2;
      }

      .miniAulaHallV5 {
        position: absolute;
        right: 0;
        top: 0;
        width: 38px;
        height: 100%;
        background: #fde68a;
        border-left: 4px solid #f59e0b;
        z-index: 1;
      }

      .miniAulaBoardV5 {
        position: absolute;
        left: 28px;
        top: 22px;
        width: 66px;
        height: 11px;
        border-radius: 5px;
        background: #16a34a;
        border: 2px solid #15803d;
        z-index: 4;
      }

      .miniAulaDeskV5 {
        position: absolute;
        width: 18px;
        height: 13px;
        border-radius: 5px;
        background: #fbbf24;
        border: 2px solid #92400e;
        z-index: 6;
        box-shadow: 0 3px 4px rgba(15,23,42,.14);
      }

      .miniAulaChairV5 {
        position: absolute;
        width: 15px;
        height: 10px;
        border-radius: 5px;
        background: #cbd5e1;
        border: 2px solid #475569;
        z-index: 5;
      }

      .miniAulaStudentV5 {
        position: absolute;
        width: 16px;
        height: 12px;
        border-radius: 999px;
        background: #facc15;
        border: 2px solid #0f172a;
        z-index: 8;
      }

      .miniAulaStudentV5::before {
        content: "";
        position: absolute;
        left: -7px;
        top: 2px;
        width: 7px;
        height: 8px;
        border-radius: 5px;
        background: #1d4ed8;
        border: 1px solid #0f172a;
      }

      .miniAulaStudentV5::after {
        content: "";
        position: absolute;
        right: -7px;
        top: 2px;
        width: 7px;
        height: 8px;
        border-radius: 5px;
        background: #be123c;
        border: 1px solid #0f172a;
      }

      .aulaAereaSceneV5 {
        position: absolute;
        inset: 0;
        background: #ffffff;
        z-index: 0;
      }

      .aulaAereaRoomV5 {
        position: absolute;
        left: 5%;
        top: 8%;
        width: 72%;
        height: 78%;
        border-radius: 26px;
        background:
          linear-gradient(90deg, rgba(226,232,240,.55) 0 2px, transparent 2px 100%),
          linear-gradient(0deg, rgba(226,232,240,.45) 0 2px, transparent 2px 100%),
          #f8fafc;
        background-size: 42px 42px, 42px 42px, 100% 100%;
        border: 7px solid #64748b;
        box-shadow: 0 14px 24px rgba(15,23,42,.14), inset 0 0 0 7px rgba(255,255,255,.65);
        z-index: 2;
      }

      .aulaAereaRoomV5::after {
        content: "";
        position: absolute;
        right: -8px;
        top: 62%;
        width: 11px;
        height: 22%;
        background: #ffffff;
        border-top: 4px solid #64748b;
        border-bottom: 4px solid #64748b;
        z-index: 5;
      }

      .aulaAereaHallV5 {
        position: absolute;
        right: 0;
        top: 0;
        width: 28%;
        height: 100%;
        background:
          linear-gradient(90deg, rgba(245,158,11,.24) 0 2px, transparent 2px 100%),
          linear-gradient(#fef3c7, #fde68a);
        background-size: 38px 100%, 100% 100%;
        border-left: 6px solid #f59e0b;
        z-index: 1;
      }

      .aulaAereaBoardV5 {
        position: absolute;
        left: 23%;
        top: 12%;
        width: 35%;
        height: 6%;
        border-radius: 10px;
        background: #16a34a;
        border: 5px solid #15803d;
        box-shadow: inset 0 5px rgba(255,255,255,.18);
        z-index: 8;
      }

      .aulaAereaBoardV5::after {
        content: "PIZARRA";
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #dcfce7;
        font-size: clamp(.7rem, 1.4vw, 1rem);
        font-weight: 950;
        letter-spacing: .08em;
      }

      .aulaAereaDoorLabelV5 {
        position: absolute;
        right: 18%;
        top: 59%;
        z-index: 9;
        background: rgba(255,255,255,.92);
        border: 3px solid #f59e0b;
        color: #92400e;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: clamp(.72rem, 1.4vw, .98rem);
        font-weight: 950;
        box-shadow: 0 6px 10px rgba(15,23,42,.10);
      }

      .aulaDoorArrowV5 {
        position: absolute;
        left: 78.5%;
        top: 69%;
        z-index: 13;
        font-size: clamp(1rem, 2.3vw, 1.5rem);
        color: #92400e;
        animation: aulaDoorArrowPulseV5 900ms ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes aulaDoorArrowPulseV5 {
        0%, 100% { transform: translateX(0); opacity: .55; }
        50% { transform: translateX(-8px); opacity: 1; }
      }

      .aulaAereaDeskV5 {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: clamp(38px, 5.3vw, 58px);
        height: clamp(29px, 4vw, 44px);
        border-radius: 12px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.28) 0 22%, transparent 22% 100%),
          linear-gradient(#fbbf24, #d97706);
        border: 4px solid #92400e;
        transform: translate(-50%, -50%);
        z-index: 16;
        box-shadow: 0 8px 12px rgba(15,23,42,.16);
      }

      .aulaAereaChairV5 {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: clamp(34px, 4.7vw, 50px);
        height: clamp(24px, 3.5vw, 36px);
        border-radius: 12px;
        background: linear-gradient(#e2e8f0, #94a3b8);
        border: 4px solid #475569;
        transform: translate(-50%, -50%);
        z-index: 11;
        box-shadow: 0 6px 9px rgba(15,23,42,.15);
      }

      .aulaAereaChairV5::after {
        content: "";
        position: absolute;
        left: 17%;
        right: 17%;
        bottom: -28%;
        height: 28%;
        border-radius: 0 0 10px 10px;
        background: #64748b;
        border: 3px solid #475569;
        border-top: 0;
      }

      .aulaAereaDeskV5.availablePulse {
        animation: aulaDeskPulseV5 1100ms ease-in-out 2;
      }

      @keyframes aulaDeskPulseV5 {
        0%, 100% {
          outline: 4px solid rgba(34,197,94,.0);
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          outline: 4px solid rgba(34,197,94,.65);
          outline-offset: 2px;
          transform: translate(-50%, -50%) scale(1.06);
        }
      }

      .aulaAereaStudentV5 {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: clamp(34px, 4.9vw, 52px);
        height: clamp(22px, 3.2vw, 34px);
        border-radius: 999px;
        background: var(--body-color, #facc15);
        border: 4px solid #0f172a;
        transform: translate(-50%, -50%);
        transform-origin: center center;
        z-index: 25;
        box-shadow: inset 5px 5px rgba(255,255,255,.26), 0 7px 10px rgba(15,23,42,.18);
        will-change: left, top, transform, opacity;
      }

      .aulaAereaStudentV5::before {
        content: "";
        position: absolute;
        left: -28%;
        top: 18%;
        width: 28%;
        height: 64%;
        border-radius: 8px;
        background: var(--left-arm, #1d4ed8);
        border: 3px solid #0f172a;
      }

      .aulaAereaStudentV5::after {
        content: "";
        position: absolute;
        right: -28%;
        top: 18%;
        width: 28%;
        height: 64%;
        border-radius: 8px;
        background: var(--right-arm, #be123c);
        border: 3px solid #0f172a;
      }

      .aulaAereaStudentV5 .studentHeadV5 {
        position: absolute;
        left: 50%;
        top: -50%;
        width: 70%;
        aspect-ratio: 1;
        border-radius: 50%;
        background: #78350f;
        border: 3px solid #451a03;
        transform: translateX(-50%);
        z-index: 4;
        overflow: visible;
      }

      /*
      La cara queda en la parte superior de la cabeza.
      Por eso la figura se interpreta mirando hacia la pizarra.
      */
      .aulaAereaStudentV5 .studentHeadV5::before {
        content: "";
        position: absolute;
        left: 17%;
        top: 7%;
        width: 66%;
        height: 68%;
        border-radius: 50% 50% 45% 45%;
        background: #fed7aa;
        border: 2px solid #c2410c;
        z-index: 6;
      }

      /*
      El pelo queda hacia la parte inferior/posterior de la cabeza.
      */
      .aulaAereaStudentV5 .studentHeadV5::after {
        content: "";
        position: absolute;
        left: 6%;
        bottom: -3%;
        width: 88%;
        height: 45%;
        border-radius: 35% 35% 55% 55%;
        background: #78350f;
        z-index: 7;
      }

      .aulaAereaStudentV5 .studentHairTailV5 {
        position: absolute;
        top: 42%;
        width: 26%;
        height: 38%;
        border-radius: 50%;
        background: #78350f;
        border: 3px solid #451a03;
        z-index: 3;
      }

      .aulaAereaStudentV5 .studentHairTailV5.left {
        left: -20%;
      }

      .aulaAereaStudentV5 .studentHairTailV5.right {
        right: -20%;
      }

      .aulaAereaStudentV5 .studentHairTailV5::after {
        content: "";
        position: absolute;
        left: 28%;
        top: 35%;
        width: 44%;
        height: 18%;
        border-radius: 999px;
        background: #facc15;
        border: 2px solid #92400e;
      }

      .aulaAereaStudentV5.seated {
        z-index: 14;
      }

      .aulaAereaStudentV5.s1 {
        --body-color: #facc15;
        --left-arm: #1d4ed8;
        --right-arm: #be123c;
      }

      .aulaAereaStudentV5.s2 {
        --body-color: #f9a8d4;
        --left-arm: #7c3aed;
        --right-arm: #be185d;
      }

      .aulaAereaStudentV5.s3 {
        --body-color: #86efac;
        --left-arm: #15803d;
        --right-arm: #0e7490;
      }

      .aulaAereaStudentV5.s4 {
        --body-color: #c4b5fd;
        --left-arm: #6d28d9;
        --right-arm: #f97316;
      }

      .aulaAereaStudentV5.s5 {
        --body-color: #fdba74;
        --left-arm: #c2410c;
        --right-arm: #2563eb;
      }

      .aulaAereaStudentV5.s6 {
        --body-color: #67e8f9;
        --left-arm: #0e7490;
        --right-arm: #be185d;
      }

      .aulaAereaOutsideGroupV5 {
        position: absolute;
        right: 3%;
        top: 18%;
        width: 20%;
        min-height: 34px;
        padding: 6px 8px;
        border-radius: 18px;
        background: rgba(255,255,255,.88);
        border: 3px solid #f59e0b;
        color: #92400e;
        font-size: clamp(.72rem, 1.5vw, 1rem);
        font-weight: 950;
        text-align: center;
        z-index: 11;
        box-shadow: 0 8px 14px rgba(15,23,42,.11);
      }

      .aulaAereaSparkV5 {
        position: absolute;
        left: var(--sx);
        top: var(--sy);
        font-size: clamp(18px, 2.5vw, 30px);
        z-index: 40;
        animation: aulaSparkV5 900ms ease-out forwards;
        pointer-events: none;
      }

      @keyframes aulaSparkV5 {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); }
        25% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -120%) scale(1.08); }
      }
    `;
    document.head.appendChild(style);
  }

  function renderAulaAereaPreviewV5(box) {
    addAulaAereaSceneStylesV5();

    box.innerHTML = `
      <div class="miniAulaHallV5"></div>
      <div class="miniAulaFloorV5"></div>
      <div class="miniAulaBoardV5"></div>

      <span class="miniAulaChairV5" style="left:29px;top:59px"></span>
      <span class="miniAulaDeskV5" style="left:29px;top:49px"></span>

      <span class="miniAulaChairV5" style="left:59px;top:59px"></span>
      <span class="miniAulaDeskV5" style="left:59px;top:49px"></span>

      <span class="miniAulaChairV5" style="left:89px;top:59px"></span>
      <span class="miniAulaDeskV5" style="left:89px;top:49px"></span>

      <span class="miniAulaChairV5" style="left:29px;top:94px"></span>
      <span class="miniAulaDeskV5" style="left:29px;top:84px"></span>

      <span class="miniAulaChairV5" style="left:59px;top:94px"></span>
      <span class="miniAulaDeskV5" style="left:59px;top:84px"></span>

      <span class="miniAulaChairV5" style="left:89px;top:94px"></span>
      <span class="miniAulaDeskV5" style="left:89px;top:84px"></span>

      <span class="miniAulaStudentV5" style="right:10px;top:49px"></span>
      <span class="miniAulaStudentV5 s2" style="right:16px;top:76px"></span>
      <span class="miniAulaStudentV5 s3" style="right:8px;top:103px"></span>
    `;
  }

  /*
  Filas más separadas verticalmente.
  Esto evita que la silla de una fila se pegue a la mesa de la fila siguiente.
  */
  const aulaDeskPositionsV5 = [
    { x: 17, y: 25 }, { x: 34, y: 25 }, { x: 51, y: 25 }, { x: 68, y: 25 },
    { x: 17, y: 45 }, { x: 34, y: 45 }, { x: 51, y: 45 }, { x: 68, y: 45 },
    { x: 17, y: 65 }, { x: 34, y: 65 }, { x: 51, y: 65 }, { x: 68, y: 65 },
    { x: 17, y: 84 }, { x: 34, y: 84 }, { x: 51, y: 84 }, { x: 68, y: 84 }
  ];

  /*
  La silla queda más pegada a la mesa.
  */
  function aulaChairPositionV5(pos) {
    return {
      x: pos.x,
      y: pos.y + 5.2
    };
  }

  const aulaStudentOutsidePositionsV5 = [
    { x: 88, y: 33 }, { x: 92, y: 41 }, { x: 85, y: 48 }, { x: 93, y: 55 },
    { x: 87, y: 62 }, { x: 94, y: 69 }, { x: 86, y: 76 }, { x: 92, y: 82 },
    { x: 84, y: 88 }, { x: 95, y: 28 }, { x: 88, y: 22 }, { x: 94, y: 75 }
  ];

  function aulaDeskWordV5(count) {
    if (isEnglish()) return Number(count) === 1 ? "desk" : "desks";
    return Number(count) === 1 ? "pupitre" : "pupitres";
  }

  function aulaStudentWordV5(count) {
    if (isEnglish()) return Number(count) === 1 ? "student" : "students";
    return Number(count) === 1 ? "estudiante" : "estudiantes";
  }

  function createAulaDeskV5(id, pos) {
    const desk = document.createElement("div");
    desk.className = "aulaAereaDeskV5";
    desk.dataset.id = id;
    desk.style.left = `${pos.x}%`;
    desk.style.top = `${pos.y}%`;
    desk.style.setProperty("--x", `${pos.x}%`);
    desk.style.setProperty("--y", `${pos.y}%`);
    return desk;
  }

  function createAulaChairV5(id, pos) {
    const chairPos = aulaChairPositionV5(pos);
    const chair = document.createElement("div");
    chair.className = "aulaAereaChairV5";
    chair.dataset.id = id;
    chair.style.left = `${chairPos.x}%`;
    chair.style.top = `${chairPos.y}%`;
    chair.style.setProperty("--x", `${chairPos.x}%`);
    chair.style.setProperty("--y", `${chairPos.y}%`);
    return chair;
  }

  function createAulaStudentV5(id, pos) {
    const student = document.createElement("div");
    student.className = `aulaAereaStudentV5 s${(id % 6) + 1}`;
    student.dataset.id = id;
    student.style.left = `${pos.x}%`;
    student.style.top = `${pos.y}%`;
    student.style.setProperty("--x", `${pos.x}%`);
    student.style.setProperty("--y", `${pos.y}%`);

    const head = document.createElement("div");
    head.className = "studentHeadV5";

    const leftTail = document.createElement("div");
    leftTail.className = "studentHairTailV5 left";

    const rightTail = document.createElement("div");
    rightTail.className = "studentHairTailV5 right";

    head.append(leftTail, rightTail);
    student.appendChild(head);

    return student;
  }

  function addAulaSparkV5(x, y, delay = 0) {
    setTimeout(() => {
      const spark = document.createElement("div");
      spark.className = "aulaAereaSparkV5";
      spark.textContent = "✨";
      spark.style.setProperty("--sx", `${x}%`);
      spark.style.setProperty("--sy", `${y}%`);
      scene.appendChild(spark);
      setTimeout(() => spark.remove(), 1000);
    }, delay);
  }

  function renderAulaAereaSceneV5() {
    addAulaAereaSceneStylesV5();

    const chrome = preserveSceneActions();
    scene.innerHTML = `
      <div class="aulaAereaSceneV5"></div>
      <div class="aulaAereaHallV5"></div>
      <div class="aulaAereaRoomV5"></div>
      <div class="aulaAereaBoardV5"></div>
      <div class="aulaAereaDoorLabelV5">${isEnglish() ? "Door" : "Puerta"}</div>
      <div class="aulaDoorArrowV5">⬅</div>
      <div class="aulaAereaOutsideGroupV5">${isEnglish() ? "Students outside" : "Estudiantes afuera"}</div>
    `;
    restoreSceneActions(chrome);

    state.movingIds = [];

    for (let i = 0; i < state.total; i++) {
      const pos = aulaDeskPositionsV5[i % aulaDeskPositionsV5.length];
      scene.appendChild(createAulaChairV5(i, pos));
      scene.appendChild(createAulaDeskV5(i, pos));
    }

    for (let i = 0; i < state.change; i++) {
      state.movingIds.push(i);
      const pos = aulaStudentOutsidePositionsV5[i % aulaStudentOutsidePositionsV5.length];
      scene.appendChild(createAulaStudentV5(i, pos));
    }
  }

  function animateAulaAereaV5() {
    if (state.animated) return;
    state.animated = true;

    feedback.className = "feedback";
    feedback.textContent = isEnglish()
      ? `Watch how ${state.change === 1 ? "one student enters through the door and sits down" : "some students enter through the door and sit down"}. The desks without students are the answer.`
      : `Observa cómo ${state.change === 1 ? "un estudiante entra por la puerta y se sienta" : "algunos estudiantes entran por la puerta y se sientan"}. Los pupitres sin estudiantes son la respuesta.`;

    updateText();

    state.movingIds.forEach((id, index) => {
      const student = scene.querySelector(`.aulaAereaStudentV5[data-id="${id}"]`);
      const desk = scene.querySelector(`.aulaAereaDeskV5[data-id="${index}"]`);
      const baseDesk = aulaDeskPositionsV5[index % aulaDeskPositionsV5.length];
      const chairTarget = aulaChairPositionV5(baseDesk);

      if (!student || !desk) return;

      const delay = index * 280;

      setTimeout(() => {
        const anim = student.animate([
          {
            left: student.style.left,
            top: student.style.top,
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            opacity: 1,
            offset: 0
          },
          {
            left: "86%",
            top: "69%",
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            opacity: 1,
            offset: .30
          },
          {
            left: "77%",
            top: "69%",
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            opacity: 1,
            offset: .50
          },
          {
            left: `${Math.max(chairTarget.x, 70)}%`,
            top: `${chairTarget.y}%`,
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            opacity: 1,
            offset: .70
          },
          {
            left: `${chairTarget.x}%`,
            top: `${chairTarget.y}%`,
            transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
            opacity: 1,
            offset: 1
          }
        ], {
          duration: 1450,
          easing: "cubic-bezier(.2,.82,.25,1)",
          fill: "forwards"
        });

        anim.onfinish = () => {
          student.classList.add("seated");
          student.style.left = `${chairTarget.x}%`;
          student.style.top = `${chairTarget.y}%`;
          student.style.transform = "translate(-50%, -50%) scale(1) rotate(0deg)";
          desk.classList.add("occupiedDesk");
          addAulaSparkV5(chairTarget.x, chairTarget.y - 3.2, 0);
        };
      }, delay + 80);
    });

    const finalDelay = state.change * 280 + 1700;
    setTimeout(() => {
      for (let i = state.change; i < state.total; i++) {
        const desk = scene.querySelector(`.aulaAereaDeskV5[data-id="${i}"]`);
        if (desk) desk.classList.add("availablePulse");
      }
    }, finalDelay);

    speak(state.currentProblem.speak(getName(), state.total, state.change));
  }

  registerScene({
    id: "aulaPupitresDesocupados",
    operation: "subtraction",

    itemSingular: "pupitre",
    itemPlural: "pupitres",
    itemSingularEn: "desk",
    itemPluralEn: "desks",

    minTotal: 5,
    maxTotal: 16,
    minChange: 1,
    maxChange: 10,

    texts: {
      es: {
        title: "Pupitres en el aula",
        short: "Hay pupitres en un aula y algunos estudiantes entran y se sientan.",
        badge: "🪑 Resta",
        animateLabel: "🪑 Ver cómo entran",
        sceneTitle: "Observa cuántos pupitres quedan desocupados",
        answerQuestion: "¿Cuántos pupitres quedan desocupados?"
      },
      en: {
        title: "Desks in the classroom",
        short: "There are desks in a classroom and some students enter and sit down.",
        badge: "🪑 Subtraction",
        animateLabel: "🪑 Watch students enter",
        sceneTitle: "Watch how many desks are left empty",
        answerQuestion: "How many desks are left empty?"
      }
    },

    renderPreview: renderAulaAereaPreviewV5,
    renderScene: renderAulaAereaSceneV5,
    animate: animateAulaAereaV5,

    story: (name, total, change, highlight = false) => {
      if (isEnglish()) {
        return `In a classroom there are <strong>${total}</strong> ${aulaDeskWordV5(total)}. A group of students is outside the classroom, and <strong>${change}</strong> ${aulaStudentWordV5(change)} <span class="${highlight ? "keyAction" : ""}">enter and sit down</span>. How many desks are left empty?`;
      }

      return `En un aula hay <strong>${total}</strong> ${aulaDeskWordV5(total)}. Afuera del aula hay un grupo de estudiantes y <span class="${highlight ? "keyAction" : ""}">se sientan</span> <strong>${change}</strong> ${aulaStudentWordV5(change)}. ¿Cuántos pupitres quedan desocupados?`;
    },

    speak: (name, total, change) => {
      if (isEnglish()) {
        return `In a classroom there are ${total} ${aulaDeskWordV5(total)}. A group of students is outside the classroom, and ${change} ${aulaStudentWordV5(change)} enter and sit down. How many desks are left empty?`;
      }

      return `En un aula hay ${total} ${aulaDeskWordV5(total)}. Afuera del aula hay un grupo de estudiantes y se sientan ${change} ${aulaStudentWordV5(change)}. ¿Cuántos pupitres quedan desocupados?`;
    },

    hintData: (total, change) => isEnglish()
      ? `Start amount: there are <strong>${total}</strong> ${aulaDeskWordV5(total)}. Change: <strong>${change}</strong> ${aulaStudentWordV5(change)} enter and sit down.`
      : `Dato inicial: hay <strong>${total}</strong> ${aulaDeskWordV5(total)}. Cambio: se sientan <strong>${change}</strong> ${aulaStudentWordV5(change)}.`,

    hintKeyword: () => isEnglish()
      ? `The key words are <strong>sit down</strong>. Each student uses one desk, so the number of empty desks decreases.`
      : `La palabra clave es <strong>se sientan</strong>. Cada estudiante ocupa un pupitre, por eso disminuyen los pupitres desocupados.`,

    hintOperation: (total, change) => isEnglish()
      ? `Because some desks become occupied, use <strong>subtraction</strong>: <strong>${total} − ${change}</strong>.`
      : `Como algunos pupitres quedan ocupados, se usa una <strong>resta</strong>: <strong>${total} − ${change}</strong>.`
  });
})();