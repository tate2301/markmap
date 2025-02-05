import { INode } from '../types';

export const getSimpleSampleData = (): INode => ({
  content: 'Root',
  children: [
    {
      content: 'Child 1',
      children: [
        { content: 'Grandchild 1.1', children: [] },
        { content: 'Grandchild 1.2', children: [] },
      ],
    },
    {
      content: 'Child 2',
      children: [
        { content: 'Grandchild 2.1', children: [] },
        { content: 'Grandchild 2.2', children: [] },
      ],
    },
  ],
});

export const getComplexSampleData = (): INode => ({
  content: 'Root Node',
  children: [
    {
      content: 'Category A',
      children: [
        {
          content: 'Sub A1',
          children: [
            { content: 'Item A1.1' },
            { content: 'Item A1.2' },
            {
              content: 'Item A1.3',
              children: [
                { content: 'Item A1.3.1' },
                { content: 'Item A1.3.2' },
                {
                  content: 'Item A1.3.3',
                  children: [
                    { content: 'Item A1.3.3.1' },
                    { content: 'Item A1.3.3.2' },
                  ],
                },
              ],
            },
          ],
        },
        {
          content: 'Sub A2',
          children: [
            { content: 'Item A2.1' },
            { content: 'Item A2.2' },
            { content: 'Item A2.3' },
          ],
        },
      ],
    },
    {
      content: 'Category B',
      children: [
        {
          content: 'Sub B1',
          children: [
            {
              content: 'Item B1.1',
              children: [
                { content: 'Item B1.1.1' },
                { content: 'Item B1.1.2' },
              ],
            },
            { content: 'Item B1.2' },
            {
              content: 'Item B1.3',
              children: [
                { content: 'Item B1.3.1' },
                { content: 'Item B1.3.2' },
                { content: 'Item B1.3.3' },
              ],
            },
          ],
        },
        {
          content: 'Sub B2',
          children: [
            { content: 'Item B2.1' },
            { content: 'Item B2.2' },
            { content: 'Item B2.3' },
            { content: 'Item B2.4' },
          ],
        },
      ],
    },
    {
      content: 'Category C',
      children: [
        {
          content: 'Sub C1',
          children: [
            { content: 'Item C1.1' },
            { content: 'Item C1.2' },
            { content: 'Item C1.3' },
          ],
        },
        {
          content: 'Sub C2',
          children: [
            {
              content: 'Item C2.1',
              children: [
                { content: 'Item C2.1.1' },
                { content: 'Item C2.1.2' },
              ],
            },
            { content: 'Item C2.2' },
          ],
        },
      ],
    },
    {
      content: 'Category D',
      children: [
        {
          content: 'Sub D1',
          children: [
            {
              content: 'Item D1.1',
              children: [
                { content: 'Item D1.1.1' },
                { content: 'Item D1.1.2' },
              ],
            },
            { content: 'Item D1.2' },
          ],
        },
        {
          content: 'Sub D2',
          children: [
            { content: 'Item D2.1' },
            {
              content: 'Item D2.2',
              children: [
                { content: 'Item D2.2.1' },
                { content: 'Item D2.2.2' },
              ],
            },
          ],
        },
      ],
    },
  ],
});

export const initializePayload = (node: INode): void => {
  node.payload = { fold: 0 };
  if (node.children) {
    node.children.forEach((child) => initializePayload(child));
  }
};
