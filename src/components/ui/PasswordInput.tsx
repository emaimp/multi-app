import { ReactNode } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TextInput from './TextInput';

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  icon: ReactNode;
  showPassword: boolean;
  onToggleVisibility: () => void;
}

function PasswordInput({
  id,
  name,
  label,
  placeholder = '••••••',
  autoComplete,
  required = true,
  value,
  onChange,
  error = false,
  helperText = '',
  icon,
  showPassword,
  onToggleVisibility,
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
      onChange={onChange}
      error={error}
      helperText={helperText}
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
    />
  );
}

export default PasswordInput;
