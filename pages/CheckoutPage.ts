
import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;

  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');

    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');

    this.errorMessage = page.locator('[data-test="error"]');

    this.subtotal = page.locator('[data-test="subtotal-label"]');
    this.tax = page.locator('[data-test="tax-label"]');
    this.total = page.locator('[data-test="total-label"]');

    this.confirmation = page.locator('[data-test="complete-header"]');
  }

  async iniciarCheckout() {
    await this.page.locator('[data-test="checkout"]').click();
  }

  async preencherDados(
    nome: string,
    sobrenome: string,
    cep: string
  ) {
    await this.firstName.fill(nome);
    await this.lastName.fill(sobrenome);
    await this.postalCode.fill(cep);
  }

  async continuar() {
    await this.continueButton.click();
  }

  async finalizar() {
    await this.finishButton.click();
  }

  async cancelar() {
    await this.cancelButton.click();
  }
}