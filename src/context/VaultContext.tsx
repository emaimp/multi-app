import { createContext, useContext, ReactNode, useCallback } from 'react';
import { Vault } from '../types/vault';
import { Note } from '../types/note';
import { LoginKey } from '../types/loginkey';
import { Collection } from '../types/collection';
import { useVaults as useVaultsHook } from '../hooks/useVaults';
import { useNotes as useNotesHook } from '../hooks/useNotes';
import { useLoginKeys as useLoginKeysHook } from '../hooks/useLoginKeys';
import { useCollections as useCollectionsHook } from '../hooks/useCollections';
import { useBackend } from '../hooks/useBackend';

interface VaultContextType {
  // States
  vaults: Vault[];
  notes: Note[];
  loginKeys: LoginKey[];
  collections: Collection[];
  
  // Active states
  activeVault: string | null;
  selectVault: (vaultId: string) => Promise<void>;
  clearVaultSelect: () => void;
  
  // Load functions
  loadingVaults: boolean;
  loadVaults: () => Promise<void>;
  
  // CRUD Vaults
  createVault: (name: string, color: string) => Promise<void>;
  updateVault: (vault: Vault, image?: string | null) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  reorderVaults: (vaults: Vault[]) => Promise<void>;
  reorderVaultsInCollection: (collectionId: string, vault_ids: string[]) => void;
  
  // CRUD Notes
  createNote: (vaultId: string, title: string, content: string, color?: string) => Promise<Note | undefined>;
  updateNote: (noteId: string, title: string, content: string, color?: string, image?: string | null) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  reorderNotes: (notes: Note[]) => Promise<void>;

