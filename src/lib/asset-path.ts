/** Prefix local assets when the static site is hosted under a repository path. */
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
