/// <reference types="vitest" />

import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

afterEach(() => {
  cleanup();
});

if (typeof window !== "undefined") {
  window.scrollTo = (vi.fn() as any);
}
