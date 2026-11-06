
import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly produtos: Locator;
  readonly nomes: Locator;
  readonly precos: Locator;
  readonly imagens: Locator;
  readonly ordenacao: Locator;

  constructor(page: Page) {
    this.page = page;

    this.produtos = page.locator('[data-test="inventory-item"]');
    this.nomes = page.locator('[data-test="inventory-item-name"]');
    this.precos = page.locator('[data-test="inventory-item-price"]');
    this.imagens = page.locator('[data-test="inventory-item"] img');
    this.ordenacao = page.locator('[data-test="product-sort-container"]');
  }

  async selecionarOrdenacao(valor: string) {
    await this.ordenacao.selectOption(valor);
  }

  async obterNomes(): Promise<string[]> {
    return this.nomes.allTextContents();
  }

  async obterPrecos(): Promise<number[]> {
    const textos = await this.precos.allTextContents();

    return textos.map(texto =>
      Number(texto.replace('$', '').trim())
    );
  }
}
