import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const prototype = new URL('../prototipo.html',import.meta.url);

test('el HTML autónomo carga todos sus recursos desde un único documento',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const html=await readFile(prototype,'utf8');
  await page.route('**/*',route=>route.request().url()==='https://prototype.test/'
    ?route.fulfill({contentType:'text/html',body:html})
    :route.abort());
  await page.goto('https://prototype.test/');
  await expect(page.getByRole('heading',{name:'La historia está a tus pasos.'})).toBeVisible();
  await expect(page.locator('.place-item')).toHaveCount(6);
  await expect(page.locator('.offline-note')).toBeVisible();
  await expect(page.locator('.featured-card')).toHaveCount(0);
  await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();
  await page.getByRole('button',{name:'Descubrir su historia'}).click();
  const imageLoaded = await page.locator('.story-cover').evaluate(async el=>{
    const url=getComputedStyle(el).backgroundImage.slice(5,-2);
    if(!url.startsWith('data:'))return false;
    const image=new Image();image.src=url;await image.decode();return image.naturalWidth>0;
  });
  expect(imageLoaded).toBeTruthy();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Fábrica Bellavista'})).toBeVisible();
  await page.getByRole('tab',{name:'Ver reel'}).click();
  await page.getByRole('button',{name:'Escena siguiente'}).click();
  await expect(page.getByRole('heading',{name:'Una memoria entretejida'})).toBeVisible();
  await page.getByRole('button',{name:'Cerrar historia'}).click();
  await page.getByRole('link',{name:'Caminando con la Historia, inicio'}).click();
  await expect(page.locator('.place-item')).toHaveCount(6);
  expect(errors).toEqual([]);
});

test('el HTML autónomo arranca en iframe con scripts y sin acceso al almacenamiento',async({page})=>{
  const html=await readFile(prototype,'utf8');
  await page.route(/^https?:/,route=>route.abort());
  await page.goto('about:blank');
  await page.setContent('<iframe title="Prototipo" sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe>');
  await page.locator('iframe').evaluate((el,content)=>{el.srcdoc=content;},html);
  const app=page.frameLocator('iframe');
  await expect(app.getByRole('heading',{name:'La historia está a tus pasos.'})).toBeVisible();
  await app.getByRole('button',{name:'Batallas',exact:true}).click();
  await app.locator('.place-item').click();
  await app.getByRole('button',{name:'Descubrir su historia'}).click();
  await expect(app.getByRole('dialog')).toContainText('mestizo Alejo');
});
