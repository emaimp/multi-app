import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Button, Divider, CircularProgress, Avatar, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { SideDrawer } from '../components/ui/SideDrawer';
import { useUser } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { VaultList, CreateVaultDialog, EditVaultDialog } from '../components/vault';
import { CreateSimpleNoteDialog, CreateAccessNoteDialog } from '../components/note';
import { Vault } from '../types/vault';
import { VaultView } from './vault/VaultView';
import { SettingsView } from './user/SettingsView';

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
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            color: 'text.primary',
                            bgcolor: 'transparent',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                          src={user?.avatar || undefined}
                        >
                          {!user?.avatar && <PersonIcon />}
                        </Avatar>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            border: '1px solid',
                            borderColor: 'background.paper',
                          }}
                        />
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {user?.username}
                      </Typography>
                    </Box>
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

            <VaultView
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
