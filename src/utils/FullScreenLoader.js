import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Logo from '../assets/images/BIN_BEE.png';

const FullScreenLoader = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#12162e'
        // backgroundColor: 'transparent'
    }}>
        <img src={Logo} alt="BIN BEE Logo" width={100} />
        <p style={{ marginTop: 20, fontSize: '1.2rem', color: '#673ab7' }}>
            Hang tight! We're getting your data ready...
        </p>
        <CircularProgress color="secondary" style={{ marginTop: 20 }} />
    </div>
);

export default FullScreenLoader;
