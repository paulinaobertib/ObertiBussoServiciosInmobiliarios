/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NoticesList } from "../../../components/notices/NoticesList";

const capturedItems: any[] = [];

vi.mock("../../../components/notices/NoticeItem", () => {
  return {
    NoticeItem: (props: any) => {
      capturedItems.push(props);
      return (
        <div data-testid={`notice-item-${props.notice.id}`}>
          <button
            data-testid={`update-${props.notice.id}`}
            onClick={() => props.onUpdate(props.notice)}
          >
            update
          </button>
          <button
            data-testid={`delete-${props.notice.id}`}
            onClick={() => props.onDeleteClick(props.notice.id)}
          >
            delete
          </button>
        </div>
      );
    },
  };
});

// ---------------- Mock de @mui/material.Box para volcar sx a estilos inline ----
// Esto hace que el `sx={{ flex: '0 0 33.333%', maxWidth: '33.333%' }}` se vea
// como style inline, y `getComputedStyle` lo pueda leer en JSDOM.
vi.mock("@mui/material", async (importOriginal) => {
  const actual: any = await importOriginal();
  const Box = ({ sx, children, ...rest }: any) => {
    const style: React.CSSProperties = {
      ...(sx?.display ? { display: sx.display } : {}),
      ...(sx?.overflow ? { overflow: sx.overflow } : {}),
      ...(sx?.gap ? { gap: sx.gap } : {}),
      ...(sx?.pr ? { paddingRight: typeof sx.pr === "number" ? `${sx.pr * 8}px` : sx.pr } : {}),
      ...(sx?.flex ? { flex: sx.flex } : {}),
      ...(sx?.maxWidth ? { maxWidth: sx.maxWidth } : {}),
    };
    return (
      <div style={style} {...rest}>
        {children}
      </div>
    );
  };
  return { ...actual, Box };
});

describe("<NoticesList />", () => {
  beforeEach(() => {
    capturedItems.length = 0;
    vi.clearAllMocks();
  });

  const notices = [
    { id: 1, title: "A", description: "a", mainImage: null },
    { id: 2, title: "B", description: "b", mainImage: null },
    { id: 3, title: "C", description: "c", mainImage: null },
  ] as any[];

  it("renderiza un NoticeItem por cada notice y pasa props correctas", () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const onDeleteClick = vi.fn();

    render(
      <NoticesList
        notices={notices}
        isAdmin={true}
        visibleCount={3}
        onUpdate={onUpdate}
        onDeleteClick={onDeleteClick}
      />
    );

    // Se renderiza uno por notice
    notices.forEach((n) => {
      expect(screen.getByTestId(`notice-item-${n.id}`)).toBeInTheDocument();
    });

    // Capturamos y verificamos props pasadas a NoticeItem
    expect(capturedItems).toHaveLength(notices.length);
    capturedItems.forEach((p: any, idx: number) => {
      expect(p.notice).toEqual(notices[idx]);
      expect(p.isAdmin).toBe(true);
      expect(typeof p.onUpdate).toBe("function");
      expect(typeof p.onDeleteClick).toBe("function");
    });

    // Handlers llegan y se invocan correctamente
    fireEvent.click(screen.getByTestId("update-2"));
    expect(onUpdate).toHaveBeenCalledWith(notices[1]);

    fireEvent.click(screen.getByTestId("delete-3"));
    expect(onDeleteClick).toHaveBeenCalledWith(3);
  });

  it("calcula el ancho por item según visibleCount=3 (flex-basis ≈ 33.333%)", () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <NoticesList
        notices={notices}
        isAdmin={false}
        visibleCount={3}
        onUpdate={onUpdate}
        onDeleteClick={() => {}}
      />
    );

    // Tomamos cualquier item y miramos el 'Box' padre directo (el que tiene flex/maxWidth)
    const el = screen.getByTestId("notice-item-1");
    const wrapper = el.parentElement as HTMLElement;

    const cs = getComputedStyle(wrapper);
    // flex: "0 0 33.3333%" → flexBasis = "33.3333%"
    expect(cs.flexBasis).toMatch(/33(\.\d+)?%/);
    expect(cs.maxWidth).toMatch(/33(\.\d+)?%/);
  });

  it("calcula el ancho por item según visibleCount=4 (flex-basis ≈ 25%)", () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <NoticesList
        notices={notices}
        isAdmin={false}
        visibleCount={4}
        onUpdate={onUpdate}
        onDeleteClick={() => {}}
      />
    );

    const el = screen.getByTestId("notice-item-2");
    const wrapper = el.parentElement as HTMLElement;

    const cs = getComputedStyle(wrapper);
    expect(cs.flexBasis).toMatch(/25(\.0+)?%/);
    expect(cs.maxWidth).toMatch(/25(\.0+)?%/);
  });
});
