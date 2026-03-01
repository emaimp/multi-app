import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Collection } from '../../types/collection';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface CollectionEditDialogProps {
  open: boolean;
  collection: Collection | null;
  onClose: () => void;
  onSave: (collection: Collection) => void;
  onDelete: (collectionId: string) => void;
}

export function CollectionEditDialog({ open, collection, onClose, onSave, onDelete }: CollectionEditDialogProps) {
  const [name, setName] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleOpen = () => {
    if (collection) {
      setName(collection.name);
    }
  };

  const handleSave = () => {
    if (collection && name.trim()) {
      onSave({ ...collection, name: name.trim() });
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
