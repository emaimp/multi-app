import { invoke as tauriInvoke } from '@tauri-apps/api/core';

export function useBackend() {
  const invoke = async <T = unknown>(
    command: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    return await tauriInvoke<T>(command, params);
  };

  return { invoke };
}
