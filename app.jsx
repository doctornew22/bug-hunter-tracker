// ═══════════════════════════════════════════
// CONFIG — তোমার keys
// ═══════════════════════════════════════════
const SUPABASE_URL  = "https://ttjqwsgyrmakbkgpnbxt.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0anF3c2d5cm1ha2JrZ3BuYnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDc5NTUsImV4cCI6MjA5ODA4Mzk1NX0.hO3PUSdo8ZZOJYC4OhQhOgUpBwNvseYSxHW4aTE_JkI";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ═══════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════
const C = {
  bg:"#08090e", surface:"#0f1117", card:"#13151d",
  border:"#1e2330", line:"#161921",
  cyan:"#00d4e8", green:"#22c55e", red:"#ef4444",
  orange:"#f59e0b", text:"#e2e8f0", sub:"#64748b",
};
const F = `'JetBrains Mono','Fira Code',monospace`;

// ═══════════════════════════════════════════
// ROADMAP
// ═══════════════════════════════════════════
const PHASES = [
  { id:"p1", n:"01", months:"Month 1–2",  title:"Web Fundamentals",     color:C.cyan,    earn:"$0",       split:"100% Learn", icon:"◈",
    tasks:["HTTP Methods, Headers, Status Codes","Same-Origin Policy & Cookies","PortSwigger Academy শুরু করো","DVWA / Juice Shop setup করো","TryHackMe Web Fundamentals","Web Hacking 101 বই","MDN Docs — JS basics"] },
  { id:"p2", n:"02", months:"Month 3–4",  title:"Access Control",       color:"#6ea8fe", earn:"~$2k/mo",  split:"20% Hunt",   icon:"◎",
    tasks:["OWASP — Broken Access Control","IDOR write-ups পড়ো Hacktivity তে","PortSwigger Access Control labs","Public program এ hunt করো","DVWA/bWAPP দিয়ে practice","সপ্তাহে ২–৩ রিপোর্ট সাবমিট করো"] },
  { id:"p3", n:"03", months:"Month 5–6",  title:"XSS · CSRF · SSRF",    color:C.orange,  earn:"~$5k/mo",  split:"40% Hunt",   icon:"◆",
    tasks:["Reflected, Stored, DOM XSS","CSRF token bypass","SSRF — internal network","PayloadsAllTheThings পড়ো","XSStrike / dalfox practice","HackTheBox Web path","মাসে ৭–১২ bug টার্গেট"] },
  { id:"p4", n:"04", months:"Month 6–8",  title:"Code Review + Advanced",color:C.sub,    earn:"~$9k/mo",  split:"80% Hunt",   icon:"◐",
    tasks:["PHP / Node.js code review","OAuth vulnerability patterns","GraphQL security","Business Logic bugs","Vulnerability chaining","Open source program hunt","Burp Suite advanced features"] },
  { id:"p5", n:"05", months:"Month 8–12", title:"Hardcore Hunting",      color:C.red,     earn:"$15k+/mo", split:"100% Hunt",  icon:"◉",
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
// ROOT
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

  // Auth
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

  const resetState=()=>{ setPlan({}); setWriteups([]); setFolders([]); setNotes([]); };

  const loadAll = async(uid)=>{
    setLoading(true);
    try {
      // Settings
      const {data:s} = await db.from("user_settings").select("*").eq("user_id",uid).single();
      if(s) setPhase(s.phase||"p1");

      // Tasks (last 30 + next 7)
      const from=shift(tod(),-30), to=shift(tod(),7);
      const {data:tasks} = await db.from("week_tasks").select("*").eq("user_id",uid).gte("date",from).lte("date",to);
      if(tasks){
        const p={};
        tasks.forEach(t=>{ if(!p[t.date])p[t.date]=[]; p[t.date].push({id:t.id,text:t.text,hours:t.hours,done:t.done,missed:t.missed}); });
        setPlan(p);
      }

      // Write-ups (last 60 days)
      const wfrom=shift(tod(),-60);
      const {data:wups} = await db.from("writeups").select("*").eq("user_id",uid).gte("date",wfrom).order("created_at",{ascending:false});
      if(wups) setWriteups(wups.map(w=>({id:w.id,date:w.date,title:w.title,platform:w.platform,url:w.url,notes:w.notes})));

      // Folders
      const {data:fols} = await db.from("folders").select("*").eq("user_id",uid).order("created_at",{ascending:false});
      if(fols) setFolders(fols.map(f=>({id:f.id,name:f.name,type:f.type,pinned:f.pinned})));

      // Notes
      const {data:nts} = await db.from("notes").select("*").eq("user_id",uid).order("updated_at",{ascending:false});
      if(nts) setNotes(nts.map(n=>({id:n.id,folderId:n.folder_id,title:n.title,content:n.content,tags:n.tags||[],pinned:n.pinned,updatedAt:n.updated_at?.split("T")[0]})));

    } catch(e){ flash("Load error","err"); }
    setLoading(false);
  };

  const flash=(msg,err)=>{ setToast({msg,err}); setTimeout(()=>setToast(null),2600); };
  const uid=()=>session?.user?.id;

  // ── TASK HELPERS ──
  const addTask=async(date,text,hours)=>{
    const {data}=await db.from("week_tasks").insert({user_id:uid(),date,text,hours,done:false,missed:false}).select().single();
    if(data) setPlan(p=>({...p,[date]:[...(p[date]||[]),{id:data.id,text,hours,done:false,missed:false}]}));
    flash("Task যোগ হয়েছে");
  };
  const updateTask=async(date,id,fields)=>{
    await db.from("week_tasks").update(fields).eq("id",id);
    setPlan(p=>({...p,[date]:(p[date]||[]).map(t=>t.id===id?{...t,...fields}:t)}));
  };
  const deleteTask=async(date,id)=>{
    await db.from("week_tasks").delete().eq("id",id);
    setPlan(p=>({...p,[date]:(p[date]||[]).filter(t=>t.id!==id)}));
  };
  const savePhase=async(p)=>{
    setPhase(p);
    await db.from("user_settings").upsert({user_id:uid(),phase:p});
  };

  // ── WRITEUP HELPERS ──
  const addWriteup=async(wu)=>{
    const {data}=await db.from("writeups").insert({user_id:uid(),...wu}).select().single();
    if(data){ setWriteups(p=>[{id:data.id,...wu},...p]); flash(writeups.filter(w=>w.date===tod()).length>=1?"🔥 Quota পূরণ!":"Saved! আরো ১টা বাকি।"); }
  };
  const deleteWriteup=async(id)=>{
    await db.from("writeups").delete().eq("id",id);
    setWriteups(p=>p.filter(w=>w.id!==id)); flash("Deleted");
  };
  const updateWriteup=async(id,fields)=>{
    await db.from("writeups").update(fields).eq("id",id);
    setWriteups(p=>p.map(w=>w.id===id?{...w,...fields}:w));
    flash("Updated ✓");
  };

  // ── FOLDER HELPERS ──
  const addFolder=async(name,type)=>{
    const {data}=await db.from("folders").insert({user_id:uid(),name,type,pinned:false}).select().single();
    if(data){ setFolders(p=>[{id:data.id,name,type,pinned:false},...p]); flash("Folder তৈরি হয়েছে"); }
  };
  const deleteFolder=async(id)=>{
    await db.from("folders").delete().eq("id",id);
    setFolders(p=>p.filter(f=>f.id!==id));
    setNotes(p=>p.filter(n=>n.folderId!==id));
    flash("Deleted");
  };

  // ── NOTE HELPERS ──
  const addNote=async(folderId,title,content,tags)=>{
    const {data}=await db.from("notes").insert({user_id:uid(),folder_id:folderId,title,content,tags,pinned:false}).select().single();
    if(data){
      const n={id:data.id,folderId,title,content,tags,pinned:false,updatedAt:data.updated_at?.split("T")[0]||tod()};
      setNotes(p=>[n,...p]); flash("Note সেভ হয়েছে"); return n;
    }
    return null;
  };
  const updateNote=async(id,fields)=>{
    const dbFields={};
    if(fields.title!==undefined)   dbFields.title=fields.title;
    if(fields.content!==undefined) dbFields.content=fields.content;
    if(fields.tags!==undefined)    dbFields.tags=fields.tags;
    if(fields.pinned!==undefined)  dbFields.pinned=fields.pinned;
    dbFields.updated_at=new Date().toISOString();
    await db.from("notes").update(dbFields).eq("id",id);
    setNotes(p=>p.map(n=>n.id===id?{...n,...fields,updatedAt:tod()}:n));
    flash("Updated");
  };
  const deleteNote=async(id)=>{
    await db.from("notes").delete().eq("id",id);
    setNotes(p=>p.filter(n=>n.id!==id)); flash("Deleted");
  };

  const todayWU   = writeups.filter(w=>w.date===tod());
  const wuMissed  = todayWU.length<2;
  const ph        = PHASES.find(p=>p.id===phase)||PHASES[0];

  if(loading) return React.createElement(Splash);
  if(!session) return React.createElement(AuthScreen,{authMode,setAuthMode,flash});

  const ctx={session,phase,savePhase,plan,addTask,updateTask,deleteTask,writeups,addWriteup,updateWriteup,deleteWriteup,folders,addFolder,deleteFolder,notes,addNote,updateNote,deleteNote,todayWU,wuMissed,ph,flash,setScreen};

  return React.createElement("div",{style:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F,paddingBottom:72}},
    React.createElement("style",null,`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:${C.border}}
      input,textarea,select{font-family:${F}}
      @keyframes up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
      .row{transition:background .12s}.row:active{background:${C.card}!important}
    `),
    React.createElement(TopBar,{ctx,screen,setScreen}),
    React.createElement("main",{style:{maxWidth:480,margin:"0 auto",padding:"20px 16px 0"}},
      screen==="home"    && React.createElement(HomeScreen,   {ctx}),
      screen==="phase"   && React.createElement(PhaseSet,     {ctx}),
      screen==="plan"    && React.createElement(Planner,      {ctx}),
      screen==="checkin" && React.createElement(Checkin,      {ctx}),
      screen==="wups"    && React.createElement(Writeups,     {ctx}),
      screen==="notes"   && React.createElement(NotesScreen,  {ctx}),
      screen==="stats"   && React.createElement(StatsScreen,  {ctx}),
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
  const handle=async()=>{
    if(!email||!pass) return flash("Email ও password দাও","err");
    setBusy(true);
    if(authMode==="signup"){
      const {error}=await db.auth.signUp({email,password:pass});
      if(error) flash(error.message,"err"); else flash("Account হয়েছে! Login করো।");
    } else {
      const {error}=await db.auth.signInWithPassword({email,password:pass});
      if(error) flash("Email বা password ভুল","err");
    }
    setBusy(false);
  };
  return React.createElement("div",{style:{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:F}},
    React.createElement("style",null,`@keyframes up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`),
    React.createElement("div",{style:{fontSize:32,color:C.cyan,marginBottom:8}},"◉"),
    React.createElement("div",{style:{fontSize:14,fontWeight:600,color:C.text,letterSpacing:2,marginBottom:4}},"BUG HUNTER"),
    React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:4,marginBottom:40}},"ROADMAP TRACKER"),
    React.createElement("div",{style:{width:"100%",maxWidth:360,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"24px",animation:"up .3s ease"}},
      React.createElement("div",{style:{fontSize:9,color:C.cyan,letterSpacing:2,marginBottom:16}},authMode==="login"?"LOGIN":"CREATE ACCOUNT"),
      React.createElement("input",{placeholder:"Email",type:"email",value:email,onChange:e=>setEmail(e.target.value),style:{...inp,marginBottom:8}}),
      React.createElement("input",{placeholder:"Password (min 6)",type:"password",value:pass,onChange:e=>setPass(e.target.value),onKeyDown:e=>e.key==="Enter"&&handle(),style:{...inp,marginBottom:16}}),
      React.createElement("button",{onClick:handle,disabled:busy,style:{width:"100%",background:`${C.cyan}14`,border:`1px solid ${C.cyan}55`,color:C.cyan,borderRadius:8,padding:"12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F,letterSpacing:2,opacity:busy?.6:1}},busy?"...":authMode==="login"?"LOGIN →":"SIGN UP →"),
      React.createElement("div",{style:{textAlign:"center",marginTop:14,fontSize:10,color:C.sub}},
        authMode==="login"?"Account নেই? ":"Already আছো? ",
        React.createElement("span",{onClick:()=>setAuthMode(authMode==="login"?"signup":"login"),style:{color:C.cyan,cursor:"pointer"}},authMode==="login"?"Sign up":"Login")
      )
    ),
    toast && React.createElement(Toast,toast)
  );
}

// ═══════════════════════════════════════════
// SPLASH
// ═══════════════════════════════════════════
function Splash(){
  return React.createElement("div",{style:{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,fontFamily:F,gap:12}},
    React.createElement("style",null,"@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}"),
    React.createElement("div",{style:{fontSize:32,color:C.cyan}},"◉"),
    React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:4,animation:"blink 1.2s infinite"}},"LOADING")
  );
}

