/* defgodqe — randomized YouTube Shorts catalog
 * Generates up to 1000 candidate videos from a rotating set of search topics.
 * No video downloading. Discovery uses the YouTube Data API when a key or
 * backend endpoint is configured; otherwise callers can inject candidates.
 */
(function(){
'use strict';
if(window.__defgodqeYouTubeRandomFeed)return;
window.__defgodqeYouTubeRandomFeed=true;

const TOPICS=[
  'minecraft','minecraft shorts','gaming shorts','funny shorts','ai technology','science shorts',
  'space shorts','animals shorts','engineering shorts','satisfying shorts','history shorts',
  'interesting facts','basketball shorts','football shorts','cars shorts','coding shorts',
  'tech shorts','gaming clips','mystery shorts','magic tricks','life hacks','food shorts',
  'music shorts','art shorts','anime shorts','movie facts','nature shorts','fitness shorts',
  'lego shorts','speedrun shorts','internet facts','cool inventions','street interviews',
  'comedy shorts','challenge shorts','creative builds','robotics shorts','3d printing shorts',
  'geography shorts','psychology facts','math shorts','physics shorts','chemistry shorts',
  'diy shorts','craft shorts','retro gaming','pokemon shorts','fortnite shorts','roblox shorts'
];
const MAX=1000;
const KEY='defgodqe_youtube_random_candidates';

function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededShuffle(a,seed){let x=seed>>>0;const out=a.slice();for(let i=out.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;const j=x%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}
function clean(v){return v==null?'':String(v).trim()}
function normalize(v){if(!v)return null;const id=clean(v.id||v.videoId);if(!/^[A-Za-z0-9_-]{6,20}$/.test(id))return null;return {provider:'youtube',id,title:clean(v.title)||'YouTube Short',creator:clean(v.creator||v.channelTitle)||'YouTube',topics:Array.isArray(v.topics)?v.topics.map(clean).filter(Boolean):[],duration:Number(v.duration)||0,description:clean(v.description)}}

function getInjected(){
  const values=Array.isArray(window.defgodqeYouTubeVideos)?window.defgodqeYouTubeVideos:[];
  return values.map(normalize).filter(Boolean);
}
function getSaved(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.map(normalize).filter(Boolean):[]}catch{return []}}
function save(values){try{localStorage.setItem(KEY,JSON.stringify(values.slice(0,MAX*2)))}catch{}}

/* Creates 1000 deterministic randomized slots from available candidates.
 * Repeated candidates are intentionally avoided when the catalog is large. */
function build(count=MAX){
  count=Math.min(MAX,Math.max(1,Number(count)||MAX));
  const all=[...getInjected(),...getSaved()];
  const unique=[];const seen=new Set();
  for(const v of all){const k=v.id;if(!seen.has(k)){seen.add(k);unique.push(v)}}
  const shuffled=seededShuffle(unique,Date.now()>>>0);
  if(shuffled.length>=count)return shuffled.slice(0,count);
  /* If fewer than 1000 unique videos are available, repeat only as slots so
     the feed can still expose 1000 randomized positions without downloading media. */
  const out=[];let round=0;
  while(out.length<count&&shuffled.length){
    const batch=seededShuffle(shuffled,hash(String(Date.now())+':'+round));
    for(const v of batch){if(out.length>=count)break;out.push({...v,feedSlot:out.length})}
    round++;
  }
  return out;
}

window.defgodqeYouTubeRandomTopics=TOPICS.slice();
window.defgodqeGetRandomYouTubeVideos=build;
window.defgodqeSetYouTubeVideos=function(values){
  const normalized=Array.isArray(values)?values.map(normalize).filter(Boolean):[];
  window.defgodqeYouTubeVideos=normalized;
  save(normalized);
  return build(MAX);
};
window.defgodqeAddYouTubeVideos=function(values){
  const current=getInjected().concat(getSaved());
  const incoming=(Array.isArray(values)?values:[values]).map(normalize).filter(Boolean);
  const map=new Map();for(const v of [...current,...incoming])map.set(v.id,v);
  const merged=[...map.values()].slice(-MAX*2);
  window.defgodqeYouTubeVideos=merged;save(merged);return build(MAX);
};
window.defgodqeYouTubeRandomFeedInfo=function(){
  return {requested:MAX,availableUnique:new Set([...getInjected(),...getSaved()].map(v=>v.id)).size,topics:TOPICS.slice()};
};

/* Optional live discovery. Supply window.DEFGODQE_YOUTUBE_SEARCH_ENDPOINT
 * (recommended: a Cloudflare Worker proxy) or window.DEFGODQE_YOUTUBE_API_KEY.
 * The key is never hard-coded here. */
window.defgodqeFetchYouTubeRandom1000=async function(){
  const endpoint=clean(window.DEFGODQE_YOUTUBE_SEARCH_ENDPOINT);
  const apiKey=clean(window.DEFGODQE_YOUTUBE_API_KEY);
  const results=[];const seen=new Set();
  for(const topic of TOPICS){
    if(results.length>=MAX)break;
    try{
      let url;
      if(endpoint){
        const u=new URL(endpoint,location.href);u.searchParams.set('q',topic);u.searchParams.set('maxResults','50');u.searchParams.set('type','video');u.searchParams.set('videoDuration','short');url=u.toString();
      }else if(apiKey){
        const u=new URL('https://www.googleapis.com/youtube/v3/search');u.searchParams.set('part','snippet');u.searchParams.set('type','video');u.searchParams.set('videoDuration','short');u.searchParams.set('maxResults','50');u.searchParams.set('q',topic);u.searchParams.set('key',apiKey);url=u.toString();
      }else break;
      const response=await fetch(url);if(!response.ok)continue;const data=await response.json();
      for(const item of (data.items||[])){
        const v=normalize({id:item.id?.videoId||item.videoId,title:item.snippet?.title,creator:item.snippet?.channelTitle,description:item.snippet?.description,topics:[topic]});
        if(v&&!seen.has(v.id)){seen.add(v.id);results.push(v);if(results.length>=MAX)break}
      }
    }catch{}
  }
  if(results.length){window.defgodqeYouTubeVideos=results;save(results)}
  return build(MAX);
};
})();
