import { BigNumber, Contract, constants, utils } from 'ethers';

import ENSRegistryABI from '../abis/ENSRegistry.json';
import ENSResolverABI from '../abis/ENSPublicResolver.json';
import { eth_call } from './RPC';

const ENSRegistryAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENSResolverAddress = '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';

const ENSRegistry = new Contract(ENSRegistryAddress, ENSRegistryABI);
const ENSResolver = new Contract(ENSResolverAddress, ENSResolverABI);

const matchers = [
  new RegExp('^(https)://(.*)$', 'i'),
  new RegExp('^(data):(.*)$', 'i'),
  new RegExp('^(ipfs)://(.*)$', 'i'),
  new RegExp('^eip155:[0-9]+/(erc[0-9]+):(.*)$', 'i'),
];

function callAddress(value: any): string | null {
  if (!utils.isHexString(value, 32)) {
    return null;
  }
  const address = utils.getAddress(utils.hexDataSlice(value, 12));
  return address === constants.AddressZero ? null : address;
}

function _parseBytes(result: string): null | string {
  if (result === '0x') {
    return null;
  }

  const offset = BigNumber.from(utils.hexDataSlice(result, 0, 32)).toNumber();
  const length = BigNumber.from(utils.hexDataSlice(result, offset, offset + 32)).toNumber();
  return utils.hexDataSlice(result, offset + 32, offset + 32 + length);
}

function _parseString(result: string): null | string {
  try {
    return utils.toUtf8String(_parseBytes(result)!);
  } catch (error) {}

  return null;
}

function ipfsUrlToHttps(url: string) {
  return url.toLowerCase().startsWith('ipfs://') ? `https://gateway.ipfs.io/${url.substring(7)}` : url;
}

export async function getEnsAvatar(name: string, owner: string) {
  try {
    if (!name.toLowerCase().endsWith('.eth')) return;

    let nodehash = utils.namehash(name);

    let avatar = await fetchAvatar(nodehash, utils.getAddress(owner));
    if (avatar) return avatar;

    const resolverCallData = ENSRegistry.interface.encodeFunctionData('resolver', [nodehash]);

    const [resolver] = ENSRegistry.interface.decodeFunctionResult(
      'resolver',
      (await eth_call<string>(1, { to: ENSRegistryAddress, data: resolverCallData }))!
    );

    return await fetchAvatar(nodehash, owner, resolver);
  } catch (error) {}
}

export async function getText(ens: string, field: string, resolver?: string) {
  try {
    let nodehash = utils.namehash(ens);
    const data = ENSResolver.interface.encodeFunctionData('text', [nodehash, field]);

    const [result] = ENSResolver.interface.decodeFunctionResult(
      'text',
      (await eth_call<string>(1, { to: ENSResolverAddress, data }))!
    );

    if (result) return result;
    if (resolver) return undefined;

    const resolverCallData = ENSRegistry.interface.encodeFunctionData('resolver', [nodehash]);

    const [resolverAddress] = ENSRegistry.interface.decodeFunctionResult(
      'resolver',
      (await eth_call<string>(1, { to: ENSRegistryAddress, data: resolverCallData }))!
    );

    return getText(ens, field, resolverAddress);
  } catch (error) {
    console.log(error);
  }
}

async function fetchAvatar(nodehash: string, owner: string, resolver = ENSResolverAddress) {
  const avatarData = ENSResolver.interface.encodeFunctionData('text', [nodehash, 'avatar']);
  const [avatar] = ENSResolver.interface.decodeFunctionResult(
    'text',
    (await eth_call<string>(1, { to: resolver, data: avatarData }))!
  );

  const linkage: Array<{ type: string; content: string }> = [];

  for (let i = 0; i < matchers.length; i++) {
    const match = avatar.match(matchers[i]);

    if (match == null) {
      continue;
    }

    switch (match[1]) {
      case 'https':
        linkage.push({ type: 'url', content: avatar });
        return { linkage, url: avatar };

      case 'data':
        linkage.push({ type: 'data', content: avatar });
        return { linkage, url: avatar };

      case 'ipfs':
        linkage.push({ type: 'ipfs', content: avatar });
        return { linkage, url: ipfsUrlToHttps(avatar) };

      case 'erc721':
      case 'erc1155': {
        // Depending on the ERC type, use tokenURI(uint256) or url(uint256)
        const selector = match[1] === 'erc721' ? '0xc87b56dd' : '0x0e89341c';
        linkage.push({ type: match[1], content: avatar });

        const comps = (match[2] || '').split('/');
        if (comps.length !== 2) {
          return null;
        }

        const addr = utils.getAddress(comps[0]);
        const tokenId = utils.hexZeroPad(BigNumber.from(comps[1]).toHexString(), 32);

        // Check that this account owns the token
        if (match[1] === 'erc721') {
          // ownerOf(uint256 tokenId)
          const tokenOwner = callAddress(
            await eth_call(1, {
              to: addr,
              data: utils.hexConcat(['0x6352211e', tokenId]),
            })
          );

          if (owner !== tokenOwner) {
            return null;
          }

          linkage.push({ type: 'owner', content: tokenOwner });
        } else if (match[1] === 'erc1155') {
          // balanceOf(address owner, uint256 tokenId)
          const balance = BigNumber.from(
            await eth_call(1, {
              to: addr,
              data: utils.hexConcat(['0x00fdd58e', utils.hexZeroPad(owner, 32), tokenId]),
            })
          );

          if (balance.isZero()) {
            return null;
          }
          linkage.push({ type: 'balance', content: balance.toString() });
        }

        // Call the token contract for the metadata URL
        const tx = {
          to: utils.getAddress(comps[0]),
          data: utils.hexConcat([selector, tokenId]),
        };
        let metadataUrl = _parseString((await eth_call(1, tx))!);
        if (metadataUrl == null) {
          return null;
        }

        linkage.push({ type: 'metadata-url', content: metadataUrl });

        // ERC-1155 allows a generic {id} in the URL
        if (match[1] === 'erc1155') {
          metadataUrl = metadataUrl.replace('{id}', tokenId.substring(2));
        }

        metadataUrl = ipfsUrlToHttps(metadataUrl);

        // Get the token metadata
        const metadata = await (await fetch(metadataUrl)).json();

        // Pull the image URL out
        if (!metadata || typeof metadata.image !== 'string') {
          return null;
        }

        linkage.push({ type: 'metadata', content: JSON.stringify(metadata) });
        linkage.push({ type: 'url', content: metadata.image });

        return { linkage, url: ipfsUrlToHttps(metadata.image) };
      }
    }
  }
}
