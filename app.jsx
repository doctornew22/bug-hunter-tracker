// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const SUPABASE_URL  = "https://ttjqwsgyrmakbkgpnbxt.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anF3c2d5cm1ha2JrZ3BuYnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDc5NTUsImV4cCI6MjA5ODA4Mzk1NX0.hO3PUSdo8ZZOJYC4OhQhOgUpBwNvseYSxHW4aTE_JkI";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ═══════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════
const C = {
  bg:      "#0d1117",
  surface: "#161b22",
  card:    "#1c2128",
  border:  "#30363d",
  line:    "#21262d",
  cyan:    "#38bdf8",
  green:   "#34d399",
  red:     "#f87171",
  orange:  "#fb923c",
  purple:  "#a78bfa",
  text:    "#e6edf3",
  sub:     "#7d8590",
};
const F = `'JetBrains Mono','Fira Code',monospace`;

// ═══════════════════════════════════════════
// ROADMAP DATA
// ═══════════════════════════════════════════
const PHASES = [
  { id:"p1", n:"01", months:"Month 1–2",  title:"Web Fundamentals",      color:C.cyan,   earn:"$0",       split:"100% Learn", icon:"◈",
    tasks:["HTTP Methods, Headers, Status Codes","Same-Origin Policy & Cookies","PortSwigger Academy শুরু করো","DVWA / Juice Shop setup করো","TryHackMe Web Fundamentals","Web Hacking 101 বই","MDN Docs — JS basics"] },
  { id:"p2", n:"02", months:"Month 3–4",  title:"Access Control",        color:"#60a5fa", earn:"~$2k/mo", split:"20% Hunt",   icon:"◎",
    tasks:["OWASP — Broken Access Control","IDOR write-ups পড়ো Hacktivity তে","PortSwigger Access Control labs","Public program এ hunt করো","DVWA/bWAPP দিয়ে practice","সপ্তাহে ২–৩ রিপোর্ট সাবমিট করো"] },
  { id:"p3", n:"03", months:"Month 5–6",  title:"XSS · CSRF · SSRF",     color:C.orange, earn:"~$5k/mo", split:"40% Hunt",   icon:"◆",
    tasks:["Reflected, Stored, DOM XSS","CSRF token bypass","SSRF — internal network","PayloadsAllTheThings পড়ো","XSStrike / dalfox practice","HackTheBox Web path","মাসে ৭–১২ bug টার্গেট"] },
  { id:"p4", n:"04", months:"Month 6–8",  title:"Code Review + Advanced", color:C.purple, earn:"~$9k/mo", split:"80% Hunt",   icon:"◐",
    tasks:["PHP / Node.js code review","OAuth vulnerability patterns","GraphQL security","Business Logic bugs","Vulnerability chaining","Open source program hunt","Burp Suite advanced features"] },
  { id:"p5", n:"05", months:"Month 8–12", title:"Hardcore Hunting",       color:C.red,    earn:"$15k+/mo",split:"100% Hunt",  icon:"◉",
    tasks:["Private program এ invite নেও","নিজের specialty তে focus","Critical bug chain করো","Daily: Recon→Enum→Test→Report","Weekly technique review","Hacktivity থেকে শেখো","Live hacking event"] },
];

const FTYPES = [
  { id:"target", label:"Target", icon:"◎", color:C.cyan,   hint:"Facebook, Google…" },
  { id:"topic",  label:"Topic",  icon:"◈", color:C.orange, hint:"XSS, IDOR, SSRF…"  },
];

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
const tod   = () => new Date().toISOString().split("T")[0];
const shift = (d,n) => { const x=new Date(d+"T00:00:00"); x.setDate(x.getDate()+n); return x.toISOString().split("T")[0]; };
const fmt   = (d) => new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short"});
const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const dayOf = (d) => DAYS[new Date(d+"T00:00:00").getDay()];
const week7 = () => Array.from({length:7},(_,i)=>shift(tod(),i-3));

// ═══════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════
const inp = { background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, padding:"10px 13px", fontSize:12, width:"100%", outline:"none", lineHeight:1.5, fontFamily:F };
const gBtn = (color) => ({ background:"transparent", border:`1px solid ${color}44`, color, borderRadius:8, padding:"10px 16px", fontSize:11, cursor:"pointer", fontFamily:F, marginTop:12, width:"100%", letterSpacing:1, display:"block", transition:"border-color .15s" });

