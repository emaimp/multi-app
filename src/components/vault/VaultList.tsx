import { Box, Typography } from '@mui/material';
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

interface VaultListProps {
  vaults: Vault[];
  collections: Collection[];
  onEditVault: (vault: Vault) => void;
  onVaultClick: (vaultId: string) => void;
  selectedVaultId: string | null;
  onCollectionReorder: (collections: Collection[]) => void;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
}

export function VaultList({ 
  vaults, 
  collections, 
  onEditVault, 
  onVaultClick, 
  selectedVaultId,
  onCollectionReorder,
  onVaultReorderInCollection,
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

  const allCollectionIds = collections.map(c => c.id);

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
              selectedVaultId={selectedVaultId}
              onVaultReorderInCollection={onVaultReorderInCollection}
            />
          ))}
        </SortableContext>
      </DndContext>
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
  selectedVaultId: string | null;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
}

function SortableCollection({
  collection,
  vaults,
  onVaultClick,
  onEditVault,
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
        selectedVaultId={selectedVaultId}
        dragAttributes={attributes}
        dragListeners={listeners}
        onVaultReorder={onVaultReorderInCollection}
      />
    </Box>
  );
}

export default VaultList;
