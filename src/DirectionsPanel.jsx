import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Car, Footprints, Bus, LocateFixed, X, MapPin, Clock, Route, Navigation, ChevronDown, BookOpen, Bookmark, Star } from 'lucide-react';
import { places } from './data';
import { distanceMeters, formatDistance, googleDirections, trafficLink } from './visitor';
import { calculateRoute, formatDuration } from './routing';

export default function DirectionsPanel({place,visitor,onLocate,locationStatus,onClose,journey,onJourney,onReadHistory,onReadReviews,saved,onSave,reviewLabel}){
  const [mode,setMode]=useState(journey?.mode||'walking'),[start,setStart]=useState(journey?.startKey||'visitor'),[status,setStatus]=useState('idle'),[error,setError]=useState('');
  const request=useRef(null),timeout=useRef(null),generation=useRef(0),autoRequested=useRef(Boolean(journey));
  const origin=start==='visitor'?visitor?.coords:places.find(p=>p.id===start)?.coords;
  const destination=place.coords;
  const active=journey?.destinationId===place.id&&journey.mode===mode?journey:null;
  const stale=active&&origin&&distanceMeters(active.origin,origin)>40;
  const abort=()=>{generation.current++;request.current?.abort();clearTimeout(timeout.current);};
  useEffect(()=>()=>abort(),[]);
  const changeMode=value=>{if(value===mode)return;autoRequested.current=true;abort();setMode(value);setStatus('idle');setError('');onJourney(null);};
  const changeStart=value=>{autoRequested.current=true;abort();setStart(value);setStatus('idle');setError('');onJourney(null);};
  const compute=async()=>{
    if(!origin){setError('Activa tu ubicación o elige un punto de partida.');return;}
    abort();const current=generation.current,controller=new AbortController();request.current=controller;let timedOut=false;
    setStatus('loading');setError('');onJourney(null);
    timeout.current=setTimeout(()=>{timedOut=true;controller.abort();},18000);
    try{const result=await calculateRoute(origin,destination,mode,{signal:controller.signal});if(current!==generation.current)return;onJourney({...result,destinationId:place.id,startKey:start});setStatus('ready');}
    catch(e){if(current!==generation.current)return;if(e.name==='AbortError'&&!timedOut)return;setStatus('error');setError(timedOut?'El servicio tardó demasiado. Puedes volver a calcular o consultar las alternativas en Google Maps.':e instanceof TypeError?'No se pudo conectar al servicio de rutas. Revisa tu conexión o usa los enlaces de Google Maps.':e.message);}
    finally{if(current===generation.current)clearTimeout(timeout.current);}
  };
  useEffect(()=>{if(!autoRequested.current&&start==='visitor'&&origin&&mode==='walking'){autoRequested.current=true;compute();}},[origin?.[0],origin?.[1],start,mode]);
  return <section className="directions-panel" aria-label="Planificar cómo llegar"><div className="directions-heading"><span><MapPin size={15}/> TU RECORRIDO EN LA APP</span><button aria-label="Cerrar indicaciones" onClick={onClose}><X size={16}/></button></div><h3>{place.name}</h3><p className="selected-place-category">{place.label} · {mode==='walking'?'Ruta a pie':'Ruta en auto'}</p>{active&&<div className="journey-estimate selection-route-summary"><Clock size={19}/><div><strong>{formatDuration(active.duration)} · {formatDistance(active.distance)}</strong><small>{mode==='walking'?'Recorrido a pie':'Recorrido en auto · sin tráfico en vivo'}</small></div></div>}<div className="selected-place-actions"><button className="primary-button read-place-history" onClick={onReadHistory}><BookOpen size={16}/> Descubrir su historia <ArrowUpRight size={15}/></button><button className={'circle-button '+(saved?'is-saved':'')} aria-label={saved?'Quitar de guardados':'Guardar lugar'} onClick={onSave}><Bookmark size={16} fill={saved?'currentColor':'none'}/></button></div><button className="selected-place-reviews" aria-label={`Ver valoraciones de ${place.name}`} onClick={onReadReviews}><Star size={12}/>{reviewLabel}</button><div className="travel-modes" role="group" aria-label="Medio de transporte">{[['walking','A pie',Footprints],['driving','Auto',Car]].map(([id,label,Icon])=><button key={id} aria-pressed={mode===id} className={mode===id?'active':''} onClick={()=>changeMode(id)}><Icon size={17}/>{label}</button>)}</div>
    <label className="origin-select">Punto de partida<select value={start} onChange={e=>changeStart(e.target.value)}><option value="visitor">Mi ubicación {visitor?'actual':'(activar GPS)'}</option>{places.filter(p=>p.coords&&p.id!==place.id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    {start==='visitor'&&!visitor&&<button className="location-text-button" onClick={onLocate}><LocateFixed size={15}/>{locationStatus==='loading'?'Buscando ubicación…':'Usar mi ubicación'}</button>}
    <button className="primary-button calculate-route" disabled={status==='loading'} onClick={compute}><Route size={16}/>{status==='loading'?'Calculando recorrido…':active?'Recalcular ruta':'Calcular ruta en la app'}<Navigation size={15}/></button>
    {error&&<p className="route-error" role="alert">{error}</p>}
    {active&&<div className="route-result" aria-live="polite">{stale&&<p className="route-stale">Tu ubicación cambió. Recalcula para usar tu nuevo punto de partida.</p>}{active.accessDistance>100&&<p className="route-stale">El acceso calculado está a unos {formatDistance(active.accessDistance)} de uno de los puntos. Revisa el tramo final.</p>}<details className="route-instructions"><summary>Indicaciones del recorrido <ChevronDown size={14}/></summary><ol>{active.steps.map((s,i)=><li key={i}><span>{s.text}</span><small>{s.distance>0?formatDistance(s.distance):''}</small></li>)}</ol></details><p className="route-estimate-note">Tiempo estimado según el recorrido, sin congestión en tiempo real. Comprueba los accesos y cruces al avanzar.</p></div>}
    {!active&&!error&&<p className="directions-disclaimer">La ruta a pie se calcula al seleccionar el lugar si tu ubicación está disponible. También puedes elegir otra partida. La ruta, su distancia e indicaciones aparecerán aquí.</p>}
    <div className="external-map-links"><span>CONSULTAR POR SEPARADO EN GOOGLE MAPS</span><a href={googleDirections(destination,origin,'transit')} target="_blank" rel="noopener noreferrer"><Bus size={16}/><span><strong>Locomoción</strong><small>Recorridos, horarios y combinaciones</small></span><ArrowUpRight size={15}/></a><a href={trafficLink(destination)} target="_blank" rel="noopener noreferrer"><Car size={16}/><span><strong>Congestión vehicular</strong><small>Ver el tráfico de la zona</small></span><ArrowUpRight size={15}/></a><a href={googleDirections(destination,origin,mode)} target="_blank" rel="noopener noreferrer"><Route size={16}/><span><strong>Comparar mejores rutas</strong><small>Alternativas y tiempos de Google Maps</small></span><ArrowUpRight size={15}/></a><p>Estos tres enlaces abren Google Maps en otra pestaña. Tu recorrido queda en la app.</p></div>
    <p className="route-provider">Rutas: <a href="https://routing.openstreetmap.de/" target="_blank" rel="noopener noreferrer">OSRM / FOSSGIS</a> · Datos © OpenStreetMap. Al calcular se envían el origen y el destino al servicio público. Uso de prototipo, sujeto a disponibilidad.</p>
  </section>;
}
