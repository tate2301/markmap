import { Direction, FlexTreeNode } from "../types";
import { getLayoutStrategy } from "./cache";
import {  ILayoutStrategy, LayoutResult, sharedResult } from "./ILayoutStrategy";



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
  
  export {CenterLayoutStrategy}