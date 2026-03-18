import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoginKey } from '../../types/loginkey';
import { LoginkeyItem } from './LoginkeyItem';

interface LoginkeyListProps {
  loginKeys: LoginKey[];
  isLockedByDefault?: boolean;
  newlyCreatedIds?: Set<string>;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

interface SortableLoginKeyItemProps {
  loginkey: LoginKey;
  isLockedByDefault?: boolean;
  newlyCreatedIds?: Set<string>;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

function SortableLoginKeyItem({ loginkey, isLockedByDefault, newlyCreatedIds, onUpdateLoginKey, onDeleteLoginKey }: SortableLoginKeyItemProps) {
  const isNewlyCreated = newlyCreatedIds?.has(loginkey.id) ?? false;
  const itemIsLockedByDefault = isNewlyCreated ? false : (isLockedByDefault ?? true);

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
        isLockedByDefault={itemIsLockedByDefault}
        onUpdate={onUpdateLoginKey}
        onDelete={onDeleteLoginKey}
        dragAttributes={attributes as any}
        dragListeners={listeners as any}
      />
    </Box>
  );
}

export function LoginkeyList({ loginKeys, isLockedByDefault, newlyCreatedIds, onUpdateLoginKey, onDeleteLoginKey }: LoginkeyListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {loginKeys.map((loginkey) => (
        <SortableLoginKeyItem
          key={loginkey.id}
          loginkey={loginkey}
          isLockedByDefault={isLockedByDefault}
          newlyCreatedIds={newlyCreatedIds}
          onUpdateLoginKey={onUpdateLoginKey}
          onDeleteLoginKey={onDeleteLoginKey}
        />
      ))}
    </Box>
  );
}

export default LoginkeyList;
