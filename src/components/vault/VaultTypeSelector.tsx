import { Box, Dialog, DialogTitle, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

interface VaultTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectVault: () => void;
  onSelectCollection: () => void;
}

interface VaultTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function VaultTypeCard({ icon, title, description, onClick }: VaultTypeCardProps) {
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

export function VaultTypeSelector({
  open,
  onClose,
  onSelectVault,
  onSelectCollection,
}: VaultTypeSelectorProps) {
  const handleVaultClick = () => {
    onClose();
    onSelectVault();
  };

  const handleCollectionClick = () => {
    onClose();
    onSelectCollection();
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
          Create new
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
        <VaultTypeCard
          icon={<InventoryIcon sx={{ fontSize: 32 }} />}
          title="Vault"
          description="Container to organize your notes"
          onClick={handleVaultClick}
        />
        <VaultTypeCard
          icon={<ViewModuleIcon sx={{ fontSize: 32 }} />}
          title="Collection"
          description="Group related vaults together"
          onClick={handleCollectionClick}
        />
      </Box>
    </Dialog>
  );
}

export default VaultTypeSelector;
