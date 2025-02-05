import React from 'react';

interface ToolBarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
}) => {
  const buttonStyle = {
    padding: '5px 10px',
    fontSize: '16px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    background: 'white',
    borderRadius: '3px',
    minWidth: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const toolbarStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    display: 'flex',
    gap: '10px',
    zIndex: 1000,
  } as const;

  return (
    <div style={toolbarStyle}>
      This is crazy
      <button style={buttonStyle} onClick={onZoomIn} title="Zoom In">
        +
      </button>
      <button style={buttonStyle} onClick={onZoomOut} title="Zoom Out">
        −
      </button>
      <button style={buttonStyle} onClick={onReset} title="Reset View">
        ⟲
      </button>
      <button style={buttonStyle} onClick={onFit} title="Fit to View">
        ↔
      </button>
    </div>
  );
};
