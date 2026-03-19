import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoginKey } from '../../types/loginkey';
import { LoginkeyItem } from './LoginkeyItem';

interface LoginkeyListProps {
  loginKeys: LoginKey[];
  isLockedByDefault?: boolean;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

interface SortableLoginKeyItemCallbacks {
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

function SortableLoginKeyItem({ loginkey, isLockedByDefault, onUpdateLoginKey, onDeleteLoginKey }: SortableLoginKeyItemCallbacks & { loginkey: LoginKey; isLockedByDefault?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: loginkey.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <LoginkeyItem
        loginkey={loginkey}
        isLockedByDefault={isLockedByDefault}
        onUpdate={onUpdateLoginKey}
        onDelete={onDeleteLoginKey}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function LoginkeyList({ loginKeys, isLockedByDefault, onUpdateLoginKey, onDeleteLoginKey }: LoginkeyListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {loginKeys.map((loginkey) => (
        <SortableLoginKeyItem
          key={loginkey.id}
          loginkey={loginkey}
          isLockedByDefault={isLockedByDefault}
          onUpdateLoginKey={onUpdateLoginKey}
          onDeleteLoginKey={onDeleteLoginKey}
        />
      ))}
    </Box>
  );
}

export default LoginkeyList;
