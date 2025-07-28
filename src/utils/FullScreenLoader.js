import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Logo from '../assets/images/BIN_BEE.png';

const FullScreenLoader = () => (
    <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f9f9ff'
    }}>
        <img src={Logo} alt="EFIT Logo" width={100} />
        <p style={{ marginTop: 20, fontSize: '1.2rem', color: '#673ab7' }}>
            Hang tight! We're getting your data ready...
        </p>
        <CircularProgress color="secondary" style={{ marginTop: 20 }} />
    </div>
);

export default FullScreenLoader;