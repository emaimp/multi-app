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
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import { Vault } from '../../../types/vault';
import { Collection } from '../../../types/collection';
import { CollectionAccordion } from '../mainsidebar/CollectionAccordion';

interface VaultListProps {
  vaults: Vault[];
  collections: Collection[];
  onEditVault: (vault: Vault) => void;
  onEditCollection?: (collection: Collection) => void;
  onVaultClick: (vaultId: string) => void;
  activeVault: string | null;
  onCollectionReorder: (collections: Collection[]) => void;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
}

export function VaultList({ 
  vaults, 
  collections, 
  onEditVault, 
  onEditCollection,
  onVaultClick, 
  activeVault,
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
  
  const unassignedVaults = vaults.filter(
    vault => !collections.some(collection => collection.vault_ids.includes(vault.id))
  );

  const unassignedVaultIds = unassignedVaults.map(v => v.id);

  const generalCollection = {
    id: 'general',
    name: 'General',
    vault_ids: unassignedVaultIds,
  } as Collection;

  const allCollections = unassignedVaults.length > 0
    ? [...collections, generalCollection]
    : collections;

  const allCollectionIdsWithGeneral = allCollections.map(c => c.id);

  return (
    <Box sx={{ width: '100%' }}>
      {allCollections.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCollectionDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={allCollectionIdsWithGeneral} strategy={verticalListSortingStrategy}>
            {allCollections.map((collection) => (
              <SortableCollection
                key={collection.id}
                collection={collection}
                vaults={vaults}
                onVaultClick={onVaultClick}
                onEditVault={onEditVault}
                onEditCollection={onEditCollection}
                activeVault={activeVault}
                onVaultReorderInCollection={onVaultReorderInCollection}
                isGeneral={collection.id === 'general'}
                defaultExpanded={activeVault ? collection.vault_ids.includes(activeVault) : collection.vault_ids.length > 0}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <Box
          sx={{
            pt: 4,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          <Typography variant="body2">
            There are no vaults yet.
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
  onEditCollection?: (collection: Collection) => void;
  activeVault: string | null;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
  isGeneral?: boolean;
  defaultExpanded?: boolean;
}

function SortableCollection({
  collection,
  vaults,
  onVaultClick,
  onEditVault,
  onEditCollection,
  activeVault,
  onVaultReorderInCollection,
  isGeneral = false,
  defaultExpanded = false,
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
        activeVault={activeVault}
        dragAttributes={attributes}
        dragListeners={listeners}
        onVaultReorder={onVaultReorderInCollection}
        isGeneral={isGeneral}
        defaultExpanded={defaultExpanded}
      />
    </Box>
  );
}

export default VaultList;
