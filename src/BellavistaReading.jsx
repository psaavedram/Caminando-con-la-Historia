import { useState } from 'react';
import { ArrowUpRight, BookOpen, Camera, ChevronDown, ExternalLink } from 'lucide-react';
import { archiveLinks } from './bellavista-media';

function ArchivePhoto({photo,portrait=false}) {
  const [failed,setFailed]=useState(false),[expanded,setExpanded]=useState(false);
  return <figure className={'archive-photo '+(portrait?'portrait-photo ':'')+(expanded?'photo-expanded':'')}>
    {failed?<div className="photo-failed"><Camera size={25}/><div><p>Aquí se vería {portrait?'el retrato de Carlos Werner':'una fotografía de la fachada de la Fábrica Bellavista'}. Puedes verla en su página original.</p><a href={photo.url} target="_blank" rel="noopener noreferrer">Ver fotografía en su página original <ExternalLink size={14}/></a></div></div>:<button className="photo-expand-button" type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} aria-label={`${expanded?'Reducir':'Ampliar'} fotografía: ${photo.title}`}><img src={photo.src} alt={photo.title} onError={()=>setFailed(true)}/><span>{expanded?'Reducir fotografía':'Ampliar en esta página'}</span></button>}
    <figcaption><strong>{photo.title}</strong><span>{photo.date}</span><span className="photo-credit">{photo.author}</span><a className="photo-license" href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license} <ExternalLink size={11}/></a><p className="photo-permission">{photo.permissionNote}</p><a href={photo.url} target="_blank" rel="noopener noreferrer">Foto y créditos en la página original <ArrowUpRight size={12}/></a></figcaption>
  </figure>;
}

function ArchiveUnavailable({kind,loading}) {
  return <div className="archive-unavailable"><Camera size={24}/><div><strong>{kind==='person'?'Retrato de Carlos Werner':'Fotografías de la fábrica'}</strong><p>Aquí se vería {kind==='person'?'un retrato de Carlos Werner':'una fotografía de la Fábrica Bellavista'}. Consulta la imagen y sus derechos en la página original.</p><a href={archiveLinks[kind]} target="_blank" rel="noopener noreferrer">Ver fotografía en su página original <ArrowUpRight size={13}/></a></div></div>;
}

export default function BellavistaReading({place,media}) {
  const [biography,setBiography]=useState(false);
  return <article className="story-text bellavista-reading">
    <div className="reading-meta"><span>HISTORIA DEL LUGAR</span><span>3 min de lectura</span></div>
    <p className="intro">{place.intro}</p>
    <section><h3>{place.paragraphs[0][0]}</h3><p>{place.paragraphs[0][1]}</p></section>
    <div className="archive-gallery" aria-label="Fotografías del edificio Bellavista">{media.building.length?media.building.map(photo=><ArchivePhoto key={photo.id} photo={photo}/>):<ArchiveUnavailable kind="building" loading={media.loading}/>}</div>
    <section><h3>{place.paragraphs[1][0]}</h3><p>Entre las figuras vinculadas al desarrollo de Bellavista destaca <button className="inline-history-link" onClick={()=>setBiography(true)} aria-expanded={biography} aria-controls="werner-biography">Carlos Werner <ArrowUpRight size={12}/></button>. Su historia permite acercarse a la etapa de expansión de la industria textil y a su relación con Tomé. Su participación corresponde a una etapa posterior a la fundación de la fábrica.</p></section>
    <section className="person-history" aria-label="Historia relacionada de Carlos Werner"><button className="person-history-toggle" aria-expanded={biography} aria-controls="werner-biography" onClick={()=>setBiography(v=>!v)}><span className="person-monogram" aria-hidden="true">CW</span><span><small>UN PERSONAJE DE ESTA HISTORIA</small><strong>¿Quién fue Carlos Werner?</strong><span>Empresario y figura pública</span></span><ChevronDown size={18} className={biography?'expanded':''}/></button>
      {biography&&<div id="werner-biography" className="person-biography"><p>Carlos Werner Richter fue un empresario y político chileno asociado a la historia de la industria textil de Tomé. También desarrolló actividad parlamentaria. Para conocer su trayectoria personal y pública, puedes consultar su reseña en la Biblioteca del Congreso Nacional.</p>{media.person.length?media.person.map(photo=><ArchivePhoto key={photo.id} photo={photo} portrait/>):<ArchiveUnavailable kind="person" loading={media.loading}/>}<a className="biography-link" href="https://www.bcn.cl/historiapolitica/resenas_parlamentarias/wiki/Carlos_Werner_Richter" target="_blank" rel="noopener noreferrer">Leer su biografía en la BCN <ArrowUpRight size={16}/></a></div>}
    </section>
    <section><h3>{place.paragraphs[2][0]}</h3><p>{place.paragraphs[2][1]}</p></section>
    <section className="related-history"><div className="eyebrow"><BookOpen size={15}/> SIGUE EL HILO DE LA HISTORIA</div><a href="https://es.wikipedia.org/wiki/Bellavista_Oveja_Tom%C3%A9" target="_blank" rel="noopener noreferrer"><span><strong>La historia de Bellavista Oveja Tomé</strong><small>Wikipedia · Industria y evolución de la empresa</small></span><ArrowUpRight size={18}/></a><a href="https://www.monumentos.gob.cl/" target="_blank" rel="noopener noreferrer"><span><strong>Patrimonio industrial de Tomé</strong><small>Consejo de Monumentos Nacionales · Buscar «Bellavista»</small></span><ArrowUpRight size={18}/></a></section>
    <aside className="source-note"><BookOpen size={17}/><div>Síntesis breve de prototipo con referencias a Wikipedia y la Biblioteca del Congreso Nacional. Fotografías consultadas en Wikimedia Commons; créditos y condiciones de uso bajo cada imagen.</div></aside>
  </article>;
}
