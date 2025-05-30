import React from 'react';

const Index = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f4f6f8',
        borderRadius: '8px',
        padding: '6px 12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        maxWidth: 'fit-content',
        marginRight: '10px',
      }}
    >
      <span
        style={{
          height: '12px',
          width: '12px',
          backgroundColor: '#25BE2B',
          borderRadius: '50%',
          display: 'inline-block',
          marginRight: '10px',
          boxShadow: '0 0 4px rgba(37, 190, 43, 0.6)'
        }}
      ></span>
      <h6
        style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          letterSpacing: '0.5px'
        }}
      >
        CRM
      </h6>
    </div>
  );
};

export default Index;
