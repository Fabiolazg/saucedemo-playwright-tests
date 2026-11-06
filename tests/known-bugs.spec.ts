
import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// =====================================================
// TIPOS E FUNÇÕES AUXILIARES
// =====================================================

type ProdutoImagem = {
  nome: string;
  imagem: string;
};

type EstadoCarrinho = {
  etapa: string;
  quantidade: number;
  produtos: string[];
};

// Realiza login e confirma o acesso ao catálogo
async function autenticar(page: Page, usuario: string) {
  const loginPage = new LoginPage(page);

  await loginPage.acessar();
  await loginPage.realizarLogin(usuario, 'secret_sauce');

  await expect(page).toHaveURL(/inventory\.html/);
}

// Coleta os produtos e os endereços das imagens
async function obterImagensProdutos(
  page: Page,
  usuario: string
): Promise<ProdutoImagem[]> {
  await autenticar(page, usuario);

  const produtos = page.locator('[data-test="inventory-item"]');

  await expect(produtos).toHaveCount(6);

  const resultado: ProdutoImagem[] = [];

  for (const produto of await produtos.all()) {
    const nome = await produto
      .locator('[data-test="inventory-item-name"]')
      .innerText();

    const imagem = produto.locator('img');

    await expect(imagem).toBeVisible();

    const origem = await imagem.getAttribute('src');

    expect(origem).toBeTruthy();

    resultado.push({
      nome: nome.trim(),
      imagem: new URL(origem!, page.url()).href
    });
  }

  return resultado;
}

// Coleta o estado atual do carrinho sem exigir
// antecipadamente que ele esteja correto
async function coletarEstadoCarrinho(
  page: Page,
  etapa: string
): Promise<EstadoCarrinho> {
  await expect(page).toHaveURL(/cart\.html/);

  const itens = page.locator(
    '[data-test="inventory-item"]'
  );

  // Aguarda o carregamento da área do carrinho
  await expect(
    page.locator('[data-test="cart-list"]')
  ).toBeVisible();

  const nomes = await itens
    .locator('[data-test="inventory-item-name"]')
    .allTextContents();

  const badge = page.locator(
    '[data-test="shopping-cart-badge"]'
  );

  const quantidade = await badge.count() > 0
    ? Number(await badge.innerText())
    : 0;

  const estado: EstadoCarrinho = {
    etapa,
    quantidade,
    produtos: nomes.map(nome => nome.trim()).sort()
  };

  console.log(
    `[${etapa}] Quantidade: ${estado.quantidade}`
  );

  console.log(
    `[${etapa}] Produtos: ${estado.produtos.join(', ')}`
  );

  return estado;
}

// =====================================================
// TESTES DE DETECÇÃO DE DEFEITOS
// =====================================================

