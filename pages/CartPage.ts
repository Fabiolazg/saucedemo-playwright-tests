
import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
  }

  async abrirCarrinho() {
    await this.cartIcon.click();
  }

  async adicionarProduto(id: string) {
    await this.page.locator(`[data-test="add-to-cart-${id}"]`).click();
  }

  async removerProduto(id: string) {
    await this.page.locator(`[data-test="remove-${id}"]`).click();
  }
}
