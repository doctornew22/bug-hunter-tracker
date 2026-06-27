// ═══════════════════════════════════════════
// SUPABASE CONFIG — তোমার keys এখানে দাও
// ═══════════════════════════════════════════
const SUPABASE_URL  = "https://ttjqwsgyrmakbkgpnbxt.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anF3c2d5cm1ha2JrZ3BuYnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDc5NTUsImV4cCI6MjA5ODA4Mzk1NX0.hO3PUSdo8ZZOJYC4OhQhOgUpBwNvseYSxHW4aTE_JkI"; // API Keys পেজ থেকে anon public key

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ═══════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════
const C = {
  bg:"#05080f", surface:"#0b1120", surface2:"#101828",
  border:"#1a2a40", borderHi:"#243d5e",
  cyan:"#00e5ff", purple:"#9d4edd", green:"#00ff88",
  red:"#ff3e3e", orange:"#ff9500", yellow:"#ffd60a",
  text:"#d6e4ff", muted:"#3d5a80", dim:"#131f33",
};
const FONT = `'JetBrains Mono','Fira Code','Courier New',monospace`;

// ═══════════════════════════════════════════
// ROADMAP DATA
// ═══════════════════════════════════════════
const PHASES = [
  { id:"p1", num:"01", months:"মাস ১-২", title:"Web Fundamentals", color:C.cyan, split:"100% Learning", earn:"$0", icon:"◈", focus:"HTTP, Browser, Web Architecture, JS basics",
    tasks:["HTTP Protocol পড়ো (Methods, Headers, Status Codes)","Same-Origin Policy & Cookies বোঝো","PortSwigger Academy - শুরু করো","DVWA / Juice Shop local setup করো","TryHackMe Web Fundamentals room","Web Hacking 101 বই পড়ো","MDN Web Docs - JS basics"] },
  { id:"p2", num:"02", months:"মাস ৩-৪", title:"Access Control Bugs", color:"#7eb8ff", split:"20% Hunt / 80% Learn", earn:"~$2,250/মাস", icon:"◎", focus:"IDOR, Priv Esc, Paywall Bypass",
    tasks:["OWASP Top 10 - Broken Access Control পড়ো","IDOR write-ups পড়ো HackerOne Hacktivity তে","PortSwigger Access Control labs সলভ করো","Public program এ Access Control scope তে hunt করো","DVWA/bWAPP দিয়ে IDOR practice করো","প্রতি সপ্তাহে ২-৩টা রিপোর্ট সাবমিট করো"] },
  { id:"p3", num:"03", months:"মাস ৫-৬", title:"XSS · CSRF · SSRF", color:C.orange, split:"40% Hunt / 60% Learn", earn:"~$5,250/মাস", icon:"◆", focus:"Injection & Client-side bugs",
    tasks:["Reflected, Stored, DOM XSS শেখো","CSRF token bypass techniques","SSRF - internal network attack","PayloadsAllTheThings GitHub পড়ো","XSStrike / dalfox দিয়ে practice","HackTheBox Web path complete করো","মাসে ৭-১২টা bug রিপোর্ট টার্গেট"] },
  { id:"p4", num:"04", months:"মাস ৬-৮", title:"Code Review + Advanced", color:C.purple, split:"80% Hunt / 20% Learn", earn:"~$9,000/মাস", icon:"◐", focus:"Source code bugs, OAuth, GraphQL",
    tasks:["PHP / Node.js code review শেখো","OAuth vulnerability patterns","GraphQL security issues","Business Logic bug খোঁজো","Vulnerability chaining practice","Open source program এ hunt করো","Burp Suite advanced features শেখো"] },
  { id:"p5", num:"05", months:"মাস ৮-১২", title:"Hardcore Hunting", color:C.red, split:"100% Hunt", earn:"~$15k+/মাস", icon:"◉", focus:"Private programs, specialization, chaining",
    tasks:["Private program এ ঢোকার চেষ্টা করো","নিজের specialty তে focus করো","Critical bug chain করার practice","Recon → Enum → Deep Test → Report routine","Weekly review - কোন technique কাজ করছে না","Hacktivity তে latest technique শেখো","Live hacking event এ participate করো"] },
];

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
const todayKey  = () => new Date().toISOString().split("T")[0];
const addDays   = (dateStr, n) => { const d = new Date(dateStr+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const fmtDate   = (iso) => new Date(iso+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short"});
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const dayName   = (iso) => DAY_NAMES[new Date(iso+"T00:00:00").getDay()];
const getCat    = (id) => ({ learning:{color:C.cyan,icon:"◈",label:"Learning"}, writeup:{color:"#7eb8ff",icon:"◎",label:"Write-up"}, practice:{color:C.orange,icon:"◆",label:"Practice"}, bug:{color:C.red,icon:"◉",label:"Bug Found"}, recon:{color:C.purple,icon:"◐",label:"Recon"}, other:{color:C.muted,icon:"○",label:"Other"} }[id] || {color:C.muted,icon:"○",label:"Other"});

// ═══════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════
function App() {
  const [session,   setSession  ] = React.useState(null);
  const [screen,    setScreen   ] = React.useState("home");
  const [phase,     setPhase    ] = React.useState("p1");
  const [weekPlan,  setWeekPlan ] = React.useState({});
  const [writeups,  setWriteups ] = React.useState([]);
  const [loading,   setLoading  ] = React.useState(true);
  const [toast,     setToast    ] = React.useState(null);
  const [authMode,  setAuthMode ] = React.useState("login"); // login | signup

  // Auth listener
  React.useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadData(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData(session.user.id);
      else { setLoading(false); setWeekPlan({}); setWriteups([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = async (uid) => {
    setLoading(true);
    try {
      // Load settings
      const { data: settings } = await db.from("user_settings").select("*").eq("user_id", uid).single();
      if (settings) setPhase(settings.phase || "p1");

      // Load week tasks (last 30 days + next 7)
      const from = addDays(todayKey(), -30);
      const to   = addDays(todayKey(), 7);
      const { data: tasks } = await db.from("week_tasks").select("*").eq("user_id", uid).gte("date", from).lte("date", to);
      if (tasks) {
        const plan = {};
        tasks.forEach(t => {
          if (!plan[t.date]) plan[t.date] = [];
          plan[t.date].push({ id: t.id, text: t.text, hours: t.hours, done: t.done, missed: t.missed });
        });
        setWeekPlan(plan);
      }

      // Load writeups (last 60 days)
      const wFrom = addDays(todayKey(), -60);
      const { data: wups } = await db.from("writeups").select("*").eq("user_id", uid).gte("date", wFrom).order("created_at", { ascending: false });
      if (wups) setWriteups(wups.map(w => ({ id: w.id, date: w.date, title: w.title, platform: w.platform, url: w.url, notes: w.notes })));
    } catch (e) { flash("Data load error", "err"); }
    setLoading(false);
  };

  const flash = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };

  // ── DB HELPERS ──────────────────────────
  const savePhase = async (p) => {
    setPhase(p);
    const uid = session?.user?.id;
    if (!uid) return;
    await db.from("user_settings").upsert({ user_id: uid, phase: p });
  };

  const addTask = async (date, text, hours) => {
    const uid = session?.user?.id;
    if (!uid) return;
    const { data } = await db.from("week_tasks").insert({ user_id:uid, date, text, hours, done:false, missed:false }).select().single();
    if (data) {
      setWeekPlan(p => ({ ...p, [date]: [...(p[date]||[]), { id:data.id, text, hours, done:false, missed:false }] }));
      flash("Task যোগ হয়েছে");
    }
  };

  const updateTask = async (date, taskId, fields) => {
    await db.from("week_tasks").update(fields).eq("id", taskId);
    setWeekPlan(p => ({ ...p, [date]: (p[date]||[]).map(t => t.id===taskId ? {...t,...fields} : t) }));
  };

  const deleteTask = async (date, taskId) => {
    await db.from("week_tasks").delete().eq("id", taskId);
    setWeekPlan(p => ({ ...p, [date]: (p[date]||[]).filter(t => t.id!==taskId) }));
  };

  const addWriteup = async (wu) => {
    const uid = session?.user?.id;
    if (!uid) return;
    const { data } = await db.from("writeups").insert({ user_id:uid, ...wu }).select().single();
    if (data) {
      setWriteups(p => [{ id:data.id, ...wu }, ...p]);
      flash(writeups.filter(w=>w.date===todayKey()).length >= 1 ? "🔥 আজকের quota পূরণ!" : "Write-up saved! আরো ১টা বাকি।");
    }
  };

  const deleteWriteup = async (id) => {
    await db.from("writeups").delete().eq("id", id);
    setWriteups(p => p.filter(w => w.id!==id));
    flash("Deleted");
  };

  const todayWriteups  = writeups.filter(w => w.date === todayKey());
  const writeupMissed  = todayWriteups.length < 2;

  const ctx = { session, phase, savePhase, weekPlan, addTask, updateTask, deleteTask, writeups, addWriteup, deleteWriteup, todayWriteups, writeupMissed, flash, setScreen, loading };

  if (loading) return React.createElement(Splash);
  if (!session) return React.createElement(AuthScreen, { authMode, setAuthMode, flash });

  return React.createElement("div", { style:{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:FONT, paddingBottom:80 } },
    React.createElement("style", null, `
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#05080f}::-webkit-scrollbar-thumb{background:#1a2a40;border-radius:2px}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      @keyframes glitch{0%,100%{clip-path:inset(0 0 98% 0);transform:translateX(0)}20%{clip-path:inset(30% 0 50% 0);transform:translateX(-3px)}60%{clip-path:inset(60% 0 20% 0);transform:translateX(3px)}}
      .tap{transition:opacity .1s}.tap:active{opacity:.7}
    `),
    React.createElement(Header, { ctx, screen, setScreen }),
    screen==="home"     && React.createElement(HomeScreen,     { ctx }),
    screen==="setup"    && React.createElement(SetupScreen,    { ctx }),
    screen==="planner"  && React.createElement(PlannerScreen,  { ctx }),
    screen==="checkin"  && React.createElement(CheckinScreen,  { ctx }),
    screen==="writeups" && React.createElement(WriteupsScreen, { ctx }),
    screen==="progress" && React.createElement(ProgressScreen, { ctx }),
    React.createElement(BottomNav, { screen, setScreen, writeupMissed }),
    toast && React.createElement(Toast, toast)
  );
}

// ═══════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════
function AuthScreen({ authMode, setAuthMode, flash }) {
  const [email, setEmail] = React.useState("");
  const [pass,  setPass ] = React.useState("");
  const [busy,  setBusy ] = React.useState(false);

  const handle = async () => {
    if (!email || !pass) return flash("Email ও password দাও", "err");
    setBusy(true);
    if (authMode === "signup") {
      const { error } = await db.auth.signUp({ email, password: pass });
      if (error) flash(error.message, "err");
      else flash("✓ Account হয়েছে! Login করো।");
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password: pass });
      if (error) flash("Email বা password ভুল", "err");
    }
    setBusy(false);
  };

  return React.createElement("div", { style:{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:FONT } },
    React.createElement("style", null, `@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes glitch{0%,100%{clip-path:inset(0 0 98% 0);transform:translateX(0)}20%{clip-path:inset(30% 0 50% 0);transform:translateX(-3px)}60%{clip-path:inset(60% 0 20% 0);transform:translateX(3px)}}`),
    // Logo
    React.createElement("div", { style:{ position:"relative", marginBottom:8 } },
      React.createElement("div", { style:{ fontSize:48, color:C.cyan } }, "◉"),
      React.createElement("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, color:C.purple, animation:"glitch 3s infinite", opacity:.6, pointerEvents:"none" } }, "◉")
    ),
    React.createElement("div", { style:{ fontSize:18, fontWeight:700, color:C.cyan, letterSpacing:3, marginBottom:4 } }, "BUG HUNTER"),
    React.createElement("div", { style:{ fontSize:10, color:C.muted, letterSpacing:4, marginBottom:40 } }, "ROADMAP TRACKER"),

    // Card
    React.createElement("div", { style:{ width:"100%", maxWidth:360, background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"24px", animation:"fadeUp .3s ease" } },
      React.createElement("div", { style:{ fontSize:11, color:C.cyan, letterSpacing:2, marginBottom:20 } }, authMode==="login" ? "LOGIN" : "CREATE ACCOUNT"),
      React.createElement("input", { placeholder:"Email", type:"email", value:email, onChange:e=>setEmail(e.target.value), style:{ ...inp, marginBottom:10 } }),
      React.createElement("input", { placeholder:"Password (min 6 char)", type:"password", value:pass, onChange:e=>setPass(e.target.value), onKeyDown:e=>e.key==="Enter"&&handle(), style:{ ...inp, marginBottom:16 } }),
      React.createElement("button", { onClick:handle, disabled:busy, style:{ width:"100%", background:`linear-gradient(135deg,${C.cyan}22,${C.purple}22)`, border:`1px solid ${C.cyan}`, color:C.cyan, borderRadius:9, padding:"12px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT, letterSpacing:2, opacity:busy?.6:1 } },
        busy ? "..." : authMode==="login" ? "LOGIN →" : "SIGN UP →"
      ),
      React.createElement("div", { style:{ textAlign:"center", marginTop:16, fontSize:11, color:C.muted } },
        authMode==="login" ? "Account নেই? " : "Already আছো? ",
        React.createElement("span", { onClick:()=>setAuthMode(authMode==="login"?"signup":"login"), style:{ color:C.cyan, cursor:"pointer" } },
          authMode==="login" ? "Sign up করো" : "Login করো"
        )
      )
    )
  );
}

// ═══════════════════════════════════════════
// SPLASH
// ═══════════════════════════════════════════
function Splash() {
  return React.createElement("div", { style:{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:FONT, gap:12 } },
    React.createElement("div", { style:{ fontSize:36, color:C.cyan } }, "◉"),
    React.createElement("div", { style:{ fontSize:10, color:C.muted, letterSpacing:4 } }, "LOADING...")
  );
}

// ═══════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════
function Header({ ctx, screen, setScreen }) {
  const ph = PHASES.find(p=>p.id===ctx.phase);
  const logout = async () => { await db.auth.signOut(); };
  return React.createElement("div", { style:{ position:"sticky", top:0, zIndex:50, background:"rgba(5,8,15,.94)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${C.border}` } },
    React.createElement("div", { style:{ maxWidth:520, margin:"0 auto", padding:"11px 16px", display:"flex", alignItems:"center", gap:10 } },
      React.createElement("div", { style:{ position:"relative", width:32, height:32, flexShrink:0 } },
        React.createElement("div", { style:{ width:32, height:32, border:`1.5px solid ${C.cyan}`, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:C.cyan } }, "◉"),
        React.createElement("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:C.purple, animation:"glitch 4s infinite", opacity:.6, pointerEvents:"none" } }, "◉")
      ),
      React.createElement("div", { style:{ flex:1, minWidth:0 } },
        React.createElement("div", { style:{ fontSize:12, fontWeight:700, color:C.cyan, letterSpacing:2 } }, "ROADMAP TRACKER"),
        ph && React.createElement("div", { style:{ fontSize:9, color:ph.color, letterSpacing:1, marginTop:1 } }, `${ph.icon} ${ph.months} · ${ph.title}`)
      ),
      ctx.writeupMissed && React.createElement("div", { onClick:()=>setScreen("writeups"), style:{ background:C.red+"22", border:`1px solid ${C.red}55`, borderRadius:6, padding:"4px 9px", fontSize:10, color:C.red, cursor:"pointer" } }, "⚠ W-up"),
      React.createElement("div", { onClick:logout, style:{ fontSize:10, color:C.muted, cursor:"pointer", padding:"4px 8px", border:`1px solid ${C.border}`, borderRadius:5 } }, "↩")
    )
  );
}

// ═══════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════
function BottomNav({ screen, setScreen, writeupMissed }) {
  const tabs = [
    {id:"home",icon:"⬡",label:"Home"},{id:"planner",icon:"◫",label:"Plan"},
    {id:"checkin",icon:"◎",label:"Today"},{id:"writeups",icon:"◈",label:"W-ups"},
    {id:"progress",icon:"▦",label:"Stats"},
  ];
  return React.createElement("nav", { style:{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"rgba(5,8,15,.96)", backdropFilter:"blur(14px)", borderTop:`1px solid ${C.border}` } },
    React.createElement("div", { style:{ maxWidth:520, margin:"0 auto", display:"flex", justifyContent:"space-around", padding:"7px 0 16px" } },
      tabs.map(t => {
        const active = screen===t.id;
        const badge  = t.id==="writeups" && writeupMissed;
        return React.createElement("button", { key:t.id, onClick:()=>setScreen(t.id), style:{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color:active?C.cyan:C.muted, padding:"3px 10px", position:"relative", fontFamily:FONT } },
          React.createElement("span", { style:{ fontSize:17, lineHeight:1 } }, t.icon),
          React.createElement("span", { style:{ fontSize:8, letterSpacing:1 } }, t.label),
          active && React.createElement("div", { style:{ width:12, height:1.5, background:C.cyan, borderRadius:1, marginTop:1 } }),
          badge && React.createElement("div", { style:{ position:"absolute", top:0, right:6, width:7, height:7, borderRadius:"50%", background:C.red, border:`1.5px solid ${C.bg}` } })
        );
      })
    )
  );
}

// ═══════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════
function HomeScreen({ ctx }) {
  const today     = todayKey();
  const ph        = PHASES.find(p=>p.id===ctx.phase);
  const days7     = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const todayTasks = ctx.weekPlan[today]||[];
  const doneCnt   = todayTasks.filter(t=>t.done).length;
  const weekTasks = days7.flatMap(d=>ctx.weekPlan[d]||[]);
  const weekDone  = weekTasks.filter(t=>t.done).length;
  const todayWU   = ctx.todayWriteups.length;

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .3s ease" } },
    // Phase banner
    ph && React.createElement("div", { style:{ background:ph.color+"12", border:`1px solid ${ph.color}33`, borderRadius:10, padding:"12px 14px", marginBottom:14, display:"flex", gap:12, alignItems:"center" } },
      React.createElement("div", { style:{ fontSize:22, color:ph.color } }, ph.icon),
      React.createElement("div", { style:{ flex:1 } },
        React.createElement("div", { style:{ fontSize:9, color:ph.color, letterSpacing:2 } }, `${ph.months} · ${ph.earn}`),
        React.createElement("div", { style:{ fontSize:13, fontWeight:700, color:C.text } }, ph.title),
        React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:2 } }, ph.focus)
      ),
      React.createElement("button", { onClick:()=>ctx.setScreen("setup"), style:{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, padding:"4px 8px", fontSize:9, cursor:"pointer", fontFamily:FONT } }, "Change")
    ),

    // Stats
    React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 } },
      React.createElement(QStat, { label:"আজ", value:`${doneCnt}/${todayTasks.length}`, color:doneCnt===todayTasks.length&&todayTasks.length>0?C.green:C.cyan, sub:"tasks" }),
      React.createElement(QStat, { label:"সপ্তাহ", value:`${weekDone}/${weekTasks.length}`, color:C.purple, sub:"tasks" }),
      React.createElement(QStat, { label:"W-ups", value:`${todayWU}/2`, color:todayWU>=2?C.green:C.red, sub:"আজকের" })
    ),

    // Write-up alert
    ctx.writeupMissed && React.createElement("div", { onClick:()=>ctx.setScreen("writeups"), style:{ background:C.red+"0f", border:`1px solid ${C.red}44`, borderRadius:10, padding:"11px 14px", marginBottom:14, cursor:"pointer" } },
      React.createElement("div", { style:{ fontSize:11, color:C.red, fontWeight:700 } }, "⚠ আজকের Write-up বাকি!"),
      React.createElement("div", { style:{ fontSize:11, color:C.muted, marginTop:3 } }, `আজ ${todayWU}টা পড়েছো · আরো ${2-todayWU}টা বাকি। Tap করো →`)
    ),

    // Today tasks
    React.createElement(Panel, { label:"আজকের Tasks" },
      todayTasks.length===0
        ? React.createElement(EmptyMsg, { msg:"আজকের কোনো task নেই।", cta:"Plan করো →", onCta:()=>ctx.setScreen("planner") })
        : React.createElement(React.Fragment, null,
            todayTasks.slice(0,4).map(t =>
              React.createElement("div", { key:t.id, style:{ display:"flex", gap:10, alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.dim}` } },
                React.createElement("div", { style:{ width:7, height:7, borderRadius:"50%", background:t.done?C.green:t.missed?C.red:C.muted, flexShrink:0 } }),
                React.createElement("div", { style:{ flex:1, fontSize:12, color:t.done?C.muted:C.text, textDecoration:t.done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, t.text),
                React.createElement("div", { style:{ fontSize:10, color:C.muted } }, `${t.hours}h`)
              )
            ),
            React.createElement("button", { onClick:()=>ctx.setScreen("checkin"), style:ghostBtn(C.cyan) }, "Check-in করো →")
          )
    ),

    // Phase tasks
    ph && React.createElement(Panel, { label:`Phase ${ph.num} · Suggested` },
      ph.tasks.slice(0,4).map((t,i) =>
        React.createElement("div", { key:i, style:{ fontSize:11, color:C.muted, padding:"5px 0", borderBottom:`1px solid ${C.dim}`, display:"flex", gap:8 } },
          React.createElement("span", { style:{ color:ph.color } }, "›"), t
        )
      ),
      React.createElement("button", { onClick:()=>ctx.setScreen("planner"), style:ghostBtn(ph.color) }, "Plan এ add করো →")
    )
  );
}

// ═══════════════════════════════════════════
// SETUP SCREEN
// ═══════════════════════════════════════════
function SetupScreen({ ctx }) {
  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, "Phase Select করো"),
    PHASES.map(ph =>
      React.createElement("div", { key:ph.id, className:"tap", onClick:()=>{ ctx.savePhase(ph.id); ctx.flash("Phase updated!"); ctx.setScreen("home"); }, style:{ background:ctx.phase===ph.id?ph.color+"14":C.surface, border:`1px solid ${ctx.phase===ph.id?ph.color:C.border}`, borderRadius:10, padding:"12px 14px", marginBottom:10, display:"flex", alignItems:"center", gap:12, cursor:"pointer" } },
        React.createElement("div", { style:{ width:36, height:36, borderRadius:8, background:ph.color+"18", border:`1px solid ${ph.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:ph.color, flexShrink:0 } }, ph.icon),
        React.createElement("div", { style:{ flex:1, minWidth:0 } },
          React.createElement("div", { style:{ fontSize:9, color:ph.color, letterSpacing:2 } }, `${ph.months} · ${ph.split}`),
          React.createElement("div", { style:{ fontSize:13, fontWeight:600, color:C.text, marginTop:2 } }, ph.title),
          React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:1 } }, ph.focus)
        ),
        ctx.phase===ph.id && React.createElement("div", { style:{ color:ph.color, fontSize:16 } }, "✓")
      )
    )
  );
}

// ═══════════════════════════════════════════
// PLANNER SCREEN
// ═══════════════════════════════════════════
function PlannerScreen({ ctx }) {
  const today  = todayKey();
  const days   = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const [selDay,  setSelDay ] = React.useState(today);
  const [newText, setNewText] = React.useState("");
  const [newHrs,  setNewHrs ] = React.useState("1");
  const [showSug, setShowSug] = React.useState(false);
  const [saving,  setSaving ] = React.useState(false);
  const ph = PHASES.find(p=>p.id===ctx.phase);
  const tasks = ctx.weekPlan[selDay]||[];

  const add = async () => {
    if (!newText.trim()) return ctx.flash("Task লিখো","err");
    setSaving(true);
    await ctx.addTask(selDay, newText.trim(), parseFloat(newHrs)||1);
    setNewText(""); setNewHrs("1");
    setSaving(false);
  };

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, "Weekly Planner"),

    // Day selector
    React.createElement("div", { style:{ display:"flex", gap:5, marginBottom:14, overflowX:"auto", paddingBottom:4 } },
      days.map(d => {
        const cnt    = (ctx.weekPlan[d]||[]).length;
        const isSel  = d===selDay;
        const isTdy  = d===today;
        return React.createElement("button", { key:d, onClick:()=>setSelDay(d), style:{ flexShrink:0, background:isSel?C.cyan+"18":C.surface, border:`1px solid ${isSel?C.cyan:isTdy?C.purple+"66":C.border}`, borderRadius:8, padding:"7px 10px", cursor:"pointer", textAlign:"center", minWidth:52, fontFamily:FONT } },
          React.createElement("div", { style:{ fontSize:9, color:isSel?C.cyan:C.muted } }, dayName(d)),
          React.createElement("div", { style:{ fontSize:12, fontWeight:700, color:isSel?C.cyan:C.text, marginTop:2 } }, fmtDate(d).split(" ")[0]),
          cnt>0 && React.createElement("div", { style:{ fontSize:9, color:C.muted, marginTop:1 } }, `${cnt}t`)
        );
      })
    ),

    // Add task
    React.createElement("div", { style:{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", marginBottom:12 } },
      React.createElement("div", { style:{ fontSize:9, color:C.cyan, letterSpacing:2, marginBottom:8 } }, `NEW TASK · ${dayName(selDay)} ${fmtDate(selDay)}`),
      React.createElement("input", { placeholder:"Task লিখো…", style:{ ...inp, marginBottom:8 }, value:newText, onChange:e=>setNewText(e.target.value), onKeyDown:e=>e.key==="Enter"&&add() }),
      React.createElement("div", { style:{ display:"flex", gap:8, alignItems:"center" } },
        React.createElement("span", { style:{ fontSize:10, color:C.muted, whiteSpace:"nowrap" } }, "ঘণ্টা:"),
        React.createElement("input", { type:"number", min:"0.5", max:"12", step:"0.5", style:{ ...inp, width:70 }, value:newHrs, onChange:e=>setNewHrs(e.target.value) }),
        React.createElement("button", { onClick:add, disabled:saving, style:{ flex:1, background:C.cyan+"18", border:`1px solid ${C.cyan}`, color:C.cyan, borderRadius:7, padding:"8px", fontSize:11, cursor:"pointer", fontFamily:FONT, opacity:saving?.6:1 } }, saving?"...":"+ Add"),
        ph && React.createElement("button", { onClick:()=>setShowSug(s=>!s), style:{ background:ph.color+"18", border:`1px solid ${ph.color}55`, color:ph.color, borderRadius:7, padding:"8px 10px", fontSize:11, cursor:"pointer", fontFamily:FONT } }, "Suggest")
      )
    ),

    // Suggestions
    showSug && ph && React.createElement("div", { style:{ background:C.surface, border:`1px solid ${ph.color}44`, borderRadius:10, padding:"12px 14px", marginBottom:12 } },
      ph.tasks.map((t,i) =>
        React.createElement("div", { key:i, className:"tap", onClick:async()=>{ await ctx.addTask(selDay,t,1); setShowSug(false); }, style:{ fontSize:11, color:C.muted, padding:"7px 0", borderBottom:`1px solid ${C.dim}`, cursor:"pointer", display:"flex", gap:8 } },
          React.createElement("span", { style:{ color:ph.color } }, "+"), t
        )
      )
    ),

    // Task list
    React.createElement(Panel, { label:`${dayName(selDay)} এর Tasks (${tasks.length})` },
      tasks.length===0
        ? React.createElement(EmptyMsg, { msg:"এই দিনে কোনো task নেই।" })
        : React.createElement(React.Fragment, null,
            tasks.map(t =>
              React.createElement("div", { key:t.id, style:{ display:"flex", gap:10, alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.dim}` } },
                React.createElement("div", { style:{ flex:1, minWidth:0 } },
                  React.createElement("div", { style:{ fontSize:12, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, t.text),
                  React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:2 } }, `${t.hours} ঘণ্টা`)
                ),
                React.createElement("button", { onClick:()=>ctx.deleteTask(selDay,t.id), style:{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:14, padding:"2px 6px" } }, "✕")
              )
            ),
            React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:10, display:"flex", justifyContent:"space-between" } },
              React.createElement("span", null, `মোট: ${tasks.reduce((a,t)=>a+t.hours,0)} ঘণ্টা`),
              React.createElement("span", { style:{ color:tasks.reduce((a,t)=>a+t.hours,0)>=6?C.green:C.orange } },
                tasks.reduce((a,t)=>a+t.hours,0)>=6 ? "✓ Target met" : `${6-tasks.reduce((a,t)=>a+t.hours,0)}h আরো দরকার`
              )
            )
          )
    )
  );
}

// ═══════════════════════════════════════════
// CHECK-IN SCREEN
// ═══════════════════════════════════════════
function CheckinScreen({ ctx }) {
  const today  = todayKey();
  const tasks  = ctx.weekPlan[today]||[];
  const doneCnt   = tasks.filter(t=>t.done).length;
  const missedCnt = tasks.filter(t=>t.missed).length;
  const totalHrs  = tasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const pct = tasks.length>0 ? Math.round((doneCnt/tasks.length)*100) : 0;

  const toggle = async (t, field) => {
    const fields = field==="done"
      ? { done:!t.done, missed: !t.done ? false : t.missed }
      : { missed:!t.missed };
    await ctx.updateTask(today, t.id, fields);
  };

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, `আজকের Check-in · ${fmtDate(today)}`),

    // Ring
    React.createElement("div", { style:{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"16px", marginBottom:14, display:"flex", gap:16, alignItems:"center" } },
      React.createElement("div", { style:{ position:"relative", width:64, height:64, flexShrink:0 } },
        React.createElement("svg", { width:"64", height:"64", viewBox:"0 0 64 64" },
          React.createElement("circle", { cx:"32", cy:"32", r:"26", fill:"none", stroke:C.dim, strokeWidth:"5" }),
          React.createElement("circle", { cx:"32", cy:"32", r:"26", fill:"none", stroke:pct===100?C.green:C.cyan, strokeWidth:"5", strokeDasharray:`${2*Math.PI*26}`, strokeDashoffset:`${2*Math.PI*26*(1-pct/100)}`, strokeLinecap:"round", transform:"rotate(-90 32 32)", style:{ transition:"stroke-dashoffset .5s ease" } })
        ),
        React.createElement("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:pct===100?C.green:C.cyan } }, `${pct}%`)
      ),
      React.createElement("div", { style:{ flex:1 } },
        React.createElement("div", { style:{ display:"flex", gap:12, marginBottom:4 } },
          React.createElement("span", { style:{ fontSize:11, color:C.green } }, `✓ ${doneCnt} done`),
          React.createElement("span", { style:{ fontSize:11, color:C.red } }, `✕ ${missedCnt} missed`),
          React.createElement("span", { style:{ fontSize:11, color:C.muted } }, `${tasks.length-doneCnt-missedCnt} pending`)
        ),
        React.createElement("div", { style:{ fontSize:12, color:C.muted } }, `মোট: ${totalHrs} ঘণ্টা`),
        ctx.writeupMissed && React.createElement("div", { style:{ fontSize:11, color:C.red, marginTop:4 } }, `⚠ Write-up ${ctx.todayWriteups.length}/2 বাকি!`)
      )
    ),

    // Tasks
    tasks.length===0
      ? React.createElement(EmptyMsg, { msg:"আজকের task নেই।", cta:"Plan করো →", onCta:()=>ctx.setScreen("planner") })
      : tasks.map(t =>
          React.createElement("div", { key:t.id, style:{ background:C.surface, border:`1px solid ${t.done?C.green+"44":t.missed?C.red+"44":C.border}`, borderRadius:9, padding:"11px 14px", marginBottom:8, display:"flex", gap:12, alignItems:"center" } },
            React.createElement("div", { style:{ flex:1, minWidth:0 } },
              React.createElement("div", { style:{ fontSize:13, color:t.done?C.muted:C.text, textDecoration:t.done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, t.text),
              React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:3 } }, `${t.hours} ঘণ্টা`)
            ),
            React.createElement("div", { style:{ display:"flex", gap:6 } },
              React.createElement("button", { onClick:()=>toggle(t,"done"), style:{ width:32, height:32, borderRadius:7, border:`1.5px solid ${t.done?C.green:C.border}`, background:t.done?C.green+"22":"transparent", color:t.done?C.green:C.muted, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" } }, "✓"),
              React.createElement("button", { onClick:()=>toggle(t,"missed"), style:{ width:32, height:32, borderRadius:7, border:`1.5px solid ${t.missed?C.red:C.border}`, background:t.missed?C.red+"22":"transparent", color:t.missed?C.red:C.muted, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" } }, "✕")
            )
          )
        )
  );
}

// ═══════════════════════════════════════════
// WRITE-UPS SCREEN
// ═══════════════════════════════════════════
function WriteupsScreen({ ctx }) {
  const [form,     setForm    ] = React.useState({ title:"", platform:"HackerOne", url:"", notes:"" });
  const [filter,   setFilter  ] = React.useState("all");
  const [search,   setSearch  ] = React.useState("");
  const [expanded, setExpanded] = React.useState(null);
  const [showForm, setShowForm] = React.useState(false);
  const [saving,   setSaving  ] = React.useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const platforms = ["HackerOne","Bugcrowd","Intigriti","Synack","Other"];
  const today  = todayKey();
  const todayCnt = ctx.todayWriteups.length;
  const last7  = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const rangeStart = addDays(today,-3);
  const weekCnt = ctx.writeups.filter(w=>w.date>=rangeStart&&w.date<=today).length;

  const streak = (() => {
    let s=0, d=new Date();
    for(let i=0;i<60;i++){ const key=d.toISOString().split("T")[0]; if(ctx.writeups.filter(w=>w.date===key).length>=2){s++;d.setDate(d.getDate()-1);}else break; }
    return s;
  })();

  const filtered = ctx.writeups
    .filter(w=>filter==="all"||w.platform===filter)
    .filter(w=>!search.trim()||(w.title+w.notes+w.platform).toLowerCase().includes(search.toLowerCase()));

  const add = async () => {
    if (!form.title.trim()) return ctx.flash("Title লিখো","err");
    setSaving(true);
    await ctx.addWriteup({ date:today, ...form });
    setForm({ title:"", platform:"HackerOne", url:"", notes:"" });
    setShowForm(false);
    setSaving(false);
  };

  const platColor = p => ({ HackerOne:C.red, Bugcrowd:C.orange, Intigriti:C.purple, Synack:C.green }[p]||C.muted);

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    // Header
    React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:10, marginBottom:14 } },
      React.createElement("span", { style:{ fontSize:10, fontWeight:700, color:C.cyan, letterSpacing:2 } }, "WRITE-UP TRACKER"),
      React.createElement("div", { style:{ flex:1, height:1, background:`linear-gradient(90deg,${C.border},transparent)` } })
    ),

    // Quota
    React.createElement("div", { style:{ background:todayCnt>=2?C.green+"0f":C.red+"0f", border:`1px solid ${todayCnt>=2?C.green+"44":C.red+"44"}`, borderRadius:10, padding:"12px 14px", marginBottom:14, display:"flex", gap:12, alignItems:"center" } },
      React.createElement("div", { style:{ fontSize:24 } }, todayCnt>=2?"✅":"⚠️"),
      React.createElement("div", { style:{ flex:1 } },
        React.createElement("div", { style:{ fontSize:13, fontWeight:700, color:todayCnt>=2?C.green:C.red } }, todayCnt>=2?"আজকের quota পূরণ! 🔥":`আজ ${todayCnt}/2 write-up`),
        React.createElement("div", { style:{ fontSize:11, color:C.muted, marginTop:3 } }, todayCnt<2?`আরো ${2-todayCnt}টা পড়তে হবে!`:"Roadmap অনুযায়ী চলছো।")
      ),
      React.createElement("div", { style:{ textAlign:"right" } },
        React.createElement("div", { style:{ fontSize:16, fontWeight:700, color:C.cyan } }, ctx.writeups.length),
        React.createElement("div", { style:{ fontSize:9, color:C.muted } }, "মোট")
      )
    ),

    // Stats
    React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 } },
      React.createElement(QStat, { label:"আজ", value:`${todayCnt}/2`, color:todayCnt>=2?C.green:C.red, sub:"write-ups" }),
      React.createElement(QStat, { label:"৭ দিন", value:weekCnt, color:C.cyan, sub:"total" }),
      React.createElement(QStat, { label:"Streak", value:`${streak}d`, color:C.orange, sub:"2/day" })
    ),

    // Heatmap
    React.createElement(Panel, { label:"৭ দিন" },
      React.createElement("div", { style:{ display:"flex", gap:5 } },
        last7.map(d => {
          const cnt = ctx.writeups.filter(w=>w.date===d).length;
          const bg  = cnt===0?C.dim:cnt>=2?C.green:C.orange;
          return React.createElement("div", { key:d, style:{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 } },
            React.createElement("div", { style:{ width:"100%", aspectRatio:"1", borderRadius:5, background:cnt===0?C.dim:bg+"22", border:`1.5px solid ${d===today?C.cyan:cnt===0?C.border:bg+"66"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:cnt===0?C.muted:bg } }, cnt||"·"),
            React.createElement("div", { style:{ fontSize:8, color:d===today?C.cyan:C.muted } }, dayName(d))
          );
        })
      )
    ),

    // Toggle add form
    React.createElement("button", { onClick:()=>setShowForm(s=>!s), style:{ width:"100%", marginBottom:12, background:showForm?C.surface2:`linear-gradient(135deg,${C.cyan}18,${C.purple}18)`, border:`1px solid ${showForm?C.border:C.cyan}`, color:showForm?C.muted:C.cyan, borderRadius:9, padding:"11px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT, letterSpacing:1 } },
      showForm ? "✕ বন্ধ করো" : "+ নতুন Write-up Log করো"
    ),

    // Add form
    showForm && React.createElement(Panel, { label:"নতুন Write-up" },
      React.createElement("input", { placeholder:"Write-up title / vulnerability type", style:{ ...inp, marginBottom:8 }, value:form.title, onChange:e=>set("title",e.target.value) }),
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 } },
        React.createElement("select", { style:inp, value:form.platform, onChange:e=>set("platform",e.target.value) }, platforms.map(p=>React.createElement("option",{key:p},p))),
        React.createElement("input", { placeholder:"URL (optional)", style:inp, value:form.url, onChange:e=>set("url",e.target.value) })
      ),
      React.createElement("textarea", { placeholder:"কী শিখলে?", style:{ ...inp, minHeight:60, resize:"vertical" }, value:form.notes, onChange:e=>set("notes",e.target.value) }),
      React.createElement("button", { onClick:add, disabled:saving, style:{ width:"100%", marginTop:10, background:`linear-gradient(135deg,${C.cyan}18,${C.purple}18)`, border:`1px solid ${C.cyan}`, color:C.cyan, borderRadius:8, padding:"11px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:FONT, opacity:saving?.6:1 } }, saving?"Saving...":"✓ SAVE")
    ),

    // Search
    React.createElement("div", { style:{ position:"relative", marginBottom:10 } },
      React.createElement("span", { style:{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:13, pointerEvents:"none" } }, "⌕"),
      React.createElement("input", { placeholder:`${ctx.writeups.length}টা write-up এ search…`, style:{ ...inp, paddingLeft:30 }, value:search, onChange:e=>setSearch(e.target.value) })
    ),

    // Filter
    React.createElement("div", { style:{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 } },
      ["all",...platforms].map(p =>
        React.createElement("button", { key:p, onClick:()=>setFilter(p), style:{ background:filter===p?C.cyan+"18":"transparent", border:`1px solid ${filter===p?C.cyan:C.border}`, color:filter===p?C.cyan:C.muted, borderRadius:5, padding:"4px 10px", fontSize:10, cursor:"pointer", fontFamily:FONT } }, p==="all"?`All (${ctx.writeups.length})`:p)
      )
    ),

    // List
    filtered.length===0
      ? React.createElement(EmptyMsg, { msg:search?`"${search}" পাওয়া যায়নি`:"এখনো কোনো write-up নেই।" })
      : filtered.map((w,i) => {
          const isOpen = expanded===w.id;
          return React.createElement("div", { key:w.id, style:{ background:C.surface, border:`1px solid ${isOpen?C.cyan+"55":C.border}`, borderRadius:9, marginBottom:7, overflow:"hidden", transition:"border .15s", animation:`fadeUp .15s ease ${Math.min(i,8)*15}ms both` } },
            React.createElement("div", { onClick:()=>setExpanded(isOpen?null:w.id), style:{ display:"flex", gap:10, padding:"10px 13px", alignItems:"center", cursor:"pointer" } },
              React.createElement("div", { style:{ width:3, height:32, borderRadius:2, flexShrink:0, background:platColor(w.platform) } }),
              React.createElement("div", { style:{ flex:1, minWidth:0 } },
                React.createElement("div", { style:{ fontSize:12, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, w.title),
                React.createElement("div", { style:{ display:"flex", gap:7, marginTop:3 } },
                  React.createElement("span", { style:{ fontSize:10, color:platColor(w.platform) } }, w.platform),
                  React.createElement("span", { style:{ fontSize:9, color:C.muted } }, "·"),
                  React.createElement("span", { style:{ fontSize:10, color:C.muted } }, fmtDate(w.date)),
                  w.notes && React.createElement("span", { style:{ fontSize:9, color:C.muted } }, "· note ✎")
                )
              ),
              React.createElement("span", { style:{ color:C.muted, fontSize:11, transform:isOpen?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 } }, "▾")
            ),
            isOpen && React.createElement("div", { style:{ padding:"0 13px 12px 26px", borderTop:`1px solid ${C.dim}` }, onClick:e=>e.stopPropagation() },
              w.url && React.createElement("a", { href:w.url, target:"_blank", rel:"noreferrer", style:{ display:"inline-block", marginTop:10, fontSize:11, color:C.purple, textDecoration:"none" } }, `↗ ${w.url.length>40?w.url.slice(0,40)+"…":w.url}`),
              w.notes && React.createElement("div", { style:{ fontSize:12, color:"#8da0bb", marginTop:10, lineHeight:1.7, whiteSpace:"pre-wrap", borderLeft:`2px solid ${C.border}`, paddingLeft:10 } }, w.notes),
              React.createElement("button", { onClick:()=>ctx.deleteWriteup(w.id), style:{ marginTop:10, background:"transparent", border:`1px solid ${C.red}44`, color:C.red, borderRadius:6, padding:"5px 12px", fontSize:11, cursor:"pointer", fontFamily:FONT } }, "✕ Delete")
            )
          );
        })
  );
}

// ═══════════════════════════════════════════
// PROGRESS SCREEN
// ═══════════════════════════════════════════
function ProgressScreen({ ctx }) {
  const [tab, setTab] = React.useState("today");
  const today = todayKey();
  const days7 = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const todayTasks    = ctx.weekPlan[today]||[];
  const tDone   = todayTasks.filter(t=>t.done).length;
  const tMissed = todayTasks.filter(t=>t.missed).length;
  const tHours  = todayTasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const tWU     = ctx.todayWriteups.length;
  const weekAllTasks  = days7.flatMap(d=>(ctx.weekPlan[d]||[]).map(t=>({...t,date:d})));
  const wDone   = weekAllTasks.filter(t=>t.done).length;
  const wMissed = weekAllTasks.filter(t=>t.missed).length;
  const wHours  = weekAllTasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const rangeStart = addDays(today,-3);
  const wWU = ctx.writeups.filter(w=>w.date>=rangeStart&&w.date<=today).length;
  const monthStart = today.slice(0,7)+"-01";
  const mWU = ctx.writeups.filter(w=>w.date>=monthStart&&w.date<=today).length;

  const tabs = [["today","আজ"],["week","সপ্তাহ"],["month","মাস"]];

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, "Progress"),

    // Tab switcher
    React.createElement("div", { style:{ display:"flex", background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:3, marginBottom:14 } },
      tabs.map(([k,l]) =>
        React.createElement("button", { key:k, onClick:()=>setTab(k), style:{ flex:1, background:tab===k?C.cyan+"18":"transparent", border:`1px solid ${tab===k?C.cyan:"transparent"}`, color:tab===k?C.cyan:C.muted, borderRadius:6, padding:"8px", fontSize:11, cursor:"pointer", fontFamily:FONT } }, l)
      )
    ),

    // TODAY
    tab==="today" && React.createElement(React.Fragment, null,
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:14 } },
        React.createElement(QStat, { label:"Done", value:tDone, color:C.green, sub:"tasks" }),
        React.createElement(QStat, { label:"Missed", value:tMissed, color:C.red, sub:"tasks" }),
        React.createElement(QStat, { label:"Hours", value:tHours, color:C.cyan, sub:"worked" }),
        React.createElement(QStat, { label:"W-ups", value:`${tWU}/2`, color:tWU>=2?C.green:C.red, sub:"today" })
      ),
      todayTasks.length===0
        ? React.createElement(EmptyMsg, { msg:"আজকের task নেই।", cta:"Plan করো →", onCta:()=>ctx.setScreen("planner") })
        : React.createElement(Panel, { label:"আজকের Summary" },
            React.createElement(PBar, { done:tDone, total:todayTasks.length, color:C.cyan, label:"Tasks" }),
            React.createElement(PBar, { done:tHours, total:8, color:C.orange, label:"Hours (target 8h)" }),
            React.createElement(PBar, { done:tWU, total:2, color:tWU>=2?C.green:C.red, label:"Write-ups (min 2)" })
          )
    ),

    // WEEK
    tab==="week" && React.createElement(React.Fragment, null,
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 } },
        React.createElement(QStat, { label:"Done", value:wDone, color:C.green, sub:"tasks" }),
        React.createElement(QStat, { label:"Hours", value:wHours, color:C.cyan, sub:"total" }),
        React.createElement(QStat, { label:"W-ups", value:wWU, color:wWU>=7?C.green:C.orange, sub:"7 দিন" })
      ),
      React.createElement(Panel, { label:"দিনগুলো" },
        React.createElement("div", { style:{ display:"flex", gap:5 } },
          days7.map(d => {
            const dt  = ctx.weekPlan[d]||[];
            const done = dt.filter(t=>t.done).length;
            const tot  = dt.length;
            const pct  = tot>0?done/tot:0;
            const bg   = tot===0?C.dim:pct===1?C.green:pct>0.5?C.orange:C.red;
            return React.createElement("div", { key:d, style:{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 } },
              React.createElement("div", { style:{ width:"100%", aspectRatio:"1", borderRadius:5, background:tot===0?C.dim:bg+"22", border:`1.5px solid ${d===today?C.cyan:tot===0?C.border:bg+"55"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:tot===0?C.muted:bg } }, tot===0?"·":`${done}/${tot}`),
              React.createElement("div", { style:{ fontSize:8, color:d===today?C.cyan:C.muted } }, dayName(d))
            );
          })
        )
      ),
      wMissed>0 && React.createElement(Panel, { label:`⚠ ${wMissed}টা Task Miss` },
        weekAllTasks.filter(t=>t.missed).slice(0,5).map((t,i) =>
          React.createElement("div", { key:i, style:{ fontSize:11, color:C.red, padding:"4px 0", borderBottom:`1px solid ${C.dim}`, display:"flex", gap:8 } },
            React.createElement("span", { style:{ color:C.muted, fontSize:9 } }, fmtDate(t.date)),
            React.createElement("span", null, "✕"), t.text
          )
        ),
        React.createElement("div", { style:{ fontSize:10, color:C.orange, marginTop:8 } }, "💡 এগুলো আগামী দিনে plan এ রাখো।")
      )
    ),

    // MONTH
    tab==="month" && React.createElement(React.Fragment, null,
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 } },
        React.createElement(QStat, { label:"Write-ups", value:mWU, color:C.cyan, sub:"এই মাসে" }),
        React.createElement(QStat, { label:"Target", value:`${Math.floor(new Date(today.slice(0,4),today.slice(5,7),0).getDate()*6/7)*2}`, color:C.muted, sub:"2/day goal" })
      ),
      (() => { const ph=PHASES.find(p=>p.id===ctx.phase); return ph && React.createElement(Panel, { label:"Current Phase" },
        React.createElement("div", { style:{ fontSize:12, color:ph.color, fontWeight:700, marginBottom:8 } }, `${ph.icon} ${ph.title}`),
        ph.tasks.map((t,i) => React.createElement("div", { key:i, style:{ fontSize:11, color:C.muted, padding:"3px 0" } }, `› ${t}`)),
        React.createElement("div", { style:{ marginTop:10, padding:"10px", background:ph.color+"0f", border:`1px solid ${ph.color}33`, borderRadius:7, fontSize:10, color:ph.color } }, `Target: ${ph.earn} · ${ph.split}`)
      ); })()
    )
  );
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
function Panel({ label, children }) {
  return React.createElement("div", { style:{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"13px 15px", marginBottom:12 } },
    label && React.createElement("div", { style:{ fontSize:9, color:C.muted, letterSpacing:3, marginBottom:11 } }, label.toUpperCase()),
    children
  );
}
function SHead({ children }) {
  return React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:10, marginBottom:14 } },
    React.createElement("span", { style:{ fontSize:10, fontWeight:700, color:C.cyan, letterSpacing:2 } }, String(children).toUpperCase()),
    React.createElement("div", { style:{ flex:1, height:1, background:`linear-gradient(90deg,${C.border},transparent)` } })
  );
}
function QStat({ label, value, color, sub }) {
  return React.createElement("div", { style:{ background:C.surface, border:`1px solid ${color}22`, borderRadius:9, padding:"10px 8px", textAlign:"center" } },
    React.createElement("div", { style:{ fontSize:9, color:C.muted, letterSpacing:1, marginBottom:4 } }, label.toUpperCase()),
    React.createElement("div", { style:{ fontSize:18, fontWeight:700, color, lineHeight:1 } }, value),
    React.createElement("div", { style:{ fontSize:9, color:C.muted, marginTop:3 } }, sub)
  );
}
function PBar({ done, total, color, label }) {
  const pct = total>0?Math.min(100,Math.round((done/total)*100)):0;
  return React.createElement("div", { style:{ marginBottom:10 } },
    React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", marginBottom:5 } },
      React.createElement("span", { style:{ fontSize:10, color:C.muted } }, label),
      React.createElement("span", { style:{ fontSize:10, color } }, `${pct}%`)
    ),
    React.createElement("div", { style:{ height:5, background:C.dim, borderRadius:3, overflow:"hidden" } },
      React.createElement("div", { style:{ width:`${pct}%`, height:"100%", background:color, borderRadius:3, transition:"width .6s ease" } })
    )
  );
}
function EmptyMsg({ msg, cta, onCta }) {
  return React.createElement("div", { style:{ textAlign:"center", padding:"20px 0" } },
    React.createElement("div", { style:{ fontSize:22, marginBottom:8, color:C.muted } }, "◎"),
    React.createElement("div", { style:{ fontSize:12, color:C.muted, marginBottom:10 } }, msg),
    cta && onCta && React.createElement("button", { onClick:onCta, style:{ background:"transparent", border:`1px solid ${C.cyan}44`, color:C.cyan, borderRadius:6, padding:"7px 16px", fontSize:11, cursor:"pointer", fontFamily:FONT } }, cta)
  );
}
function Toast({ msg, type }) {
  const color = type==="err"?C.red:C.green;
  return React.createElement("div", { style:{ position:"fixed", top:66, left:"50%", transform:"translateX(-50%)", background:C.surface, border:`1px solid ${color}`, color, padding:"9px 20px", borderRadius:8, fontSize:12, zIndex:999, whiteSpace:"nowrap", boxShadow:`0 4px 24px ${color}22` } }, msg);
}

const inp = { background:C.surface2, border:`1px solid ${C.border}`, color:C.text, borderRadius:7, padding:"9px 12px", fontSize:12, width:"100%", outline:"none" };
const ghostBtn = (color) => ({ background:"transparent", border:`1px solid ${color}44`, color, borderRadius:7, padding:"8px 16px", fontSize:11, cursor:"pointer", fontFamily:FONT, marginTop:8, width:"100%", letterSpacing:1, display:"block" });

// ═══════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
