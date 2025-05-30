import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function Index() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.customization.darkMode);
  const [hovered, setHovered] = useState(false);

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          marginTop: '0px',
          padding: '6px 8px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: hovered
            ? darkMode
              ? '#555' // hover on dark mode
              : '#bbb' // hover on light mode
            : darkMode
            ? '#333'
            : '#ddd',
          color: darkMode ? '#fff' : '#000',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hovered ? '0 0 6px rgba(0, 0, 0, 0.2)' : 'none'
        }}
        title="Toggle Dark Mode"
      >
        <DarkModeIcon />
      </button>
    </div>
  );
}

export default Index;
