import { Dialog, DialogContent, Typography, LinearProgress } from '@mui/material';

interface ReEncryptionDialogProps {
  open: boolean;
}

export function ReEncryptionDialog({ open }: ReEncryptionDialogProps) {
  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          minWidth: 300,
          padding: 2,
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }
      }}
    >
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" fontWeight={500}>
          {'Changing master key...'}
        </Typography>
        <LinearProgress sx={{ width: '100%' }} />
      </DialogContent>
    </Dialog>
  );
}

export default ReEncryptionDialog;