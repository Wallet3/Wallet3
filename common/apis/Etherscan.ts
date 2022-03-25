export async function getAbi(contract: string, chainId: number, apiUrl: string) {
  const resp = await fetch(`${apiUrl}?module=contract&action=getabi&address=${contract}&apikey=YourApiKeyToken`);
  await resp.json();
}
