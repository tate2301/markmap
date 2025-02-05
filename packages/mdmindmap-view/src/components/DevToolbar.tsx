import React from 'react';
import { INode } from '../types';

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
        background: '#2c3e50',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '14px',
        zIndex: 1000,
      }}
    >
      <div>
        <strong>Total Nodes:</strong> {totalNodes}
      </div>
      <div>
        <strong>Zoom:</strong> {(zoomLevel * 100).toFixed(0)}%
      </div>
      <div
        style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <strong>Selected:</strong> {selectedNode?.content || 'None'}
      </div>
      <div
        style={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <strong>Highlighted:</strong> {highlightedNode?.content || 'None'}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onFitView}>Fit View</button>
        <button onClick={onCenterSelected} disabled={!selectedNode}>
          Center Selected
        </button>
        <button onClick={onEnsureVisible} disabled={!selectedNode}>
          Ensure Visible
        </button>
        <button onClick={onResetView}>Reset View</button>
        <button onClick={onExpandAll}>Expand All</button>
        <button onClick={onCollapseAll}>Collapse All</button>
      </div>
    </div>
  );
};
