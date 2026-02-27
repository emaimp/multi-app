import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Divider, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { SideDrawer } from '../components/ui/SideDrawer';
import { UserStatus } from '../components/ui/UserStatus';
import { LoadingDialog } from '../components/ui/LoadingDialog';
import { useUser } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { useUserActivity } from '../hooks/useUserActivity';
import { useBackend } from '../hooks/useBackend';
import { VaultList, VaultListSkeleton, EditVaultDialog, VaultCreateDialog } from '../components/vault';
import { CreateDialog } from '../components/ui/CreateDialog';
import { Vault } from '../types/vault';
import { VaultView } from './vault/VaultView';
import { SettingsView } from './user/SettingsView';

export function MainView() {
  const navigate = useNavigate();
  const { user, logout, isLoadingContent, setIsLoadingContent, setUser } = useUser();
  const { invoke } = useBackend();
  const { status: userStatus } = useUserActivity();
  const { loadVaults } = useVaults();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const {
    vaults,
    collections,
    notes,
    selectedVaultId,
    vaultsLoading,
    lockedNoteIds,
    updateVault,
    deleteVault,
    selectVault,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    reorderCollections,
    reorderVaultsInCollection,
  } = useVaults();

  useEffect(() => {
    if (user && isLoadingContent) {
      const masterKey = localStorage.getItem('masterKey');
      if (masterKey) {
        setAvatarLoading(true);
        Promise.all([
          invoke('init_session', { userId: user.id, masterKey }),
          loadVaults(),
        ]).then(() => {
          invoke<string | null>('get_user_avatar', { userId: user.id }).then((avatar) => {
            if (avatar) {
              setUser({ ...user, avatar });
            }
            setAvatarLoading(false);
            setIsLoadingContent(false);
          }).catch(() => {
            setAvatarLoading(false);
            setIsLoadingContent(false);
          });
        }).catch(() => {
          setAvatarLoading(false);
          setIsLoadingContent(false);
        });
      } else {
        setIsLoadingContent(false);
      }
    }
  }, []);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createSimpleNoteDialogOpen, setCreateSimpleNoteDialogOpen] = useState(false);
  const [createAccessNoteDialogOpen, setCreateAccessNoteDialogOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);

  const selectedVault = vaults.find((v) => v.id === selectedVaultId);
  const vaultNotes = selectedVaultId ? notes.filter((n) => n.vault_id === selectedVaultId) : [];

  const handleVaultClick = (vaultId: string) => {
    selectVault(vaultId);
  };

  const handleAddSimpleNote = () => {
    if (selectedVaultId) {
      setCreateSimpleNoteDialogOpen(true);
    }
  };

  const handleAddAccessNote = () => {
    if (selectedVaultId) {
      setCreateAccessNoteDialogOpen(true);
    }
  };

  const handleCreateSimpleNote = (title: string) => {
    if (selectedVaultId) {
      addNote(selectedVaultId, title, '');
    }
  };

  const handleCreateAccessNote = (title: string) => {
    if (selectedVaultId) {
      addNote(selectedVaultId, title, '::');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <SideDrawer
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
                    <UserStatus
                      username={user?.username}
                      avatar={user?.avatar}
                      avatarLoading={avatarLoading}
                      status={userStatus}
                    />
                    <IconButton
                      onClick={logout}
                      color="error"
                      size="small"
                      sx={{ borderRadius: 1 }}
                    >
                      <LogoutIcon />
                    </IconButton>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setCreateDialogOpen(true)}
                      startIcon={<AddIcon />}
                    >
                      New Vault
                    </Button>
                  </Box>
                  <Divider sx={{ mx: 2 }} />
                </>
              }
              footer={
                <>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleSettingsClick}
                      startIcon={<SettingsIcon />}
                    >
                      Settings
                    </Button>
                  </Box>
                </>
              }
            >
              {vaultsLoading ? (
                <VaultListSkeleton />
              ) : (
                <VaultList
                  vaults={vaults}
                  collections={collections}
                  selectedVaultId={selectedVaultId}
                  onVaultClick={handleVaultClick}
                  onEditVault={(vault) => setEditingVault(vault)}
                  onCollectionReorder={reorderCollections}
                  onVaultReorderInCollection={reorderVaultsInCollection}
                />
              )}
            </SideDrawer>

            <VaultView
              selectedVault={selectedVault}
              vaultNotes={vaultNotes}
              lockedNoteIds={lockedNoteIds}
              username={user?.username}
              onAddSimpleNote={handleAddSimpleNote}
              onAddAccessNote={handleAddAccessNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onReorderNotes={reorderNotes}
            />

            <VaultCreateDialog
              open={createDialogOpen}
              title="Create New Vault"
              label="Vault Name"
              placeholder="Enter vault name"
              onClose={() => setCreateDialogOpen(false)}
            />

            <CreateDialog
              open={createSimpleNoteDialogOpen}
              title="Create New Simple Note"
              label="Simple Note Title"
              placeholder="Enter a title for your simple note"
              onClose={() => setCreateSimpleNoteDialogOpen(false)}
              onCreate={handleCreateSimpleNote}
            />

            <CreateDialog
              open={createAccessNoteDialogOpen}
              title="Create New Access Note"
              label="Access Note Title"
              placeholder="Enter a title for your access note"
              onClose={() => setCreateAccessNoteDialogOpen(false)}
              onCreate={handleCreateAccessNote}
            />

            <EditVaultDialog
              open={!!editingVault}
              vault={editingVault}
              onClose={() => setEditingVault(null)}
              onSave={updateVault}
              onDelete={deleteVault}
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
