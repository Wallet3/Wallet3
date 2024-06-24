import axios from 'axios';

interface Result {
  phishing_site: number;
  website_contract_security: any[];
}

interface UrlPhishing {
  code: number;
  message: string;
  result: Result;
}

export async function isPhishing(url: string) {
  try {
    url = url.replace(/https\:\/\/|http\:\/\//gi, '');

    const resp = await axios(`https://api.gopluslabs.io/api/v1/phishing_site?url=${url}`, { timeout: 5 * 1000 });
    const data = resp.data as UrlPhishing;

    return data?.result?.phishing_site === 1 && data?.code === 1;
  } catch (error) {
    console.log('go phishing', error);
  }

  return undefined;
}
