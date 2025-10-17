import { FormControlLabel, Switch } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMode } from '../../../../redux/customizationSlice';

const ThemeToggleButton = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.customization.mode);

  const handleToggle = () => {
    dispatch(toggleMode());
  };

  return (
    <FormControlLabel
      control={<Switch checked={mode === 'dark'} onChange={handleToggle} color="primary" />}
      label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
      labelPlacement="start"
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': {
          color: '#374151'
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
          backgroundColor: '#374151'
        }
      }}
    />
  );
};

export default ThemeToggleButton;
