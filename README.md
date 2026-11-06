# Automação de Testes de Software — SauceDemo

Projeto de automação de testes desenvolvido para a disciplina de **Qualidade e Teste de Software**, do curso de Sistemas de Informação do Centro Universitário do Espírito Santo (UNESC).

O projeto tem como objetivo implementar e executar testes automatizados em uma aplicação web de comércio eletrônico, utilizando **Playwright e TypeScript**, abrangendo testes funcionais, validações negativas, fluxos de ponta a ponta (E2E), investigação de defeitos e regressão visual.

A aplicação selecionada foi o [SauceDemo](https://www.saucedemo.com/), um ambiente de demonstração utilizado para práticas de teste de software.

## 1. Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Playwright | Automação e execução dos testes |
| TypeScript | Desenvolvimento dos scripts |
| Node.js | Ambiente de execução |
| Page Object Model (POM) | Organização e reutilização do código |
| Pixelmatch | Comparação de imagens por pixels |
| PNGJS | Processamento de imagens PNG |
| Git e GitHub | Versionamento do projeto |
| GitHub Actions | Integração contínua |
| Playwright HTML Reporter | Visualização dos resultados |

## 2. Objetivos

O projeto busca avaliar a qualidade de funcionalidades essenciais de uma aplicação web, utilizando diferentes técnicas de teste.

Os objetivos específicos são:

- Automatizar cenários positivos e negativos de autenticação.
- Validar a apresentação e a ordenação dos produtos.
- Verificar operações de inclusão, remoção e persistência do carrinho.
- Testar o fluxo completo de finalização de pedidos.
- Validar campos obrigatórios e cálculos monetários.
- Verificar o gerenciamento de sessões e o controle de acesso.
- Investigar inconsistências utilizando perfis específicos de teste.
- Aplicar técnicas de regressão visual.
- Executar os testes em diferentes motores de navegador.
- Automatizar a execução por meio de integração contínua.

## 3. Casos de teste implementados

Foram desenvolvidos **29 casos de teste**, organizados em sete módulos.

| Módulo | Identificadores | Quantidade |
|---|---|---:|
| Autenticação | AUT-01 a AUT-05 | 5 |
| Catálogo de produtos | PRO-01 a PRO-04 | 4 |
| Carrinho de compras | CAR-01 a CAR-05 | 5 |
| Checkout | CHK-01 a CHK-06 | 6 |
| Sessão e controle de acesso | SEG-01 a SEG-02 | 2 |
| Investigação de defeitos | BUG-01 a BUG-03 | 3 |
| Regressão visual | VIS-01 a VIS-04 | 4 |
| **Total** | | **29** |

Os 22 testes dos cinco primeiros módulos compõem a suíte funcional principal. Os demais casos são utilizados para investigar inconsistências e realizar comparações visuais.

## 4. Arquitetura do projeto

A automação utiliza o padrão **Page Object Model (POM)**, separando as ações realizadas nas páginas das verificações implementadas nos testes.

Essa organização facilita a reutilização de métodos, reduz a duplicação de código e melhora a manutenção.

```text
saucedemo-playwright-tests/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── pages/
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   ├── InventoryPage.ts
│   └── LoginPage.ts
├── tests/
│   ├── auth.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── known-bugs.spec.ts
│   ├── products.spec.ts
│   ├── session.spec.ts
│   ├── visual.spec.ts
│   └── visual.spec.ts-snapshots/
├── utils/
│   └── price-calculator.ts
├── playwright.config.ts
├── package.json
└── README.md
```

O diretório `pages` concentra as classes responsáveis pelas interações com a aplicação. A pasta `tests` reúne os casos automatizados, enquanto `utils` contém funções auxiliares, incluindo o tratamento de valores monetários.

Os arquivos de configuração definem os navegadores, as opções de execução e a integração contínua.

## 5. Instalação e execução

### Pré-requisitos

- Node.js compatível com a versão do Playwright utilizada.
- npm.
- Git.

### Clonar o repositório

```bash
git clone https://github.com/Fabiolazg/saucedemo-playwright-tests.git
cd saucedemo-playwright-tests
```

### Instalar dependências

```bash
npm ci
```

### Instalar os navegadores do Playwright

```bash
npx playwright install
```

### Executar os testes funcionais

```bash
npx playwright test tests/auth.spec.ts tests/products.spec.ts tests/cart.spec.ts tests/checkout.spec.ts tests/session.spec.ts
```

Esse comando executa os 22 casos funcionais nos navegadores configurados no projeto.

### Executar somente no Chromium

```bash
npx playwright test tests/auth.spec.ts tests/products.spec.ts tests/cart.spec.ts tests/checkout.spec.ts tests/session.spec.ts --project=chromium
```

### Executar os testes de investigação de defeitos

```bash
npx playwright test tests/known-bugs.spec.ts --project=chromium
```

Alguns testes dessa suíte foram desenvolvidos para identificar comportamentos incorretos presentes nos perfis especiais do SauceDemo. Portanto, reprovações decorrentes dessas inconsistências são resultados esperados da investigação, e não necessariamente falhas na implementação da automação.

### Executar os testes visuais

```bash
npx playwright test tests/visual.spec.ts --project=chromium
```

Os testes de regressão visual utilizam imagens de referência previamente geradas. As referências atualmente disponíveis foram produzidas no Chromium em ambiente Windows. Diferenças de sistema operacional, fontes ou renderização podem exigir referências específicas para outros ambientes.

### Abrir o relatório HTML

```bash
npx playwright show-report
```

## 6. Resultados dos testes funcionais

Após a implementação e os ajustes de sincronização e localização de elementos, foi realizada uma execução consolidada dos 22 testes funcionais em três motores de navegador.

| Navegador | Aprovados | Reprovados |
|---|---:|---:|
| Chromium | 22 | 0 |
| Firefox | 22 | 0 |
| WebKit | 22 | 0 |
| **Total** | **66** | **0** |

**Resultado:** 100% de aprovação na execução consolidada.

A execução local foi concluída em aproximadamente 47 segundos, demonstrando a possibilidade de realizar múltiplos testes de forma automatizada e paralela.

Esses resultados representam o ambiente e a versão avaliados, não uma garantia de ausência de defeitos na aplicação.

## 7. Investigação de defeitos

Além dos testes funcionais, foram implementados cenários específicos para identificar inconsistências utilizando contas especiais do SauceDemo.

### BUG-01 — Imagens incorretas

Foi realizada uma comparação entre as imagens do catálogo apresentadas pelos perfis `standard_user` e `problem_user`.

A automação identificou **seis divergências em seis produtos analisados**. No perfil investigado, todos os produtos utilizavam o mesmo recurso de imagem substituta, em vez dos arquivos específicos encontrados no usuário de referência.

**Resultado:** Reprovado — Inconsistências identificadas.

### BUG-02 — Operações do carrinho

Foram comparadas operações de inclusão e remoção de produtos entre os perfis `standard_user` e `error_user`.

As três operações analisadas produziram estados equivalentes, sem divergências na quantidade ou na identificação dos itens.

**Resultado:** Aprovado — Nenhuma divergência identificada no fluxo avaliado.

### BUG-03 — Consistência dos preços

Foi analisado o preço do produto Sauce Labs Backpack nas páginas de catálogo, detalhes e carrinho.

Durante a execução registrada, o perfil `standard_user` apresentou US$ 29,99 nas três páginas.

O perfil `visual_user` apresentou os seguintes valores:

| Página | Preço |
|---|---:|
| Catálogo | US$ 93,69 |
| Detalhes | US$ 29,99 |
| Carrinho | US$ 82,81 |

Foram identificadas duas divergências entre os perfis e violações de consistência interna do preço apresentado.

**Resultado:** Reprovado — Inconsistências identificadas.

## 8. Testes de regressão visual

Foram implementados quatro cenários de comparação visual.

Os três primeiros utilizam o método `toHaveScreenshot()` do Playwright para comparar capturas de tela com imagens de referência.

O quarto teste utiliza Pixelmatch e PNGJS para comparar o catálogo apresentado pelos perfis `standard_user` e `visual_user`.

| Teste | Resultado observado |
|---|---|
| VIS-01 — Tela de login | Aprovado |
| VIS-02 — Catálogo de produtos | Aprovado na última execução |
| VIS-03 — Carrinho de compras | Aprovado na última execução |
| VIS-04 — Comparação entre perfis | Reprovado — Diferenças identificadas |

No VIS-04 foram observadas alterações como substituição de imagem de produto, variações nos preços, deslocamentos de textos e sobreposição de elementos.

A quantidade de pixels divergentes apresentou variação entre execuções. Por esse motivo, a análise visual foi complementada pela inspeção das imagens geradas.

## 9. Integração contínua

O projeto utiliza **GitHub Actions** para executar automaticamente os testes funcionais.

O workflow é acionado por atualizações nas branches `main` e `master`, por pull requests direcionados a essas branches ou manualmente.

Durante a execução, o GitHub Actions:

1. Obtém os arquivos do repositório.
2. Configura o Node.js.
3. Instala as dependências.
4. Instala os navegadores do Playwright.
5. Executa os testes funcionais.
6. Disponibiliza o relatório HTML como artefato.

A primeira execução automática foi concluída com sucesso em ambiente Linux, demonstrando o funcionamento da integração contínua.

Os testes de investigação e regressão visual comparativa permanecem separados da suíte principal, pois alguns foram projetados para evidenciar inconsistências.

[Consultar execuções do GitHub Actions](https://github.com/Fabiolazg/saucedemo-playwright-tests/actions)

## 10. Considerações finais

O desenvolvimento do projeto permitiu aplicar conceitos de qualidade de software por meio de técnicas de automação, validação funcional, testes negativos, testes E2E, investigação de defeitos e regressão visual.

Durante a implementação, também foram identificados e corrigidos problemas relacionados à seleção de elementos, sincronização e carregamento de componentes. Essas ocorrências contribuíram para a evolução da robustez dos testes.

Os resultados demonstram a importância de combinar diferentes estratégias de verificação: enquanto a suíte funcional confirmou os comportamentos esperados nos cenários avaliados, os testes de investigação e comparação visual identificaram inconsistências específicas na aplicação.

O projeto também demonstra o uso de boas práticas de organização de código, versionamento e integração contínua no processo de teste de software.

---

**Projeto acadêmico — Qualidade e Teste de Software**

Centro Universitário do Espírito Santo — UNESC

Curso de Sistemas de Informação

2026