import { IPureNode } from './common';

export * from './common';

export interface INode extends IPureNode {
  content: string;
  children: INode[];
  payload?: {
    fold?: number;
    direction?: 'left' | 'right';
  };
  state?: {
    id: number;
    key: string;
    path: string;
    depth: number;
    rect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    size: [number, number];
    color?: string;
    direction?: 'left' | 'right';
  };
}
