import React, { memo } from 'react';
import { IEnhancedNode } from '../lib/view/types';
import Node from './Node';
import { motion } from 'framer-motion';

interface NodeWrapperProps {
  node: IEnhancedNode;
  nodeSize: [number, number];
  onClick?: (node: IEnhancedNode, event: React.MouseEvent) => void;
  isSelected?: boolean;
  transform: string;
  onSizeChange?: (node: IEnhancedNode, width: number, height: number) => void;
}

const NodeWrapper = memo(
  ({ node, nodeSize, onClick, isSelected, transform, onSizeChange }: NodeWrapperProps) => {
    const { shouldAnimate } = node.state;

    return (
      <motion.g 
        key={node.state.key}
        className="node-container" 
        transform={transform}
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={shouldAnimate ? { opacity: 1 } : {}}
        exit={{ opacity: 0 }}
      >
        <Node
          node={node}
          nodeSize={nodeSize}
          onClick={onClick}
          isSelected={isSelected}
          onSizeChange={onSizeChange}
        />
      </motion.g>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.transform === nextProps.transform
    );
  },
);

NodeWrapper.displayName = 'NodeWrapper';

const areEqual = (prev: NodeWrapperProps, next: NodeWrapperProps) => 
  prev.node === next.node &&
  prev.isSelected === next.isSelected &&
  prev.transform === next.transform;

export default React.memo(NodeWrapper, areEqual);

