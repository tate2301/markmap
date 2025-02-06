import React, { memo } from 'react';
import { INode } from '../lib/view/types';
import Node from './Node';
import { AnimatePresence } from 'framer-motion';

interface NodeWrapperProps {
  node: INode;
  nodeSize: [number, number];
  onClick?: (node: INode, event: React.MouseEvent) => void;
  isSelected?: boolean;
  transform: string;
}

const NodeWrapper = memo(
  ({ node, nodeSize, onClick, isSelected, transform }: NodeWrapperProps) => {
    return (
      <AnimatePresence>
        <g className="node-container" transform={transform}>
        <Node
          node={node}
          nodeSize={nodeSize}
          onClick={onClick}
          isSelected={isSelected}
        />
      </g>
      </AnimatePresence>
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
