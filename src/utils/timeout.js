/**
 * Wraps a promise with a timeout. If the promise takes longer than ms,
 * it returns fallbackValue instead of hanging indefinitely.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {T} fallbackValue
 * @param {string} [operationName]
 * @returns {Promise<T>}
 */
export async function withTimeout(promise, ms, fallbackValue, operationName = 'Operation') {
  let timerId;
  const timeoutPromise = new Promise((resolve) => {
    timerId = setTimeout(() => {
      console.warn(`[Timeout] ${operationName} exceeded ${ms}ms limit. Proceeding with fallback.`);
      resolve(fallbackValue);
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } catch (err) {
    console.error(`[Error] ${operationName} failed:`, err);
    return fallbackValue;
  } finally {
    clearTimeout(timerId);
  }
}
