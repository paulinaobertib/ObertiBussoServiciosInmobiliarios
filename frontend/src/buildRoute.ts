export function buildRoute(template: string, param: string | number): string;
export function buildRoute(template: string, params: Record<string,string|number>): string;
export function buildRoute(template: string, params: any): string {
  const map = typeof params === 'object' ? params : { id: params };
  let path = template;
  for (const [key, value] of Object.entries(map)) {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return path;
}