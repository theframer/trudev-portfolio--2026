type PromiseWithResolversConstructor = PromiseConstructor & {
  withResolvers?: <T>() => {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  };
};

const compatiblePromise = Promise as PromiseWithResolversConstructor;

if (typeof compatiblePromise.withResolvers !== "function") {
  compatiblePromise.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });

    return { promise, resolve, reject };
  };
}

const readableStreamPrototype = globalThis.ReadableStream?.prototype;
const streamPrototype = readableStreamPrototype as (object & {
  [Symbol.asyncIterator]?: (this: ReadableStream<unknown>) => AsyncIterableIterator<unknown>;
}) | undefined;

export const readableStreamAsyncIteratorPolyfilled = Boolean(
  streamPrototype && typeof streamPrototype[Symbol.asyncIterator] !== "function",
);

if (readableStreamAsyncIteratorPolyfilled && streamPrototype) {
  Object.defineProperty(streamPrototype, Symbol.asyncIterator, {
    configurable: true,
    writable: true,
    value: function <T>(this: ReadableStream<T>): AsyncIterableIterator<T> {
      const reader = this.getReader();
      let finished = false;
      const iterator: AsyncIterableIterator<T> = {
        async next() {
          if (finished) return { done: true, value: undefined };
          try {
            const result = await reader.read();
            if (result.done) {
              finished = true;
              reader.releaseLock();
            }
            return result;
          } catch (error) {
            finished = true;
            reader.releaseLock();
            throw error;
          }
        },
        async return() {
          if (!finished) {
            finished = true;
            try {
              await reader.cancel();
            } finally {
              reader.releaseLock();
            }
          }
          return { done: true, value: undefined };
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };
      return iterator;
    },
  });
}

export {};
