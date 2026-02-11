import { invoke as tauriInvoke } from '@tauri-apps/api/core';

export function useBackend() {
  const invoke = async <T = unknown>(
    command: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    console.log(`[Backend] Calling: ${command}`, params);
    try {
      const result = await tauriInvoke<T>(command, params);
      console.log(`[Backend] Success: ${command}`);
      return result;
    } catch (error) {
      console.error(`[Backend] Error: ${command}`, error);
      throw error;
    }
  };

  return { invoke };
}
