# Vitrine — sistema distribuído de catálogo

Catálogo web responsivo com HTML, CSS e JavaScript. O front-end é hospedado no GitHub Pages e usa REST/JSON para acessar o banco NoSQL atendido pela API Technoworks.

## Requisitos cobertos

| Requisito | Implementação |
| --- | --- |
| Web Service multiplataforma | Site estático servido por HTTPS para navegadores em computadores, celulares e diferentes sistemas operacionais. |
| Front-end livre | HTML, CSS e JavaScript sem instalação de dependências. |
| Banco NoSQL | Banco remoto acessado somente pela API. |
| REST + JSON | Requisições `fetch` com JSON nos modos Functions e REST; modo Easy usa os endpoints GET documentados. |
| Technoworks | Seletor Functions, REST e Easy com rotas padrão da documentação. |
| ID | O ID do servidor aparece no cartão e serve para endereçar atualizações e exclusões. |
| Vibe coding | O front-end pode ser editado ou expandido com Lovable, Google AI Studio ou ferramenta similar. |

## Usar

Abra `index.html` em um navegador. Por padrão, o site usa a API Functions em `https://technoworks.com.br/api/items`, permitindo que diferentes dispositivos consultem os mesmos produtos. Se a API estiver indisponível, a interface informa o erro; o botão de demonstração usa dados locais daquele navegador.

O catálogo permite buscar, cadastrar, editar e excluir itens. A API Functions espera os campos `titulo`, `descricao` e `preco`, e devolve os registros dentro de `dados`, cada um com um `id`.

## Modos da API

- **Functions:** `GET/POST /api/items`; atualizações e exclusões usam `/api/items/{id}` com os métodos HTTP correspondentes.
- **REST:** `GET/POST /rest/{ra}` e `GET/PUT/PATCH/DELETE /rest/{ra}/{id}`. Informe o RA na configuração local do navegador.
- **Easy:** somente GET: `/easy/get/{ra}`, `/easy/post/{ra}`, `/easy/put/{ra}/{id}` e `/easy/delete/{ra}/{id}`. Criação e edição enviam os campos pela query string. Informe o RA na configuração local.

O cliente aceita listas no campo `dados` ou listas JSON diretas; reconhece IDs em `id`, `_id` ou `ID`. O modo REST e o Easy requerem RA. As configurações feitas pela engrenagem são armazenadas no navegador atual. A configuração compartilhada inicial fica em `api-config.js`; não coloque senhas nem tokens privados nesse arquivo, pois o repositório e o código carregado pelo navegador são públicos.

## Publicar no GitHub Pages

Este repositório inclui `.github/workflows/pages.yml`. Envie os arquivos do projeto para a branch `main` e selecione **Settings → Pages → Build and deployment → GitHub Actions**. O workflow publica a interface a cada atualização da branch. O endereço fica acessível por navegador em qualquer dispositivo com internet.

O GitHub Pages hospeda apenas os arquivos estáticos; o banco continua na camada da API Technoworks. O endpoint `https://technoworks.com.br/api/items` respondeu com CORS permitindo `https://p3dr00ks.github.io`, e suporta os métodos usados pelo modo Functions. A API Functions é compartilhada: qualquer visitante que abra o site poderá cadastrar, editar ou excluir registros nessa coleção. Não use esses registros para dados privados.

## Arquitetura

```text
Navegador (HTML/CSS/JavaScript)
        │ REST + JSON / GET via HTTPS
        ▼
GitHub Pages (interface) ───── API Technoworks (Functions | REST | Easy)
                                      │
                                      ▼
                                  Banco NoSQL
```
