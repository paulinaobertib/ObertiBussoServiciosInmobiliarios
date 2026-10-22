import { describe, it, expect } from "vitest";
import { findIndex, findProperty, findUser, normalize, splitFullName } from "../../utils/contractPdfMatch";

describe("contractPdfMatch", () => {
  const users = [
    { id: "1", firstName: "Marianela", lastName: "Pirani", email: "mari@mail.com" },
    { id: "2", firstName: "Emilio Roberto", lastName: "Martin", email: "emilio@mail.com" },
    { id: "3", firstName: "Ana", lastName: "Martin", email: "ana@mail.com" },
  ];

  it("normaliza acentos y signos", () => {
    expect(normalize("Dúplex N° A-14")).toBe("duplex n a 14");
  });

  it("encuentra al inquilino por email aunque el nombre no coincida", () => {
    expect(findUser(users, { fullName: "M. Pirani", email: "MARI@mail.com" })?.id).toBe("1");
  });

  it("encuentra al inquilino aunque el contrato tenga segundo nombre", () => {
    expect(findUser(users, { fullName: "PIRANI, Marianela Soledad", email: null })?.id).toBe("1");
    expect(findUser(users, { fullName: "Emilio Roberto Martín", email: null })?.id).toBe("2");
  });

  it("no confunde personas con el mismo apellido", () => {
    expect(findUser(users, { fullName: "Carlos Martin", email: null })).toBeNull();
  });

  it("encuentra la propiedad por calle y número", () => {
    const props = [
      { id: 10, title: "Depto céntrico", street: "9 de Julio", number: "3225" },
      { id: 11, title: "Casa", street: "9 de Julio", number: "100" },
      { id: 12, title: "Dúplex A-14", street: "La Arbolada", number: "A-14" },
    ];
    expect(findProperty(props, "calle 9 de Julio 3.225 – Depto. 3 – 1° Piso, Córdoba")?.id).toBe(10);
    expect(findProperty(props, "Dúplex N° A-14 de Barrio Privado La Arbolada")?.id).toBe(12);
    expect(findProperty(props, "Av. Colón 1234")).toBeNull();
  });

  it("encuentra el índice por código o nombre", () => {
    const idx = [
      { id: 1, code: "ICL", name: "Índice de Contratos de Locación" },
      { id: 2, code: "IPC", name: "Índice de Precios al Consumidor" },
      { id: 3, code: "CP", name: "Casa Propia" },
    ];
    expect(findIndex(idx, "ICL")?.id).toBe(1);
    expect(findIndex(idx, "ajuste por IPC")?.id).toBe(2);
    expect(findIndex(idx, "casa propia")?.id).toBe(3);
    expect(findIndex(idx, "porcentaje fijo")).toBeNull();
  });

  it("separa nombre y apellido", () => {
    expect(splitFullName("PIRANI, Marianela")).toEqual({ firstName: "Marianela", lastName: "Pirani" });
    expect(splitFullName("emilio roberto martin")).toEqual({ firstName: "Emilio Roberto", lastName: "Martin" });
  });
});
