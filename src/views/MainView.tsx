import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { SideDrawer, UserHeader, LoadingDialog, CreateDialog } from '../components/ui';
import { useUser } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { useBackend } from '../hooks/useBackend';
import {
  VaultList,
  VaultListSkeleton,
  VaultEditDialog,
  CollectionEditDialog,
  VaultTypeSelector,
} from '../components/vault';
import { Vault } from '../types/vault';
import { Collection } from '../types/collection';
import { VaultView } from './vault/VaultView';
import { SettingsView } from './user/SettingsView';

export function MainView() {
  const navigate = useNavigate();
  const { user, logout, isLoadingContent, setIsLoadingContent, setUser } = useUser();
  const { invoke } = useBackend();
  const [imageLoading, setImageLoading] = useState(false);
  const {
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
    lockedNotes,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
  } = useVaults();

  useEffect(() => {
    if (user && isLoadingContent) {
      const masterKey = localStorage.getItem('masterKey');
      if (masterKey) {
        setImageLoading(true);
        Promise.all([
          invoke('init_session', { userId: user.id, masterKey }),
          loadVaults(),
        ]).then(() => {
          invoke<string | null>('get_user_avatar', { userId: user.id }).then((avatar) => {
            if (avatar) {
              setUser({ ...user, avatar });
            }
            setImageLoading(false);
            setIsLoadingContent(false);
          }).catch(() => {
            setImageLoading(false);
            setIsLoadingContent(false);
          });
        }).catch(() => {
          setImageLoading(false);
          setIsLoadingContent(false);
        });
      } else {
        setIsLoadingContent(false);
      }
    }
  }, []);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false);
  const [createSimpleNoteDialogOpen, setCreateSimpleNoteDialogOpen] = useState(false);
  const [createAccessNoteDialogOpen, setCreateAccessNoteDialogOpen] = useState(false);
  const [vaultTypeSelectorOpen, setVaultTypeSelectorOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const selectedVault = vaults.find((v) => v.id === activeVault);
  const vaultNotes = activeVault ? notes.filter((n) => n.vault_id === activeVault) : [];

  const handleVaultClick = (vaultId: string) => {
    selectVault(vaultId);
  };

  const handleAddSimpleNote = () => {
    if (activeVault) {
      setCreateSimpleNoteDialogOpen(true);
    }
  };

  const handleAddAccessNote = () => {
    if (activeVault) {
      setCreateAccessNoteDialogOpen(true);
    }
  };

  const handleCreateSimpleNote = (title: string) => {
    if (activeVault) {
      createNote(activeVault, title, '');
    }
  };

  const handleCreateAccessNote = (title: string) => {
    if (activeVault) {
      createNote(activeVault, title, '::');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleSelectVault = () => {
    setCreateDialogOpen(true);
  };

  const handleSelectCollection = () => {
    setCreateCollectionDialogOpen(true);
  };

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <SideDrawer
              onContentClick={clearVaultSelect}
              header={
                <>
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <UserHeader
                      image={user?.avatar}
                      imageLoading={imageLoading}
                      onSettingsClick={handleSettingsClick}
                      onHelpClick={() => {}}
                      onLogoutClick={logout}
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setVaultTypeSelectorOpen(true)}
                      startIcon={<AddIcon />}

                    >
                      New
                    </Button>
                  </Box>
                  <Divider />
                </>
              }
            >
              {loadingVaults ? (
                <VaultListSkeleton />
              ) : (
                <VaultList
                  vaults={vaults}
                  collections={collections}
                  activeVault={activeVault}
                  onVaultClick={handleVaultClick}
                  onEditVault={(vault) => setEditingVault(vault)}
                  onEditCollection={(collection) => setEditingCollection(collection)}
                  onCollectionReorder={reorderCollections}
                  onVaultReorderInCollection={reorderVaultsInCollection}
                  onVaultReorder={reorderVaults}
                />
              )}
            </SideDrawer>

            <VaultView
              selectedVault={selectedVault}
              vaultNotes={vaultNotes}
              lockedNotes={lockedNotes}
              isLoading={isLoadingContent}
              onAddSimpleNote={handleAddSimpleNote}
              onAddAccessNote={handleAddAccessNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onReorderNotes={reorderNotes}
            />

            <CreateDialog
              open={createDialogOpen}
              title="Create Vault"
              label="Vault Name"
              placeholder="Enter vault name"
              titleIcon={<InventoryIcon />}
              onClose={() => setCreateDialogOpen(false)}
              onCreate={(name) => createVault(name, 'blue')}
            />

            <CreateDialog
              open={createCollectionDialogOpen}
              title="Create Collection"
              label="Collection Name"
              placeholder="Enter collection name"
              titleIcon={<ViewModuleIcon />}
              onClose={() => setCreateCollectionDialogOpen(false)}
              onCreate={createCollection}
            />

            <CreateDialog
              open={createSimpleNoteDialogOpen}
              title="Create Simple Note"
              label="Simple Note Title"
              placeholder="Enter simple note title"
              titleIcon={<EventNoteIcon />}
              onClose={() => setCreateSimpleNoteDialogOpen(false)}
              onCreate={handleCreateSimpleNote}
            />

            <CreateDialog
              open={createAccessNoteDialogOpen}
              title="Create Access Note"
              label="Access Note Title"
              placeholder="Enter access note title"
              titleIcon={<LockOpenIcon />}
              onClose={() => setCreateAccessNoteDialogOpen(false)}
              onCreate={handleCreateAccessNote}
            />

            <VaultEditDialog
              open={!!editingVault}
              vault={editingVault}
              onClose={() => setEditingVault(null)}
              onSave={updateVault}
              onDelete={deleteVault}
            />

            <CollectionEditDialog
              open={!!editingCollection}
              collection={editingCollection}
              onClose={() => setEditingCollection(null)}
              onSave={updateCollection}
              onDelete={deleteCollection}
            />

            <VaultTypeSelector
              open={vaultTypeSelectorOpen}
              onClose={() => setVaultTypeSelectorOpen(false)}
              onSelectVault={handleSelectVault}
              onSelectCollection={handleSelectCollection}
            />
          </Box>
        }
      />
      <Route path="/settings" element={<SettingsView />} />
    </Routes>
    <LoadingDialog open={isLoadingContent} />
    </>
  );
}

export default MainView;
