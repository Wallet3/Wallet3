import fs from 'fs';

const provider = fs.readFileSync('node_modules/@metamask/mobile-provider/dist/index.js', 'utf8');
const js = `export default ${JSON.stringify(provider)};`;
fs.writeFileSync('screens/browser/scripts/Metamask-mobile-provider.ts', js);
