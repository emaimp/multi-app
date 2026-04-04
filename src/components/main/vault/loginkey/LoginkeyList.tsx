import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoginKey } from '../../../../types/loginkey';
import { LoginkeyItem } from './LoginkeyItem';

interface LoginkeyListProps {
  loginKeys: LoginKey[];
  isLockedByDefault?: boolean;
  animationKey?: string;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

interface SortableLoginKeyItemCallbacks {
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
  onDeleteLoginKey: (loginKeyId: string) => void;
}

const variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25 },
  },
} as const;

function SortableLoginKeyItem({ loginkey, isLockedByDefault, onUpdateLoginKey, onDeleteLoginKey, animationKey }: SortableLoginKeyItemCallbacks & { loginkey: LoginKey; isLockedByDefault?: boolean; animationKey?: string }) {
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
    <motion.div
      key={`${animationKey}-${loginkey.id}`}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
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
    </motion.div>
  );
}

export function LoginkeyList({ loginKeys, isLockedByDefault, animationKey, onUpdateLoginKey, onDeleteLoginKey }: LoginkeyListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {loginKeys.map((loginkey) => (
        <SortableLoginKeyItem
          key={loginkey.id}
          loginkey={loginkey}
          isLockedByDefault={isLockedByDefault}
          animationKey={animationKey}
          onUpdateLoginKey={onUpdateLoginKey}
          onDeleteLoginKey={onDeleteLoginKey}
        />
      ))}
    </Box>
  );
}

export default LoginkeyList;
