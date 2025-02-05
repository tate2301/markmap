import { scaleOrdinal, schemeCategory10 } from 'd3';
import { INode } from 'mdmindmap-common';
import { Direction, type IMarkmapOptions } from './types';

export const isMacintosh = navigator.platform.indexOf('Mac') > -1;

export const defaultColorFn = scaleOrdinal(schemeCategory10);

export const lineWidthFactory =
  (baseWidth = 1, deltaWidth: number = 3, k: number = 2) =>
  (node: INode) =>
    baseWidth + deltaWidth / k ** (node.state?.depth || 0);

export const defaultOptions: Required<IMarkmapOptions> = {
  width: 800,
  height: 600,
  direction: Direction.LR,
  showToolbar: true,
  autoFit: true,
  color: () => 'steelblue',
  duration: 200,
  embedGlobalCSS: true,
  fitRatio: 1.2,
  initialExpandLevel: -1,
  maxInitialScale: 2,
  maxWidth: 1000,
  nodeMinHeight: 20,
  paddingX: 20,
  pan: true,
  scrollForPan: isMacintosh,
  spacingHorizontal: 20,
  spacingVertical: 20,
  toggleRecursively: true,
  layoutDirection: Direction.LR,
  id: 'simple-tree',
  style: '',
  zoom: true,
  lineWidth: () => 2,
  nodeSize: [100, 30],
  nodePadding: 10,
  levelSpacing: 120,
  siblingSpacing: 40,
};
