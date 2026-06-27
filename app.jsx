// ═══════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════
const SUPABASE_URL  = "https://ttjqwsgyrmakbkgpnbxt.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anF3c2d5cm1ha2JrZ3BuYnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDc5NTUsImV4cCI6MjA5ODA4Mzk1NX0.hO3PUSdo8ZZOJYC4OhQhOgUpBwNvseYSxHW4aTE_JkI";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ═══════════════════════════════════════════
// DESIGN TOKENS — v2
// ═══════════════════════════════════════════
const C = {
  bg:      "#030712",
  surface: "#0a1628",
  surface2:"#0f1e36",
  border:  "#162234",
  borderHi:"#1e3450",
  cyan:    "#00e5ff",
  purple:  "#a855f7",
  green:   "#00ff88",
  red:     "#ff4757",
  orange:  "#ff9f43",
  yellow:  "#ffd32a",
  text:    "#e2eeff",
  sub:     "#6b8aad",
  muted:   "#243a52",
  dim:     "#0b1522",
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

// ═══════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════
const GLOBAL_CSS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  
  body {
    background-color: ${C.bg} !important;
    background-image:
      linear-gradient(rgba(0,229,255,0.022) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.022) 1px, transparent 1px) !important;
    background-size: 40px 40px !important;
    background-attachment: fixed !important;
  }

  ::-webkit-scrollbar { width: 2px; height: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.18); border-radius: 2px; }

  input, textarea, select {
    font-family: ${FONT};
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  input:focus, textarea:focus, select:focus {
    border-color: rgba(0,229,255,0.45) !important;
    box-shadow: 0 0 0 3px rgba(0,229,255,0.07), 0 0 14px rgba(0,229,255,0.08) !important;
    outline: none !important;
    background: ${C.surface2} !important;
  }
  select option { background: ${C.surface2}; color: ${C.text}; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  @keyframes glitch {
    0%,100% { clip-path: inset(0 0 98% 0); transform: translateX(0); }
    20%     { clip-path: inset(30% 0 50% 0); transform: translateX(-3px); }
    60%     { clip-path: inset(60% 0 20% 0); transform: translateX(3px); }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 8px rgba(0,229,255,0.2); }
    50%     { box-shadow: 0 0 22px rgba(0,229,255,0.45), 0 0 40px rgba(0,229,255,0.1); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .tap { transition: opacity 0.12s, transform 0.12s; }
  .tap:active { opacity: 0.68; transform: scale(0.97); }
`;

// ═══════════════════════════════════════════
// SHARED STYLE OBJECTS
// ═══════════════════════════════════════════
const inp = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  color: C.text,
  borderRadius: 8,
  padding: "10px 13px",
  fontSize: 12,
  width: "100%",
  outline: "none",
};

const ghostBtn = (color) => ({
  background: "transparent",
  border: `1px solid ${color}44`,
  color,
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 11,
  cursor: "pointer",
  fontFamily: FONT,
  marginTop: 8,
  width: "100%",
  letterSpacing: 1,
  display: "block",
  transition: "border-color 0.15s, box-shadow 0.15s",
});

// ═══════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════
function App() {
  const [session,  setSession ] = React.useState(null);
  const [screen,   setScreen  ] = React.useState("home");
  const [phase,    setPhase   ] = React.useState("p1");
  const [weekPlan, setWeekPlan] = React.useState({});
  const [writeups, setWriteups] = React.useState([]);
  const [loading,  setLoading ] = React.useState(true);
  const [toast,    setToast   ] = React.useState(null);
  const [authMode, setAuthMode] = React.useState("login");

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
      const { data: settings } = await db.from("user_settings").select("*").eq("user_id", uid).single();
      if (settings) setPhase(settings.phase || "p1");
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
      const wFrom = addDays(todayKey(), -60);
      const { data: wups } = await db.from("writeups").select("*").eq("user_id", uid).gte("date", wFrom).order("created_at", { ascending: false });
      if (wups) setWriteups(wups.map(w => ({ id: w.id, date: w.date, title: w.title, platform: w.platform, url: w.url, notes: w.notes })));
    } catch (e) { flash("Data load error", "err"); }
    setLoading(false);
  };

  const flash = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null), 2800); };

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
      flash("Task যোগ হয়েছে ✓");
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

  const todayWriteups = writeups.filter(w => w.date === todayKey());
  const writeupMissed = todayWriteups.length < 2;
  const ctx = { session, phase, savePhase, weekPlan, addTask, updateTask, deleteTask, writeups, addWriteup, deleteWriteup, todayWriteups, writeupMissed, flash, setScreen, loading };

  if (loading) return React.createElement(Splash);
  if (!session) return React.createElement(AuthScreen, { authMode, setAuthMode, flash });

  return React.createElement("div", { style:{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:FONT, paddingBottom:88 } },
    React.createElement("style", null, GLOBAL_CSS),
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
// SPLASH
// ═══════════════════════════════════════════
function Splash() {
  return React.createElement("div", { style:{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:C.bg, fontFamily:FONT, gap:16 } },
    React.createElement("style", null, GLOBAL_CSS),
    React.createElement("div", { style:{ position:"relative" } },
      React.createElement("div", { style:{ fontSize:40, color:C.cyan, animation:"glowPulse 2s ease infinite", filter:"drop-shadow(0 0 12px #00e5ff)" } }, "◉"),
      React.createElement("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, color:C.purple, animation:"glitch 3s infinite", opacity:.5, pointerEvents:"none" } }, "◉")
    ),
    React.createElement("div", { style:{ fontSize:10, color:C.muted, letterSpacing:5, animation:"pulse 1.5s ease infinite" } }, "LOADING...")
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
    React.createElement("style", null, GLOBAL_CSS),

    // Logo block
    React.createElement("div", { style:{ position:"relative", marginBottom:10 } },
      React.createElement("div", { style:{ fontSize:52, color:C.cyan, filter:"drop-shadow(0 0 16px #00e5ff88)", animation:"glowPulse 2.5s ease infinite" } }, "◉"),
      React.createElement("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, color:C.purple, animation:"glitch 4s infinite", opacity:.45, pointerEvents:"none" } }, "◉")
    ),
    React.createElement("div", { style:{ fontSize:16, fontWeight:700, color:C.cyan, letterSpacing:4, marginBottom:4, textShadow:"0 0 12px #00e5ff88" } }, "BUG HUNTER"),
    React.createElement("div", { style:{ fontSize:9, color:C.muted, letterSpacing:5, marginBottom:44 } }, "ROADMAP TRACKER"),

    // Card
    React.createElement("div", { style:{
      width:"100%", maxWidth:360,
      background:`linear-gradient(145deg, ${C.surface} 0%, ${C.surface2} 100%)`,
      border:`1px solid ${C.borderHi}`,
      borderTop:`1px solid rgba(0,229,255,0.18)`,
      borderRadius:16,
      padding:"28px 24px",
      boxShadow:`0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.04)`,
      animation:"fadeUp .3s ease"
    } },
      React.createElement("div", { style:{ fontSize:10, color:C.cyan, letterSpacing:3, marginBottom:22, display:"flex", alignItems:"center", gap:8 } },
        React.createElement("div", { style:{ width:3, height:14, background:`linear-gradient(180deg,${C.cyan},${C.purple})`, borderRadius:2 } }),
        authMode==="login" ? "LOGIN" : "CREATE ACCOUNT"
      ),
      React.createElement("input", { placeholder:"Email", type:"email", value:email, onChange:e=>setEmail(e.target.value), style:{ ...inp, marginBottom:10 } }),
      React.createElement("input", { placeholder:"Password (min 6 char)", type:"password", value:pass, onChange:e=>setPass(e.target.value), onKeyDown:e=>e.key==="Enter"&&handle(), style:{ ...inp, marginBottom:20 } }),
      React.createElement("button", {
        onClick:handle, disabled:busy,
        style:{
          width:"100%",
          background:busy ? C.surface2 : `linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(168,85,247,0.15) 100%)`,
          border:`1px solid ${busy?C.border:C.cyan}`,
          color:busy?C.muted:C.cyan,
          borderRadius:9, padding:"13px",
          fontSize:11, fontWeight:700, cursor:busy?"default":"pointer",
          fontFamily:FONT, letterSpacing:3,
          boxShadow:busy?"none":`0 0 20px rgba(0,229,255,0.12)`,
          transition:"all 0.2s"
        }
      }, busy ? "..." : authMode==="login" ? "LOGIN →" : "SIGN UP →"),
      React.createElement("div", { style:{ textAlign:"center", marginTop:18, fontSize:11, color:C.sub } },
        authMode==="login" ? "Account নেই? " : "Already আছো? ",
        React.createElement("span", { onClick:()=>setAuthMode(authMode==="login"?"signup":"login"), style:{ color:C.cyan, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 } },
          authMode==="login" ? "Sign up করো" : "Login করো"
        )
      )
    )
  );
}

// ═══════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════
function Header({ ctx, screen, setScreen }) {
  const ph = PHASES.find(p => p.id===ctx.phase);
  const logout = async () => { await db.auth.signOut(); };

  return React.createElement("div", { style:{
    position:"sticky", top:0, zIndex:50,
    background:"rgba(3,7,18,0.88)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
    borderBottom:`1px solid rgba(0,229,255,0.07)`,
    boxShadow:"0 4px 30px rgba(0,0,0,0.5)"
  } },
    React.createElement("div", { style:{ maxWidth:520, margin:"0 auto", padding:"11px 16px", display:"flex", alignItems:"center", gap:11 } },
      // Logo
      React.createElement("div", { style:{ position:"relative", width:34, height:34, flexShrink:0 } },
        React.createElement("div", { style:{
          width:34, height:34,
          border:`1.5px solid ${C.cyan}`,
          borderRadius:8,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:17, color:C.cyan,
          boxShadow:`0 0 14px rgba(0,229,255,0.3), inset 0 0 10px rgba(0,229,255,0.08)`
        } }, "◉"),
        React.createElement("div", { style:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, color:C.purple, animation:"glitch 5s infinite", opacity:.45, pointerEvents:"none" } }, "◉")
      ),
      // Title
      React.createElement("div", { style:{ flex:1, minWidth:0 } },
        React.createElement("div", { style:{ fontSize:11, fontWeight:700, color:C.cyan, letterSpacing:3, textShadow:"0 0 8px rgba(0,229,255,0.5)" } }, "ROADMAP TRACKER"),
        ph && React.createElement("div", { style:{ fontSize:9, color:ph.color, letterSpacing:1, marginTop:2, opacity:0.8 } }, `${ph.icon} ${ph.months} · ${ph.title}`)
      ),
      // Writeup warning
      ctx.writeupMissed && React.createElement("div", { onClick:()=>setScreen("writeups"), style:{
        background:`rgba(255,71,87,0.1)`,
        border:`1px solid rgba(255,71,87,0.4)`,
        borderRadius:7, padding:"4px 10px",
        fontSize:10, color:C.red, cursor:"pointer",
        boxShadow:`0 0 12px rgba(255,71,87,0.15)`
      } }, "⚠ W-up"),
      // Logout
      React.createElement("div", { onClick:logout, style:{
        fontSize:10, color:C.sub, cursor:"pointer",
        padding:"5px 9px",
        border:`1px solid ${C.border}`,
        borderRadius:7,
        transition:"border-color 0.15s"
      } }, "↩")
    )
  );
}

// ═══════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════
function BottomNav({ screen, setScreen, writeupMissed }) {
  const tabs = [
    {id:"home",    icon:"⬡", label:"Home"},
    {id:"planner", icon:"◫", label:"Plan"},
    {id:"checkin", icon:"◎", label:"Today"},
    {id:"writeups",icon:"◈", label:"W-ups"},
    {id:"progress",icon:"▦", label:"Stats"},
  ];
  return React.createElement("nav", { style:{
    position:"fixed", bottom:0, left:0, right:0, zIndex:50,
    background:"rgba(3,7,18,0.95)",
    backdropFilter:"blur(24px)",
    WebkitBackdropFilter:"blur(24px)",
    borderTop:`1px solid rgba(0,229,255,0.08)`,
    boxShadow:"0 -8px 40px rgba(0,0,0,0.6)"
  } },
    React.createElement("div", { style:{ maxWidth:520, margin:"0 auto", display:"flex", justifyContent:"space-around", padding:"8px 0 20px" } },
      tabs.map(t => {
        const active = screen===t.id;
        const badge  = t.id==="writeups" && writeupMissed;
        return React.createElement("button", { key:t.id, onClick:()=>setScreen(t.id), style:{
          background:"none", border:"none", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          color:active?C.cyan:C.muted,
          padding:"4px 12px",
          position:"relative",
          fontFamily:FONT,
          transition:"color 0.2s"
        } },
          React.createElement("span", { style:{
            fontSize:18, lineHeight:1,
            filter:active?`drop-shadow(0 0 7px ${C.cyan})`:"none",
            transition:"filter 0.2s"
          } }, t.icon),
          React.createElement("span", { style:{ fontSize:8, letterSpacing:1, transition:"color 0.2s" } }, t.label),
          active && React.createElement("div", { style:{
            width:18, height:2,
            background:`linear-gradient(90deg,transparent,${C.cyan},transparent)`,
            borderRadius:1, marginTop:2,
            boxShadow:`0 0 8px ${C.cyan}`
          } }),
          badge && React.createElement("div", { style:{
            position:"absolute", top:0, right:8,
            width:7, height:7, borderRadius:"50%",
            background:C.red,
            border:`1.5px solid ${C.bg}`,
            boxShadow:`0 0 6px ${C.red}`
          } })
        );
      })
    )
  );
}

// ═══════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════
function HomeScreen({ ctx }) {
  const today      = todayKey();
  const ph         = PHASES.find(p=>p.id===ctx.phase);
  const days7      = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const todayTasks = ctx.weekPlan[today]||[];
  const doneCnt    = todayTasks.filter(t=>t.done).length;
  const weekTasks  = days7.flatMap(d=>ctx.weekPlan[d]||[]);
  const weekDone   = weekTasks.filter(t=>t.done).length;
  const todayWU    = ctx.todayWriteups.length;

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .3s ease" } },

    // Phase banner
    ph && React.createElement("div", { style:{
      background:`linear-gradient(135deg, ${ph.color}10 0%, ${C.surface2} 100%)`,
      border:`1px solid ${ph.color}30`,
      borderLeft:`3px solid ${ph.color}`,
      borderRadius:12, padding:"14px 16px", marginBottom:14,
      display:"flex", gap:14, alignItems:"center",
      boxShadow:`0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${ph.color}10`
    } },
      React.createElement("div", { style:{
        width:42, height:42, borderRadius:10,
        background:`${ph.color}15`,
        border:`1px solid ${ph.color}44`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20, color:ph.color, flexShrink:0,
        filter:`drop-shadow(0 0 6px ${ph.color}66)`
      } }, ph.icon),
      React.createElement("div", { style:{ flex:1 } },
        React.createElement("div", { style:{ fontSize:9, color:ph.color, letterSpacing:2, opacity:0.85 } }, `${ph.months} · ${ph.earn}`),
        React.createElement("div", { style:{ fontSize:14, fontWeight:700, color:C.text, marginTop:3 } }, ph.title),
        React.createElement("div", { style:{ fontSize:10, color:C.sub, marginTop:2 } }, ph.focus)
      ),
      React.createElement("button", { onClick:()=>ctx.setScreen("setup"), style:{
        background:"transparent",
        border:`1px solid ${C.border}`,
        color:C.sub, borderRadius:6,
        padding:"4px 9px", fontSize:9,
        cursor:"pointer", fontFamily:FONT,
        transition:"border-color 0.15s"
      } }, "Change")
    ),

    // Stats row
    React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 } },
      React.createElement(QStat, { label:"আজ",    value:`${doneCnt}/${todayTasks.length}`, color:doneCnt===todayTasks.length&&todayTasks.length>0?C.green:C.cyan, sub:"tasks" }),
      React.createElement(QStat, { label:"সপ্তাহ", value:`${weekDone}/${weekTasks.length}`, color:C.purple, sub:"tasks" }),
      React.createElement(QStat, { label:"W-ups",  value:`${todayWU}/2`, color:todayWU>=2?C.green:C.red, sub:"আজকের" })
    ),

    // Write-up alert
    ctx.writeupMissed && React.createElement("div", { onClick:()=>ctx.setScreen("writeups"), style:{
      background:`rgba(255,71,87,0.06)`,
      border:`1px solid rgba(255,71,87,0.3)`,
      borderLeft:`3px solid ${C.red}`,
      borderRadius:10, padding:"12px 14px", marginBottom:14, cursor:"pointer",
    } },
      React.createElement("div", { style:{ fontSize:11, color:C.red, fontWeight:700 } }, "⚠ আজকের Write-up বাকি!"),
      React.createElement("div", { style:{ fontSize:11, color:C.sub, marginTop:3 } }, `আজ ${todayWU}টা পড়েছো · আরো ${2-todayWU}টা বাকি। Tap করো →`)
    ),

    // Today tasks
    React.createElement(Panel, { label:"আজকের Tasks" },
      todayTasks.length===0
        ? React.createElement(EmptyMsg, { msg:"আজকের কোনো task নেই।", cta:"Plan করো →", onCta:()=>ctx.setScreen("planner") })
        : React.createElement(React.Fragment, null,
            todayTasks.slice(0,4).map((t,i) =>
              React.createElement("div", { key:t.id, style:{
                display:"flex", gap:10, alignItems:"center",
                padding:"8px 0",
                borderBottom:`1px solid ${C.dim}`,
                animation:`slideIn 0.2s ease ${i*40}ms both`
              } },
                React.createElement("div", { style:{
                  width:7, height:7, borderRadius:"50%",
                  background:t.done?C.green:t.missed?C.red:C.muted,
                  flexShrink:0,
                  boxShadow:t.done?`0 0 6px ${C.green}`:"none"
                } }),
                React.createElement("div", { style:{ flex:1, fontSize:12, color:t.done?C.sub:C.text, textDecoration:t.done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, t.text),
                React.createElement("div", { style:{ fontSize:10, color:C.muted } }, `${t.hours}h`)
              )
            ),
            React.createElement("button", { onClick:()=>ctx.setScreen("checkin"), style:ghostBtn(C.cyan) }, "Check-in করো →")
          )
    ),

    // Phase suggestions
    ph && React.createElement(Panel, { label:`Phase ${ph.num} · Suggested` },
      ph.tasks.slice(0,4).map((t,i) =>
        React.createElement("div", { key:i, style:{ fontSize:11, color:C.sub, padding:"6px 0", borderBottom:`1px solid ${C.dim}`, display:"flex", gap:8, alignItems:"flex-start" } },
          React.createElement("span", { style:{ color:ph.color, flexShrink:0, marginTop:1 } }, "›"), t
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
    PHASES.map((ph, i) => {
      const active = ctx.phase===ph.id;
      return React.createElement("div", { key:ph.id, className:"tap",
        onClick:()=>{ ctx.savePhase(ph.id); ctx.flash("Phase updated!"); ctx.setScreen("home"); },
        style:{
          background: active
            ? `linear-gradient(135deg, ${ph.color}14 0%, ${C.surface2} 100%)`
            : C.surface,
          border:`1px solid ${active?ph.color+"55":C.border}`,
          borderLeft:`${active?"3px":"1px"} solid ${active?ph.color:C.border}`,
          borderRadius:12, padding:"14px 16px", marginBottom:10,
          display:"flex", alignItems:"center", gap:13, cursor:"pointer",
          boxShadow:active?`0 4px 20px ${ph.color}15, 0 0 0 1px ${ph.color}10`:"none",
          transition:"all 0.2s",
          animation:`slideIn 0.2s ease ${i*50}ms both`
        }
      },
        React.createElement("div", { style:{
          width:38, height:38, borderRadius:9,
          background:`${ph.color}15`,
          border:`1px solid ${ph.color}${active?"66":"33"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:19, color:ph.color, flexShrink:0,
          filter:active?`drop-shadow(0 0 6px ${ph.color}88)`:"none",
          transition:"filter 0.2s"
        } }, ph.icon),
        React.createElement("div", { style:{ flex:1, minWidth:0 } },
          React.createElement("div", { style:{ fontSize:9, color:ph.color, letterSpacing:2, opacity:0.85 } }, `${ph.months} · ${ph.split}`),
          React.createElement("div", { style:{ fontSize:13, fontWeight:600, color:C.text, marginTop:2 } }, ph.title),
          React.createElement("div", { style:{ fontSize:10, color:C.sub, marginTop:1 } }, ph.focus)
        ),
        active && React.createElement("div", { style:{ color:ph.color, fontSize:16, filter:`drop-shadow(0 0 5px ${ph.color})` } }, "✓")
      );
    })
  );
}

