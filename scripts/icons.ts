import fs from 'fs/promises';
import path from 'path';

const iconDir = `./assets/icons/crypto`;

async function main() {
  const files = (await fs.readdir(iconDir)).filter((f) => f.endsWith('.png')).map((file) => path.parse(file).name);
  const icons = files.filter((name) => !Number.isInteger(Number.parseInt(name)));

  const imports = icons.map((name) => `const ${name} = require('./${name}.png');`).join('\n');

  const iconsN = files.filter((name) => Number.isInteger(Number.parseInt(name)));

  const collection = `export default { ${icons.join(', ')} , ${iconsN.map(
    (name) => `'${name}': require('./${name}.png')`
  )} };`;

  fs.writeFile(`${iconDir}/index.ts`, imports + '\n' + collection);
}

main();
