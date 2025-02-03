import { expect, test } from 'vitest';
import { Transformer } from '../src/index';

test('bidirectional mindmap generation without explicit direction markers', () => {
  const transformer = new Transformer();
  const result = transformer.transform(`\
- Root
  - Child 1
  - Child 2
    - Grandchild 1
    - Grandchild 2
  - Child 3
`);
  expect(result.root).toMatchSnapshot();
});

test('bidirectional mindmap generation with explicit direction markers', () => {
  const transformer = new Transformer();
  const result = transformer.transform(`\
- Root
  - [->] Child 1
  - [<-] Child 2
    - [->] Grandchild 1
    - [<-] Grandchild 2
  - [->] Child 3
`);
  expect(result.root).toMatchSnapshot();
});
