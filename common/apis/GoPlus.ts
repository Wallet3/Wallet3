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
    const resp = await fetch(`https://api.gopluslabs.io/api/v1/phishing_site?url=${url}`);
    const data = (await resp.json()) as UrlPhishing;
    return data?.result?.phishing_site === 1 && data.code === 1;
  } catch (error) {}

  return false;
}
