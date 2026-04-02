import { useState, useEffect, useRef } from 'react';
import { Vault } from '../types/vault';
import { useUser } from '../context/AuthContext';
import { useBackend } from './useBackend';
import { reorderItems, parseImageToBytes } from './usePositionUtils';

interface UseVaultsReturn {
  // States
  vaults: Vault[];
  activeVault: string | null;
  
  // Loading states
  loadingVaults: boolean;
  
  // Load functions
  loadVaults: () => Promise<void>;
  
  // CRUD Vaults
  createVault: (name: string, color: string, collectionId?: string) => Promise<Vault | undefined>;
  updateVault: (vault: Vault, image?: string | null) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  reorderVaultsUnassigned: (vaults: Vault[], collectionVaultIds: string[]) => Promise<void>;
  reorderVaultsInCollection: (collectionId: string, vaultIds: string[]) => Promise<void>;
  selectVault: (vaultId: string) => Promise<void>;
  
  // Internal
  setVaults: React.Dispatch<React.SetStateAction<Vault[]>>;
  clearVaultSelect: () => void;
}

export function useVaults(): UseVaultsReturn {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [activeVault, setActiveVault] = useState<string | null>(null);
  const [loadingVaults, setVaultsLoading] = useState(true);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setVaults([]);
      setActiveVault(null);
    }
    prevUserRef.current = user;
  }, [user]);

  // Load functions
  const loadVaults = async () => {
    if (!user) return;
    setVaultsLoading(true);
    try {
      const vaultsData = await invoke<Vault[]>('get_vaults', { userId: user.id });
      setVaults(vaultsData);
    } finally {
      setVaultsLoading(false);
    }
  };

  // CRUD Vaults
  const createVault = async (name: string, color: string, collectionId?: string) => {
    if (!user) return undefined;
    const newVault = await invoke<Vault>('create_vault', {
      userId: user.id,
      name,
      color,
      image: null,
      collectionId,
    });
    setVaults((prev) => [...prev, newVault]);
    return newVault;
  };

  const updateVault = async (vault: Vault, image?: string | null) => {
    const imageBytes = parseImageToBytes(image);
    await invoke('update_vault', {
      vault: JSON.stringify(vault),
      name: vault.name,
      color: vault.color,
      image: imageBytes,
    });
    setVaults((prev) =>
      prev.map((v) =>
        v.id === vault.id
          ? { ...v, name: vault.name, color: vault.color, image: image === null ? undefined : image }
          : v
      )
    );
  };

  const deleteVault = async (vaultId: string) => {
    await invoke('delete_vault', { vaultId });
    setVaults((prev) => prev.filter((v) => v.id !== vaultId));
    if (activeVault === vaultId) {
      setActiveVault(null);
    }
  };

  const reorderVaultsUnassigned = async (reorderedVaults: Vault[], collectionVaultIds: string[]) => {
    const unassignedVaults = reorderedVaults.filter(v => !collectionVaultIds.includes(v.id));
    const updatedVaults = reorderItems(unassignedVaults);
    setVaults(prev => {
      const assignedVaults = prev.filter(v => collectionVaultIds.includes(v.id));
      return [...assignedVaults, ...updatedVaults];
    });
    for (let i = 0; i < updatedVaults.length; i++) {
      await invoke('update_vault_position', { vaultId: updatedVaults[i].id, newPosition: i });
    }
  };

  const reorderVaultsInCollection = async (_collectionId: string, newVaultIds: string[]) => {
    setVaults(prev =>
      prev.map(v => {
        const newIndex = newVaultIds.indexOf(v.id);
        if (newIndex !== -1) {
          return { ...v, position: newIndex };
        }
        return v;
      })
    );
    for (let i = 0; i < newVaultIds.length; i++) {
      await invoke('update_vault_position', { vaultId: newVaultIds[i], newPosition: i });
    }
  };

  const selectVault = async (vaultId: string) => {
    setActiveVault(vaultId);
  };

  const clearVaultSelect = () => {
    setActiveVault(null);
  };

  return {
    vaults,
    activeVault,
    loadingVaults,
    loadVaults,
    createVault,
    updateVault,
    deleteVault,
    reorderVaultsUnassigned,
    reorderVaultsInCollection,
    selectVault,
    setVaults,
    clearVaultSelect,
  };
}
