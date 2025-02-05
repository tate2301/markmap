// @vitest-environment jsdom

// Add before other imports
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

import { expect, test, describe } from 'vitest';
import { Markmap } from '../src/view';
import { Direction } from '../src/types';

// Test data generators
function createDeepTree(depth: number, childrenPerNode = 2) {
  const createNode = (currentDepth: number): any => {
    if (currentDepth === 0) return null;
    return {
      content: `Node at depth ${depth - currentDepth + 1}`,
      children: Array(childrenPerNode)
        .fill(null)
        .map(() => createNode(currentDepth - 1))
        .filter(Boolean),
    };
  };
  return createNode(depth);
}

function createAsymmetricTree() {
  return {
    content: 'Root',
    children: [
      {
        content: 'Left Branch',
        children: [
          { content: 'Left-1', children: [] },
          {
            content: 'Left-2',
            children: [
              { content: 'Left-2-1', children: [] },
              { content: 'Left-2-2', children: [] },
              { content: 'Left-2-3', children: [] },
            ],
          },
        ],
      },
      {
        content: 'Right Branch',
        children: [
          {
            content: 'Right-1',
            children: [{ content: 'Right-1-1', children: [] }],
          },
        ],
      },
    ],
  };
}

function createVaryingSizeTree() {
  return {
    content: '<div style="width: 100px;">Root</div>',
    children: [
      {
        content: '<div style="width: 200px;">Wide Node</div>',
        children: [
          { content: '<div style="width: 50px;">Small</div>', children: [] },
          {
            content: '<div style="width: 300px;">Very Wide Node</div>',
            children: [],
          },
        ],
      },
      {
        content: '<div style="width: 150px;">Medium Node</div>',
        children: [
          { content: '<div style="width: 80px;">Compact</div>', children: [] },
        ],
      },
    ],
  };
}

function createLargeDataset(breadth: number, depth: number) {
  const createNode = (currentDepth: number, index: number): any => {
    if (currentDepth === 0) return null;
    return {
      content: `Node ${index} at depth ${depth - currentDepth + 1}`,
      children: Array(breadth)
        .fill(null)
        .map((_, i) => createNode(currentDepth - 1, i))
        .filter(Boolean),
    };
  };
  return createNode(depth, 0);
}

function createTestSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  return svg;
}

describe('Layout Direction Tests', () => {
  const directions = [
    Direction.LR,
    Direction.RL,
    Direction.TB,
    Direction.BT,
    Direction.CENTER,
  ];

  directions.forEach((direction) => {
    test(`basic layout in ${direction} direction`, () => {
      const svg = createTestSVG();
      document.body.appendChild(svg);

      const markmap = Markmap.create(
        svg,
        {
          layoutDirection: direction,
        },
        createAsymmetricTree(),
      );

      const nodes = svg.querySelectorAll('.markmap-node');
      expect(nodes.length).toBeGreaterThan(0);

      nodes.forEach((node) => {
        expect(node.getAttribute('data-direction')).toBe(direction);
      });

      // Get root node
      const rootNode = Array.from(nodes).find(
        (node) => node.getAttribute('data-depth') === '0',
      );
      if (!rootNode) {
        throw new Error('Root node not found');
      }

      const rootNodePosition = {
        x: Number(rootNode.getAttribute('data-x')),
        y: Number(rootNode.getAttribute('data-y')),
      };

      // Check node positioning based on direction
      const nodePositions = Array.from(nodes).map((node) => {
        const transform = node.getAttribute('transform');
        if (!transform) return { x: 0, y: 0 };
        const [x, y] = transform
          .replace('translate(', '')
          .replace(')', '')
          .split(',')
          .map(Number);
        return { x, y };
      });

      let nonRootNodes;
      let leftNodes;
      let rightNodes;

      // Verify positioning based on direction
      switch (direction) {
        case Direction.RL:
          // Root should be rightmost
          expect(Math.max(...nodePositions.map((p) => p.x))).toBe(
            rootNodePosition.x,
          );
          break;
        case Direction.TB:
          // Root should be topmost
          expect(Math.min(...nodePositions.map((p) => p.y))).toBe(
            rootNodePosition.y,
          );
          break;
        case Direction.BT:
          // Root should be bottommost
          expect(Math.max(...nodePositions.map((p) => p.y))).toBe(
            rootNodePosition.y,
          );
          break;
        case Direction.CENTER:
          // Children should be on both sides of root
          nonRootNodes = nodePositions.slice(1);
          leftNodes = nonRootNodes.filter((p) => p.x < rootNodePosition.x);
          rightNodes = nonRootNodes.filter((p) => p.x > rootNodePosition.x);
          expect(leftNodes.length).toBeGreaterThan(0);
          expect(rightNodes.length).toBeGreaterThan(0);
          break;
        default: // LR
          // Root should be leftmost
          expect(Math.min(...nodePositions.map((p) => p.x))).toBe(
            rootNodePosition.x,
          );
      }

      markmap.destroy(); // Clean up resources
      document.body.removeChild(svg);
    });
  });
});

