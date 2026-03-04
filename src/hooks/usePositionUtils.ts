export function reorderItems<T extends { position: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, position: i }));
}

export function parseImageToBytes(image: string | null | undefined): number[] | null | undefined {
  if (image === null) return null;
  if (!image) return undefined;
  const base64Data = image.split(',')[1];
  return Array.from(Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)));
}
