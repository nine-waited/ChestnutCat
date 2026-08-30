const STORAGE_KEY = "chestnut-pet";
const ASSET_VER = "20260829a";
const BUBBLE_STYLE = {
  A: "chestnut-pet-label",
  B: "chestnut-pet-amount",
  P: "chestnut-pet-period",
  C: "chestnut-pet-hint",
};
const BUBBLE_SVG =
  '<svg viewBox="0 0 1026 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
  '<path class="chestnut-bshape" fill="#fff7ea" stroke="#4a2a16" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" d="M 827 248 A 373 232 0 1 0 81 246 A 373 232 0 0 0 301 465 A 57 32 10 0 0 413 484 A 373 232 0 0 0 827 248 Z"/>' +
  '<ellipse class="chestnut-b1" cx="352" cy="561" rx="37.5" ry="26" fill="#fff7ea" stroke="#4a2a16" stroke-width="18"/>' +
  '<ellipse class="chestnut-b2" cx="442" cy="646" rx="24.5" ry="18" fill="#fff7ea" stroke="#4a2a16" stroke-width="18"/>' +
  "</svg>";
const CLICKS_TO_BURST = 5;
const CLICK_WINDOW_MS = 1200;
const BURST_MS = 5000;
const SHY_MS = 8000;
const BUBBLE_MS = 5000;
const BLINK_GAPS = [2000, 4000];
const POSE_MIN_MS = 10000;
const POSE_VAR_MS = 10000;
const POSE_HOLD_MS = 5000;

const EXPR = {
  idle: "idle.png",
  angry: "angry.png",
  shy: "shy.png",
  disappointed: "disappointed.png",
  exhausted: "exhausted.png",
  stroking: "stroking.png",
  close_eyes: "close_eyes.png",
  half_closed_eyes: "half_closed_eyes.png",
  ok: "ok.png",
  sad: "sad.png",
  quiet: "quiet.png",
  cheer: "cheer.png",
  fatfish: "fatfish.png",
  mock: "mock.png",
  what: "what.png",
  scared: "scared.png",
  greet: "greet.png",
  thumbsup: "thumbsup.png",
};

const EMOTION_POOL = [
  "angry",
  "shy",
  "disappointed",
  "exhausted",
  "ok",
  "sad",
  "quiet",
  "cheer",
  "fatfish",
  "mock",
  "what",
  "scared",
  "greet",
  "thumbsup",
];

const EMOTION_LINES = {
  angry: ["点这么急，本猫要炸毛了。", "再点，尾巴抽你。", "哼，本座还没睡醒。"],
  shy: ["看够了吗……耳朵有点热。", "别盯着本座的脸。", "被点害羞了，本猫先躲一下。"],
  disappointed: ["点完就走？本猫还没躺平。", "哦，原来你这么忙。", "本座有点无聊了。"],
  exhausted: ["点累了，本座先躺平。", "别催，本猫在充电。", "Zzz……再吵就咬你。"],
  ok: ["行吧，本猫勉强答应。", "嗯，过关了。", "好啦好啦，本座知道了。"],
  sad: ["罐头呢，本座有点委屈。", "你是不是把本猫忘了。", "今天也可以摸摸头的……"],
  quiet: ["嘘，本座在偷懒，别出声。", "安静点，耳朵要休息。", "本猫现在不想说话。"],
  cheer: ["加油……本猫在旁边躺着给你打气。", "写完请投喂。", "本座批准你再写一句。"],
  fatfish: ["别催，本猫有自己的节奏。", "急什么，罐头又不会跑。", "本座今天的配额用完了。"],
  mock: ["点得挺勤，字写了吗。", "哼，被本猫看穿了。", "就这？本座还可以更懒。"],
  what: ["嗯？你点本座干什么。", "发生什么事了，本猫没睡醒。", "哈？再点一遍试试。"],
  scared: ["啊——点太快了！", "吓到本猫了，爪子都收不回来。", "轻一点，本座心脏小。"],
  greet: ["嗨……本猫还在呢。", "又见面了，摸摸也行。", "懒洋洋地跟你打个招呼。"],
  thumbsup: ["不错嘛，本座给你点个爪。", "过得去，赏你一记拇指。", "嗯，本猫认可你一下。"],
};