// ═══════════════════════════════════════════
// PLANNER SCREEN
// ═══════════════════════════════════════════
function PlannerScreen({ ctx }) {
  const today   = todayKey();
  const days    = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const [selDay,  setSelDay ] = React.useState(today);
  const [newText, setNewText] = React.useState("");
  const [newHrs,  setNewHrs ] = React.useState("1");
  const [showSug, setShowSug] = React.useState(false);
  const [saving,  setSaving ] = React.useState(false);
  const ph    = PHASES.find(p=>p.id===ctx.phase);
  const tasks = ctx.weekPlan[selDay]||[];
  const totalHrs = tasks.reduce((a,t)=>a+t.hours,0);

  const add = async () => {
    if (!newText.trim()) return ctx.flash("Task লিখো","err");
    setSaving(true);
    await ctx.addTask(selDay, newText.trim(), parseFloat(newHrs)||1);
    setNewText(""); setNewHrs("1");
    setSaving(false);
  };

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, "Weekly Planner"),

    // Day pills
    React.createElement("div", { style:{ display:"flex", gap:5, marginBottom:14, overflowX:"auto", paddingBottom:4 } },
      days.map(d => {
        const cnt   = (ctx.weekPlan[d]||[]).length;
        const isSel = d===selDay;
        const isTdy = d===today;
        return React.createElement("button", { key:d, onClick:()=>setSelDay(d), style:{
          flexShrink:0,
          background:isSel?`linear-gradient(135deg,${C.cyan}18,${C.purple}10)`:C.surface,
          border:`1px solid ${isSel?C.cyan:isTdy?C.purple+"66":C.border}`,
          borderRadius:9, padding:"8px 10px", cursor:"pointer",
          textAlign:"center", minWidth:52, fontFamily:FONT,
          boxShadow:isSel?`0 0 14px rgba(0,229,255,0.15)`:"none",
          transition:"all 0.15s"
        } },
          React.createElement("div", { style:{ fontSize:9, color:isSel?C.cyan:C.muted } }, dayName(d)),
          React.createElement("div", { style:{ fontSize:13, fontWeight:700, color:isSel?C.cyan:C.text, marginTop:2 } }, fmtDate(d).split(" ")[0]),
          cnt>0 && React.createElement("div", { style:{ fontSize:9, color:isSel?C.cyan:C.muted, marginTop:2 } }, `${cnt}t`)
        );
      })
    ),

    // Add task card
    React.createElement("div", { style:{
      background:`linear-gradient(135deg,${C.surface} 0%,${C.surface2} 100%)`,
      border:`1px solid ${C.borderHi}`,
      borderRadius:12, padding:"14px 16px", marginBottom:12,
      boxShadow:"0 4px 20px rgba(0,0,0,0.35)"
    } },
      React.createElement("div", { style:{ fontSize:9, color:C.cyan, letterSpacing:2, marginBottom:10, display:"flex", alignItems:"center", gap:6 } },
        React.createElement("div", { style:{ width:2, height:10, background:C.cyan, borderRadius:1 } }),
        `NEW TASK · ${dayName(selDay)} ${fmtDate(selDay)}`
      ),
      React.createElement("input", { placeholder:"Task লিখো…", style:{ ...inp, marginBottom:8 }, value:newText, onChange:e=>setNewText(e.target.value), onKeyDown:e=>e.key==="Enter"&&add() }),
      React.createElement("div", { style:{ display:"flex", gap:8, alignItems:"center" } },
        React.createElement("span", { style:{ fontSize:10, color:C.sub, whiteSpace:"nowrap" } }, "ঘণ্টা:"),
        React.createElement("input", { type:"number", min:"0.5", max:"12", step:"0.5", style:{ ...inp, width:70 }, value:newHrs, onChange:e=>setNewHrs(e.target.value) }),
        React.createElement("button", { onClick:add, disabled:saving, style:{
          flex:1, background:saving?C.surface2:`rgba(0,229,255,0.1)`,
          border:`1px solid ${saving?C.border:C.cyan}`,
          color:saving?C.muted:C.cyan,
          borderRadius:8, padding:"9px", fontSize:11,
          cursor:saving?"default":"pointer", fontFamily:FONT,
          transition:"all 0.15s",
          boxShadow:saving?"none":`0 0 12px rgba(0,229,255,0.1)`
        } }, saving?"...":"+ Add"),
        ph && React.createElement("button", { onClick:()=>setShowSug(s=>!s), style:{
          background:`${ph.color}14`,
          border:`1px solid ${ph.color}55`,
          color:ph.color, borderRadius:8,
          padding:"9px 12px", fontSize:11,
          cursor:"pointer", fontFamily:FONT
        } }, "Suggest")
      )
    ),

    // Suggestions
    showSug && ph && React.createElement(Panel, { label:`Phase ${ph.num} Tasks`, color:ph.color },
      ph.tasks.map((t,i) =>
        React.createElement("div", { key:i, className:"tap",
          onClick:async()=>{ await ctx.addTask(selDay,t,1); setShowSug(false); },
          style:{ fontSize:11, color:C.sub, padding:"8px 0", borderBottom:`1px solid ${C.dim}`, cursor:"pointer", display:"flex", gap:8, alignItems:"flex-start" }
        },
          React.createElement("span", { style:{ color:ph.color, flexShrink:0 } }, "+"), t
        )
      )
    ),

    // Tasks list
    React.createElement(Panel, { label:`${dayName(selDay)} এর Tasks (${tasks.length})` },
      tasks.length===0
        ? React.createElement(EmptyMsg, { msg:"এই দিনে কোনো task নেই।" })
        : React.createElement(React.Fragment, null,
            tasks.map((t,i) =>
              React.createElement("div", { key:t.id, style:{
                display:"flex", gap:10, alignItems:"center",
                padding:"9px 0", borderBottom:`1px solid ${C.dim}`,
                animation:`slideIn 0.2s ease ${i*35}ms both`
              } },
                React.createElement("div", { style:{ flex:1, minWidth:0 } },
                  React.createElement("div", { style:{ fontSize:12, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, t.text),
                  React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:2 } }, `${t.hours} ঘণ্টা`)
                ),
                React.createElement("button", { onClick:()=>ctx.deleteTask(selDay,t.id), style:{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:14, padding:"4px 8px", transition:"color 0.15s" } }, "✕")
              )
            ),
            React.createElement("div", { style:{ fontSize:10, marginTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" } },
              React.createElement("span", { style:{ color:C.sub } }, `মোট: ${totalHrs} ঘণ্টা`),
              React.createElement("span", { style:{ color:totalHrs>=6?C.green:C.orange, fontWeight:700 } },
                totalHrs>=6 ? "✓ Target met" : `${6-totalHrs}h আরো দরকার`
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
  const today     = todayKey();
  const tasks     = ctx.weekPlan[today]||[];
  const doneCnt   = tasks.filter(t=>t.done).length;
  const missedCnt = tasks.filter(t=>t.missed).length;
  const totalHrs  = tasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const pct = tasks.length>0 ? Math.round((doneCnt/tasks.length)*100) : 0;
  const ringColor = pct===100 ? C.green : pct>50 ? C.cyan : C.orange;

  const toggle = async (t, field) => {
    const fields = field==="done"
      ? { done:!t.done, missed: !t.done ? false : t.missed }
      : { missed:!t.missed };
    await ctx.updateTask(today, t.id, fields);
  };

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, `আজকের Check-in · ${fmtDate(today)}`),

    // Progress ring card
    React.createElement("div", { style:{
      background:`linear-gradient(135deg,${C.surface} 0%,${C.surface2} 100%)`,
      border:`1px solid ${pct===100?C.green+"44":C.borderHi}`,
      borderRadius:14, padding:"20px 18px", marginBottom:14,
      display:"flex", gap:18, alignItems:"center",
      boxShadow:pct===100?`0 0 30px rgba(0,255,136,0.12), 0 4px 20px rgba(0,0,0,0.4)`:"0 4px 20px rgba(0,0,0,0.4)"
    } },
      // Ring
      React.createElement("div", { style:{ position:"relative", width:70, height:70, flexShrink:0 } },
        React.createElement("svg", { width:"70", height:"70", viewBox:"0 0 70 70" },
          React.createElement("defs", null,
            React.createElement("filter", { id:"glow" },
              React.createElement("feGaussianBlur", { stdDeviation:"2.5", result:"coloredBlur" }),
              React.createElement("feMerge", null,
                React.createElement("feMergeNode", { in:"coloredBlur" }),
                React.createElement("feMergeNode", { in:"SourceGraphic" })
              )
            )
          ),
          React.createElement("circle", { cx:"35", cy:"35", r:"28", fill:"none", stroke:C.dim, strokeWidth:"6" }),
          React.createElement("circle", { cx:"35", cy:"35", r:"28", fill:"none",
            stroke:ringColor, strokeWidth:"6",
            strokeDasharray:`${2*Math.PI*28}`,
            strokeDashoffset:`${2*Math.PI*28*(1-pct/100)}`,
            strokeLinecap:"round",
            transform:"rotate(-90 35 35)",
            filter:"url(#glow)",
            style:{ transition:"stroke-dashoffset .7s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease" }
          })
        ),
        React.createElement("div", { style:{
          position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, fontWeight:700, color:ringColor,
          textShadow:`0 0 10px ${ringColor}`
        } }, `${pct}%`)
      ),
      // Info
      React.createElement("div", { style:{ flex:1 } },
        React.createElement("div", { style:{ display:"flex", gap:14, marginBottom:6, flexWrap:"wrap" } },
          React.createElement("span", { style:{ fontSize:11, color:C.green } }, `✓ ${doneCnt} done`),
          React.createElement("span", { style:{ fontSize:11, color:C.red } }, `✕ ${missedCnt} missed`),
          React.createElement("span", { style:{ fontSize:11, color:C.muted } }, `${tasks.length-doneCnt-missedCnt} pending`)
        ),
        React.createElement("div", { style:{ fontSize:12, color:C.sub } }, `মোট: ${totalHrs} ঘণ্টা`),
        ctx.writeupMissed && React.createElement("div", { style:{ fontSize:11, color:C.red, marginTop:5, display:"flex", alignItems:"center", gap:4 } },
          React.createElement("span", null, "⚠"),
          `Write-up ${ctx.todayWriteups.length}/2 বাকি!`
        )
      )
    ),

    // Task list
    tasks.length===0
      ? React.createElement(EmptyMsg, { msg:"আজকের task নেই।", cta:"Plan করো →", onCta:()=>ctx.setScreen("planner") })
      : tasks.map((t,i) =>
          React.createElement("div", { key:t.id, style:{
            background:C.surface,
            border:`1px solid ${t.done?C.green+"44":t.missed?C.red+"44":C.border}`,
            borderLeft:`3px solid ${t.done?C.green:t.missed?C.red:C.border}`,
            borderRadius:10, padding:"12px 14px", marginBottom:8,
            display:"flex", gap:12, alignItems:"center",
            boxShadow:t.done?`0 0 16px rgba(0,255,136,0.08)`:t.missed?`0 0 16px rgba(255,71,87,0.08)`:"none",
            transition:"all 0.2s",
            animation:`slideIn 0.2s ease ${i*45}ms both`
          } },
            React.createElement("div", { style:{ flex:1, minWidth:0 } },
              React.createElement("div", { style:{ fontSize:13, color:t.done?C.sub:C.text, textDecoration:t.done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, t.text),
              React.createElement("div", { style:{ fontSize:10, color:C.muted, marginTop:3 } }, `${t.hours} ঘণ্টা`)
            ),
            React.createElement("div", { style:{ display:"flex", gap:7 } },
              React.createElement("button", { onClick:()=>toggle(t,"done"), style:{
                width:34, height:34, borderRadius:8,
                border:`1.5px solid ${t.done?C.green:C.border}`,
                background:t.done?`rgba(0,255,136,0.15)`:"transparent",
                color:t.done?C.green:C.muted,
                cursor:"pointer", fontSize:14,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:t.done?`0 0 10px rgba(0,255,136,0.25)`:"none",
                transition:"all 0.15s"
              } }, "✓"),
              React.createElement("button", { onClick:()=>toggle(t,"missed"), style:{
                width:34, height:34, borderRadius:8,
                border:`1.5px solid ${t.missed?C.red:C.border}`,
                background:t.missed?`rgba(255,71,87,0.15)`:"transparent",
                color:t.missed?C.red:C.muted,
                cursor:"pointer", fontSize:14,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:t.missed?`0 0 10px rgba(255,71,87,0.25)`:"none",
                transition:"all 0.15s"
              } }, "✕")
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
  const today     = todayKey();
  const todayCnt  = ctx.todayWriteups.length;
  const last7     = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const rangeStart = addDays(today,-3);
  const weekCnt   = ctx.writeups.filter(w=>w.date>=rangeStart&&w.date<=today).length;

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
    React.createElement(SHead, null, "Write-up Tracker"),

    // Quota banner
    React.createElement("div", { style:{
      background:todayCnt>=2?`rgba(0,255,136,0.07)`:` rgba(255,71,87,0.07)`,
      border:`1px solid ${todayCnt>=2?C.green+"44":C.red+"44"}`,
      borderLeft:`3px solid ${todayCnt>=2?C.green:C.red}`,
      borderRadius:12, padding:"14px 16px", marginBottom:14,
      display:"flex", gap:12, alignItems:"center",
      boxShadow:todayCnt>=2?`0 0 20px rgba(0,255,136,0.08)`:"none"
    } },
      React.createElement("div", { style:{ fontSize:26, filter:todayCnt>=2?`drop-shadow(0 0 8px ${C.green})`:"none" } }, todayCnt>=2?"✅":"⚠️"),
      React.createElement("div", { style:{ flex:1 } },
        React.createElement("div", { style:{ fontSize:13, fontWeight:700, color:todayCnt>=2?C.green:C.red } },
          todayCnt>=2 ? "আজকের quota পূরণ! 🔥" : `আজ ${todayCnt}/2 write-up`
        ),
        React.createElement("div", { style:{ fontSize:11, color:C.sub, marginTop:3 } },
          todayCnt<2 ? `আরো ${2-todayCnt}টা পড়তে হবে!` : "Roadmap অনুযায়ী চলছো।"
        )
      ),
      React.createElement("div", { style:{ textAlign:"right" } },
        React.createElement("div", { style:{ fontSize:18, fontWeight:700, color:C.cyan, textShadow:`0 0 8px ${C.cyan}88` } }, ctx.writeups.length),
        React.createElement("div", { style:{ fontSize:9, color:C.muted, marginTop:2 } }, "মোট")
      )
    ),

    // Stats
    React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 } },
      React.createElement(QStat, { label:"আজ",    value:`${todayCnt}/2`, color:todayCnt>=2?C.green:C.red,   sub:"write-ups" }),
      React.createElement(QStat, { label:"৭ দিন", value:weekCnt,          color:C.cyan,                       sub:"total" }),
      React.createElement(QStat, { label:"Streak", value:`${streak}d`,    color:streak>0?C.orange:C.muted,    sub:"2/day" })
    ),

    // 7-day heatmap
    React.createElement(Panel, { label:"৭ দিন" },
      React.createElement("div", { style:{ display:"flex", gap:5 } },
        last7.map(d => {
          const cnt = ctx.writeups.filter(w=>w.date===d).length;
          const bg  = cnt===0?C.dim:cnt>=2?C.green:C.orange;
          return React.createElement("div", { key:d, style:{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 } },
            React.createElement("div", { style:{
              width:"100%", aspectRatio:"1", borderRadius:6,
              background:cnt===0?C.dim:`${bg}22`,
              border:`1.5px solid ${d===today?C.cyan:cnt===0?C.border:`${bg}55`}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:700, color:cnt===0?C.muted:bg,
              boxShadow:cnt>0?`0 0 8px ${bg}22`:"none"
            } }, cnt||"·"),
            React.createElement("div", { style:{ fontSize:8, color:d===today?C.cyan:C.muted } }, dayName(d))
          );
        })
      )
    ),

    // Add toggle
    React.createElement("button", { onClick:()=>setShowForm(s=>!s), style:{
      width:"100%", marginBottom:12,
      background:showForm?C.surface:`linear-gradient(135deg,rgba(0,229,255,0.1) 0%,rgba(168,85,247,0.1) 100%)`,
      border:`1px solid ${showForm?C.border:C.cyan}`,
      color:showForm?C.sub:C.cyan,
      borderRadius:10, padding:"12px", fontSize:12,
      fontWeight:700, cursor:"pointer", fontFamily:FONT, letterSpacing:1,
      boxShadow:showForm?"none":`0 0 16px rgba(0,229,255,0.1)`,
      transition:"all 0.2s"
    } }, showForm?"✕ বন্ধ করো":"+ নতুন Write-up Log করো"),

    // Add form
    showForm && React.createElement(Panel, { label:"নতুন Write-up", color:C.cyan },
      React.createElement("input", { placeholder:"Write-up title / vulnerability type", style:{ ...inp, marginBottom:8 }, value:form.title, onChange:e=>set("title",e.target.value) }),
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 } },
        React.createElement("select", { style:inp, value:form.platform, onChange:e=>set("platform",e.target.value) }, platforms.map(p=>React.createElement("option",{key:p},p))),
        React.createElement("input", { placeholder:"URL (optional)", style:inp, value:form.url, onChange:e=>set("url",e.target.value) })
      ),
      React.createElement("textarea", { placeholder:"কী শিখলে?", style:{ ...inp, minHeight:64, resize:"vertical" }, value:form.notes, onChange:e=>set("notes",e.target.value) }),
      React.createElement("button", { onClick:add, disabled:saving, style:{
        width:"100%", marginTop:10,
        background:`linear-gradient(135deg,rgba(0,229,255,0.12) 0%,rgba(168,85,247,0.12) 100%)`,
        border:`1px solid ${C.cyan}`,
        color:C.cyan, borderRadius:9, padding:"12px",
        fontSize:12, fontWeight:700, cursor:saving?"default":"pointer",
        fontFamily:FONT, opacity:saving?.6:1,
        boxShadow:`0 0 16px rgba(0,229,255,0.12)`
      } }, saving?"Saving...":"✓ SAVE")
    ),

    // Search
    React.createElement("div", { style:{ position:"relative", marginBottom:10 } },
      React.createElement("span", { style:{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:13, pointerEvents:"none" } }, "⌕"),
      React.createElement("input", { placeholder:`${ctx.writeups.length}টা write-up এ search…`, style:{ ...inp, paddingLeft:32 }, value:search, onChange:e=>setSearch(e.target.value) })
    ),

    // Platform filter
    React.createElement("div", { style:{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 } },
      ["all",...platforms].map(p => {
        const active = filter===p;
        const col = platColor(p);
        return React.createElement("button", { key:p, onClick:()=>setFilter(p), style:{
          background:active?`${col==="Other"?C.cyan:col}18`:"transparent",
          border:`1px solid ${active?col==="Other"?C.cyan:col:C.border}`,
          color:active?col==="Other"?C.cyan:col:C.sub,
          borderRadius:6, padding:"4px 11px",
          fontSize:10, cursor:"pointer", fontFamily:FONT,
          transition:"all 0.15s"
        } }, p==="all"?`All (${ctx.writeups.length})`:p);
      })
    ),

    // Write-up list
    filtered.length===0
      ? React.createElement(EmptyMsg, { msg:search?`"${search}" পাওয়া যায়নি`:"এখনো কোনো write-up নেই।" })
      : filtered.map((w,i) => {
          const isOpen = expanded===w.id;
          const col = platColor(w.platform);
          return React.createElement("div", { key:w.id, style:{
            background:C.surface,
            border:`1px solid ${isOpen?`${col}55`:C.border}`,
            borderRadius:10, marginBottom:8, overflow:"hidden",
            transition:"border-color 0.15s, box-shadow 0.15s",
            boxShadow:isOpen?`0 0 20px ${col}15`:"none",
            animation:`fadeUp 0.18s ease ${Math.min(i,8)*20}ms both`
          } },
            React.createElement("div", { onClick:()=>setExpanded(isOpen?null:w.id), style:{ display:"flex", gap:10, padding:"11px 14px", alignItems:"center", cursor:"pointer" } },
              React.createElement("div", { style:{ width:3, height:36, borderRadius:2, flexShrink:0, background:col, boxShadow:`0 0 6px ${col}66` } }),
              React.createElement("div", { style:{ flex:1, minWidth:0 } },
                React.createElement("div", { style:{ fontSize:12, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, w.title),
                React.createElement("div", { style:{ display:"flex", gap:7, marginTop:3, alignItems:"center" } },
                  React.createElement("span", { style:{ fontSize:10, color:col, fontWeight:600 } }, w.platform),
                  React.createElement("span", { style:{ fontSize:9, color:C.muted } }, "·"),
                  React.createElement("span", { style:{ fontSize:10, color:C.sub } }, fmtDate(w.date)),
                  w.notes && React.createElement("span", { style:{ fontSize:9, color:C.muted } }, "· note ✎")
                )
              ),
              React.createElement("span", { style:{ color:C.muted, fontSize:11, transform:isOpen?"rotate(180deg)":"none", transition:"transform .2s", flexShrink:0 } }, "▾")
            ),
            isOpen && React.createElement("div", { style:{ padding:"0 14px 12px 30px", borderTop:`1px solid ${C.dim}`, animation:"fadeIn 0.15s ease" }, onClick:e=>e.stopPropagation() },
              w.url && React.createElement("a", { href:w.url, target:"_blank", rel:"noreferrer", style:{ display:"inline-block", marginTop:10, fontSize:11, color:C.purple, textDecoration:"none" } }, `↗ ${w.url.length>40?w.url.slice(0,40)+"…":w.url}`),
              w.notes && React.createElement("div", { style:{ fontSize:12, color:C.sub, marginTop:10, lineHeight:1.75, whiteSpace:"pre-wrap", borderLeft:`2px solid ${C.border}`, paddingLeft:10 } }, w.notes),
              React.createElement("button", { onClick:()=>ctx.deleteWriteup(w.id), style:{
                marginTop:12, background:"transparent",
                border:`1px solid rgba(255,71,87,0.35)`,
                color:C.red, borderRadius:6,
                padding:"5px 14px", fontSize:11,
                cursor:"pointer", fontFamily:FONT, transition:"border-color 0.15s"
              } }, "✕ Delete")
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
  const today      = todayKey();
  const days7      = Array.from({length:7},(_,i)=>addDays(today,i-3));
  const todayTasks = ctx.weekPlan[today]||[];
  const tDone      = todayTasks.filter(t=>t.done).length;
  const tMissed    = todayTasks.filter(t=>t.missed).length;
  const tHours     = todayTasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const tWU        = ctx.todayWriteups.length;
  const weekAllTasks = days7.flatMap(d=>(ctx.weekPlan[d]||[]).map(t=>({...t,date:d})));
  const wDone      = weekAllTasks.filter(t=>t.done).length;
  const wMissed    = weekAllTasks.filter(t=>t.missed).length;
  const wHours     = weekAllTasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const rangeStart = addDays(today,-3);
  const wWU        = ctx.writeups.filter(w=>w.date>=rangeStart&&w.date<=today).length;
  const monthStart = today.slice(0,7)+"-01";
  const mWU        = ctx.writeups.filter(w=>w.date>=monthStart&&w.date<=today).length;
  const tabs = [["today","আজ"],["week","সপ্তাহ"],["month","মাস"]];

  return React.createElement("div", { style:{ padding:"16px 16px 0", maxWidth:520, margin:"0 auto", animation:"fadeUp .25s ease" } },
    React.createElement(SHead, null, "Progress"),

    // Tab switcher
    React.createElement("div", { style:{
      display:"flex",
      background:C.surface,
      border:`1px solid ${C.border}`,
      borderRadius:10, padding:3, marginBottom:14,
      boxShadow:"0 2px 12px rgba(0,0,0,0.3)"
    } },
      tabs.map(([k,l]) => {
        const active = tab===k;
        return React.createElement("button", { key:k, onClick:()=>setTab(k), style:{
          flex:1,
          background:active?`linear-gradient(135deg,rgba(0,229,255,0.12) 0%,rgba(168,85,247,0.08) 100%)`:"transparent",
          border:`1px solid ${active?C.cyan:"transparent"}`,
          color:active?C.cyan:C.sub,
          borderRadius:7, padding:"9px",
          fontSize:11, cursor:"pointer", fontFamily:FONT,
          boxShadow:active?`0 0 12px rgba(0,229,255,0.12)`:"none",
          transition:"all 0.2s"
        } }, l);
      })
    ),

    // TODAY tab
    tab==="today" && React.createElement(React.Fragment, null,
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:7, marginBottom:14 } },
        React.createElement(QStat, { label:"Done",   value:tDone,          color:C.green,              sub:"tasks" }),
        React.createElement(QStat, { label:"Missed", value:tMissed,        color:C.red,                sub:"tasks" }),
        React.createElement(QStat, { label:"Hours",  value:tHours,         color:C.cyan,               sub:"worked" }),
        React.createElement(QStat, { label:"W-ups",  value:`${tWU}/2`,     color:tWU>=2?C.green:C.red, sub:"today" })
      ),
      todayTasks.length===0
        ? React.createElement(EmptyMsg, { msg:"আজকের task নেই।", cta:"Plan করো →", onCta:()=>ctx.setScreen("planner") })
        : React.createElement(Panel, { label:"আজকের Summary" },
            React.createElement(PBar, { done:tDone,  total:todayTasks.length, color:C.cyan,   label:"Tasks" }),
            React.createElement(PBar, { done:tHours, total:8,                 color:C.orange, label:"Hours (target 8h)" }),
            React.createElement(PBar, { done:tWU,    total:2,                 color:tWU>=2?C.green:C.red, label:"Write-ups (min 2)" })
          )
    ),

    // WEEK tab
    tab==="week" && React.createElement(React.Fragment, null,
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 } },
        React.createElement(QStat, { label:"Done",  value:wDone,  color:C.green,              sub:"tasks" }),
        React.createElement(QStat, { label:"Hours", value:wHours, color:C.cyan,               sub:"total" }),
        React.createElement(QStat, { label:"W-ups", value:wWU,    color:wWU>=7?C.green:C.orange, sub:"7 দিন" })
      ),
      React.createElement(Panel, { label:"দিনগুলো" },
        React.createElement("div", { style:{ display:"flex", gap:5 } },
          days7.map(d => {
            const dt   = ctx.weekPlan[d]||[];
            const done = dt.filter(t=>t.done).length;
            const tot  = dt.length;
            const pct  = tot>0?done/tot:0;
            const bg   = tot===0?C.dim:pct===1?C.green:pct>0.5?C.orange:C.red;
            return React.createElement("div", { key:d, style:{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 } },
              React.createElement("div", { style:{
                width:"100%", aspectRatio:"1", borderRadius:6,
                background:tot===0?C.dim:`${bg}20`,
                border:`1.5px solid ${d===today?C.cyan:tot===0?C.border:`${bg}55`}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:700, color:tot===0?C.muted:bg,
                boxShadow:tot>0?`0 0 8px ${bg}20`:"none"
              } }, tot===0?"·":`${done}/${tot}`),
              React.createElement("div", { style:{ fontSize:8, color:d===today?C.cyan:C.muted } }, dayName(d))
            );
          })
        )
      ),
      wMissed>0 && React.createElement(Panel, { label:`⚠ ${wMissed}টা Task Miss`, color:C.orange },
        weekAllTasks.filter(t=>t.missed).slice(0,5).map((t,i) =>
          React.createElement("div", { key:i, style:{ fontSize:11, color:C.red, padding:"4px 0", borderBottom:`1px solid ${C.dim}`, display:"flex", gap:8, alignItems:"center" } },
            React.createElement("span", { style:{ color:C.sub, fontSize:9, whiteSpace:"nowrap" } }, fmtDate(t.date)),
            React.createElement("span", null, "✕"), t.text
          )
        ),
        React.createElement("div", { style:{ fontSize:10, color:C.orange, marginTop:8 } }, "💡 এগুলো আগামী দিনে plan এ রাখো।")
      )
    ),

    // MONTH tab
    tab==="month" && React.createElement(React.Fragment, null,
      React.createElement("div", { style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 } },
        React.createElement(QStat, { label:"Write-ups", value:mWU, color:C.cyan, sub:"এই মাসে" }),
        React.createElement(QStat, { label:"Target", value:`${Math.floor(new Date(today.slice(0,4),today.slice(5,7),0).getDate()*6/7)*2}`, color:C.sub, sub:"2/day goal" })
      ),
      (() => {
        const ph = PHASES.find(p=>p.id===ctx.phase);
        return ph && React.createElement(Panel, { label:"Current Phase", color:ph.color },
          React.createElement("div", { style:{ fontSize:13, color:ph.color, fontWeight:700, marginBottom:10, display:"flex", alignItems:"center", gap:8 } },
            React.createElement("span", { style:{ filter:`drop-shadow(0 0 5px ${ph.color})` } }, ph.icon),
            ph.title
          ),
          ph.tasks.map((t,i) =>
            React.createElement("div", { key:i, style:{ fontSize:11, color:C.sub, padding:"4px 0", display:"flex", gap:7, alignItems:"flex-start" } },
              React.createElement("span", { style:{ color:ph.color, flexShrink:0 } }, "›"), t
            )
          ),
          React.createElement("div", { style:{
            marginTop:12, padding:"10px 12px",
            background:`${ph.color}0a`,
            border:`1px solid ${ph.color}30`,
            borderRadius:8, fontSize:10, color:ph.color
          } }, `Target: ${ph.earn} · ${ph.split}`)
        );
      })()
    )
  );
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
function Panel({ label, children, color }) {
  return React.createElement("div", { style:{
    background:`linear-gradient(145deg,${C.surface} 0%,${C.dim} 100%)`,
    border:`1px solid ${color?`${color}22`:C.border}`,
    borderRadius:12,
    padding:"14px 16px",
    marginBottom:12,
    boxShadow:"0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)"
  } },
    label && React.createElement("div", { style:{
      fontSize:9, color:color||C.muted,
      letterSpacing:3, marginBottom:12,
      display:"flex", alignItems:"center", gap:6
    } },
      React.createElement("div", { style:{ width:2, height:10, background:color||C.muted, borderRadius:1, opacity:0.7 } }),
      label.toUpperCase()
    ),
    children
  );
}

function SHead({ children }) {
  return React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:10, marginBottom:16 } },
    React.createElement("span", { style:{ fontSize:10, fontWeight:700, color:C.cyan, letterSpacing:3 } }, String(children).toUpperCase()),
    React.createElement("div", { style:{ flex:1, height:1, background:`linear-gradient(90deg,rgba(0,229,255,0.3),transparent)` } })
  );
}

