const KEY = "dalva_ai_cloudflare_v07";
const LEGACY_KEYS = ["evolve_ai_cloudflare_v04","evolve_ai_cloudflare_v06","evolve_ai_cloudflare_v05"];
const $ = (id) => document.getElementById(id);
const views = ["chat","memory","evolution","settings"];
let generating = false;
let evolving = false;

const defaultState = () => ({
  version: 7,
  activeConversationId: null,
  conversations: [],
  memories: [],
  rules: [
    {id: crypto.randomUUID(), text:"Responda de forma natural, direta e útil. Aprofunde quando a complexidade exigir.", reason:"Princípio inicial", createdAt:new Date().toISOString()},
    {id: crypto.randomUUID(), text:"Para fatos atuais ou verificáveis, cruze fontes independentes e priorize fontes primárias/oficiais quando existirem.", reason:"Pesquisa", createdAt:new Date().toISOString()},
    {id: crypto.randomUUID(), text:"Nunca invente fonte, citação, dado atual ou acesso que não ocorreu.", reason:"Integridade", createdAt:new Date().toISOString()},
    {id: crypto.randomUUID(), text:"Não apenas resuma resultados: conecte evidências, explique implicações e diferencie fatos de inferências.", reason:"Síntese", createdAt:new Date().toISOString()}
  ],
  evolution: [],
  settings: {web:true, autoEvolve:true, evolveEvery:4, theme:"light"},
  counters: {userQuestions:0}
});

function loadState(){
  try{
    const own=localStorage.getItem(KEY);if(own){const raw=JSON.parse(own);return {...defaultState(),...raw,version:7,settings:{...defaultState().settings,...(raw.settings||{})}};}
    for(const k of LEGACY_KEYS){const old=localStorage.getItem(k);if(old){const raw=JSON.parse(old);const migrated={...defaultState(),...raw,version:7,settings:{...defaultState().settings,...(raw.settings||{})}};localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;}}
  }catch{}
  return defaultState();
}
let state=loadState();
if(!state.conversations?.length)createConversation(false);
if(!state.activeConversationId)state.activeConversationId=state.conversations[0].id;
applyTheme();

