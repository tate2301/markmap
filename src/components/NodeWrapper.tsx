import React, { memo } from 'react';
import { INode } from '../lib/view/types';
import Node from './Node';
import { motion } from 'framer-motion';

interface NodeWrapperProps {
  node: INode;
  nodeSize: [number, number];
  onClick?: (node: INode, event: React.MouseEvent) => void;
  isSelected?: boolean;
  transform: string;
}

const NodeWrapper = memo(
  ({ node, nodeSize, onClick, isSelected, transform }: NodeWrapperProps) => {
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

export default NodeWrapper;
