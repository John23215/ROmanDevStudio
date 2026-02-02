/* Roman Portfolio v2 — app.js
   Includes:
   - Fake access gate (aesthetic only)
   - Hacker boot loader
   - Command palette (/, Ctrl+K)
   - Animated stat counters
   - Timeline section
   - 3D background (Three.js) + Matrix
*/

// =========================
// CONFIG (edit these)
// =========================
const CONFIG = {
  discord: "roman#0000",              // <-- change
  email: "youremail@example.com",     // <-- change
  github: "https://github.com/yourgithub", // optional
  stats: {
    bots_shipped: 12,
    servers_served: 80,
    users_reached: 25000,
    uptime_target: 99.9
  }
};
// =========================

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => Array.from(root.querySelectorAll(q));
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Toast
const toast = $("#toast");
let toastTimer = null;
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("show"), 1200);
}

// ---- Year
$("#year").textContent = new Date().getFullYear();

// ---- Copy Discord
async function copyDiscord(){
  try{
    await navigator.clipboard.writeText(CONFIG.discord);
    showToast("Copied Discord: " + CONFIG.discord);
  }catch{
    showToast("Copy failed — " + CONFIG.discord);
  }
}
$("#copyDiscord").addEventListener("click", copyDiscord);
$("#copyDiscord2").addEventListener("click", copyDiscord);

// ---- Hero typing + status widget
const heroWords = ["building…", "debugging…", "shipping…", "learning…", "improving…"];
let heroIdx = 0;
setInterval(()=>{
  const el = $("#heroTyping");
  if(!el) return;
  heroIdx = (heroIdx + 1) % heroWords.length;
  el.textContent = heroWords[heroIdx];
}, 2000);

const statuses = ["Online • Building", "Online • Coding", "Online • Learning", "Online • Improving"];
let statusIdx = 0;
setInterval(()=>{
  const el = $("#liveStatus");
  if(!el) return;
  statusIdx = (statusIdx + 1) % statuses.length;
  el.textContent = statuses[statusIdx];
}, 3200);

// ---- Stats injection (optional)
function applyStats(){
  const map = {
    "Bots shipped": CONFIG.stats.bots_shipped,
    "Servers served": CONFIG.stats.servers_served,
    "Users reached": CONFIG.stats.users_reached,
    "Uptime target": CONFIG.stats.uptime_target
  };
  // The HTML already has data-count values; keep them in sync if you edit CONFIG.
  // We'll just overwrite the data-count attributes from CONFIG:
  const counts = $$(".count");
  counts.forEach((el)=>{
    const label = el.closest(".stat")?.querySelector(".k")?.textContent?.trim();
    if(label && map[label] != null){
      el.setAttribute("data-count", String(map[label]));
      if(String(map[label]).includes(".")){
        el.setAttribute("data-decimals", String((String(map[label]).split(".")[1]||"").length));
      }
    }
  });
}
applyStats();

// =========================
// Command palette
// =========================
const cmdk = $("#cmdk");
const cmdkInput = $("#cmdkInput");
const cmdkList = $("#cmdkList");
const openCmdkBtn = $("#openCmdk");

function isCmdkOpen(){
  return !cmdk.classList.contains("hidden");
}
function openCmdk(){
  cmdk.classList.remove("hidden");
  cmdk.setAttribute("aria-hidden", "false");
  cmdkInput.value = "";
  renderCmdk("");
  setTimeout(()=> cmdkInput.focus(), 0);
}
function closeCmdk(){
  cmdk.classList.add("hidden");
  cmdk.setAttribute("aria-hidden", "true");
}

const COMMANDS = [
  { name: "Go to About",        desc: "Scroll to #about",   shortcut: "A", action: ()=>scrollToId("about") },
  { name: "Go to Skills",       desc: "Scroll to #skills",  shortcut: "S", action: ()=>scrollToId("skills") },
  { name: "Go to Projects",     desc: "Scroll to #projects",shortcut: "P", action: ()=>scrollToId("projects") },
  { name: "Go to Timeline",     desc: "Scroll to #timeline",shortcut: "T", action: ()=>scrollToId("timeline") },
  { name: "Go to Contact",      desc: "Scroll to #contact", shortcut: "C", action: ()=>scrollToId("contact") },
  { name: "Copy Discord",       desc: "Copy your Discord handle", shortcut: "D", action: copyDiscord },
  { name: "Toggle Matrix",      desc: "Show/hide Matrix background", shortcut: "M", action: ()=>toggleCanvas("matrix") },
  { name: "Toggle 3D Background", desc: "Show/hide Three.js background", shortcut: "3", action: ()=>toggleCanvas("three-bg") },
  { name: "Back to Top",        desc: "Scroll to top", shortcut: "↑", action: ()=>scrollToId("top") },
];