function QStat({ label, value, color, sub }) {
  return React.createElement("div", { style:{
    background:`linear-gradient(145deg,${C.surface} 0%,${C.dim} 100%)`,
    border:`1px solid ${color}22`,
    borderTop:`2px solid ${color}66`,
    borderRadius:10, padding:"12px 8px", textAlign:"center",
    boxShadow:`0 4px 16px rgba(0,0,0,0.4)`
  } },
    React.createElement("div", { style:{ fontSize:8, color:C.sub, letterSpacing:2, marginBottom:6 } }, label.toUpperCase()),
    React.createElement("div", { style:{
      fontSize:20, fontWeight:700, color, lineHeight:1,
      textShadow:`0 0 10px ${color}55`
    } }, value),
    React.createElement("div", { style:{ fontSize:9, color:C.muted, marginTop:4 } }, sub)
  );
}

function PBar({ done, total, color, label }) {
  const pct = total>0 ? Math.min(100,Math.round((done/total)*100)) : 0;
  return React.createElement("div", { style:{ marginBottom:12 } },
    React.createElement("div", { style:{ display:"flex", justifyContent:"space-between", marginBottom:6 } },
      React.createElement("span", { style:{ fontSize:10, color:C.sub } }, label),
      React.createElement("span", { style:{ fontSize:10, color, fontWeight:700 } }, `${pct}%`)
    ),
    React.createElement("div", { style:{ height:4, background:C.dim, borderRadius:3, overflow:"hidden" } },
      React.createElement("div", { style:{
        width:`${pct}%`, height:"100%",
        background:`linear-gradient(90deg,${color}99,${color})`,
        borderRadius:3,
        transition:"width .8s cubic-bezier(0.4,0,0.2,1)",
        boxShadow:`0 0 8px ${color}66`
      } })
    )
  );
}

