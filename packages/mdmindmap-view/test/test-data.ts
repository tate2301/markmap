import type { INode } from '../src/types';

export const sampleData: INode = {
  content: 'Root',
  state: {
    id: 1,
    depth: 0,
    path: '1',
    key: '1',
    size: [100, 40],
    rect: {
      x: 0,
      y: 0,
      width: 100,
      height: 40,
    },
  },
  children: [
    {
      content: 'Child 1',
      state: {
        id: 2,
        depth: 1,
        path: '1.2',
        key: '1.2',
        size: [80, 30],
        rect: {
          x: 0,
          y: 0,
          width: 80,
          height: 30,
        },
      },
      children: [
        {
          content: 'Child 1.1',
          state: {
            id: 4,
            depth: 2,
            path: '1.2.4',
            key: '1.2.4',
            size: [70, 30],
            rect: {
              x: 0,
              y: 0,
              width: 70,
              height: 30,
            },
          },
          children: [],
        },
      ],
    },
    {
      content: 'Child 2',
      state: {
        id: 3,
        depth: 1,
        path: '1.3',
        key: '1.3',
        size: [80, 30],
        rect: {
          x: 0,
          y: 0,
          width: 80,
          height: 30,
        },
      },
      children: [
        {
          content: 'Child 2.1',
          state: {
            id: 5,
            depth: 2,
            path: '1.3.5',
            key: '1.3.5',
            size: [70, 30],
            rect: {
              x: 0,
              y: 0,
              width: 70,
              height: 30,
            },
          },
          children: [],
        },
      ],
    },
  ],
};

// Helper function to create test nodes with proper typing
export function createTestNode(
  content: string,
  id: number,
  depth: number,
  children: INode[] = [],
): INode {
  return {
    content,
    state: {
      id,
      depth,
      path: id.toString(),
      key: id.toString(),
      size: [100, 40],
      rect: {
        x: 0,
        y: 0,
        width: 100,
        height: 40,
      },
    },
    children,
  };
}
