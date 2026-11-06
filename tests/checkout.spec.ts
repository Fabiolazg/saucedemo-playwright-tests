
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { converterParaCentavos } from '../utils/price-calculator';

test.describe('Testes de checkout - SauceDemo', () => {

  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);

    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await cartPage.adicionarProduto('sauce-labs-backpack');
    await cartPage.adicionarProduto('sauce-labs-bike-light');

    await cartPage.abrirCarrinho();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.cartItems).toHaveCount(2);

    await checkoutPage.iniciarCheckout();

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('CHK-01 - Finalizar compra completa', async ({ page }) => {
    await checkoutPage.preencherDados(
      'Ana', 'Silva', '29700-000'
    );

    await checkoutPage.continuar();

    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.finalizar();

    await expect(page).toHaveURL(/checkout-complete\.html/);

    await expect(checkoutPage.confirmation)
      .toHaveText('Thank you for your order!');
  });

  test('CHK-02 - Primeiro nome obrigatório', async ({ page }) => {
    await checkoutPage.preencherDados(
      '', 'Silva', '29700-000'
    );

    await checkoutPage.continuar();

    await expect(checkoutPage.errorMessage)
      .toContainText('First Name is required');

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('CHK-03 - Sobrenome obrigatório', async ({ page }) => {
    await checkoutPage.preencherDados(
      'Ana', '', '29700-000'
    );

    await checkoutPage.continuar();

    await expect(checkoutPage.errorMessage)
      .toContainText('Last Name is required');

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('CHK-04 - Código postal obrigatório', async ({ page }) => {
    await checkoutPage.preencherDados(
      'Ana', 'Silva', ''
    );

    await checkoutPage.continuar();

    await expect(checkoutPage.errorMessage)
      .toContainText('Postal Code is required');

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('CHK-05 - Validar valores do pedido', async ({ page }) => {
    // Os itens já foram adicionados no beforeEach.
    // Capturar os preços efetivos do carrinho no resumo
    // da compra e validar o subtotal.

    await checkoutPage.preencherDados(
      'Ana', 'Silva', '29700-000'
    );

    await checkoutPage.continuar();

    await expect(page).toHaveURL(/checkout-step-two\.html/);

    const itens = page.locator('[data-test="inventory-item"]');

    await expect(itens).toHaveCount(2);

    let subtotalEsperado = 0;

    for (const item of await itens.all()) {
      const precoTexto = await item.locator(
        '[data-test="inventory-item-price"]'
      ).innerText();

      const quantidadeTexto = await item.locator(
        '[data-test="item-quantity"]'
      ).innerText();

      const precoCentavos = converterParaCentavos(precoTexto);
      const quantidade = Number(quantidadeTexto);

      expect(Number.isInteger(quantidade)).toBe(true);
      expect(quantidade).toBeGreaterThan(0);

      subtotalEsperado += precoCentavos * quantidade;
    }

    const subtotalExibido = converterParaCentavos(
      await checkoutPage.subtotal.innerText()
    );

    const impostoExibido = converterParaCentavos(
      await checkoutPage.tax.innerText()
    );

    const totalExibido = converterParaCentavos(
      await checkoutPage.total.innerText()
    );

    // Validar a soma dos produtos
    expect(subtotalExibido).toBe(subtotalEsperado);

    // Validar a composição do valor total
    expect(totalExibido).toBe(
      subtotalExibido + impostoExibido
    );
  });

  test('CHK-06 - Cancelar checkout', async ({ page }) => {
    await checkoutPage.preencherDados(
      'Ana', 'Silva', '29700-000'
    );

    await checkoutPage.cancelar();

    // Cancelamento na etapa de informações
    // deve retornar ao carrinho.
    await expect(page).toHaveURL(/cart\.html/);

    // Os produtos devem permanecer no carrinho.
    await expect(cartPage.cartItems).toHaveCount(2);

    await expect(cartPage.cartBadge).toHaveText('2');
  });

});
