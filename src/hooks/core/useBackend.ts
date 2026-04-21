import { invoke as tauriInvoke } from '@tauri-apps/api/core';

export function useBackend() {
  const invoke = async <T = unknown>(
    command: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    try {
      const result = await tauriInvoke<T>(command, params);
      return result;
    } catch (error) {
      console.error(`[Backend] Error: ${command}`, error);
      throw error;
    }
  };

  return { invoke };
}