export const PET_ASSET_FILES = [
  "Ya1.mp3",
  "Ya2.mp3",
  ...Object.values(EXPR).map((file) => `expr/${file}`),
];

const DEFAULT_LINES = [
  "板栗来啦，今天也要摸摸头。",
  "罐头呢？本猫娘饿了。",
  "你再点，耳朵要炸毛了。",
  "尾巴摇给你看，看见了吗。",
  "工作再忙，也记得眨眨眼。",
  "喵，本座批准你休息五分钟。",
];

const defaultState = () => ({
  scale: 1,
  sound: true,
  left: null,
  top: null,
  customLines: [],
  manualExpr: "",
});

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function singleCenter(style, text, color, wrap) {
  return [null, { t: text, s: style, c: color || "", w: !!wrap }, null];
}

export function mountChestnutPet(options = {}) {
  const assetBase = (options.assetBase || "../assets").replace(/\/$/, "");
  const assetMap = options.assetMap && typeof options.assetMap === "object" ? options.assetMap : null;
  const host = options.host || document.body;
  const saved = loadState();
  let currentStats = options.stats || null;

  const root = el("div", "chestnut-pet");
  const body = el("div", "chestnut-pet-body");
  const img = el("img", "chestnut-pet-img");
  img.alt = "Chestnut";
  const bubble = el("div", "chestnut-pet-bubble");
  bubble.innerHTML = BUBBLE_SVG;
  const textBox = el("div", "chestnut-pet-text");
  const labelEl = el("div", "chestnut-pet-label");
  const amountEl = el("div", "chestnut-pet-amount");
  const hintEl = el("div", "chestnut-pet-hint");
  textBox.append(labelEl, amountEl, hintEl);
  bubble.appendChild(textBox);
  const menuBtn = el("button", "chestnut-pet-menu-btn");
  menuBtn.type = "button";
  menuBtn.textContent = "≡";
  const menu = buildMenu(saved);
  body.append(img, bubble);
  root.append(body, menuBtn);
  host.appendChild(root);
  document.body.appendChild(menu);
  root.style.setProperty("--pet-scale", String(saved.scale));

  if (typeof saved.left === "number" && typeof saved.top === "number") {
    place(root, saved.left, saved.top);
  }

  const loaded = {};
  const prefetch = {};
  let want = "";
  let current = "";
  let mood = "normal";
  let pressing = false;
  let dragging = false;
  let moved = false;
  let pointerId = null;
  let grabX = 0;
  let grabY = 0;
  let clickLog = [];
  let moodTimer = 0;
  let hoverTimer = 0;
  let blinkTimer = 0;
  let blinkStepTimer = 0;
  let bubbleTimer = 0;
  let burstExpr = "";
  let lastBurstExpr = "";
  let poseExpr = "";
  let poseTimer = 0;
  let cuteTimer = 0;
  let bubbleSwapTimer = 0;
  let bubbleShown = false;
  let bubbleRandomActive = false;
  let bubbleRandomLines = null;
  let pressAudio = null;
  let releaseAudio = null;

  Object.keys(EXPR).forEach((name) => preload(name));
  setExpr("idle");
  scheduleBlink();
  schedulePose();
  setupAudio();

  body.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  body.addEventListener("pointerenter", onHoverStart);
  body.addEventListener("pointerleave", onHoverEnd);
  body.addEventListener("click", onClick);
  bubble.addEventListener("pointerdown", (event) => event.stopPropagation());
  bubble.addEventListener("click", onBubbleClick);
  menuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    menuBtn.classList.toggle("is-open", open);
    if (open) {
      menu.style.visibility = "hidden";
      positionMenu();
      menu.style.visibility = "";
    }
  });
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, true);
  document.addEventListener("pointerdown", onDocPointerDown, true);

  function onViewportChange() {
    if (menu.classList.contains("is-open")) positionMenu();
  }

  function onDocPointerDown(event) {
    if (!menu.classList.contains("is-open")) return;
    if (menu.contains(event.target) || menuBtn.contains(event.target)) return;
    menu.classList.remove("is-open");
    menuBtn.classList.remove("is-open");
  }

  function viewSize() {
    const view = window.visualViewport;
    return {
      width: view?.width ?? window.innerWidth,
      height: view?.height ?? window.innerHeight,
    };
  }

  function positionMenu() {
    const pad = 8;
    const gap = 8;
    const view = viewSize();
    const btn = menuBtn.getBoundingClientRect();
    const menuWidth = Math.min(210, Math.max(120, view.width - pad * 2));

    menu.style.maxHeight = "none";
    const naturalHeight = menu.scrollHeight || 280;
    const spaceAbove = btn.top - pad;
    const spaceBelow = view.height - btn.bottom - pad;
    const need = naturalHeight + gap;
    const openUp = spaceAbove >= need || (spaceBelow < need && spaceAbove >= spaceBelow);

    const sideSpace = Math.max(0, (openUp ? spaceAbove : spaceBelow) - gap);
    const viewportMax = Math.max(64, view.height - pad * 2);
    const maxH = Math.min(naturalHeight, sideSpace || viewportMax, viewportMax);
    menu.style.maxHeight = `${Math.round(maxH)}px`;
    menu.style.width = `${Math.round(menuWidth)}px`;

    const height = Math.min(menu.offsetHeight || maxH, maxH);
    let top = openUp ? btn.top - gap - height : btn.bottom + gap;
    const minTop = pad;
    const maxTop = view.height - pad - height;
    top = Math.min(Math.max(minTop, top), Math.max(minTop, maxTop));

    let left = btn.right - menuWidth;
    const maxLeft = view.width - pad - menuWidth;
    left = Math.min(Math.max(pad, left), Math.max(pad, maxLeft));

    menu.style.left = `${Math.round(left)}px`;
    menu.style.top = `${Math.round(top)}px`;
  }

  function assetPath(rel) {
    const key = String(rel).split("?")[0];
    if (assetMap && assetMap[key]) return assetMap[key];
    return `${assetBase}/${key}`;
  }

  function exprUrl(name) {
    return assetPath(`expr/${EXPR[name] || EXPR.idle}`);
  }

  function preload(name) {
    const url = exprUrl(name);
    if (prefetch[url] || loaded[url]) return;
    const image = new Image();
    prefetch[url] = image;
    image.onload = () => {
      loaded[url] = true;
      delete prefetch[url];
      if (want === url) {
        current = url;
        img.src = url;
      }
    };
    image.onerror = () => {
      delete prefetch[url];
    };
    image.src = url;
  }

  function setExpr(name) {
    const url = exprUrl(name);
    want = url;
    if (loaded[url]) {
      if (current === url) return;
      current = url;
      img.src = url;
      return;
    }
    preload(name);
  }

  function applyIcon() {
    if (saved.manualExpr) {
      setExpr(pressing ? "stroking" : saved.manualExpr);
      return;
    }
    if (mood === "burst" && burstExpr) return setExpr(burstExpr);
    if (mood === "shy") return setExpr("shy");
    if (pressing) return setExpr("stroking");
    if (poseExpr) return setExpr(poseExpr);
    setExpr("idle");
  }

  function onDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest?.(".chestnut-pet-bubble")) return;
    pressing = true;
    dragging = true;
    moved = false;
    pointerId = event.pointerId;
    grabX = event.clientX - root.getBoundingClientRect().left;
    grabY = event.clientY - root.getBoundingClientRect().top;
    root.classList.add("is-pressing", "is-dragging");
    applyIcon();
    play(pressAudio);
    cancelBlink();
    clearPose();
    body.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function onMove(event) {
    if (!dragging || (pointerId != null && event.pointerId !== pointerId)) return;
    const hostRect = (root.parentElement || document.body).getBoundingClientRect();
    const left = event.clientX - hostRect.left - grabX;
    const top = event.clientY - hostRect.top - grabY;
    if (Math.abs(event.movementX) + Math.abs(event.movementY) > 2) moved = true;
    place(root, left, top);
    saved.left = root.offsetLeft;
    saved.top = root.offsetTop;
    if (menu.classList.contains("is-open")) positionMenu();
  }

  function onUp(event) {
    if (pointerId == null || event.pointerId !== pointerId) return;
    pressing = false;
    dragging = false;
    pointerId = null;
    root.classList.remove("is-pressing", "is-dragging");
    applyIcon();
    play(releaseAudio);
    persist();
    scheduleBlink();
    schedulePose();
  }

  function onClick() {
    if (moved) return;
    if (registerClick()) {
      enterBurstEmotion();
      return;
    }
    if (mood === "burst") return;
    showBubble();
  }

  function onBubbleClick(event) {
    event.stopPropagation();
    if (!bubbleShown) return;
    if (bubbleRandomActive) {
      hideBubble();
      return;
    }
    bubbleRandomActive = true;
    bubbleRandomLines = pickRandomLines();
    swapBubbleContent(() => applyBubbleLines(bubbleRandomLines));
  }

  function onHoverStart() {
    if (mood !== "normal") return;
    window.clearTimeout(hoverTimer);
    hoverTimer = window.setTimeout(() => {
      if (saved.manualExpr) return;
      mood = "shy";
      cancelBlink();
      clearPose();
      setExpr("shy");
      const line = emotionLine("shy");
      if (line) say(line);
      moodTimer = window.setTimeout(exitMood, BURST_MS);
    }, SHY_MS);
  }

  function onHoverEnd() {
    window.clearTimeout(hoverTimer);
  }

  function registerClick() {
    const now = Date.now();
    clickLog = clickLog.filter((t) => now - t < CLICK_WINDOW_MS);
    clickLog.push(now);
    return clickLog.length >= CLICKS_TO_BURST;
  }

  function enterBurstEmotion() {
    if (saved.manualExpr) return;
    const pool = EMOTION_POOL.filter((name) => name !== lastBurstExpr);
    const pick = pickOne(pool.length ? pool : EMOTION_POOL);
    lastBurstExpr = pick;
    burstExpr = pick;
    mood = "burst";
    clickLog = [];
    cancelBlink();
    clearPose();
    setExpr(pick);
    const line = emotionLine(pick);
    say(line || pickOne(DEFAULT_LINES) || "喵。");
    window.clearTimeout(moodTimer);
    moodTimer = window.setTimeout(exitMood, BURST_MS);
  }

  function exitMood() {
    mood = "normal";
    burstExpr = "";
    applyIcon();
    scheduleBlink();
    schedulePose();
  }

  function emotionLine(name) {
    const lines = EMOTION_LINES[name];
    if (!lines || !lines.length) return "";
    return pickOne(lines);
  }

  function canIdleAnimate() {
    return mood === "normal" && !pressing && !saved.manualExpr;
  }

  function canBlink() {
    return canIdleAnimate() && !poseExpr;
  }

  function scheduleBlink() {
    cancelBlink();
    if (!canBlink()) return;
    blinkTimer = window.setTimeout(() => {
      if (!canBlink()) {
        scheduleBlink();
        return;
      }
      setExpr("close_eyes");
      blinkStepTimer = window.setTimeout(() => {
        if (!canBlink()) return;
        applyIcon();
        scheduleBlink();
      }, 180);
    }, pickOne(BLINK_GAPS));
  }

  function cancelBlink() {
    window.clearTimeout(blinkTimer);
    window.clearTimeout(blinkStepTimer);
    blinkTimer = 0;
    blinkStepTimer = 0;
  }

  function clearPose() {
    window.clearTimeout(poseTimer);
    poseTimer = 0;
    poseExpr = "";
  }

  function schedulePose() {
    window.clearTimeout(cuteTimer);
    if (!canIdleAnimate()) return;
    cuteTimer = window.setTimeout(() => {
      if (!canIdleAnimate() || poseExpr) {
        schedulePose();
        return;
      }
      const pool = EMOTION_POOL.filter((name) => name !== lastBurstExpr);
      const pick = pickOne(pool.length ? pool : EMOTION_POOL);
      lastBurstExpr = pick;
      poseExpr = pick;
      cancelBlink();
      setExpr(pick);
      const line = emotionLine(pick);
      if (line) say(line);
      poseTimer = window.setTimeout(() => {
        poseExpr = "";
        poseTimer = 0;
        if (canIdleAnimate()) applyIcon();
        scheduleBlink();
        schedulePose();
      }, POSE_HOLD_MS);
    }, POSE_MIN_MS + Math.random() * POSE_VAR_MS);
  }

  function defaultBubbleLines() {
    if (currentStats) {
      return [
        { t: "今日字数", s: "A", c: "" },
        { t: String(currentStats.todayInsertedUnits ?? 0), s: "B", c: "" },
        { t: `总共 ${currentStats.totalMarkdownUnits ?? 0} 字`, s: "C", c: "" },
      ];
    }
    return [
      { t: "板栗猫娘", s: "A", c: "" },
      { t: "喵", s: "B", c: "" },
      { t: "点气泡看台词", s: "C", c: "" },
    ];
  }

  function applyBubbleLines(lines) {
    const nodes = [labelEl, amountEl, hintEl];
    for (let i = 0; i < 3; i++) {
      const node = nodes[i];
      const line = lines && lines[i];
      if (line) {
        node.style.display = "";
        node.className = `${BUBBLE_STYLE[line.s] || "chestnut-pet-label"}${line.w ? " chestnut-pet-wrap" : ""}`;
        node.textContent = line.t;
        node.style.color = line.c || "";
      } else {
        node.style.display = "none";
        node.textContent = "";
        node.style.color = "";
      }
    }
  }

  function applyMoodBubble(text) {
    applyBubbleLines(singleCenter("A", text, "", true));
  }

  function pickRandomLines() {
    const custom = saved.customLines.filter(Boolean);
    if (custom.length) return singleCenter("A", pickOne(custom), "", true);
    const text = pickOne(DEFAULT_LINES) || "喵。";
    return singleCenter("A", text, "", true);
  }

  function swapBubbleContent(applyFn) {
    window.clearTimeout(bubbleSwapTimer);
    textBox.style.transition = "opacity 0.18s ease";
    textBox.style.opacity = "0";
    bubbleSwapTimer = window.setTimeout(() => {
      bubbleSwapTimer = 0;
      applyFn();
      textBox.style.opacity = "1";
      window.setTimeout(() => {
        textBox.style.transition = "";
        textBox.style.opacity = "";
      }, 220);
    }, 190);
  }

  function restoreBubbleLines() {
    window.clearTimeout(bubbleSwapTimer);
    bubbleSwapTimer = 0;
    textBox.style.transition = "";
    textBox.style.opacity = "";
    applyBubbleLines(defaultBubbleLines());
  }

  function showBubble() {
    window.clearTimeout(bubbleTimer);
    window.clearTimeout(bubbleSwapTimer);
    bubbleSwapTimer = 0;
    bubbleShown = true;
    bubbleRandomActive = false;
    restoreBubbleLines();
    bubble.classList.add("is-open");
    bubbleTimer = window.setTimeout(hideBubble, BUBBLE_MS);
  }

  function hideBubble() {
    window.clearTimeout(bubbleTimer);
    window.clearTimeout(bubbleSwapTimer);
    bubbleTimer = 0;
    bubbleSwapTimer = 0;
    textBox.style.transition = "";
    textBox.style.opacity = "";
    bubbleRandomActive = false;
    bubbleRandomLines = null;
    bubbleShown = false;
    bubble.classList.remove("is-open");
  }

  function say(text) {
    showBubble();
    if (text) applyMoodBubble(String(text));
  }

  function setupAudio() {
    try {
      pressAudio = new Audio(assetPath("Ya1.mp3"));
      releaseAudio = new Audio(assetPath("Ya2.mp3"));
      pressAudio.preload = "auto";
      releaseAudio.preload = "auto";
    } catch {
      /* ignore */
    }
  }

  function play(audio) {
    if (!saved.sound || !audio) return;
    try {
      audio.currentTime = 0;
      audio.play()?.catch(() => {});
    } catch {
      /* ignore */
    }
  }

  function applyScale(scale) {
    const host = root.parentElement || document.body;
    const hostRect =
      host === document.body
        ? { left: 0, top: 0 }
        : host.getBoundingClientRect();
    const rect = root.getBoundingClientRect();
    const pinRight = rect.right - hostRect.left;
    const pinBottom = rect.bottom - hostRect.top;
    saved.scale = scale;
    root.style.setProperty("--pet-scale", String(scale));
    place(root, pinRight - root.offsetWidth, pinBottom - root.offsetHeight, { keepFlip: true });
    saved.left = root.offsetLeft;
    saved.top = root.offsetTop;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }

  function buildMenu(state) {
    const box = el("div", "chestnut-pet-menu");
    box.innerHTML = `
      <label>大小</label>
      <input type="range" min="0.6" max="2.5" step="0.1" value="${state.scale}" data-field="scale" />
      <label>锁定表情</label>
      <select data-field="manualExpr">
        <option value="">自动</option>
        ${Object.keys(EXPR).map((name) => `<option value="${name}">${name}</option>`).join("")}
      </select>
      <label><input type="checkbox" data-field="sound" ${state.sound ? "checked" : ""} /> 音效</label>
      <div class="chestnut-pet-menu-stats" data-field="inventory" hidden></div>
      <label>自定义台词（一行一句）</label>
      <textarea data-field="customLines">${state.customLines.join("\n")}</textarea>
      <button type="button" data-action="save">保存台词</button>
    `;
    box.querySelector('[data-field="scale"]').addEventListener("input", (event) => {
      applyScale(Number(event.target.value));
      persist();
      if (box.classList.contains("is-open")) positionMenu();
    });
    box.querySelector('[data-field="manualExpr"]').addEventListener("change", (event) => {
      state.manualExpr = event.target.value;
      persist();
      applyIcon();
      scheduleBlink();
      schedulePose();
    });
    box.querySelector('[data-field="sound"]').addEventListener("change", (event) => {
      state.sound = event.target.checked;
      persist();
    });
    box.querySelector('[data-action="save"]').addEventListener("click", () => {
      state.customLines = box
        .querySelector('[data-field="customLines"]')
        .value.split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      persist();
      say("台词记下了。");
    });
    return box;
  }

  function setStats(stats) {
    currentStats = stats || null;
    if (bubbleShown && !bubbleRandomActive) restoreBubbleLines();
    const inv = menu.querySelector('[data-field="inventory"]');
    if (!inv) return;
    if (!currentStats) {
      inv.hidden = true;
      inv.textContent = "";
      return;
    }
    const inventory = currentStats.inventory || {};
    inv.hidden = false;
    inv.innerHTML = `
      <div>今日输入 ${currentStats.todayInsertedUnits}</div>
      <div>库内字数 ${currentStats.totalMarkdownUnits}</div>
      <div>Markdown ${inventory.markdownFiles ?? 0}</div>
      <div>Excalidraw ${inventory.excalidrawFiles ?? 0}</div>
      <div>图片 ${inventory.imageFiles ?? 0}</div>
    `;
  }

  setStats(currentStats);

  return {
    root,
    say,
    setStats,
    destroy() {
      window.clearTimeout(moodTimer);
      window.clearTimeout(hoverTimer);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(blinkStepTimer);
      window.clearTimeout(poseTimer);
      window.clearTimeout(cuteTimer);
      window.clearTimeout(bubbleTimer);
      window.clearTimeout(bubbleSwapTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      menu.remove();
      root.remove();
    },
  };
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return { ...defaultState(), ...(raw && typeof raw === "object" ? raw : {}) };
  } catch {
    return defaultState();
  }
}

function place(root, left, top, opts = {}) {
  const host = root.parentElement || document.body;
  const width = host === document.body ? window.innerWidth : host.getBoundingClientRect().width;
  const height = host === document.body ? window.innerHeight : host.getBoundingClientRect().height;
  const boxW = root.offsetWidth;
  const boxH = root.offsetHeight;
  const maxLeft = Math.max(0, width - boxW);
  const maxTop = Math.max(0, height - boxH);
  const x = Math.min(maxLeft, Math.max(0, left));
  const y = Math.min(maxTop, Math.max(0, top));
  root.style.left = "auto";
  root.style.top = "auto";
  root.style.right = `${Math.round(width - x - boxW)}px`;
  root.style.bottom = `${Math.round(height - y - boxH)}px`;
  if (!opts.keepFlip) root.classList.toggle("is-left", x < width / 2);
}

function el(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}
