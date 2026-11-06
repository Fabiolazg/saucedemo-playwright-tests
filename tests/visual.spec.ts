
import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'node:fs';

test.describe('Testes de regressão visual - SauceDemo', () => {

  test.use({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1
  });

  async function login(page: Page, usuario: string) {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin(usuario, 'secret_sauce');
  }

  async function prepararCatalogo(page: Page, usuario: string) {
    await login(page, usuario);

    await expect(page).toHaveURL(/inventory\.html/);

    await page.locator('[data-test="product-sort-container"]').selectOption('az');

    await expect(
      page.locator('[data-test="inventory-container"]')
    ).toBeVisible();
  }

  test('VIS-01 - Regressão visual da tela de login', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    await expect(page).toHaveScreenshot('VIS-01-login.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('VIS-02 - Regressão visual do catálogo', async ({ page }) => {
    await prepararCatalogo(page, 'standard_user');

    await expect(
      page.locator('[data-test="inventory-container"]')
    ).toHaveScreenshot('VIS-02-catalogo.png', {
      animations: 'disabled'
    });
  });

  test('VIS-03 - Regressão visual do carrinho', async ({ page }) => {
    await prepararCatalogo(page, 'standard_user');

    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    await page.locator('[data-test="shopping-cart-link"]').click();

    await expect(page).toHaveURL(/cart\.html/);

    await expect(
      page.locator('[data-test="cart-list"]')
    ).toHaveScreenshot('VIS-03-carrinho.png', {
      animations: 'disabled'
    });
  });

  test('VIS-04 - Comparação visual entre standard_user e visual_user', async ({ browser }) => {
    const contextoStandard = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1
    });

    const contextoVisual = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      deviceScaleFactor: 1
    });

    try {
      const paginaStandard = await contextoStandard.newPage();
      const paginaVisual = await contextoVisual.newPage();

      await prepararCatalogo(paginaStandard, 'standard_user');
      await prepararCatalogo(paginaVisual, 'visual_user');

      const areaStandard = paginaStandard.locator('[data-test="inventory-container"]');
      const areaVisual = paginaVisual.locator('[data-test="inventory-container"]');

      const screenshotStandard = await areaStandard.screenshot();
      const screenshotVisual = await areaVisual.screenshot();

      const caminhoStandard = test.info().outputPath('VIS-04-standard.png');
      const caminhoVisual = test.info().outputPath('VIS-04-visual.png');
      const caminhoDiff = test.info().outputPath('VIS-04-diff.png');

      fs.writeFileSync(caminhoStandard, screenshotStandard);
      fs.writeFileSync(caminhoVisual, screenshotVisual);

      const imagemStandard = PNG.sync.read(screenshotStandard);
      const imagemVisual = PNG.sync.read(screenshotVisual);

      expect(imagemStandard.width).toBe(imagemVisual.width);
      expect(imagemStandard.height).toBe(imagemVisual.height);

      const diff = new PNG({
        width: imagemStandard.width,
        height: imagemStandard.height
      });

      const diffPixels = pixelmatch(
        imagemStandard.data,
        imagemVisual.data,
        diff.data,
        imagemStandard.width,
        imagemStandard.height,
        { threshold: 0.1 }
      );

      fs.writeFileSync(caminhoDiff, PNG.sync.write(diff));

      console.log(`Diferenças visuais detectadas: ${diffPixels}`);
      const totalPixels = imagemStandard.width * imagemStandard.height;

const percentualDiferenca = (diffPixels / totalPixels) * 100;

console.log(
  `Percentual de diferença visual: ${percentualDiferenca.toFixed(2)}%`
);
      console.log(`Imagem standard: ${caminhoStandard}`);
      console.log(`Imagem visual: ${caminhoVisual}`);
      console.log(`Imagem diff: ${caminhoDiff}`);

      expect(
        diffPixels,
        'Foram detectadas diferenças visuais entre standard_user e visual_user'
      ).toBe(0);

    } finally {
      await contextoStandard.close();
      await contextoVisual.close();
    }
  });

});