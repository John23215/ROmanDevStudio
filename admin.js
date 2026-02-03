const STORAGE_KEY = "romanPortfolioContentV3";

const DEFAULT_CONTENT = {
  name: "Roman",
  age: 16,
  experienceYears: 2,
  subtitle: "Discord Bot Developer · Web Apps · APIs",
  heroLine: "Started coding at 14. Two years later, I'm building Discord systems that keep communities safe, organized, and fun — and learning the CS fundamentals behind it.",
  bio: "I’m Roman — a 16-year-old developer obsessed with building reliable software.",
  nowBuilding: "A next-gen moderation bot + dashboard stack.",
  focusLine: "Performance · Permissions · Clean architecture",
  discordUserId: "",
  discordTag: "roman#0000",
  email: "roman@example.com",
  links: { github: "https://github.com/" },
  stats: [
    { label: "Bots shipped", value: 12, suffix: "+", note: "Real features, not demos" }
  ],
  skills: ["Discord.js","Node.js","TypeScript"],
  timeline: [
    { xp: 120, age: 14, title: "Started coding", desc: "Built small scripts and learned the basics." }
  ],
  xp: { current: 120, label: "Builder" },
  projects: [
    {
      id: "sentinel",
      name: "Sentinel",
      desc: "Anti-raid + moderation suite with fast audit logs, smart filters, and safe automation.",
      stack: ["Discord.js","TypeScript","Redis"],
      link: "#",
      caseStudy: {
        overview: "Short overview…",
        problem: "Problem…",
        solution: "Solution…",
        architecture: ["Part 1","Part 2"],
        highlights: ["Highlight 1"],
        results: ["Result 1"],
        next: ["Next 1"]
      }
    }
  ],
  services: [
    { title:"Discord Bots", desc:"Moderation, utility, tickets, custom workflows." }
  ]
};

const $ = (id) => document.getElementById(id);

function load(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    try{ return deepMerge(structuredClone(DEFAULT_CONTENT), JSON.parse(saved)); }catch(e){}
  }
  return structuredClone(DEFAULT_CONTENT);
}

function save(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
}

function deepMerge(target, src){
  if(!src || typeof src !== "object") return target;
  for(const k of Object.keys(src)){
    if(src[k] && typeof src[k] === "object" && !Array.isArray(src[k])){
      target[k] = deepMerge(target[k] || {}, src[k]);
    }else{
      target[k] = src[k];
    }
  }
  return target;
}

function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("romanTheme", theme);
}

