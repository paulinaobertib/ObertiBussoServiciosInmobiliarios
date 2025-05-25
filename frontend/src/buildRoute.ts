export function buildRoute(template: string, params: Record<string, string | number>): string {
  let path = template;

  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  }

  return path;
}