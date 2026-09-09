declare module "mrmime" {
  export function lookup(path: string): string | undefined;
  export const types: Record<string, string>;
}
