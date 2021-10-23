import fs from 'fs/promises';
import path from 'path';

const iconDir = `./assets/icons/crypto`;

async function main() {
  const files = (await fs.readdir(iconDir)).filter((f) => f.endsWith('.png'));
  const icons = files.map((file) => path.parse(file).name);

  const imports = icons.map((name) => `const ${name} = require('./${name}.png');`).join('\n');

  const collection = `export default { ${icons.join(', ')} };`;

  fs.writeFile(`${iconDir}/index.ts`, imports + '\n' + collection);
}

main();
