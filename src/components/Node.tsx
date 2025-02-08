import React, { memo, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Direction, INode } from '../lib/view/types';
import { cn } from '../utils';
import { AnimatePresence, motion } from 'framer-motion'

interface NodeProps {
  node: INode;
  nodeSize: [number, number];
  onClick?: (node: INode, event: React.MouseEvent) => void;
  isSelected?: boolean;
  onSizeChange?: (node: INode, width: number, height: number) => void;
}

const MAX_NODE_HEIGHT = 360;
const MAX_NODE_WIDTH = 360;

// Create a singleton measuring div that we'll reuse
let measuringDiv: HTMLDivElement | null = null;
function getMeasuringDiv() {
  if (!measuringDiv) {
    measuringDiv = document.createElement('div');
    measuringDiv.style.position = 'absolute';
    measuringDiv.style.visibility = 'hidden';
    measuringDiv.style.whiteSpace = 'pre-wrap';
    measuringDiv.style.fontSize = '12px';
    measuringDiv.style.padding = '8px';  // match the p-2 class
    measuringDiv.style.boxSizing = 'border-box';
    measuringDiv.style.width = '280px';  // match default node width
    measuringDiv.style.maxWidth = `${MAX_NODE_WIDTH}px`;
    measuringDiv.style.wordBreak = 'break-word';
    document.body.appendChild(measuringDiv);
  }
  return measuringDiv;
}

const Node = ({ node, nodeSize, onClick, isSelected, onSizeChange }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: nodeSize[0], height: nodeSize[1] });

  // Measure content size using offscreen div
  const measureContent = () => {
    const div = getMeasuringDiv();
    div.textContent = node.content;
    const { offsetWidth, offsetHeight } = div;
   
    return {
      width: Math.min(Math.max(offsetWidth, nodeSize[0]), MAX_NODE_WIDTH),
      height: Math.min(offsetHeight, MAX_NODE_HEIGHT)
    };
  };

  // Use useLayoutEffect to measure before paint
  useLayoutEffect(() => {
    const { width: newWidth, height: newHeight } = measureContent();
    
    // Only update if dimensions have changed
    if (dimensions.width !== newWidth || dimensions.height !== newHeight) {
      setDimensions({ width: newWidth, height: newHeight });
      
      // Update node state size if it has changed
      if (node.state.size[0] !== newWidth || node.state.size[1] !== newHeight) {
        onSizeChange?.(node, newWidth, newHeight);
      }
    }
  }, [node.content, nodeSize]);

  const handleClick = (event: React.MouseEvent) => {
    onClick?.(node, event);
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  const getStrokeWidth = () => {
    return 1;
  };

  // add esc key listener
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEditing(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const variants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      x: node.direction === Direction.RL ? -40 : 40
    },
    animate: {
      opacity: 1,
      scale: 1,
      width: dimensions.width,
      height: dimensions.height,
      x: 0,
    },
    exit: { opacity: 0, scale: 0.8 },
  };

  const { shouldAnimate } = node.state;

  return (
    <motion.g className={cn('node', { 'selected': isSelected })} onClick={handleClick}>
      <rect
        width={dimensions.width}
        height={dimensions.height}
        rx={5}
        ry={5}
        fill="none"
        stroke="none"
        strokeWidth={getStrokeWidth()}
        className='overflow-visible'
      />
      <foreignObject 
        x={0} 
        y={0} 
        width={dimensions.width} 
        height={dimensions.height} 
        className='overflow-visible'
      >
        <motion.div
          ref={contentRef}
          layout="position"
          layoutId={`node-${node.state.key}`}
          onDoubleClick={onEdit}
          variants={variants}
          initial={shouldAnimate ? "initial" : false}
          animate={shouldAnimate ? 'animate' : {}}
          exit={shouldAnimate ? 'exit' : {}}
          style={{
            width: '100%',
            maxWidth: MAX_NODE_WIDTH,
            maxHeight: MAX_NODE_HEIGHT,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            boxSizing: 'border-box',
            overflow: 'auto',
            fontSize: '12px',
            cursor: 'pointer',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
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
    </motion.g>
  );
};

// Cleanup measuring div on unmount
if (typeof window !== 'undefined') {
  window.addEventListener('unload', () => {
    if (measuringDiv && measuringDiv.parentNode) {
      measuringDiv.parentNode.removeChild(measuringDiv);
    }
  });
}

export default memo(Node);
