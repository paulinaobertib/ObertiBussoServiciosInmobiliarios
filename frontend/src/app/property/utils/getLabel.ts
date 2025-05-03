import { Category } from '../../property/context/PropertyCrudContext';

export const getLabel = (cat: Category, id: number, data: any[]|null) => {
  const item = data?.find((d:any) => d.id === id);
  if (!item) return id.toString();
  if (cat === 'owner') return `${item.firstName} ${item.lastName}`;
  return item.name ?? id;
};
