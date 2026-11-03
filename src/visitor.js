import { useEffect, useRef, useState } from 'react';

export const cityCenter = [-36.623,-72.957];
export function distanceMeters(a,b){
  if(!a||!b)return null;
  const rad=x=>x*Math.PI/180,dlat=rad(b[0]-a[0]),dlon=rad(b[1]-a[1]);
  const h=Math.sin(dlat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dlon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export const formatDistance = meters => meters<1000?`${Math.round(meters/10)*10} m`:`${(meters/1000).toFixed(1).replace('.',',')} km`;
export function inBounds(coords,bounds){return !coords||!bounds||coords[0]>=bounds.south&&coords[0]<=bounds.north&&coords[1]>=bounds.west&&coords[1]<=bounds.east;}

export function useVisitorLocation(onNotice){
  const [visitor,setVisitor]=useState(null),[status,setStatus]=useState('idle');
  const watch=useRef(null),notice=useRef(onNotice);notice.current=onNotice;
  useEffect(()=>()=>{if(watch.current!==null)navigator.geolocation?.clearWatch(watch.current);},[]);
  const locate=()=>{
    if(!navigator.geolocation){setStatus('error');notice.current('Este navegador no ofrece ubicación. Puedes elegir un punto de partida para consultar indicaciones.');return;}
    if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);
    setStatus('loading');let first=true;
    watch.current=navigator.geolocation.watchPosition(p=>{
      setVisitor({coords:[p.coords.latitude,p.coords.longitude],accuracy:p.coords.accuracy});setStatus('active');
      if(first){notice.current('Ubicación activada. Los lugares cercanos se actualizan mientras recorres la ciudad.');first=false;}
    },error=>{setStatus('error');notice.current(error.code===1?'No se autorizó la ubicación. Puedes seguir explorando Tomé y elegir un punto de partida.':'No pudimos obtener tu ubicación. Inténtalo de nuevo o elige un punto de partida.');setVisitor(null);if(error.code===1&&watch.current!==null){navigator.geolocation.clearWatch(watch.current);watch.current=null;}},{enableHighAccuracy:true,timeout:12000,maximumAge:0});
  };
  return {visitor,status,locate};
}

export function googleDirections(destination,origin,mode){
  const params=new URLSearchParams({api:'1',destination:destination.join(','),travelmode:mode});
  if(origin)params.set('origin',origin.join(','));
  return `https://www.google.com/maps/dir/?${params}`;
}
export function trafficLink(coords){return `https://www.google.com/maps/@?${new URLSearchParams({api:'1',map_action:'map',center:coords.join(','),zoom:'14',basemap:'roadmap',layer:'traffic'})}`;}
