import { Box, Dialog, DialogTitle, Typography } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyIcon from '@mui/icons-material/Key';

interface NoteTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectSimpleNote: () => void;
  onSelectAccessNote: () => void;
}

interface NoteTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function NoteTypeCard({ icon, title, description, onClick }: NoteTypeCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        minWidth: 200,
        p: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
}

export function NoteTypeSelector({
  open,
  onClose,
  onSelectSimpleNote,
  onSelectAccessNote,
}: NoteTypeSelectorProps) {
  const handleSimpleNoteClick = () => {
    onClose();
    onSelectSimpleNote();
  };

  const handleAccessNoteClick = () => {
    onClose();
    onSelectAccessNote();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={600}>
          Select Note Type
        </Typography>
      </DialogTitle>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 3,
          pt: 1,
        }}
      >
        <NoteTypeCard
          icon={<DescriptionIcon sx={{ fontSize: 32 }} />}
          title="Simple Note"
          description="Free-form text note for general information storage"
          onClick={handleSimpleNoteClick}
        />
        <NoteTypeCard
          icon={<KeyIcon sx={{ fontSize: 32 }} />}
          title="Access Note"
          description="Store credentials with username and password"
          onClick={handleAccessNoteClick}
        />
      </Box>
    </Dialog>
  );
}

export default NoteTypeSelector;
