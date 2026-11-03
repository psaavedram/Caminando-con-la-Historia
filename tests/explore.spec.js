import { test, expect } from '@playwright/test';

test('explora Tomé, lee Bellavista y recorre escenas del reel',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'La historia está a tus pasos.'})).toBeVisible();
  await expect(page.locator('.place-item')).toHaveCount(6);
  await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();
  await page.getByRole('button',{name:'Descubrir su historia'}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{name:'Fábrica Bellavista'})).toBeVisible();
  await expect(dialog.getByText(/fundada en 1865/)).toBeVisible();
  await dialog.getByRole('tab',{name:'Ver reel'}).click();
  await expect(dialog.getByRole('heading',{name:'El comienzo de un legado'})).toBeVisible();
  await dialog.getByRole('button',{name:'Escena siguiente'}).click();
  await expect(dialog.getByRole('heading',{name:'Una memoria entretejida'})).toBeVisible();
  await dialog.getByRole('tab',{name:'Escuchar'}).click();
  await expect(dialog.getByRole('button',{name:'Reproducir narración'})).toBeVisible();
  await dialog.getByRole('button',{name:'Cambiar velocidad'}).click();
  await expect(dialog.getByRole('button',{name:'Cambiar velocidad'})).toHaveText('1.25×');
  await dialog.getByRole('button',{name:'Cerrar historia'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('San Rafael incluye a Alejo y queda fuera de la ruta geográfica',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Batallas',exact:true}).click();
  await expect(page.locator('.place-item')).toHaveCount(1);
  await page.locator('.place-item').click();
  await expect(page.locator('.featured-card')).toContainText('Batalla de San Rafael');
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);
  await page.getByRole('button',{name:'Descubrir su historia'}).click();
  await expect(page.getByRole('dialog')).toContainText('mestizo Alejo');
  await expect(page.getByRole('dialog')).toContainText('No atribuye la batalla a la comuna de Tomé');
});

test('guarda lugares entre sesiones y permite quitarlos',async({page})=>{
  await page.goto('/');
  await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();
  await page.getByRole('button',{name:'Guardar lugar',exact:true}).click();
  await page.reload();
  await page.getByRole('button',{name:/Mis lugares/}).click();
  await expect(page.locator('.place-item')).toHaveCount(1);
  await expect(page.locator('.place-item')).toContainText('Fábrica Bellavista');
  await page.locator('.place-item').click();
  await page.getByRole('button',{name:'Quitar de guardados',exact:true}).click();
  await expect(page.locator('.place-item')).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Aquí comienza tu colección'})).toBeVisible();
});

test('búsqueda, categoría, ciudad y ruta funcionan sin desbordar la pantalla',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Tomé Biobío, Chile'}).click();
  await page.getByRole('button',{name:'Tomé 6 historias para descubrir'}).click();
  await page.getByRole('textbox',{name:'Buscar un lugar o una historia'}).fill('Cristo');
  await expect(page.locator('.place-item')).toHaveCount(1);
  await expect(page.locator('.place-item')).toContainText('Iglesia Cristo Rey');
  await page.getByRole('textbox',{name:'Buscar un lugar o una historia'}).fill('sin coincidencias');
  await expect(page.getByRole('heading',{name:'No hay lugares en esta vista'})).toBeVisible();
  await page.getByRole('button',{name:'Explorar todos los lugares'}).click();
  await page.getByRole('button',{name:'Comenzar recorrido'}).click();
  await expect(page.getByRole('heading',{name:'Sigue los hilos de Tomé'})).toBeVisible();
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(1);
  await page.getByRole('button',{name:'Finalizar recorrido'}).click();
  await expect(page.locator('.leaflet-overlay-pane path')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});

test('narración usa el texto del lugar y responde a pausa y detención',async({page})=>{
  await page.addInitScript(()=>{
    window.__speech={text:'',paused:false,stopped:false};
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){window.__speech.stopped=true;},pause(){window.__speech.paused=true;},resume(){window.__speech.paused=false;},getVoices(){return [];},speak(u){window.__speech.text=u.text;}}});
  });
  await page.goto('/');await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();await page.getByRole('button',{name:'Descubrir su historia'}).click();
  await page.getByRole('tab',{name:'Escuchar'}).click();await page.getByRole('button',{name:'Reproducir narración'}).click();
  expect(await page.evaluate(()=>window.__speech.text)).toContain('fundada en 1865');
  await page.getByRole('button',{name:'Pausar narración'}).click();expect(await page.evaluate(()=>window.__speech.paused)).toBeTruthy();
  await page.getByRole('button',{name:'Detener narración'}).click();await expect(page.getByRole('button',{name:'Reproducir narración'})).toBeVisible();
});
