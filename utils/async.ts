export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function awaitOneByOne<T extends readonly unknown[] | []>(values: T) {
  for (let func of values) {
    await func;
  }
}
