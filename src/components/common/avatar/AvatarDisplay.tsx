import { Avatar, SxProps, Theme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface AvatarDisplayProps {
  src?: string | null;
  fallback?: string;
  size?: number;
  showUserIcon?: boolean;
  sx?: SxProps<Theme>;
}

export function AvatarDisplay({
  src,
  fallback,
  size = 48,
  showUserIcon = false,
  sx,
}: AvatarDisplayProps) {
  const isSvgIcon = src?.startsWith('data:image/svg+xml');
  const imageSize = isSvgIcon ? '75%' : '100%';

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        color: 'text.primary',
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        '& img': {
          objectFit: 'contain',
          width: imageSize,
          height: imageSize,
        },
        ...sx,
      }}
      src={src || undefined}
    >
      {!src && (showUserIcon ? <PersonIcon /> : fallback)}
    </Avatar>
  );
}

export default AvatarDisplay;
