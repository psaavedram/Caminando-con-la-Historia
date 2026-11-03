import { test, expect } from '@playwright/test';
const sample={code:'Ok',waypoints:[{distance:1},{distance:5}],routes:[{distance:1900,duration:1500,geometry:{type:'LineString',coordinates:[[-72.9573,-36.6171],[-72.9568,-36.624],[-72.95583333,-36.63444444]]},legs:[{steps:[{name:'Calle de prueba',distance:1900,maneuver:{type:'depart'}},{distance:0,maneuver:{type:'arrive'}}]}]}]};

test('al iniciar centra la ubicación real del navegador, sin tarjetas ni solicitudes de ruta',async({page,context})=>{
  await context.grantPermissions(['geolocation']);await context.setGeolocation({latitude:-36.6171,longitude:-72.9573,accuracy:12});
  let calls=0;await page.route('https://routing.openstreetmap.de/**',route=>{calls++;return route.fulfill({json:sample});});
  await page.goto('/');await expect(page.getByRole('button',{name:'Ubicación activada',exact:true})).toBeVisible();await expect(page.locator('.visitor-position')).toHaveCount(1);await expect(page.getByText('Estás aquí · precisión aproximada 12 m')).toBeVisible();
  await expect(page.locator('.visitor-position')).toBeInViewport();await expect(page.locator('.featured-card')).toHaveCount(0);await expect(page.locator('.directions-panel')).toHaveCount(0);await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('.map-pin.active')).toHaveCount(0);expect(calls).toBe(0);
});

test('tocar el icono calcula a pie automáticamente y la historia se abre solo al pedirla',async({page,context})=>{
  await context.grantPermissions(['geolocation']);await context.setGeolocation({latitude:-36.6171,longitude:-72.9573,accuracy:12});
  const requests=[];await page.route('https://routing.openstreetmap.de/**',route=>{requests.push(route.request().url());return route.fulfill({json:sample,headers:{'access-control-allow-origin':'*'}});});
  await page.goto('/');await expect(page.getByRole('button',{name:'Ubicación activada',exact:true})).toBeVisible();await page.getByRole('button',{name:'Ver comuna',exact:true}).click();
  await page.locator('.leaflet-marker-icon[title^="Fábrica Bellavista"]').click();
  const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await expect(panel).toContainText('25 min · 1,9 km');await expect(panel.getByRole('button',{name:'A pie',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('path.calculated-route')).toHaveCount(1);await expect(page.getByRole('dialog')).toHaveCount(0);expect(requests).toHaveLength(1);expect(requests[0]).toContain('/routed-foot/');
  await panel.getByRole('button',{name:'Descubrir su historia'}).click();await expect(page.getByRole('dialog').getByRole('heading',{name:'Fábrica Bellavista'})).toBeVisible();await page.getByRole('button',{name:'Volver al mapa',exact:true}).click();await expect(panel).toContainText('25 min');await expect(page.locator('path.calculated-route')).toHaveCount(1);expect(requests).toHaveLength(1);
  await panel.getByRole('button',{name:'Cerrar indicaciones'}).click();await expect(page.locator('.featured-card')).toHaveCount(0);await expect(page.locator('.directions-panel')).toHaveCount(0);
});

test('sin permiso mantiene el mapa limpio y nunca inventa una posición ni una ruta',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'geolocation',{value:{watchPosition(success,error){setTimeout(()=>error({code:1}),0);return 1;},clearWatch(){}}});});
  let calls=0;await page.route('https://routing.openstreetmap.de/**',route=>{calls++;return route.fulfill({json:sample});});
  await page.goto('/');await expect(page.getByRole('button',{name:'Ubicación no disponible',exact:true})).toBeVisible();await expect(page.locator('.visitor-position')).toHaveCount(0);await expect(page.locator('.featured-card')).toHaveCount(0);await expect(page.locator('.directions-panel')).toHaveCount(0);
  await page.locator('.leaflet-marker-icon[title^="Fábrica Bellavista"]').click();const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await expect(panel.getByRole('button',{name:'Usar mi ubicación',exact:true})).toBeVisible();await expect(page.locator('path.calculated-route')).toHaveCount(0);expect(calls).toBe(0);await panel.getByRole('button',{name:'Descubrir su historia'}).click();await expect(page.getByRole('dialog')).toBeVisible();
});

test('cambiar ciudad o filtrar no selecciona por su cuenta una tarjeta',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Patrimonio industrial',exact:true}).click();await expect(page.locator('.directions-panel')).toHaveCount(0);await expect(page.locator('.featured-card')).toHaveCount(0);await page.locator('.place-item').click();await expect(page.locator('.directions-panel')).toHaveCount(1);
  await page.getByRole('button',{name:'Tomé Biobío, Chile'}).click();await page.getByRole('button',{name:'Tomé 6 historias para descubrir'}).click();await expect(page.locator('.directions-panel')).toHaveCount(0);await expect(page.locator('.featured-card')).toHaveCount(0);await expect(page.locator('.map-pin.active')).toHaveCount(0);
});

test('si el GPS llega después de elegir un lugar calcula una sola ruta hacia ese sitio',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'geolocation',{value:{watchPosition(success){window.__deliverLocation=()=>success({coords:{latitude:-36.6171,longitude:-72.9573,accuracy:12}});return 1;},clearWatch(){}}});});
  const urls=[];await page.route('https://routing.openstreetmap.de/**',route=>{urls.push(route.request().url());return route.fulfill({json:sample});});
  await page.goto('/');await page.locator('.leaflet-marker-icon[title^="Fábrica Bellavista"]').click();
  const panel=page.getByRole('region',{name:'Planificar cómo llegar'});await expect(panel).toBeVisible();expect(urls).toHaveLength(0);
  await page.evaluate(()=>window.__deliverLocation());await expect(panel).toContainText('25 min · 1,9 km');expect(urls).toHaveLength(1);
  await page.evaluate(()=>window.__deliverLocation());await expect(page.locator('.visitor-position')).toHaveCount(1);expect(urls).toHaveLength(1);await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('activar el paseo orientativo cancela la ruta individual pendiente y limpia su tarjeta',async({page,context})=>{
  await context.grantPermissions(['geolocation']);await context.setGeolocation({latitude:-36.6171,longitude:-72.9573,accuracy:12});
  let release,arrived;const pending=new Promise(resolve=>release=resolve),started=new Promise(resolve=>arrived=resolve);
  await page.route('https://routing.openstreetmap.de/**',async route=>{arrived();await pending;try{await route.fulfill({json:sample});}catch{}});
  await page.goto('/');await expect(page.getByRole('button',{name:'Ubicación activada',exact:true})).toBeVisible();await page.getByRole('button',{name:'Ver comuna',exact:true}).click();await page.locator('.leaflet-marker-icon[title^="Fábrica Bellavista"]').click();await started;
  await page.getByRole('button',{name:'Comenzar recorrido'}).click();release();await expect(page.getByRole('heading',{name:'Sigue los hilos de Tomé'})).toBeVisible();await expect(page.locator('.directions-panel')).toHaveCount(0);await expect(page.locator('.featured-card')).toHaveCount(0);await expect(page.locator('path.calculated-route')).toHaveCount(0);await expect(page.locator('.map-pin.active')).toHaveCount(0);await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(2);
});