// ═══════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════
function App() {
  const [session,  setSession ] = React.useState(null);
  const [screen,   setScreen  ] = React.useState("home");
  const [phase,    setPhase   ] = React.useState("p1");
  const [plan,     setPlan    ] = React.useState({});
  const [writeups, setWriteups] = React.useState([]);
  const [folders,  setFolders ] = React.useState([]);
  const [notes,    setNotes   ] = React.useState([]);
  const [loading,  setLoading ] = React.useState(true);
  const [toast,    setToast   ] = React.useState(null);
  const [authMode, setAuthMode] = React.useState("login");

  React.useEffect(()=>{
    db.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      if(session) loadAll(session.user.id);
      else setLoading(false);
    });
    const {data:{subscription}} = db.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(session) loadAll(session.user.id);
      else { setLoading(false); resetState(); }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const resetState = () => { setPlan({}); setWriteups([]); setFolders([]); setNotes([]); };

  const loadAll = async(uid) => {
    setLoading(true);
    try {
      const {data:s} = await db.from("user_settings").select("*").eq("user_id",uid).single();
      if(s) setPhase(s.phase||"p1");

      const from=shift(tod(),-30), to=shift(tod(),7);
      const {data:tasks} = await db.from("week_tasks").select("*").eq("user_id",uid).gte("date",from).lte("date",to);
      if(tasks){
        const p={};
        tasks.forEach(t=>{ if(!p[t.date])p[t.date]=[]; p[t.date].push({id:t.id,text:t.text,hours:t.hours,done:t.done,missed:t.missed}); });
        setPlan(p);
      }

      const wfrom=shift(tod(),-60);
      const {data:wups} = await db.from("writeups").select("*").eq("user_id",uid).gte("date",wfrom).order("created_at",{ascending:false});
      if(wups) setWriteups(wups.map(w=>({id:w.id,date:w.date,title:w.title,platform:w.platform,url:w.url,notes:w.notes})));

      const {data:fols} = await db.from("folders").select("*").eq("user_id",uid).order("created_at",{ascending:false});
      if(fols) setFolders(fols.map(f=>({id:f.id,name:f.name,type:f.type,pinned:f.pinned})));

      const {data:nts} = await db.from("notes").select("*").eq("user_id",uid).order("updated_at",{ascending:false});
      if(nts) setNotes(nts.map(n=>({id:n.id,folderId:n.folder_id,title:n.title,content:n.content,tags:n.tags||[],pinned:n.pinned,updatedAt:n.updated_at?.split("T")[0]})));
    } catch(e){ flash("Load error","err"); }
    setLoading(false);
  };

  const flash = (msg,err) => { setToast({msg,err}); setTimeout(()=>setToast(null),2600); };
  const uid = () => session?.user?.id;

  const addTask    = async(date,text,hours) => {
    const {data}=await db.from("week_tasks").insert({user_id:uid(),date,text,hours,done:false,missed:false}).select().single();
    if(data) setPlan(p=>({...p,[date]:[...(p[date]||[]),{id:data.id,text,hours,done:false,missed:false}]}));
    flash("Task added ✓");
  };
  const updateTask = async(date,id,fields) => {
    await db.from("week_tasks").update(fields).eq("id",id);
    setPlan(p=>({...p,[date]:(p[date]||[]).map(t=>t.id===id?{...t,...fields}:t)}));
  };
  const deleteTask = async(date,id) => {
    await db.from("week_tasks").delete().eq("id",id);
    setPlan(p=>({...p,[date]:(p[date]||[]).filter(t=>t.id!==id)}));
  };
  const savePhase  = async(p) => { setPhase(p); await db.from("user_settings").upsert({user_id:uid(),phase:p}); };

  const addWriteup    = async(wu) => {
    const {data}=await db.from("writeups").insert({user_id:uid(),...wu}).select().single();
    if(data){ setWriteups(p=>[{id:data.id,...wu},...p]); flash(writeups.filter(w=>w.date===tod()).length>=1?"🔥 Quota done!":"Saved! 1 more to go."); }
  };
  const deleteWriteup = async(id) => { await db.from("writeups").delete().eq("id",id); setWriteups(p=>p.filter(w=>w.id!==id)); flash("Deleted"); };
  const updateWriteup = async(id,fields) => {
    await db.from("writeups").update(fields).eq("id",id);
    setWriteups(p=>p.map(w=>w.id===id?{...w,...fields}:w)); flash("Updated ✓");
  };

  const addFolder    = async(name,type) => {
    const {data}=await db.from("folders").insert({user_id:uid(),name,type,pinned:false}).select().single();
    if(data){ setFolders(p=>[{id:data.id,name,type,pinned:false},...p]); flash("Folder created"); }
  };
  const deleteFolder = async(id) => {
    await db.from("folders").delete().eq("id",id);
    setFolders(p=>p.filter(f=>f.id!==id)); setNotes(p=>p.filter(n=>n.folderId!==id)); flash("Deleted");
  };

  const addNote    = async(folderId,title,content,tags) => {
    const {data}=await db.from("notes").insert({user_id:uid(),folder_id:folderId,title,content,tags,pinned:false}).select().single();
    if(data){ const n={id:data.id,folderId,title,content,tags,pinned:false,updatedAt:data.updated_at?.split("T")[0]||tod()}; setNotes(p=>[n,...p]); flash("Note saved"); return n; }
    return null;
  };
  const updateNote = async(id,fields) => {
    const db2={}; if(fields.title!==undefined)db2.title=fields.title; if(fields.content!==undefined)db2.content=fields.content;
    if(fields.tags!==undefined)db2.tags=fields.tags; if(fields.pinned!==undefined)db2.pinned=fields.pinned;
    db2.updated_at=new Date().toISOString();
    await db.from("notes").update(db2).eq("id",id);
    setNotes(p=>p.map(n=>n.id===id?{...n,...fields,updatedAt:tod()}:n)); flash("Updated");
  };
  const deleteNote = async(id) => { await db.from("notes").delete().eq("id",id); setNotes(p=>p.filter(n=>n.id!==id)); flash("Deleted"); };

  const todayWU  = writeups.filter(w=>w.date===tod());
  const wuMissed = todayWU.length<2;
  const ph       = PHASES.find(p=>p.id===phase)||PHASES[0];

  if(loading) return React.createElement(Splash);
  if(!session) return React.createElement(AuthScreen,{authMode,setAuthMode,flash});

  const ctx={session,phase,savePhase,plan,addTask,updateTask,deleteTask,writeups,addWriteup,updateWriteup,deleteWriteup,folders,addFolder,deleteFolder,notes,addNote,updateNote,deleteNote,todayWU,wuMissed,ph,flash,setScreen};

  return React.createElement("div",{style:{minHeight:"100vh",background:"transparent",color:C.text,fontFamily:F,paddingBottom:72}},
    React.createElement("style",null,`
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      input,textarea,select{font-family:${F}}
      @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
      .tap{transition:opacity .1s,transform .1s}.tap:active{opacity:.7;transform:scale(.98)}
      .row{transition:background .12s}.row:active{background:${C.card}!important}
    `),
    React.createElement(TopBar,{ctx,screen,setScreen}),
    React.createElement("main",{style:{maxWidth:480,margin:"0 auto",padding:"20px 16px 0"}},
      screen==="home"    && React.createElement(HomeScreen,  {ctx}),
      screen==="phase"   && React.createElement(PhaseSet,    {ctx}),
      screen==="plan"    && React.createElement(Planner,     {ctx}),
      screen==="checkin" && React.createElement(Checkin,     {ctx}),
      screen==="wups"    && React.createElement(Writeups,    {ctx}),
      screen==="notes"   && React.createElement(NotesScreen, {ctx}),
      screen==="stats"   && React.createElement(StatsScreen, {ctx}),
    ),
    React.createElement(NavBar,{screen,setScreen,wuMissed}),
    toast && React.createElement(Toast,toast)
  );
}

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
function AuthScreen({authMode,setAuthMode,flash}){
  const [email,setEmail]=React.useState("");
  const [pass,setPass]=React.useState("");
  const [busy,setBusy]=React.useState(false);
  const [localToast,setLocalToast]=React.useState(null);

  const localFlash=(msg,err)=>{ setLocalToast({msg,err}); setTimeout(()=>setLocalToast(null),2600); };

  const handle=async()=>{
    if(!email||!pass) return localFlash("Email ও password দাও","err");
    setBusy(true);
    if(authMode==="signup"){
      const {error}=await db.auth.signUp({email,password:pass});
      if(error) localFlash(error.message,"err"); else localFlash("Account হয়েছে! Login করো।");
    } else {
      const {error}=await db.auth.signInWithPassword({email,password:pass});
      if(error) localFlash("Email বা password ভুল","err");
    }
    setBusy(false);
  };

  return React.createElement("div",{style:{minHeight:"100vh",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:F}},
    React.createElement("style",null,`@keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`),
    React.createElement("div",{style:{marginBottom:10,position:"relative"}},
      React.createElement("div",{style:{fontSize:44,color:C.cyan,lineHeight:1,filter:`drop-shadow(0 0 14px ${C.cyan}66)`}},"◉")
    ),
    React.createElement("div",{style:{fontSize:15,fontWeight:700,color:C.text,letterSpacing:3,marginBottom:4}},"BUG HUNTER"),
    React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:5,marginBottom:40}},"ROADMAP TRACKER"),

    React.createElement("div",{style:{width:"100%",maxWidth:380,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"28px 24px",animation:"up .3s ease",boxShadow:"0 8px 40px rgba(0,0,0,0.4)"}},
      React.createElement("div",{style:{fontSize:9,color:C.cyan,letterSpacing:3,marginBottom:20,display:"flex",alignItems:"center",gap:8}},
        React.createElement("div",{style:{width:2,height:12,background:C.cyan,borderRadius:1}}),
        authMode==="login"?"LOGIN":"CREATE ACCOUNT"
      ),
      React.createElement("input",{placeholder:"Email",type:"email",value:email,onChange:e=>setEmail(e.target.value),style:{...inp,marginBottom:10}}),
      React.createElement("input",{placeholder:"Password (min 6)",type:"password",value:pass,onChange:e=>setPass(e.target.value),onKeyDown:e=>e.key==="Enter"&&handle(),style:{...inp,marginBottom:20}}),
      React.createElement("button",{onClick:handle,disabled:busy,style:{width:"100%",background:busy?C.card:`${C.cyan}18`,border:`1px solid ${busy?C.border:C.cyan}`,color:busy?C.sub:C.cyan,borderRadius:9,padding:"13px",fontSize:11,fontWeight:700,cursor:busy?"default":"pointer",fontFamily:F,letterSpacing:2,opacity:1,transition:"all .15s"}},busy?"...":authMode==="login"?"LOGIN →":"SIGN UP →"),
      React.createElement("div",{style:{textAlign:"center",marginTop:18,fontSize:10,color:C.sub}},
        authMode==="login"?"Account নেই? ":"Already আছো? ",
        React.createElement("span",{onClick:()=>setAuthMode(authMode==="login"?"signup":"login"),style:{color:C.cyan,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}},authMode==="login"?"Sign up":"Login")
      )
    ),
    localToast && React.createElement(Toast,localToast)
  );
}

// ═══════════════════════════════════════════
// SPLASH
// ═══════════════════════════════════════════
function Splash(){
  return React.createElement("div",{style:{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"transparent",fontFamily:F,gap:14}},
    React.createElement("div",{style:{fontSize:36,color:C.cyan,filter:`drop-shadow(0 0 12px ${C.cyan}88)`}},"◉"),
    React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:5,animation:"blink 1.2s infinite"}},"LOADING")
  );
}

