/* ===== ROMAN // ULTIMATE PORTFOLIO =====
   Upgrades included:
   1) Emotionally stronger hero + modes
   2) Case study template + modal (Sentinel deep dive done)
   3) Command palette (press "/")
   4) Timeline XP system (slider + milestones)
   5) One full deep dive (Sentinel)
*/

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

const STORAGE_KEY = "romanPortfolioContentV3";
const THEME_KEY = "romanTheme";
const SFX_KEY = "romanSfx";
const XP_KEY = "romanXp";

/* ---------- Defaults (fallback) ---------- */
const DEFAULT_CONTENT = {
  name: "Roman",
  age: 16,
  experienceYears: 2,
  subtitle: "Discord Bot Developer · Web Apps · APIs",
  heroLine: "Started coding at 14. Two years later, I'm building Discord systems — and learning the CS fundamentals behind it.",
  bio: "I’m Roman — a 16-year-old developer obsessed with building reliable software.",
  nowBuilding: "A next-gen moderation bot + dashboard stack.",
  focusLine: "Performance · Permissions · Clean architecture",
  discordUserId: "",
  discordTag: "roman#0000",
  email: "roman@example.com",
  links: { github: "https://github.com/" },
  stats: [],
  skills: [],
  timeline: [],
  xp: { current: 0, label: "Builder" },
  projects: [],
  services: []
};

async function loadContent(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    try{ return { ...DEFAULT_CONTENT, ...JSON.parse(saved) }; }catch(e){}
  }
  try{
    const res = await fetch("content.json", { cache:"no-store" });
    if(res.ok){
      const data = await res.json();
      return { ...DEFAULT_CONTENT, ...data };
    }
  }catch(e){}
  return DEFAULT_CONTENT;
}

/* ---------- SFX (WebAudio) ---------- */
let audioCtx = null;
let sfxEnabled = (localStorage.getItem(SFX_KEY) ?? "on") === "on";

function initAudio(){
  if(audioCtx) return;
  try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ audioCtx = null; }
}

function beep(freq=880, dur=0.04, type="sine", vol=0.06){
  if(!sfxEnabled) return;
  if(!audioCtx) initAudio();
  if(!audioCtx) return;

  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g);
  g.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.start(now);
  o.stop(now + dur);
}

function clicky(){
  beep(740, 0.035, "triangle", 0.05);
  setTimeout(()=>beep(980, 0.03, "triangle", 0.045), 45);
}

window.addEventListener("pointerdown", () => { if(sfxEnabled) initAudio(); }, { once:true });

/* ---------- Theme ---------- */
function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  clicky();
}
function cycleTheme(){
  const themes = ["neon","cyber","red"];
  const cur = document.documentElement.getAttribute("data-theme") || "neon";
  const i = themes.indexOf(cur);
  setTheme(themes[(i+1) % themes.length]);
}

