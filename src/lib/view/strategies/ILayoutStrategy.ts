import { FlexTreeNode } from "../types";

export interface ILayoutStrategy {
    transformCoordinates(
      x: number,
      y: number,
      size: [number, number],
      node?: FlexTreeNode,
    ): LayoutResult;
    getNodeSize(levelSpacing: number, siblingSpacing: number): [number, number];
  }

  export interface LayoutResult {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export const sharedResult: LayoutResult = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
  
  
  
