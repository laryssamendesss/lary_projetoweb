# API REST - Biblioteca de Livros

API em Node.js, Express e JavaScript para cadastrar, consultar, alterar e excluir livros e receber imagens. Os livros ficam somente em memória e são perdidos ao reiniciar o servidor. Não há banco de dados, cadastro ou login de usuários.

## Instalação e execução

```bash
npm install
npm start
```

Servidor: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

Para desenvolvimento: `npm run dev`.

## Autorização no Insomnia

Os GETs de livros são públicos. Para POST, PATCH, PUT, DELETE e upload, envie `Authorization: Bearer LARYLINDA`. Sem o cabeçalho, a API retorna HTTP 401.

## Rotas

| Método | Rota | Uso |
| --- | --- | --- |
| POST | `/livros` | Cadastra livro |
| GET | `/livros` | Lista livros |
| GET | `/livros/:id` | Busca livro |
| PUT | `/livros/:id` | Atualiza livro |
| PATCH | `/livros/:id` | Atualiza parcialmente um livro |
| DELETE | `/livros/:id` | Exclui livro |
| POST | `/upload` | Envia imagem no campo `imagem` |

Exemplo de corpo para `POST /livros` e `PUT /livros/:id`:

```json
{
  "titulo": "Dom Casmurro",
  "autor": "Machado de Assis",
  "ano": 1899,
  "genero": "Romance"
}
```

Exemplo de corpo para `PATCH /livros/:id`:

```json
{
  "genero": "Literatura brasileira"
}
```

No upload, use `multipart/form-data`, campo `imagem`, com JPEG, PNG ou WEBP de até 5 MB. A pasta local é `uploads/`.

## Validações

No `POST` e no `PUT`, `titulo`, `autor`, `ano` e `genero` são obrigatórios. No `PATCH`, somente os campos enviados são alterados e validados. Textos não podem ficar vazios e `ano` deve ser um número inteiro positivo. JSON inválido, ID inválido, livro inexistente ou rota inexistente retornam respostas JSON com erro.

## Teste rápido no Insomnia

1. `GET /livros` sem token.
2. `GET /livros/1` sem token.
3. `POST /livros` com o JSON acima e o token.
4. `PATCH /livros/1`, `PUT /livros/1` e `DELETE /livros/1` com o token.
5. `POST /upload` usando multipart e o campo `imagem`.
6. Remova o token de uma operação de escrita para verificar o retorno HTTP 401.
