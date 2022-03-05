export function makeCancelable<T extends Promise<any>>(promise: T) {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) => (hasCanceled_ ? undefined : resolve(val)));
    promise.catch((error) => (hasCanceled_ ? undefined : reject(error)));
  });

  return {
    promise: wrappedPromise as T,
    cancel() {
      hasCanceled_ = true;
    },
  };
}
