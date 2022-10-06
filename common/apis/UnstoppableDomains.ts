import { UnstoppableDomainApiKey } from '../../configs/secret';

export async function getRecords(domain: string) {

  try {
    const resp = await fetch(`https://resolve.unstoppabledomains.com/domains/${domain}`, {
      headers: { Authorization: `Bearer ${UnstoppableDomainApiKey}` },
    });

    return (await resp.json()) as UnstoppableJson;
  } catch (error) {}
}

interface Records {
  'ipfs.html.value': string;
  'crypto.ADA.address': string;
  'crypto.BTC.address': string;
  'crypto.ETH.address': string;
  'gundb.username.value': string;
  'social.picture.value': string;
  'gundb.public_key.value': string;
  'ipfs.redirect_domain.value': string;
}

interface Meta {
  domain: string;
  blockchain: string;
  networkId: number;
  owner: string;
  resolver: string;
  registry: string;
}

interface UnstoppableJson {
  records: Records;
  meta: Meta;
}
