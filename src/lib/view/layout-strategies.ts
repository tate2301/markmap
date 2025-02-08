import { Direction, FlexTreeNode } from './types';

export interface LayoutResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
    node?: FlexTreeNode,
  ): LayoutResult;
  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number];
}

class LRLayoutStrategy implements ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
  ): LayoutResult {
    return {
      x: x,
      y: y ,
      width: size[0],
      height: size[1],
    };
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [siblingSpacing, levelSpacing];
  }
}

class RLLayoutStrategy implements ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
  ): LayoutResult {
    return {
      x: -x,
      y: y,
      width: size[0],
      height: size[1],
    };
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [siblingSpacing, levelSpacing];
  }
}

class TBLayoutStrategy implements ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
  ): LayoutResult {
    return {
      x,
      y,
      width: size[0],
      height: size[1],
    };
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [levelSpacing, siblingSpacing * 2];
  }
}

class BTLayoutStrategy implements ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
  ): LayoutResult {
    return {
      x,
      y: -y,
      width: size[0],
      height: size[1],
    };
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [levelSpacing, siblingSpacing * 2];
  }
}

class CenterLayoutStrategy implements ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
    node?: FlexTreeNode,
  ): LayoutResult {
    if (node?.data.direction === Direction.CENTER) {
      return {
        x: 0,
        y: 0,
        width: size[0],
        height: size[1],
      };
    } else {
      return getLayoutStrategy(node?.data.direction ?? Direction.LR).transformCoordinates(
        x,
        y,
        size,
      );
    }
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [siblingSpacing * 1.5, levelSpacing]; // Increased sibling spacing for better centering
  }
}

function getLayoutStrategy(direction: Direction): ILayoutStrategy {
  switch (direction) {
    case Direction.LR:
      return new LRLayoutStrategy();
    case Direction.RL:
      return new RLLayoutStrategy();
    case Direction.TB:
      return new TBLayoutStrategy();
    case Direction.BT:
      return new BTLayoutStrategy();
    case Direction.CENTER:
      return new CenterLayoutStrategy();
    default:
      return new LRLayoutStrategy();
  }
}

export { getLayoutStrategy };
export type { ILayoutStrategy };
