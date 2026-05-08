import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';

const app = express();
const port = Number(process.env.PORT || 3000);
const MAX_POSTS = 500;
const MAX_DATA_URI_LENGTH = 5 * 1024 * 1024;
const rateLimitStore = new Map();

const {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_JWT_SECRET,
  ADMIN_ORIGIN,
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  ADMIN_LOGIN_MAX_ATTEMPTS = '5',
  ADMIN_LOGIN_WINDOW_MS = '900000',
  ADMIN_SAVE_MAX_ATTEMPTS = '30',
  ADMIN_SAVE_WINDOW_MS = '900000',
  GITHUB_BRANCH = 'main',
  GITHUB_CONTENT_PATH = 'blog/posts-data.json'
} = process.env;

const requiredEnv = {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_JWT_SECRET,
  ADMIN_ORIGIN,
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO
};

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

app.use(cors({
  origin: ADMIN_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json({ limit: '12mb' }));

function getClientKey(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || 'unknown';
}

function createRateLimiter({ bucket, maxAttempts, windowMs }) {
  return (req, res, next) => {
    const key = `${bucket}:${getClientKey(req)}`;
    const now = Date.now();
    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetAt) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    existing.count += 1;
    if (existing.count > maxAttempts) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas. Aguarde e tente novamente.'
      });
    }

    return next();
  };
}

const loginRateLimiter = createRateLimiter({
  bucket: 'login',
  maxAttempts: Number(ADMIN_LOGIN_MAX_ATTEMPTS),
  windowMs: Number(ADMIN_LOGIN_WINDOW_MS)
});

const saveRateLimiter = createRateLimiter({
  bucket: 'save',
  maxAttempts: Number(ADMIN_SAVE_MAX_ATTEMPTS),
  windowMs: Number(ADMIN_SAVE_WINDOW_MS)
});

function issueToken() {
  return jwt.sign(
    { role: 'admin' },
    ADMIN_JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, error: 'Token ausente.' });
  }

  try {
    req.user = jwt.verify(token, ADMIN_JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token invalido ou expirado.' });
  }
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizePostContent(content) {
  return sanitizeHtml(content, {
    allowedTags: [
      'p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 'blockquote',
      'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'img'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'style', 'class']
    },
    allowedSchemes: ['http', 'https', 'data', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    }
  });
}

function isValidCoverImage(coverImage) {
  if (!coverImage) return true;
  if (typeof coverImage !== 'string') return false;

  if (coverImage.startsWith('data:image/')) {
    return coverImage.length <= MAX_DATA_URI_LENGTH;
  }

  try {
    const parsedUrl = new URL(coverImage);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function normalizePostForSave(post) {
  return {
    ...post,
    id: normalizeText(post.id) || `post-${Date.now()}`,
    title: normalizeText(post.title),
    summary: normalizeText(post.summary),
    category: normalizeText(post.category),
    readTime: Number.isFinite(Number(post.readTime)) ? Number(post.readTime) : 5,
    coverClass: normalizeText(post.coverClass || ''),
    content: sanitizePostContent(typeof post.content === 'string' ? post.content : ''),
    coverImage: typeof post.coverImage === 'string' ? post.coverImage.trim() : '',
    publishedAt: normalizeText(post.publishedAt) || new Date().toISOString()
  };
}

function validatePost(post, index) {
  if (!post || typeof post !== 'object') {
    return `Post #${index + 1} invalido.`;
  }

  const title = normalizeText(post.title);
  const summary = normalizeText(post.summary);
  const category = normalizeText(post.category);
  const content = typeof post.content === 'string' ? post.content : '';

  if (!title) return `Post #${index + 1} sem titulo.`;
  if (!summary) return `Post #${index + 1} sem resumo.`;
  if (!category) return `Post #${index + 1} sem categoria.`;
  if (!content.trim()) return `Post #${index + 1} sem conteudo.`;
  if (title.length > 180) return `Post #${index + 1} com titulo muito longo.`;
  if (summary.length > 400) return `Post #${index + 1} com resumo muito longo.`;
  if (!isValidCoverImage(post.coverImage || '')) return `Post #${index + 1} com imagem de capa invalida ou muito grande.`;

  return null;
}

function formatPostsPayload(posts) {
  return JSON.stringify({ posts }, null, 4);
}

async function fetchGithubFile() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CONTENT_PATH}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'shape-blog-admin-api'
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Falha ao ler arquivo no GitHub: ${response.status} ${message}`);
  }

  return response.json();
}

async function updateGithubFile(posts) {
  const currentFile = await fetchGithubFile();
  const content = formatPostsPayload(posts);
  const encodedContent = Buffer.from(content, 'utf8').toString('base64');

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CONTENT_PATH}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'shape-blog-admin-api'
    },
    body: JSON.stringify({
      message: `Atualiza posts do blog em ${new Date().toISOString()}`,
      content: encodedContent,
      sha: currentFile.sha,
      branch: GITHUB_BRANCH
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Falha ao atualizar arquivo no GitHub: ${response.status} ${message}`);
  }

  return response.json();
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ success: true, authenticated: true });
});

app.post('/api/login', loginRateLimiter, (req, res) => {
  const username = normalizeText(req.body?.username);
  const password = normalizeText(req.body?.password);

  if (!username || !password || username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Usuario ou senha invalidos.' });
  }

  return res.json({
    success: true,
    token: issueToken()
  });
});

app.post('/api/posts/save', saveRateLimiter, requireAuth, async (req, res) => {
  const posts = req.body?.posts;

  if (!Array.isArray(posts)) {
    return res.status(400).json({ success: false, error: 'Estrutura de posts invalida.' });
  }

  if (posts.length > MAX_POSTS) {
    return res.status(400).json({ success: false, error: 'Quantidade de posts acima do permitido.' });
  }

  const sanitizedPosts = posts.map(normalizePostForSave);

  for (let index = 0; index < sanitizedPosts.length; index += 1) {
    const validationError = validatePost(sanitizedPosts[index], index);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }
  }

  try {
    await updateGithubFile(sanitizedPosts);
    return res.json({
      success: true,
      count: sanitizedPosts.length,
      message: 'Posts salvos com sucesso no GitHub.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao salvar posts no GitHub.'
    });
  }
});

app.listen(port, () => {
  console.log(`Shape Blog Admin API listening on port ${port}`);
});