// ═══════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════
function TopBar({ctx,screen,setScreen}){
  return React.createElement("header",{style:{position:"sticky",top:0,zIndex:40,background:"rgba(13,17,23,.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`}},
    React.createElement("div",{style:{maxWidth:480,margin:"0 auto",padding:"12px 16px",display:"flex",alignItems:"center",gap:11}},
      React.createElement("div",{style:{fontSize:20,color:C.cyan,lineHeight:1,filter:`drop-shadow(0 0 8px ${C.cyan}66)`}},"◉"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:11,fontWeight:700,color:C.text,letterSpacing:2}},"ROADMAP TRACKER"),
        React.createElement("div",{style:{fontSize:9,color:ctx.ph.color,marginTop:2,letterSpacing:1}},`${ctx.ph.n} · ${ctx.ph.title}`)
      ),
      ctx.wuMissed && React.createElement("div",{onClick:()=>setScreen("wups"),style:{fontSize:9,color:C.red,cursor:"pointer",border:`1px solid ${C.red}44`,borderRadius:6,padding:"4px 9px",animation:"blink 2s infinite",background:`${C.red}0a`}},"⚠ write-up"),
      React.createElement("div",{onClick:()=>db.auth.signOut(),style:{fontSize:9,color:C.sub,cursor:"pointer",border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",transition:"border-color .15s"}},"↩")
    )
  );
}

// ═══════════════════════════════════════════
// NAV BAR
// ═══════════════════════════════════════════
function NavBar({screen,setScreen,wuMissed}){
  const tabs=[
    {id:"home",   icon:"⬡", label:"Home" },
    {id:"plan",   icon:"◫", label:"Plan" },
    {id:"checkin",icon:"◎", label:"Today"},
    {id:"wups",   icon:"◈", label:"W-ups"},
    {id:"notes",  icon:"◇", label:"Notes"},
    {id:"stats",  icon:"▦", label:"Stats"},
  ];
  return React.createElement("nav",{style:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:40,background:"rgba(13,17,23,.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`1px solid ${C.border}`}},
    React.createElement("div",{style:{display:"flex",padding:"8px 0 16px"}},
      tabs.map(t=>{
        const on=screen===t.id, badge=t.id==="wups"&&wuMissed;
        return React.createElement("button",{key:t.id,onClick:()=>setScreen(t.id),style:{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:on?C.cyan:C.sub,fontFamily:F,position:"relative",padding:"3px 0",transition:"color .15s"}},
          React.createElement("span",{style:{fontSize:16,lineHeight:1,filter:on?`drop-shadow(0 0 6px ${C.cyan})`:"none",transition:"filter .15s"}},t.icon),
          React.createElement("span",{style:{fontSize:8,letterSpacing:1}},t.label),
          on && React.createElement("div",{style:{position:"absolute",bottom:-1,width:18,height:2,background:C.cyan,borderRadius:1,boxShadow:`0 0 6px ${C.cyan}`}}),
          badge && React.createElement("div",{style:{position:"absolute",top:0,right:"15%",width:6,height:6,borderRadius:"50%",background:C.red,boxShadow:`0 0 6px ${C.red}`}})
        );
      })
    )
  );
}

// ═══════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════
function HomeScreen({ctx}){
  const td=tod(), days=week7();
  const tdT=ctx.plan[td]||[];
  const done=tdT.filter(t=>t.done).length;
  const wkAll=days.flatMap(d=>ctx.plan[d]||[]);
  const wkDone=wkAll.filter(t=>t.done).length;
  const tdWU=ctx.todayWU.length;

  return React.createElement("div",{style:{animation:"up .25s ease"}},
    // Phase banner
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${ctx.ph.color}33`,borderLeft:`3px solid ${ctx.ph.color}`,borderRadius:12,padding:"16px",marginBottom:18,boxShadow:`0 4px 20px rgba(0,0,0,.3)`}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:13}},
        React.createElement("div",{style:{width:40,height:40,borderRadius:10,background:`${ctx.ph.color}14`,border:`1px solid ${ctx.ph.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:ctx.ph.color,filter:`drop-shadow(0 0 6px ${ctx.ph.color}55)`,flexShrink:0}},ctx.ph.icon),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:9,color:ctx.ph.color,letterSpacing:2,marginBottom:3}},`${ctx.ph.months.toUpperCase()} · ${ctx.ph.earn}`),
          React.createElement("div",{style:{fontSize:13,fontWeight:700,color:C.text}},ctx.ph.title),
          React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},ctx.ph.split)
        ),
        React.createElement("button",{onClick:()=>ctx.setScreen("phase"),style:{background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:7,padding:"5px 10px",fontSize:9,cursor:"pointer",fontFamily:F,letterSpacing:1,transition:"border-color .15s"}},"CHANGE")
      )
    ),

    // Stats
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}},
      React.createElement(Stat,{n:`${done}/${tdT.length}`,label:"Today",color:done===tdT.length&&tdT.length>0?C.green:C.cyan}),
      React.createElement(Stat,{n:`${wkDone}/${wkAll.length}`,label:"Week",color:C.sub}),
      React.createElement(Stat,{n:`${tdWU}/2`,label:"Write-ups",color:tdWU>=2?C.green:C.red})
    ),

    // Write-up alert
    ctx.wuMissed && React.createElement("div",{onClick:()=>ctx.setScreen("wups"),style:{background:`${C.red}0a`,border:`1px solid ${C.red}33`,borderLeft:`3px solid ${C.red}`,borderRadius:10,padding:"13px 16px",marginBottom:18,cursor:"pointer"}},
      React.createElement("div",{style:{fontSize:11,color:C.red,marginBottom:3,fontWeight:600}},"⚠  Today's write-up বাকি"),
      React.createElement("div",{style:{fontSize:11,color:C.sub,lineHeight:1.6}},`${tdWU}টা পড়েছো · আরো ${2-tdWU}টা বাকি → tap করো`)
    ),

    // Today tasks
    React.createElement(Section,{label:"Today's Tasks"},
      tdT.length===0
        ? React.createElement(Empty,{msg:"কোনো task নেই।",cta:"Plan করো",onCta:()=>ctx.setScreen("plan")})
        : React.createElement(React.Fragment,null,
            tdT.slice(0,5).map(t=>React.createElement("div",{key:t.id,style:{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.line}`}},
              React.createElement("div",{style:{width:7,height:7,borderRadius:"50%",flexShrink:0,background:t.done?C.green:t.missed?C.red:C.border,boxShadow:t.done?`0 0 6px ${C.green}`:"none",transition:"all .2s"}}),
              React.createElement("div",{style:{flex:1,fontSize:12,color:t.done?C.sub:C.text,textDecoration:t.done?"line-through":"none",lineHeight:1.5}},t.text),
              React.createElement("div",{style:{fontSize:10,color:C.sub}},`${t.hours}h`)
            )),
            React.createElement("button",{onClick:()=>ctx.setScreen("checkin"),style:gBtn(C.cyan)},"Check-in →")
          )
    ),

    // Phase suggestions
    React.createElement(Section,{label:`Phase ${ctx.ph.n} — Now`},
      ctx.ph.tasks.slice(0,4).map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.sub,padding:"8px 0",borderBottom:`1px solid ${C.line}`,lineHeight:1.6,display:"flex",gap:8}},
        React.createElement("span",{style:{color:ctx.ph.color,flexShrink:0}},"›"),t
      )),
      React.createElement("button",{onClick:()=>ctx.setScreen("plan"),style:gBtn(ctx.ph.color)},"Add to Plan →")
    )
  );
}

// ═══════════════════════════════════════════
// PHASE SELECT
// ═══════════════════════════════════════════
function PhaseSet({ctx}){
  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,"Select Phase"),
    PHASES.map((ph,i)=>{
      const active=ctx.phase===ph.id;
      return React.createElement("div",{key:ph.id,className:"row tap",onClick:()=>{ctx.savePhase(ph.id);ctx.flash("Phase updated ✓");ctx.setScreen("home");},
        style:{background:active?`${ph.color}0d`:C.surface,border:`1px solid ${active?ph.color+"55":C.border}`,borderLeft:`3px solid ${active?ph.color:C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:8,cursor:"pointer",display:"flex",gap:14,alignItems:"center",transition:"all .15s",animation:`up .2s ease ${i*40}ms both`}},
        React.createElement("div",{style:{width:36,height:36,borderRadius:9,background:`${ph.color}14`,border:`1px solid ${ph.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:ph.color,flexShrink:0,filter:active?`drop-shadow(0 0 5px ${ph.color}88)`:"none"}}),ph.icon,
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:9,color:ph.color,letterSpacing:2,marginBottom:3}},`${ph.months.toUpperCase()} · ${ph.earn}`),
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text}},ph.title),
          React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},ph.split)
        ),
        active && React.createElement("span",{style:{color:ph.color,fontSize:16,filter:`drop-shadow(0 0 4px ${ph.color})`}},"✓")
      );
    })
  );
}

// ═══════════════════════════════════════════
// PLANNER
// ═══════════════════════════════════════════
function Planner({ctx}){
  const td=tod(), days=week7();
  const [sel,setSel]=React.useState(td);
  const [text,setText]=React.useState("");
  const [hours,setHours]=React.useState("1");
  const [showSug,setShowSug]=React.useState(false);
  const [saving,setSaving]=React.useState(false);
  const tasks=ctx.plan[sel]||[];
  const totalH=tasks.reduce((a,t)=>a+t.hours,0);
  const isPast=sel<td;   // আগের দিন — read only
  const isFuture=sel>td; // পরের দিন — editable
  const isEditable=sel>=td; // আজ বা পরের দিন

  const add=async()=>{
    if(!isEditable) return ctx.flash("Past দিনে task add করা যাবে না","err");
    if(!text.trim()) return ctx.flash("Task লিখো","err");
    setSaving(true);
    await ctx.addTask(sel,text.trim(),parseFloat(hours)||1);
    setText(""); setHours("1"); setSaving(false);
  };

  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,"Weekly Plan"),
    React.createElement("div",{style:{display:"flex",gap:5,marginBottom:18,overflowX:"auto",paddingBottom:2}},
      days.map(d=>{
        const on=d===sel, isT=d===td, cnt=(ctx.plan[d]||[]).length;
        return React.createElement("button",{key:d,onClick:()=>setSel(d),style:{flexShrink:0,minWidth:50,background:on?`${C.cyan}14`:C.surface,border:`1px solid ${on?C.cyan:isT?`${C.cyan}44`:C.border}`,borderRadius:9,padding:"8px 6px",cursor:"pointer",textAlign:"center",fontFamily:F,transition:"all .15s",boxShadow:on?`0 0 12px ${C.cyan}22`:"none"}},
          React.createElement("div",{style:{fontSize:8,color:on?C.cyan:C.sub,letterSpacing:1,marginBottom:2}},dayOf(d)),
          React.createElement("div",{style:{fontSize:13,fontWeight:700,color:on?C.cyan:C.text}},fmt(d).split(" ")[0]),
          cnt>0&&React.createElement("div",{style:{fontSize:8,color:on?C.cyan:C.sub,marginTop:2}},cnt)
        );
      })
    ),
    isPast
      ? React.createElement("div",{style:{background:`${C.orange}0a`,border:`1px solid ${C.orange}33`,borderLeft:`3px solid ${C.orange}`,borderRadius:10,padding:"12px 16px",marginBottom:14}},
          React.createElement("div",{style:{fontSize:11,color:C.orange,fontWeight:600}},"📅 Past day — Read only"),
          React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:3}},"শুধু দেখতে পারবে, edit বা add করা যাবে না।")
        )
      : React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,.3)"}},
          React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:12}},`${dayOf(sel).toUpperCase()} ${fmt(sel)} — NEW TASK`),
          React.createElement("input",{value:text,onChange:e=>setText(e.target.value),onKeyDown:e=>e.key==="Enter"&&add(),placeholder:"Task লিখো…",style:{...inp,marginBottom:10}}),
          React.createElement("div",{style:{display:"flex",gap:8}},
            React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,flexShrink:0}},
              React.createElement("span",{style:{fontSize:10,color:C.sub}},"h:"),
              React.createElement("input",{type:"number",min:"0.5",max:"12",step:"0.5",value:hours,onChange:e=>setHours(e.target.value),style:{...inp,width:60}})
            ),
            React.createElement("button",{onClick:add,disabled:saving,style:{flex:1,background:`${C.cyan}14`,border:`1px solid ${C.cyan}55`,color:C.cyan,borderRadius:8,padding:"10px",fontSize:11,cursor:"pointer",fontFamily:F,fontWeight:600,opacity:saving?.6:1}},saving?"...":"+ Add"),
            React.createElement("button",{onClick:()=>setShowSug(s=>!s),style:{background:showSug?`${C.orange}14`:C.card,border:`1px solid ${showSug?C.orange:C.border}`,color:showSug?C.orange:C.sub,borderRadius:8,padding:"10px 14px",fontSize:11,cursor:"pointer",fontFamily:F,transition:"all .15s"}},showSug?"✕":"Suggest")
          )
        ),
    !isPast&&showSug&&React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:14}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},`PHASE ${ctx.ph.n} — SUGGESTED`),
      ctx.ph.tasks.map((t,i)=>React.createElement("div",{key:i,className:"row tap",onClick:async()=>{await ctx.addTask(sel,t,1);setShowSug(false);},
        style:{fontSize:11,color:C.sub,padding:"9px 0",borderBottom:`1px solid ${C.line}`,cursor:"pointer",display:"flex",gap:8,lineHeight:1.6}},
        React.createElement("span",{style:{color:ctx.ph.color,flexShrink:0}},"+"),t
      ))
    ),
    React.createElement(Section,{label:`${dayOf(sel)} · ${tasks.length} tasks · ${totalH}h`},
      tasks.length===0
        ? React.createElement(Empty,{msg:"এই দিনে কোনো task নেই।"})
        : React.createElement(React.Fragment,null,
            tasks.map(t=>React.createElement("div",{key:t.id,style:{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.line}`}},
              React.createElement("div",{style:{flex:1}},
                React.createElement("div",{style:{fontSize:12,color:C.text,lineHeight:1.5}},t.text),
                React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},`${t.hours}h`)
              ),
              !isPast&&React.createElement("button",{onClick:()=>ctx.deleteTask(sel,t.id),style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:15,padding:"0 6px",lineHeight:1,transition:"color .15s"}},"✕")
            )),
            React.createElement("div",{style:{paddingTop:10,display:"flex",justifyContent:"space-between",fontSize:10}},
              React.createElement("span",{style:{color:C.sub}},`Total ${totalH}h`),
              React.createElement("span",{style:{color:totalH>=6?C.green:C.orange,fontWeight:600}},totalH>=6?"✓ 6h met":`${(6-totalH).toFixed(1)}h more needed`)
            )
          )
    )
  );
}

