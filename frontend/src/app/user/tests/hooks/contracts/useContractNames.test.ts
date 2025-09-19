// src/app/user/tests/hooks/contracts/useContractNames.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContractNames } from "../../../hooks/contracts/useContractNames";
import { getUserById } from "../../../services/user.service";
import { getPropertyById } from "../../../../property/services/property.service";

vi.mock("../../../services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("../../../../property/services/property.service", () => ({
  getPropertyById: vi.fn(),
}));

describe("useContractNames", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve vacío si no se pasa userId ni propertyId", () => {
    const { result } = renderHook(() => useContractNames());
    expect(result.current.userName).toBe("");
    expect(result.current.propertyName).toBe("");
    expect(getUserById).not.toHaveBeenCalled();
    expect(getPropertyById).not.toHaveBeenCalled();
  });

  it("carga y setea userName con datos de user", async () => {
    (getUserById as any).mockResolvedValue({ firstName: "Juan", lastName: "Perez" });

    const { result } = renderHook(() => useContractNames("u1"));

    await waitFor(() => {
      expect(result.current.userName).toBe("Juan Perez");
    });
  });

  it("carga y setea propertyName con datos de property", async () => {
    (getPropertyById as any).mockResolvedValue({ title: "Casa Grande" });

    const { result } = renderHook(() => useContractNames(undefined, 123));

    await waitFor(() => {
      expect(result.current.propertyName).toBe("Casa Grande");
    });
  });

  it("usa resp.data si viene en user y property", async () => {
    (getUserById as any).mockResolvedValue({ data: { firstName: "Ana", lastName: "Lopez" } });
    (getPropertyById as any).mockResolvedValue({ data: { title: "Depto Chico" } });

    const { result } = renderHook(() => useContractNames("u2", 456));

    await waitFor(() => {
      expect(result.current.userName).toBe("Ana Lopez");
      expect(result.current.propertyName).toBe("Depto Chico");
    });
  });

  it("maneja error en getUserById devolviendo ''", async () => {
    (getUserById as any).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useContractNames("bad"));

    await waitFor(() => {
      expect(result.current.userName).toBe("");
    });
  });

  it("maneja error en getPropertyById devolviendo ''", async () => {
    (getPropertyById as any).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useContractNames(undefined, 999));

    await waitFor(() => {
      expect(result.current.propertyName).toBe("");
    });
  });

  it("acepta propertyId como string y lo convierte a number", async () => {
    (getPropertyById as any).mockResolvedValue({ title: "Terreno" });

    const { result } = renderHook(() => useContractNames(undefined, "789"));

    await waitFor(() => {
      expect(getPropertyById).toHaveBeenCalledWith(789);
      expect(result.current.propertyName).toBe("Terreno");
    });
  });

  it("si propertyId es string NaN, devuelve vacío y no llama servicio", () => {
    const { result } = renderHook(() => useContractNames(undefined, "abc"));
    expect(result.current.propertyName).toBe("");
    expect(getPropertyById).not.toHaveBeenCalled();
  });
});
