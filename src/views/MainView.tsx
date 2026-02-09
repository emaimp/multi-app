import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Drawer, Avatar, Typography, Button, Divider, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { VaultList, CreateVaultDialog, EditVaultDialog } from '../components/vault';
import { NoteList } from '../components/note';
import { Vault } from '../types/vault';
import { SettingsView } from './user/SettingsView';

const DRAWER_WIDTH = 240;

export function MainView() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    vaults,
    selectedVaultId,
    addVault,
    updateVault,
    deleteVault,
    selectVault,
    addNote,
    updateNote,
    deleteNote,
    getNotesByVault,
  } = useVaults();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);

  const selectedVault = vaults.find((v) => v.id === selectedVaultId);
  const vaultNotes = selectedVaultId ? getNotesByVault(selectedVaultId) : [];

  const handleVaultClick = (vaultId: string) => {
    selectVault(vaultId);
  };

  const handleAddNote = () => {
    if (selectedVaultId) {
      addNote(selectedVaultId, '');
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
            <Drawer
              sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: DRAWER_WIDTH,
                  height: '100vh',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'background.paper',
                },
              }}
              variant="permanent"
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{ width: 64, height: 64, bgcolor: 'primary.main', cursor: 'pointer' }}
                    src={user?.avatar}
                    onClick={handleSettingsClick}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={handleSettingsClick}
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  {user?.username || 'User'}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  New Vault
                </Button>
              </Box>

              <Divider />

              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <VaultList
                  vaults={vaults}
                  onEditVault={setEditingVault}
                  onVaultClick={handleVaultClick}
                  selectedVaultId={selectedVaultId}
                />
              </Box>

              <Divider />

              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={logout}
                  fullWidth
                >
                  Log out
                </Button>
              </Box>
            </Drawer>

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                overflow: 'auto',
              }}
            >
              {selectedVault ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">
                      {selectedVault.name}
                    </Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddNote}>
                      New Note
                    </Button>
                  </Box>
                  <NoteList
                    notes={vaultNotes}
                    vault={selectedVault}
                    onUpdateNote={updateNote}
                    onDeleteNote={deleteNote}
                  />
                </>
              ) : (
                <>
                  <Typography variant="h4" gutterBottom>
                    Welcome, {user?.username}
                  </Typography>
                  <Typography color="text.secondary">
                    Select a vault from the list to view details.
                  </Typography>
                </>
              )}
            </Box>

            <CreateVaultDialog
              open={createDialogOpen}
              onClose={() => setCreateDialogOpen(false)}
              onCreate={addVault}
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
