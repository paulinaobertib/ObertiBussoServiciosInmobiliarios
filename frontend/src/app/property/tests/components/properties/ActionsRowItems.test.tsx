/// <reference types="vitest" />
import React, { useEffect } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPickItem = vi.fn();
vi.mock("../../../context/PropertiesContext", () => ({
  usePropertiesContext: () => ({ pickItem: mockPickItem }),
}));

const buildRouteMock = vi.fn((route: string, id: number) => {
  switch(route) {
    case "/notes/:id": return `/properties/${id}/notes`;
    case "/details/:id": return `/properties/${id}`;
    case "/edit/:id": return `/properties/${id}/edit`;
    default: return `${route}:${id}`;
  }
});

import { getRowActions } from "../../../components/properties/ActionsRowItems";

const item = { id: 5, title: "Casa Test" };

type AskCb = () => Promise<void>;
type ActionsArr = NonNullable<ReturnType<typeof getRowActions>>;

const Harness: React.FC<{
  onActions: (a: ActionsArr) => void;
  ask: (q: string, cb: AskCb) => void;
  deleteFn: (entity: any) => Promise<void>;
  showAlert: (m: string, v: "success" | "error" | "info" | "warning") => void;
}> = ({ onActions, ask, deleteFn, showAlert }) => {
  const actions = getRowActions("property", item, ask, deleteFn, showAlert)!;
  useEffect(() => {
    onActions(actions);
  }, [actions]);
  return null;
};

describe("getRowActions (entity='property')", () => {
  let askSpy: ReturnType<typeof vi.fn>;
  let deleteFnSpy: ReturnType<typeof vi.fn>;
  let showAlertSpy: ReturnType<typeof vi.fn>;
  let capturedAsk: { question: string; cb: AskCb } | null;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedAsk = null;
    askSpy = vi.fn((q: string, cb: AskCb) => {
      capturedAsk = { question: q, cb };
    });
    deleteFnSpy = vi.fn();
    showAlertSpy = vi.fn();
  });

  it("devuelve las 4 acciones esperadas con sus labels", () => {
    let actions: ActionsArr = [] as any;
    render(
      <Harness
        ask={askSpy}
        deleteFn={deleteFnSpy}
        showAlert={showAlertSpy}
        onActions={(a) => {
          actions = a;
        }}
      />
    );

    expect(actions).toHaveLength(4);
    expect(actions.map((a) => a.label)).toEqual([
      "Notas",
      "Ver propiedad",
      "Editar",
      "Eliminar",
    ]);
  });

  it("Eliminar (éxito): llama ask, ejecuta callback, deleteFn y showAlert success", async () => {
    deleteFnSpy.mockResolvedValueOnce(undefined);

    let actions: ActionsArr = [] as any;
    render(
      <Harness
        ask={askSpy}
        deleteFn={deleteFnSpy}
        showAlert={showAlertSpy}
        onActions={(a) => {
          actions = a;
        }}
      />
    );

    actions[3].onClick(); // Eliminar
    expect(askSpy).toHaveBeenCalledTimes(1);
    expect(capturedAsk?.question).toContain('¿Eliminar "Casa Test"?');
    expect(typeof capturedAsk?.cb).toBe("function");

    await act(async () => {
      await capturedAsk!.cb();
    });

    expect(deleteFnSpy).toHaveBeenCalledWith(item);
    expect(showAlertSpy).toHaveBeenCalledWith("Propiedad eliminada", "success");
  });

  it("Eliminar (error): llama ask, ejecuta callback, deleteFn falla y showAlert error", async () => {
    deleteFnSpy.mockRejectedValueOnce(new Error("boom"));

    let actions: ActionsArr = [] as any;
    render(
      <Harness
        ask={askSpy}
        deleteFn={deleteFnSpy}
        showAlert={showAlertSpy}
        onActions={(a) => {
          actions = a;
        }}
      />
    );

    actions[3].onClick(); // Eliminar
    expect(askSpy).toHaveBeenCalledTimes(1);

    await act(async () => {
      await capturedAsk!.cb();
    });

    expect(deleteFnSpy).toHaveBeenCalledWith(item);
    expect(showAlertSpy).toHaveBeenCalledWith("Error al eliminar", "error");
  });

  it("Notas: llama pickItem y navigate con la ruta de notas", () => {
  let actions: ActionsArr = [] as any;
  render(
    <Harness ask={askSpy} deleteFn={deleteFnSpy} showAlert={showAlertSpy} onActions={(a) => { actions = a; }} />
  );

  actions[0].onClick(); // Notas

  expect(mockPickItem).toHaveBeenCalledWith("property", item);
  expect(mockNavigate).toHaveBeenCalledWith(buildRouteMock("/notes/:id", item.id));
});

it("Ver propiedad: llama pickItem y navigate con la ruta de detalles", () => {
  let actions: ActionsArr = [] as any;
  render(
    <Harness ask={askSpy} deleteFn={deleteFnSpy} showAlert={showAlertSpy} onActions={(a) => { actions = a; }} />
  );

  actions[1].onClick(); // Ver propiedad

  expect(mockPickItem).toHaveBeenCalledWith("property", item);
  expect(mockNavigate).toHaveBeenCalledWith(buildRouteMock("/details/:id", item.id));
});

it("Editar: llama navigate con la ruta de edición", () => {
  let actions: ActionsArr = [] as any;
  render(
    <Harness ask={askSpy} deleteFn={deleteFnSpy} showAlert={showAlertSpy} onActions={(a) => { actions = a; }} />
  );

  actions[2].onClick(); // Editar

  expect(mockNavigate).toHaveBeenCalledWith(buildRouteMock("/edit/:id", item.id));
});


});
