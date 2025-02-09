import { ILayoutStrategy, LayoutResult, sharedResult } from "./ILayoutStrategy";

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

  export {TBLayoutStrategy, BTLayoutStrategy}