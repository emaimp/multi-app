import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { LoginKey } from '../../../../types/loginkey';
import { LoginkeyItem } from './LoginkeyItem';

interface LoginkeyListProps {
  loginKeys: LoginKey[];
  isLockedByDefault?: boolean;
  animationKey?: string;
  onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void;
}

const variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25 },
  },
} as const;

function LoginkeyItemComponent({ loginkey, isLockedByDefault, onUpdateLoginKey, animationKey }: { loginkey: LoginKey; isLockedByDefault?: boolean; animationKey?: string; onUpdateLoginKey: (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details: string | null) => void }) {
  return (
    <motion.div
      key={`${animationKey}-${loginkey.id}`}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      <LoginkeyItem
        loginkey={loginkey}
        isLockedByDefault={isLockedByDefault}
        onUpdate={onUpdateLoginKey}
      />
    </motion.div>
  );
}

export function LoginkeyList({ loginKeys, isLockedByDefault, animationKey, onUpdateLoginKey }: LoginkeyListProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {loginKeys.map((loginkey) => (
        <LoginkeyItemComponent
          key={loginkey.id}
          loginkey={loginkey}
          isLockedByDefault={isLockedByDefault}
          animationKey={animationKey}
          onUpdateLoginKey={onUpdateLoginKey}
        />
      ))}
    </Box>
  );
}

export default LoginkeyList;
