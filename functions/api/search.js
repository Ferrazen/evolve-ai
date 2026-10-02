const SEARX = [
  "https://search.anoni.net/search",
  "https://searx.oloke.xyz/search",
  "https://search.pereira.is/search"
];

function cleanHtml(s=""){return String(s).replace(/<[^>]+>/g," ").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();}
function domainOf(u){try{return new URL(u).hostname.replace(/^www\./,"");}catch{return "";}}
async function fetchWithTimeout(url, opts={}, ms=6500){const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),ms);try{return await fetch(url,{...opts,signal:ctrl.signal,headers:{"User-Agent":"EvolveAI/0.3 (+browser research)",...(opts.headers||{})}});}finally{clearTimeout(t);}}

async function searxSearch(q){
  for(const base of SEARX){
    try{
      const u=new URL(base);u.searchParams.set("q",q);u.searchParams.set("format","json");u.searchParams.set("language","all");u.searchParams.set("safesearch","1");
      const r=await fetchWithTimeout(u.toString(),{},5500);if(!r.ok)continue;const j=await r.json();
      const results=(j.results||[]).filter(x=>x.url&&x.title).slice(0,8).map(x=>({title:cleanHtml(x.title),url:x.url,snippet:cleanHtml(x.content||""),domain:domainOf(x.url),provider:"SearXNG"}));
      if(results.length>=3)return results;
    }catch{}
  }
  return [];
}
async function wikipedia(q){
  try{
    const u=new URL("https://pt.wikipedia.org/w/api.php");u.searchParams.set("action","query");u.searchParams.set("list","search");u.searchParams.set("srsearch",q);u.searchParams.set("utf8","1");u.searchParams.set("format","json");u.searchParams.set("origin","*");
    const r=await fetchWithTimeout(u.toString(),{},5000);const j=await r.json();return (j.query?.search||[]).slice(0,4).map(x=>({title:x.title,url:`https://pt.wikipedia.org/wiki/${encodeURIComponent(x.title.replace(/ /g,"_"))}`,snippet:cleanHtml(x.snippet),domain:"pt.wikipedia.org",provider:"Wikipedia"}));
  }catch{return []}
}
async function duck(q){
  try{
    const u=new URL("https://api.duckduckgo.com/");u.searchParams.set("q",q);u.searchParams.set("format","json");u.searchParams.set("no_html","1");u.searchParams.set("skip_disambig","1");u.searchParams.set("no_redirect","1");
    const r=await fetchWithTimeout(u.toString(),{},5000);const j=await r.json();const out=[];
    if(j.AbstractURL&&j.AbstractText)out.push({title:j.Heading||q,url:j.AbstractURL,snippet:j.AbstractText,domain:domainOf(j.AbstractURL),provider:"DuckDuckGo"});
    const walk=(arr)=>{for(const x of arr||[]){if(x.FirstURL&&x.Text)out.push({title:x.Text.split(" - ")[0].slice(0,140),url:x.FirstURL,snippet:x.Text,domain:domainOf(x.FirstURL),provider:"DuckDuckGo"});if(x.Topics)walk(x.Topics);if(out.length>=5)break;}};walk(j.RelatedTopics);return out.slice(0,5);
  }catch{return []}
}
async function gdelt(q){
  try{
    const u=new URL("https://api.gdeltproject.org/api/v2/doc/doc");u.searchParams.set("query",q);u.searchParams.set("mode","ArtList");u.searchParams.set("maxrecords","5");u.searchParams.set("format","json");u.searchParams.set("sort","HybridRel");
    const r=await fetchWithTimeout(u.toString(),{},6500);if(!r.ok)return[];const j=await r.json();return (j.articles||[]).slice(0,5).map(x=>({title:x.title||x.url,url:x.url,snippet:[x.seendate,x.domain].filter(Boolean).join(" · "),domain:x.domain||domainOf(x.url),provider:"GDELT"}));
  }catch{return []}
}
export async function onRequestGet(context){
  const q=new URL(context.request.url).searchParams.get("q")?.trim();
  if(!q)return Response.json({results:[],warnings:["Consulta vazia"]},{status:400});
  let results=await searxSearch(q);const warnings=[];
  if(!results.length){
    const [w,d,g]=await Promise.all([wikipedia(q),duck(q),gdelt(q)]);results=[...g,...d,...w];warnings.push("A metabusca principal não respondeu; foram usados provedores públicos de fallback.");
  }
  const seen=new Set();results=results.filter(x=>{const k=x.url?.split("#")[0];if(!k||seen.has(k))return false;seen.add(k);return true;}).slice(0,8);
  return Response.json({query:q,results,warnings,generatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, max-age=120","Access-Control-Allow-Origin":"*"}});
}
