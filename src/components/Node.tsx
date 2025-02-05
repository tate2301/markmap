import React from 'react';
import { INode } from '../lib/view/types';

interface NodeProps {
  node: INode;
  nodeSize: [number, number];
  onClick?: (node: INode, event: React.MouseEvent) => void;
  isSelected?: boolean;
}

const Node = ({ node, nodeSize, onClick, isSelected }: NodeProps) => {
  const handleClick = (event: React.MouseEvent) => {
    onClick?.(node, event);
  };

  const getStrokeColor = () => {
    if (isSelected) return '#2ecc71';
    return '#999';
  };

  const getStrokeWidth = () => {
    return 1;
  };

  return (
    <g className={`node ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
      <rect
        width={nodeSize[0]}
        height={nodeSize[1]}
        rx={5}
        ry={5}
        fill="white"
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
      />
      <foreignObject x={0} y={0} width={nodeSize[0]} height={nodeSize[1]}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          {node.content}
        </div>
      </foreignObject>
    </g>
  );
};

export default Node;
