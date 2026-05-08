# GitHub Pages + Admin do Blog

Este projeto foi preparado para funcionar assim:

- site público no **GitHub Pages**
- admin do blog com a **mesma interface atual**
- backend separado em `cms-api/`
- posts salvos no arquivo `blog/posts-data.json` via **GitHub API**

## 1. Publicar o site no GitHub Pages

1. Suba este projeto para um repositório no GitHub.
2. Em `Settings > Pages`, configure:
   - `Deploy from a branch`
   - branch: `main`
   - folder: `/ (root)`
3. Aguarde o endereço do site, por exemplo:
   - `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`

## 2. Publicar a API no Render

1. Crie um novo serviço Web no Render apontando para a pasta `cms-api/`.
2. Configure:
   - Runtime: `Node`
   - Build command: `npm install`
   - Start command: `npm start`
3. Adicione as variáveis de ambiente com base em `cms-api/.env.example`.

### Exemplo de valores

- `ADMIN_USERNAME`: nome do usuário do admin
- `ADMIN_PASSWORD`: sua senha real do admin
- `ADMIN_JWT_SECRET`: uma chave longa e aleatória
- `ADMIN_ORIGIN`: `https://SEU-USUARIO.github.io`
- `ADMIN_LOGIN_MAX_ATTEMPTS`: por exemplo `5`
- `ADMIN_LOGIN_WINDOW_MS`: por exemplo `900000`
- `ADMIN_SAVE_MAX_ATTEMPTS`: por exemplo `30`
- `ADMIN_SAVE_WINDOW_MS`: por exemplo `900000`
- `GITHUB_OWNER`: seu usuário ou organização
- `GITHUB_REPO`: nome do repositório
- `GITHUB_BRANCH`: normalmente `main`
- `GITHUB_CONTENT_PATH`: `blog/posts-data.json`

## 3. Criar token do GitHub

Crie um token com permissão para alterar o conteúdo do repositório:

1. GitHub > `Settings`
2. `Developer settings`
3. `Personal access tokens`
4. Gere um token com permissão de **Contents: Read and write**
5. Salve esse token no Render como `GITHUB_TOKEN`

## 4. Apontar o admin para a API

No arquivo [blog/admin.html](/abs/path/c:/xampp/htdocs/ProjetoShape/blog/admin.html:370), atualize a constante:

```js
const BLOG_ADMIN_API_BASE = 'https://SEU-SERVICO.onrender.com/api';
```

Troque pelo endereço real do serviço no Render.

## 5. Fluxo final

1. Você abre `blog/admin.html` no GitHub Pages
2. Faz login
3. Cria, edita ou remove posts
4. A API atualiza `blog/posts-data.json` no GitHub
5. O GitHub Pages republica o site com os novos posts

## 6. Observações de segurança

- não exponha `GITHUB_TOKEN` no frontend
- não deixe a senha do admin no JavaScript
- troque `ADMIN_PASSWORD` por uma senha forte
- use HTTPS no Render e no GitHub Pages
- limite `ADMIN_ORIGIN` ao domínio real do seu site
