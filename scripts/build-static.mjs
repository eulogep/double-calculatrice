import { promises as fs } from 'node:fs';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import path from 'node:path';

const gzipAsync = promisify(gzip);
const outputDirectory = '_site';
const assets = [
    'index.html',
    '404.html',
    'demo.html',
    'main.js',
    'advanced-features.js',
    'scientific.mjs',
    'style.css',
    'logo-esiea.png',
    'logo-esiea.webp',
    'robots.txt',
    'sitemap.xml',
    'CNAME'
];
const compressibleExtensions = new Set(['.css', '.html', '.js', '.mjs', '.txt', '.xml']);

await fs.rm(outputDirectory, { recursive: true, force: true });
await fs.mkdir(outputDirectory, { recursive: true });

let compressedAssets = 0;
for (const asset of assets) {
    const sourcePath = path.resolve(asset);
    const targetPath = path.join(outputDirectory, asset);
    const content = await fs.readFile(sourcePath);

    await fs.writeFile(targetPath, content);

    if (compressibleExtensions.has(path.extname(asset))) {
        const compressedContent = await gzipAsync(content, { level: 9 });
        await fs.writeFile(`${targetPath}.gz`, compressedContent);
        compressedAssets += 1;
    }
}

console.log(
    `Build statique terminé : ${assets.length} assets copiés, ${compressedAssets} variantes gzip générées.`
);
