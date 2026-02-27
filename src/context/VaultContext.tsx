import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Vault } from '../types/vault';
import { Note } from '../types/note';
import { Collection } from '../types/collection';
import { useUser } from './AuthContext';
import { useBackend } from '../hooks/useBackend';

interface VaultContextType {
  vaults: Vault[];
  collections: Collection[];
  notes: Note[];
  selectedVaultId: string | null;
  loading: boolean;
  vaultsLoading: boolean;
  lockedNoteIds: Set<string>;
  loadVaults: () => Promise<void>;
  addVault: (name: string, color: string, collection?: string) => Promise<void>;
  updateVault: (vault: Vault, image?: string | null) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  selectVault: (vaultId: string) => Promise<void>;
  loadNotes: (vaultId: string) => Promise<void>;
  addNote: (vaultId: string, title: string, content: string) => Promise<void>;
  updateNote: (noteId: string, title: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  reorderNotes: (notes: Note[]) => Promise<void>;
  reorderCollections: (collections: Collection[]) => void;
  reorderVaultsInCollection: (collectionId: string, vaultIds: string[]) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vaultsLoading, setVaultsLoading] = useState(true);
  const [lockedNoteIds, setLockedNoteIds] = useState<Set<string>>(new Set());
  const prevUserRef = useRef(user);

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
    if (!user) {
      setVaults([]);
      setNotes([]);
      setSelectedVaultId(null);
      setLockedNoteIds(new Set());
    }
    prevUserRef.current = user;
  }, [user]);

  const addVault = async (name: string, color: string, collectionName?: string) => {
    if (!user) return;
    const newVault = await invoke<Vault>('create_vault', {
      userId: user.id,
      name,
      color,
    });
    
    if (collectionName) {
      let collection = collections.find(c => c.name === collectionName);
      if (collection) {
        collection.vaultIds.push(newVault.id);
        setCollections([...collections]);
      } else {
        const newCollection: Collection = {
          id: crypto.randomUUID(),
          name: collectionName,
          vaultIds: [newVault.id]
        };
        setCollections([...collections, newCollection]);
      }
    }
    
    setVaults((prev) => [...prev, newVault]);
  };

  const updateVault = async (vault: Vault, image?: string | null) => {
    let imageBytes: number[] | null | undefined;
    if (image === null) {
      imageBytes = null;
    } else if (image) {
      const base64Data = image.split(',')[1];
      imageBytes = Array.from(Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)));
    }
    await invoke('update_vault', {
      vault: JSON.stringify(vault),
      name: vault.name,
      color: vault.color,
      image: imageBytes,
    });
    setVaults((prev) =>
      prev.map((v) => (v.id === vault.id ? { ...v, name: vault.name, color: vault.color, image: image === null ? undefined : image } : v))
    );
  };

  const deleteVault = async (vaultId: string) => {
    await invoke('delete_vault', { vaultId });
    setVaults((prev) => prev.filter((v) => v.id !== vaultId));
    setCollections(prev => prev.map(c => ({
      ...c,
      vaultIds: c.vaultIds.filter(id => id !== vaultId)
    })));
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
      setLockedNoteIds(new Set(notesData.map(n => n.id)));
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

  const reorderNotes = async (reorderedNotes: Note[]) => {
    setNotes(reorderedNotes);
    for (let i = 0; i < reorderedNotes.length; i++) {
      await invoke('update_note_position', { noteId: reorderedNotes[i].id, newPosition: i });
    }
  };

  const reorderCollections = (reorderedCollections: Collection[]) => {
    setCollections(reorderedCollections);
  };

  const reorderVaultsInCollection = (collectionId: string, newVaultIds: string[]) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, vaultIds: newVaultIds } : c
    ));
  };

  return (
    <VaultContext.Provider
      value={{
        vaults,
        collections,
        notes,
        selectedVaultId,
        loading,
        vaultsLoading,
        lockedNoteIds,
        loadVaults,
        addVault,
        updateVault,
        deleteVault,
        selectVault,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        reorderNotes,
        reorderCollections,
        reorderVaultsInCollection,
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