  // CRUD LoginKeys
  createLoginKey: (vaultId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color?: string) => Promise<LoginKey | undefined>;
  updateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color?: string, image?: string | null) => Promise<void>;
  deleteLoginKey: (loginKeyId: string) => Promise<void>;
  reorderLoginKeys: (loginKeys: LoginKey[]) => Promise<void>;
  
  // CRUD Collections
  createCollection: (name: string) => Promise<void>;
  updateCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  reorderCollections: (collections: Collection[]) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { invoke } = useBackend();
  
  const {
    vaults,
    activeVault,
    loadingVaults,
    loadVaults: loadVaultsHook,
    createVault: createVaultHook,
    updateVault: updateVaultHook,
    deleteVault: deleteVaultHook,
    reorderVaults: reorderVaultsHook,
    selectVault: selectVaultHook,
    setVaults,
    clearVaultSelect,
  } = useVaultsHook();

  const {
    notes,
    loadNotes: loadNotesHook,
    createNote: createNoteHook,
    updateNote: updateNoteHook,
    deleteNote: deleteNoteHook,
    reorderNotes: reorderNotesHook,
    setNotes,
    clearNotes,
  } = useNotesHook();

  const {
    loginKeys,
    loadLoginKeys: loadLoginKeysHook,
    createLoginKey: createLoginKeyHook,
    updateLoginKey: updateLoginKeyHook,
    deleteLoginKey: deleteLoginKeyHook,
    reorderLoginKeys: reorderLoginKeysHook,
    setLoginKeys,
    clearLoginKeys,
  } = useLoginKeysHook();

  const {
    collections,
    loadCollections: loadCollectionsHook,
    createCollection: createCollectionHook,
    updateCollection: updateCollectionHook,
    deleteCollection: deleteCollectionHook,
    reorderCollections: reorderCollectionsHook,
    reorderVaultsInCollection: reorderVaultsInCollectionHook,
    setCollections,
  } = useCollectionsHook();

  // Load function
  const loadVaults = useCallback(async () => {
    await loadVaultsHook();
    await loadCollectionsHook();
  }, [loadVaultsHook, loadCollectionsHook]);

  // CRUD Vaults
  const createVault = async (name: string, color: string) => {
    await createVaultHook(name, color);
  };

  const updateVault = async (vault: Vault, image?: string | null) => {
    await updateVaultHook(vault, image);
  };

  const deleteVault = async (vaultId: string) => {
    const collectionWithVault = collections.find((c) => c.vault_ids.includes(vaultId));
    if (collectionWithVault) {
      const updatedVaultIds = collectionWithVault.vault_ids.filter((id) => id !== vaultId);
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collectionWithVault, vault_ids: updatedVaultIds }),
      });
    }

    const remainingUnassignedVaults = vaults
      .filter((v) => !collections.some((c) => c.vault_ids.includes(v.id)) && v.id !== vaultId)
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < remainingUnassignedVaults.length; i++) {
      await invoke('update_vault_position', { vaultId: remainingUnassignedVaults[i].id, newPosition: i });
    }

    setVaults((prev) => {
      const filtered = prev.filter((v) => v.id !== vaultId);
      return filtered.map((v) => {
        const newIndex = remainingUnassignedVaults.findIndex((uv) => uv.id === v.id);
        if (newIndex !== -1) {
          return { ...v, position: newIndex };
        }
        return v;
      });
    });

    setCollections((prev) =>
      prev.map((c) => ({
        ...c,
        vault_ids: c.vault_ids.filter((id) => id !== vaultId),
      }))
    );

    await deleteVaultHook(vaultId);
    setNotes((prev) => prev.filter((n) => n.vault_id !== vaultId));
    setLoginKeys((prev) => prev.filter((lk) => lk.vault_id !== vaultId));
    if (activeVault === vaultId) {
      clearNotes();
      clearLoginKeys();
    }
  };

  const selectVault = async (vaultId: string) => {
    await selectVaultHook(vaultId);
    await loadNotesHook(vaultId);
    await loadLoginKeysHook(vaultId);
  };

  const reorderVaults = async (reorderedVaults: Vault[]) => {
    await reorderVaultsHook(reorderedVaults);
  };

  // CRUD Notes
  const createNote = async (vaultId: string, title: string, content: string, color?: string): Promise<Note | undefined> => {
    return await createNoteHook(vaultId, title, content, color);
  };

  const updateNote = async (noteId: string, title: string, content: string, color?: string, image?: string | null) => {
    await updateNoteHook(noteId, title, content, color, image);
  };

  const deleteNote = async (noteId: string) => {
    await deleteNoteHook(noteId);
  };

  const reorderNotes = async (reorderedNotes: Note[]) => {
    await reorderNotesHook(reorderedNotes);
  };

  // CRUD LoginKeys
  const createLoginKey = async (vaultId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color?: string): Promise<LoginKey | undefined> => {
    return await createLoginKeyHook(vaultId, siteName, url, username, password, details, color);
  };

  const updateLoginKey = async (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null, color?: string, image?: string | null) => {
    await updateLoginKeyHook(loginKeyId, siteName, url, username, password, details, color, image);
  };

  const deleteLoginKey = async (loginKeyId: string) => {
    await deleteLoginKeyHook(loginKeyId);
  };

  const reorderLoginKeys = async (reorderedLoginKeys: LoginKey[]) => {
    await reorderLoginKeysHook(reorderedLoginKeys);
  };

  // CRUD Collections
  const createCollection = async (name: string) => {
    await createCollectionHook(name);
  };

  const updateCollection = async (collection: Collection) => {
    const oldCollection = collections.find((c) => c.id === collection.id);
    const oldVaultIds = oldCollection?.vault_ids || [];
    const newVaultIds = collection.vault_ids;

    const addedVaultIds = newVaultIds.filter((id) => !oldVaultIds.includes(id));
    const removedVaultIds = oldVaultIds.filter((id) => !newVaultIds.includes(id));

    const unassignedVaults = vaults.filter(
      (v) => !collections.some((c) => c.vault_ids.includes(v.id)) && !addedVaultIds.includes(v.id)
    );
    const nextUnassignedPosition = unassignedVaults.length;

    for (let i = 0; i < removedVaultIds.length; i++) {
      await invoke('update_vault_position', {
        vaultId: removedVaultIds[i],
        newPosition: nextUnassignedPosition + i,
      });
    }

    for (let i = 0; i < newVaultIds.length; i++) {
      await invoke('update_vault_position', {
        vaultId: newVaultIds[i],
        newPosition: i,
      });
    }

    await updateCollectionHook(collection);

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collection.id) {
          return collection;
        }
        const updatedVaultIds = c.vault_ids.filter((id) => !newVaultIds.includes(id));
        if (updatedVaultIds !== c.vault_ids) {
          invoke('update_collection', {
            collection: JSON.stringify({ ...c, vault_ids: updatedVaultIds }),
          });
          return { ...c, vault_ids: updatedVaultIds };
        }
        return c;
      })
    );

    setVaults((prev) =>
      prev.map((v) => {
        if (addedVaultIds.includes(v.id)) {
          const newIndex = newVaultIds.indexOf(v.id);
          return { ...v, position: newIndex };
        }
        if (removedVaultIds.includes(v.id)) {
          const newIndex = nextUnassignedPosition + removedVaultIds.indexOf(v.id);
          return { ...v, position: newIndex };
        }
        return v;
      })
    );
  };

  const deleteCollection = async (collectionId: string) => {
    await deleteCollectionHook(collectionId);
  };

  const reorderCollections = (reorderedCollections: Collection[]) => {
    reorderCollectionsHook(reorderedCollections);
  };

  const reorderVaultsInCollection = (collectionId: string, vaultIds: string[]) => {
    reorderVaultsInCollectionHook(collectionId, vaultIds);
  };

  return (
    <VaultContext.Provider
      value={{
        vaults,
        notes,
        collections,
        activeVault,
        selectVault,
        clearVaultSelect,
        loadingVaults,
        loadVaults,
        createVault,
        updateVault,
        deleteVault,
        reorderVaults,
        reorderVaultsInCollection,
        createNote,
        updateNote,
        deleteNote,
        reorderNotes,
        loginKeys,
        createLoginKey,
        updateLoginKey,
        deleteLoginKey,
        reorderLoginKeys,
        createCollection,
        updateCollection,
        deleteCollection,
        reorderCollections,
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
