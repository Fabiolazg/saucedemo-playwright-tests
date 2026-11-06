
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';

test.describe('Testes do carrinho - SauceDemo', () => {

  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);

    cartPage = new CartPage(page);
  });

  
test('CAR-01 - Adicionar um produto', async () => {
  await cartPage.adicionarProduto('sauce-labs-backpack');

  // Verificar contador
  await expect(cartPage.cartBadge).toHaveText('1');

  // Abrir o carrinho
  await cartPage.abrirCarrinho();

  // Confirmar que estamos na página correta
  await expect(cartPage.page).toHaveURL(/cart\.html/);

  // Verificar que existe apenas um produto no carrinho
  await expect(cartPage.cartItems).toHaveCount(1);

  // Confirmar que o produto correto foi adicionado
  await expect(
    cartPage.cartItems.getByText('Sauce Labs Backpack', {
      exact: true
    })
  ).toBeVisible();
});

  test('CAR-02 - Adicionar múltiplos produtos', async ({ page }) => {
    await cartPage.adicionarProduto('sauce-labs-backpack');
    await cartPage.adicionarProduto('sauce-labs-bike-light');

    await expect(cartPage.cartBadge).toHaveText('2');

    await cartPage.abrirCarrinho();

    await expect(cartPage.cartItems).toHaveCount(2);

    await expect(
      page.locator('[data-test="inventory-item-name"]')
    ).toHaveText([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light'
    ]);
  });


test('CAR-03 - Remover produto do carrinho', async ({ page }) => {
  // Adicionar os dois produtos
  await cartPage.adicionarProduto('sauce-labs-backpack');
  await cartPage.adicionarProduto('sauce-labs-bike-light');

  await expect(cartPage.cartBadge).toHaveText('2');

  // Abrir o carrinho
  await cartPage.abrirCarrinho();

  await expect(page).toHaveURL(/cart\.html/);
  await expect(cartPage.cartItems).toHaveCount(2);

  // Remover a mochila
  await cartPage.removerProduto('sauce-labs-backpack');

  // Verificar atualização do carrinho
  await expect(cartPage.cartBadge).toHaveText('1');
  await expect(cartPage.cartItems).toHaveCount(1);

  // Confirmar que apenas a Bike Light permanece
  await expect(
    cartPage.cartItems
      .locator('[data-test="inventory-item-name"]')
  ).toHaveText('Sauce Labs Bike Light');
});

  test('CAR-04 - Validar nomes e preços', async ({ page }) => {
    const produtos = [
      'sauce-labs-backpack',
      'sauce-labs-bike-light'
    ];

    const informacoes: {
      nome: string;
      preco: string;
    }[] = [];

    for (const id of produtos) {
      const item = page.locator('[data-test="inventory-item"]')
        .filter({
          has: page.locator(`[data-test="add-to-cart-${id}"]`)
        });

      informacoes.push({
        nome: await item.locator(
          '[data-test="inventory-item-name"]'
        ).innerText(),

        preco: await item.locator(
          '[data-test="inventory-item-price"]'
        ).innerText()
      });

      await cartPage.adicionarProduto(id);
    }

    await cartPage.abrirCarrinho();

    for (const produto of informacoes) {
      const item = cartPage.cartItems.filter({
        hasText: produto.nome
      });

      await expect(
        item.locator('[data-test="inventory-item-name"]')
      ).toHaveText(produto.nome);

      await expect(
        item.locator('[data-test="inventory-item-price"]')
      ).toHaveText(produto.preco);
    }
  });


test('CAR-05 - Persistência do carrinho', async ({ page }) => {
  // Adicionar produto
  await cartPage.adicionarProduto('sauce-labs-backpack');

  await expect(cartPage.cartBadge).toHaveText('1');

  // Navegar para a página de detalhes do produto
  await page.locator('[data-test="item-4-title-link"]').click();

  await expect(
    page.locator('[data-test="back-to-products"]')
  ).toBeVisible();

  // Voltar para o catálogo
  await page.locator('[data-test="back-to-products"]').click();

  // Verificar se o contador continua correto
  await expect(cartPage.cartBadge).toHaveText('1');

  // Abrir o carrinho
  await cartPage.abrirCarrinho();

  await expect(page).toHaveURL(/cart\.html/);

  // Verificar se o produto permanece no carrinho
  await expect(cartPage.cartItems).toHaveCount(1);

  await expect(
    cartPage.cartItems.getByText('Sauce Labs Backpack', {
      exact: true
    })
  ).toBeVisible();
});

});
