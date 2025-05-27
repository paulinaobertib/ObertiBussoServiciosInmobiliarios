import { describe, it, expect, vi } from 'vitest';
import { getPropertyRowData } from '../../components/PropertyRowItems';
import { ROUTES } from '../../../../lib'; 

vi.mock('@mui/icons-material/Comment', () => ({
  __esModule: true,
  default: function CommentIcon() {
    return <span>CommentIconMock</span>;
  },
}));

vi.mock('@mui/icons-material/Build', () => ({
  __esModule: true,
  default: function BuildIcon() {
    return <span>BuildIconMock</span>;
  },
}));

vi.mock('../../../../buildRoute', () => ({
  buildRoute: vi.fn((route, params) => {
    if (route === ROUTES.PROPERTY_COMMENTS) return `/comments/${params.id}`;
    if (route === ROUTES.PROPERTY_MAINTENANCE) return `/maintenance/${params.id}`;
    return '/';
  }),
}));

describe('getPropertyRowData', () => {
  it('retorna las columnas correctas', () => {
    const item = { id: 42, title: 'Casa Bonita', currency: 'USD', price: 100000 };
    const navigate = vi.fn();
    const result = getPropertyRowData(item, navigate);

    expect(result.columns).toEqual(['Casa Bonita', 'USD', 100000]);
  });

    it('retorna las acciones extra con labels y íconos correctos', () => {
    const item = { id: 42, title: 'Casa Bonita', currency: 'USD', price: 100000 };
    const navigate = vi.fn();
    const result = getPropertyRowData(item, navigate);

    expect(result.extraActions).toHaveLength(2);

    expect(result.extraActions[0].label).toBe('Comentarios');
    expect(result.extraActions[1].label).toBe('Mantenimiento');

    // Los iconos son React elements; podemos validar que tengan el tipo esperado
    expect(result.extraActions[0].icon.type.name || result.extraActions[0].icon.type.displayName).toBe('CommentIcon');
    expect(result.extraActions[1].icon.type.name || result.extraActions[1].icon.type.displayName).toBe('BuildIcon');
  });

  it('ejecuta navigate con la ruta correcta al hacer click en las acciones', () => {
    const item = { id: 42, title: 'Casa Bonita', currency: 'USD', price: 100000 };
    const navigate = vi.fn();
    const result = getPropertyRowData(item, navigate);

    // Simular click en Comentarios
    result.extraActions[0].onClick();
    expect(navigate).toHaveBeenCalledWith(`/comments/${item.id}`);

    // Simular click en Mantenimiento
    result.extraActions[1].onClick();
    expect(navigate).toHaveBeenCalledWith(`/maintenance/${item.id}`);
  });

});