// ═══════════════════════════════════════════
// TOP BAR
// ═══════════════════════════════════════════
function TopBar({ctx,screen,setScreen}){
  return React.createElement("header",{style:{position:"sticky",top:0,zIndex:40,background:"rgba(8,9,14,.94)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`}},
    React.createElement("div",{style:{maxWidth:480,margin:"0 auto",padding:"12px 16px",display:"flex",alignItems:"center",gap:10}},
      React.createElement("div",{style:{fontSize:18,color:C.cyan,lineHeight:1}},"◉"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:11,fontWeight:600,color:C.text,letterSpacing:1}},"ROADMAP TRACKER"),
        React.createElement("div",{style:{fontSize:9,color:ctx.ph.color,marginTop:1}},`${ctx.ph.n} · ${ctx.ph.title}`)
      ),
      ctx.wuMissed && React.createElement("div",{onClick:()=>setScreen("wups"),style:{fontSize:9,color:C.red,cursor:"pointer",border:`1px solid ${C.red}33`,borderRadius:5,padding:"3px 8px",animation:"blink 2s infinite"}},"⚠ write-up"),
      React.createElement("div",{onClick:()=>db.auth.signOut(),style:{fontSize:9,color:C.sub,cursor:"pointer",border:`1px solid ${C.border}`,borderRadius:5,padding:"4px 9px"}},
        React.createElement("span",null,"↩")
      )
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
  return React.createElement("nav",{style:{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:"rgba(8,9,14,.96)",backdropFilter:"blur(16px)",borderTop:`1px solid ${C.border}`}},
    React.createElement("div",{style:{maxWidth:480,margin:"0 auto",display:"flex",padding:"8px 0 14px"}},
      tabs.map(t=>{
        const on=screen===t.id, badge=t.id==="wups"&&wuMissed;
        return React.createElement("button",{key:t.id,onClick:()=>setScreen(t.id),style:{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:on?C.cyan:C.sub,fontFamily:F,position:"relative",padding:"2px 0"}},
          React.createElement("span",{style:{fontSize:15,lineHeight:1}},t.icon),
          React.createElement("span",{style:{fontSize:7,letterSpacing:1}},t.label),
          on && React.createElement("div",{style:{position:"absolute",bottom:-2,width:14,height:1.5,background:C.cyan,borderRadius:1}}),
          badge && React.createElement("div",{style:{position:"absolute",top:0,right:"18%",width:5,height:5,borderRadius:"50%",background:C.red}})
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
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px",marginBottom:20}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12}},
        React.createElement("div",{style:{fontSize:22,color:ctx.ph.color}},ctx.ph.icon),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{fontSize:9,color:ctx.ph.color,letterSpacing:1.5,marginBottom:3}},`${ctx.ph.months.toUpperCase()} · ${ctx.ph.earn}`),
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text}},ctx.ph.title),
          React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},ctx.ph.split)
        ),
        React.createElement("button",{onClick:()=>ctx.setScreen("phase"),style:{background:"none",border:`1px solid ${C.border}`,color:C.sub,borderRadius:6,padding:"5px 10px",fontSize:9,cursor:"pointer",fontFamily:F,letterSpacing:1}},"CHANGE")
      )
    ),
    // Stats
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}},
      React.createElement(Stat,{n:`${done}/${tdT.length}`,label:"আজকের tasks",color:done===tdT.length&&tdT.length>0?C.green:C.cyan}),
      React.createElement(Stat,{n:`${wkDone}/${wkAll.length}`,label:"এই সপ্তাহ",color:C.sub}),
      React.createElement(Stat,{n:`${tdWU}/2`,label:"write-ups",color:tdWU>=2?C.green:C.red})
    ),
    // Write-up alert
    ctx.wuMissed && React.createElement("div",{onClick:()=>ctx.setScreen("wups"),style:{background:C.surface,border:`1px solid ${C.red}22`,borderRadius:10,padding:"14px 16px",marginBottom:20,cursor:"pointer"}},
      React.createElement("div",{style:{fontSize:11,color:C.red,marginBottom:4}},"⚠  আজকের write-up বাকি"),
      React.createElement("div",{style:{fontSize:11,color:C.sub,lineHeight:1.6}},`${tdWU}টা পড়েছো · আরো ${2-tdWU}টা বাকি। Tap করো →`)
    ),
    // Today tasks
    React.createElement(Section,{label:"আজকের Tasks"},
      tdT.length===0
        ? React.createElement(Empty,{msg:"কোনো task নেই।",cta:"Plan করো",onCta:()=>ctx.setScreen("plan")})
        : React.createElement(React.Fragment,null,
            tdT.slice(0,5).map(t=>React.createElement("div",{key:t.id,style:{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.line}`}},
              React.createElement("div",{style:{width:6,height:6,borderRadius:"50%",background:t.done?C.green:t.missed?C.red:C.border,flexShrink:0}}),
              React.createElement("div",{style:{flex:1,fontSize:12,color:t.done?C.sub:C.text,textDecoration:t.done?"line-through":"none",lineHeight:1.4}},t.text),
              React.createElement("div",{style:{fontSize:10,color:C.sub}},`${t.hours}h`)
            )),
            React.createElement("button",{onClick:()=>ctx.setScreen("checkin"),style:gBtn(C.cyan)},"Check-in করো →")
          )
    ),
    // Suggested
    React.createElement(Section,{label:`Phase ${ctx.ph.n} — এখন যা করতে হবে`},
      ctx.ph.tasks.slice(0,4).map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.sub,padding:"8px 0",borderBottom:`1px solid ${C.line}`,lineHeight:1.5}},
        React.createElement("span",{style:{color:ctx.ph.color,marginRight:8}},"›"),t
      )),
      React.createElement("button",{onClick:()=>ctx.setScreen("plan"),style:gBtn(ctx.ph.color)},"Plan এ add করো →")
    )
  );
}

// ═══════════════════════════════════════════
// PHASE SELECT
// ═══════════════════════════════════════════
function PhaseSet({ctx}){
  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,"Phase"),
    PHASES.map(ph=>React.createElement("div",{key:ph.id,className:"row",onClick:()=>{ctx.savePhase(ph.id);ctx.flash("Phase updated");ctx.setScreen("home");},
      style:{background:ctx.phase===ph.id?C.surface:C.bg,border:`1px solid ${ctx.phase===ph.id?ph.color+"44":C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:8,cursor:"pointer",display:"flex",gap:14,alignItems:"center"}},
      React.createElement("div",{style:{width:32,height:32,borderRadius:7,background:ph.color+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:ph.color,flexShrink:0}},ph.icon),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:9,color:ph.color,letterSpacing:1.5,marginBottom:3}},`${ph.months.toUpperCase()} · ${ph.earn}`),
        React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text}},ph.title),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},ph.split)
      ),
      ctx.phase===ph.id && React.createElement("span",{style:{color:ph.color,fontSize:14}},"✓")
    ))
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

  const add=async()=>{
    if(!text.trim()) return ctx.flash("Task লিখো","err");
    setSaving(true);
    await ctx.addTask(sel,text.trim(),parseFloat(hours)||1);
    setText(""); setHours("1"); setSaving(false);
  };

  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,"Weekly Plan"),
    // Day tabs
    React.createElement("div",{style:{display:"flex",gap:4,marginBottom:20,overflowX:"auto",paddingBottom:2}},
      days.map(d=>{
        const on=d===sel, isT=d===td, cnt=(ctx.plan[d]||[]).length;
        return React.createElement("button",{key:d,onClick:()=>setSel(d),style:{flexShrink:0,minWidth:48,background:on?C.surface:C.bg,border:`1px solid ${on?C.cyan:isT?C.cyan+"33":C.border}`,borderRadius:8,padding:"8px 6px",cursor:"pointer",textAlign:"center",fontFamily:F}},
          React.createElement("div",{style:{fontSize:8,color:on?C.cyan:C.sub,letterSpacing:1}},dayOf(d)),
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:on?C.cyan:C.text,marginTop:3}},fmt(d).split(" ")[0]),
          cnt>0 && React.createElement("div",{style:{fontSize:8,color:C.sub,marginTop:2}},cnt)
        );
      })
    ),
    // Add task
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:14}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},`${dayOf(sel).toUpperCase()} ${fmt(sel)} — NEW TASK`),
      React.createElement("input",{value:text,onChange:e=>setText(e.target.value),onKeyDown:e=>e.key==="Enter"&&add(),placeholder:"Task লিখো…",style:{...inp,marginBottom:8}}),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
          React.createElement("span",{style:{fontSize:10,color:C.sub}},"h:"),
          React.createElement("input",{type:"number",min:"0.5",max:"12",step:"0.5",value:hours,onChange:e=>setHours(e.target.value),style:{...inp,width:56}})
        ),
        React.createElement("button",{onClick:add,disabled:saving,style:{flex:1,background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:7,padding:"9px",fontSize:11,cursor:"pointer",fontFamily:F,opacity:saving?.6:1}},saving?"...":"+ Add"),
        React.createElement("button",{onClick:()=>setShowSug(s=>!s),style:{background:C.surface,border:`1px solid ${C.border}`,color:C.sub,borderRadius:7,padding:"9px 12px",fontSize:11,cursor:"pointer",fontFamily:F}},showSug?"✕":"Suggest")
      )
    ),
    // Suggestions
    showSug && React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:14}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},`PHASE ${ctx.ph.n} — SUGGESTED`),
      ctx.ph.tasks.map((t,i)=>React.createElement("div",{key:i,className:"row",onClick:async()=>{await ctx.addTask(sel,t,1);setShowSug(false);},
        style:{fontSize:11,color:C.sub,padding:"9px 0",borderBottom:`1px solid ${C.line}`,cursor:"pointer",display:"flex",gap:8,lineHeight:1.5}},
        React.createElement("span",{style:{color:ctx.ph.color}},"+"," "),t
      ))
    ),
    // Task list
    React.createElement(Section,{label:`${dayOf(sel)} — ${tasks.length} tasks · ${totalH}h`},
      tasks.length===0
        ? React.createElement(Empty,{msg:"এই দিনে কোনো task নেই।"})
        : React.createElement(React.Fragment,null,
            tasks.map(t=>React.createElement("div",{key:t.id,style:{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.line}`}},
              React.createElement("div",{style:{flex:1}},
                React.createElement("div",{style:{fontSize:12,color:C.text,lineHeight:1.4}},t.text),
                React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},`${t.hours} ঘণ্টা`)
              ),
              React.createElement("button",{onClick:()=>ctx.deleteTask(sel,t.id),style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:14,padding:"0 4px"}},"\u2715")
            )),
            React.createElement("div",{style:{paddingTop:10,display:"flex",justifyContent:"space-between",fontSize:10,color:C.sub}},
              React.createElement("span",null,`মোট ${totalH}h`),
              React.createElement("span",{style:{color:totalH>=6?C.green:C.orange}},totalH>=6?"✓ 6h met":`${(6-totalH).toFixed(1)}h আরো`)
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
  const r=26, circ=2*Math.PI*r;
  const toggle=async(t,field)=>{
    const f=field==="done"?{done:!t.done,missed:!t.done?false:t.missed}:{missed:!t.missed};
    await ctx.updateTask(td,t.id,f);
  };
  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,`Today · ${fmt(td)}`),
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 16px",marginBottom:20,display:"flex",gap:16,alignItems:"center"}},
      React.createElement("div",{style:{position:"relative",width:64,height:64,flexShrink:0}},
        React.createElement("svg",{width:"64",height:"64",viewBox:"0 0 64 64"},
          React.createElement("circle",{cx:"32",cy:"32",r:r,fill:"none",stroke:C.border,strokeWidth:"4"}),
          React.createElement("circle",{cx:"32",cy:"32",r:r,fill:"none",stroke:pct===100?C.green:C.cyan,strokeWidth:"4",strokeDasharray:circ,strokeDashoffset:circ*(1-pct/100),strokeLinecap:"round",transform:"rotate(-90 32 32)",style:{transition:"stroke-dashoffset .5s"}})
        ),
        React.createElement("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:pct===100?C.green:C.cyan}},`${pct}%`)
      ),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{display:"flex",gap:14,marginBottom:8}},
          React.createElement("span",{style:{fontSize:11,color:C.green}},`✓ ${done}`),
          React.createElement("span",{style:{fontSize:11,color:C.red}},`✕ ${miss}`),
          React.createElement("span",{style:{fontSize:11,color:C.sub}},`${tasks.length-done-miss} left`)
        ),
        React.createElement("div",{style:{fontSize:11,color:C.sub}},`${hrs}h completed`),
        ctx.wuMissed && React.createElement("div",{style:{fontSize:10,color:C.red,marginTop:6}},`⚠ write-up ${ctx.todayWU.length}/2 বাকি`)
      )
    ),
    tasks.length===0
      ? React.createElement(Empty,{msg:"আজকের task নেই।",cta:"Plan করো",onCta:()=>ctx.setScreen("plan")})
      : tasks.map(t=>React.createElement("div",{key:t.id,style:{background:C.surface,border:`1px solid ${t.done?C.green+"33":t.missed?C.red+"33":C.border}`,borderRadius:10,padding:"13px 14px",marginBottom:8,display:"flex",gap:12,alignItems:"center"}},
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{fontSize:12,color:t.done?C.sub:C.text,textDecoration:t.done?"line-through":"none",lineHeight:1.5}},t.text),
            React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:3}},`${t.hours}h`)
          ),
          React.createElement("div",{style:{display:"flex",gap:6}},
            React.createElement("button",{onClick:()=>toggle(t,"done"),style:{width:32,height:32,borderRadius:7,border:`1.5px solid ${t.done?C.green:C.border}`,background:t.done?`${C.green}22`:"transparent",color:t.done?C.green:C.sub,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}},"✓"),
            React.createElement("button",{onClick:()=>toggle(t,"missed"),style:{width:32,height:32,borderRadius:7,border:`1.5px solid ${t.missed?C.red:C.border}`,background:t.missed?`${C.red}22`:"transparent",color:t.missed?C.red:C.sub,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}},"✕")
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
  const [editWU,setEditWU]=React.useState(null); // editing writeup id
  const [editForm,setEditForm]=React.useState({title:"",platform:"HackerOne",url:"",notes:""});
  const setE=(k,v)=>setEditForm(p=>({...p,[k]:v}));
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const PLATS=["HackerOne","Bugcrowd","Intigriti","Synack","Other"];
  const td=tod();
  const tdCnt=ctx.todayWU.length;
  const days=week7();
  const streak=(()=>{let s=0,d=new Date();for(let i=0;i<60;i++){const k=d.toISOString().split("T")[0];if(ctx.writeups.filter(w=>w.date===k).length>=2){s++;d.setDate(d.getDate()-1);}else break;}return s;})();
  const filtered=ctx.writeups.filter(w=>(filter==="all"||w.platform===filter)&&(!search||(w.title+(w.notes||"")+w.platform).toLowerCase().includes(search.toLowerCase())));
  const pc={HackerOne:C.red,Bugcrowd:C.orange,Intigriti:"#6ea8fe",Synack:C.green};
  const add=async()=>{
    if(!form.title.trim()) return ctx.flash("Title লিখো","err");
    setSaving(true);
    await ctx.addWriteup({date:td,...form});
    setForm({title:"",platform:"HackerOne",url:"",notes:""});
    setOpen(false); setSaving(false);
  };
  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:20}},
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text}},"Write-ups"),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},"Daily minimum: 2")
      ),
      React.createElement("div",{style:{textAlign:"right"}},
        React.createElement("div",{style:{fontSize:18,fontWeight:600,color:C.cyan}},ctx.writeups.length),
        React.createElement("div",{style:{fontSize:9,color:C.sub}},"total")
      )
    ),
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${tdCnt>=2?C.green+"44":C.red+"22"}`,borderRadius:10,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:12}},
      React.createElement("div",{style:{fontSize:22}},tdCnt>=2?"✅":"⚠️"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:12,fontWeight:600,color:tdCnt>=2?C.green:C.red}},tdCnt>=2?"আজকের quota পূরণ!":`আজ ${tdCnt}/2`),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:3}},tdCnt<2?`আরো ${2-tdCnt}টা পড়তে হবে`:"Roadmap on track")
      ),
      React.createElement("div",{style:{textAlign:"right"}},
        React.createElement("div",{style:{fontSize:14,fontWeight:600,color:C.orange}},`${streak}d`),
        React.createElement("div",{style:{fontSize:9,color:C.sub}},"streak")
      )
    ),
    // Heatmap
    React.createElement("div",{style:{display:"flex",gap:5,marginBottom:20}},
      days.map(d=>{
        const n=ctx.writeups.filter(w=>w.date===d).length;
        const c=n===0?C.border:n>=2?C.green:C.orange;
        return React.createElement("div",{key:d,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}},
          React.createElement("div",{style:{width:"100%",aspectRatio:"1",borderRadius:5,background:n===0?C.surface:c+"22",border:`1.5px solid ${d===td?C.cyan:n===0?C.border:c+"66"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:600,color:n===0?C.sub:c}},n||"·"),
          React.createElement("div",{style:{fontSize:8,color:d===td?C.cyan:C.sub}},dayOf(d))
        );
      })
    ),
    React.createElement("button",{onClick:()=>setOpen(o=>!o),style:{width:"100%",marginBottom:12,background:open?C.surface:`${C.cyan}14`,border:`1px solid ${open?C.border:C.cyan+"55"}`,color:open?C.sub:C.cyan,borderRadius:9,padding:"11px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F,letterSpacing:1}},open?"✕  Close":"+ Log Write-up"),
    open && React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:14}},
      React.createElement("input",{placeholder:"Title / vulnerability type",style:{...inp,marginBottom:8},value:form.title,onChange:e=>set("title",e.target.value)}),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}},
        React.createElement("select",{style:inp,value:form.platform,onChange:e=>set("platform",e.target.value)},PLATS.map(p=>React.createElement("option",{key:p},p))),
        React.createElement("input",{placeholder:"URL",style:inp,value:form.url,onChange:e=>set("url",e.target.value)})
      ),
      React.createElement("textarea",{placeholder:"Key takeaway…",style:{...inp,minHeight:64,resize:"vertical",lineHeight:1.6},value:form.notes,onChange:e=>set("notes",e.target.value)}),
      React.createElement("button",{onClick:add,disabled:saving,style:{width:"100%",marginTop:10,background:`${C.cyan}14`,border:`1px solid ${C.cyan}55`,color:C.cyan,borderRadius:8,padding:"11px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F,opacity:saving?.6:1}},saving?"Saving...":"✓ Save")
    ),
    React.createElement("div",{style:{position:"relative",marginBottom:10}},
      React.createElement("span",{style:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.sub,fontSize:13,pointerEvents:"none"}},"⌕"),
      React.createElement("input",{placeholder:`Search ${ctx.writeups.length} write-ups…`,style:{...inp,paddingLeft:28},value:search,onChange:e=>setSearch(e.target.value)})
    ),
    React.createElement("div",{style:{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}},
      ["all",...PLATS].map(p=>React.createElement("button",{key:p,onClick:()=>setFilter(p),style:{background:filter===p?`${C.cyan}14`:"none",border:`1px solid ${filter===p?C.cyan+"55":C.border}`,color:filter===p?C.cyan:C.sub,borderRadius:5,padding:"4px 10px",fontSize:9,cursor:"pointer",fontFamily:F,letterSpacing:1}},p==="all"?`ALL (${ctx.writeups.length})`:p.toUpperCase()))
    ),
    filtered.length===0
      ? React.createElement(Empty,{msg:search?`"${search}" পাওয়া যায়নি`:"এখনো কোনো write-up নেই।"})
      : filtered.map((w,i)=>{
          const isExp=exp===w.id;
          return React.createElement("div",{key:w.id,style:{background:C.surface,border:`1px solid ${isExp?C.cyan+"44":C.border}`,borderRadius:10,marginBottom:7,overflow:"hidden",transition:"border .15s",animation:`up .15s ease ${Math.min(i,6)*15}ms both`}},
            React.createElement("div",{onClick:()=>setExp(isExp?null:w.id),style:{display:"flex",gap:10,padding:"12px 14px",alignItems:"center",cursor:"pointer"}},
              React.createElement("div",{style:{width:3,height:32,borderRadius:2,flexShrink:0,background:pc[w.platform]||C.sub}}),
              React.createElement("div",{style:{flex:1,minWidth:0}},
                React.createElement("div",{style:{fontSize:12,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},w.title),
                React.createElement("div",{style:{display:"flex",gap:8,marginTop:3}},
                  React.createElement("span",{style:{fontSize:9,color:pc[w.platform]||C.sub}},w.platform),
                  React.createElement("span",{style:{fontSize:9,color:C.sub}},"·  ",fmt(w.date)),
                  w.notes&&React.createElement("span",{style:{fontSize:9,color:C.sub}},"·  note")
                )
              ),
              React.createElement("span",{style:{color:C.sub,fontSize:10,transform:isExp?"rotate(180deg)":"none",transition:"transform .2s",flexShrink:0}},"▾")
            ),
            isExp && React.createElement("div",{style:{padding:"0 14px 14px 27px",borderTop:`1px solid ${C.line}`},onClick:e=>e.stopPropagation()},
              // Edit mode
              editWU===w.id
                ? React.createElement("div",{style:{paddingTop:12}},
                    React.createElement("input",{placeholder:"Title",style:{...inp,marginBottom:8},value:editForm.title,onChange:e=>setE("title",e.target.value)}),
                    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}},
                      React.createElement("select",{style:inp,value:editForm.platform,onChange:e=>setE("platform",e.target.value)},PLATS.map(p=>React.createElement("option",{key:p},p))),
                      React.createElement("input",{placeholder:"URL",style:inp,value:editForm.url,onChange:e=>setE("url",e.target.value)})
                    ),
                    React.createElement("textarea",{placeholder:"Notes…",style:{...inp,minHeight:80,resize:"vertical",lineHeight:1.6},value:editForm.notes,onChange:e=>setE("notes",e.target.value)}),
                    React.createElement("div",{style:{display:"flex",gap:8,marginTop:10}},
                      React.createElement("button",{onClick:async()=>{
                        await ctx.updateWriteup(w.id,{title:editForm.title,platform:editForm.platform,url:editForm.url,notes:editForm.notes});
                        setEditWU(null);
                      },style:{flex:1,background:`${C.green}14`,border:`1px solid ${C.green}44`,color:C.green,borderRadius:7,padding:"9px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:F}},"✓ Save"),
                      React.createElement("button",{onClick:()=>setEditWU(null),style:{background:"none",border:`1px solid ${C.border}`,color:C.sub,borderRadius:7,padding:"9px 14px",fontSize:11,cursor:"pointer",fontFamily:F}},"Cancel")
                    )
                  )
                : React.createElement(React.Fragment,null,
                    w.url&&React.createElement("a",{href:w.url,target:"_blank",rel:"noreferrer",style:{display:"inline-block",marginTop:10,fontSize:11,color:C.cyan,textDecoration:"none"}},`↗ ${w.url.length>40?w.url.slice(0,40)+"…":w.url}`),
                    w.notes&&React.createElement("div",{style:{fontSize:11,color:C.sub,marginTop:10,lineHeight:1.7,whiteSpace:"pre-wrap",borderLeft:`2px solid ${C.border}`,paddingLeft:10}},w.notes),
                    React.createElement("div",{style:{display:"flex",gap:8,marginTop:12}},
                      React.createElement("button",{onClick:()=>{setEditWU(w.id);setEditForm({title:w.title,platform:w.platform,url:w.url||"",notes:w.notes||""});},style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:6,padding:"6px 14px",fontSize:10,cursor:"pointer",fontFamily:F}},"✎ Edit"),
                      React.createElement("button",{onClick:()=>ctx.deleteWriteup(w.id),style:{background:"none",border:`1px solid ${C.red}22`,color:C.red,borderRadius:6,padding:"6px 12px",fontSize:10,cursor:"pointer",fontFamily:F}},"✕ Delete")
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

  // LIST
  if(view==="list") return React.createElement("div",{style:{animation:"up .2s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:20}},
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text}},"Bug Notes"),
        React.createElement("div",{style:{fontSize:10,color:C.sub,marginTop:2}},`${ctx.folders.length} folders · ${ctx.notes.length} notes`)
      ),
      React.createElement("button",{onClick:()=>setView("new-folder"),style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:7,padding:"7px 14px",fontSize:10,cursor:"pointer",fontFamily:F,letterSpacing:1}},"+ Folder")
    ),
    React.createElement("div",{style:{position:"relative",marginBottom:16}},
      React.createElement("span",{style:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.sub,fontSize:13,pointerEvents:"none"}},"⌕"),
      React.createElement("input",{placeholder:"সব note এ search করো…",style:{...inp,paddingLeft:28},value:search,onChange:e=>setSearch(e.target.value)})
    ),
    search.trim()
      ? React.createElement(React.Fragment,null,
          React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},`${searchResults.length} RESULTS`),
          searchResults.length===0
            ? React.createElement(Empty,{msg:`"${search}" পাওয়া যায়নি`})
            : searchResults.map(n=>{
                const f=ctx.folders.find(x=>x.id===n.folderId);
                const ft=FTYPES.find(t=>t.id===f?.type)||FTYPES[0];
                return React.createElement("div",{key:n.id,className:"row",onClick:()=>{setSelNote(n);setSelFolder(f);setView("note-view");},style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:7,cursor:"pointer"}},
                  React.createElement("div",{style:{fontSize:10,color:ft.color,marginBottom:4}},`${ft.icon} ${f?.name}`),
                  React.createElement("div",{style:{fontSize:12,fontWeight:500,color:C.text}},n.title),
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
                return React.createElement("div",{key:f.id,className:"row",onClick:()=>{setSelFolder(f);setView("folder");},style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"13px 14px",marginBottom:7,cursor:"pointer",display:"flex",alignItems:"center",gap:12}},
                  React.createElement("div",{style:{width:34,height:34,borderRadius:8,background:ft.color+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:ft.color,flexShrink:0}},ft.icon),
                  React.createElement("div",{style:{flex:1,minWidth:0}},
                    React.createElement("div",{style:{fontSize:12,fontWeight:500,color:C.text}},f.name),
                    React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:3}},`${cnt} notes · ${ft.label}`)
                  ),
                  React.createElement("span",{style:{color:C.sub,fontSize:12}},"›")
                );
              })
            );
          }),
          ctx.folders.length===0 && React.createElement(Empty,{msg:"কোনো folder নেই।",cta:"Folder বানাও",onCta:()=>setView("new-folder")})
        )
  );

  // NEW FOLDER
  if(view==="new-folder") return React.createElement(NewFolderView,{onBack:()=>setView("list"),onSave:async(name,type)=>{await ctx.addFolder(name,type);setView("list");}});

  // FOLDER DETAIL
  if(view==="folder"&&selFolder){
    const ft=FTYPES.find(t=>t.id===selFolder.type)||FTYPES[0];
    const fnotes=folderNotes(selFolder.id);
    const pinned=fnotes.filter(n=>n.pinned), rest=fnotes.filter(n=>!n.pinned);
    return React.createElement("div",{style:{animation:"up .2s ease"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:20}},
        React.createElement("button",{onClick:()=>setView("list"),style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20,padding:"0 4px",lineHeight:1}},"‹"),
        React.createElement("div",{style:{flex:1,minWidth:0}},
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
            React.createElement("span",{style:{color:ft.color,fontSize:14}},ft.icon),
            React.createElement("span",{style:{fontSize:13,fontWeight:600,color:C.text}},selFolder.name)
          ),
          React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:2}},`${fnotes.length} notes · ${ft.label}`)
        ),
        React.createElement("button",{onClick:()=>{setSelNote(null);setView("note-edit");},style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:7,padding:"7px 12px",fontSize:10,cursor:"pointer",fontFamily:F}},"+ Note")
      ),
      fnotes.length===0
        ? React.createElement(Empty,{msg:"এই folder এ কোনো note নেই।",cta:"Note লিখো",onCta:()=>{setSelNote(null);setView("note-edit");}})
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
      React.createElement("button",{onClick:async()=>{await ctx.deleteFolder(selFolder.id);setView("list");},style:{marginTop:20,background:"none",border:`1px solid ${C.red}22`,color:C.red,borderRadius:7,padding:"9px",fontSize:10,cursor:"pointer",fontFamily:F,width:"100%"}},"✕ Delete Folder")
    );
  }

  // NOTE VIEW
  if(view==="note-view"&&selNote){
    const n=ctx.notes.find(x=>x.id===selNote.id)||selNote;
    const ft=FTYPES.find(t=>t.id===selFolder?.type)||FTYPES[0];
    return React.createElement("div",{style:{animation:"up .2s ease"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:16}},
        React.createElement("button",{onClick:()=>setView("folder"),style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20,padding:"0 4px",lineHeight:1}},"‹"),
        React.createElement("div",{style:{flex:1,minWidth:0}},
          React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},n.title),
          React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:2}},`${n.updatedAt} · ${selFolder?.name}`)
        ),
        React.createElement("button",{onClick:()=>ctx.updateNote(n.id,{pinned:!n.pinned}),style:{background:"none",border:`1px solid ${C.border}`,color:n.pinned?C.orange:C.sub,borderRadius:6,padding:"5px 9px",fontSize:12,cursor:"pointer"}},n.pinned?"★":"☆"),
        React.createElement("button",{onClick:()=>{setSelNote(n);setView("note-edit");},style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}44`,color:C.cyan,borderRadius:6,padding:"5px 10px",fontSize:10,cursor:"pointer",fontFamily:F}},"Edit")
      ),
      (n.tags||[]).length>0&&React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}},
        n.tags.map(t=>React.createElement("span",{key:t,style:{background:ft.color+"14",border:`1px solid ${ft.color}33`,color:ft.color,borderRadius:4,fontSize:9,padding:"3px 8px",letterSpacing:1}},"#",t))
      ),
      React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px"}},
        React.createElement(NoteContent,{content:n.content})
      ),
      React.createElement("button",{onClick:async()=>{await ctx.deleteNote(n.id);setView("folder");},style:{marginTop:14,background:"none",border:`1px solid ${C.red}22`,color:C.red,borderRadius:7,padding:"9px",fontSize:10,cursor:"pointer",fontFamily:F,width:"100%"}},"✕ Delete Note")
    );
  }

  // NOTE EDIT
  if(view==="note-edit") return React.createElement(NoteEditorView,{note:selNote,folder:selFolder,onBack:()=>setView(selNote?"note-view":"folder"),
    onSave:async(title,content,tags)=>{
      if(selNote){ await ctx.updateNote(selNote.id,{title,content,tags}); setView("note-view"); }
      else{ const n=await ctx.addNote(selFolder.id,title,content,tags); if(n){setSelNote(n);setView("note-view");} }
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
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20,padding:"0 4px",lineHeight:1}},"‹"),
      React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text}},"New Folder")
    ),
    React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px",marginBottom:14}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:10}},"TYPE"),
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:16}},
        FTYPES.map(ft=>React.createElement("button",{key:ft.id,onClick:()=>setType(ft.id),style:{flex:1,background:type===ft.id?ft.color+"14":"none",border:`1px solid ${type===ft.id?ft.color+"55":C.border}`,color:type===ft.id?ft.color:C.sub,borderRadius:8,padding:"12px 8px",cursor:"pointer",fontFamily:F,display:"flex",flexDirection:"column",alignItems:"center",gap:6}},
          React.createElement("span",{style:{fontSize:20}},ft.icon),
          React.createElement("span",{style:{fontSize:9,letterSpacing:1}},ft.label.toUpperCase()),
          React.createElement("span",{style:{fontSize:9,color:C.sub}},ft.hint)
        ))
      ),
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:8}},"NAME"),
      React.createElement("input",{placeholder:FTYPES.find(t=>t.id===type)?.hint||"Name…",style:inp,value:name,onChange:e=>setName(e.target.value),onKeyDown:async e=>{if(e.key==="Enter"&&name.trim()){setSaving(true);await onSave(name.trim(),type);}}})
    ),
    React.createElement("button",{onClick:async()=>{if(!name.trim())return;setSaving(true);await onSave(name.trim(),type);},disabled:!name.trim()||saving,style:{width:"100%",background:name.trim()?`${C.cyan}14`:"none",border:`1px solid ${name.trim()?C.cyan+"55":C.border}`,color:name.trim()?C.cyan:C.sub,borderRadius:9,padding:"12px",fontSize:11,fontWeight:600,cursor:name.trim()?"pointer":"default",fontFamily:F,letterSpacing:1,opacity:saving?.6:1}},saving?"Creating...":"CREATE FOLDER →")
  );
}

