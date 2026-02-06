import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vault } from '../types/vault';

interface VaultContextType {
  vaults: Vault[];
  addVault: (name: string) => void;
  updateVault: (vault: Vault) => void;
  deleteVault: (vaultId: string) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>(() => {
    const saved = localStorage.getItem('vaults');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vaults', JSON.stringify(vaults));
  }, [vaults]);

  const addVault = (name: string) => {
    const newVault: Vault = {
      id: crypto.randomUUID(),
      name,
      color: 'primary',
      createdAt: new Date(),
    };
    setVaults((prev) => [...prev, newVault]);
  };

  const updateVault = (updatedVault: Vault) => {
    setVaults((prev) =>
      prev.map((vault) => (vault.id === updatedVault.id ? updatedVault : vault))
    );
  };

  const deleteVault = (vaultId: string) => {
    setVaults((prev) => prev.filter((vault) => vault.id !== vaultId));
  };

  return (
    <VaultContext.Provider value={{ vaults, addVault, updateVault, deleteVault }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVaults() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVaults must be used within VaultProvider');
  }
  return context;
}
