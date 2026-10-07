import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Babel from './babel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5173;
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 8080;

// In-memory cache for transpiled files
const codeCache = new Map();

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function transpileFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const mtime = fs.statSync(filePath).mtimeMs;
  
  const cacheKey = `${filePath}:${mtime}`;
  if (codeCache.has(cacheKey)) {
    return codeCache.get(cacheKey);
  }

  let code = content;
  
  // 1. Remove CSS imports from JS so browser native ESM doesn't throw MIME type errors
  code = code.replace(/import\s+(?:(?:\w+|,?\s*\{[^}]*\})\s+from\s+)?['"][^'"]+\.css['"]\s*;?/g, '// [CSS loaded via link tag]');

  // 2. Transpile JSX if present or if .jsx
  if (filePath.endsWith('.jsx') || content.includes('<') && (content.includes('/>') || content.includes('</'))) {
    try {
      const result = Babel.transform(code, {
        presets: ['react'],
        compact: false,
        sourceType: 'module'
      });
      code = result.code;
    } catch (err) {
      console.error(`[Babel Error in ${filePath}]:`, err.message);
      throw err;
    }
  }

  // 3. Ensure React import exists if React.createElement was used
  if (code.includes('React.createElement') && !code.includes("from 'react'") && !code.includes('from "react"')) {
    code = `import React from 'react';\n` + code;
  }

  // 4. Rewrite relative imports from .jsx to .js or extensionless relative imports to .js
  code = code.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, importPath) => {
    if (importPath.endsWith('.css')) return match;
    if (importPath.endsWith('.jsx')) {
      return `from '${importPath.slice(0, -4)}.js'`;
    }
    if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
      return `from '${importPath}.js'`;
    }
    return match;
  });

  // 5. Rewrite dynamic imports
  code = code.replace(/import\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g, (match, importPath) => {
    if (importPath.endsWith('.css')) return match;
    if (importPath.endsWith('.jsx')) {
      return `import('${importPath.slice(0, -4)}.js')`;
    }
    if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
      return `import('${importPath}.js')`;
    }
    return match;
  });

  codeCache.set(cacheKey, code);
  return code;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. Proxy API requests to Spring Boot backend
  if (pathname.startsWith('/api/')) {
    const proxyReq = http.request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[API Proxy Error]:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend server unavailable', details: err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  // 2. Static files & source modules
  let localPath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // If path is a .js request, check if a corresponding .jsx exists
  let targetFile = localPath;
  if (!fs.existsSync(targetFile) && targetFile.endsWith('.js')) {
    const jsxPath = targetFile.slice(0, -3) + '.jsx';
    if (fs.existsSync(jsxPath)) {
      targetFile = jsxPath;
    }
  }

  // Check in public/ directory if not found in root
  if (!fs.existsSync(targetFile)) {
    const publicPath = path.join(__dirname, 'public', pathname);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      targetFile = publicPath;
    }
  }

  // Check if file exists and is a regular file
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
    const ext = path.extname(targetFile).toLowerCase();

    // Check if it's a JSX or JS file in src/
    if (targetFile.includes(path.join(__dirname, 'src')) && (ext === '.jsx' || ext === '.js')) {
      try {
        const jsCode = transpileFile(targetFile);
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(jsCode);
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Transpilation error: ${err.message}`);
        return;
      }
    }

    // If a CSS file was requested as a script module, return a JS stub
    if (ext === '.css' && req.headers['sec-fetch-dest'] === 'script') {
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end('/* CSS module stub */ export default {};');
      return;
    }

    // Serve other static files
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(targetFile).pipe(res);
    return;
  }

  // 3. SPA Fallback: for navigation routes (not static files), serve index.html
  if (!pathname.includes('.')) {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
  }

  // 4. 404 Not Found
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end(`Not Found: ${pathname}`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(` DisasterSim AI Frontend Server running at:`);
  console.log(` http://localhost:${PORT}/`);
  console.log(` Proxied backend: http://${BACKEND_HOST}:${BACKEND_PORT}/api`);
  console.log(`======================================================\n`);
});