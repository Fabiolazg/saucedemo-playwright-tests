
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Testes de autenticação - SauceDemo', () => {

  test('AUT-01 - Login com credenciais válidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="title"]'))
      .toHaveText('Products');
  });

  test('AUT-02 - Login com senha incorreta', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('standard_user', 'senha_incorreta_123');

    await expect(loginPage.errorMessage)
      .toContainText('Username and password do not match');

    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('AUT-03 - Login com usuário inexistente', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('usuario_inexistente', 'secret_sauce');

    await expect(loginPage.errorMessage)
      .toContainText('Username and password do not match');

    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('AUT-04 - Validação de campos obrigatórios', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();

    // Cenário 1: usuário e senha vazios
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage)
      .toContainText('Username is required');

    // Cenário 2: usuário preenchido e senha vazia
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage)
      .toContainText('Password is required');

    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('AUT-05 - Login com usuário bloqueado', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.acessar();
    await loginPage.realizarLogin('locked_out_user', 'secret_sauce');

    await expect(loginPage.errorMessage)
      .toContainText('Sorry, this user has been locked out');

    await expect(page).not.toHaveURL(/inventory\.html/);
  });

});
