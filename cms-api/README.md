# Shape Blog Admin API

Backend para manter o blog público no GitHub Pages e publicar posts a partir do admin.

## Variáveis de ambiente

- `PORT=3000`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=sua-senha-forte`
- `ADMIN_JWT_SECRET=uma-chave-longa-e-secreta`
- `ADMIN_ORIGIN=https://SEU-USUARIO.github.io`
- `ADMIN_LOGIN_MAX_ATTEMPTS=5`
- `ADMIN_LOGIN_WINDOW_MS=900000`
- `ADMIN_SAVE_MAX_ATTEMPTS=30`
- `ADMIN_SAVE_WINDOW_MS=900000`
- `GITHUB_TOKEN=token-com-permissão-de-conteúdo`
- `GITHUB_OWNER=seu-usuario-ou-org`
- `GITHUB_REPO=nome-do-repositorio`
- `GITHUB_BRANCH=main`
- `GITHUB_CONTENT_PATH=blog/posts-data.json`

## Rodando localmente

```bash
npm install
npm start
```

## Endpoints

- `GET /api/health`
- `GET /api/auth/me`
- `POST /api/login`
- `POST /api/posts/save`