function scrollToId(id){
  closeCmdk();
  const el = document.getElementById(id);
  if(!el) return;
  el.scrollIntoView({behavior: prefersReduced ? "auto" : "smooth", block: "start"});
}

function toggleCanvas(id){
  closeCmdk();
  const el = document.getElementById(id);
  if(!el) return;
  const hidden = el.style.display === "none";
  el.style.display = hidden ? "" : "none";
  showToast((hidden ? "Enabled " : "Disabled ") + id);
}

let cmdkActive = 0;
let cmdkFiltered = COMMANDS.slice();

function renderCmdk(query){
  const q = query.trim().toLowerCase();
  cmdkFiltered = COMMANDS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.desc.toLowerCase().includes(q)
  );
  cmdkActive = 0;
  cmdkList.innerHTML = "";
  if(cmdkFiltered.length === 0){
    const empty = document.createElement("div");
    empty.className = "cmdk-item";
    empty.innerHTML = '<div class="cmdk-left"><div class="cmdk-name">No results</div><div class="cmdk-desc">Try: projects, contact, copy</div></div><div class="cmdk-shortcut">—</div>';
    cmdkList.appendChild(empty);
    return;
  }
  cmdkFiltered.forEach((c, idx)=>{
    const item = document.createElement("div");
    item.className = "cmdk-item" + (idx === 0 ? " active" : "");
    item.setAttribute("role","option");
    item.innerHTML = `
      <div class="cmdk-left">
        <div class="cmdk-name">${escapeHtml(c.name)}</div>
        <div class="cmdk-desc">${escapeHtml(c.desc)}</div>
      </div>
      <div class="cmdk-shortcut">${escapeHtml(c.shortcut||"")}</div>
    `;
    item.addEventListener("click", ()=> c.action());
    cmdkList.appendChild(item);
  });
}

function setActive(idx){
  const items = $$(".cmdk-item", cmdkList);
  if(items.length === 0) return;
  cmdkActive = Math.max(0, Math.min(idx, items.length - 1));
  items.forEach((it, i)=> it.classList.toggle("active", i === cmdkActive));
  items[cmdkActive].scrollIntoView({block:"nearest"});
}

function runActive(){
  if(cmdkFiltered.length === 0) return;
  cmdkFiltered[cmdkActive].action();
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

cmdkInput.addEventListener("input", ()=> renderCmdk(cmdkInput.value));
cmdkInput.addEventListener("keydown", (e)=>{
  if(e.key === "ArrowDown"){ e.preventDefault(); setActive(cmdkActive + 1); }
  if(e.key === "ArrowUp"){ e.preventDefault(); setActive(cmdkActive - 1); }
  if(e.key === "Enter"){ e.preventDefault(); runActive(); }
  if(e.key === "Escape"){ e.preventDefault(); closeCmdk(); }
});

cmdk.addEventListener("click", (e)=>{
  const t = e.target;
  if(t && t.getAttribute && t.getAttribute("data-close") === "1"){
    closeCmdk();
  }
});

openCmdkBtn.addEventListener("click", openCmdk);

// Global hotkeys: "/" and Ctrl+K
window.addEventListener("keydown", (e)=>{
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
  const typing = tag === "input" || tag === "textarea" || e.target?.isContentEditable;

  if(e.key === "Escape" && isCmdkOpen()){
    e.preventDefault();
    closeCmdk();
    return;
  }

  if(!typing && (e.key === "/" )){
    e.preventDefault();
    isCmdkOpen() ? closeCmdk() : openCmdk();
    return;
  }
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
    e.preventDefault();
    isCmdkOpen() ? closeCmdk() : openCmdk();
    return;
  }
});

// Smooth scroll for nav anchors
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", (e)=>{
    const id = a.getAttribute("href");
    if(!id || id === "#") return;
    const el = document.querySelector(id);
    if(!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior: prefersReduced ? "auto" : "smooth", block:"start"});
  });
});

