import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoginKey } from '../../types/loginkey';
import { LoginkeyItem } from './LoginkeyItem';

interface LoginkeyListProps {
  loginKeys: LoginKey[];
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

interface SortableLoginKeyItemProps {
  loginkey: LoginKey;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

function SortableLoginKeyItem({ loginkey, onUpdateLoginKey, onDeleteLoginKey }: SortableLoginKeyItemProps) {
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
        onUpdate={onUpdateLoginKey}
        onDelete={onDeleteLoginKey}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function LoginkeyList({ loginKeys, onUpdateLoginKey, onDeleteLoginKey }: LoginkeyListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {loginKeys.map((loginkey) => (
        <SortableLoginKeyItem
          key={loginkey.id}
          loginkey={loginkey}
          onUpdateLoginKey={onUpdateLoginKey}
          onDeleteLoginKey={onDeleteLoginKey}
        />
      ))}
    </Box>
  );
}

export default LoginkeyList;
