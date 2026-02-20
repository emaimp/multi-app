import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Divider, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { SideDrawer } from '../components/ui/SideDrawer';
import { useUser } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { VaultList, CreateVaultDialog, EditVaultDialog } from '../components/vault';
import { CreateSimpleNoteDialog, CreateAccessNoteDialog } from '../components/note';
import { Vault } from '../types/vault';
import { SettingsView } from './user/SettingsView';
import { UserHeader } from '../components/main/UserHeader';
import { MainContent } from '../components/main/MainContent';

export function MainView() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const {
    vaults,
    notes,
    selectedVaultId,
    vaultsLoading,
    lockedNoteIds,
    addVault,
    updateVault,
    deleteVault,
    selectVault,
    addNote,
    updateNote,
    deleteNote,
  } = useVaults();

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
    <Routes>
      <Route
        path="/"
        element={
          <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <SideDrawer
              header={
                <>
                  <UserHeader
                    username={user?.username}
                    avatar={user?.avatar}
                    onLogout={logout}
                  />
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <VaultList
                  vaults={vaults}
                  selectedVaultId={selectedVaultId}
                  onVaultClick={handleVaultClick}
                  onEditVault={(vault) => setEditingVault(vault)}
                />
              )}
            </SideDrawer>

            <MainContent
              selectedVault={selectedVault}
              vaultNotes={vaultNotes}
              lockedNoteIds={lockedNoteIds}
              username={user?.username}
              onAddSimpleNote={handleAddSimpleNote}
              onAddAccessNote={handleAddAccessNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />

            <CreateVaultDialog
              open={createDialogOpen}
              onClose={() => setCreateDialogOpen(false)}
              onCreate={addVault}
            />

            <CreateSimpleNoteDialog
              open={createSimpleNoteDialogOpen}
              onClose={() => setCreateSimpleNoteDialogOpen(false)}
              onCreate={handleCreateSimpleNote}
            />

            <CreateAccessNoteDialog
              open={createAccessNoteDialogOpen}
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
  );
}

export default MainView;