function NoteRow({n,color,onClick}){
  return React.createElement("div",{className:"row",onClick,style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 14px",marginBottom:7,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}},
    React.createElement("div",{style:{flex:1,minWidth:0}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:4}},
        n.pinned&&React.createElement("span",{style:{color:C.orange,fontSize:10}},"★"),
        React.createElement("span",{style:{fontSize:12,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},n.title)
      ),
      React.createElement("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
        React.createElement("span",{style:{fontSize:9,color:C.sub}},n.updatedAt),
        (n.tags||[]).slice(0,3).map(t=>React.createElement("span",{key:t,style:{fontSize:9,color}},"#",t))
      )
    ),
    React.createElement("span",{style:{color:C.sub,fontSize:12,flexShrink:0}},"›")
  );
}

function NoteEditorView({note,folder,onBack,onSave}){
  const [title,setTitle]=React.useState(note?.title||"");
  const [content,setContent]=React.useState(note?.content||"");
  const [tags,setTags]=React.useState((note?.tags||[]).join(", "));
  const [saving,setSaving]=React.useState(false);
  const ft=FTYPES.find(t=>t.id===folder?.type)||FTYPES[0];
  const save=async()=>{ setSaving(true); await onSave(title.trim()||"Untitled",content,tags.split(",").map(t=>t.trim()).filter(Boolean)); };
  return React.createElement("div",{style:{animation:"up .2s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:20}},
      React.createElement("button",{onClick:onBack,style:{background:"none",border:"none",color:C.sub,cursor:"pointer",fontSize:20,padding:"0 4px",lineHeight:1}},"‹"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{fontSize:10,color:ft.color}},`${ft.icon} ${folder?.name}`)
      ),
      React.createElement("button",{onClick:save,disabled:saving,style:{background:`${C.cyan}14`,border:`1px solid ${C.cyan}55`,color:C.cyan,borderRadius:7,padding:"7px 14px",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:F,letterSpacing:1,opacity:saving?.6:1}},saving?"Saving...":"SAVE")
    ),
    React.createElement("input",{value:title,onChange:e=>setTitle(e.target.value),placeholder:"Title…",style:{...inp,fontSize:15,fontWeight:600,marginBottom:12,background:"none",border:"none",borderBottom:`1px solid ${C.border}`,borderRadius:0,padding:"0 0 12px"}}),
    React.createElement("div",{style:{marginBottom:12}},
      React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:6}},"TAGS"),
      React.createElement("input",{value:tags,onChange:e=>setTags(e.target.value),placeholder:"xss, idor, recon…",style:{...inp,fontSize:11}})
    ),
    React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:6}},"CONTENT"),
    React.createElement("div",{style:{fontSize:9,color:C.sub,marginBottom:8}},"Code লিখতে: ```code```"),
    React.createElement("textarea",{value:content,onChange:e=>setContent(e.target.value),placeholder:"Note লিখো…\n\n- Endpoint: /api/user/profile\n- Weird behavior: ID change করলে অন্যের data\n\n```\nGET /api/user/1337\nHost: target.com\n```",style:{...inp,minHeight:280,resize:"vertical",lineHeight:1.8,fontSize:12}})
  );
}

