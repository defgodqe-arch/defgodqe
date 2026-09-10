/* defgodqe — randomized YouTube Shorts catalog
 * Generates up to 1000 candidate videos from topics plus selected creator feeds.
 * No video downloading. Uses YouTube's embeddable videos and optional API discovery.
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

/* Creator feeds requested for the Doom Scroll. Actual uploads are discovered
 * through the official YouTube API when configured. */
const CREATOR_CHANNELS=[
  {handle:'SypherPK',name:'SypherPK',topics:['fortnite','gaming','gaming shorts']},
  {handle:'Mappelz',name:'Mappelz',topics:['gaming','gaming shorts']},
  {handle:'hxsain',name:'hxsain',topics:['gaming','gaming shorts','minecraft','funny shorts']},
  {handle:'HisYTStory',name:'HisYTStory',topics:['storytelling','history','interesting facts','shorts']}
];

const SEEDED_VIDEOS=[
  {id:'KLJu0lnoftE',title:'The #1 Most Satisfying Fortnite Short',creator:'SypherPK',topics:['fortnite','gaming','gaming shorts']},
  {id:'7gCytVbT714',title:'Worlds Most Satisfying Fortnite Short',creator:'SypherPK',topics:['fortnite','gaming','gaming shorts']},
  {id:'xF2LLLwpChI',title:'Best of Hxsain Shorts 2023',creator:'hxsain',topics:['gaming','gaming shorts','funny shorts']}
];

const MAX=1000;
const KEY='defgodqe_youtube_random_candidates';
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function seededShuffle(a,seed){let x=seed>>>0;const out=a.slice();for(let i=out.length-1;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;const j=x%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}
function clean(v){return v==null?'':String(v).trim()}
function normalize(v){if(!v)return null;const id=clean(v.id||v.videoId);if(!/^[A-Za-z0-9_-]{6,20}$/.test(id))return null;return {provider:'youtube',id,title:clean(v.title)||'YouTube Short',creator:clean(v.creator||v.channelTitle)||'YouTube',topics:Array.isArray(v.topics)?v.topics.map(clean).filter(Boolean):[],duration:Number(v.duration)||0,description:clean(v.description)}}
function getInjected(){const values=Array.isArray(window.defgodqeYouTubeVideos)?window.defgodqeYouTubeVideos:[];return values.map(normalize).filter(Boolean)}
function getSaved(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x.map(normalize).filter(Boolean):[]}catch{return []}}
function save(values){try{localStorage.setItem(KEY,JSON.stringify(values.slice(0,MAX*2)))}catch{}}
function unique(values){const map=new Map();for(const v of values){const n=normalize(v);if(n)map.set(n.id,n)}return [...map.values()]}

function build(count=MAX){
  count=Math.min(MAX,Math.max(1,Number(count)||MAX));
  const shuffled=seededShuffle(unique([...SEEDED_VIDEOS,...getInjected(),...getSaved()]),Date.now()>>>0);
  if(shuffled.length>=count)return shuffled.slice(0,count);
  const out=[];let round=0;
  while(out.length<count&&shuffled.length){
    const batch=seededShuffle(shuffled,hash(String(Date.now())+':'+round));
    for(const v of batch){if(out.length>=count)break;out.push({...v,feedSlot:out.length})}
    round++;
  }
  return out;
}

window.defgodqeYouTubeRandomTopics=TOPICS.slice();
window.defgodqeYouTubeCreatorChannels=CREATOR_CHANNELS.slice();
window.defgodqeGetRandomYouTubeVideos=build;
window.defgodqeSetYouTubeVideos=function(values){window.defgodqeYouTubeVideos=Array.isArray(values)?unique(values):[];save(window.defgodqeYouTubeVideos);return build(MAX)};
window.defgodqeAddYouTubeVideos=function(values){const merged=unique([...SEEDED_VIDEOS,...getInjected(),...getSaved(),...(Array.isArray(values)?values:[values])]);window.defgodqeYouTubeVideos=merged.slice(-MAX*2);save(window.defgodqeYouTubeVideos);return build(MAX)};
window.defgodqeYouTubeRandomFeedInfo=function(){return {requested:MAX,availableUnique:new Set(unique([...SEEDED_VIDEOS,...getInjected(),...getSaved()]).map(v=>v.id)).size,creatorChannels:CREATOR_CHANNELS.slice(),topics:TOPICS.slice()}};

/* Optional live discovery. Recommended: set a Cloudflare Worker endpoint in
 * window.DEFGODQE_YOUTUBE_SEARCH_ENDPOINT. It receives q, channelHandle,
 * maxResults, type=video and videoDuration=short. A YouTube API key can also
 * be used directly during testing, but never commit the key to GitHub. */
window.defgodqeFetchYouTubeRandom1000=async function(){
  const endpoint=clean(window.DEFGODQE_YOUTUBE_SEARCH_ENDPOINT);
  const apiKey=clean(window.DEFGODQE_YOUTUBE_API_KEY);
  const results=[];const seen=new Set();
  async function request(params){
    let url;
    if(endpoint){const u=new URL(endpoint,location.href);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));url=u.toString()}
    else if(apiKey){const u=new URL('https://www.googleapis.com/youtube/v3/search');u.searchParams.set('part','snippet');Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));u.searchParams.set('key',apiKey);url=u.toString()}
    else return null;
    try{const r=await fetch(url);return r.ok?await r.json():null}catch{return null}
  }
  /* First prioritize the requested creators. */
  for(const creator of CREATOR_CHANNELS){
    if(results.length>=MAX)break;
    const data=await request({q:creator.handle+' shorts',maxResults:'50',type:'video',videoDuration:'short',channelHandle:creator.handle});
    for(const item of (data?.items||[])){
      const v=normalize({id:item.id?.videoId||item.videoId,title:item.snippet?.title,creator:item.snippet?.channelTitle||creator.name,description:item.snippet?.description,topics:creator.topics});
      if(v&&!seen.has(v.id)){seen.add(v.id);results.push(v);if(results.length>=MAX)break}
    }
  }
  /* Then fill the rest with broad Shorts discovery. */
  for(const topic of TOPICS){
    if(results.length>=MAX)break;
    const data=await request({q:topic,maxResults:'50',type:'video',videoDuration:'short'});
    for(const item of (data?.items||[])){
      const v=normalize({id:item.id?.videoId||item.videoId,title:item.snippet?.title,creator:item.snippet?.channelTitle,description:item.snippet?.description,topics:[topic]});
      if(v&&!seen.has(v.id)){seen.add(v.id);results.push(v);if(results.length>=MAX)break}
    }
  }
  if(results.length){window.defgodqeYouTubeVideos=unique(results);save(results)}
  return build(MAX);
};
})();