/* ---------- Helpers ---------- */
function el(tag, cls, html){
  const n = document.createElement(tag);
  if(cls) n.className = cls;
  if(html != null) n.innerHTML = html;
  return n;
}
function safeText(node, txt){ if(node) node.textContent = txt ?? ""; }
function renderList(container, items, renderer){
  container.innerHTML = "";
  (items || []).forEach(it => container.appendChild(renderer(it)));
}
function scrollToId(id){
  const el = document.querySelector(id);
  if(!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function isTypingTarget(e){
  const t = e.target;
  if(!t) return false;
  const tag = t.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || t.isContentEditable;
}

/* ---------- 3D background (Three.js) ---------- */
function init3D(){
  const container = document.getElementById("bg3d");
  if(!container) return;
  if(!window.THREE) return;

  const THREE = window.THREE;

  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4.5, 12);

  const grid = new THREE.GridHelper(60, 60, 0x00ff9c, 0x003322);
  grid.position.y = -2.4;
  grid.material.opacity = 0.20;
  grid.material.transparent = true;
  scene.add(grid);

  const count = 1400;
  const positions = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    positions[i*3+0] = (Math.random()-0.5) * 80;
    positions[i*3+1] = (Math.random()-0.2) * 25;
    positions[i*3+2] = (Math.random()-0.5) * 80;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00ff9c, size: 0.06, transparent:true, opacity:0.35 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const light = new THREE.DirectionalLight(0xffffff, 0.35);
  light.position.set(1, 1, 1);
  scene.add(light);

  let mx = 0, my = 0;
  window.addEventListener("pointermove", (e)=>{
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mx = x; my = y;
  });

  let t = 0;
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animate(){
    requestAnimationFrame(animate);
    if(!prefersReduce){
      t += 0.0035;
      grid.rotation.z = Math.sin(t*0.6) * 0.02;
      points.rotation.y += 0.0008;
      points.rotation.x = Math.sin(t*0.35)*0.03;
      camera.position.x = mx * 0.9;
      camera.position.y = 4.5 + my * -0.6;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", ()=>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}


/* ---------- Loader Upgrades (Access Gate + Sparks) ---------- */
function setLoaderMouseVars(){
  const card = document.querySelector(".loader-card");
  if(!card) return;
  function move(e){
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty("--mx", x.toFixed(2) + "%");
    card.style.setProperty("--my", y.toFixed(2) + "%");
  }
  window.addEventListener("pointermove", move);
}

function initSparks(){
  const c = document.getElementById("sparks");
  if(!c) return null;
  const ctx = c.getContext("2d");
  let w=0,h=0, dpr=1;
  let parts = [];

  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = c.width = Math.floor(c.clientWidth * dpr);
    h = c.height = Math.floor(c.clientHeight * dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  function spawn(n=2){
    for(let i=0;i<n;i++){
      parts.push({
        x: Math.random()*w,
        y: h + Math.random()*40*dpr,
        vx: (-0.5 + Math.random()) * 0.25 * dpr,
        vy: -(0.9 + Math.random()*1.4) * dpr,
        life: 0,
        max: (30 + Math.random()*40) * dpr,
        size: (0.8 + Math.random()*1.8) * dpr
      });
    }
    if(parts.length > 220) parts = parts.slice(parts.length - 220);
  }

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;

  function tick(){
    raf = requestAnimationFrame(tick);
    if(prefersReduce) return;
    ctx.clearRect(0,0,w,h);

    spawn(2);

    for(const p of parts){
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02 * dpr;
      const a = Math.max(0, 1 - (p.life / p.max));
      ctx.fillStyle = `rgba(0,255,156,${(0.18*a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size*1.8, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = `rgba(0,217,255,${(0.12*a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x+1*dpr, p.y-2*dpr, p.size, 0, Math.PI*2);
      ctx.fill();
    }
    parts = parts.filter(p=>p.life < p.max && p.y < h+80*dpr);
  }

  tick();
  return () => cancelAnimationFrame(raf);
}


/* ---------- Loader (matrix + terminal) ---------- */
function initMatrix(){
  const c = document.getElementById("matrix");
  if(!c) return null;
  const ctx = c.getContext("2d");

  const chars = "01░▒▓<>/\\[]{}()#@$%&*+-=~";
  let w, h, cols, drops;

  function resize(){
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    cols = Math.floor(w / 14);
    drops = new Array(cols).fill(1);
  }
  resize();
  window.addEventListener("resize", resize);

  function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0,0,w,h);
    ctx.font = "14px monospace";

    for(let i=0;i<drops.length;i++){
      const x = i * 14;
      const y = drops[i] * 14;

      const ch = chars[(Math.random()*chars.length)|0];
      const alpha = 0.25 + Math.random()*0.75;
      ctx.fillStyle = `rgba(0,255,156,${alpha.toFixed(2)})`;
      ctx.fillText(ch, x, y);

      if(y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  const id = setInterval(draw, 33);
  return () => clearInterval(id);
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function typeLine(pre, line, speedMs=12){
  for(const ch of line){
    pre.textContent += ch;
    if(ch !== " " && ch !== "\n") beep(820, 0.012, "square", 0.03);
    await sleep(speedMs);
  }
  pre.textContent += "\n";
}

function randHex(len=16){
  const a = "0123456789abcdef";
  let s = "";
  for(let i=0;i<len;i++) s += a[(Math.random()*a.length)|0];
  return s;
}

async function runLoader(content){
  const loader = document.getElementById("loader");
  const term = document.getElementById("terminal");
  const pct = document.getElementById("pct");
  const bar = document.getElementById("barFill");
  const statusText = document.getElementById("statusText");
  const skipBtn = document.getElementById("skipBtn");
  const sfxBtn = document.getElementById("sfxToggle");

  function refreshSfxBtn(){ if(sfxBtn) sfxBtn.textContent = `SFX: ${sfxEnabled ? "ON" : "OFF"}`; }
  refreshSfxBtn();

  // Access gate (aesthetic): require Enter/submit before continuing
  const gateForm = document.getElementById("gateForm");
  const gateInput = document.getElementById("gateInput");
  const gateEnter = document.getElementById("gateEnter");
  const gateThemes = document.querySelectorAll(".gate-theme");

  gateThemes.forEach(btn=>{
    btn.addEventListener("click", ()=> setTheme(btn.getAttribute("data-theme")));
  });

  let gateUnlocked = false;
  function unlockGate(){
    if(gateUnlocked) return;
    gateUnlocked = true;
    try{ gateInput?.blur(); }catch(e){}
    beep(1200, 0.05, "triangle", 0.06);
    setTimeout(()=>beep(980, 0.06, "sine", 0.06), 70);
    if(gateEnter) gateEnter.textContent = "GRANTED ✓";
    if(gateInput) gateInput.value = "ACCESS GRANTED";
  }

  gateForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    unlockGate();
  });

  // Auto-focus input for the vibe
  setTimeout(()=>gateInput?.focus(), 40);

  sfxBtn?.addEventListener("click", ()=>{
    sfxEnabled = !sfxEnabled;
    localStorage.setItem(SFX_KEY, sfxEnabled ? "on" : "off");
    if(sfxEnabled) initAudio();
    refreshSfxBtn();
    clicky();
  });

  let accel = 1;
  const stopMatrix = initMatrix();

  const ascii = [
    " ██████╗  ██████╗ ███╗   ███╗ █████╗ ███╗   ██╗",
    " ██╔══██╗██╔═══██╗████╗ ████║██╔══██╗████╗  ██║",
    " ██████╔╝██║   ██║██╔████╔██║███████║██╔██╗ ██║",
    " ██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║██║╚██╗██║",
    " ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║",
    " ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝"
  ];

  term.textContent = "";
  await typeLine(term, ">>> ROMAN SYSTEM BOOT", 8);
  await typeLine(term, ">>> " + new Date().toISOString(), 8);
  await typeLine(term, ">>> ----------------------------------------", 6);

  setLoaderMouseVars();
  const stopSparks = initSparks();

  await typeLine(term, "> enter password to continue (aesthetic)", 6);
  await typeLine(term, "> hint: press ENTER", 6);

  // Hold progression until access gate is unlocked (or user skips)
  while(!gateUnlocked && !finished){
    await sleep(60);
  }
  for(const l of ascii){ await typeLine(term, l, 1); }
  await typeLine(term, ">>> ----------------------------------------", 6);

  let progress = 0;

  function setProgress(p, label){
    progress = Math.max(progress, Math.min(100, p));
    if(pct) pct.textContent = `${progress|0}%`;
    if(bar) bar.style.width = `${progress}%`;
    if(statusText && label) statusText.textContent = label;
  }

  const steps = [
    { p: 10, label:"allocating memory", line:`[mem] heap=ok 0x${randHex(8)}` },
    { p: 22, label:"loading modules", line:`[mod] discord.gateway loaded` },
    { p: 35, label:"hardening shell", line:`[sec] sandbox policy: enforced` },
    { p: 48, label:"warming up renderer", line:`[gfx] neon grid online` },
    { p: 62, label:"indexing projects", line:`[pkg] projects indexed: ${(content.projects||[]).length}` },
    { p: 76, label:"syncing UI", line:`[ui] command palette: ready (press /)` },
    { p: 88, label:"final checks", line:`[chk] integrity=pass hash=${randHex(12)}` },
    { p: 100, label:"access granted", line:`[ok] welcome, ${content.name || "Roman"}` }
  ];

  let finished = false;

  async function doSteps(){
    for(const s of steps){
      if(finished) break;
      setProgress(s.p, s.label);
      await typeLine(term, `> ${s.line}`, 10/accel);
      await sleep((220 + Math.random()*220)/accel);
      term.scrollTop = term.scrollHeight;
      beep(980, 0.03, "triangle", 0.05);
    }
    finished = true;
  }

  const run = doSteps();

  function accelerate(){
    accel = Math.min(6, accel + 1);
    clicky();
  }

  skipBtn?.addEventListener("click", ()=>{
    finished = true;
    unlockGate();
    setProgress(100, "skipping…");
  });

  window.addEventListener("keydown", (e)=>{
    if(e.code === "Space") accelerate();
    if(e.key?.toLowerCase() === "t") cycleTheme();
  });

  loader?.addEventListener("click", ()=>{
    if(sfxEnabled) initAudio();
    accelerate();
  });

  while(!finished){
    await sleep(60);
    if(progress < 98){
      setProgress(progress + 0.25*accel, statusText?.textContent);
    }
  }

  await run;

  setProgress(100, "access granted");
  await typeLine(term, `> launching interface...`, 8);
  await sleep(320);

  stopMatrix?.();
  stopSparks?.();

  if(loader){
    loader.classList.add("fade");
    setTimeout(()=>loader.remove(), 620);
  }
}

/* ---------- Stats counters ---------- */
function animateNumber(el, target, suffix=""){
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(prefersReduce){
    el.textContent = `${target}${suffix}`;
    return;
  }
  const isFloat = String(target).includes(".");
  const dur = 900 + Math.random()*400;
  const t0 = performance.now();
  function frame(t){
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1-p, 3);
    const val = (target) * eased;
    el.textContent = isFloat ? `${val.toFixed(1)}${suffix}` : `${Math.floor(val)}${suffix}`;
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function setupCounterAnimations(){
  const nodes = $$(".stat .value");
  if(!("IntersectionObserver" in window)){
    nodes.forEach(n=>{
      const t = Number(n.getAttribute("data-target") || "0");
      const s = n.getAttribute("data-suffix") || "";
      animateNumber(n, t, s);
    });
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const n = e.target;
        const t = Number(n.getAttribute("data-target") || "0");
        const s = n.getAttribute("data-suffix") || "";
        animateNumber(n, t, s);
        io.unobserve(n);
      }
    });
  }, { threshold: 0.45 });
  nodes.forEach(n=>io.observe(n));
}

/* ---------- Presence (Lanyard) ---------- */
function setPresenceUI({status="offline", activity="—"}){
  const dot = $("#presenceDot");
  const dotBig = $("#presenceDotBig");
  const mini = $("#presenceMini");
  const badge = $("#presenceBadge");
  const statusEl = $("#presenceStatus");
  const actEl = $("#presenceActivity");

  const map = {
    online: "rgba(0,255,156,1)",
    idle: "rgba(255,204,0,1)",
    dnd: "rgba(255,59,92,1)",
    offline: "rgba(229,255,248,0.22)"
  };
  const color = map[status] || map.offline;

  [dot, dotBig].forEach(d=>{
    if(!d) return;
    d.style.background = color;
    d.style.boxShadow = status === "offline" ? "none" : "0 0 18px rgba(0,255,156,0.25)";
  });

  if(badge) badge.style.borderColor = status === "offline" ? "rgba(229,255,248,0.14)" : "rgba(0,255,156,0.22)";
  if(mini) mini.textContent = `presence: ${status}`;
  if(statusEl) statusEl.textContent = status === "offline" ? "Offline / not visible" : `Status: ${status}`;
  if(actEl) actEl.textContent = activity;
}

function parseLanyard(data){
  const status = data?.discord_status || "offline";
  let activity = "—";
  const act = (data?.activities || []).find(a => a?.type === 0 && a?.name) || (data?.activities || []).find(a => a?.name);
  if(act){
    const details = act.details ? ` — ${act.details}` : "";
    const state = act.state ? ` • ${act.state}` : "";
    activity = `${act.name}${details}${state}`;
  }else{
    activity = "No activity (or hidden).";
  }
  return { status, activity };
}

async function presenceViaRest(userId){
  try{
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, { cache:"no-store" });
    const js = await res.json();
    if(js?.success && js?.data){
      setPresenceUI(parseLanyard(js.data));
      return true;
    }
  }catch(e){}
  return false;
}

function presenceViaWS(userId){
  try{
    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    let heartbeat = null;

    ws.addEventListener("message", (ev)=>{
      const msg = JSON.parse(ev.data);
      if(msg.op === 1){
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        heartbeat = setInterval(()=>ws.send(JSON.stringify({ op: 3 })), msg.d.heartbeat_interval);
      }
      if(msg.op === 0 && msg.t === "PRESENCE_UPDATE"){
        setPresenceUI(parseLanyard(msg.d));
      }
    });

    ws.addEventListener("close", ()=>{ if(heartbeat) clearInterval(heartbeat); });
    ws.addEventListener("error", ()=>{ try{ ws.close(); }catch(e){} });
    return true;
  }catch(e){
    return false;
  }
}

async function initPresence(userId){
  if(!userId){
    setPresenceUI({status:"offline", activity:"Set your Discord User ID in Admin to show live status."});
    return;
  }
  const wsOk = presenceViaWS(userId);
  const restOk = await presenceViaRest(userId);
  if(!wsOk && !restOk){
    setPresenceUI({status:"offline", activity:"Could not connect to presence service (network blocked?)."});
    return;
  }
  setInterval(()=>presenceViaRest(userId), 30000);
}


/* ---------- Bot Demo (Fake Discord Simulator) ---------- */
const DEMO = {
  state: {
    ticketOpen: false,
    warns: {},
    bans: new Set(),
    messages: 0
  },
  history: [],
  historyIndex: -1
};

function nowTime(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}

function addMsg({from="user", name="You", text="", embed=null}){
  const log = $("#demoLog");
  if(!log) return;

  const row = el("div","msg");
  const av = el("div","avatar" + (from==="bot" ? " bot" : ""), from==="bot" ? "R" : "U");
  const body = el("div","body");
  const meta = el("div","meta");
  const n = el("div","name" + (from==="bot" ? " bot" : ""), escapeHtml(name));
  const t = el("div","time", nowTime());
  meta.appendChild(n); meta.appendChild(t);

  const bubble = el("div","bubble", escapeHtml(text));
  body.appendChild(meta);
  body.appendChild(bubble);

  if(embed){
    const e = el("div","embed");
    e.innerHTML = `
      <p class="title">${escapeHtml(embed.title || "")}</p>
      <p class="desc">${escapeHtml(embed.desc || "")}</p>
      ${embed.fields?.length ? `<div class="fields">${
        embed.fields.map(f=>`
          <div class="field">
            <div class="k">${escapeHtml(f.k || "")}</div>
            <div class="v">${escapeHtml(f.v || "")}</div>
          </div>
        `).join("")
      }</div>` : ""}
    `;
    body.appendChild(e);
  }

  row.appendChild(av);
  row.appendChild(body);
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

function setTyping(on){
  const log = $("#demoLog");
  if(!log) return;
  let tip = $("#demoTyping");
  if(on && !tip){
    tip = el("div","typing");
    tip.id = "demoTyping";
    tip.textContent = "Sentinel is typing…";
    log.appendChild(tip);
    log.scrollTop = log.scrollHeight;
  }
  if(!on && tip) tip.remove();
}

async function botReply({text="", embed=null, delay=420}){
  setTyping(true);
  beep(640, 0.02, "triangle", 0.03);
  await sleep(delay);
  setTyping(false);
  addMsg({from:"bot", name:"Sentinel", text, embed});
  beep(980, 0.03, "triangle", 0.05);
}

function parseMention(token){
  // Accept @user or <@123>
  token = (token || "").trim();
  if(!token) return null;
  if(token.startsWith("<@") && token.endsWith(">")){
    return token.replace(/[<@!>]/g,"");
  }
  if(token.startsWith("@")){
    return token.slice(1);
  }
  return token;
}

function demoHelp(){
  return {
    title: "Sentinel — demo commands",
    desc: "Type a command below. This is a *simulated* Discord chat.",
    fields: [
      {k:"Basics", v:"/help · /ping · /stats"},
      {k:"Moderation", v:"/warn @user [reason] · /ban @user [reason] · /unban @user"},
      {k:"Tickets", v:"/ticket create · /ticket close"},
      {k:"Fun", v:"/roll [1-100] · /8ball [question]"}
    ]
  };
}

function demoStats(){
  const warns = Object.values(DEMO.state.warns).reduce((a,b)=>a+b,0);
  return {
    title: "Server stats",
    desc: "Live demo numbers (local only)",
    fields: [
      {k:"Messages seen", v:String(DEMO.state.messages)},
      {k:"Tickets", v: DEMO.state.ticketOpen ? "1 open" : "0 open"},
      {k:"Warns issued", v:String(warns)},
      {k:"Bans", v:String(DEMO.state.bans.size)}
    ]
  };
}

async function handleDemoCommand(raw){
  const input = raw.trim();
  if(!input) return;

  DEMO.state.messages++;

  // User message
  addMsg({from:"user", name:"You", text: input});
  clicky();

  // Commands
  const parts = input.split(" ").filter(Boolean);
  const cmd = (parts[0] || "").toLowerCase();

  if(cmd === "/help"){
    return botReply({ text:"Here you go.", embed: demoHelp(), delay: 520 });
  }
  if(cmd === "/ping"){
    const ms = Math.floor(40 + Math.random()*90);
    return botReply({ text:`Pong. Latency: ${ms}ms`, delay: 280 });
  }
  if(cmd === "/stats"){
    return botReply({ text:"Snapshot:", embed: demoStats(), delay: 520 });
  }

  if(cmd === "/ticket"){
    const sub = (parts[1] || "").toLowerCase();
    if(sub === "create"){
      if(DEMO.state.ticketOpen){
        return botReply({ text:"You already have an open ticket. Use `/ticket close` when you're done.", delay: 420 });
      }
      DEMO.state.ticketOpen = true;
      return botReply({
        text:"Ticket created ✅ A moderator will respond soon.",
        embed:{
          title:"Ticket #1042",
          desc:"Status: OPEN",
          fields:[
            {k:"Category", v:"Support"},
            {k:"Owner", v:"You"},
            {k:"Next", v:"Type your issue here."},
            {k:"Close", v:"/ticket close"}
          ]
        },
        delay: 620
      });
    }
    if(sub === "close"){
      if(!DEMO.state.ticketOpen){
        return botReply({ text:"No open ticket found. Use `/ticket create`.", delay: 380 });
      }
      DEMO.state.ticketOpen = false;
      return botReply({ text:"Ticket closed. Transcript saved. ✅", delay: 520 });
    }
    return botReply({ text:"Usage: `/ticket create` or `/ticket close`", delay: 340 });
  }

  if(cmd === "/warn"){
    const who = parseMention(parts[1]);
    const reason = parts.slice(2).join(" ") || "No reason provided";
    if(!who) return botReply({ text:"Usage: `/warn @user [reason]`", delay: 320 });
    if(DEMO.state.bans.has(who)){
      return botReply({ text:`Can't warn ${who} — user is banned.`, delay: 360 });
    }
    DEMO.state.warns[who] = (DEMO.state.warns[who] || 0) + 1;
    const count = DEMO.state.warns[who];
    return botReply({
      text:`Warned **${who}**. (${count} total)`,
      embed:{
        title:"Moderation action",
        desc:"Warn issued",
        fields:[
          {k:"User", v:who},
          {k:"Reason", v:reason},
          {k:"Action", v: count >= 3 ? "Escalate recommended" : "Logged" },
          {k:"Moderator", v:"You"}
        ]
      },
      delay: 580
    });
  }

  if(cmd === "/ban"){
    const who = parseMention(parts[1]);
    const reason = parts.slice(2).join(" ") || "No reason provided";
    if(!who) return botReply({ text:"Usage: `/ban @user [reason]`", delay: 320 });
    DEMO.state.bans.add(who);
    return botReply({
      text:`Banned **${who}** ✅`,
      embed:{
        title:"Moderation action",
        desc:"Ban issued",
        fields:[
          {k:"User", v:who},
          {k:"Reason", v:reason},
          {k:"Appeal", v:"/unban @user"},
          {k:"Moderator", v:"You"}
        ]
      },
      delay: 620
    });
  }

  if(cmd === "/unban"){
    const who = parseMention(parts[1]);
    if(!who) return botReply({ text:"Usage: `/unban @user`", delay: 320 });
    if(!DEMO.state.bans.has(who)){
      return botReply({ text:`${who} is not banned.`, delay: 360 });
    }
    DEMO.state.bans.delete(who);
    return botReply({ text:`Unbanned **${who}**.`, delay: 520 });
  }

  if(cmd === "/roll"){
    const max = Math.max(2, Math.min(1000, Number(parts[1] || 100)));
    const n = 1 + Math.floor(Math.random()*max);
    return botReply({ text:`🎲 You rolled **${n}** (1–${max})`, delay: 360 });
  }

  if(cmd === "/8ball"){
    const q = parts.slice(1).join(" ").trim();
    if(!q) return botReply({ text:"Ask me something. Usage: `/8ball will I ship today?`", delay: 320 });
    const answers = [
      "Yes.", "No.", "Ask again later.", "Probably.", "Unclear.", "Absolutely.", "Not today.", "If you refactor it."
    ];
    const a = answers[(Math.random()*answers.length)|0];
    return botReply({ text:`🎱 **${a}**`, delay: 520 });
  }

  // Not a slash command
  if(cmd.startsWith("/")){
    return botReply({ text:"Unknown command. Type `/help`.", delay: 320 });
  }

  // If user just typed a normal message
  return botReply({ text:"(Demo) I only respond to slash commands here. Try `/help`.", delay: 340 });
}

function resetDemo(){
  DEMO.state = { ticketOpen:false, warns:{}, bans:new Set(), messages:0 };
  DEMO.history = [];
  DEMO.historyIndex = -1;
  const log = $("#demoLog");
  if(log) log.innerHTML = "";
  addMsg({from:"bot", name:"Sentinel", text:"Welcome to the interactive demo. Type `/help` to see commands."});
}

function initDemoUI(content){
  const input = $("#demoInput");
  const send = $("#demoSend");
  const reset = $("#demoReset");
  const copy = $("#demoCopy");
  const cmds = $("#demoCmds");
  if(!input || !send || !reset || !cmds) return;

  // Command list
  const list = [
    {c:"/help", d:"Show all commands"},
    {c:"/ping", d:"Latency check"},
    {c:"/stats", d:"Demo stats"},
    {c:"/ticket create", d:"Create a support ticket"},
    {c:"/ticket close", d:"Close the ticket"},
    {c:"/warn @user reason", d:"Warn a user"},
    {c:"/ban @user reason", d:"Ban a user"},
    {c:"/unban @user", d:"Unban a user"},
    {c:"/roll 100", d:"Random roll"},
    {c:"/8ball question", d:"Magic 8-ball"}
  ];
  cmds.innerHTML = list.map(x => `<div class="cmdline"><div class="c"><code>${escapeHtml(x.c)}</code></div><div class="d">${escapeHtml(x.d)}</div></div>`).join("");

  // Start
  resetDemo();

  function submit(){
    const v = input.value;
    if(!v.trim()) return;
    DEMO.history.unshift(v);
    DEMO.history = DEMO.history.slice(0, 40);
    DEMO.historyIndex = -1;
    input.value = "";
    handleDemoCommand(v);
  }

  send.addEventListener("click", submit);
  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      submit();
    }
    if(e.key === "ArrowUp"){
      // history
      e.preventDefault();
      if(DEMO.history.length === 0) return;
      DEMO.historyIndex = Math.min(DEMO.historyIndex + 1, DEMO.history.length - 1);
      input.value = DEMO.history[DEMO.historyIndex] || "";
      input.setSelectionRange(input.value.length, input.value.length);
      beep(520, 0.02, "sine", 0.03);
    }
    if(e.key === "ArrowDown"){
      e.preventDefault();
      if(DEMO.history.length === 0) return;
      DEMO.historyIndex = Math.max(DEMO.historyIndex - 1, -1);
      input.value = DEMO.historyIndex === -1 ? "" : (DEMO.history[DEMO.historyIndex] || "");
      beep(520, 0.02, "sine", 0.03);
    }
  });

  reset.addEventListener("click", ()=>{
    resetDemo();
    clicky();
  });

  copy?.addEventListener("click", async ()=>{
    const log = $("#demoLog");
    if(!log) return;
    const text = Array.from(log.querySelectorAll(".msg")).map(m=>{
      const name = m.querySelector(".name")?.textContent || "";
      const bubble = m.querySelector(".bubble")?.textContent || "";
      return `${name}: ${bubble}`;
    }).join("\n");
    try{ await navigator.clipboard.writeText(text); }catch(e){}
    beep(1200, 0.06, "sine", 0.06);
  });
}


/* ---------- Case Study Modal ---------- */
let CURRENT_CASE = null;

function setTab(active){
  $$(".tab").forEach(t=>{
    const is = t.getAttribute("data-tab") === active;
    t.classList.toggle("active", is);
    t.setAttribute("aria-selected", is ? "true" : "false");
  });
}

function sectionBlock(title, bodyHtml){
  const wrap = el("div","case-section");
  wrap.appendChild(el("h3", null, title));
  const div = el("div", null, bodyHtml);
  wrap.appendChild(div);
  return wrap;
}

function listToHtml(items){
  if(!items || !items.length) return "<p>—</p>";
  const lis = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  return `<ul>${lis}</ul>`;
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function openCase(project){
  const modal = $("#caseModal");
  const title = $("#caseTitle");
  const body = $("#caseBody");
  if(!modal || !title || !body) return;

  CURRENT_CASE = project;
  title.textContent = project?.name || "Project";
  modal.hidden = false;
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";

  setTab("overview");
  renderCaseTab("overview");

  // Deep link
  if(project?.id){
    history.replaceState(null, "", `#case-${project.id}`);
  }
  clicky();
}

function closeCase(){
  const modal = $("#caseModal");
  if(!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  CURRENT_CASE = null;

  // Remove case hash but keep section hash if any
  const h = location.hash || "";
  if(h.startsWith("#case-")){
    history.replaceState(null, "", "#projects");
  }
  clicky();
}

function renderCaseTab(tab){
  const body = $("#caseBody");
  if(!body) return;
  const cs = CURRENT_CASE?.caseStudy || {};
  body.innerHTML = "";

  if(tab === "overview"){
    body.appendChild(sectionBlock("Overview", `<p>${escapeHtml(cs.overview || CURRENT_CASE?.desc || "—")}</p>`));
    body.appendChild(sectionBlock("Problem", `<p>${escapeHtml(cs.problem || "—")}</p>`));
    body.appendChild(sectionBlock("Solution", `<p>${escapeHtml(cs.solution || "—")}</p>`));
  }
  if(tab === "build"){
    body.appendChild(sectionBlock("Architecture", listToHtml(cs.architecture || [])));
    body.appendChild(sectionBlock("Highlights", listToHtml(cs.highlights || [])));
  }
  if(tab === "results"){
    body.appendChild(sectionBlock("Results", listToHtml(cs.results || [])));
    body.appendChild(sectionBlock("Stack", listToHtml(CURRENT_CASE?.stack || [])));
  }
  if(tab === "next"){
    body.appendChild(sectionBlock("Next steps", listToHtml(cs.next || [])));
    body.appendChild(sectionBlock("What I learned", `<p>Building this taught me to optimize for reliability, not just features — clean permissions, predictable behavior, and logs you can trust.</p>`));
  }
}

/* ---------- Command Palette ---------- */
let paletteOpen = false;
let paletteIndex = 0;
let COMMANDS = [];

function makeCommands(content){
  const cmds = [];

  function cmd(name, desc, action){
    cmds.push({ name, desc, action });
  }

  cmd("Go: projects", "Jump to Projects section", ()=>scrollToId("#projects"));
  cmd("Go: timeline", "Jump to Timeline (XP) section", ()=>scrollToId("#timeline"));
  cmd("Go: skills", "Jump to Skills section", ()=>scrollToId("#skills"));
  cmd("Go: about", "Jump to About section", ()=>scrollToId("#about"));
  cmd("Go: contact", "Jump to Contact section", ()=>scrollToId("#contact"));
  cmd("Go: demo", "Jump to Interactive Bot Demo", ()=>scrollToId("#demo"));

  cmd("Theme: neon", "Switch theme to NEON", ()=>setTheme("neon"));
  cmd("Theme: cyber", "Switch theme to CYBER", ()=>setTheme("cyber"));
  cmd("Theme: red", "Switch theme to RED", ()=>setTheme("red"));
  cmd("Theme: cycle", "Cycle themes (T)", ()=>cycleTheme());

  cmd("Copy: discord", "Copy your Discord tag", async ()=>{
    const txt = content.discordTag || "";
    try{ await navigator.clipboard.writeText(txt); }catch(e){}
    beep(1200, 0.06, "sine", 0.06);
  });
  cmd("Copy: email", "Copy your email", async ()=>{
    const txt = content.email || "";
    try{ await navigator.clipboard.writeText(txt); }catch(e){}
    beep(1200, 0.06, "sine", 0.06);
  });

  cmd("Open: admin", "Open the Admin panel", ()=>{ window.location.href = "admin.html"; });
  cmd("Open: demo", "Open the Interactive Bot Demo", ()=>scrollToId("#demo"));

  // Project openers
  (content.projects || []).forEach(p=>{
    cmd(`Open: ${p.name.toLowerCase()}`, `Open case study for ${p.name}`, ()=>openCase(p));
  });

  cmd("XP: set to current", "Set XP slider to your saved/current XP", ()=>{
    const slider = $("#xpSlider");
    if(!slider) return;
    const v = Number(localStorage.getItem(XP_KEY) || content.xp?.current || slider.value || 0);
    slider.value = String(v);
    slider.dispatchEvent(new Event("input"));
    scrollToId("#timeline");
  });

  cmd("Help", "Show available commands", ()=>{ /* no-op; palette list is the help */ });

  return cmds;
}

function openPalette(){
  const pal = $("#palette");
  const input = $("#paletteInput");
  const list = $("#paletteList");
  if(!pal || !input || !list) return;

  pal.hidden = false;
  pal.setAttribute("aria-hidden","false");
  paletteOpen = true;
  paletteIndex = 0;
  input.value = "";
  renderPaletteList("");
  setTimeout(()=>input.focus(), 0);
  document.body.style.overflow = "hidden";
  clicky();
}

function closePalette(){
  const pal = $("#palette");
  if(!pal) return;
  pal.hidden = true;
  pal.setAttribute("aria-hidden","true");
  paletteOpen = false;
  document.body.style.overflow = "";
  clicky();
}

function filterCommands(q){
  q = (q || "").trim().toLowerCase();
  if(!q) return COMMANDS;
  return COMMANDS.filter(c=>{
    return c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  });
}

function renderPaletteList(query){
  const list = $("#paletteList");
  if(!list) return;

  const filtered = filterCommands(query);
  if(paletteIndex >= filtered.length) paletteIndex = Math.max(0, filtered.length - 1);

  list.innerHTML = "";
  filtered.slice(0, 30).forEach((c, i)=>{
    const row = el("div","cmd" + (i === paletteIndex ? " active" : ""));
    row.setAttribute("role","option");
    row.innerHTML = `<div class="name">${escapeHtml(c.name)}</div><div class="desc">${escapeHtml(c.desc)}</div>`;
    row.addEventListener("click", ()=>{
      closePalette();
      setTimeout(()=>c.action(), 0);
    });
    list.appendChild(row);
  });

  if(filtered.length === 0){
    const empty = el("div","cmd");
    empty.innerHTML = `<div class="name">No commands found</div><div class="desc">Try: projects, theme, open sentinel</div>`;
    list.appendChild(empty);
  }

  // Store filtered list on element for run
  list._filtered = filtered;
}

function runSelected(){
  const list = $("#paletteList");
  if(!list) return;
  const filtered = list._filtered || COMMANDS;
  const c = filtered[paletteIndex];
  if(!c) return;
  closePalette();
  setTimeout(()=>c.action(), 0);
}

/* ---------- Timeline XP ---------- */
function computeLevel(timeline, xp){
  // Find last milestone <= xp
  let current = timeline[0] || null;
  for(const m of timeline){
    if((m.xp ?? 0) <= xp) current = m;
  }
  return current;
}

function renderTimeline(content){
  const list = $("#timelineList");
  const slider = $("#xpSlider");
  const fill = $("#xpFill");
  const label = $("#xpLabel");
  const nums = $("#xpNums");

  const timeline = (content.timeline || []).slice().sort((a,b)=> (a.xp??0)-(b.xp??0));
  if(!timeline.length || !slider || !fill || !label || !nums || !list) return;

  const maxXp = timeline[timeline.length - 1].xp ?? 1000;
  slider.min = "0";
  slider.max = String(maxXp);

  const savedXp = localStorage.getItem(XP_KEY);
  const startXp = Number(savedXp ?? content.xp?.current ?? 0);
  slider.value = String(Math.max(0, Math.min(maxXp, startXp)));

  function updateUI(){
    const xp = Number(slider.value || 0);
    localStorage.setItem(XP_KEY, String(xp));

    const pct = maxXp ? (xp / maxXp) * 100 : 0;
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;

    const lvl = computeLevel(timeline, xp);
    const lvlText = lvl ? `Age ${lvl.age} — ${lvl.title}` : "Level";
    label.textContent = lvlText;
    nums.textContent = `${xp} / ${maxXp} XP`;

    // highlight nearest milestone
    const nodes = $$(".milestone", list);
    nodes.forEach(n=>{
      const mxp = Number(n.getAttribute("data-xp") || 0);
      n.classList.toggle("active", mxp <= xp && (xp - mxp) < 220); // rough highlight range
    });
  }

  slider.addEventListener("input", ()=>{
    updateUI();
    beep(520 + (Number(slider.value)/maxXp)*600, 0.02, "sine", 0.03);
  });

  // Milestones list
  list.innerHTML = "";
  timeline.forEach(m=>{
    const item = el("div","milestone");
    item.setAttribute("data-xp", String(m.xp ?? 0));
    item.innerHTML = `
      <div class="top">
        <div class="title"><b>Age ${escapeHtml(m.age)}</b> — ${escapeHtml(m.title)}</div>
        <div class="xp">${escapeHtml(m.xp)} XP</div>
      </div>
      <div class="desc">${escapeHtml(m.desc)}</div>
    `;
    item.addEventListener("click", ()=>{
      slider.value = String(m.xp ?? 0);
      slider.dispatchEvent(new Event("input"));
      clicky();
    });
    list.appendChild(item);
  });

  updateUI();
}

/* ---------- Hero Modes (interactive) ---------- */
const HERO_MODES = {
  builder: {
    heroLine: "Started coding at 14. Two years later, I'm building Discord systems that keep communities safe, organized, and fun — and learning the CS fundamentals behind it.",
    now: "A next-gen moderation bot + dashboard stack (clean UX, safe permissions, fast performance).",
    focus: "Performance · Permissions · Clean architecture"
  },
  student: {
    heroLine: "I’m learning the fundamentals on purpose: data structures, networking basics, and how systems actually work — while building real projects.",
    now: "Sharpening CS basics + refactoring my bots into cleaner architecture.",
    focus: "CS fundamentals · Practice · Consistency"
  },
  engineer: {
    heroLine: "My goal is Computer Engineering — building software that’s reliable, scalable, and actually understandable under pressure.",
    now: "Designing systems like an engineer: tradeoffs, performance, and safety.",
    focus: "Systems thinking · Tradeoffs · Reliability"
  }
};

function setHeroMode(mode){
  const m = HERO_MODES[mode] || HERO_MODES.builder;
  safeText($("#heroLine"), m.heroLine);
  safeText($("#nowBuilding"), m.now);
  safeText($("#focusLine"), m.focus);

  $$(".mode").forEach(b=>{
    b.classList.toggle("active", b.getAttribute("data-mode") === mode);
  });

  clicky();
}

/* ---------- Page render ---------- */
function applyContent(content){
  // Hero name
  const name = (content.name || "Roman").toUpperCase();
  const heroName = $("#heroName");
  if(heroName){
    heroName.textContent = name;
    heroName.setAttribute("data-text", name);
  }
  safeText($("#heroSubtitle"), content.subtitle);
  safeText($("#heroLine"), content.heroLine);
  safeText($("#nowBuilding"), content.nowBuilding);
  safeText($("#focusLine"), content.focusLine);

  // About
  safeText($("#aboutText"), content.bio);

  // Contacts
  safeText($("#discordTag"), content.discordTag);
  const email = content.email || "";
  const emailLink = $("#emailLink");
  if(emailLink){
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;
  }
  const ctaEmail = $("#ctaEmail");
  if(ctaEmail) ctaEmail.href = `mailto:${email}`;

  const github = content.links?.github || "https://github.com/";
  const githubLink = $("#githubLink");
  if(githubLink) githubLink.href = github;
  const ctaGithub = $("#ctaGithub");
  if(ctaGithub) ctaGithub.href = github;

  // About terminal
  const aboutTerm = $("#aboutTerminal");
  if(aboutTerm){
    const lines = [
      `$ whoami`,
      `${content.name || "Roman"} (${content.age || "?"} y/o dev)`,
      ``,
      `$ experience --years`,
      `${content.experienceYears ?? 0}`,
      ``,
      `$ goal --career`,
      `computer engineering`,
      ``,
      `$ motto`,
      `"ship it. make it clean. make it fast."`
    ];
    aboutTerm.textContent = lines.join("\n");
  }

  // Stats
  const statsGrid = $("#statsGrid");
  if(statsGrid){
    renderList(statsGrid, content.stats, (s)=>{
      const d = el("div","stat");
      const v = el("div","value");
      v.setAttribute("data-target", String(s.value ?? 0));
      v.setAttribute("data-suffix", s.suffix ?? "");
      v.textContent = "0" + (s.suffix ?? "");
      const l = el("div","label", escapeHtml(s.label || ""));
      const n = el("div","note", escapeHtml(s.note || ""));
      d.appendChild(v); d.appendChild(l); d.appendChild(n);
      return d;
    });
  }

  // Skills
  const skillsGrid = $("#skillsGrid");
  if(skillsGrid){
    renderList(skillsGrid, content.skills, (sk)=>{
      const s = el("div","skill");
      s.textContent = sk;
      return s;
    });
  }

  // Projects
  const projectsGrid = $("#projectsGrid");
  if(projectsGrid){
    renderList(projectsGrid, content.projects, (p)=>{
      const card = el("div","cardx");
      card.setAttribute("data-project-id", p.id || "");
      card.innerHTML = `
        <h3>${escapeHtml(p.name || "Project")}</h3>
        <p>${escapeHtml(p.desc || "")}</p>
        <div class="tags">${(p.stack || []).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="muted tiny" style="margin-top:10px">Click for case study →</div>
      `;
      card.addEventListener("click", ()=>openCase(p));
      return card;
    });
  }

  // Services
  const servicesGrid = $("#servicesGrid");
  if(servicesGrid){
    renderList(servicesGrid, content.services, (s)=>{
      const card = el("div","cardx");
      card.style.cursor = "default";
      card.innerHTML = `<h3>${escapeHtml(s.title || "Service")}</h3><p>${escapeHtml(s.desc || "")}</p>`;
      return card;
    });
  }

  // Year
  safeText($("#year"), String(new Date().getFullYear()));

  // Timeline
  renderTimeline(content);

  // Commands
  COMMANDS = makeCommands(content);
}

/* ---------- Modal + palette wiring ---------- */
function initUI(content){
  // Deep dive button
  $("#deepDiveBtn")?.addEventListener("click", ()=>{
    const p = (content.projects || []).find(x => x.id === "sentinel") || (content.projects || [])[0];
    if(p) openCase(p);
  });

  // Close modal
  $("#closeCase")?.addEventListener("click", closeCase);
  $("#caseModal")?.addEventListener("click", (e)=>{
    if(e.target?.id === "caseModal") closeCase();
  });

  // Tabs
  $$(".tab").forEach(t=>{
    t.addEventListener("click", ()=>{
      const tab = t.getAttribute("data-tab");
      setTab(tab);
      renderCaseTab(tab);
      clicky();
    });
  });

  // Copy case link
  $("#copyCaseLink")?.addEventListener("click", async ()=>{
    if(!CURRENT_CASE?.id) return;
    const url = location.origin + location.pathname + `#case-${CURRENT_CASE.id}`;
    try{ await navigator.clipboard.writeText(url); }catch(e){}
    beep(1200, 0.06, "sine", 0.06);
  });

  // Copy Discord
  $("#copyDiscord")?.addEventListener("click", async ()=>{
    try{ await navigator.clipboard.writeText(content.discordTag || ""); }catch(e){}
    beep(1200, 0.06, "sine", 0.06);
  });

  // Hero modes
  $$(".mode").forEach(b=>{
    b.addEventListener("click", ()=>setHeroMode(b.getAttribute("data-mode")));
  });

  // Theme buttons
  $$(".chip.theme").forEach(btn=>{
    btn.addEventListener("click", ()=>setTheme(btn.getAttribute("data-theme")));
  });

  // Palette input events
  $("#paletteInput")?.addEventListener("input", (e)=>{
    paletteIndex = 0;
    renderPaletteList(e.target.value);
  });

  // Palette keyboard
  $("#paletteInput")?.addEventListener("keydown", (e)=>{
    const list = $("#paletteList");
    const filtered = list?._filtered || COMMANDS;

    if(e.key === "ArrowDown"){
      e.preventDefault();
      paletteIndex = Math.min(paletteIndex + 1, Math.max(0, Math.min(filtered.length, 30) - 1));
      renderPaletteList($("#paletteInput").value);
      beep(520, 0.02, "sine", 0.03);
    }
    if(e.key === "ArrowUp"){
      e.preventDefault();
      paletteIndex = Math.max(0, paletteIndex - 1);
      renderPaletteList($("#paletteInput").value);
      beep(520, 0.02, "sine", 0.03);
    }
    if(e.key === "Enter"){
      e.preventDefault();
      runSelected();
    }
    if(e.key === "Escape"){
      e.preventDefault();
      closePalette();
    }
  });

  // Close palette by clicking overlay
  $("#palette")?.addEventListener("click", (e)=>{
    if(e.target?.id === "palette") closePalette();
  });

  // Global keybinds
  window.addEventListener("keydown", (e)=>{
    if(e.key === "Escape"){
      if(!$("#caseModal")?.hidden) closeCase();
      if(paletteOpen) closePalette();
      return;
    }

    // "/" opens palette (unless typing)
    if(e.key === "/" && !isTypingTarget(e) && !paletteOpen){
      e.preventDefault();
      openPalette();
    }

    // "T" cycles theme
    if(e.key?.toLowerCase() === "t" && !isTypingTarget(e)){
      // loader already listens too; this still feels fine
      // only cycle if palette isn't open (avoid messing with input)
      if(!paletteOpen) cycleTheme();
    }
  });

  // Hash deep link case
  if(location.hash?.startsWith("#case-")){
    const id = location.hash.replace("#case-","");
    const p = (content.projects || []).find(x => x.id === id);
    if(p) setTimeout(()=>openCase(p), 650);
  }
}

/* ---------- Admin compatibility ---------- */
function migrateStorage(){
  // If older version exists, keep it. (No destructive operations.)
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", async ()=>{
  migrateStorage();

  const savedTheme = localStorage.getItem(THEME_KEY);
  if(savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  const content = await loadContent();
  applyContent(content);
  initUI(content);
  initDemoUI(content);

  // Start loader (uses content for personalized lines)
  runLoader(content);

  // Animations
  setupCounterAnimations();
  initPresence(content.discordUserId);
  init3D();

  // Start in builder mode for coherent hero
  setHeroMode("builder");
});