function NoteContent({content}){
  if(!content) return React.createElement("div",{style:{color:C.sub,fontSize:12}},"Content নেই।");
  const parts=content.split(/(```[\s\S]*?```)/g);
  return React.createElement("div",null,
    parts.map((p,i)=>{
      if(p.startsWith("```")&&p.endsWith("```")){
        const code=p.slice(3,-3).trim();
        return React.createElement("div",{key:i,style:{background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:"12px 14px",margin:"10px 0",overflowX:"auto"}},
          React.createElement("pre",{style:{margin:0,fontSize:11,color:C.cyan,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-all"}},code)
        );
      }
      return React.createElement("div",{key:i,style:{fontSize:12,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}},
        p.split("\n").map((line,j)=>{
          if(line.startsWith("- ")||line.startsWith("• "))
            return React.createElement("div",{key:j,style:{display:"flex",gap:8,marginBottom:4}},React.createElement("span",{style:{color:C.cyan,flexShrink:0}},"›"),React.createElement("span",null,line.slice(2)));
          if(/^\d+\.\s/.test(line))
            return React.createElement("div",{key:j,style:{display:"flex",gap:8,marginBottom:4}},React.createElement("span",{style:{color:C.cyan,flexShrink:0,minWidth:16}},line.match(/^\d+/)[0],"."),React.createElement("span",null,line.replace(/^\d+\.\s/,"")));
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
  const tHrs=tdT.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const tWU=ctx.todayWU.length;
  const wkAll=days.flatMap(d=>(ctx.plan[d]||[]).map(t=>({...t,date:d})));
  const wDone=wkAll.filter(t=>t.done).length, wMiss=wkAll.filter(t=>t.missed).length;
  const wHrs=wkAll.filter(t=>t.done).reduce((a,t)=>a+t.hours,0);
  const wWU=ctx.writeups.filter(w=>days.includes(w.date)).length;
  const mStart=td.slice(0,7)+"-01";
  const mWU=ctx.writeups.filter(w=>w.date>=mStart&&w.date<=td).length;
  return React.createElement("div",{style:{animation:"up .25s ease"}},
    React.createElement(PTitle,null,"Progress"),
    React.createElement("div",{style:{display:"flex",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:3,marginBottom:20}},
      [["today","আজ"],["week","সপ্তাহ"],["month","মাস"]].map(([k,l])=>React.createElement("button",{key:k,onClick:()=>setTab(k),style:{flex:1,background:tab===k?`${C.cyan}18`:"none",border:`1px solid ${tab===k?C.cyan+"44":"transparent"}`,color:tab===k?C.cyan:C.sub,borderRadius:6,padding:"8px",fontSize:10,cursor:"pointer",fontFamily:F,letterSpacing:1}},l.toUpperCase()))
    ),
    tab==="today"&&React.createElement(React.Fragment,null,
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:20}},
        React.createElement(Stat,{n:tDone,label:"done",color:C.green}),
        React.createElement(Stat,{n:tMiss,label:"missed",color:C.red}),
        React.createElement(Stat,{n:`${tHrs}h`,label:"hours",color:C.cyan}),
        React.createElement(Stat,{n:`${tWU}/2`,label:"w-ups",color:tWU>=2?C.green:C.red})
      ),
      tdT.length>0&&React.createElement(Section,{label:"Summary"},
        React.createElement(Bar,{done:tDone,total:tdT.length,color:C.cyan,label:"Tasks"}),
        React.createElement(Bar,{done:tHrs,total:8,color:C.orange,label:"Hours (target 8h)"}),
        React.createElement(Bar,{done:tWU,total:2,color:tWU>=2?C.green:C.red,label:"Write-ups"})
      ),
      tMiss>0&&React.createElement(Section,{label:"Missed"},
        tdT.filter(t=>t.missed).map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.red,padding:"7px 0",borderBottom:`1px solid ${C.line}`,display:"flex",gap:8}},React.createElement("span",null,"✕"),t.text)),
        React.createElement("div",{style:{fontSize:10,color:C.sub,paddingTop:8}},"এগুলো কাল plan এ রাখো।")
      )
    ),
    tab==="week"&&React.createElement(React.Fragment,null,
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}},
        React.createElement(Stat,{n:wDone,label:"done",color:C.green}),
        React.createElement(Stat,{n:`${wHrs}h`,label:"hours",color:C.cyan}),
        React.createElement(Stat,{n:`${wWU}/14`,label:"w-ups",color:wWU>=14?C.green:C.orange})
      ),
      React.createElement(Section,{label:"দিনগুলো"},
        React.createElement("div",{style:{display:"flex",gap:5}},
          days.map(d=>{
            const dt=ctx.plan[d]||[], dn=dt.filter(t=>t.done).length, tot=dt.length;
            const pct=tot>0?dn/tot:0;
            const c=tot===0?C.border:pct===1?C.green:pct>0.5?C.orange:C.red;
            return React.createElement("div",{key:d,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}},
              React.createElement("div",{style:{width:"100%",aspectRatio:"1",borderRadius:5,background:tot===0?C.surface:c+"22",border:`1.5px solid ${d===td?C.cyan:tot===0?C.border:c+"55"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,color:tot===0?C.sub:c}},tot===0?"·":`${dn}/${tot}`),
              React.createElement("div",{style:{fontSize:8,color:d===td?C.cyan:C.sub}},dayOf(d))
            );
          })
        )
      ),
      wMiss>0&&React.createElement(Section,{label:`⚠ ${wMiss} missed`},
        wkAll.filter(t=>t.missed).slice(0,5).map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.sub,padding:"7px 0",borderBottom:`1px solid ${C.line}`,display:"flex",gap:10}},
          React.createElement("span",{style:{color:C.sub,fontSize:9,flexShrink:0}},fmt(t.date)),
          React.createElement("span",{style:{color:C.red}},"✕"),
          React.createElement("span",null,t.text)
        ))
      )
    ),
    tab==="month"&&React.createElement(React.Fragment,null,
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}},
        React.createElement(Stat,{n:mWU,label:"write-ups",color:C.cyan}),
        React.createElement(Stat,{n:ctx.notes.length,label:"notes",color:C.sub})
      ),
      React.createElement(Section,{label:"Current Phase"},
        React.createElement("div",{style:{fontSize:9,color:ctx.ph.color,letterSpacing:1.5,marginBottom:8}},`${ctx.ph.months.toUpperCase()} · ${ctx.ph.earn}`),
        React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text,marginBottom:12}},ctx.ph.title),
        ctx.ph.tasks.map((t,i)=>React.createElement("div",{key:i,style:{fontSize:11,color:C.sub,padding:"7px 0",borderBottom:`1px solid ${C.line}`,lineHeight:1.5}},
          React.createElement("span",{style:{color:ctx.ph.color,marginRight:8}},"›"),t
        ))
      )
    )
  );
}

// ═══════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════
function Section({label,children}){
  return React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:14}},
    label&&React.createElement("div",{style:{fontSize:9,color:C.sub,letterSpacing:2,marginBottom:12}},label.toUpperCase()),
    children
  );
}
function PTitle({children}){
  return React.createElement("div",{style:{fontSize:13,fontWeight:600,color:C.text,marginBottom:20,letterSpacing:1}},children);
}
function Stat({n,label,color}){
  return React.createElement("div",{style:{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 8px",textAlign:"center"}},
    React.createElement("div",{style:{fontSize:18,fontWeight:600,color:color||C.cyan,lineHeight:1}},n),
    React.createElement("div",{style:{fontSize:9,color:C.sub,marginTop:5,letterSpacing:1}},label.toUpperCase())
  );
}
function Bar({done,total,color,label}){
  const pct=total>0?Math.min(100,Math.round((done/total)*100)):0;
  return React.createElement("div",{style:{marginBottom:12}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:5}},
      React.createElement("span",{style:{fontSize:10,color:C.sub}},label),
      React.createElement("span",{style:{fontSize:10,color}},`${pct}%`)
    ),
    React.createElement("div",{style:{height:4,background:C.border,borderRadius:2,overflow:"hidden"}},
      React.createElement("div",{style:{width:`${pct}%`,height:"100%",background:color,borderRadius:2,transition:"width .5s ease"}})
    )
  );
}
function Empty({msg,cta,onCta}){
  return React.createElement("div",{style:{textAlign:"center",padding:"24px 0"}},
    React.createElement("div",{style:{fontSize:20,color:C.sub,marginBottom:8}},"◎"),
    React.createElement("div",{style:{fontSize:11,color:C.sub,marginBottom:12,lineHeight:1.6}},msg),
    cta&&onCta&&React.createElement("button",{onClick:onCta,style:{background:"none",border:`1px solid ${C.border}`,color:C.sub,borderRadius:6,padding:"7px 16px",fontSize:10,cursor:"pointer",fontFamily:F,letterSpacing:1}},cta)
  );
}
function Toast({msg,err}){
  const c=err?C.red:C.green;
  return React.createElement("div",{style:{position:"fixed",top:64,left:"50%",transform:"translateX(-50%)",background:C.surface,border:`1px solid ${c}55`,color:c,padding:"9px 18px",borderRadius:8,fontSize:11,zIndex:99,whiteSpace:"nowrap",boxShadow:`0 4px 20px ${c}18`}},msg);
}
function gBtn(color){ return{background:"none",border:`1px solid ${color}33`,color,borderRadius:7,padding:"9px 16px",fontSize:10,cursor:"pointer",fontFamily:F,marginTop:12,width:"100%",letterSpacing:1,display:"block"}; }
const inp={background:C.card,border:`1px solid ${C.border}`,color:C.text,borderRadius:7,padding:"10px 12px",fontSize:12,width:"100%",outline:"none",lineHeight:1.5};

// ═══════════════════════════════════════════
// MOUNT
// ═══════════════════════════════════════════
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
