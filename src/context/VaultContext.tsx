import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vault } from '../types/vault';
import { Note } from '../types/note';

interface VaultContextType {
  vaults: Vault[];
  notes: Note[];
  selectedVaultId: string | null;
  addVault: (name: string) => void;
  updateVault: (vault: Vault) => void;
  deleteVault: (vaultId: string) => void;
  selectVault: (vaultId: string) => void;
  addNote: (vaultId: string, title: string) => void;
  updateNote: (note: Note) => void;
  getNotesByVault: (vaultId: string) => Note[];
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<Vault[]>(() => {
    const saved = localStorage.getItem('vaults');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vaults', JSON.stringify(vaults));
  }, [vaults]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addVault = (name: string) => {
    const newVault: Vault = {
      id: crypto.randomUUID(),
      name,
      color: 'primary',
      createdAt: new Date(),
    };
    setVaults((prev) => [...prev, newVault]);

    const newNote: Note = {
      id: crypto.randomUUID(),
      vaultId: newVault.id,
      title: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateVault = (updatedVault: Vault) => {
    setVaults((prev) =>
      prev.map((vault) => (vault.id === updatedVault.id ? updatedVault : vault))
    );
  };

  const deleteVault = (vaultId: string) => {
    setVaults((prev) => prev.filter((vault) => vault.id !== vaultId));
    setNotes((prev) => prev.filter((note) => note.vaultId !== vaultId));
    if (selectedVaultId === vaultId) {
      setSelectedVaultId(null);
    }
  };

  const selectVault = (vaultId: string) => {
    setSelectedVaultId(vaultId);
  };

  const addNote = (vaultId: string, title: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      vaultId,
      title,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date() } : note
      )
    );
  };

  const getNotesByVault = (vaultId: string) => {
    return notes.filter((note) => note.vaultId === vaultId);
  };

  return (
    <VaultContext.Provider
      value={{
        vaults,
        notes,
        selectedVaultId,
        addVault,
        updateVault,
        deleteVault,
        selectVault,
        addNote,
        updateNote,
        getNotesByVault,
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
