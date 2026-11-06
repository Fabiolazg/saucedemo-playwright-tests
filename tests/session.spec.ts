
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Testes de sessão e controle de acesso - SauceDemo', () => {

  test('SEG-01 - Logout e bloqueio de acesso após sair', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Realizar autenticação
    await loginPage.acessar();
    await loginPage.realizarLogin('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);

    // Abrir menu lateral e realizar logout
    await page.locator('#react-burger-menu-btn').click();

    await page.locator('[data-test="logout-sidebar-link"]').click();

    // Verificar retorno à tela de login
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    await expect(loginPage.loginButton).toBeVisible();

    // Tentar acessar novamente o catálogo
    await page.goto('https://www.saucedemo.com/inventory.html');

    // O sistema deve impedir o acesso sem sessão
    await expect(page).not.toHaveURL(/inventory\.html/);

    await expect(loginPage.loginButton).toBeVisible();
  });

  test('SEG-02 - Bloquear acesso direto sem autenticação', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Iniciar uma sessão sem realizar login
    await loginPage.acessar();

    // Tentar acessar diretamente o catálogo
    await page.goto('https://www.saucedemo.com/inventory.html');

    // Verificar que a página protegida não está acessível
    await expect(page).not.toHaveURL(/inventory\.html/);

    await expect(loginPage.loginButton).toBeVisible();
  });

});