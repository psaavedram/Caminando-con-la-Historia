import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Synthetic OSRM responses exercise integration; they are not verified routes.
const response=(driving=false)=>({code:'Ok',waypoints:[{distance:3},{distance:6}],routes:[{distance:driving?2200:1800,duration:driving?360:1440,geometry:{type:'LineString',coordinates:[[-72.9573,-36.6171],[-72.9568,-36.624],[-72.95583333,-36.63444444]]},legs:[{steps:[{name:'Sotomayor',distance:800,maneuver:{type:'depart'}},{name:'Avenida de prueba',distance:1000,maneuver:{type:'turn',modifier:'right'}},{name:'',distance:0,maneuver:{type:'arrive'}}]}]}]});
const fulfill=(route,json)=>route.fulfill({json,headers:{'access-control-allow-origin':'*'}});
async function panelFor(page){await page.goto('/');await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await panel.getByLabel('Punto de partida').selectOption('plaza');return panel;}

test('calcula en la app, dibuja el recorrido y cambia entre pie y auto',async({page})=>{
  const urls=[];await page.route('https://routing.openstreetmap.de/**',route=>{urls.push(route.request().url());return fulfill(route,response(route.request().url().includes('routed-car')));});
  const panel=await panelFor(page);await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel).toContainText('24 min · 1,8 km');await expect(page.locator('path.calculated-route')).toHaveCount(1);
  await panel.getByText('Indicaciones del recorrido',{exact:true}).click();await expect(panel).toContainText('Gira a la derecha por Avenida de prueba');
  expect(urls[0]).toContain('/routed-foot/route/v1/driving/-72.9573,-36.6171;-72.95583333,-36.63444444');
  await panel.getByRole('button',{name:'Auto',exact:true}).click();await expect(page.locator('path.calculated-route')).toHaveCount(0);await expect(panel).not.toContainText('24 min');
  await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel).toContainText('6 min · 2,2 km');expect(urls[1]).toContain('/routed-car/');
  await panel.getByRole('button',{name:'Cerrar indicaciones'}).click();await expect(page.locator('path.calculated-route')).toHaveCount(1);await page.getByRole('button',{name:'Ver indicaciones de mi ruta'}).click();await expect(panel).toContainText('2,2 km');await panel.getByRole('button',{name:'Cerrar indicaciones'}).click();await page.getByRole('button',{name:'Quitar ruta calculada'}).click();await expect(page.locator('path.calculated-route')).toHaveCount(0);
});

test('sin origen no consulta el servidor ni inventa duración',async({page})=>{
  let calls=0;await page.route('https://routing.openstreetmap.de/**',route=>{calls++;return fulfill(route,response());});
  await page.goto('/');await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel.getByRole('alert')).toContainText('Activa tu ubicación');expect(calls).toBe(0);await expect(page.locator('path.calculated-route')).toHaveCount(0);
  await expect(panel.getByRole('link',{name:'Locomoción Recorridos, horarios y combinaciones'})).toBeVisible();
});

test('un límite de uso muestra el error y permite reintentar sin una ruta falsa',async({page})=>{
  let calls=0;await page.route('https://routing.openstreetmap.de/**',route=>{calls++;return calls===1?route.fulfill({status:429,body:'Limit',headers:{'access-control-allow-origin':'*'}}):fulfill(route,response());});
  const panel=await panelFor(page);await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel.getByRole('alert')).toContainText('muchas consultas');await expect(page.locator('path.calculated-route')).toHaveCount(0);
  await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel).toContainText('24 min');expect(calls).toBe(2);
});

test('NoRoute y una respuesta incompleta no dibujan conectores como si fueran caminos',async({page})=>{
  let calls=0;await page.route('https://routing.openstreetmap.de/**',route=>fulfill(route,++calls===1?{code:'NoRoute'}:{code:'Ok',routes:[{distance:200,duration:100,geometry:{type:'LineString',coordinates:[[999,999],[0,0]]}}]}));
  const panel=await panelFor(page);await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel.getByRole('alert')).toContainText('No se encontró un recorrido');await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel.getByRole('alert')).toContainText('ruta incompleta');await expect(page.locator('path.calculated-route')).toHaveCount(0);
});

test('cambiar transporte cancela una solicitud pendiente y descarta su respuesta',async({page})=>{
  let release,arrived;const pending=new Promise(resolve=>release=resolve),started=new Promise(resolve=>arrived=resolve);
  await page.route('https://routing.openstreetmap.de/**',async route=>{arrived();await pending;try{await fulfill(route,response());}catch{}});
  const panel=await panelFor(page);await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await started;await panel.getByRole('button',{name:'Auto',exact:true}).click();release();await expect(panel.getByRole('button',{name:'Calcular ruta en la app'})).toBeEnabled();await expect(panel.locator('.route-result')).toHaveCount(0);await expect(page.locator('path.calculated-route')).toHaveCount(0);
});

test('una nueva posición pide recalcular, sin consultar el servicio con cada actualización GPS',async({page,context})=>{
  await context.grantPermissions(['geolocation']);await context.setGeolocation({latitude:-36.6171,longitude:-72.9573,accuracy:15});let calls=0;
  await page.route('https://routing.openstreetmap.de/**',route=>{calls++;return fulfill(route,response());});
  await page.goto('/');await page.getByRole('button',{name:'Ubicación activada',exact:true}).waitFor();await page.getByRole('button',{name:'Ver comuna',exact:true}).click();await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await expect(panel).toContainText('24 min');
  await context.setGeolocation({latitude:-36.62,longitude:-72.9573,accuracy:15});await expect(panel.locator('.route-stale')).toContainText('Tu ubicación cambió');expect(calls).toBe(1);
  await panel.getByRole('button',{name:'Recalcular ruta',exact:true}).click();await expect(panel.locator('.route-result')).toBeVisible();await expect(panel.locator('.route-stale')).toHaveCount(0);expect(calls).toBe(2);
});

test('el HTML autónomo calcula y muestra la ruta sin descargar código adicional',async({page})=>{
  const html=await readFile(new URL('../prototipo.html',import.meta.url),'utf8');await page.route('**/*',route=>route.request().url()==='https://prototype.test/'?route.fulfill({contentType:'text/html',body:html}):route.request().url().startsWith('https://routing.openstreetmap.de/')?fulfill(route,response()):route.abort());
  await page.goto('https://prototype.test/');await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await panel.getByLabel('Punto de partida').selectOption('plaza');await panel.getByRole('button',{name:'Calcular ruta en la app'}).click();await expect(panel).toContainText('24 min · 1,8 km');await expect(page.locator('path.calculated-route')).toHaveCount(1);
});
