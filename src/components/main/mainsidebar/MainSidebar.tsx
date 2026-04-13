import { Box, Button, Divider, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useSortableSensors } from '../../../hooks/useSortableSensors';
import { UserHeader } from './UserHeader';
import { Collection } from '../../../types/collection';
import { Vault } from '../../../types/vault';
import { CollectionAccordion } from './CollectionAccordion';
import { WithoutCollection } from './WithoutCollection';

interface MainSidebarProps {
  avatar?: string | null;
  avatarLoading?: boolean;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
  onNewClick?: () => void;
  onContentClick?: () => void;
  children?: React.ReactNode;
  vaults?: Vault[];
  collections?: Collection[];
  activeVault?: string | null;
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  onCollectionReorder?: (collections: Collection[]) => void;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
  unassignedVaults?: Vault[];
  onReorderUnassignedVaults?: (vaults: Vault[]) => void;
  animationKey?: string;
}

export function MainSidebar({
  avatar,
  avatarLoading,
  onSettingsClick,
  onHelpClick,
  onLogoutClick,
  onNewClick,
  onContentClick,
  children,
  vaults,
  collections,
  activeVault,
  onVaultClick,
  onEditVault,
  onCollectionReorder,
  onVaultReorderInCollection,
  unassignedVaults,
  onReorderUnassignedVaults,
  animationKey,
}: MainSidebarProps) {
  const vaultsOrEmpty = vaults ?? [];
  const collectionsOrEmpty = collections ?? [];
  const unassignedVaultsOrEmpty = unassignedVaults ?? [];
  const sensors = useSortableSensors();

  const handleCollectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onCollectionReorder) {
      const oldIndex = collectionsOrEmpty.findIndex((c) => c.id === active.id);
      const newIndex = collectionsOrEmpty.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCollections = arrayMove(collectionsOrEmpty, oldIndex, newIndex);
        onCollectionReorder(newCollections);
      }
    }
  };

  const allCollectionIds = collectionsOrEmpty.map(c => c.id);

  const hasContent = collectionsOrEmpty.length > 0 || unassignedVaultsOrEmpty.length > 0;

  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        height: '100vh',
        boxSizing: 'border-box',
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: 60,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'action.hover',
        }}
      >
        <UserHeader
          avatar={avatar}
          avatarLoading={avatarLoading}
          onSettingsClick={onSettingsClick}
          onHelpClick={onHelpClick}
          onLogoutClick={onLogoutClick}
        />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onNewClick}
          startIcon={<AddIcon />}
        >
          New
        </Button>
      </Box>
      <Divider />
      <Box 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onContentClick?.();
          }
        }}
        sx={{
          flex: 1,
          overflow: 'auto',
          cursor: 'pointer',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'action.hover',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        }}
      >
        {hasContent ? (
          <>
            {collectionsOrEmpty.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCollectionDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={allCollectionIds} strategy={verticalListSortingStrategy}>
                  {collectionsOrEmpty.map((collection) => (
                    <SortableCollection
                      key={`${animationKey}-${collection.id}`}
                      collection={collection}
                      vaults={vaultsOrEmpty}
                      onVaultClick={onVaultClick}
                      onEditVault={onEditVault}
                      activeVault={activeVault ?? null}
                      onVaultReorderInCollection={onVaultReorderInCollection}
                      defaultExpanded={collection.vault_ids.length > 0}
                      animationKey={animationKey}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            {unassignedVaultsOrEmpty.length > 0 && (
              <WithoutCollection
                vaults={unassignedVaultsOrEmpty}
                onVaultClick={onVaultClick}
                onEditVault={onEditVault}
                activeVault={activeVault ?? null}
                onReorder={onReorderUnassignedVaults ?? (() => {})}
                animationKey={animationKey}
              />
            )}
          </>
        ) : children ? children : (
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
    </Box>
  );
}

interface SortableCollectionProps {
  collection: Collection;
  vaults: Vault[];
  onVaultClick: (vaultId: string) => void;
  onEditVault: (vault: Vault) => void;
  activeVault: string | null;
  onVaultReorderInCollection: (collectionId: string, vaultIds: string[]) => void;
  defaultExpanded?: boolean;
  animationKey?: string;
}

function SortableCollection({
  collection,
  vaults,
  onVaultClick,
  onEditVault,
  activeVault,
  onVaultReorderInCollection,
  defaultExpanded = false,
  animationKey,
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
        activeVault={activeVault}
        dragAttributes={attributes}
        dragListeners={listeners}
        onVaultReorder={onVaultReorderInCollection}
        defaultExpanded={defaultExpanded}
        animationKey={animationKey}
      />
    </Box>
  );
}

export default MainSidebar;
