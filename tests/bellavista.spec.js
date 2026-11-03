import { test, expect } from '@playwright/test';

async function openBellavista(page){
  await page.route(/^https:\/\//,route=>route.abort());
  await page.goto('/');
  await page.locator('.place-item').filter({hasText:'Fábrica Bellavista'}).click();
  await page.getByRole('button',{name:'Descubrir su historia'}).click();
  return page.getByRole('dialog');
}

test('Bellavista abre la lectura y muestra fotos locales aunque no haya red externa',async({page})=>{
  const story=await openBellavista(page);
  await expect(story.getByRole('heading',{name:'Fábrica Bellavista'})).toBeVisible();
  await expect(story.getByRole('tab',{name:'Leer',exact:true})).toHaveAttribute('aria-selected','true');
  const image=story.getByRole('img',{name:'Fábrica Textil Bellavista Oveja Tomé',exact:true});
  await image.evaluate(img=>img.decode());
  expect(await image.evaluate(img=>img.naturalWidth)).toBe(1600);
  await story.getByRole('button',{name:'Carlos Werner',exact:true}).click();
  await expect(story.locator('#werner-biography')).toBeVisible();
  const portrait=story.getByRole('img',{name:'Retrato de Carlos Werner Richter',exact:true});
  await portrait.evaluate(img=>img.decode());
  expect(await portrait.evaluate(img=>img.naturalWidth)).toBe(250);
  await expect(story.getByRole('link',{name:'Leer su biografía en la BCN'})).toHaveAttribute('href','https://www.bcn.cl/historiapolitica/resenas_parlamentarias/wiki/Carlos_Werner_Richter');
  await story.getByRole('button',{name:'Cerrar historia'}).click();
  await expect(story).toHaveCount(0);
});

test('se puede ampliar en la misma página y consultar la atribución y licencia de cada foto',async({page})=>{
  const story=await openBellavista(page);
  await expect(story.locator('.archive-gallery figcaption')).toContainText('Génesis Domínguez Elgorriaga');
  await expect(story.locator('.archive-gallery .photo-license')).toHaveAttribute('href','https://creativecommons.org/licenses/by-sa/4.0/');
  await expect(story.locator('.archive-gallery .photo-permission')).toContainText('misma licencia');
  await story.getByRole('button',{name:'Ampliar fotografía: Fábrica Textil Bellavista Oveja Tomé'}).click();
  await expect(story.locator('.archive-gallery figure')).toHaveClass(/photo-expanded/);
  await story.getByRole('button',{name:'Reducir fotografía: Fábrica Textil Bellavista Oveja Tomé'}).click();
  await expect(story.locator('.archive-gallery figure')).not.toHaveClass(/photo-expanded/);
  await story.getByRole('button',{name:'¿Quién fue Carlos Werner?'}).click();
  await expect(story.locator('.portrait-photo figcaption')).toContainText('Dominio público, según Wikimedia Commons');
  await expect(story.locator('.portrait-photo .photo-license')).toHaveAttribute('href','https://commons.wikimedia.org/wiki/File:Carlos_Werner.jpg#Licensing');
  await expect(story.locator('.portrait-photo .photo-credit')).toContainText('Autor no identificado');
});

test('una foto que no puede mostrarse se sustituye por descripción y enlace exacto a su ficha',async({page})=>{
  const story=await openBellavista(page);
  const image=story.getByRole('img',{name:'Fábrica Textil Bellavista Oveja Tomé',exact:true});
  await image.evaluate(img=>{img.src='data:image/jpeg;base64,broken';});
  await expect(story.locator('.photo-failed')).toContainText('Aquí se vería una fotografía de la fachada de la Fábrica Bellavista');
  await expect(story.getByRole('link',{name:'Ver fotografía en su página original',exact:true})).toHaveAttribute('href','https://commons.wikimedia.org/wiki/File:F%C3%A1brica_Textil_Bellavista_Oveja_Tom%C3%A9.jpg');
  await expect(story.locator('.archive-gallery .photo-credit')).toContainText('Génesis Domínguez Elgorriaga');
});
