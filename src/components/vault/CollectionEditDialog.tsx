import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Autocomplete,
  Checkbox,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Collection } from '../../types/collection';
import { Vault } from '../../types/vault';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useVaults } from '../../context/VaultContext';

interface CollectionEditDialogProps {
  open: boolean;
  collection: Collection | null;
  onClose: () => void;
  onSave: (collection: Collection) => void;
  onDelete: (collectionId: string) => void;
}

export function CollectionEditDialog({ open, collection, onClose, onSave, onDelete }: CollectionEditDialogProps) {
  const { vaults, collections } = useVaults();
  const [name, setName] = useState('');
  const [selectedVaults, setSelectedVaults] = useState<Vault[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const unassignedVaults = vaults.filter(vault => 
    !collections.some(c => c.vault_ids.includes(vault.id))
  );

  const handleOpen = () => {
    if (collection) {
      setName(collection.name);
      const currentVaults = vaults.filter(v => collection.vault_ids.includes(v.id));
      setSelectedVaults(currentVaults);
    }
  };

  const handleSave = () => {
    if (collection && name.trim()) {
      const newVaultIds = selectedVaults.map(v => v.id);
      onSave({ ...collection, name: name.trim(), vault_ids: newVaultIds });
      onClose();
    }
  };

  const handleDelete = () => {
    if (collection) {
      onDelete(collection.id);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedVaults([]);
    setConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        onTransitionEnter={handleOpen}
      >
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Add vaults to this collection
          </Typography>

          <Autocomplete
            multiple
            options={unassignedVaults}
            value={selectedVaults}
            onChange={(_, newValue) => setSelectedVaults(newValue)}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} />
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select vaults"
                label="Vaults"
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Select vaults from the list above. Currently this collection has {selectedVaults.length} vault(s).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(true)} color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Collection"
        message={`Are you sure you want to delete "${collection?.name}"? The vaults in this collection will become unassigned.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}

export default CollectionEditDialog;
