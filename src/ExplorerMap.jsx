import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Waves } from 'lucide-react';
import { places } from './data';
import { ratingStats } from './reviews';

const symbols={industrial:'▥',architecture:'♜',civic:'▦',coast:'≈',battle:'⚔'};
export default function ExplorerMap({visible,selected,onSelect,walking,visitor,focusLocation,cityReset,onBounds,reviews,nearby,radius,journey}){
  const el=useRef(null),map=useRef(null),markers=useRef(null),walkLayer=useRef(null),userLayer=useRef(null),journeyLayer=useRef(null),callbacks=useRef({onSelect,onBounds});callbacks.current={onSelect,onBounds};
  const [tiles,setTiles]=useState(false);
  const centeredFocus=useRef(-1);
  useEffect(()=>{
    const m=L.map(el.current,{zoomControl:false,scrollWheelZoom:true,zoomAnimation:false}).setView([-36.622,-72.961],14);map.current=m;
    const t=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',maxZoom:19,subdomains:'abcd'}).addTo(m);
    t.on('tileload',()=>setTiles(true));markers.current=L.layerGroup().addTo(m);walkLayer.current=L.layerGroup().addTo(m);journeyLayer.current=L.layerGroup().addTo(m);userLayer.current=L.layerGroup().addTo(m);
    L.control.zoom({position:'bottomright'}).addTo(m);
    const report=()=>{const b=m.getBounds();callbacks.current.onBounds({south:b.getSouth(),north:b.getNorth(),west:b.getWest(),east:b.getEast()});};m.on('moveend',report);report();
    const ro=new ResizeObserver(()=>{m.invalidateSize();report();});ro.observe(el.current);
    return()=>{ro.disconnect();m.remove();};
  },[]);
  useEffect(()=>{
    if(!map.current)return;markers.current.clearLayers();
    visible.filter(p=>p.coords).forEach(p=>{
      const {average,count}=ratingStats(reviews[p.id]);const score=average?`★ ${average.toFixed(1).replace('.',',')} (${count})`:'Sin notas';
      const node=document.createElement('div');node.className='classified-marker';
      const pin=document.createElement('div');pin.className=`map-pin ${p.id===selected?.id?'active':''} category-${p.category}`;const glyph=document.createElement('span');glyph.textContent=symbols[p.category]||'⌖';pin.append(glyph);
      const label=document.createElement('div');label.className='pin-label';const name=document.createElement('strong');name.textContent=p.name;const detail=document.createElement('small');detail.textContent=`${p.label} · ${score}`;label.append(name,detail);node.append(pin,label);
      const icon=L.divIcon({className:'',html:node,iconSize:[42,50],iconAnchor:[21,44]});
      const marker=L.marker(p.coords,{icon,title:`${p.name} · ${p.label} · ${score}`,keyboard:true}).addTo(markers.current);marker.on('click',()=>callbacks.current.onSelect(p));
    });
  },[visible,selected,reviews]);
  useEffect(()=>{if(!map.current)return;walkLayer.current.clearLayers();if(walking){const pts=places.filter(p=>p.coords).map(p=>p.coords);L.polyline(pts,{color:'#b47952',weight:4,dashArray:'5 10',opacity:.9}).addTo(walkLayer.current);map.current.fitBounds(pts,{padding:[55,55],maxZoom:14});}},[walking]);
  useEffect(()=>{if(!map.current)return;userLayer.current.clearLayers();if(visitor){const label=document.createElement('span');label.textContent=`Estás aquí · precisión aproximada ${Math.round(visitor.accuracy)} m`;L.circleMarker(visitor.coords,{radius:8,color:'#fff',weight:3,fillColor:'#3279bd',fillOpacity:1,className:'visitor-position'}).bindTooltip(label,{permanent:true,direction:'top',offset:[0,-8],className:'visitor-location-label'}).addTo(userLayer.current);if(nearby)L.circle(visitor.coords,{radius,color:'#3279bd',weight:1,fillOpacity:.05}).addTo(userLayer.current);}},[visitor,nearby,radius]);
  useEffect(()=>{if(!map.current)return;journeyLayer.current.clearLayers();if(journey){const line=L.polyline(journey.geometry,{color:'#347fa5',weight:5,opacity:.95,className:'calculated-route'}).addTo(journeyLayer.current);L.circleMarker(journey.origin,{radius:5,color:'#fff',weight:2,fillColor:'#347fa5',fillOpacity:1}).bindTooltip('Punto de partida de la ruta').addTo(journeyLayer.current);const wide=el.current.clientWidth>650;map.current.fitBounds(line.getBounds(),{paddingTopLeft:[30,30],paddingBottomRight:[wide?350:30,wide?55:380],maxZoom:17});}},[journey]);
  useEffect(()=>{if(visitor&&map.current&&(nearby||centeredFocus.current!==focusLocation)){map.current.setView(visitor.coords,nearby?(radius<=1000?16:14):15);centeredFocus.current=focusLocation;}},[focusLocation,visitor?.coords[0],visitor?.coords[1],nearby,radius]);
  useEffect(()=>{if(map.current)map.current.fitBounds(places.filter(p=>p.coords).map(p=>p.coords),{padding:[45,45],maxZoom:14});},[cityReset]);
  return <div className={'map-canvas '+(!tiles?'map-offline':'')}><div ref={el} className="leaflet-map" aria-label="Mapa interactivo de puntos de interés de Tomé"/>{!tiles&&<><div className="sea-label">BAHÍA DE<br/><span>CONCEPCIÓN</span><Waves size={30}/></div><div className="offline-roads"/><span className="map-local-label">TOMÉ</span><span className="map-barrio-label">BELLAVISTA</span><div className="offline-note">Vista esquemática · mapa base sin conexión</div></>}</div>;
}
