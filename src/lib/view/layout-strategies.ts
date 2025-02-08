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

// Reuse result object to reduce allocations
const sharedResult: LayoutResult = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

class LRLayoutStrategy implements ILayoutStrategy {
  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
  ): LayoutResult {
    sharedResult.x = x;
    sharedResult.y = y;
    sharedResult.width = size[0];
    sharedResult.height = size[1];
    return sharedResult;
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
    sharedResult.x = -x;
    sharedResult.y = y;
    sharedResult.width = size[0];
    sharedResult.height = size[1];
    return sharedResult;
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
    sharedResult.x = x;
    sharedResult.y = y;
    sharedResult.width = size[0];
    sharedResult.height = size[1];
    return sharedResult;
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
    sharedResult.x = x;
    sharedResult.y = -y;
    sharedResult.width = size[0];
    sharedResult.height = size[1];
    return sharedResult;
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [levelSpacing, siblingSpacing * 2];
  }
}

class CenterLayoutStrategy implements ILayoutStrategy {
  private cachedStrategy: ILayoutStrategy | null = null;
  private cachedDirection: Direction | null = null;

  transformCoordinates(
    x: number,
    y: number,
    size: [number, number],
    node?: FlexTreeNode,
  ): LayoutResult {
    if (node?.data.direction === Direction.CENTER) {
      sharedResult.x = 0;
      sharedResult.y = 0;
      sharedResult.width = size[0];
      sharedResult.height = size[1];
      return sharedResult;
    } else {
      const direction = node?.data.direction ?? Direction.LR;
      if (this.cachedDirection !== direction) {
        this.cachedStrategy = getLayoutStrategy(direction);
        this.cachedDirection = direction;
      }
      return this.cachedStrategy!.transformCoordinates(x, y, size);
    }
  }

  getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number] {
    return [siblingSpacing * 1.5, levelSpacing];
  }
}

// Cache layout strategy instances
const strategyCache: Record<Direction, ILayoutStrategy> = {
  [Direction.LR]: new LRLayoutStrategy(),
  [Direction.RL]: new RLLayoutStrategy(),
  [Direction.TB]: new TBLayoutStrategy(),
  [Direction.BT]: new BTLayoutStrategy(),
  [Direction.CENTER]: new CenterLayoutStrategy(),
};

function getLayoutStrategy(direction: Direction): ILayoutStrategy {
  return strategyCache[direction] || strategyCache[Direction.LR];
}

export { getLayoutStrategy };
export type { ILayoutStrategy };
