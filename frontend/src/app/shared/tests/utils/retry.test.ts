import { describe, it, expect, vi } from "vitest";
import { retry, sleep } from "../../utils/retry";

describe("retry", () => {
  it("debe ejecutar la función exitosamente en el primer intento", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await retry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("debe reintentar hasta conseguir éxito", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success");

    const result = await retry(fn, { attempts: 5, delayMs: 10 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("debe lanzar error después de agotar los intentos", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));

    await expect(retry(fn, { attempts: 3, delayMs: 10 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("debe usar valores por defecto si no se pasan opciones", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));

    await expect(retry(fn)).rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(5); // default attempts = 5
  });

  it("debe esperar el delay especificado entre intentos", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("fail")).mockResolvedValue("success");
    const start = Date.now();

    await retry(fn, { attempts: 3, delayMs: 100 });

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90); // tolerance for timing
  });
});

describe("sleep", () => {
  it("debe esperar el tiempo especificado", async () => {
    const start = Date.now();

    await sleep(100);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThan(150);
  });

  it("debe funcionar con 0 ms", async () => {
    const start = Date.now();

    await sleep(0);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});
