const parameters = new URL(self.location.href).searchParams;
const workerModuleUrl = parameters.get("src");

if (!workerModuleUrl) {
  throw new Error("The PDF worker source is missing.");
}

if (typeof Promise.withResolvers !== "function") {
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });
    return { promise, resolve, reject };
  };
}

import(workerModuleUrl);