// ═══════════════════════════════════════════
// CHECK-IN
// ═══════════════════════════════════════════
function Checkin({ctx}){
  const td=tod(), tasks=ctx.plan[td]||[];
  const done=tasks.filter(t=>t.done).length;
  const miss=tasks.filter(t=>t.missed).length;
  const hrs=tasks.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const pct=tasks.length>0?Math.round((done/tasks.length)*100):0;
  const r=28, circ=2*Math.PI*r;
  const ringColor=pct===100?C.green:pct>60?C.cyan:C.orange;

  const toggle=async(t,field)=>{
    const f=field==="done"?{done:!t.done,missed:!t.done?false:t.missed}:{missed:!t.missed};
    await ctx.updateTask(td,t.id,f);
  };

  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,`Today · ${fmt(td)}`),
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${pct===100?C.green+"44":C.border}`,borderRadius:14,padding:"20px 18px",marginBottom:20,display:"flex",gap:18,alignItems:"center",boxShadow:pct===100?`0 0 20px ${C.green}15`:"0 2px 12px rgba(0,0,0,.3)",transition:"all .3s"}},
      React.createElement("div",{style:{position:"relative",width:72,height:72,flexShrink:0}},
        React.createElement("svg",{width:"72",height:"72",viewBox:"0 0 72 72"},
          React.createElement("circle",{cx:"36",cy:"36",r:r,fill:"none",stroke:C.line,strokeWidth:"5"}),
          React.createElement("circle",{cx:"36",cy:"36",r:r,fill:"none",stroke:ringColor,strokeWidth:"5",strokeDasharray:circ,strokeDashoffset:circ*(1-pct/100),strokeLinecap:"round",transform:"rotate(-90 36 36)",style:{transition:"stroke-dashoffset .6s ease, stroke .3s",filter:`drop-shadow(0 0 4px ${ringColor}88)`}})
        ),
        React.createElement("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:ringColor}},`${pct}%`)
      ),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{display:"flex",gap:16,marginBottom:8,flexWrap:"wrap"}},
          React.createElement("span",{style:{fontSize:11,color:C.green}},`✓ ${done} done`),
          React.createElement("span",{style:{fontSize:11,color:C.red}},`✕ ${miss} missed`),
          React.createElement("span",{style:{fontSize:11,color:C.sub}},`${tasks.length-done-miss} left`)
        ),
        React.createElement("div",{style:{fontSize:11,color:C.sub}},`${hrs}h logged`),
        ctx.wuMissed&&React.createElement("div",{style:{fontSize:10,color:C.red,marginTop:6}},`⚠ write-up ${ctx.todayWU.length}/2 remaining`)
      )
    ),
    tasks.length===0
      ? React.createElement(Empty,{msg:"আজকের task নেই।",cta:"Plan করো",onCta:()=>ctx.setScreen("plan")})
      : tasks.map((t,i)=>React.createElement("div",{key:t.id,style:{background:C.surface,border:`1px solid ${t.done?C.green+"44":t.missed?C.red+"44":C.border}`,borderLeft:`3px solid ${t.done?C.green:t.missed?C.red:C.border}`,borderRadius:10,padding:"13px 14px",marginBottom:8,display:"flex",gap:13,alignItems:"center",transition:"all .2s",animation:`up .2s ease ${i*40}ms both`}},
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{fontSize:12,color:t.done?C.sub:C.text,textDecoration:t.done?"line-through":"none",lineHeight:1.5}},t.text),
            React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:3}},`${t.hours}h`)
          ),
          React.createElement("div",{style:{display:"flex",gap:7}},
            React.createElement("button",{onClick:()=>toggle(t,"done"),style:{width:34,height:34,borderRadius:8,border:`1.5px solid ${t.done?C.green:C.border}`,background:t.done?`${C.green}18`:"transparent",color:t.done?C.green:C.sub,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",boxShadow:t.done?`0 0 8px ${C.green}44`:"none"}},"✓"),
            React.createElement("button",{onClick:()=>toggle(t,"missed"),style:{width:34,height:34,borderRadius:8,border:`1.5px solid ${t.missed?C.red:C.border}`,background:t.missed?`${C.red}18`:"transparent",color:t.missed?C.red:C.sub,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}},"✕")
          )
        ))
  );
}

// ═══════════════════════════════════════════
// WRITE-UPS
// ═══════════════════════════════════════════
function Writeups({ctx}){
  const [form,setForm]=React.useState({title:"",platform:"HackerOne",url:"",notes:""});
  const [open,setOpen]=React.useState(false);
  const [search,setSearch]=React.useState("");
  const [filter,setFilter]=React.useState("all");
  const [exp,setExp]=React.useState(null);
  const [saving,setSaving]=React.useState(false);
  const [editWU,setEditWU]=React.useState(null);
  const [editForm,setEditForm]=React.useState({title:"",platform:"HackerOne",url:"",notes:""});
  const setE=(k,v)=>setEditForm(p=>({...p,[k]:v}));
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const PLATS=["HackerOne","Bugcrowd","Intigriti","Synack","Other"];
  const td=tod(), tdCnt=ctx.todayWU.length, days=week7();
  const streak=(()=>{let s=0,d=new Date();for(let i=0;i<60;i++){const k=d.toISOString().split("T")[0];if(ctx.writeups.filter(w=>w.date===k).length>=2){s++;d.setDate(d.getDate()-1);}else break;}return s;})();
  const filtered=ctx.writeups.filter(w=>(filter==="all"||w.platform===filter)&&(!search||(w.title+(w.notes||"")+w.platform).toLowerCase().includes(search.toLowerCase())));
  const pc={HackerOne:C.red,Bugcrowd:C.orange,Intigriti:C.purple,Synack:C.green};
  const add=async()=>{
    if(!form.title.trim()) return ctx.flash("Title লিখো","err");
    setSaving(true);
    await ctx.addWriteup({date:td,...form});
    setForm({title:"",platform:"HackerOne",url:"",notes:""}); setOpen(false); setSaving(false);
  };

  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:18}},
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.text}},"Write-ups"),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},"Daily minimum: 2")
      ),
      React.createElement("div",{style:{textAlign:"right"}},
        React.createElement("div",{style:{fontSize:20,fontWeight:700,color:C.cyan}},ctx.writeups.length),
        React.createElement("div",{style:{fontSize:9,color:C.sub}}),"total"
      )
    ),

    React.createElement("div",{style:{background:C.surface,border:`1px solid ${tdCnt>=2?C.green+"55":C.red+"33"}`,borderLeft:`3px solid ${tdCnt>=2?C.green:C.red}`,borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:13,boxShadow:tdCnt>=2?`0 0 16px ${C.green}0f`:"none"}},
      React.createElement("div",{style:{fontSize:24}},tdCnt>=2?"✅":"⚠️"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:12,fontWeight:700,color:tdCnt>=2?C.green:C.red}},tdCnt>=2?"Today's quota done! 🔥":`Today ${tdCnt}/2`),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:3}},tdCnt<2?`${2-tdCnt} more to read`:"Roadmap on track")
      ),
      React.createElement("div",{style:{textAlign:"right"}},
        React.createElement("div",{style:{fontSize:15,fontWeight:700,color:C.orange}},`${streak}d`),
        React.createElement("div",{style:{fontSize:9,color:C.sub}},"streak")
      )
    ),

    React.createElement("div",{style:{display:"flex",gap:5,marginBottom:18}},
      days.map(d=>{
        const n=ctx.writeups.filter(w=>w.date===d).length;
        const c=n===0?C.border:n>=2?C.green:C.orange;
        return React.createElement("div",{key:d,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}},
          React.createElement("div",{style:{width:"100%",aspectRatio:"1",borderRadius:7,background:n===0?C.surface:`${c}15`,border:`1.5px solid ${d===td?C.cyan:n===0?C.border:`${c}66`}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:n===0?C.sub:c,boxShadow:n>0?`0 0 8px ${c}22`:"none"}},n||"·"),
          React.createElement("div",{style:{fontSize:8,color:d===td?C.cyan:C.sub}},dayOf(d))
        );
      })
    ),

    React.createElement("button",{onClick:()=>setOpen(o=>!o),style:{width:"100%",marginBottom:12,background:open?C.card:`${C.cyan}12`,border:`1px solid ${open?C.border:C.cyan}`,color:open?C.sub:C.cyan,borderRadius:10,padding:"12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F,letterSpacing:1,transition:"all .15s",boxShadow:open?"none":`0 0 14px ${C.cyan}15`}},open?"✕  Close":"+ Log Write-up"),

    open&&React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px",marginBottom:14}},
      React.createElement("input",{placeholder:"Title / vulnerability type",style:{...inp,marginBottom:8},value:form.title,onChange:e=>set("title",e.target.value)}),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}},
        React.createElement("select",{style:inp,value:form.platform,onChange:e=>set("platform",e.target.value)},PLATS.map(p=>React.createElement("option",{key:p},p))),
        React.createElement("input",{placeholder:"URL",style:inp,value:form.url,onChange:e=>set("url",e.target.value)})
      ),
      React.createElement("textarea",{placeholder:"Key takeaway…",style:{...inp,minHeight:64,resize:"vertical",lineHeight:1.7},value:form.notes,onChange:e=>set("notes",e.target.value)}),
      React.createElement("button",{onClick:add,disabled:saving,style:{width:"100%",marginTop:10,background:`${C.cyan}14`,border:`1px solid ${C.cyan}55`,color:C.cyan,borderRadius:9,padding:"12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F,opacity:saving?.6:1}},saving?"Saving...":"✓ Save")
    ),

    React.createElement("div",{style:{position:"relative",marginBottom:10}},
      React.createElement("span",{style:{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.sub,fontSize:14,pointerEvents:"none"}},"⌕"),
      React.createElement("input",{placeholder:`Search ${ctx.writeups.length} write-ups…`,style:{...inp,paddingLeft:30},value:search,onChange:e=>setSearch(e.target.value)})
    ),
    React.createElement("div",{style:{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}},
      ["all",...PLATS].map(p=>React.createElement("button",{key:p,onClick:()=>setFilter(p),style:{background:filter===p?`${C.cyan}14`:"transparent",border:`1px solid ${filter===p?C.cyan:C.border}`,color:filter===p?C.cyan:C.sub,borderRadius:6,padding:"4px 11px",fontSize:9,cursor:"pointer",fontFamily:F,letterSpacing:1,transition:"all .15s"}},p==="all"?`All (${ctx.writeups.length})`:p))
    ),

    filtered.length===0
      ? React.createElement(Empty,{msg:search?`"${search}" not found`:"No write-ups yet."})
      : filtered.map((w,i)=>{
          const isExp=exp===w.id, col=pc[w.platform]||C.sub;
          return React.createElement("div",{key:w.id,style:{background:C.surface,border:`1px solid ${isExp?`${col}55`:C.border}`,borderRadius:10,marginBottom:8,overflow:"hidden",transition:"border-color .15s, box-shadow .15s",boxShadow:isExp?`0 0 16px ${col}15`:"none",animation:`up .15s ease ${Math.min(i,5)*20}ms both`}},
            React.createElement("div",{onClick:()=>setExp(isExp?null:w.id),style:{display:"flex",gap:10,padding:"12px 14px",alignItems:"center",cursor:"pointer"}},
              React.createElement("div",{style:{width:3,height:34,borderRadius:2,flexShrink:0,background:col,boxShadow:`0 0 6px ${col}66`}}),
              React.createElement("div",{style:{flex:1,minWidth:0}},
                React.createElement("div",{style:{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},w.title),
                React.createElement("div",{style:{display:"flex",gap:8,marginTop:3,alignItems:"center"}},
                  React.createElement("span",{style:{fontSize:9,color:col,fontWeight:600}},w.platform),
                  React.createElement("span",{style:{fontSize:9,color:C.border}},"·"),
                  React.createElement("span",{style:{fontSize:9,color:C.sub}},fmt(w.date)),
                  w.notes&&React.createElement("span",{style:{fontSize:9,color:C.sub}},"· note")
                )
              ),
              React.createElement("span",{style:{color:C.sub,fontSize:11,transform:isExp?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}},"▾")
            ),
            isExp&&React.createElement("div",{style:{padding:"0 14px 14px 29px",borderTop:`1px solid ${C.line}`},onClick:e=>e.stopPropagation()},
              editWU===w.id
                ? React.createElement("div",{style:{paddingTop:12}},
                    React.createElement("input",{placeholder:"Title",style:{...inp,marginBottom:8},value:editForm.title,onChange:e=>setE("title",e.target.value)}),
                    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}},
                      React.createElement("select",{style:inp,value:editForm.platform,onChange:e=>setE("platform",e.target.value)},PLATS.map(p=>React.createElement("option",{key:p},p))),
                      React.createElement("input",{placeholder:"URL",style:inp,value:editForm.url,onChange:e=>setE("url",e.target.value)})
                    ),
                    React.createElement("textarea",{placeholder:"Notes…",style:{...inp,minHeight:80,resize:"vertical",lineHeight:1.7},value:editForm.notes,onChange:e=>setE("notes",e.target.value)}),
                    React.createElement("div",{style:{display:"flex",gap:8,marginTop:10}},
                      React.createElement("button",{onClick:async()=>{await ctx.updateWriteup(w.id,{title:editForm.title,platform:editForm.platform,url:editForm.url,notes:editForm.notes});setEditWU(null);},style:{flex:1,background:`${C.green}14`,border:`1px solid ${C.green}44`,color:C.green,borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}},"✓ Save"),
                      React.createElement("button",{onClick:()=>setEditWU(null),style:{background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:7,padding:"9px 14px",fontSize:11,cursor:"pointer",fontFamily:F}},"Cancel")
                    )
                  )
                : React.createElement(React.Fragment,null,
                    w.url&&React.createElement("a",{href:w.url,target:"_blank",rel:"noreferrer",style:{display:"inline-block",marginTop:10,fontSize:11,color:C.cyan,textDecoration:"none"}},`↗ ${w.url.length>40?w.url.slice(0,40)+"…":w.url}`),
                    w.notes&&React.createElement("div",{style:{fontSize:11,color:C.sub,marginTop:10,lineHeight:1.8,whiteSpace:"pre-wrap",borderLeft:`2px solid ${C.border}`,paddingLeft:10}},w.notes),
                    React.createElement("div",{style:{display:"flex",gap:8,marginTop:12}},
                      React.createElement("button",{onClick:()=>{setEditWU(w.id);setEditForm({title:w.title,platform:w.platform,url:w.url||"",notes:w.notes||""});},style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:6,padding:"6px 14px",fontSize:10,cursor:"pointer",fontFamily:F}},"✎ Edit"),
                      React.createElement("button",{onClick:()=>ctx.deleteWriteup(w.id),style:{background:"transparent",border:`1px solid ${C.red}33`,color:C.red,borderRadius:6,padding:"6px 12px",fontSize:10,cursor:"pointer",fontFamily:F}},"✕ Delete")
                    )
                  )
            )
          );
        })
  );
}

