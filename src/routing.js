// FOSSGIS public OSRM instances: separate walking and driving backends.
// Explicit calculation only; no background routing as GPS updates arrive.
const base='https://routing.openstreetmap.de';
const cache=new Map();
let nextRequestAt=0;
export const routeProfiles={walking:'routed-foot',driving:'routed-car'};
const validPoint=p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90;
export const formatDuration=seconds=>{const minutes=Math.max(1,Math.ceil(seconds/60));return minutes<60?`${minutes} min`:`${Math.floor(minutes/60)} h${minutes%60?` ${minutes%60} min`:''}`;};

export function routeUrl(origin,destination,mode){
  if(!routeProfiles[mode]||!validPoint([origin?.[1],origin?.[0]])||!validPoint([destination?.[1],destination?.[0]]))throw Error('Elige un origen y un destino válidos.');
  const coordinates=[origin,destination].map(p=>`${p[1]},${p[0]}`).join(';');
  return `${base}/${routeProfiles[mode]}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true&alternatives=false`;
}

function instruction(step){
  const m=step.maneuver||{},road=typeof step.name==='string'&&step.name.trim()?` por ${step.name.trim()}`:'';
  const modifiers={left:'a la izquierda',right:'a la derecha','slight left':'ligeramente a la izquierda','slight right':'ligeramente a la derecha','sharp left':'a la izquierda','sharp right':'a la derecha',uturn:'en sentido contrario',straight:'recto'};
  const direction=modifiers[m.modifier]||'';
  if(m.type==='depart')return `Inicia el recorrido${road}.`;
  if(m.type==='arrive')return 'Llegada al punto de acceso indicado por el mapa.';
  if(m.type==='roundabout'||m.type==='rotary')return `En la rotonda${m.exit?`, toma la salida ${m.exit}`:''}${road}.`;
  if(m.type==='turn'||m.type==='end of road')return `Gira${direction?` ${direction}`:''}${road}.`;
  if(m.type==='fork')return `En la bifurcación, sigue ${direction||'el recorrido'}${road}.`;
  if(m.type==='merge'||m.type==='on ramp')return `Incorpórate${direction?` ${direction}`:''}${road}.`;
  if(m.type==='off ramp')return `Toma la salida${direction?` ${direction}`:''}${road}.`;
  return `Continúa${direction?` ${direction}`:''}${road}.`;
}

export function parseRoute(body){
  if(body?.code==='NoRoute'||body?.code==='NoSegment')throw Error('No se encontró un recorrido para estos puntos. Prueba otro punto de partida o medio de transporte.');
  if(body?.code!=='Ok')throw Error('El servicio no pudo calcular esta ruta. Prueba otra vez en unos momentos.');
  const route=body.routes?.[0];
  if(!route||!Number.isFinite(route.distance)||route.distance<0||!Number.isFinite(route.duration)||route.duration<0||route.geometry?.type!=='LineString'||!Array.isArray(route.geometry.coordinates)||route.geometry.coordinates.length<2||!route.geometry.coordinates.every(validPoint))throw Error('El servicio entregó una ruta incompleta. Vuelve a intentarlo.');
  return {distance:route.distance,duration:route.duration,geometry:route.geometry.coordinates.map(([lon,lat])=>[lat,lon]),steps:(Array.isArray(route.legs)?route.legs:[]).flatMap(l=>l.steps||[]).map(s=>({text:instruction(s),distance:Number.isFinite(s.distance)?s.distance:0})),accessDistance:Math.max(0,...(Array.isArray(body.waypoints)?body.waypoints:[]).map(w=>Number.isFinite(w.distance)?w.distance:0))};
}

export async function calculateRoute(origin,destination,mode,{signal}={}){
  const url=routeUrl(origin,destination,mode);
  const cached=cache.get(url);if(cached&&Date.now()-cached.savedAt<300000)return {...cached.route,origin:[...origin],destination:[...destination],mode};
  const pause=Math.max(0,nextRequestAt-Date.now());
  if(pause)await new Promise((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},pause);signal?.addEventListener('abort',abort,{once:true});});
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');nextRequestAt=Date.now()+1100;
  const response=await fetch(url,{signal,credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin'});
  if(response.status===429)throw Error('El servicio está recibiendo muchas consultas. Espera un momento antes de volver a calcular.');
  if(!response.ok)throw Error('No se pudo consultar el servicio de rutas. Comprueba la conexión y vuelve a intentarlo.');
  let body;try{body=await response.json();}catch{throw Error('El servicio no entregó un recorrido válido. Vuelve a intentarlo.');}
  const route=parseRoute(body);
  if(cache.size>=20)cache.delete(cache.keys().next().value);cache.set(url,{savedAt:Date.now(),route});
  return {...route,origin:[...origin],destination:[...destination],mode};
}
