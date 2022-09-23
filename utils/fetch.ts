export async function post(url: string, data: any, headers: any = {}) {
  return await (
    await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })
  ).json();
}
