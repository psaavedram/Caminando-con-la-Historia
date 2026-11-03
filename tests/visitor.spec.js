import { test, expect } from '@playwright/test';

test('ubicación real del navegador filtra el radio y se actualiza al moverse',async({page,context})=>{
  await context.grantPermissions(['geolocation']);await context.setGeolocation({latitude:-36.6305,longitude:-72.9553,accuracy:20});
  await page.goto('/');await page.getByRole('button',{name:'Cerca de mí',exact:true}).click();
  await expect(page.getByRole('button',{name:'Ubicación activada',exact:true})).toBeVisible();
  await page.getByRole('combobox',{name:'Radio de cercanía',exact:true}).selectOption('500');
  await expect(page.locator('.place-item')).toHaveCount(2);
  await expect(page.locator('.place-list')).toContainText('Fábrica Bellavista');
  await expect(page.locator('.place-list')).not.toContainText('Plaza de Armas');
  await page.getByRole('combobox',{name:'Radio de cercanía',exact:true}).selectOption('3000');await expect(page.locator('.place-item')).toHaveCount(5);
  await page.getByRole('combobox',{name:'Radio de cercanía',exact:true}).selectOption('500');
  await context.setGeolocation({latitude:-36.6171,longitude:-72.9573,accuracy:20});
  await expect(page.locator('.place-list')).toContainText('Plaza de Armas');
  await expect(page.locator('.place-list')).not.toContainText('Fábrica Bellavista');
  await page.getByRole('button',{name:'Ver comuna',exact:true}).click();await expect(page.locator('.place-item')).toHaveCount(6);
});

test('permiso denegado no inventa origen y permite recuperar la vista de Tomé',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'geolocation',{value:{watchPosition(success,error){setTimeout(()=>error({code:1}),0);return 1;},clearWatch(){}}});});
  await page.goto('/');await page.getByRole('button',{name:'Cerca de mí',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('No se autorizó la ubicación');
  await expect(page.getByRole('heading',{name:'Activa tu ubicación'})).toBeVisible();
  await page.getByRole('button',{name:'Ver comuna',exact:true}).click();await expect(page.locator('.place-item')).toHaveCount(6);
});

test('el listado cambia al ampliar el mapa y vuelve a incluir toda la comuna',async({page})=>{
  await page.goto('/');await expect(page.locator('.place-item')).toHaveCount(6);
  await page.locator('.leaflet-control-zoom-in').click();await expect(page.locator('.leaflet-map')).not.toHaveClass(/leaflet-zoom-anim/);await page.locator('.leaflet-control-zoom-in').click();await expect(page.locator('.leaflet-map')).not.toHaveClass(/leaflet-zoom-anim/);
  await expect.poll(()=>page.locator('.place-item').count()).toBeLessThan(6);
  await page.getByRole('button',{name:'Ver comuna',exact:true}).click();await expect(page.locator('.place-item')).toHaveCount(6);
});

test('locomoción, congestión y mejores rutas tienen enlaces separados con origen y destino',async({page})=>{
  await page.goto('/');await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();
  const panel=page.getByRole('region',{name:'Planificar cómo llegar'});
  await panel.getByLabel('Punto de partida').selectOption('plaza');
  const transit=panel.getByRole('link',{name:'Locomoción Recorridos, horarios y combinaciones'});
  let url=new URL(await transit.getAttribute('href'));
  expect(url.searchParams.get('origin')).toBe('-36.6171,-72.9573');expect(url.searchParams.get('destination')).toBe('-36.63444444,-72.95583333');expect(url.searchParams.get('travelmode')).toBe('transit');
  const alternatives=panel.getByRole('link',{name:'Comparar mejores rutas Alternativas y tiempos de Google Maps'});
  url=new URL(await alternatives.getAttribute('href'));expect(url.searchParams.get('travelmode')).toBe('walking');
  await panel.getByRole('button',{name:'Auto',exact:true}).click();url=new URL(await alternatives.getAttribute('href'));expect(url.searchParams.get('travelmode')).toBe('driving');
  await expect(panel.getByRole('link',{name:'Congestión vehicular Ver el tráfico de la zona'})).toHaveAttribute('href',/layer=traffic/);
  await panel.getByRole('button',{name:'Cerrar indicaciones'}).click();await expect(page.locator('.directions-panel')).toHaveCount(0);await expect(page.locator('.featured-card')).toHaveCount(0);
});

test('valoraciones exigen sugerencia, actualizan promedio en el mapa y persisten',async({page})=>{
  await page.goto('/');await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();await page.getByRole('button',{name:'Ver valoraciones de Fábrica Bellavista'}).click();
  const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Guardar valoración'}).click();await expect(dialog.getByRole('alert')).toContainText('Elige una nota');
  await dialog.getByRole('radio',{name:'5 estrellas',exact:true}).check();await dialog.getByRole('textbox',{name:/Sugerencia de mejora/}).fill('Agregar señalética histórica y accesos claros.');await dialog.getByRole('button',{name:'Guardar valoración'}).click();
  await expect(dialog.locator('.review-summary')).toContainText('1 visita valorada');
  await dialog.getByRole('radio',{name:'3 estrellas',exact:true}).check();await dialog.getByRole('textbox',{name:/Sugerencia de mejora/}).fill('Mejorar la iluminación del entorno.');await dialog.getByRole('button',{name:'Guardar valoración'}).click();
  await expect(dialog.locator('.review-summary')).toContainText('4,0');await dialog.getByRole('button',{name:'Volver al mapa',exact:true}).click();
  await expect(page.locator('.pin-label').filter({hasText:'Fábrica Bellavista'})).toContainText('4,0 (2)');
  await page.reload();await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();await expect(page.getByRole('button',{name:'Ver valoraciones de Fábrica Bellavista'})).toContainText('4,0');
  await page.getByRole('button',{name:'Ver valoraciones de Fábrica Bellavista'}).click();await expect(page.getByRole('dialog')).toContainText('Mejorar la iluminación');
  await page.getByRole('button',{name:'Eliminar esta valoración'}).first().click();await expect(page.locator('.review-summary')).toContainText('5,0');
});

test('tramas textiles cambian, la lectura permanece legible y volver conserva filtros',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Patrimonio industrial',exact:true}).click();await page.locator('.place-item').click();await page.getByRole('button',{name:'Descubrir su historia'}).click();
  const dialog=page.getByRole('dialog');await expect(page.locator('.story-backdrop')).toHaveClass(/fabric-espiga/);
  await dialog.getByRole('button',{name:'Escocés',exact:true}).click();await expect(page.locator('.story-backdrop')).toHaveClass(/fabric-escoces/);
  await dialog.getByRole('button',{name:'Lino',exact:true}).click();await expect(page.locator('.story-backdrop')).toHaveClass(/fabric-lino/);
  await expect(dialog.getByRole('heading',{name:'Fábrica Bellavista'})).toBeVisible();await dialog.getByRole('button',{name:'Volver al mapa de Tomé',exact:true}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Patrimonio industrial',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.place-item')).toHaveCount(1);
});