function save(){localStorage.setItem(KEY,JSON.stringify(state));renderSidebar();renderPanels();}
function activeConversation(){return state.conversations.find(c=>c.id===state.activeConversationId)||state.conversations[0];}
function createConversation(render=true){const c={id:crypto.randomUUID(),title:"Nova conversa",createdAt:new Date().toISOString(),messages:[]};state.conversations.unshift(c);state.activeConversationId=c.id;if(render){save();renderChat();showView("chat");requestAnimationFrame(()=>$('promptInput')?.focus());}return c;}
function setTitleFromMessage(c,text){if(c.title==="Nova conversa")c.title=text.replace(/\s+/g," ").slice(0,44)+(text.length>44?"…":"");}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function safeUrl(u=""){try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:"#";}catch{return"#";}}
function richText(text=""){
  let x=esc(text);
  x=x.replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>");
  x=x.replace(/`([^`]+)`/g,"<code>$1</code>");
  x=x.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  x=x.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>");
  x=x.replace(/^[-•] (.+)$/gm,"<li>$1</li>");
  x=x.replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g,m=>`<ul>${m}</ul>`);
  return x.split(/\n{2,}/).map(p=>/^<(pre|ul|h2|h3)/.test(p)?p:`<p>${p.replace(/\n/g,"<br>")}</p>`).join("");
}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}
function applyTheme(){document.documentElement.dataset.theme=state.settings.theme==="dark"?"dark":"light";}
function showLoading(on,text="",pct=0){$("loadingBar").classList.toggle("hidden",!on);$("loadingText").textContent=text;$("loadingFill").style.width=pct+"%";}
function closeSidebar(){$("sidebar").classList.remove("open");}
function ensureComposer(){const wrap=$("composerWrap");if(wrap){wrap.classList.remove("hidden");wrap.style.display="";}requestAnimationFrame(()=>$("promptInput")?.focus({preventScroll:true}));}

function renderSidebar(){
  $("conversationList").innerHTML=state.conversations.map(c=>`<button class="conversation-btn ${c.id===state.activeConversationId?"active":""}" data-id="${c.id}">${esc(c.title)}</button>`).join("");
  document.querySelectorAll(".conversation-btn").forEach(b=>b.onclick=()=>{state.activeConversationId=b.dataset.id;save();renderChat();showView("chat");closeSidebar();ensureComposer();});
}
function renderChat(){
  const c=activeConversation(),box=$("messages");
  $("emptyState").classList.toggle("hidden",!!c.messages.length);
  box.innerHTML=c.messages.map((m,i)=>{
    const src=(m.sources||[]).length?`<div class="sources">${m.sources.slice(0,10).map((s,n)=>`<a class="source-card" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer"><b>[${n+1}] ${esc(s.title||s.url)}</b><span>${esc(s.domain||s.provider||"")}${s.provider?` · ${esc(s.provider)}`:""}${s.publishedAt?` · ${esc(String(s.publishedAt).slice(0,24))}`:""}</span></a>`).join("")}</div>`:"";
    const research=m.role==="assistant"&&m.research?`<div class="research-meta"><span>◎ ${m.research.sources||0} fontes</span><span>${m.research.domains||0} domínios</span><span>${m.research.depth==="profunda"?"Pesquisa profunda":"Pesquisa web"}</span>${m.research.quality?`<span>evidência ${esc(m.research.quality)}</span>`:""}${m.research.verified?"<span>✓ revisada</span>":""}</div>`:"";
    const feedback=m.role==="assistant"?`<div class="message-meta"><button class="mini-btn ${m.feedback===1?"selected":""}" data-feedback="1" data-index="${i}">👍</button><button class="mini-btn ${m.feedback===-1?"selected":""}" data-feedback="-1" data-index="${i}">👎</button><button class="mini-btn" data-copy="${i}">Copiar</button></div>`:"";
    return `<article class="message"><div class="avatar ${m.role==="assistant"?"ai":""}">${m.role==="assistant"?"D":"V"}</div><div class="message-content">${richText(m.content)}${research}${src}${feedback}</div></article>`;
  }).join("");
  box.querySelectorAll("[data-feedback]").forEach(b=>b.onclick=()=>feedback(+b.dataset.index,+b.dataset.feedback));
  box.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(c.messages[+b.dataset.copy].content);toast("Resposta copiada");});
  requestAnimationFrame(()=>{box.scrollTop=box.scrollHeight;ensureComposer();});
  $("topTitle").textContent=c.title==="Nova conversa"?"Dalva.ai":c.title;
}
function feedback(index,value){const m=activeConversation().messages[index];if(!m)return;m.feedback=value;if(value===1){state.memories.unshift({id:crypto.randomUUID(),type:"resposta aprovada",text:m.content.slice(0,900),createdAt:new Date().toISOString()});state.memories=state.memories.slice(0,80);}save();renderChat();}
function showView(name){views.forEach(v=>{$(v+"View").classList.toggle("active",v===name);document.querySelector(`[data-view="${v}"]`)?.classList.toggle("active",v===name);});if(name!=="chat")$("topTitle").textContent={memory:"Memória",evolution:"Evolução",settings:"Configurações"}[name];else ensureComposer();renderPanels();}
function renderPanels(){
  $("memoryMetrics").innerHTML=`<div class="metric"><span>Memórias</span><b>${state.memories.length}</b></div><div class="metric"><span>Princípios</span><b>${state.rules.length}</b></div><div class="metric"><span>Ciclos</span><b>${state.evolution.length}</b></div>`;
  $("memoryList").innerHTML=state.memories.length?state.memories.map(m=>`<div class="card-item"><div class="card-top"><b>${esc(m.type||"memória")}</b><span>${new Date(m.createdAt).toLocaleDateString("pt-BR")}</span></div><p>${esc(m.text)}</p></div>`).join(""):`<div class="card-item"><p>Nenhuma memória aprendida ainda. Use a Dalva.ai e avalie respostas para começar.</p></div>`;
  $("rulesList").innerHTML=state.rules.map((r,i)=>`<div class="card-item"><div class="card-top"><b>Princípio ${i+1}</b><span>${esc(r.reason||"")}</span></div><p>${esc(r.text)}</p></div>`).join("");
  $("evolutionLog").innerHTML=state.evolution.length?state.evolution.map(e=>`<div class="card-item"><div class="card-top"><b>Ciclo ${e.cycle}</b><span>${new Date(e.createdAt).toLocaleString("pt-BR")}</span></div><p>${esc(e.summary)}</p></div>`).join(""):`<div class="card-item"><p>Nenhum ciclo executado ainda.</p></div>`;
  $("webSetting").checked=true;$("evolveSetting").checked=!!state.settings.autoEvolve;$("evolveEvery").value=String(state.settings.evolveEvery||4);
}
function syncSettings(){state.settings.web=true;$("webToggle").classList.add("active");$("webToggle").innerHTML="<span>◎</span> Web auto";$("webIndicator").textContent="◎ Pesquisa inteligente e multi-fonte";$("webSetting").checked=true;$("webSetting").disabled=true;}
function autoGrow(el){el.style.height="auto";el.style.height=Math.min(el.scrollHeight,180)+"px";}

async function api(path,body){const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),70000);try{const r=await fetch(path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body),signal:ctrl.signal});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`Erro ${r.status}`);return data;}finally{clearTimeout(timer);}}
async function checkHealth(){try{const r=await fetch("/api/health",{cache:"no-store"});if(!r.ok)throw 0;const j=await r.json();$("modelDot").className="status-dot ready";$("modelStatus").textContent="Dalva.ai online";$("modelSub").textContent=j.model||"Cloudflare Workers AI";}catch{$("modelDot").className="status-dot";$("modelStatus").textContent="API indisponível";$("modelSub").textContent="Verifique o deploy";}}

async function sendMessage(prefill=null){
  if(generating)return;
  const input=$("promptInput"),text=(prefill??input.value).trim();if(!text)return;
  input.value="";autoGrow(input);generating=true;$("sendBtn").disabled=true;$("modelDot").className="status-dot busy";
  const c=activeConversation();c.messages.push({role:"user",content:text,createdAt:new Date().toISOString()});setTitleFromMessage(c,text);state.counters.userQuestions=(state.counters.userQuestions||0)+1;save();renderChat();ensureComposer();
  const stages=[
    setTimeout(()=>showLoading(true,"Buscando fontes independentes…",38),800),
    setTimeout(()=>showLoading(true,"Classificando fontes por relevância…",52),2100),
    setTimeout(()=>showLoading(true,"Lendo as páginas mais úteis…",66),3900),
    setTimeout(()=>showLoading(true,"Cruzando evidências…",78),6100),
    setTimeout(()=>showLoading(true,"Elaborando a resposta…",88),8500),
    setTimeout(()=>showLoading(true,"Revisando fatos e citações…",94),12000)
  ];
  try{
    showLoading(true,"Entendendo a pergunta…",18);
    const history=c.messages.slice(-16).map(m=>({role:m.role,content:m.content}));
    const data=await api("/api/chat",{messages:history,web:true,rules:state.rules.slice(-24),memories:state.memories.slice(0,12)});
    showLoading(true,"Finalizando…",98);
    c.messages.push({role:"assistant",content:data.answer||"Houve uma falha técnica temporária ao gerar a resposta.",sources:data.sources||[],warnings:data.warnings||[],research:data.research||null,model:data.model||"",createdAt:new Date().toISOString(),feedback:0});
    save();renderChat();ensureComposer();
    if(state.settings.autoEvolve&&state.counters.userQuestions%(state.settings.evolveEvery||4)===0)setTimeout(()=>evolve(false),500);
  }catch(e){
    c.messages.push({role:"assistant",content:`Ocorreu uma falha técnica nesta tentativa. ${e.message||e}\n\nTente enviar a mesma pergunta novamente; a Dalva.ai usará os mecanismos alternativos disponíveis.`,sources:[],createdAt:new Date().toISOString(),feedback:0});save();renderChat();ensureComposer();
  }finally{
    stages.forEach(clearTimeout);generating=false;$("sendBtn").disabled=false;showLoading(false);$("modelDot").className="status-dot ready";ensureComposer();
  }
}

async function evolve(manual=true){if(evolving||generating)return;evolving=true;try{if(manual)showLoading(true,"Analisando melhoria contínua…",35);const sample=state.conversations.flatMap(c=>c.messages.slice(-10)).slice(-30).map(m=>({role:m.role,content:m.content.slice(0,900),feedback:m.feedback||0}));const data=await api("/api/evolve",{interactions:sample,rules:state.rules.slice(-30)});if(data.rule&&!state.rules.some(x=>x.text.toLowerCase()===String(data.rule).toLowerCase()))state.rules.push({id:crypto.randomUUID(),text:String(data.rule).slice(0,700),reason:String(data.reason||"Autoevolução").slice(0,220),createdAt:new Date().toISOString()});if(data.memory){state.memories.unshift({id:crypto.randomUUID(),type:"memória aprendida",text:String(data.memory).slice(0,700),createdAt:new Date().toISOString()});state.memories=state.memories.slice(0,80);}state.evolution.unshift({id:crypto.randomUUID(),cycle:state.evolution.length+1,summary:String(data.summary||"Ciclo executado.").slice(0,500),createdAt:new Date().toISOString()});state.evolution=state.evolution.slice(0,80);save();renderPanels();if(manual)toast("Ciclo de evolução concluído");}catch(e){if(manual)toast(e.message||"Não foi possível evoluir agora");}finally{evolving=false;if(manual)showLoading(false);ensureComposer();}}
function exportState(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download=`dalva-ai-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}

