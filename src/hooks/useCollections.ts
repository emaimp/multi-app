import { useState, useEffect, useRef } from 'react';
import { Collection } from '../types/collection';
import { useUser } from '../context/AuthContext';
import { useBackend } from './useBackend';

interface UseCollectionsReturn {
  // States
  collections: Collection[];
  
  // Load functions
  loadCollections: () => Promise<void>;
  
  // CRUD Collections
  createCollection: (name: string) => Promise<Collection | undefined>;
  updateCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  reorderCollections: (collections: Collection[]) => Promise<void>;
  setVaultIds: (collectionId: string, vaultIds: string[]) => Promise<void>;
  
  // Internal
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}

export function useCollections(): UseCollectionsReturn {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [collections, setCollections] = useState<Collection[]>([]);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setCollections([]);
    }
    prevUserRef.current = user;
  }, [user]);

  // Load functions
  const loadCollections = async () => {
    if (!user) return;
    const collectionsData = await invoke<Collection[]>('get_collections', { userId: user.id });
    setCollections(collectionsData);
  };

  // CRUD Collections
  const createCollection = async (name: string) => {
    if (!user) return undefined;
    const newCollection = await invoke<Collection>('create_collection', {
      userId: user.id,
      name,
    });
    setCollections((prev) => [...prev, newCollection]);
    return newCollection;
  };

  const updateCollection = async (collection: Collection) => {
    await invoke('update_collection', {
      collection: JSON.stringify(collection),
    });
    setCollections((prev) =>
      prev.map((c) => (c.id === collection.id ? collection : c))
    );
  };

  const deleteCollection = async (collectionId: string) => {
    const deletedCollection = collections.find((c) => c.id === collectionId);
    const vaultIdsInDeletedCollection = deletedCollection?.vault_ids || [];

    for (const vaultId of vaultIdsInDeletedCollection) {
      await invoke('delete_vault', { vaultId });
    }

    await invoke('delete_collection', { collectionId });

    const remainingCollections = collections
      .filter((c) => c.id !== collectionId)
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < remainingCollections.length; i++) {
      const collection = remainingCollections[i];
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collection, position: i }),
      });
    }

    setCollections((prev) => {
      const filtered = prev.filter((c) => c.id !== collectionId);
      return filtered.map((c, i) => ({ ...c, position: i }));
    });
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

  const setVaultIds = async (collectionId: string, newVaultIds: string[]) => {
    const collection = collections.find((c) => c.id === collectionId);

    if (newVaultIds.length === 0 && collection) {
      await deleteCollection(collectionId);
      return;
    }

    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, vault_ids: newVaultIds } : c))
    );

    if (collection) {
      await invoke('update_collection', {
        collection: JSON.stringify({ ...collection, vault_ids: newVaultIds }),
      });
    }
  };

  return {
    collections,
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    setVaultIds,
    setCollections,
  };
}
