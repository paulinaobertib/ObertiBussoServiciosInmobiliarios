import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePanelManager } from '../../hooks/usePanelManager'; // ajustá el path si hace falta

describe('usePanelManager', () => {
  const panelKeys = ['panel1', 'panel2', 'panel3'];

  it('inicializa todos los paneles cerrados', () => {
    const { result } = renderHook(() => usePanelManager(panelKeys));

    expect(result.current.open).toEqual({
      panel1: false,
      panel2: false,
      panel3: false,
    });
  });

  it('abre un panel al hacer toggle (si estaba cerrado)', () => {
    const { result } = renderHook(() => usePanelManager(panelKeys));

    act(() => {
      result.current.toggle('panel1');
    });

    expect(result.current.open).toEqual({
      panel1: true,
      panel2: false,
      panel3: false,
    });
  });

  it('cierra un panel si estaba abierto (toggle sobre sí mismo)', () => {
    const { result } = renderHook(() => usePanelManager(panelKeys));

    act(() => {
      result.current.toggle('panel1'); // abre
      result.current.toggle('panel1'); // cierra
    });

    expect(result.current.open).toEqual({
      panel1: false,
      panel2: false,
      panel3: false,
    });
  });

  it('al hacer toggle en otro panel, cierra el anterior y abre el nuevo', () => {
    const { result } = renderHook(() => usePanelManager(panelKeys));

    act(() => {
      result.current.toggle('panel1'); // abre
      result.current.toggle('panel2'); // cambia a otro
    });

    expect(result.current.open).toEqual({
      panel1: false,
      panel2: true,
      panel3: false,
    });
  });

  it('toggle en panel ya abierto lo cierra y deja todos cerrados', () => {
    const { result } = renderHook(() => usePanelManager(panelKeys));

    act(() => {
      result.current.toggle('panel2'); // abre
      result.current.toggle('panel2'); // cierra
    });

    expect(result.current.open).toEqual({
      panel1: false,
      panel2: false,
      panel3: false,
    });
  });
});
