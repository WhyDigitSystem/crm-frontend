// ReusableButton.js
import CircularProgress from '@material-ui/core/CircularProgress';
import { Avatar, ButtonBase, Tooltip } from '@mui/material';
import React from 'react';

const ActionButton = ({
  title,
  icon: Icon,
  onClick,
  placement = 'top',
  margin = '10px',
  isLoading,
  color
}) => {

  const finalColor = color || '#3b82f6';

  return (
    <Tooltip title={title} placement={placement}>
      <ButtonBase
        onClick={onClick}
        disabled={isLoading}
        sx={{
          borderRadius: '12px',
          marginRight: margin,
          transition: 'all 0.2s ease',

          // CLICK ANIMATION
          '&:active': {
            transform: 'scale(0.92)',
          }
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 38,
            height: 38,
            background: finalColor,
            color: '#fff',
            borderRadius: '12px',
            transition: 'all 0.25s ease-in-out',

            // HOVER ANIMATION
            boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
            '&:hover': {
              transform: 'scale(1.12)',
              boxShadow: `0px 6px 12px ${finalColor}40`, // glow
            }
          }}
        >
          {isLoading ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <Icon
              style={{
                fontSize: '1.6rem',
                transition: 'opacity .2s ease, transform .2s ease',
              }}
            />
          )}
        </Avatar>
      </ButtonBase>
    </Tooltip>
  );
};

export default ActionButton;
