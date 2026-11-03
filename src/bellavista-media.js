import buildingPhoto from './assets/bellavista-fachada.jpg?inline';
import wernerPhoto from './assets/carlos-werner.jpg?inline';

// Curated files: source/licensing metadata reviewed on 2026-10-23.
// Original JPEGs are retained unchanged. Evidence is saved under docs/metadata-*.
export const archiveLinks = {
  building:'https://commons.wikimedia.org/wiki/File:F%C3%A1brica_Textil_Bellavista_Oveja_Tom%C3%A9.jpg',
  person:'https://commons.wikimedia.org/wiki/File:Carlos_Werner.jpg',
};
export const bellavistaMedia = {
  loading:false,
  building:[{
    id:118636222,src:buildingPhoto,url:archiveLinks.building,
    originalUrl:'https://upload.wikimedia.org/wikipedia/commons/c/cf/F%C3%A1brica_Textil_Bellavista_Oveja_Tom%C3%A9.jpg',
    title:'Fábrica Textil Bellavista Oveja Tomé',author:'Génesis Domínguez Elgorriaga',
    license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    permissionNote:'Permite reutilizar la foto dando crédito. Si se adapta, debe compartirse con la misma licencia. Archivo original sin editar.',
    date:'28 de mayo de 2022',
  }],
  person:[{
    id:52590093,src:wernerPhoto,url:archiveLinks.person,
    originalUrl:'https://upload.wikimedia.org/wikipedia/commons/0/02/Carlos_Werner.jpg',
    title:'Retrato de Carlos Werner Richter',
    author:'Autor no identificado · Procedencia: Biblioteca del Congreso Nacional de Chile',
    license:'Dominio público, según Wikimedia Commons',
    licenseUrl:'https://commons.wikimedia.org/wiki/File:Carlos_Werner.jpg#Licensing',
    permissionNote:'La ficha original lo clasifica como dominio público (PD-Chile). Se conserva el enlace a su información de derechos.',
    date:'Fecha de la fotografía no indicada',
  }],
};
