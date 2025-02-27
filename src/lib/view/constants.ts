import { scaleOrdinal, schemeCategory10 } from 'd3';
import { Direction, type IMarkmapOptions } from './types';
import { INodeWithoutState } from '../../common';

export const isMacintosh = navigator.platform.indexOf('Mac') > -1;

export const defaultColorFn = scaleOrdinal(schemeCategory10);

export const lineWidthFactory =
  (baseWidth = 1, deltaWidth: number = 3, k: number = 2) =>
  (node: INodeWithoutState) =>
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
  nodeSize: [280, 40],
  nodePadding: 10,
  levelSpacing: 40,
  siblingSpacing: 16,
};
