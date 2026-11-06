
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Testes do catálogo - SauceDemo', () => {

  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);

    inventoryPage = new InventoryPage(page);
  });


test('PRO-01 - Validar listagem de produtos', async () => {
  // Aguardar o catálogo apresentar os seis produtos
  await expect(inventoryPage.produtos).toHaveCount(6);

  for (const produto of await inventoryPage.produtos.all()) {

    const nome = produto.locator(
      '[data-test="inventory-item-name"]'
    );

    const preco = produto.locator(
      '[data-test="inventory-item-price"]'
    );

    const imagem = produto.locator('img');

    // Verificar se os dados essenciais aparecem
    await expect(nome).toBeVisible();
    await expect(preco).toBeVisible();
    await expect(imagem).toBeVisible();

    // Aguardar o carregamento efetivo da imagem
    await expect.poll(async () => {
      return await imagem.evaluate(
        (img: HTMLImageElement) =>
          img.complete && img.naturalWidth > 0
      );
    }, {
      message: 'A imagem do produto não carregou corretamente',
      timeout: 10000
    }).toBe(true);
  }
});

  test('PRO-02 - Validar ordenação alfabética', async () => {
    await inventoryPage.selecionarOrdenacao('az');

    const nomesAZ = await inventoryPage.obterNomes();

    expect(nomesAZ).toEqual(
      [...nomesAZ].sort((a, b) => a.localeCompare(b, 'en'))
    );

    await inventoryPage.selecionarOrdenacao('za');

    const nomesZA = await inventoryPage.obterNomes();

    expect(nomesZA).toEqual(
      [...nomesZA].sort((a, b) => b.localeCompare(a, 'en'))
    );
  });

  test('PRO-03 - Validar ordenação por preço', async () => {
    await inventoryPage.selecionarOrdenacao('lohi');

    const precosCrescentes = await inventoryPage.obterPrecos();

    expect(precosCrescentes).toEqual(
      [...precosCrescentes].sort((a, b) => a - b)
    );

    await inventoryPage.selecionarOrdenacao('hilo');

    const precosDecrescentes = await inventoryPage.obterPrecos();

    expect(precosDecrescentes).toEqual(
      [...precosDecrescentes].sort((a, b) => b - a)
    );
  });

  
test('PRO-04 - Validar informações do produto', async ({ page }) => {
  const primeiroProduto = inventoryPage.produtos.first();

  // Capturar informações exibidas no catálogo
  const nome = await primeiroProduto
    .locator('[data-test="inventory-item-name"]')
    .innerText();

  const preco = await primeiroProduto
    .locator('[data-test="inventory-item-price"]')
    .innerText();

  // Abrir a página de detalhes do produto
  await primeiroProduto
    .locator('[data-test="inventory-item-name"]')
    .click();

  // Confirmar que a página de detalhes foi aberta
  await expect(
    page.locator('[data-test="back-to-products"]')
  ).toBeVisible();

  // Verificar a consistência das informações
  await expect(
    page.locator('.inventory_details_name')
  ).toHaveText(nome);

  await expect(
    page.locator('.inventory_details_price')
  ).toHaveText(preco);
});

});
