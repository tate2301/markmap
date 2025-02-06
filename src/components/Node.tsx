import React from 'react';
import { INode } from '../lib/view/types';
import { cn } from '../utils';
import {motion} from 'framer-motion'

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


  const getStrokeWidth = () => {
    return 1;
  };

  return (
    <g className={cn('node', { 'selected': isSelected })} onClick={handleClick}>
      <rect
        width={nodeSize[0]}
        height={nodeSize[1]}
        rx={5}
        ry={5}
        fill="none"
        stroke="none"
        strokeWidth={getStrokeWidth()}
        className='overflow-visible'
      />
      <foreignObject x={0} y={0} width={nodeSize[0]} height={nodeSize[1]} className='overflow-visible'>
        <motion.div
          layout="position"
          layoutId={`node-${node.state.key}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            boxSizing: 'border-box',
            overflow: 'hidden',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px -2px rgba(0, 0, 0, 0.5), 0 -1px 3px -3px rgba(0, 0, 0, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.08)',
          }}
          className={cn('bg-white rounded-lg p-2 border-2 border-transparent transition-all duration-300 ease-out', {
            'border-2 border-green-500': isSelected,
            'hover:border-2 hover:border-blue-500': !isSelected,

          })}
        >
          {node.content}
        </motion.div>
      </foreignObject>
    </g>
  );
};

export default Node;
