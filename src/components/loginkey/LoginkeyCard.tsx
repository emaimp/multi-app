import { Box, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LoginKey, LOGINKEY_COLORS_HEX } from '../../types/loginkey';
import { AvatarDisplay } from '../ui';

interface LoginkeyCardProps {
  loginkey: LoginKey;
  onEdit: (loginkey: LoginKey) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}

export function LoginkeyCard({ loginkey, onEdit, onClick, isSelected, isDragging, dragAttributes, dragListeners }: LoginkeyCardProps) {
  const colorHex = LOGINKEY_COLORS_HEX[loginkey.color] || LOGINKEY_COLORS_HEX.blue;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: 1,
        borderLeft: '4px solid',
        borderLeftColor: colorHex,
        bgcolor: isSelected ? 'action.selected' : 'transparent',
        cursor: isDragging ? 'grabbing' : 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      {...dragAttributes}
      {...dragListeners}
    >
      <AvatarDisplay
        src={loginkey.image}
        fallback={loginkey.site_name.charAt(0).toUpperCase()}
      />

      <Box sx={{ flexGrow: 1, ml: 2, overflow: 'hidden' }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {loginkey.site_name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {loginkey.username}
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(loginkey);
        }}
        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default LoginkeyCard;
