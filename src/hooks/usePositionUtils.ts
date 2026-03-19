export function reorderItems<T extends { position: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, position: i }));
}

export function parseImageToBytes(image: string | null | undefined): number[] | null | undefined {
  if (image === null) return null;
  if (!image) return undefined;
  const base64Data = image.split(',')[1];
  if (!base64Data) return undefined;
  try {
    const binary = atob(base64Data);
    return Array.from(Uint8Array.from(binary, c => c.charCodeAt(0)));
  } catch {
    const utf8Data = decodeURIComponent(base64Data);
    return Array.from(new TextEncoder().encode(utf8Data));
  }
}
