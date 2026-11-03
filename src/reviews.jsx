import { useEffect, useState } from 'react';
import { Star, MessageSquare, Trash2, Check } from 'lucide-react';

const storageKey='caminando-reviews-v1';
function restore(){
  try{const data=JSON.parse(localStorage.getItem(storageKey)||'{}');if(!data||Array.isArray(data)||typeof data!=='object')return {};
    return Object.fromEntries(Object.entries(data).filter(([id])=>['bellavista','san-rafael','iglesia','plaza','mercado','morro'].includes(id)).map(([id,list])=>[id,Array.isArray(list)?list.filter(r=>r&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5&&typeof r.suggestion==='string'&&r.suggestion.trim()&&typeof r.id==='string').map(r=>({...r,comment:typeof r.comment==='string'?r.comment.slice(0,600):'',suggestion:r.suggestion.slice(0,600)})).slice(-100):[]]));
  }catch{return {};}
}
export function useReviews(){
  const [reviews,setReviews]=useState(restore),[persistent,setPersistent]=useState(true);
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(reviews));setPersistent(true);}catch{setPersistent(false);}},[reviews]);
  const add=(placeId,input)=>{const entry={...input,id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,createdAt:new Date().toISOString()};setReviews(all=>({...all,[placeId]:[...(all[placeId]||[]),entry].slice(-100)}));};
  const remove=(placeId,id)=>setReviews(all=>({...all,[placeId]:(all[placeId]||[]).filter(r=>r.id!==id)}));
  return {reviews,add,remove,persistent};
}
export function ratingStats(list=[]){return {count:list.length,average:list.length?list.reduce((sum,r)=>sum+r.rating,0)/list.length:null};}
export const ratingLabel = list => {const {count,average}=ratingStats(list);return count?`${average.toFixed(1).replace('.',',')} · ${count} ${count===1?'valoración':'valoraciones'}`:'Sin valoraciones';};

export function Reviews({place,list=[],onAdd,onRemove,persistent}){
  const [rating,setRating]=useState(0),[comment,setComment]=useState(''),[suggestion,setSuggestion]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(false);
  const {average,count}=ratingStats(list);
  const submit=e=>{e.preventDefault();if(!rating||!suggestion.trim()){setError(true);setMessage('Elige una nota y escribe una sugerencia de mejora.');return;}
    onAdd(place.id,{rating,comment:comment.trim(),suggestion:suggestion.trim()});setRating(0);setComment('');setSuggestion('');setError(false);setMessage('Valoración guardada. La nota del mapa ya se actualizó.');};
  return <section className="reviews-view" aria-label={`Valoraciones de ${place.name}`}><div className="review-summary"><div><strong>{average?average.toFixed(1).replace('.',','):'—'}</strong><span>/ 5</span></div><div><div className="review-stars" aria-hidden="true">★★★★★</div><p>{count?`${count} ${count===1?'visita valorada':'visitas valoradas'}`:'Sé la primera persona en valorar este lugar'}</p></div></div>
    <p className="local-reviews-note">Prototipo: promedio de las valoraciones guardadas en este dispositivo. Aún no se comparten entre visitantes.</p>
    <form className="review-form" onSubmit={submit}><h3>¿Cómo fue tu visita?</h3><fieldset><legend>Tu nota del lugar <span>(obligatoria)</span></legend><div className="rating-options">{[1,2,3,4,5].map(n=><label key={n} className={rating>=n?'rated':''}><input type="radio" name="rating" value={n} checked={rating===n} onChange={()=>setRating(n)} aria-label={`${n} ${n===1?'estrella':'estrellas'}`}/><Star size={27} fill={rating>=n?'currentColor':'none'}/><span>{n}</span></label>)}</div></fieldset><label>¿Qué destacarías de este lugar? <span>(opcional)</span><textarea value={comment} maxLength={600} onChange={e=>setComment(e.target.value)} placeholder="Su historia, el entorno, la experiencia…"/></label><label>Sugerencia de mejora <span>(obligatoria)</span><textarea value={suggestion} maxLength={600} onChange={e=>setSuggestion(e.target.value)} placeholder="¿Qué haría mejor la visita? Acceso, señalética, información…" aria-required="true"/></label><button className="primary-button" type="submit">Guardar valoración <Check size={16}/></button>{message&&<p className={error?'review-error':'review-success'} role={error?'alert':'status'}>{message}</p>}{!persistent&&<p className="review-error">Este visor no permite almacenamiento. Tu valoración estará disponible mientras mantengas abierta la aplicación.</p>}</form>
    {list.length>0&&<div className="review-list"><h3>Visitas y sugerencias</h3>{[...list].reverse().map(r=><article key={r.id}><div><strong><Star size={13} fill="currentColor"/> {r.rating}/5</strong><small>{Number.isFinite(Date.parse(r.createdAt))?new Date(r.createdAt).toLocaleDateString('es-CL'):'Visita guardada'}</small><button aria-label="Eliminar esta valoración" title="Eliminar esta valoración" onClick={()=>onRemove(place.id,r.id)}><Trash2 size={14}/></button></div>{r.comment&&<p>{r.comment}</p>}<p className="review-suggestion"><MessageSquare size={14}/><span><b>Sugerencia de mejora</b>{r.suggestion}</span></p></article>)}</div>}
  </section>;
}