// ═══════════════════════════════════════════
// NOTES SCREEN
// ═══════════════════════════════════════════
function NotesScreen({ctx}){
  const [view,setView]=React.useState("list");
  const [selFolder,setSelFolder]=React.useState(null);
  const [selNote,setSelNote]=React.useState(null);
  const [search,setSearch]=React.useState("");
  const folderNotes=(fid)=>ctx.notes.filter(n=>n.folderId===fid);
  const searchResults=search.trim()?ctx.notes.filter(n=>(n.title+n.content+(n.tags||[]).join(" ")).toLowerCase().includes(search.toLowerCase())):[];

  if(view==="list") return React.createElement("div",{style:{animation:"up .2s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:18}},
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.text}},"Bug Notes"),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},`${ctx.folders.length} folders · ${ctx.notes.length} notes`)
      ),
      React.createElement("button",{onClick:()=>setView("new-folder"),style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:8,padding:"7px 14px",fontSize:10,cursor:"pointer",fontFamily:F,letterSpacing:1}},"+ Folder")
    ),
    React.createElement("div",{style:{position:"relative",marginBottom:16}},
      React.createElement("span",{style:{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.sub,fontSize:14,pointerEvents:"none"}},"⌕"),
      React.createElement("input",{placeholder:"Search all notes…",style:{...inp,paddingLeft:30},value:search,onChange:e=>setSearch(e.target.value)})
    ),
    search.trim()
      ? React.createElement(React.Fragment,null,
          React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},`${searchResults.length} RESULTS`),
          searchResults.length===0
            ? React.createElement(Empty,{msg:`"${search}" not found`})
            : searchResults.map(n=>{
                const f=ctx.folders.find(x=>x.id===n.folderId);
                const ft=FTYPES.find(t=>t.id===f?.type)||FTYPES[0];
                return React.createElement("div",{key:n.id,className:"row tap",onClick:()=>{setSelNote(n);setSelFolder(f);setView("note-view");},style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:7,cursor:"pointer"}},
                  React.createElement("div",{style:{fontSize:10,color:ft.color,marginBottom:4}},`${ft.icon} ${f?.name}`),
                  React.createElement("div",{style:{fontSize:12,fontWeight:600,color:C.text}},n.title),
                  n.content&&React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},n.content.slice(0,60)+"…")
                );
              })
        )
      : React.createElement(React.Fragment,null,
          FTYPES.map(ft=>{
            const flist=ctx.folders.filter(f=>f.type===ft.id);
            if(!flist.length) return null;
            return React.createElement("div",{key:ft.id,style:{marginBottom:20}},
              React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},`${ft.label.toUpperCase()}S`),
              flist.map(f=>{
                const cnt=folderNotes(f.id).length;
                return React.createElement("div",{key:f.id,className:"row tap",onClick:()=>{setSelFolder(f);setView("folder");},style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 14px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:13}},
                  React.createElement("div",{style:{width:36,height:36,borderRadius:9,background:`${ft.color}14`,border:`1px solid ${ft.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:ft.color,flexShrink:0}},ft.icon),
                  React.createElement("div",{style:{flex:1,minWidth:0}},
                    React.createElement("div",{style:{fontSize:12,fontWeight:600,color:C.text}},f.name),
                    React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:3}},`${cnt} notes · ${ft.label}`)
                  ),
                  React.createElement("span",{style:{color:C.sub,fontSize:14}},"›")
                );
              })
            );
          }),
          ctx.folders.length===0&&React.createElement(Empty,{msg:"No folders yet.",cta:"Create folder",onCta:()=>setView("new-folder")})
        )
  );

  if(view==="new-folder") return React.createElement(NewFolderView,{onBack:()=>setView("list"),onSave:async(name,type)=>{await ctx.addFolder(name,type);setView("list");}});

  if(view==="folder"&&selFolder){
    const ft=FTYPES.find(t=>t.id===selFolder.type)||FTYPES[0];
    const fnotes=folderNotes(selFolder.id);
    const pinned=fnotes.filter(n=>n.pinned), rest=fnotes.filter(n=>!n.pinned);
    return React.createElement("div",{style:{animation:"up .2s ease"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:18}},
        React.createElement("button",{onClick:()=>setView("list"),style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:22,padding:"0 4px",lineHeight:1}},"‹"),
        React.createElement("div",{style:{flex:1,minWidth:0}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
            React.createElement("span",{style:{color:ft.color,fontSize:15}},ft.icon),
            React.createElement("span",{style:{fontSize:14,fontWeight:700,color:C.text}},selFolder.name)
          ),
          React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:2}},`${fnotes.length} notes · ${ft.label}`)
        ),
        React.createElement("button",{onClick:()=>{setSelNote(null);setView("note-edit");},style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:8,padding:"7px 14px",fontSize:10,cursor:"pointer",fontFamily:F}},"+ Note")
      ),
      fnotes.length===0
        ? React.createElement(Empty,{msg:"No notes in this folder.",cta:"Write a note",onCta:()=>{setSelNote(null);setView("note-edit");}})
        : React.createElement(React.Fragment,null,
            pinned.length>0&&React.createElement(React.Fragment,null,
              React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:8}},"PINNED"),
              pinned.map(n=>React.createElement(NoteRow,{key:n.id,n,color:ft.color,onClick:()=>{setSelNote(n);setView("note-view");}}))
            ),
            rest.length>0&&React.createElement(React.Fragment,null,
              pinned.length>0&&React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:8,marginTop:16}},"ALL NOTES"),
              rest.map(n=>React.createElement(NoteRow,{key:n.id,n,color:ft.color,onClick:()=>{setSelNote(n);setView("note-view");}}))
            )
          ),
      React.createElement("button",{onClick:async()=>{await ctx.deleteFolder(selFolder.id);setView("list");},style:{marginTop:20,background:"transparent",border:`1px solid ${C.red}33`,color:C.red,borderRadius:8,padding:"10px",fontSize:10,cursor:"pointer",fontFamily:F,width:"100%"}},"✕ Delete Folder")
    );
  }

  if(view==="note-view"&&selNote){
    const n=ctx.notes.find(x=>x.id===selNote.id)||selNote;
    const ft=FTYPES.find(t=>t.id===selFolder?.type)||FTYPES[0];
    return React.createElement("div",{style:{animation:"up .2s ease"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16}},
        React.createElement("button",{onClick:()=>setView("folder"),style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:22,padding:"0 4px",lineHeight:1}},"‹"),
        React.createElement("div",{style:{flex:1,minWidth:0}},
          React.createElement("div",{style:{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},n.title),
          React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:2}},`${n.updatedAt} · ${selFolder?.name}`)
        ),
        React.createElement("button",{onClick:()=>ctx.updateNote(n.id,{pinned:!n.pinned}),style:{background:"transparent",border:`1px solid ${C.border}`,color:n.pinned?C.orange:C.sub,borderRadius:7,padding:"5px 10px",fontSize:13,cursor:"pointer",transition:"color .15s"}},n.pinned?"★":"☆"),
        React.createElement("button",{onClick:()=>{setSelNote(n);setView("note-edit");},style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:7,padding:"5px 11px",fontSize:10,cursor:"pointer",fontFamily:F}},"Edit")
      ),
      (n.tags||[]).length>0&&React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}},
        n.tags.map(t=>React.createElement("span",{key:t,style:{background:`${ft.color}12`,border:`1px solid ${ft.color}33`,color:ft.color,borderRadius:5,fontSize:9,padding:"3px 9px",letterSpacing:1}},"#",t))
      ),
      React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px"}},
        React.createElement(NoteContent,{content:n.content})
      ),
      React.createElement("button",{onClick:async()=>{await ctx.deleteNote(n.id);setView("folder");},style:{marginTop:14,background:"transparent",border:`1px solid ${C.red}33`,color:C.red,borderRadius:8,padding:"10px",fontSize:10,cursor:"pointer",fontFamily:F,width:"100%"}},"✕ Delete Note")
    );
  }

  if(view==="note-edit") return React.createElement(NoteEditorView,{note:selNote,folder:selFolder,onBack:()=>setView(selNote?"note-view":"folder"),
    onSave:async(title,content,tags)=>{
      if(selNote){await ctx.updateNote(selNote.id,{title,content,tags});setView("note-view");}
      else{const n=await ctx.addNote(selFolder.id,title,content,tags);if(n){setSelNote(n);setView("note-view");}}
    }
  });
  return null;
}

function NewFolderView({onBack,onSave}){
  const [name,setName]=React.useState("");
  const [type,setType]=React.useState("target");
  const [saving,setSaving]=React.useState(false);
  return React.createElement("div",{style:{animation:"up .2s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:20}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:22,padding:"0 4px",lineHeight:1}},"‹"),
      React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.text}},"New Folder")
    ),
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px",marginBottom:14}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},"TYPE"),
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:18}},
        FTYPES.map(ft=>React.createElement("button",{key:ft.id,onClick:()=>setType(ft.id),className:"tap",style:{flex:1,background:type===ft.id?`${ft.color}14`:"transparent",border:`1px solid ${type===ft.id?`${ft.color}55`:C.border}`,color:type===ft.id?ft.color:C.sub,borderRadius:9,padding:"14px 8px",cursor:"pointer",fontFamily:F,display:"flex",flexDirection:"column",alignItems:"center",gap:7,transition:"all .15s"}},
          React.createElement("span",{style:{fontSize:22}},ft.icon),
          React.createElement("span",{style:{fontSize:9,letterSpacing:1}},ft.label.toUpperCase()),
          React.createElement("span",{style:{fontSize:9,color:C.sub}},ft.hint)
        ))
      ),
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:8}},"NAME"),
      React.createElement("input",{placeholder:FTYPES.find(t=>t.id===type)?.hint||"Name…",style:inp,value:name,onChange:e=>setName(e.target.value),onKeyDown:async e=>{if(e.key==="Enter"&&name.trim()){setSaving(true);await onSave(name.trim(),type);}}})
    ),
    React.createElement("button",{onClick:async()=>{if(!name.trim())return;setSaving(true);await onSave(name.trim(),type);},disabled:!name.trim()||saving,className:"tap",style:{width:"100%",background:name.trim()?`${C.cyan}14`:"transparent",border:`1px solid ${name.trim()?C.cyan:C.border}`,color:name.trim()?C.cyan:C.sub,borderRadius:10,padding:"13px",fontSize:11,fontWeight:700,cursor:name.trim()?"pointer":"default",fontFamily:F,letterSpacing:1,opacity:saving?.6:1,transition:"all .15s"}},saving?"Creating...":"CREATE FOLDER →")
  );
}

function NoteRow({n,color,onClick}){
  return React.createElement("div",{className:"row tap",onClick,style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:7,cursor:"pointer",display:"flex",gap:11,alignItems:"center"}},
    React.createElement("div",{style:{flex:1,minWidth:0}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:7,marginBottom:4}},
        n.pinned&&React.createElement("span",{style:{color:C.orange,fontSize:11}},"★"),
        React.createElement("span",{style:{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},n.title)
      ),
      React.createElement("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
        React.createElement("span",{style:{fontSize:9,color:C.sub}},n.updatedAt),
        (n.tags||[]).slice(0,3).map(t=>React.createElement("span",{key:t,style:{fontSize:9,color}},"#",t))
      )
    ),
    React.createElement("span",{style:{color:C.sub,fontSize:14,flexShrink:0}},"›")
  );
}

function NoteEditorView({note,folder,onBack,onSave}){
  const [title,setTitle]=React.useState(note?.title||"");
  const [content,setContent]=React.useState(note?.content||"");
  const [tags,setTags]=React.useState((note?.tags||[]).join(", "));
  const [saving,setSaving]=React.useState(false);
  const ft=FTYPES.find(t=>t.id===folder?.type)||FTYPES[0];
  const save=async()=>{setSaving(true);await onSave(title.trim()||"Untitled",content,tags.split(",").map(t=>t.trim()).filter(Boolean));};
  return React.createElement("div",{style:{animation:"up .2s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:20}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:22,padding:"0 4px",lineHeight:1}},"‹"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:10,color:ft.color}},`${ft.icon} ${folder?.name}`)
      ),
      React.createElement("button",{onClick:save,disabled:saving,className:"tap",style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}55`,color:C.cyan,borderRadius:8,padding:"8px 16px",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:F,letterSpacing:1,opacity:saving?.6:1}},saving?"Saving...":"SAVE")
    ),
    React.createElement("input",{value:title,onChange:e=>setTitle(e.target.value),placeholder:"Title…",style:{...inp,fontSize:15,fontWeight:700,marginBottom:14,background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,borderRadius:0,padding:"0 0 12px"}}),
    React.createElement("div",{style:{marginBottom:14}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:7}},"TAGS"),
      React.createElement("input",{value:tags,onChange:e=>setTags(e.target.value),placeholder:"xss, idor, recon…",style:{...inp,fontSize:11}})
    ),
    React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:6}},"CONTENT"),
    React.createElement("div",{style:{fontSize:9,color:C.sub,marginBottom:8}},"``` ``` দিয়ে code block"),
    React.createElement("textarea",{value:content,onChange:e=>setContent(e.target.value),placeholder:"Note লিখো…\n\n- Endpoint: /api/user/profile\n- Bug: ID change করলে অন্যের data\n\n```\nGET /api/user/1337\nHost: target.com\n```",style:{...inp,minHeight:280,resize:"vertical",lineHeight:1.9,fontSize:12}})
  );
}

