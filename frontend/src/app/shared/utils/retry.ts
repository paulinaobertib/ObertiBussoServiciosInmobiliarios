export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function retry<T>(
  fn: () => Promise<T>,
  { attempts = 5, delayMs = 700 }: { attempts?: number; delayMs?: number } = {}
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(delayMs);
    }
  }
  throw lastErr;
}