function EmptyMsg({ msg, cta, onCta }) {
  return React.createElement("div", { style:{ textAlign:"center", padding:"24px 0" } },
    React.createElement("div", { style:{ fontSize:26, marginBottom:10, color:C.muted, filter:"drop-shadow(0 0 6px rgba(0,229,255,0.1))" } }, "◎"),
    React.createElement("div", { style:{ fontSize:12, color:C.sub, marginBottom:12 } }, msg),
    cta && onCta && React.createElement("button", { onClick:onCta, style:{
      background:"transparent",
      border:`1px solid rgba(0,229,255,0.3)`,
      color:C.cyan, borderRadius:7,
      padding:"7px 18px", fontSize:11,
      cursor:"pointer", fontFamily:FONT,
      transition:"border-color 0.15s"
    } }, cta)
  );
}

function Toast({ msg, type }) {
  const color = type==="err" ? C.red : C.green;
  return React.createElement("div", { style:{
    position:"fixed", top:68, left:"50%",
    transform:"translateX(-50%)",
    background:C.surface2,
    border:`1px solid ${color}66`,
    borderLeft:`3px solid ${color}`,
    color, padding:"10px 20px",
    borderRadius:9, fontSize:12,
    zIndex:999, whiteSpace:"nowrap",
    boxShadow:`0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${color}22`,
    animation:"toastIn 0.25s ease"
  } }, msg);
}

// ═══════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
