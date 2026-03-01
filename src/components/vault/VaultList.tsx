import { Box, Typography, List } from '@mui/material';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortableSensors } from '../../hooks/useSortableSensors';
import { Vault } from '../../types/vault';
import { Collection } from '../../types/collection';
import { CollectionAccordion } from './CollectionAccordion';
import { VaultCard } from './VaultCard';

interface VaultListProps {
  vaults: Vault[];
  collections: Collection[];
  onEditVault: (vault: Vault) => void;
  onEditCollection: (collection: Collection) => void;
  onVaultClick: (vaultId: string) => void;
  selectedVaultId: string | null;
  onCollectionReorder: (collections: Collection[]) => void;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
  onVaultReorder: (vaults: Vault[]) => void;
}

export function VaultList({ 
  vaults, 
  collections, 
  onEditVault, 
  onEditCollection,
  onVaultClick, 
  selectedVaultId,
  onCollectionReorder,
  onVaultReorderInCollection,
  onVaultReorder,
}: VaultListProps) {
  const sensors = useSortableSensors();

  const handleCollectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((c) => c.id === active.id);
      const newIndex = collections.findIndex((c) => c.id === over.id);
      const newCollections = arrayMove(collections, oldIndex, newIndex);
      onCollectionReorder(newCollections);
    }
  };

  const handleUnassignedVaultDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = unassignedVaults.findIndex((v) => v.id === active.id);
      const newIndex = unassignedVaults.findIndex((v) => v.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newVaults = arrayMove(unassignedVaults, oldIndex, newIndex);
        onVaultReorder(newVaults);
      }
    }
  };

  const allCollectionIds = collections.map(c => c.id);
  
  const unassignedVaults = vaults.filter(
    vault => !collections.some(collection => collection.vault_ids.includes(vault.id))
  );

  const unassignedVaultIds = unassignedVaults.map(v => v.id);

  return (
    <Box sx={{ width: '100%' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCollectionDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={allCollectionIds} strategy={verticalListSortingStrategy}>
          {collections.map((collection) => (
            <SortableCollection
              key={collection.id}
              collection={collection}
              vaults={vaults}
              onVaultClick={onVaultClick}
              onEditVault={onEditVault}
              onEditCollection={onEditCollection}
              selectedVaultId={selectedVaultId}
              onVaultReorderInCollection={onVaultReorderInCollection}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {unassignedVaults.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleUnassignedVaultDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={unassignedVaultIds} strategy={verticalListSortingStrategy}>
            <List>
              {unassignedVaults.map((vault) => (
                <SortableVaultItem
                  key={vault.id}
                  vault={vault}
                  onVaultClick={onVaultClick}
                  onEditVault={onEditVault}
                  selectedVaultId={selectedVaultId}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      )}
      
      {vaults.length === 0 && collections.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            No vaults yet. Click "New Vault" to create one.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

interface SortableCollectionProps {
  collection: Collection;
  vaults: Vault[];
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  onEditCollection: (collection: Collection) => void;
  selectedVaultId: string | null;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
}

function SortableCollection({
  collection,
  vaults,
  onVaultClick,
  onEditVault,
  onEditCollection,
  selectedVaultId,
  onVaultReorderInCollection,
}: SortableCollectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const collectionVaults = vaults.filter(v => collection.vault_ids.includes(v.id));

  return (
    <Box ref={setNodeRef} style={style}>
      <CollectionAccordion
        collection={collection}
        vaults={collectionVaults}
        onVaultClick={onVaultClick}
        onEditVault={onEditVault}
        onEditCollection={onEditCollection}
        selectedVaultId={selectedVaultId}
        dragAttributes={attributes}
        dragListeners={listeners}
        onVaultReorder={onVaultReorderInCollection}
      />
    </Box>
  );
}

interface SortableVaultItemProps {
  vault: Vault;
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  selectedVaultId: string | null;
}

function SortableVaultItem({ vault, onVaultClick, onEditVault, selectedVaultId }: SortableVaultItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vault.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ cursor: isDragging ? 'grabbing' : 'default' }}>
      <VaultCard
        vault={vault}
        onClick={() => onVaultClick(vault.id)}
        onEdit={onEditVault}
        isSelected={selectedVaultId === vault.id}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export default VaultList;
