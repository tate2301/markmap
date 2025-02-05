// @vitest-environment jsdom

// Add before other imports
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

import { expect, test, describe, afterEach, beforeEach } from 'vitest';
import { Markmap } from '../src/view';
import { Direction } from '../src/types';
import { sampleData } from './test-data';
import { walkTree } from 'mdmindmap-common';
import { INode } from '../src/types';

function createTestSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  return svg;
}

describe('Direction Support', () => {
  let svg: SVGElement;
  let markmap: Markmap;

  beforeEach(async () => {
    svg = createTestSVG();
    document.body.appendChild(svg);
    markmap = Markmap.create(
      svg,
      {
        layoutDirection: Direction.CENTER,
      },
      sampleData,
    );

    if (!markmap.state.data) throw new Error('Markmap data not initialized');

    walkTree(markmap.state.data as INode, (node) => {
      node.state.size = [200, 40]; // Mock reasonable dimensions
    });

    // Wait for layout calculations
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterEach(() => {
    markmap.destroy();
    document.body.removeChild(svg);
  });

  test('root node has center direction', () => {
    const rootNode = svg.querySelector('.markmap-node');
    expect(rootNode?.getAttribute('data-direction')).toBe('center');
  });

  test('immediate children alternate between left and right', () => {
    const immediateChildren = svg.querySelectorAll(
      '.markmap-node[data-depth="1"]',
    );
    expect(immediateChildren.length).toBeGreaterThan(0);

    Array.from(immediateChildren).forEach((node, index) => {
      const expectedSide = index % 2 === 0 ? Direction.RL : Direction.LR;
      expect(node.getAttribute('data-side')).toBe(expectedSide);
    });
  });

  test('descendants inherit their parent direction', () => {
    const deeperNodes = svg.querySelectorAll(
      '.markmap-node[data-depth="2"], .markmap-node[data-depth="3"]',
    );
    deeperNodes.forEach((node) => {
      const parentPath = node
        .getAttribute('data-path')
        ?.split('.')
        .slice(0, -1)
        .join('.');
      const parent = svg.querySelector(
        `.markmap-node[data-path="${parentPath}"]`,
      );

      expect(node.getAttribute('data-side')).toBe(
        parent?.getAttribute('data-side'),
      );
    });
  });

  test('links match their target node direction', () => {
    const links = svg.querySelectorAll('.markmap-link');
    expect(links.length).toBeGreaterThan(0);

    links.forEach((link) => {
      expect(link.getAttribute('data-direction')).toBe('center');
      const path = link.getAttribute('data-path');
      const targetNode = svg.querySelector(
        `.markmap-node[data-path="${path}"]`,
      );
      expect(link.getAttribute('data-side')).toBe(
        targetNode?.getAttribute('data-side'),
      );
    });
  });

  test('nodes are positioned correctly based on their side', () => {
    const nodes = svg.querySelectorAll('.markmap-node');

    // Check left nodes
    const leftNodes = Array.from(nodes).filter(
      (node) => node.getAttribute('data-side') === Direction.RL,
    );
    leftNodes.forEach((node) => {
      const positionX = node.getAttribute('data-x');
      expect(parseInt(positionX || '0')).toBeLessThan(0);
    });

    // Check right nodes
    const rightNodes = Array.from(nodes).filter(
      (node) => node.getAttribute('data-side') === Direction.LR,
    );
    rightNodes.forEach((node) => {
      const positionX = node.getAttribute('data-x');
      expect(parseInt(positionX || '0')).toBeGreaterThan(0);
    });
  });
});
