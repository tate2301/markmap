import React from 'react';

interface ToolBarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
  onCenter: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  onCenter,
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
    boxShadow: '0 2px 4px -4px rgba(0,0,0,0.7), 0 4px 5px -3px rgba(0,0,0,0.14), 0 4px 10px 0 rgba(0,0,0,0.12)',
    gap: '10px',
    zIndex: 1000,
  } as const;

  return (
    <div style={toolbarStyle} className='flex gap-2 rounded-2xl p-2 border border-zinc-400/10 bg-white'>
      <button className='rounded-lg px-4 py-2 bg-zinc-400/20 text-zinc-900' onClick={onZoomIn} title="Zoom In">
        Zoom In
      </button>
      <button className='rounded-lg px-4 py-2 bg-zinc-400/20 text-zinc-900' onClick={onZoomOut} title="Zoom Out">
        Zoom Out
      </button>
      <button className='rounded-lg px-4 py-2 bg-zinc-400/20 text-zinc-900' onClick={onReset} title="Reset View">
        Reset View
      </button>
      <button className='rounded-lg px-4 py-2 bg-zinc-400/20 text-zinc-900' onClick={onFit} title="Fit to View">
        Fit to View
      </button>
      <button className='rounded-lg px-4 py-2 bg-zinc-400/20 text-zinc-900' onClick={onCenter} title="Center View">
        Center View
      </button>
    </div>
  );
};
