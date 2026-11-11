// Máy chủ thử trên máy cá nhân:  npm run thu  ->  mở http://localhost:3000
// Phục vụ thư mục public/ và các hàm trong api/ giống cách Vercel làm.
// Chưa khai báo SUPABASE_URL thì dữ liệu chỉ nằm trong bộ nhớ, tắt là mất.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const GOC = fileURLToPath(new URL('..', import.meta.url));
const KIEU = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const CONG = Number(process.env.PORT) || 3000;

http.createServer(async (req, res) => {
  const duong = new URL(req.url, 'http://x').pathname;
  try {
    if (/^\/api\/[a-z0-9-]+$/.test(duong)) {
      let than = '';
      for await (const manh of req) than += manh;
      req.body = than;
      res.status = ma => ((res.statusCode = ma), res);
      res.json = dl => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(dl)); };
      const { default: ham } = await import(pathToFileURL(join(GOC, duong + '.js')));
      return await ham(req, res);
    }
    const tep = normalize(join(GOC, 'public', duong === '/' ? 'index.html' : duong));
    if (!tep.startsWith(join(GOC, 'public'))) throw new Error('ngoài thư mục');
    const dl = await readFile(tep);
    res.writeHead(200, { 'Content-Type': KIEU[extname(tep)] || 'application/octet-stream' });
    res.end(dl);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Không tìm thấy');
  }
}).listen(CONG, () => console.log(`Đèn AI chạy thử tại http://localhost:${CONG}`));
