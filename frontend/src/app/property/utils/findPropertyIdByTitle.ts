export function findPropertyIdByTitle(
  title: string,
  list: Array<{ id: number; title: string }>
): number | undefined {
  return list.find((p) => p.title.trim() === title.trim())?.id;
}