describe('Deep Tree Tests', () => {
  test('deeply nested tree maintains hierarchy', () => {
    const deepTree = createDeepTree(5); // 5 levels deep
    const svg = createTestSVG();
    document.body.appendChild(svg);

    const markmap = Markmap.create(svg, {}, deepTree);

    const nodes = svg.querySelectorAll('.markmap-node');
    const depths = new Set(
      Array.from(nodes).map((node) => Number(node.getAttribute('data-depth'))),
    );

    // Should have nodes at all 5 depths
    expect(depths.size).toBe(5);

    // Check parent-child relationships
    const links = svg.querySelectorAll('.markmap-link');
    expect(links.length).toBe(nodes.length - 1); // n nodes should have n-1 links

    markmap.destroy();
    document.body.removeChild(svg);
  });
});

describe('Asymmetric Tree Tests', () => {
  test('handles asymmetric structure without overlaps', () => {
    const svg = createTestSVG();
    document.body.appendChild(svg);

    const markmap = Markmap.create(svg, {}, createAsymmetricTree());

    const nodes = Array.from(svg.querySelectorAll('.markmap-node'));
    const nodeRects = nodes.map((node) => {
      const transform = node.getAttribute('transform');
      if (!transform) return { x: 0, y: 0 };
      const [x, y] = transform
        .replace('translate(', '')
        .replace(')', '')
        .split(',')
        .map(Number);
      const rect = node.getBoundingClientRect();
      return {
        x,
        y,
        width: rect.width,
        height: rect.height,
      };
    });

    // Check for overlaps
    for (let i = 0; i < nodeRects.length; i++) {
      for (let j = i + 1; j < nodeRects.length; j++) {
        const rect1 = nodeRects[i];
        const rect2 = nodeRects[j];
        if (!rect1.width || !rect2.width || !rect1.height || !rect2.height)
          continue;
        const hasOverlap = !(
          rect1.x + rect1.width < rect2.x ||
          rect2.x + rect2.width < rect1.x ||
          rect1.y + rect1.height < rect2.y ||
          rect2.y + rect2.height < rect1.y
        );
        expect(hasOverlap).toBe(false);
      }
    }
    markmap.destroy();
    document.body.removeChild(svg);
  });
});

describe('Varying Node Size Tests', () => {
  test('adapts spacing to node sizes', () => {
    const svg = createTestSVG();
    document.body.appendChild(svg);

    const markmap = Markmap.create(svg, {}, createVaryingSizeTree());

    const nodes = Array.from(svg.querySelectorAll('.markmap-node'));
    const nodeRects = nodes.map((node) => {
      const transform = node.getAttribute('transform');
      if (!transform) return { x: 0, y: 0 };
      const [x, y] = transform
        .replace('translate(', '')
        .replace(')', '')
        .split(',')
        .map(Number);
      const rect = node.getBoundingClientRect();
      return {
        x,
        y,
        width: rect.width,
        height: rect.height,
      };
    });

    // Verify that larger nodes have more spacing
    for (let i = 0; i < nodeRects.length - 1; i++) {
      const current = nodeRects[i];
      const next = nodeRects[i + 1];
      const spacing = Math.abs(next.y - current.y);
      const minSpacing = Math.max(current.height || 0, next.height || 0);
      expect(spacing).toBeGreaterThanOrEqual(minSpacing);
    }
    markmap.destroy();
    document.body.removeChild(svg);
  });
});

describe('Performance Tests', () => {
  test('handles large datasets efficiently', () => {
    const start = performance.now();

    const largeTree = createLargeDataset(5, 4); // 5 children per node, 4 levels deep
    const svg = createTestSVG();
    document.body.appendChild(svg);

    const markmap = Markmap.create(svg, {}, largeTree);

    const renderTime = performance.now() - start;
    expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second

    const nodes = svg.querySelectorAll('.markmap-node');
    expect(nodes.length).toBeGreaterThan(100); // Should have rendered all nodes
    markmap.destroy();
    document.body.removeChild(svg);
  });

  test('maintains performance with complex layouts', () => {
    const complexTree = createLargeDataset(3, 6); // 3 children per node, 6 levels deep

    const directions = [
      Direction.LR,
      Direction.RL,
      Direction.TB,
      Direction.BT,
      Direction.CENTER,
    ];

    directions.forEach((direction) => {
      const start = performance.now();
      const svg = createTestSVG();
      document.body.appendChild(svg);

      const markmap = Markmap.create(
        svg,
        {
          layoutDirection: direction,
        },
        complexTree,
      );
      const renderTime = performance.now() - start;

      expect(renderTime).toBeLessThan(1000);

      const nodes = svg.querySelectorAll('.markmap-node');
      expect(nodes.length).toBeGreaterThan(50);

      markmap.destroy();
      document.body.removeChild(svg);
    });
  });
});
