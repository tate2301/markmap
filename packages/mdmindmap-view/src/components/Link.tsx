import { motion } from 'framer-motion';
import { Direction } from '../types';

interface Point {
  x: number;
  y: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PathProps {
  source: Point;
  target: Point;
  direction: Direction;
  nodeSize: [number, number];
  sourceDirection?: Direction;
  targetDirection?: Direction;
  sourceDepth?: number;
}

const Path = ({
  source,
  target,
  direction,
  nodeSize,
  targetDirection,
  sourceDepth,
}: PathProps) => {
  const generatePath = () => {
    // Handle centered layout
    if (direction === Direction.CENTER) {
      // Root node (depth 0) connections
      if (sourceDepth === 0) {
        const sourceX = source.x + nodeSize[0] / 2;
        const sourceY = source.y + nodeSize[1] / 2;
        const targetY = target.y + nodeSize[1] / 2;

        // For left side nodes
        if (targetDirection === Direction.RL) {
          const targetX = target.x + nodeSize[0];
          const dx = Math.abs(targetX - sourceX);
          const controlPointOffset = Math.min(dx * 0.5, 100);

          return `
            M ${sourceX},${sourceY}
            C ${sourceX - controlPointOffset},${sourceY}
              ${targetX + controlPointOffset},${targetY}
              ${targetX},${targetY}
          `;
        }
        // For right side nodes
        else {
          const targetX = target.x;
          const dx = Math.abs(targetX - sourceX);
          const controlPointOffset = Math.min(dx * 0.5, 100);

          return `
            M ${sourceX},${sourceY}
            C ${sourceX + controlPointOffset},${sourceY}
              ${targetX - controlPointOffset},${targetY}
              ${targetX},${targetY}
          `;
        }
      }
      // Non-root connections
      else {
        const sourceY = source.y + nodeSize[1] / 2;
        const targetY = target.y + nodeSize[1] / 2;

        // Left side connections
        if (targetDirection === Direction.RL) {
          const sourceX = source.x;
          const targetX = target.x + nodeSize[0];
          const dx = Math.abs(targetX - sourceX);
          const controlPointOffset = Math.min(dx * 0.5, 100);

          return `
            M ${sourceX},${sourceY}
            C ${sourceX - controlPointOffset},${sourceY}
              ${targetX + controlPointOffset},${targetY}
              ${targetX},${targetY}
          `;
        }
        // Right side connections
        else {
          const sourceX = source.x + nodeSize[0];
          const targetX = target.x;
          const dx = Math.abs(targetX - sourceX);
          const controlPointOffset = Math.min(dx * 0.5, 100);

          return `
            M ${sourceX},${sourceY}
            C ${sourceX + controlPointOffset},${sourceY}
              ${targetX - controlPointOffset},${targetY}
              ${targetX},${targetY}
          `;
        }
      }
    }

    // Handle other layouts (LR, RL, TB, BT)
    const isVertical = [Direction.TB, Direction.BT].includes(direction);

    if (isVertical) {
      const sourceX = source.x + nodeSize[0] / 2;
      const targetX = target.x + nodeSize[0] / 2;
      const sourceY =
        direction === Direction.BT ? source.y : source.y + nodeSize[1];
      const targetY =
        direction === Direction.BT ? target.y + nodeSize[1] : target.y;

      return `
        M ${sourceX},${sourceY}
        C ${sourceX},${(sourceY + targetY) / 2}
          ${targetX},${(sourceY + targetY) / 2}
          ${targetX},${targetY}
      `;
    } else {
      const sourceY = source.y + nodeSize[1] / 2;
      const targetY = target.y + nodeSize[1] / 2;
      const sourceX =
        direction === Direction.RL ? source.x : source.x + nodeSize[0];
      const targetX =
        direction === Direction.RL ? target.x + nodeSize[0] : target.x;

      return `
        M ${sourceX},${sourceY}
        C ${(sourceX + targetX) / 2},${sourceY}
          ${(sourceX + targetX) / 2},${targetY}
          ${targetX},${targetY}
      `;
    }
  };

  return (
    <motion.path
      className="link"
      fill="none"
      stroke="#000"
      strokeWidth={1.5}
      d={generatePath()}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
};

export default Path;