// =========================
// Animated counters
// =========================
function formatNumber(n){
  const abs = Math.abs(n);
  if(abs >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if(abs >= 1000) return (n/1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function animateCount(el){
  const targetRaw = parseFloat(el.getAttribute("data-count") || "0");
  const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
  const target = isNaN(targetRaw) ? 0 : targetRaw;

  const duration = prefersReduced ? 0 : 900;
  const start = performance.now();
  const from = 0;

  function tick(now){
    const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const val = from + (target - from) * eased;

    if(decimals > 0){
      el.textContent = val.toFixed(decimals);
    }else{
      // for big numbers we show compact format while animating
      const v = Math.round(val);
      el.textContent = v >= 1000 ? formatNumber(v) : String(v);
    }

    if(t < 1) requestAnimationFrame(tick);
    else {
      // final formatting
      if(decimals > 0){
        el.textContent = target.toFixed(decimals);
      }else{
        const finalInt = Math.round(target);
        el.textContent = finalInt >= 1000 ? formatNumber(finalInt) : String(finalInt);
      }
    }
  }
  requestAnimationFrame(tick);
}

function initCounters(){
  const els = $$(".count");
  if(els.length === 0) return;
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting && !seen.has(en.target)){
        seen.add(en.target);
        animateCount(en.target);
      }
    });
  }, {threshold: 0.45});
  els.forEach(el=> io.observe(el));
}
initCounters();

// =========================
// Audio (tiny “beep” from Web Audio) — only after user interaction
// =========================
let audioCtx = null;
function beep(freq=880, ms=80, type="square", gain=0.03){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); }, ms);
  }catch{ /* ignore */ }
}
function beepSeq(){
  if(prefersReduced) return;
  beep(740, 70); setTimeout(()=>beep(980, 70), 85);
  setTimeout(()=>beep(660, 70), 170);
}

// =========================
// Gate + Boot loader (aesthetic only)
// =========================
const overlay = $("#overlay");
const gate = $("#gate");
const boot = $("#boot");
const gateForm = $("#gateForm");
const gateKey = $("#gateKey");
const gateStatus = $("#gateStatus");

const typed = $("#typed");
const log = $("#log");
const pct = $("#pct");
const bar = $("#bar");
const statusText = $("#statusText");

function randHex(len=8){
  const chars = "abcdef0123456789";
  let s="";
  for(let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}
function appendLog(text, cls){
  const div = document.createElement("div");
  div.className = "line " + (cls || "");
  div.textContent = text;
  log.appendChild(div);
  const term = $("#terminal");
  term.scrollTop = term.scrollHeight;
}
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function typeCmd(text, speed=14){
  typed.textContent = "";
  if(prefersReduced){ typed.textContent = text; return; }
  for(let i=0;i<text.length;i++){
    typed.textContent += text[i];
    await sleep(speed);
  }
}

async function bootSequence(){
  const steps = [
    {cmd:"init runtime --profile=roman", out:"OK runtime loaded", cls:"ok"},
    {cmd:"mount modules: discord, systems, ui", out:"OK modules mounted", cls:"ok"},
    {cmd:"verify policy --permissions=strict", out:"OK permission gates armed", cls:"ok"},
    {cmd:"enable shields --ratelimit=max", out:"OK shields online", cls:"ok"},
    {cmd:"compile assets --optimize", out:"OK build complete", cls:"ok"},
    {cmd:"handshake --target=visitor", out:"ACCESS GRANTED", cls:"ok"},
  ];

  let progress = 0;
  for(let i=0;i<steps.length;i++){
    const s = steps[i];
    statusText.textContent = "Running: " + s.cmd;
    await typeCmd(s.cmd, 12);
    await sleep(prefersReduced ? 0 : 120);

    appendLog("[" + randHex(6) + "] " + s.out, s.cls);
    if(Math.random() < 0.18) appendLog("[" + randHex(6) + "] entropy: " + randHex(12), "dim");
    typed.textContent = "";

    const target = Math.round(((i+1)/steps.length)*100);
    while(progress < target){
      progress += Math.max(1, Math.floor(Math.random()*4));
      if(progress > target) progress = target;
      pct.textContent = String(progress);
      bar.style.width = progress + "%";
      await sleep(prefersReduced ? 0 : 18);
    }

    await sleep(prefersReduced ? 0 : 160);
  }

  statusText.textContent = "Welcome.";
  await sleep(prefersReduced ? 0 : 240);

  // fade overlay
  overlay.style.transition = "opacity 320ms ease, transform 320ms ease";
  overlay.style.opacity = "0";
  overlay.style.transform = "scale(1.01)";
  await sleep(340);
  overlay.remove();
}

function showBoot(){
  gate.classList.add("hidden");
  gate.setAttribute("aria-hidden", "true");
  boot.classList.remove("hidden");
  boot.setAttribute("aria-hidden", "false");
}

gateForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const v = (gateKey.value || "").trim();
  gateStatus.textContent = "Verifying…";
  beep(520, 60, "sine", 0.02);
  await sleep(prefersReduced ? 0 : 260);

  // Aesthetic only: always "grants"
  gateStatus.innerHTML = '<span class="ok">ACCESS GRANTED</span> — launching secure boot…';
  beepSeq();

  await sleep(prefersReduced ? 0 : 520);
  showBoot();
  await sleep(prefersReduced ? 0 : 160);
  bootSequence();
});

