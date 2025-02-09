import { INodeWithoutState as IBaseNode } from '../../common';

export enum Direction {
  LR = 'LR',
  RL = 'RL',
  TB = 'TB',
  BT = 'BT',
  CENTER = 'center',
}

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}


export interface INodeState {
  id: number;
  depth: number;
  path: string;
  key: string;
  size: [number, number];
  color?: string;
  rect: Rect;
  prevRect?: Rect
  shouldAnimate?: boolean
}

export interface IEnhancedNode extends IBaseNode {
  direction?: Direction;
  state: INodeState;
  content: string;
  children: IEnhancedNode[];
  parent?: IEnhancedNode;
}

export interface IMarkmapState {
  id?: string;
  data?: IEnhancedNode;
  highlight?: IEnhancedNode;
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

export type ID3SVGElement = d3.Selection<SVGElement, IEnhancedNode, HTMLElement, IEnhancedNode>;

export interface FlexTreeNode extends d3.HierarchyNode<IEnhancedNode> {
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
  children?: (data: IEnhancedNode) => IEnhancedNode[];
  nodeSize?: (node: FlexTreeNode) => [number, number];
  spacing?: number | ((a: FlexTreeNode, b: FlexTreeNode) => number);
}

export interface IMarkmapFlexTreeOptions extends IFlexTreeBaseOptions {
  direction: Direction;
  children: (d: IEnhancedNode) => IEnhancedNode[];
  nodeSize: (node: FlexTreeNode) => [number, number];
  spacing: (a: FlexTreeNode, b: FlexTreeNode) => number;
}

export interface IFlexTreeLayout {
  layout(root: FlexTreeNode): FlexTreeNode;
  hierarchy(data: IEnhancedNode): FlexTreeNode;
}

export interface IMarkmapOptions extends SimpleTreeOptions {
  id: string;
  autoFit: boolean;
  color: (node: IEnhancedNode) => string;
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
  lineWidth: (node: IEnhancedNode) => number;
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
  siblingSpacing?: number; // Default: 8px
  showToolbar?: boolean;
}

export interface MindmapConfig {
  initialDirection?: Direction;
  width?: number;
  height?: number;
  backgroundColor?: string;
  controls?: {
    show?: boolean;
    position?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    showDirectionControl?: boolean;
    showDataControl?: boolean;
  };
}

export interface MindmapProps {
  data: IEnhancedNode;
  config?: MindmapConfig;
  onNodeClick?: (node: IEnhancedNode, e: React.MouseEvent) => void;
  onNodeShiftClick?: (node: IEnhancedNode) => void;
  onDirectionChange?: (direction: Direction) => void;
  className?: string;
  style?: React.CSSProperties;
}