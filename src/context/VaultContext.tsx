import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vault } from '../types/vault';
import { Note } from '../types/note';
import { useUser } from './AuthContext';
import { useBackend } from '../hooks/useBackend';

interface VaultContextType {
  vaults: Vault[];
  notes: Note[];
  selectedVaultId: string | null;
  loading: boolean;
  vaultsLoading: boolean;
  loadVaults: () => Promise<void>;
  addVault: (name: string, color: string) => Promise<void>;
  updateVault: (vault: Vault) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  selectVault: (vaultId: string) => Promise<void>;
  loadNotes: (vaultId: string) => Promise<void>;
  addNote: (vaultId: string, title: string, content: string) => Promise<void>;
  updateNote: (noteId: string, title: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vaultsLoading, setVaultsLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      loadVaults();
    } else {
      setVaults([]);
      setNotes([]);
      setSelectedVaultId(null);
    }
  }, [user]);

  const addVault = async (name: string, color: string) => {
    if (!user) return;
    const newVault = await invoke<Vault>('create_vault', {
      userId: user.id,
      name,
      color,
    });
    setVaults((prev) => [...prev, newVault]);
  };

  const updateVault = async (vault: Vault) => {
    await invoke('update_vault', {
      vault: JSON.stringify(vault),
      name: vault.name,
      color: vault.color,
    });
    setVaults((prev) =>
      prev.map((v) => (v.id === vault.id ? vault : v))
    );
  };

  const deleteVault = async (vaultId: string) => {
    await invoke('delete_vault', { vaultId });
    setVaults((prev) => prev.filter((v) => v.id !== vaultId));
    setNotes((prev) => prev.filter((n) => n.vault_id !== vaultId));
    if (selectedVaultId === vaultId) {
      setSelectedVaultId(null);
      setNotes([]);
    }
  };

  const selectVault = async (vaultId: string) => {
    setSelectedVaultId(vaultId);
    await loadNotes(vaultId);
  };

  const loadNotes = async (vaultId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const notesData = await invoke<Note[]>('get_notes_decrypted', {
        vaultId,
        userId: user.id,
      });
      setNotes(notesData);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (vaultId: string, title: string, content: string) => {
    if (!user) return;
    const newNote = await invoke<Note>('create_note', {
      vaultId,
      title,
      content,
      userId: user.id,
    });
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    if (!user) return;
    await invoke('update_note', {
      noteId,
      title,
      content,
      userId: user.id,
    });
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, title, content, updated_at: Date.now() }
          : n
      )
    );
  };

  const deleteNote = async (noteId: string) => {
    await invoke('delete_note', { noteId });
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <VaultContext.Provider
      value={{
        vaults,
        notes,
        selectedVaultId,
        loading,
        vaultsLoading,
        loadVaults,
        addVault,
        updateVault,
        deleteVault,
        selectVault,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
      }}
    >
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