test.describe('Detecção de defeitos - SauceDemo', () => {

  // ===================================================
  // BUG-01 - IMAGENS INCORRETAS
  // ===================================================

  test('BUG-01 - Detectar imagens incorretas do problem_user',
    async ({ browser }) => {

      const contextoNormal = await browser.newContext();
      const contextoProblema = await browser.newContext();

      try {
        const paginaNormal = await contextoNormal.newPage();
        const paginaProblema = await contextoProblema.newPage();

        const produtosNormais = await obterImagensProdutos(
          paginaNormal,
          'standard_user'
        );

        const produtosProblema = await obterImagensProdutos(
          paginaProblema,
          'problem_user'
        );

        const referencias = new Map(
          produtosNormais.map(p => [p.nome, p.imagem])
        );

        let divergencias = 0;

        for (const produto of produtosProblema) {
          const imagemEsperada = referencias.get(produto.nome);

          expect(imagemEsperada).toBeDefined();

          if (imagemEsperada !== produto.imagem) {
            divergencias++;

            console.log(
              `DIVERGÊNCIA: ${produto.nome}`
            );

            console.log(
              `Esperada: ${imagemEsperada}`
            );

            console.log(
              `Obtida: ${produto.imagem}`
            );
          }

          expect.soft(
            produto.imagem,
            `Imagem diferente para ${produto.nome}`
          ).toBe(imagemEsperada);
        }

        console.log(
          `Total de divergências identificadas: ${divergencias}`
        );

        await paginaNormal.screenshot({
          path: test.info().outputPath(
            'BUG-01-referencia.png'
          ),
          fullPage: true
        });

        await paginaProblema.screenshot({
          path: test.info().outputPath(
            'BUG-01-problem-user.png'
          ),
          fullPage: true
        });

      } finally {
        await contextoNormal.close();
        await contextoProblema.close();
      }
    }
  );

  // ===================================================
  // BUG-02 - OPERAÇÕES DO CARRINHO
  // ===================================================

  test('BUG-02 - Detectar falhas nas operações do carrinho',
    async ({ browser }) => {

      async function executarFluxo(usuario: string) {
        const contexto = await browser.newContext();
        const page = await contexto.newPage();

        const estados: EstadoCarrinho[] = [];

        try {
          await autenticar(page, usuario);

          // ETAPA 1: Adicionar Backpack
          await page.locator(
            '[data-test="add-to-cart-sauce-labs-backpack"]'
          ).click();

          await page.locator(
            '[data-test="shopping-cart-link"]'
          ).click();

          estados.push(
            await coletarEstadoCarrinho(
              page,
              'Adicionar Backpack'
            )
          );

          // ETAPA 2: Adicionar Bike Light
          await page.locator(
            '[data-test="continue-shopping"]'
          ).click();

          await expect(page).toHaveURL(/inventory\.html/);

          await page.locator(
            '[data-test="add-to-cart-sauce-labs-bike-light"]'
          ).click();

          await page.locator(
            '[data-test="shopping-cart-link"]'
          ).click();

          estados.push(
            await coletarEstadoCarrinho(
              page,
              'Adicionar Bike Light'
            )
          );

          // ETAPA 3: Remover Backpack
          const botaoRemover = page.locator(
            '[data-test="remove-sauce-labs-backpack"]'
          );

          if (await botaoRemover.isVisible()) {
            await botaoRemover.click();
          } else {
            console.log(
              `[${usuario}] Botão de remover Backpack indisponível`
            );
          }

          estados.push(
            await coletarEstadoCarrinho(
              page,
              'Remover Backpack'
            )
          );

          // Evidência visual do estado final
          await page.screenshot({
            path: test.info().outputPath(
              `BUG-02-${usuario}.png`
            ),
            fullPage: true
          });

          return estados;

        } finally {
          await contexto.close();
        }
      }

      // EXECUÇÃO COM USUÁRIO DE REFERÊNCIA
      console.log('\n=== STANDARD USER ===');

      const referencia = await executarFluxo(
        'standard_user'
      );

      const resultadoEsperado: EstadoCarrinho[] = [
        {
          etapa: 'Adicionar Backpack',
          quantidade: 1,
          produtos: ['Sauce Labs Backpack']
        },
        {
          etapa: 'Adicionar Bike Light',
          quantidade: 2,
          produtos: [
            'Sauce Labs Backpack',
            'Sauce Labs Bike Light'
          ]
        },
        {
          etapa: 'Remover Backpack',
          quantidade: 1,
          produtos: ['Sauce Labs Bike Light']
        }
      ];

      // Validar o comportamento de referência
      expect(referencia).toEqual(resultadoEsperado);

      // EXECUÇÃO COM USUÁRIO INVESTIGADO
      console.log('\n=== ERROR USER ===');

      const resultado = await executarFluxo(
        'error_user'
      );

      let divergencias = 0;

      for (let i = 0; i < referencia.length; i++) {
        const esperado = referencia[i];
        const obtido = resultado[i];

        if (
          esperado.quantidade !== obtido?.quantidade ||
          JSON.stringify(esperado.produtos) !==
            JSON.stringify(obtido?.produtos)
        ) {
          divergencias++;

          console.log(
            `\nDIVERGÊNCIA: ${esperado.etapa}`
          );

          console.log('Esperado:', esperado);
          console.log('Obtido:', obtido);
        }

        // Registra falhas sem impedir a análise
        // das outras etapas
        expect.soft(
          obtido,
          `Falha na etapa: ${esperado.etapa}`
        ).toEqual(esperado);
      }

      console.log(
        `\nTotal de divergências identificadas: ${divergencias}`
      );
    }
  );

  
  // ===================================================
  // BUG-03 - CONSISTÊNCIA DOS PREÇOS
  // ===================================================

  test('BUG-03 - Validar consistência dos preços do visual_user',
    async ({ browser }) => {

      type PrecosProduto = {
        usuario: string;
        catalogo: string;
        detalhes: string;
        carrinho: string;
      };

      async function coletarPrecos(
        usuario: string
      ): Promise<PrecosProduto> {

        const contexto = await browser.newContext();
        const page = await contexto.newPage();

        try {
          await autenticar(page, usuario);

          // Localizar especificamente o Backpack
          const produto = page.locator(
            '[data-test="inventory-item"]'
          ).filter({
            has: page.locator(
              '[data-test="item-4-title-link"]'
            )
          });

          await expect(produto).toHaveCount(1);

          // 1. Preço no catálogo
          const precoCatalogo = (
            await produto.locator(
              '[data-test="inventory-item-price"]'
            ).innerText()
          ).trim();

          // 2. Preço na página de detalhes
          await page.locator(
            '[data-test="item-4-title-link"]'
          ).click();

          await expect(
            page.locator('[data-test="back-to-products"]')
          ).toBeVisible();

          const precoDetalhes = (
            await page.locator(
              '.inventory_details_price'
            ).innerText()
          ).trim();

          // Voltar ao catálogo
          await page.locator(
            '[data-test="back-to-products"]'
          ).click();

          // Adicionar Backpack ao carrinho
          await page.locator(
            '[data-test="add-to-cart-sauce-labs-backpack"]'
          ).click();

          await page.locator(
            '[data-test="shopping-cart-link"]'
          ).click();

          await expect(page).toHaveURL(/cart\.html/);

          const itemCarrinho = page.locator(
            '[data-test="inventory-item"]'
          ).filter({
            hasText: 'Sauce Labs Backpack'
          });

          await expect(itemCarrinho).toHaveCount(1);

          // 3. Preço no carrinho
          const precoCarrinho = (
            await itemCarrinho.locator(
              '[data-test="inventory-item-price"]'
            ).innerText()
          ).trim();

          // Guardar evidência
          await page.screenshot({
            path: test.info().outputPath(
              `BUG-03-${usuario}.png`
            ),
            fullPage: true
          });

          console.log(`\n=== ${usuario} ===`);
          console.log(`Catálogo: ${precoCatalogo}`);
          console.log(`Detalhes: ${precoDetalhes}`);
          console.log(`Carrinho: ${precoCarrinho}`);

          return {
            usuario,
            catalogo: precoCatalogo,
            detalhes: precoDetalhes,
            carrinho: precoCarrinho
          };

        } finally {
          await contexto.close();
        }
      }

      // Coletar os preços dos dois usuários
      const referencia = await coletarPrecos(
        'standard_user'
      );

      const investigado = await coletarPrecos(
        'visual_user'
      );

      // Validar consistência interna do usuário normal
      expect(referencia.detalhes)
        .toBe(referencia.catalogo);

      expect(referencia.carrinho)
        .toBe(referencia.catalogo);

      let divergencias = 0;

      // Comparar as três telas entre os perfis
      const telas = [
        'catalogo',
        'detalhes',
        'carrinho'
      ] as const;

      for (const tela of telas) {
        const esperado = referencia[tela];
        const obtido = investigado[tela];

        if (esperado !== obtido) {
          divergencias++;

          console.log(`DIVERGÊNCIA: ${tela}`);
          console.log(`Esperado: ${esperado}`);
          console.log(`Obtido: ${obtido}`);
        }

        expect.soft(
          obtido,
          `Preço divergente na tela: ${tela}`
        ).toBe(esperado);
      }

      // Conferir consistência dentro do visual_user
      expect.soft(
        investigado.detalhes,
        'Preço mudou entre catálogo e detalhes'
      ).toBe(investigado.catalogo);

      expect.soft(
        investigado.carrinho,
        'Preço mudou entre catálogo e carrinho'
      ).toBe(investigado.catalogo);

      console.log(
        `\nTotal de divergências entre perfis: ${divergencias}`
      );
    }
  );

});