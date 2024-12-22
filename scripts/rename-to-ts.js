import { readdir, stat, rename } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function renameJsToTs(dir) {
    try {
        const files = await readdir(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            const stats = await stat(filePath);

            if (stats.isDirectory()) {
                await renameJsToTs(filePath);
            } else if (file.endsWith('.js')) {
                const newPath = filePath.replace('.js', '.ts');
                await rename(filePath, newPath);
                console.log(`Renamed: ${filePath} -> ${newPath}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const srcPath = join(dirname(__dirname), 'src');
console.log(`Starting conversion from: ${srcPath}`);
renameJsToTs(srcPath);