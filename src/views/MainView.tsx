import { useState } from 'react';
import { Box, Drawer, Avatar, Typography, Button, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { VaultList, CreateVaultDialog, EditVaultDialog } from '../components/vault';
import { NoteList } from '../components/note';
import { Vault } from '../types/vault';

const DRAWER_WIDTH = 240;

export function MainView() {
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

  return (
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
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={500}>
            {user?.username || 'User'}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
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
            <NoteList notes={vaultNotes} vault={selectedVault} onUpdateNote={updateNote} />
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
  );
}

export default MainView;
