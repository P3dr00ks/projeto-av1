# Vitrine — catálogo web distribuído

Catálogo web responsivo com HTML, CSS e JavaScript. O GitHub Pages hospeda o front-end; a API Technoworks fornece acesso REST/JSON ao banco NoSQL.

## Requisitos do projeto

| Requisito | Implementação |
| --- | --- |
| Web Service multiplataforma | Site HTTPS acessível por navegador em computadores, celulares e diferentes sistemas operacionais. |
| Front-end livre | HTML, CSS e JavaScript sem instalação no cliente. |
| Banco NoSQL | Dados persistidos no banco remoto atrás da API Technoworks. |
| REST + JSON | Requisições HTTPS com JSON usando `fetch`. |
| Technoworks | Configuração para Functions, REST e Easy, conforme as capacidades documentadas. |
| IDs | A interface mostra o ID retornado pelo servidor e o usa para editar e excluir registros. |
| Vibe coding | O projeto pode ser editado por Lovable, Google AI Studio ou ferramentas similares. |

## Catálogo publicado

A conexão inicial usa a coleção REST do RA `3023100294`, cuja publicação no código público foi autorizada pelo responsável. Os dez produtos do catálogo foram gravados nessa coleção com ID gerado pelo servidor: monitor, headset, teclado, mouse, controle DualSense, Funko Master Chief, Nintendo Switch OLED, Xbox Series X, PlayStation 5 Slim e Zelda: Tears of the Kingdom.

Cada registro REST contém título, descrição, preço, URL HTTPS da imagem e a referência ao ID anterior. O navegador consulta o catálogo compartilhado ao abrir o site. É possível buscar, cadastrar, editar e excluir itens. Essas operações alteram a coleção compartilhada para todos os visitantes.

As imagens são URLs de fontes externas. O banco guarda o endereço da imagem, não o arquivo; se a fonte externa remover a foto, será necessário atualizar a URL. Para novos registros, prefira HTTPS.

## Modos da API

- **REST (padrão):** `GET/POST /rest/{ra}` e `GET/PUT/PATCH/DELETE /rest/{ra}/{id}`. Persiste título, descrição, preço e imagem.
- **Functions:** usa `/api/items` e os campos `titulo`, `descricao`, `preco`. Esse recurso não persiste o campo imagem.
- **Easy:** somente GET, inclusive operações de escrita quando suportadas pela API; envia parâmetros pela query string.

A interface valida campos e URL de imagem, exige IDs na leitura, aplica timeout, descreve erros HTTP e interpreta respostas JSON antes de atualizar a tela. As preferências locais de conexão ficam no navegador. O token opcional é salvo apenas no armazenamento do navegador em uso; nunca publique segredos no repositório.

## Executar e publicar

Abra o site pelo endereço HTTPS do GitHub Pages. Para desenvolvimento local, qualquer servidor estático pode servir os arquivos. O workflow de Pages publica atualizações da branch `main`; em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.

O GitHub Pages hospeda os arquivos estáticos; a API Technoworks hospeda os dados. A aplicação requer que a API aceite CORS para a origem do Pages. A coleção é compartilhada e não deve receber dados privados.

## Testes

Execute `npm test` com Node.js para validar normalização de IDs, formatos de resposta, validação de produtos, pesquisa, URLs de imagem e rotas/métodos da API. O workflow de qualidade também executa esses testes em cada push e pull request.

## Arquitetura

```text
Navegador (HTML/CSS/JavaScript)
        │ HTTPS · REST/JSON
        ▼
GitHub Pages ───────── API Technoworks (Functions | REST | Easy)
                                      │
                                      ▼
                                  Banco NoSQL
```
