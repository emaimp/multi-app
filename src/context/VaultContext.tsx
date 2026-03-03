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
  reorderVaults: (vaults: Vault[]) => Promise<void>;
  selectVault: (vaultId: string) => Promise<void>;
  loadNotes: (vaultId: string) => Promise<void>;
  addNote: (vaultId: string, title: string, content: string) => Promise<void>;
  updateNote: (noteId: string, title: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  reorderNotes: (notes: Note[]) => Promise<void>;
  reorderCollections: (collections: Collection[]) => void;
  reorderVaultsInCollection: (collectionId: string, vault_ids: string[]) => void;
  createCollection: (name: string) => Promise<void>;
  updateCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
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
      const [vaultsData, collectionsData] = await Promise.all([
        invoke<Vault[]>('get_vaults', { userId: user.id }),
        invoke<Collection[]>('get_collections', { userId: user.id }),
      ]);
      setVaults(vaultsData);
      setCollections(collectionsData);
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
        const updatedVaultIds = [...collection.vault_ids, newVault.id];
        
        await invoke('update_collection', {
          collection: JSON.stringify({ ...collection, vault_ids: updatedVaultIds }),
        });
        setCollections(prev => prev.map(c => 
          c.id === collection.id ? { ...c, vault_ids: updatedVaultIds } : c
        ));
      } else {
        const newCollection = await invoke<Collection>('create_collection', {
          userId: user.id,
          name: collectionName,
        });
        const updatedCollection = { ...newCollection, vault_ids: [newVault.id] };
        await invoke('update_collection', {
          collection: JSON.stringify(updatedCollection),
        });
        setCollections(prev => [...prev, updatedCollection]);
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
    
    const collectionWithVault = collections.find(c => c.vault_ids.includes(vaultId));
    if (collectionWithVault) {
      const updatedVaultIds = collectionWithVault.vault_ids.filter(id => id !== vaultId);
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collectionWithVault, vault_ids: updatedVaultIds }),
      });
    }
    
    const remainingUnassignedVaults = vaults
      .filter(v => !collections.some(c => c.vault_ids.includes(v.id)) && v.id !== vaultId)
      .sort((a, b) => a.position - b.position);
    
    for (let i = 0; i < remainingUnassignedVaults.length; i++) {
      await invoke('update_vault_position', { vaultId: remainingUnassignedVaults[i].id, newPosition: i });
    }
    
    setVaults(prev => {
      const filtered = prev.filter((v) => v.id !== vaultId);
      return filtered.map(v => {
        const newIndex = remainingUnassignedVaults.findIndex(uv => uv.id === v.id);
        if (newIndex !== -1) {
          return { ...v, position: newIndex };
        }
        return v;
      });
    });
    
    setCollections(prev => prev.map(c => ({
      ...c,
      vault_ids: c.vault_ids.filter(id => id !== vaultId)
    })));
    setNotes((prev) => prev.filter((n) => n.vault_id !== vaultId));
    if (selectedVaultId === vaultId) {
      setSelectedVaultId(null);
      setNotes([]);
    }
  };

  const reorderVaults = async (reorderedVaults: Vault[]) => {
    const updatedVaults = reorderedVaults.map((v, i) => ({ ...v, position: i }));
    setVaults(updatedVaults);
    for (let i = 0; i < updatedVaults.length; i++) {
      await invoke('update_vault_position', { vaultId: updatedVaults[i].id, newPosition: i });
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
    
    const remainingNotes = notes
      .filter(n => n.id !== noteId)
      .sort((a, b) => a.position - b.position);
    
    for (let i = 0; i < remainingNotes.length; i++) {
      await invoke('update_note_position', { noteId: remainingNotes[i].id, newPosition: i });
    }
    
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const reorderNotes = async (reorderedNotes: Note[]) => {
    const updatedNotes = reorderedNotes.map((n, i) => ({ ...n, position: i }));
    setNotes(updatedNotes);
    for (let i = 0; i < updatedNotes.length; i++) {
      await invoke('update_note_position', { noteId: updatedNotes[i].id, newPosition: i });
    }
  };

  const reorderCollections = async (reorderedCollections: Collection[]) => {
    setCollections(reorderedCollections);
    for (let i = 0; i < reorderedCollections.length; i++) {
      const collection = reorderedCollections[i];
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collection, position: i }),
      });
    }
  };

  const reorderVaultsInCollection = async (collectionId: string, newVaultIds: string[]) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, vault_ids: newVaultIds } : c
    ));
    
    for (let i = 0; i < newVaultIds.length; i++) {
      await invoke('update_vault_position', { vaultId: newVaultIds[i], newPosition: i });
    }
    
    setVaults(prev => prev.map(v => {
      const newIndex = newVaultIds.indexOf(v.id);
      if (newIndex !== -1) {
        return { ...v, position: newIndex };
      }
      return v;
    }));
    
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collection, vault_ids: newVaultIds }),
      });
    }
  };

  const createCollection = async (name: string) => {
    if (!user) return;
    const newCollection = await invoke<Collection>('create_collection', {
      userId: user.id,
      name,
    });
    setCollections(prev => [...prev, newCollection]);
  };

  const updateCollection = async (collection: Collection) => {
    const oldCollection = collections.find(c => c.id === collection.id);
    const oldVaultIds = oldCollection?.vault_ids || [];
    const newVaultIds = collection.vault_ids;
    
    const addedVaultIds = newVaultIds.filter(id => !oldVaultIds.includes(id));
    const removedVaultIds = oldVaultIds.filter(id => !newVaultIds.includes(id));
    
    const unassignedVaults = vaults.filter(
      v => !collections.some(c => c.vault_ids.includes(v.id)) && !addedVaultIds.includes(v.id)
    );
    const nextUnassignedPosition = unassignedVaults.length;
    
    for (let i = 0; i < removedVaultIds.length; i++) {
      await invoke('update_vault_position', { 
        vaultId: removedVaultIds[i], 
        newPosition: nextUnassignedPosition + i 
      });
    }
    
    for (let i = 0; i < newVaultIds.length; i++) {
      await invoke('update_vault_position', { 
        vaultId: newVaultIds[i], 
        newPosition: i 
      });
    }
    
    await invoke('update_collection', {
      collection: JSON.stringify(collection),
    });
    
    setCollections(prev => prev.map(c => {
      if (c.id === collection.id) {
        return collection;
      }
      const updatedVaultIds = c.vault_ids.filter(id => !newVaultIds.includes(id));
      if (updatedVaultIds !== c.vault_ids) {
        invoke('update_collection', {
          collection: JSON.stringify({ ...c, vault_ids: updatedVaultIds }),
        });
        return { ...c, vault_ids: updatedVaultIds };
      }
      return c;
    }));
    
    setVaults(prev => prev.map(v => {
      if (addedVaultIds.includes(v.id)) {
        const newIndex = newVaultIds.indexOf(v.id);
        return { ...v, position: newIndex };
      }
      if (removedVaultIds.includes(v.id)) {
        const newIndex = nextUnassignedPosition + removedVaultIds.indexOf(v.id);
        return { ...v, position: newIndex };
      }
      return v;
    }));
  };

  const deleteCollection = async (collectionId: string) => {
    const deletedCollection = collections.find(c => c.id === collectionId);
    const vaultIdsInDeletedCollection = deletedCollection?.vault_ids || [];
    
    for (const vaultId of vaultIdsInDeletedCollection) {
      await invoke('delete_vault', { vaultId });
    }
    
    await invoke('delete_collection', { collectionId });
    
    const remainingCollections = collections
      .filter(c => c.id !== collectionId)
      .sort((a, b) => a.position - b.position);
    
    for (let i = 0; i < remainingCollections.length; i++) {
      const collection = remainingCollections[i];
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collection, position: i }),
      });
    }
    
    setCollections(prev => {
      const filtered = prev.filter(c => c.id !== collectionId);
      return filtered.map((c, i) => ({ ...c, position: i }));
    });
    
    setVaults(prev => prev.filter(v => !vaultIdsInDeletedCollection.includes(v.id)));
    setNotes(prev => prev.filter(n => !vaultIdsInDeletedCollection.includes(n.vault_id)));
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
        reorderVaults,
        selectVault,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        reorderNotes,
        reorderCollections,
        reorderVaultsInCollection,
        createCollection,
        updateCollection,
        deleteCollection,
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
