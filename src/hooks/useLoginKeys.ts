import { useState, useEffect, useRef } from 'react';
import { LoginKey } from '../types/loginkey';
import { useUser } from '../context/AuthContext';
import { useBackend } from './useBackend';
import { reorderItems, parseImageToBytes } from './usePositionUtils';

interface UseLoginKeysReturn {
  loginKeys: LoginKey[];
  loadLoginKeys: (vaultId: string) => Promise<void>;
  createLoginKey: (vaultId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color?: string) => Promise<LoginKey | undefined>;
  updateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color?: string, image?: string | null) => Promise<void>;
  deleteLoginKey: (loginKeyId: string) => Promise<void>;
  reorderLoginKeys: (loginKeys: LoginKey[]) => Promise<void>;
  setLoginKeys: React.Dispatch<React.SetStateAction<LoginKey[]>>;
  clearLoginKeys: () => void;
}

export function useLoginKeys(): UseLoginKeysReturn {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [loginKeys, setLoginKeys] = useState<LoginKey[]>([]);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setLoginKeys([]);
    }
    prevUserRef.current = user;
  }, [user]);

  const loadLoginKeys = async (vaultId: string) => {
    if (!user) return;
    const loginKeysData = await invoke<LoginKey[]>('get_login_keys_decrypted', {
      vaultId,
      userId: user.id,
    });
    setLoginKeys(loginKeysData);
  };

  const createLoginKey = async (
    vaultId: string,
    siteName: string,
    url: string | null,
    username: string,
    password: string,
    details: string | null,
    color: string = 'blue'
  ) => {
    if (!user) return undefined;
    const newLoginKey = await invoke<LoginKey>('create_login_key', {
      vaultId,
      siteName,
      url,
      username,
      password,
      details,
      color,
      userId: user.id,
    });
    setLoginKeys((prev) => [...prev, newLoginKey]);
    return newLoginKey;
  };

  const updateLoginKey = async (
    loginKeyId: string,
    siteName: string,
    url: string | null,
    username: string,
    password: string,
    details: string | null,
    color: string = 'blue',
    image?: string | null
  ) => {
    if (!user) return;
    const imageBytes = parseImageToBytes(image);
    await invoke('update_login_key', {
      loginKeyId,
      siteName,
      url,
      username,
      password,
      details,
      color,
      image: imageBytes,
      userId: user.id,
    });
    const finalImage = image === null ? null : image ?? null;
    setLoginKeys((prev) =>
      prev.map((lk) =>
        lk.id === loginKeyId
          ? { ...lk, site_name: siteName, url, username, password, details, color, image: finalImage, updated_at: Date.now() }
          : lk
      )
    );
  };

  const deleteLoginKey = async (loginKeyId: string) => {
    await invoke('delete_login_key', { loginKeyId });
    const remainingLoginKeys = loginKeys
      .filter((lk) => lk.id !== loginKeyId)
      .sort((a, b) => a.position - b.position);
    for (let i = 0; i < remainingLoginKeys.length; i++) {
      await invoke('update_login_key_position', { loginKeyId: remainingLoginKeys[i].id, newPosition: i });
    }
    setLoginKeys((prev) => prev.filter((lk) => lk.id !== loginKeyId));
  };

  const reorderLoginKeys = async (reorderedLoginKeys: LoginKey[]) => {
    const updatedLoginKeys = reorderItems(reorderedLoginKeys);
    setLoginKeys(updatedLoginKeys);
    for (let i = 0; i < updatedLoginKeys.length; i++) {
      await invoke('update_login_key_position', { loginKeyId: updatedLoginKeys[i].id, newPosition: i });
    }
  };

  const clearLoginKeys = () => {
    setLoginKeys([]);
  };

  return {
    loginKeys,
    loadLoginKeys,
    createLoginKey,
    updateLoginKey,
    deleteLoginKey,
    reorderLoginKeys,
    setLoginKeys,
    clearLoginKeys,
  };
}