$("newChatBtn").onclick=()=>createConversation();
$("sendBtn").onclick=()=>sendMessage();
$("promptInput").addEventListener("input",e=>autoGrow(e.target));
$("promptInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});
document.querySelectorAll(".suggestions button").forEach(b=>b.onclick=()=>sendMessage(b.dataset.prompt));
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{showView(b.dataset.view);closeSidebar();});
$("webToggle").onclick=()=>toast("A pesquisa web é automática quando agrega valor à resposta.");
$("evolveSetting").onchange=e=>{state.settings.autoEvolve=e.target.checked;save();};
$("evolveEvery").onchange=e=>{state.settings.evolveEvery=+e.target.value;save();};
$("evolveBtn").onclick=()=>evolve(true);
$("themeBtn").onclick=()=>{state.settings.theme=state.settings.theme==="dark"?"light":"dark";applyTheme();save();};
$("exportStateBtn").onclick=exportState;
$("importStateBtn").onclick=()=>$("importStateFile").click();
$("importStateFile").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());state={...defaultState(),...j,version:7,settings:{...defaultState().settings,...(j.settings||{})}};save();renderChat();syncSettings();toast("Estado importado");}catch{toast("Arquivo inválido");}};
$("resetBtn").onclick=()=>{if(confirm("Apagar conversas, memória e evolução deste navegador?")){localStorage.removeItem(KEY);location.reload();}};
$("openSidebar").onclick=()=>$("sidebar").classList.add("open");
$("closeSidebar").onclick=closeSidebar;
window.addEventListener("resize",ensureComposer);
window.addEventListener("pageshow",ensureComposer);
renderSidebar();renderChat();renderPanels();syncSettings();save();checkHealth();ensureComposer();