function escapeHtml(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

document.addEventListener("DOMContentLoaded", ()=>{
  const savedTheme = localStorage.getItem("romanTheme");
  if(savedTheme) setTheme(savedTheme);
  document.querySelectorAll(".chip.theme").forEach(btn=>{
    btn.addEventListener("click", ()=>setTheme(btn.getAttribute("data-theme")));
  });

  let content = load();

  // Basics
  $("name").value = content.name || "";
  $("age").value = String(content.age ?? "");
  $("experienceYears").value = String(content.experienceYears ?? "");

  $("subtitle").value = content.subtitle || "";
  $("heroLine").value = content.heroLine || "";
  $("nowBuilding").value = content.nowBuilding || "";
  $("focusLine").value = content.focusLine || "";
  $("bio").value = content.bio || "";

  $("discordUserId").value = content.discordUserId || "";

  // Contact
  $("discordTag").value = content.discordTag || "";
  $("email").value = content.email || "";
  $("github").value = content.links?.github || "";

  // Skills
  $("skills").value = (content.skills || []).join(", ");

  // XP / Timeline
  $("xpCurrent").value = String(content.xp?.current ?? 0);
  $("xpLabel").value = content.xp?.label ?? "Builder";

  function renderStats(){
    const wrap = $("statsList");
    wrap.innerHTML = "";
    (content.stats || []).forEach((s, idx)=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-head">
          <b>Stat #${idx+1}</b>
          <button class="btn2 danger" data-del="${idx}">Remove</button>
        </div>
        <div class="field"><label>Label</label><input data-k="label" data-i="${idx}" value="${escapeHtml(s.label||"")}"/></div>
        <div class="field"><label>Value</label><input data-k="value" data-i="${idx}" value="${escapeHtml(String(s.value??0))}"/></div>
        <div class="field"><label>Suffix</label><input data-k="suffix" data-i="${idx}" value="${escapeHtml(s.suffix||"")}"/></div>
        <div class="field"><label>Note</label><input data-k="note" data-i="${idx}" value="${escapeHtml(s.note||"")}"/></div>
      `;
      wrap.appendChild(div);
    });

    wrap.querySelectorAll("input").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const i = Number(inp.getAttribute("data-i"));
        const k = inp.getAttribute("data-k");
        let v = inp.value;
        if(k === "value") v = Number(v);
        content.stats[i][k] = v;
      });
    });

    wrap.querySelectorAll("button[data-del]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const i = Number(btn.getAttribute("data-del"));
        content.stats.splice(i,1);
        renderStats();
      });
    });
  }

  function renderTimeline(){
    const wrap = $("timelineList");
    wrap.innerHTML = "";
    (content.timeline || []).forEach((m, idx)=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-head">
          <b>Milestone #${idx+1}</b>
          <button class="btn2 danger" data-del="${idx}">Remove</button>
        </div>
        <div class="field"><label>XP</label><input data-k="xp" data-i="${idx}" value="${escapeHtml(String(m.xp??0))}"/></div>
        <div class="field"><label>Age</label><input data-k="age" data-i="${idx}" value="${escapeHtml(String(m.age??0))}"/></div>
        <div class="field"><label>Title</label><input data-k="title" data-i="${idx}" value="${escapeHtml(m.title||"")}"/></div>
        <div class="field"><label>Description</label><textarea data-k="desc" data-i="${idx}">${escapeHtml(m.desc||"")}</textarea></div>
      `;
      wrap.appendChild(div);
    });

    wrap.querySelectorAll("input,textarea").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const i = Number(inp.getAttribute("data-i"));
        const k = inp.getAttribute("data-k");
        let v = inp.value;
        if(k === "xp" || k === "age") v = Number(v);
        content.timeline[i][k] = v;
      });
    });

    wrap.querySelectorAll("button[data-del]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const i = Number(btn.getAttribute("data-del"));
        content.timeline.splice(i,1);
        renderTimeline();
      });
    });
  }

  function renderProjects(){
    const wrap = $("projectsList");
    wrap.innerHTML = "";
    (content.projects || []).forEach((p, idx)=>{
      const div = document.createElement("div");
      div.className = "item";
      const cs = p.caseStudy || {};
      div.innerHTML = `
        <div class="item-head">
          <b>Project #${idx+1}</b>
          <button class="btn2 danger" data-del="${idx}">Remove</button>
        </div>

        <div class="field"><label>ID (used for deep links)</label><input data-k="id" data-i="${idx}" value="${escapeHtml(p.id||"")}"/></div>
        <div class="field"><label>Name</label><input data-k="name" data-i="${idx}" value="${escapeHtml(p.name||"")}"/></div>
        <div class="field"><label>Description</label><textarea data-k="desc" data-i="${idx}">${escapeHtml(p.desc||"")}</textarea></div>
        <div class="field"><label>Stack (comma separated)</label><input data-k="stack" data-i="${idx}" value="${escapeHtml((p.stack||[]).join(", "))}"/></div>
        <div class="field"><label>Link</label><input data-k="link" data-i="${idx}" value="${escapeHtml(p.link||"#")}"/></div>

        <div class="small" style="margin-top:8px"><b>Case Study</b> (template in CASE_STUDY_TEMPLATE.md)</div>
        <div class="field"><label>Overview</label><textarea data-cs="overview" data-i="${idx}">${escapeHtml(cs.overview||"")}</textarea></div>
        <div class="field"><label>Problem</label><textarea data-cs="problem" data-i="${idx}">${escapeHtml(cs.problem||"")}</textarea></div>
        <div class="field"><label>Solution</label><textarea data-cs="solution" data-i="${idx}">${escapeHtml(cs.solution||"")}</textarea></div>
        <div class="field"><label>Architecture (one per line)</label><textarea data-csarr="architecture" data-i="${idx}">${escapeHtml((cs.architecture||[]).join("\\n"))}</textarea></div>
        <div class="field"><label>Highlights (one per line)</label><textarea data-csarr="highlights" data-i="${idx}">${escapeHtml((cs.highlights||[]).join("\\n"))}</textarea></div>
        <div class="field"><label>Results (one per line)</label><textarea data-csarr="results" data-i="${idx}">${escapeHtml((cs.results||[]).join("\\n"))}</textarea></div>
        <div class="field"><label>Next steps (one per line)</label><textarea data-csarr="next" data-i="${idx}">${escapeHtml((cs.next||[]).join("\\n"))}</textarea></div>
      `;
      wrap.appendChild(div);
    });

    wrap.querySelectorAll("input,textarea").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const i = Number(inp.getAttribute("data-i"));
        const k = inp.getAttribute("data-k");
        const cs = inp.getAttribute("data-cs");
        const csarr = inp.getAttribute("data-csarr");

        if(k){
          let v = inp.value;
          if(k === "stack") v = v.split(",").map(s=>s.trim()).filter(Boolean);
          content.projects[i][k] = v;
          return;
        }
        if(cs){
          content.projects[i].caseStudy = content.projects[i].caseStudy || {};
          content.projects[i].caseStudy[cs] = inp.value;
          return;
        }
        if(csarr){
          content.projects[i].caseStudy = content.projects[i].caseStudy || {};
          content.projects[i].caseStudy[csarr] = inp.value.split("\\n").map(s=>s.trim()).filter(Boolean);
          return;
        }
      });
    });

    wrap.querySelectorAll("button[data-del]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const i = Number(btn.getAttribute("data-del"));
        content.projects.splice(i,1);
        renderProjects();
      });
    });
  }

  function renderServices(){
    const wrap = $("servicesList");
    wrap.innerHTML = "";
    (content.services || []).forEach((s, idx)=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-head">
          <b>Service #${idx+1}</b>
          <button class="btn2 danger" data-del="${idx}">Remove</button>
        </div>
        <div class="field"><label>Title</label><input data-k="title" data-i="${idx}" value="${escapeHtml(s.title||"")}"/></div>
        <div class="field"><label>Description</label><input data-k="desc" data-i="${idx}" value="${escapeHtml(s.desc||"")}"/></div>
      `;
      wrap.appendChild(div);
    });

    wrap.querySelectorAll("input").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const i = Number(inp.getAttribute("data-i"));
        const k = inp.getAttribute("data-k");
        content.services[i][k] = inp.value;
      });
    });

    wrap.querySelectorAll("button[data-del]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const i = Number(btn.getAttribute("data-del"));
        content.services.splice(i,1);
        renderServices();
      });
    });
  }

  renderStats();
  renderTimeline();
  renderProjects();
  renderServices();

  $("addStat").addEventListener("click", ()=>{
    content.stats = content.stats || [];
    content.stats.push({ label:"New stat", value:1, suffix:"+", note:"" });
    renderStats();
  });

  $("addMilestone").addEventListener("click", ()=>{
    content.timeline = content.timeline || [];
    content.timeline.push({ xp: 0, age: 0, title: "New milestone", desc: "Describe it…" });
    renderTimeline();
  });

  $("addProject").addEventListener("click", ()=>{
    content.projects = content.projects || [];
    content.projects.push({
      id: "new-project",
      name:"New project",
      desc:"Describe it…",
      stack:["Node.js"],
      link:"#",
      caseStudy: { overview:"", problem:"", solution:"", architecture:[], highlights:[], results:[], next:[] }
    });
    renderProjects();
  });

  $("addService").addEventListener("click", ()=>{
    content.services = content.services || [];
    content.services.push({ title:"New service", desc:"Describe it…" });
    renderServices();
  });

  $("save").addEventListener("click", ()=>{
    content.name = $("name").value.trim();
    content.age = Number($("age").value || 0);
    content.experienceYears = Number($("experienceYears").value || 0);

    content.subtitle = $("subtitle").value.trim();
    content.heroLine = $("heroLine").value.trim();
    content.nowBuilding = $("nowBuilding").value.trim();
    content.focusLine = $("focusLine").value.trim();
    content.bio = $("bio").value.trim();

    content.discordUserId = $("discordUserId").value.trim();
    content.discordTag = $("discordTag").value.trim();
    content.email = $("email").value.trim();

    content.links = content.links || {};
    content.links.github = $("github").value.trim();

    content.skills = $("skills").value.split(",").map(s=>s.trim()).filter(Boolean);

    content.xp = content.xp || {};
    content.xp.current = Number($("xpCurrent").value || 0);
    content.xp.label = $("xpLabel").value.trim();

    save(content);
    alert("Saved! Open index.html to see changes.");
  });

  $("reset").addEventListener("click", ()=>{
    if(!confirm("Reset all local changes back to defaults?")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  function exportJson(){
    const out = {
      name: content.name,
      age: content.age,
      experienceYears: content.experienceYears,
      subtitle: content.subtitle,
      heroLine: content.heroLine,
      nowBuilding: content.nowBuilding,
      focusLine: content.focusLine,
      bio: content.bio,
      discordUserId: content.discordUserId,
      discordTag: content.discordTag,
      email: content.email,
      links: content.links,
      stats: content.stats,
      skills: content.skills,
      timeline: content.timeline,
      xp: content.xp,
      projects: content.projects,
      services: content.services
    };
    return JSON.stringify(out, null, 2);
  }

  $("copy").addEventListener("click", async ()=>{
    const txt = exportJson();
    try{ await navigator.clipboard.writeText(txt); alert("Copied JSON to clipboard."); }
    catch(e){ alert("Clipboard blocked. Use Export JSON instead."); }
  });

  $("export").addEventListener("click", ()=>{
    const txt = exportJson();
    const blob = new Blob([txt], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  });
});