function NoteContent({content}){
  if(!content) return React.createElement("div",{style:{color:C.sub,fontSize:12}},"No content.");
  const parts=content.split(/(```[\s\S]*?```)/g);
  return React.createElement("div",null,
    parts.map((p,i)=>{
      if(p.startsWith("```")&&p.endsWith("```")){
        const code=p.slice(3,-3).trim();
        return React.createElement("div",{key:i,style:{background:"#0d1117",border:`1px solid ${C.border}`,borderRadius:8,padding:"13px 15px",margin:"10px 0",overflowX:"auto"}},
          React.createElement("pre",{style:{margin:0,fontSize:11,color:C.cyan,lineHeight:1.8,whiteSpace:"pre-wrap",wordBreak:"break-all"}},code)
        );
      }
      return React.createElement("div",{key:i,style:{fontSize:12,color:C.text,lineHeight:1.9,whiteSpace:"pre-wrap"}},
        p.split("\n").map((line,j)=>{
          if(line.startsWith("- ")||line.startsWith("• ")) return React.createElement("div",{key:j,style:{display:"flex",gap:8,marginBottom:4}},React.createElement("span",{style:{color:C.cyan,flexShrink:0}},"›"),React.createElement("span",null,line.slice(2)));
          if(/^\d+\.\s/.test(line)) return React.createElement("div",{key:j,style:{display:"flex",gap:8,marginBottom:4}},React.createElement("span",{style:{color:C.cyan,flexShrink:0,minWidth:16}},line.match(/^\d+/)[0],"."),React.createElement("span",null,line.replace(/^\d+\.\s/,"")));
          if(line==="") return React.createElement("div",{key:j,style:{height:8}});
          return React.createElement("div",{key:j,style:{marginBottom:2}},line);
        })
      );
    })
  );
}

