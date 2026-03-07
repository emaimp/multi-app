import { ReactNode } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextInput from './TextInput';
import { SxProps, Theme } from '@mui/material';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  showPassword: boolean;
  onToggleVisibility: () => void;
  sx?: SxProps<Theme>;
  fullWidth?: boolean;
}

function PasswordInput({
  id,
  name,
  label,
  placeholder = '••••••',
  autoComplete,
  required = true,
  value,
  error = false,
  helperText = '',
  onChange,
  icon,
  showPassword,
  onToggleVisibility,
  sx,
  fullWidth = true,
}: PasswordInputProps) {
  return (
    <TextInput
      id={id}
      name={name}
      label={label}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      value={value}
      error={error}
      helperText={helperText}
      onChange={onChange}
      icon={icon}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label={`toggle ${label.toLowerCase()} visibility`}
            onClick={onToggleVisibility}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      }
      sx={sx}
      fullWidth={fullWidth}
    />
  );
}

export default PasswordInput;
