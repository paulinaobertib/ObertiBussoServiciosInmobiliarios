import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PanelButton } from "../../components/PanelButton";

describe("PanelButton", () => {
  it("renderiza con el label correcto", () => {
    render(<PanelButton label="Test Button" active={false} onClick={() => {}} />);
    expect(screen.getByRole("button", { name: /test button/i })).toBeInTheDocument();
  });

  it('usa variant "contained" cuando active es true', () => {
    render(<PanelButton label="Active Button" active={true} onClick={() => {}} />);
    const button = screen.getByRole("button", { name: /active button/i });
    expect(button.className).toMatch(/MuiButton-contained/);
  });

  it('usa variant "outlined" cuando active es false', () => {
    render(<PanelButton label="Inactive Button" active={false} onClick={() => {}} />);
    const button = screen.getByRole("button", { name: /inactive button/i });
    expect(button.className).toMatch(/MuiButton-outlined/);
  });

  it("llama onClick al hacer click", async () => {
    const onClickMock = vi.fn();
    render(<PanelButton label="Clickable" active={false} onClick={onClickMock} />);
    const button = screen.getByRole("button", { name: /clickable/i });

    await userEvent.click(button);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
