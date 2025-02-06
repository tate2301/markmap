import React from 'react';
import { INode } from '../lib/view/types';

interface DevToolbarProps {
  totalNodes: number;
  zoomLevel: number;
  selectedNode: INode | null;
  highlightedNode: INode | null;
  onFitView: () => void;
  onCenterSelected: () => void;
  onEnsureVisible: () => void;
  onResetView: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const DevToolbar = ({
  totalNodes,
  zoomLevel,
  selectedNode,
  highlightedNode,
  onFitView,
  onCenterSelected,
  onEnsureVisible,
  onResetView,
  onExpandAll,
  onCollapseAll,
}: DevToolbarProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        color: 'white',
        alignItems: 'center',
        gap: '16px',
        fontSize: '14px',
        zIndex: 1000,
      }}
      className='p-4 shadow-lg bg-zinc-900 border-b border-zinc-400/5 flex justify-between'
    >
      <div className='flex items-center gap-4'>
        <div className='text-sm px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white'>
          <strong>Total Nodes:</strong> {totalNodes}
        </div>
        <div className='text-sm px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white'>
          <strong>Zoom:</strong> {(zoomLevel * 100).toFixed(0)}%
        </div>
        
      </div>
      <div className='flex items-center gap-4'>
      <div
        className='p-0.5 flex items-center gap-2 border-2 border-zinc-700 rounded-xl pl-4'
      >
        Selected node <span className='px-3 py-1.5 rounded-lg text-white bg-blue-900 text-white font-bold'>{selectedNode?.content || 'None'}</span>
      </div>
      <button className='px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900' onClick={onCenterSelected} disabled={!selectedNode}>
          Center Selected
        </button>
        <button className='px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900' onClick={onEnsureVisible} disabled={!selectedNode}>
          Ensure Visible
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className='px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-100/10 text-white' onClick={onFitView}>Fit View</button>
        
        <button className='px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-100/10 text-white' onClick={onExpandAll}>Expand All</button>
        <button className='px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-100/10 text-white' onClick={onCollapseAll}>Collapse All</button>
        <button className='px-4 py-2.5 rounded-xl border border-red-700 bg-red-800 text-white' onClick={onResetView}>Reset View</button>
      </div>
    </div>
  );
};
