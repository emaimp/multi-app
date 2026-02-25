import { Dialog, DialogContent, Typography, CircularProgress } from '@mui/material';

interface LoadingDialogProps {
  open: boolean;
  title?: string;
}

export function LoadingDialog({ open, title = 'Decrypting Content...' }: LoadingDialogProps) {
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
        <CircularProgress size={48} />
        <Typography variant="h6" fontWeight={500}>
          {title}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export default LoadingDialog;
