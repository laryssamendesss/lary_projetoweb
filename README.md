# Biblioteca de Livros

API REST acadêmica para cadastro e gerenciamento de livros.

## Tecnologias

- Node.js
- Express
- JavaScript
- Swagger
- Armazenamento em memória

## Como iniciar

```bash
npm install
npm start
```

O servidor ficará disponível em `http://localhost:3000`.

Durante o desenvolvimento, use `npm run dev` para iniciar com reinício automático pelo Nodemon.

Swagger: `http://localhost:3000/api-docs`

## Rotas

| Método | Rota | Objetivo |
| --- | --- | --- |
| GET | `/` | Verificar se a API está funcionando |
| POST | `/livros` | Cadastrar um livro |
| GET | `/livros` | Listar todos os livros |
| GET | `/livros/:id` | Buscar um livro pelo ID |
| PATCH | `/livros/:id` | Atualizar parte de um livro |
| DELETE | `/livros/:id` | Excluir um livro |
| GET | `/api-docs` | Abrir a documentação Swagger |

Os dados ficam somente na memória. Ao reiniciar o servidor, os 15 livros iniciais são carregados novamente.

## Acesso às rotas

As rotas `GET` são públicas. Para `POST`, `PATCH` e `DELETE`, envie:

```text
Authorization: Bearer LARYLINDA
```

O token vem da variável `TOKEN_SECRET` no arquivo `.env`.

## JSON para POST

```json
{
  "titulo": "O Primo Basílio",
  "descricao": "Romance sobre relações e conflitos sociais",
  "autor": "Eça de Queirós",
  "ano": 1878,
  "genero": "Romance",
  "editora": "Livraria Chardron",
  "disponivel": true
}
```

No Insomnia, use `POST http://localhost:3000/livros`, selecione JSON e envie o exemplo com o token.

## Sequência recomendada no Insomnia

1. Faça `GET /livros` sem token.
2. Faça `GET /livros/1` sem token.
3. Faça `POST /livros` com o token e anote o `id` retornado.
4. Envie um ou mais campos em `PATCH /livros/1` com o token.
5. Faça `DELETE /livros/1` com o token.
6. Repita `GET /livros/1` para verificar a resposta 404.

## Validações

Os campos de texto, `ano` e `disponivel` são obrigatórios no POST. No PATCH, somente os campos enviados são validados. Textos não podem ficar vazios, `ano` deve ser um número inteiro positivo e `disponivel` deve ser booleano. JSON inválido retorna 400; livro ou rota inexistente retorna 404.

## JSON para PATCH

```json
{
  "disponivel": false,
  "genero": "Romance brasileiro"
}
```

O campo `id` não é alterado pelo PATCH.
