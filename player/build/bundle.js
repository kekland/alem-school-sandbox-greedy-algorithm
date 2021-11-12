(()=>{var t={196:(t,e,s)=>{var n=s(147),o="";t.exports=function(){0===o.length&&(o=function(t){var e=Buffer.alloc(256),s=Buffer.alloc(256),o=0,a=0,i=!1,r=process.stdin.fd,c=!1;try{r=n.openSync("/dev/stdin","rs+"),c=!0}catch(t){}for(;;){try{a=n.readSync(r,e,0,256,null);var l=Buffer.alloc(o+a);s.copy(l,0,0,o),e.copy(l,o,0,a),s=l,o+=a;for(var u=0;u<a;u++)if(e[u]===t){i=!0;break}if(i)break}catch(t){if("EOF"===t.code)break;if("EAGAIN"===t.code)continue;throw t}if(0===a)break}return c&&n.closeSync(r),s}("\n".charCodeAt(0)).toString("utf-8"));var t=o.search("\n")+1,e=o.slice(0,t);return o=o.slice(t),e.trim()}},601:(t,e)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Constants=void 0,e.Constants={coinPayoff:1,daggerPayoff:1.5,criticalDaggerPayoff:1e7,pathSafetyRelativeDangerScale:.25,pathSafetyRelativeDangerThreshold:3.5,pathSafetyDangerousMultiplier:.1,safetyPayoff:1e4,killPayoff:4,bonusPayoff:4,daggerLife:15,bonusLife:15,daggerEquippedLife:15,bonusEquippedLife:30,safetyThreshold:5,safetyIterationDepth:6,defaultVisibilityRadius:6}},836:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.actionListToString=e.actionToVector2=e.inverseAction=e.Action=void 0;const n=s(561);var o;!function(t){t.left="left",t.right="right",t.up="up",t.down="down",t.stay="stay"}(o=e.Action||(e.Action={})),e.inverseAction=t=>{switch(t){case o.left:return o.right;case o.right:return o.left;case o.up:return o.down;case o.down:return o.up;default:return o.stay}},e.actionToVector2=t=>{switch(t){case o.left:return new n.Vector2(-1,0);case o.right:return new n.Vector2(1,0);case o.up:return new n.Vector2(0,-1);case o.down:return new n.Vector2(0,1);default:return new n.Vector2(0,0)}},e.actionListToString=t=>t.join(", ")},247:(t,e)=>{"use strict";function s(t){return void 0!==t.id&&void 0!==t.position}Object.defineProperty(e,"__esModule",{value:!0}),e.isMonster=e.isPlayer=e.isEntity=void 0,e.isEntity=s,e.isPlayer=t=>s(t)&&"player"===t.type,e.isMonster=t=>s(t)&&"monster"===t.type},916:(t,e)=>{"use strict";var s;Object.defineProperty(e,"__esModule",{value:!0}),e.stringToBlock=e.getBlockName=e.Block=void 0,function(t){t.empty=".",t.wall="!",t.coin="#",t.dagger="d",t.bonus="b"}(s=e.Block||(e.Block={})),e.getBlockName=t=>{switch(t){case s.empty:return"empty";case s.wall:return"wall";case s.coin:return"coin";case s.dagger:return"dagger";case s.bonus:return"bonus"}},e.stringToBlock=t=>{switch(t){case".":return s.empty;default:return s.wall;case"#":return s.coin;case"d":return s.dagger;case"b":return s.bonus}}},532:function(t,e,s){"use strict";var n=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.getState=void 0;const o=s(561),a=s(916),i=n(s(196)),r=s(601);e.getState=({history:t})=>{var e,s;const n=t.length>0?t[t.length-1]:null;let c,l,u,f,p=(0,i.default)();[c,l,u,f]=p.split(" ").map((t=>parseInt(t)));const d=[];for(let t=0;t<l;t++){const t=(0,i.default)().split("").map((t=>(0,a.stringToBlock)(t)));d.push(t)}const y=parseInt((0,i.default)()),g={},h={};for(let t=0;t<y;t++){const a=(0,i.default)().split(" "),c=a[0],l=parseInt(a[1]),u=parseInt(a[2]),p=parseInt(a[3]),d=parseInt(a[4]),y=parseInt(a[5]);if("m"===c)g[t]={type:"monster",id:t,position:new o.Vector2(u,p)};else if("p"===c){const t={type:"player",id:l,position:new o.Vector2(u,p),dagger:null,bonus:null},a=(t,e)=>e?{firstTick:e.firstTick,ticksLeft:e.ticksLeft-1}:{firstTick:f,ticksLeft:t};1===d&&(t.dagger=a(r.Constants.daggerEquippedLife,null===(e=null==n?void 0:n.players[l])||void 0===e?void 0:e.dagger)),1===y&&(t.bonus=a(r.Constants.bonusEquippedLife,null===(s=null==n?void 0:n.players[l])||void 0===s?void 0:s.bonus)),h[l]=t}}const b=[a.Block.dagger,a.Block.bonus],v=[];for(let t=0;t<d.length;t++)for(let e=0;e<d[t].length;e++){const s=new o.Vector2(e,t),a=n?n.map.blockStates.find((t=>t.position.equals(s))):null,i=b.includes(d[t][e]);a&&i?v.push(a):!a&&i&&v.push({position:s,firstTick:f})}return{tick:f,playerId:u,monsters:g,players:h,map:{width:c,height:l,blocks:d,blockStates:v}}}},84:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.resolveBonusIntent=void 0;const n=s(601),o=s(656),a=s(73);e.resolveBonusIntent=({state:t,player:e,paths:s,safetyMatrix:i})=>{const r=[];for(const c of s){const s=t.map.blockStates.find((t=>t.position.equals(c.end))),l=n.Constants.bonusLife-(t.tick-s.firstTick);if(c.actions.length>=l)continue;const u=(0,o.isPathSafeWithDagger)({daggerState:e.dagger,path:c})?1:(0,a.getPathSafety)({path:c,safetyMatrix:i});r.push({actions:c.actions,certainty:u,duration:c.actions.length,payoff:n.Constants.bonusPayoff,target:c.end})}return r}},585:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.resolveCoinIntent=void 0;const n=s(601),o=s(656),a=s(73);e.resolveCoinIntent=({state:t,player:e,paths:s,safetyMatrix:i})=>{const r=[];for(const t of s){const s=(0,o.isPathSafeWithDagger)({daggerState:e.dagger,path:t})?1:(0,a.getPathSafety)({path:t,safetyMatrix:i});r.push({actions:t.actions,certainty:s,duration:t.actions.length,payoff:n.Constants.coinPayoff*(null!=e.bonus?2:1),target:t.end})}return r}},686:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.resolveDaggerIntent=void 0;const n=s(601),o=s(73);e.resolveDaggerIntent=({state:t,player:e,paths:s,safetyMatrix:a})=>{const i=a[e.position.y][e.position.x],r=[];for(const e of s){const s=t.map.blockStates.find((t=>t.position.equals(e.end))),c=n.Constants.daggerLife-(t.tick-s.firstTick);if(e.actions.length>=c)continue;let l=!0;(0,o.simulatePath)(e,((t,e)=>{a[e.y][e.x]<=t&&(l=!1)}));const u=(0,o.getPathSafety)({path:e,safetyMatrix:a});r.push({actions:e.actions,certainty:l?1:u,duration:e.actions.length,payoff:i<=n.Constants.safetyThreshold&&l?n.Constants.criticalDaggerPayoff:n.Constants.daggerPayoff,target:e.end})}return r}},458:(t,e)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0})},958:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.resolveKillIntent=void 0;const n=s(601);e.resolveKillIntent=({state:t,paths:e,player:s,safetyMatrix:o})=>{if(null==s.dagger)return[];const a=[];for(const t of e){const e=t.actions.length;s.dagger.ticksLeft<e/1.5||e<=4&&a.push({certainty:1,actions:t.actions,duration:t.actions.length,payoff:n.Constants.killPayoff,target:t.end})}return a}},989:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.resolveSafetyIntent=void 0;const n=s(601),o=s(656),a=s(73);e.resolveSafetyIntent=({state:t,paths:e,player:s,safetyMatrix:i,visibilityMatrix:r})=>{const c=i[s.position.y][s.position.x],l=r[s.position.y][s.position.x];if(c>=n.Constants.safetyThreshold)return[];if(c>3&&!l)return[];if(null!=s.dagger)return[];const u={};for(const t of e)u[t.target]=t.end.copy();const f={};return(0,o.iterateOnGameMap)({start:s.position,blocks:t.map.blocks,maxDepth:n.Constants.safetyIterationDepth,callback:(e,n)=>{const i=n.length;if(0===i)return!1;const r=Object.assign({},u);for(const s in r){const n=r[s],c=(0,a.calculateShortestPath)({start:n,end:e,blocks:t.map.blocks});if(!c)continue;if((null==c?void 0:c.actions.length)>=5)continue;const l=n.addMany(...c.actions.slice(0,i+1).map(o.actionToVector2));r[s]=l}const c=(0,o.calcuateSafety)({blocks:t.map.blocks,position:e,dangers:Object.values(r)}),l={actions:n,start:s.position,end:e,type:"safety"};return f[(0,a.pathToString)(l)]={path:l,safety:c},0==c}}),Object.values(f).sort(((t,e)=>e.safety>t.safety?1:e.safety<t.safety?-1:e.path.actions.length-t.path.actions.length)).map((t=>({payoff:n.Constants.safetyPayoff,certainty:t.safety,duration:1,actions:t.path.actions,target:t.path.end})))}},656:function(t,e,s){"use strict";var n=this&&this.__createBinding||(Object.create?function(t,e,s,n){void 0===n&&(n=s),Object.defineProperty(t,n,{enumerable:!0,get:function(){return e[s]}})}:function(t,e,s,n){void 0===n&&(n=s),t[n]=e[s]}),o=this&&this.__exportStar||function(t,e){for(var s in t)"default"===s||Object.prototype.hasOwnProperty.call(e,s)||n(e,t,s)};Object.defineProperty(e,"__esModule",{value:!0}),o(s(836),e),o(s(247),e),o(s(916),e),o(s(532),e),o(s(458),e),o(s(388),e),o(s(154),e),o(s(410),e),o(s(561),e),o(s(165),e)},388:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.iterateOnGameMap=e._traversalActions=void 0;const n=s(836),o=s(916);e._traversalActions=[n.Action.up,n.Action.down,n.Action.left,n.Action.right],e.iterateOnGameMap=({start:t,blocks:s,maxDepth:a,callback:i})=>{const r=null!=a?a:1e3,c=[];for(let t=0;t<s.length;t++){c.push([]);for(let e=0;e<s[t].length;e++)c[t].push(!1)}const l=[{position:t,actions:[],depth:0}];for(;l.length>0;){const t=l.shift();if(!t)break;const{position:a,actions:f,depth:p}=t;if(!(p>r)&&!i(a,f))for(const t of e._traversalActions){const e=a.add((0,n.actionToVector2)(t));(u=e).x>=0&&u.y>=0&&u.x<s[0].length&&u.y<s.length&&!(t=>s[t.y][t.x]===o.Block.wall)(u)&&!c[u.y][u.x]&&(l.push({position:e,actions:[...f,t],depth:p+1}),c[e.y][e.x]=!0)}}var u}},73:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.calculateShortestPath=e.getPathSafety=e.simulatePath=e.isPathEntity=e.isPathBlock=e.pathToString=void 0;const n=s(601),o=s(656);e.pathToString=t=>`${t.type} ${t.start.x} ${t.start.y} ${t.end.x} ${t.end.y} ${t.actions.map(o.actionToVector2).join(" ")}`,e.isPathBlock=t=>"block"===t.type,e.isPathEntity=t=>"entity"===t.type,e.simulatePath=(t,e)=>{let s=t.start,n=0;for(const a of t.actions)e(n,s),s=s.add((0,o.actionToVector2)(a)),n+=1},e.getPathSafety=({path:t,safetyMatrix:s})=>{let o=1;return(0,e.simulatePath)(t,((t,e)=>{s[e.y][e.x]-t*n.Constants.pathSafetyRelativeDangerScale<=n.Constants.pathSafetyRelativeDangerThreshold&&(o*=n.Constants.pathSafetyDangerousMultiplier)})),o},e.calculateShortestPath=({start:t,end:e,blocks:s})=>{let n;return(0,o.iterateOnGameMap)({start:t,blocks:s,callback:(s,o)=>(s.equals(e)&&(n={type:"position",start:t,end:e,actions:o}),void 0!==n)}),n}},816:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getDangerousPointsOfInterest=e.getPointsOfInterestWithSafety=e.getPointsOfInterest=void 0;const n=s(656),o=s(388),a=[n.Block.coin,n.Block.dagger,n.Block.bonus];e.getPointsOfInterest=({start:t,blocks:e,entities:s,predicate:n})=>{const i=[],r={};return(0,o.iterateOnGameMap)({start:t,blocks:e,callback:(o,c)=>{if(n&&n(o))return!0;const l=e[o.y][o.x],u=s.find((t=>t.position.x===o.x&&t.position.y===o.y));return a.includes(l)&&i.push({type:"block",start:t,end:o,actions:c,target:l}),null!=u&&(r[u.id]={type:"entity",start:t,end:o,actions:c,target:u.id}),!1}}),{blocks:i,entities:r}},e.getPointsOfInterestWithSafety=({start:t,blocks:s,safetyMatrix:n,visibilityMatrix:o,entities:a})=>(0,e.getPointsOfInterest)({start:t,blocks:s,entities:a,predicate:t=>n[t.y][t.x]<=4||!o[t.y][t.x]}),e.getDangerousPointsOfInterest=({poi:t,safePoi:e})=>{const s={blocks:[],entities:{}};for(const n of t.blocks)null==e.blocks.find((t=>t.end.equals(n.end)))&&s.blocks.push(n);for(const n of Object.values(t.entities))null==e.entities[n.target]&&(s.entities[n.target]=n);return s}},154:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.isPathSafeWithDagger=e.calcuateSafety=e.calculateSafetyMatrix=void 0;const n=s(388);e.calculateSafetyMatrix=({blocks:t,dangers:e})=>{const s=[];for(let e=0;e<t.length;e++){s.push([]);for(let n=0;n<t[e].length;n++)s[e].push(Number.MAX_SAFE_INTEGER)}for(const o of e)(0,n.iterateOnGameMap)({start:o,blocks:t,callback:(t,e)=>{const n=e.length;return s[t.y][t.x]=Math.min(s[t.y][t.x],n),!1}});return s},e.calcuateSafety=({position:t,blocks:s,dangers:n})=>(0,e.calculateSafetyMatrix)({blocks:s,dangers:n})[t.y][t.x],e.isPathSafeWithDagger=({daggerState:t,path:e})=>null!=t&&t.ticksLeft>3},410:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.tick=e.getSortedIntents=void 0;const n=s(836),o=s(84),a=s(585),i=s(686),r=s(958),c=s(989),l=s(656),u=s(816);e.getSortedIntents=({state:t,stateHistory:e,intentHistory:s})=>{const f=t.players[t.playerId],p=Object.values(t.monsters),d=Object.values(t.players),y=p.map((t=>t.id)),g=(d.map((t=>t.id)),d.filter((e=>e.id!==t.playerId))),h=(0,l.calculateSafetyMatrix)({blocks:t.map.blocks,dangers:p.map((t=>t.position))}),b=(0,l.calculateVisibilityMatrix)({blocks:t.map.blocks,positions:p.map((t=>t.position))}),v={start:f.position,blocks:t.map.blocks,entities:[...p,...g]};console.error("---State---"),console.error(`Position: ${f.position.toString()}`),console.error(`Safety: ${h[f.position.y][f.position.x]}`),console.error("-----------");const k=(0,u.getPointsOfInterest)(v),P=(0,u.getPointsOfInterestWithSafety)(Object.assign(Object.assign({},v),{safetyMatrix:h,visibilityMatrix:b})),x=(0,u.getDangerousPointsOfInterest)({poi:k,safePoi:P}),M={state:t,player:f,safetyMatrix:h,visibilityMatrix:b};let S;S=null!=f.dagger?x.blocks.length>0?x:k:P.blocks.length>0?P:k;const O=Object.values(k.entities).filter((t=>y.includes(t.target))),_=[...(0,c.resolveSafetyIntent)(Object.assign(Object.assign({},M),{paths:O})),...(0,a.resolveCoinIntent)(Object.assign(Object.assign({},M),{paths:S.blocks.filter((t=>t.target===l.Block.coin))})),...(0,i.resolveDaggerIntent)(Object.assign(Object.assign({},M),{paths:S.blocks.filter((t=>t.target===l.Block.dagger))})),...(0,r.resolveKillIntent)(Object.assign(Object.assign({},M),{paths:O})),...(0,o.resolveBonusIntent)(Object.assign(Object.assign({},M),{paths:S.blocks.filter((t=>t.target===l.Block.bonus))}))];return 0===_.length?[{actions:[n.Action.stay],target:f.position,certainty:0,duration:0,payoff:0}]:_.sort(((t,e)=>{const s=t.certainty*t.payoff,n=e.certainty*e.payoff,o=s/t.duration;return n/e.duration-o}))},e.tick=t=>{const s=(0,e.getSortedIntents)(t);return console.error(s.slice(0,5)),s[0]}},974:(t,e)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.manhattanDistance=void 0,e.manhattanDistance=(t,e)=>Math.abs(t.x-e.x)+Math.abs(t.y-e.y)},561:(t,e)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Vector2=void 0;class s{constructor(t,e){this.x=t,this.y=e}add(t){return new s(this.x+t.x,this.y+t.y)}addMany(...t){return t.reduce(((t,e)=>t.add(e)),this)}sub(t){return new s(this.x-t.x,this.y-t.y)}equals(t){return this.x===t.x&&this.y===t.y}copy(){return new s(this.x,this.y)}toString(){return`(${this.x}, ${this.y})`}}e.Vector2=s},165:(t,e,s)=>{"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.calculateVisibilityMatrix=void 0;const n=s(601),o=s(656),a=s(974),i=(t,e,s,n,o)=>{const a=s-t;let i=n-e,r=1;i<0&&(r=-1,i=-i);let c=2*i-a,l=e;for(let e=t;e<=s&&!o(e,l);e++)c>0?(l+=r,c+=2*(i-a)):c+=2*i},r=(t,e,s,n,o)=>{let a=s-t;const i=n-e;let r=1;a<0&&(r=-1,a=-a);let c=2*a-i,l=t;for(let t=e;t<=n&&!o(l,t);t++)c>0?(l+=r,c+=2*(a-i)):c+=2*a};e.calculateVisibilityMatrix=({positions:t,blocks:e,radius:s})=>{const c=[],l=null!=s?s:n.Constants.defaultVisibilityRadius;for(let t=0;t<e.length;t++){c.push([]);for(let s=0;s<e[t].length;s++)c[t].push(!1)}for(const s of t)for(let t=0;t<e.length;t++)for(let n=0;n<e[t].length;n++){let g=!1;u=s.x,f=s.y,p=n,d=t,y=(t,n)=>{const i=new o.Vector2(t,n);return((0,a.manhattanDistance)(i,s)>=l||e[n][t]===o.Block.wall)&&(g=!0,!0)},Math.abs(d-f)<Math.abs(p-u)?u<p?i(u,f,p,d,y):i(p,d,u,f,y):f<d?r(u,f,p,d,y):r(p,d,u,f,y),c[t][n]=c[t][n]||!g}var u,f,p,d,y;return c}},147:t=>{"use strict";t.exports=require("fs")}},e={};function s(n){var o=e[n];if(void 0!==o)return o.exports;var a=e[n]={exports:{}};return t[n].call(a.exports,a,a.exports,s),a.exports}(()=>{"use strict";const t=s(532),e=s(410),n=[],o=[];for(;;)try{const s=(0,t.getState)({history:n}),a=(0,e.tick)({state:s,stateHistory:n,intentHistory:o});console.log(a.actions[0]),n.push(s),o.push(a)}catch(t){console.error(t)}})()})();