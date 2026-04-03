import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useVaults } from '../../../context/VaultContext';

interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
}

const MAX_VAULTS = 5;

export function CreateCollectionDialog({ open, onClose }: CreateCollectionDialogProps) {
  const { createVault, createCollection } = useVaults();
  const [collectionName, setCollectionName] = useState('');
  const [vaultNames, setVaultNames] = useState<string[]>(['']);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddVault = () => {
    if (vaultNames.length < MAX_VAULTS) {
      setVaultNames([...vaultNames, '']);
    }
  };

  const handleVaultNameChange = (index: number, value: string) => {
    const updated = [...vaultNames];
    updated[index] = value;
    setVaultNames(updated);
  };

  const handleRemoveVault = (index: number) => {
    const updated = vaultNames.filter((_, i) => i !== index);
    setVaultNames(updated);
  };

  const handleSubmit = async () => {
    if (!collectionName.trim()) return;

    const validVaultNames = vaultNames.filter(v => v.trim());
    if (validVaultNames.length === 0) return;

    setIsCreating(true);

    try {
      const newCollection = await createCollection(collectionName.trim());
      if (newCollection) {
        await Promise.all(
          validVaultNames.map(vaultName => createVault(vaultName.trim(), 'blue', newCollection.id))
        );
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setIsCreating(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setCollectionName('');
    setVaultNames(['']);
    setIsCreating(false);
    onClose();
  };

  const hasValidVaults = vaultNames.some(v => v.trim());
  const canCreate = collectionName.trim() && hasValidVaults && !isCreating;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ViewModuleIcon />
        Create Collection
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Collection Name"
          placeholder="Enter collection name"
          fullWidth
          variant="outlined"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <TextField
            margin="dense"
            label="Vault Name"
            placeholder="Enter vault name"
            fullWidth
            variant="outlined"
            value={vaultNames[0]}
            onChange={(e) => handleVaultNameChange(0, e.target.value)}
          />
          <Tooltip title="Add vault">
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddVault}
              disabled={vaultNames.length >= MAX_VAULTS}
              sx={{ 
                minWidth: 40, 
                width: 40, 
                height: 40,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                }
              }}
            >
              <AddIcon />
            </Button>
          </Tooltip>
        </Box>

        {vaultNames.length >= MAX_VAULTS && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mb: 1,
              display: 'block',
            }}
          >
            Maximum of 5 vaults reached
          </Typography>
        )}

        {vaultNames.slice(1).map((vaultName, index) => (
          <Box
            key={index + 1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              margin="dense"
              label="Vault Name"
              placeholder="Enter vault name"
              fullWidth
              variant="outlined"
              value={vaultName}
              onChange={(e) => handleVaultNameChange(index + 1, e.target.value)}
            />
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleRemoveVault(index + 1)}
              sx={{ 
                minWidth: 40, 
                width: 40, 
                height: 40,
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.main',
                  color: 'error.main',
                }
              }}
            >
              <DeleteIcon />
            </Button>
          </Box>
        ))}

      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!canCreate}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateCollectionDialog;
