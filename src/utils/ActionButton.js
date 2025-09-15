// ReusableButton.js
import CircularProgress from '@material-ui/core/CircularProgress';
import { Avatar, ButtonBase, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

const ActionButton = ({ title, icon: Icon, onClick, placement = 'top', margin = '10px', isLoading }) => {
  const anchorRef = React.useRef(null);
  const theme = useTheme();

  return (
    <Tooltip title={title} placement={placement}>
      <ButtonBase sx={{ borderRadius: '10px', marginRight: margin }} onClick={onClick} disabled={isLoading}>
        <Avatar
          variant="rounded"
          sx={{
            width: '35px',
            height: '35px',
            transition: 'all .2s ease-in-out',
            background: theme.palette.primary.light, // light tone
            color: theme.palette.primary.main, // main tone
            borderRadius: '10px',
            '&:hover': {
              background: theme.palette.primary.main, // main tone on hover
              color: theme.palette.primary.contrastText // auto contrast text
            }
          }}
          ref={anchorRef}
          aria-haspopup="true"
          color="inherit"
        >
          {isLoading ? <CircularProgress size={22} color="inherit" /> : <Icon size="1.3rem" stroke={1.5} />}
        </Avatar>
      </ButtonBase>
    </Tooltip>
  );
};

export default ActionButton;