// ═══════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════
function StatsScreen({ctx}){
  const [tab,setTab]=React.useState("today");
  const td=tod(), days=week7();
  const tdT=ctx.plan[td]||[];
  const tDone=tdT.filter(t=>t.done).length, tMiss=tdT.filter(t=>t.missed).length;
  const tHrs=tdT.filter(t=>t.done).reduce((a,t)=>a+t.hours,0), tWU=ctx.todayWU.length;
  const wkAll=days.flatMap(d=>(ctx.plan[d]||[]).map(t=>({...t,date:d})));
  const wDone=wkAll.filter(t=>t.done).length, wMiss=wkAll.filter(t=>t.missed).length;
  const wHrs=wkAll.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const wWU=ctx.writeups.filter(w=>days.includes(w.date)).length;
  const mStart=td.slice(0,7)+"-01";
  const mWU=ctx.writeups.filter(w=>w.date>=mStart&&w.date<=td).length;

  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,"Progress"),
    React.createElement("div",{style:{display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:3,marginBottom:20}},
      [["today","Today"],["week","Week"],["month","Month"]].map(([k,l])=>React.createElement("button",{key:k,onClick:()=>setTab(k),style:{flex:1,background:tab===k?`${C.cyan}15`:"transparent",border:`1px solid ${tab===k?`${C.cyan}55`:"transparent"}`,color:tab===k?C.cyan:C.sub,borderRadius:7,padding:"9px",fontSize:10,cursor:"pointer",fontFamily:F,letterSpacing:1,fontWeight:tab===k?700:400,transition:"all .15s"}},l))
    ),

    tab==="today"&&React.createElement(React.Fragment,null,
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:18}},
        React.createElement(Stat,{n:tDone,label:"Done",color:C.green}),
        React.createElement(Stat,{n:tMiss,label:"Missed",color:C.red}),
        React.createElement(Stat,{n:`${tHrs}h`,label:"Hours",color:C.cyan}),
        React.createElement(Stat,{n:`${tWU}/2`,label:"W-ups",color:tWU>=2?C.green:C.red})
      ),
      tdT.length>0&&React.createElement(Section,{label:"Summary"},
        React.createElement(Bar,{done:tDone,total:tdT.length,color:C.cyan,label:"Tasks"}),
        React.createElement(Bar,{done:tHrs,total:8,color:C.orange,label:"Hours (target 8h)"}),
        React.createElement(Bar,{done:tWU,total:2,color:tWU>=2?C.green:C.red,label:"Write-ups (min 2)"})
      ),
      tMiss>0&&React.createElement(Section,{label:"Missed"},
        tdT.filter(t=>t.missed).map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.red,padding:"7px 0",borderBottom:`1px solid ${C.line}`,display:"flex",gap:8}},React.createElement("span",null,"✕"),t.text)),
        React.createElement("div",{style:{fontSize:10,color:C.sub,paddingTop:8}},"Plan এ কালকে রাখো।")
      )
    ),

    tab==="week"&&React.createElement(React.Fragment,null,
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}},
        React.createElement(Stat,{n:wDone,label:"Done",color:C.green}),
        React.createElement(Stat,{n:`${wHrs}h`,label:"Hours",color:C.cyan}),
        React.createElement(Stat,{n:`${wWU}/14`,label:"W-ups",color:wWU>=14?C.green:C.orange})
      ),
      React.createElement(Section,{label:"Days"},
        React.createElement("div",{style:{display:"flex",gap:5}},
          days.map(d=>{
            const dt=ctx.plan[d]||[], dn=dt.filter(t=>t.done).length, tot=dt.length;
            const pct=tot>0?dn/tot:0;
            const c=tot===0?C.border:pct===1?C.green:pct>0.5?C.orange:C.red;
            return React.createElement("div",{key:d,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}},
              React.createElement("div",{style:{width:"100%",aspectRatio:"1",borderRadius:6,background:tot===0?C.surface:`${c}15`,border:`1.5px solid ${d===td?C.cyan:tot===0?C.border:`${c}55`}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:tot===0?C.sub:c}},tot===0?"·":`${dn}/${tot}`),
              React.createElement("div",{style:{fontSize:8,color:d===td?C.cyan:C.sub}},dayOf(d))
            );
          })
        )
      ),
      wMiss>0&&React.createElement(Section,{label:`⚠ ${wMiss} Missed`},
        wkAll.filter(t=>t.missed).slice(0,5).map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.sub,padding:"7px 0",borderBottom:`1px solid ${C.line}`,display:"flex",gap:10}},
          React.createElement("span",{style:{color:C.sub,fontSize:9,flexShrink:0}},fmt(t.date)),
          React.createElement("span",{style:{color:C.red}},"✕"),
          React.createElement("span",null,t.text)
        ))
      )
    ),

    tab==="month"&&React.createElement(React.Fragment,null,
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}},
        React.createElement(Stat,{n:mWU,label:"Write-ups",color:C.cyan}),
        React.createElement(Stat,{n:ctx.notes.length,label:"Notes",color:C.sub})
      ),
      React.createElement(Section,{label:"Current Phase"},
        React.createElement("div",{style:{fontSize:9,color:ctx.ph.color,letterSpacing:2,marginBottom:6}},`${ctx.ph.months.toUpperCase()} · ${ctx.ph.earn}`),
        React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}},ctx.ph.title),
        ctx.ph.tasks.map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.sub,padding:"7px 0",borderBottom:`1px solid ${C.line}`,lineHeight:1.6,display:"flex",gap:8}},
          React.createElement("span",{style:{color:ctx.ph.color,flexShrink:0}},"›"),t
        ))
      )
    )
  );
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
function Section({label,children}){
  return React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"15px 16px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,.25)"}},
    label&&React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:12,display:"flex",alignItems:"center",gap:7}},
      React.createElement("div",{style:{width:2,height:10,background:C.border,borderRadius:1}}),
      label.toUpperCase()
    ),
    children
  );
}
function PTitle({children}){
  return React.createElement("div",{style:{fontSize:14,fontWeight:700,color:C.text,marginBottom:18,letterSpacing:1}},children);
}
function Stat({n,label,color}){
  return React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderTop:`2px solid ${color}55`,borderRadius:10,padding:"13px 8px",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,.25)"}},
    React.createElement("div",{style:{fontSize:19,fontWeight:700,color,lineHeight:1}},n),
    React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:5,letterSpacing:1}},label.toUpperCase())
  );
}
function Bar({done,total,color,label}){
  const pct=total>0?Math.min(100,Math.round((done/total)*100)):0;
  return React.createElement("div",{style:{marginBottom:12}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:5}},
      React.createElement("span",{style:{fontSize:10,color:C.sub}},label),
      React.createElement("span",{style:{fontSize:10,color,fontWeight:600}},`${pct}%`)
    ),
    React.createElement("div",{style:{height:4,background:C.line,borderRadius:3,overflow:"hidden"}},
      React.createElement("div",{style:{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${color}99,${color})`,borderRadius:3,transition:"width .6s ease",boxShadow:`0 0 6px ${color}66`}})
    )
  );
}
function Empty({msg,cta,onCta}){
  return React.createElement("div",{style:{textAlign:"center",padding:"28px 0"}},
    React.createElement("div",{style:{fontSize:22,color:C.border,marginBottom:10}},"◎"),
    React.createElement("div",{style:{fontSize:11,color:C.sub,marginBottom:14,lineHeight:1.7}},msg),
    cta&&onCta&&React.createElement("button",{onClick:onCta,className:"tap",style:{background:"transparent",border:`1px solid ${C.border}`,color:C.sub,borderRadius:7,padding:"8px 18px",fontSize:10,cursor:"pointer",fontFamily:F,letterSpacing:1}},cta)
  );
}
function Toast({msg,err}){
  const c=err?C.red:C.green;
  return React.createElement("div",{style:{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",background:C.card,border:`1px solid ${c}55`,borderLeft:`3px solid ${c}`,color:c,padding:"10px 20px",borderRadius:9,fontSize:11,zIndex:99,whiteSpace:"nowrap",boxShadow:`0 8px 30px rgba(0,0,0,.5), 0 0 16px ${c}15`,fontFamily:F,fontWeight:600}},msg);
}

// ═══════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
