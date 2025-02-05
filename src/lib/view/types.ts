import { INode as IBaseNode } from '../../common';

export enum Direction {
  LR = 'LR',
  RL = 'RL',
  TB = 'TB',
  BT = 'BT',
  CENTER = 'center',
}

export interface INodeState {
  id: number;
  depth: number;
  path: string;
  key: string;
  size: [number, number];
  color?: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface INode extends IBaseNode {
  direction?: Direction;
  state: INodeState;
  content: string;
  children: INode[];
  parent?: INode;
}

export interface IMarkmapState {
  id?: string;
  data?: INode;
  highlight?: INode;
  rect?: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
}

/**
 * Portable options that can be derived into `IMarkmapOptions`.
 */
export interface IMarkmapJSONOptions {
  color: string[];
  colorFreezeLevel: number;
  duration: number;
  extraCss: string[];
  extraJs: string[];
  fitRatio: number;
  initialExpandLevel: number;
  maxInitialScale: number;
  maxWidth: number;
  nodeMinHeight: number;
  paddingX: number;
  pan: boolean;
  spacingHorizontal: number;
  spacingVertical: number;
  zoom: boolean;
  lineWidth: number | number[];
}

export interface IPadding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export type ID3SVGElement = d3.Selection<SVGElement, INode, HTMLElement, INode>;

export interface FlexTreeNode extends d3.HierarchyNode<INode> {
  x: number;
  y: number;
  xSize: number;
  ySize: number;
  direction?: Direction; // Used in centered layout
  layoutDirection?: Direction; // Overall layout direction
  relX?: number;
  prelim?: number;
  shift?: number;
  change?: number;
  lExt?: FlexTreeNode;
  rExt?: FlexTreeNode;
  lThr?: FlexTreeNode | null;
  rThr?: FlexTreeNode | null;
  children?: this[];
}

export interface IFlexTreeBaseOptions {
  direction?: Direction;
  minSpacing?: number;
  levelSpacing?: number;
  siblingSpacing?: number;
}

export interface IFlexTreeOptions extends IFlexTreeBaseOptions {
  children?: (data: INode) => INode[];
  nodeSize?: (node: FlexTreeNode) => [number, number];
  spacing?: number | ((a: FlexTreeNode, b: FlexTreeNode) => number);
}

export interface IMarkmapFlexTreeOptions extends IFlexTreeBaseOptions {
  direction: Direction;
  children: (d: INode) => INode[];
  nodeSize: (node: FlexTreeNode) => [number, number];
  spacing: (a: FlexTreeNode, b: FlexTreeNode) => number;
}

export interface IFlexTreeLayout {
  layout(root: FlexTreeNode): FlexTreeNode;
  hierarchy(data: INode): FlexTreeNode;
}

export interface IMarkmapOptions extends SimpleTreeOptions {
  id: string;
  autoFit: boolean;
  color: (node: INode) => string;
  duration: number;
  embedGlobalCSS: boolean;
  fitRatio: number;
  maxInitialScale: number;
  maxWidth: number;
  nodeMinHeight: number;
  paddingX: number;
  scrollForPan: boolean;
  style: ((id: string) => string) | string;
  zoom: boolean;
  pan: boolean;
  spacingHorizontal: number;
  spacingVertical: number;
  initialExpandLevel: number;
  lineWidth: (node: INode) => number;
  toggleRecursively: boolean;
  layoutDirection: Direction;
}

export interface SimpleTreeOptions {
  width?: number;
  height?: number;
  nodeSize?: [number, number];
  direction?: Direction;
  nodePadding?: number;
  levelSpacing?: number;
  siblingSpacing?: number;
  showToolbar?: boolean;
}
