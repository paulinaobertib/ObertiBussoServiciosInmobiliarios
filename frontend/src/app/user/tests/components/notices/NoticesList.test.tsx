/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NoticesList } from "../../../components/notices/NoticesList";

const capturedItems: any[] = [];

// --- Mock de NoticeItem ---
vi.mock("../../../components/notices/NoticeItem", () => {
  return {
    NoticeItem: (props: any) => {
      capturedItems.push(props);
      return (
        <div data-testid={`notice-item-${props.notice.id}`}>
          <button data-testid={`update-${props.notice.id}`} onClick={() => props.onUpdate(props.notice)}>
            update
          </button>
          <button data-testid={`delete-${props.notice.id}`} onClick={() => props.onDeleteClick(props.notice.id)}>
            delete
          </button>
        </div>
      );
    },
  };
});

// --- Mock de Box de MUI ---
vi.mock("@mui/material", async (importOriginal) => {
  const actual: any = await importOriginal();
  const Box = ({ sx, children, ...rest }: any) => {
    let gridTemplateColumns: string | undefined;

    if (typeof sx?.gridTemplateColumns === "string") {
      gridTemplateColumns = sx.gridTemplateColumns;
    } else if (typeof sx?.gridTemplateColumns === "object") {
      // Tomamos el valor `md` como representativo
      gridTemplateColumns = sx.gridTemplateColumns.md;
    }

    const style: React.CSSProperties = {
      ...(gridTemplateColumns ? { gridTemplateColumns } : {}),
      ...(sx?.display ? { display: sx.display } : {}),
      ...(sx?.gap ? { gap: sx.gap } : {}),
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

    notices.forEach((n) => {
      expect(screen.getByTestId(`notice-item-${n.id}`)).toBeInTheDocument();
    });

    expect(capturedItems).toHaveLength(notices.length);
    capturedItems.forEach((p: any, idx: number) => {
      expect(p.notice).toEqual(notices[idx]);
      expect(p.isAdmin).toBe(true);
    });

    fireEvent.click(screen.getByTestId("update-2"));
    expect(onUpdate).toHaveBeenCalledWith(notices[1]);

    fireEvent.click(screen.getByTestId("delete-3"));
    expect(onDeleteClick).toHaveBeenCalledWith(3);
  });

  it("usa 3 columnas cuando visibleCount=3", () => {
    render(
      <NoticesList notices={notices} isAdmin={false} visibleCount={3} onUpdate={vi.fn()} onDeleteClick={() => {}} />
    );

    const container = screen.getByTestId("notice-item-1").parentElement!.parentElement as HTMLElement;

    const cs = getComputedStyle(container);
    expect(cs.gridTemplateColumns).toContain("repeat(3");
  });

  it("usa 3 columnas (layout md) aunque visibleCount=4", () => {
    render(
      <NoticesList notices={notices} isAdmin={false} visibleCount={4} onUpdate={vi.fn()} onDeleteClick={() => {}} />
    );

    const container = screen.getByTestId("notice-item-2").parentElement!.parentElement as HTMLElement;

    const cs = getComputedStyle(container);
    expect(cs.gridTemplateColumns).toContain("repeat(3");
    // Además chequeamos que se renderizan sólo 3 notices (por el slice)
    expect(screen.getAllByTestId(/notice-item-/)).toHaveLength(3);
  });
});
