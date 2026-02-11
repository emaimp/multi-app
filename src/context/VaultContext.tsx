import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vault } from '../types/vault';
import { Note } from '../types/note';
import { useAuth } from './AuthContext';
import { useBackend } from '../hooks/useBackend';

interface VaultContextType {
  vaults: Vault[];
  notes: Note[];
  selectedVaultId: string | null;
  loading: boolean;
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
  const { user } = useAuth();
  const { invoke } = useBackend();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadVaults = async () => {
    if (!user) return;
    try {
      const vaultsData = await invoke<Vault[]>('get_vaults', { userId: user.id });
      setVaults(vaultsData);
    } catch (error) {
      console.error('Failed to load vaults:', error);
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
    try {
      const newVault = await invoke<Vault>('create_vault', {
        userId: user.id,
        name,
        color,
      });
      setVaults((prev) => [...prev, newVault]);
    } catch (error) {
      console.error('Failed to create vault:', error);
      throw error;
    }
  };

  const updateVault = async (vault: Vault) => {
    try {
      await invoke('update_vault', {
        vault: JSON.stringify(vault),
        name: vault.name,
        color: vault.color,
      });
      setVaults((prev) =>
        prev.map((v) => (v.id === vault.id ? vault : v))
      );
    } catch (error) {
      console.error('Failed to update vault:', error);
      throw error;
    }
  };

  const deleteVault = async (vaultId: string) => {
    try {
      await invoke('delete_vault', { vaultId });
      setVaults((prev) => prev.filter((v) => v.id !== vaultId));
      setNotes((prev) => prev.filter((n) => n.vault_id !== vaultId));
      if (selectedVaultId === vaultId) {
        setSelectedVaultId(null);
        setNotes([]);
      }
    } catch (error) {
      console.error('Failed to delete vault:', error);
      throw error;
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
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (vaultId: string, title: string, content: string) => {
    if (!user) return;
    try {
      const newNote = await invoke<Note>('create_note', {
        vaultId,
        title,
        content,
        userId: user.id,
      });
      setNotes((prev) => [...prev, newNote]);
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    if (!user) return;
    try {
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
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await invoke('delete_note', { noteId });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  return (
    <VaultContext.Provider
      value={{
        vaults,
        notes,
        selectedVaultId,
        loading,
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