// Make Enter work even if user doesn't click button
gateKey.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){
    // form submit handles it
  }
});

// =========================
// Matrix background
// =========================
const matrixCanvas = document.getElementById("matrix");
const mctx = matrixCanvas.getContext("2d", {alpha:true});
const glyphs = "01<>[]{}/*-+=#$%&@~";
let mCols = 0;
let mDrops = [];

function resizeMatrix(){
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  mCols = Math.floor(matrixCanvas.width / 14);
  mDrops = Array(mCols).fill(1);
}
window.addEventListener("resize", resizeMatrix);
resizeMatrix();

function drawMatrix(){
  if(prefersReduced) return;
  if(matrixCanvas.style.display === "none") return;

  mctx.fillStyle = "rgba(0,0,0,0.08)";
  mctx.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);
  mctx.fillStyle = "rgba(0,255,136,0.85)";
  mctx.font = "14px monospace";

  for(let i=0;i<mDrops.length;i++){
    const t = glyphs[Math.floor(Math.random()*glyphs.length)];
    const x = i * 14;
    const y = mDrops[i] * 14;
    mctx.fillText(t, x, y);

    if(y > matrixCanvas.height && Math.random() > 0.975) mDrops[i] = 0;
    mDrops[i]++;
  }
}
setInterval(drawMatrix, 50);

// =========================
// Three.js 3D background
// =========================
let threeOn = true;
function initThree(){
  const canvas = document.getElementById("three-bg");
  if(!window.THREE || !canvas || prefersReduced) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:true,
    antialias:true,
    powerPreference:"high-performance"
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070a, 0.022);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 10, 55);

  // Starfield
  const count = 1400;
  const positions = new Float32Array(count * 3);
  for(let i=0;i<count;i++){
    const i3 = i*3;
    positions[i3+0] = (Math.random()-0.5) * 220;
    positions[i3+1] = (Math.random()-0.5) * 140;
    positions[i3+2] = (Math.random()-0.5) * 220;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x00ff88,
    size: 0.65,
    transparent:true,
    opacity: 0.55,
    depthWrite:false
  });
  const stars = new THREE.Points(geo, mat);
  scene.add(stars);

  // Neon grid
  const grid = new THREE.GridHelper(220, 44, 0x00d6ff, 0x00ff88);
  grid.position.y = -18;
  grid.rotation.x = Math.PI * 0.5; // tilt it vertical-ish for depth
  // GridHelper material can be array in some versions
  if(Array.isArray(grid.material)){
    grid.material.forEach(m => { m.transparent = true; m.opacity = 0.12; });
  }else{
    grid.material.transparent = true;
    grid.material.opacity = 0.12;
  }
  scene.add(grid);

  // Soft vignette plane (very subtle)
  const planeGeo = new THREE.PlaneGeometry(180, 110);
  const planeMat = new THREE.MeshBasicMaterial({color:0x05070a, transparent:true, opacity:0.15});
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.position.z = -60;
  scene.add(plane);

  function resize(){
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  let t = 0;
  function animate(){
    if(canvas.style.display === "none") { requestAnimationFrame(animate); return; }
    t += 0.0025;
    stars.rotation.y = t * 0.35;
    stars.rotation.x = Math.sin(t * 0.6) * 0.08;
    grid.rotation.z = Math.sin(t * 0.4) * 0.06;

    camera.position.x = Math.sin(t * 0.9) * 4.2;
    camera.position.y = 10 + Math.cos(t * 0.7) * 2.0;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
window.addEventListener("load", initThree);

// Also allow opening palette by button even during overlay
openCmdkBtn.addEventListener("click", ()=>{
  if(!overlay || overlay.parentNode == null) openCmdk();
});

// If user clicks backdrop, close command palette
// Done above.

