import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateImports(dir) {
    try {
        const files = await readdir(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            const stats = await stat(filePath);

            if (stats.isDirectory()) {
                await updateImports(filePath);
            } else if (file.endsWith('.ts') || file.endsWith('.svelte')) {
                let content = await readFile(filePath, 'utf8');

                content = content.replace(
                    /from ['"](.+?)\.js['"]/g,
                    "from '$1.ts'"
                );

                await writeFile(filePath, content);
                console.log(`Updated imports in: ${filePath}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const srcPath = join(dirname(__dirname), 'src');
console.log(`Starting import updates from: ${srcPath}`);
updateImports(srcPath);