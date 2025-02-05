import * as d3 from 'd3';
import {
  BasicMindMapNodeHandler,
  INodeHandler,
  MindMapNodeHandler,
} from './node-handler';
import { TreeStateManager } from './state-manager';
import { treeStyles } from '../../tree-styles';
import { Direction, INode } from '../../types';
import { initializeNode, MindMapUtils } from './utils';
import { createElement } from 'react';
import flextree from '../../d3-flextree';
import { defaultOptions } from '../../constants';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Path from '../Link';
import NodeWrapper from '../NodeWrapper';

export class SimpleTreeRenderer {
  private g: d3.Selection<any, any, any, any>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private styleNode: d3.Selection<SVGStyleElement, unknown, null, undefined>;
  private nodeHandler: INodeHandler;
  private nodeRoots: Map<string, ReturnType<typeof createRoot>> = new Map();

  constructor(
    g: d3.Selection<any, any, any, any>,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    private stateManager: TreeStateManager,
  ) {
    this.nodeHandler = new BasicMindMapNodeHandler(this, this.stateManager);
    this.stateManager.setRenderer(this);

    this.g = g;
    this.svg = svg;
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    this.styleNode = (this as any).svg
      .append('defs')
      .append('style')
      .attr('type', 'text/css');

    this.updateStyle();
  }

  private getStyleContent(): string {
    const dynamicStyles = `
        .enhanced-tree .node.selected rect {
          stroke: #2ecc71 !important;
        }
        .enhanced-tree .node.highlight rect {
          stroke: #3498db !important;
        }
      `;

    return [treeStyles, dynamicStyles].filter(Boolean).join('\n');
  }

  private updateStyle(): void {
    // Add class to SVG element
    (this as any).svg.attr('class', 'enhanced-tree');

    // Update style content
    this.styleNode.text(this.getStyleContent());
  }

  createNode(parentNode: INode, content: string, position?: number): INode {
    const newNode: INode = {
      content,
      children: [],
      payload: { fold: 0 },
      state: {
        id: Math.random(),
        depth: 0,
        rect: { x: 0, y: 0, width: 0, height: 0 },
        key: `node-${Math.random()}`,
        path: `0`,
        size: [0, 0],
      },
    };

    if (!parentNode.children) {
      parentNode.children = [];
    }

    if (typeof position === 'number' && position >= 0) {
      parentNode.children.splice(position, 0, newNode);
    } else {
      parentNode.children.push(newNode);
    }

    initializeNode(
      newNode,
      (parentNode.state?.depth ?? 0) + 1,
      parentNode.direction,
      parentNode,
    );

    this.render();

    return newNode;
  }

  render(): void {
    const data = this.stateManager.getData();
    if (!data) return;

    // Clear the roots map when doing a full re-render
    this.nodeRoots.clear();

    const options = this.stateManager.getOptions();
    const initializedData = initializeNode(data, 0, options.direction);

    // Clear existing content
    this.g.selectAll('*').remove();

    const tree = flextree({
      direction: options.direction,
      levelSpacing: options.levelSpacing,
      siblingSpacing: options.siblingSpacing,
      nodeSize: () => options.nodeSize ?? defaultOptions.nodeSize,
    });

    const root = tree.hierarchy(initializedData);
    tree.layout(root);

    // Draw links using React components
    const links = this.g
      .selectAll('g.link-container')
      .data(root.links())
      .join('g')
      .attr('class', 'link-container');

    links.each((d, i, elements) => {
      const container = elements[i];
      createRoot(container as HTMLElement).render(
        createElement(
          StrictMode,
          null,
          createElement(Path, {
            source: {
              x: d.source.data.state.rect.x,
              y: d.source.data.state.rect.y,
              rect: d.source.data.state.rect,
            },
            target: {
              x: d.target.data.state.rect.x,
              y: d.target.data.state.rect.y,
              rect: d.target.data.state.rect,
            },
            direction: options.direction ?? defaultOptions.direction,
            nodeSize: options.nodeSize ?? defaultOptions.nodeSize,
            sourceDirection: d.source.data.direction,
            targetDirection: d.target.data.direction,
            sourceDepth: d.source.depth,
          }),
        ),
      );
    });

    const nodes = this.g
      .selectAll('g.node-wrapper')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node-wrapper');

    nodes.selectAll('*').remove();

    nodes.each((d, i, elements) => {
      const container = elements[i];
      const transform = `translate(${d.data.state.rect.x},${d.data.state.rect.y})`;

      // Create new root and store it
      const root = createRoot(container as HTMLElement);
      this.nodeRoots.set(d.data.state.key, root);

      root.render(
        createElement(
          StrictMode,
          null,
          createElement(NodeWrapper, {
            key: d.data.state.key,
            node: d.data,
            nodeSize: options.nodeSize ?? defaultOptions.nodeSize,
            onClick: this.nodeHandler.handleNodeClick,
            isSelected: d.data === this.stateManager.getSelectedNode(),
            transform: transform,
          }),
        ),
      );
    });

    this.updateHighlight();
  }

  setDirection(direction: Direction) {
    this.stateManager.setOptions({ direction });
    // Optionally re-center the tree based on direction
    const options = this.stateManager.getOptions();
    const width = options.width;
    const height = options.height;

    if (width && height) {
      const translateX = width / 2;
      const translateY = height / 2;
      this.g.attr('transform', `translate(${translateX},${translateY})`);
    }

    this.render();
  }

  updateNodes(): void {
    this.g.selectAll('g.node').attr('class', 'updated');
  }

  updateLinks(): void {
    console.log('Updating links...');
  }

  updateHighlight() {
    const selectedNode = this.stateManager.getSelectedNode();

    // Find and update only the nodes that need to change
    this.g.selectAll('g.node-wrapper').each((d: any, i, nodes) => {
      const node = d.data;
      const isSelected = node === selectedNode;

      // Only re-render if this node is selected, highlighted, or was previously selected/highlighted
      if (isSelected || node.state.wasSelected) {
        // Store previous state for next comparison
        node.state.wasSelected = isSelected;

        const transform = `translate(${node.state.rect.x},${node.state.rect.y})`;

        // Get existing root or create new one if needed
        let root = this.nodeRoots.get(node.state.key);
        if (!root) {
          const container = nodes[i];
          root = createRoot(container as HTMLElement);
          this.nodeRoots.set(node.state.key, root);
        }

        // Update the existing root
        root.render(
          createElement(
            StrictMode,
            null,
            createElement(NodeWrapper, {
              key: node.state.key,
              node: node,
              nodeSize:
                this.stateManager.getOptions().nodeSize ??
                defaultOptions.nodeSize,
              onClick: this.nodeHandler.handleNodeClick,
              isSelected,
              transform,
            }),
          ),
        );
      }
    });
  }

  zoomBy(factor: number) {
    this.svg.transition().duration(300).call(this.zoom.scaleBy, factor);
  }

  fitView(): void {
    const bounds = this.g.node()?.getBBox();
    if (!bounds) return;

    const width = this.svg.node()?.clientWidth || 800;
    const height = this.svg.node()?.clientHeight || 600;

    const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9; // 90% fit
    const translateX = width / 2 - scale * (bounds.x + bounds.width / 2);
    const translateY = height / 2 - scale * (bounds.y + bounds.height / 2);

    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale),
      );
  }

  resetView(): void {
    this.svg
      .transition()
      .duration(300)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  rescale(scale: number): void {
    const options = this.stateManager.getOptions();
    const width = options.width ?? defaultOptions.width;
    const height = options.height ?? defaultOptions.height;
    const currentTransform = this.svg.property('__zoom') || d3.zoomIdentity;
    const center = {
      x: width / 2,
      y: height / 2,
    };

    const transform = d3.zoomIdentity
      .translate(center.x, center.y)
      .scale(scale)
      .translate(
        -(center.x * currentTransform.k + currentTransform.x) /
          currentTransform.k,
        -(center.y * currentTransform.k + currentTransform.y) /
          currentTransform.k,
      );

    this.svg.transition().duration(300).call(this.zoom.transform, transform);
  }

  public centerNode(node: INode): void {
    const nodeElement = this.findElement(node);
    if (!nodeElement) return;

    const options = this.stateManager.getOptions();
    const bounds = nodeElement.getBBox();
    const transform = d3.zoomIdentity.translate(
      (options.width ?? defaultOptions.width) / 2 -
        (bounds.x + bounds.width / 2),
      (options.height ?? defaultOptions.height) / 2 -
        (bounds.y + bounds.height / 2),
    );

    this.svg.transition().duration(300).call(this.zoom.transform, transform);
  }

  public ensureVisible(node: INode): void {
    const nodeElement = this.findElement(node);
    if (!nodeElement) return;

    const bounds = nodeElement.getBBox();
    const options = this.stateManager.getOptions();
    const width = options.width ?? defaultOptions.width;
    const height = options.height ?? defaultOptions.height;

    const currentTransform = this.svg.property('__zoom') || d3.zoomIdentity;
    const viewportBounds = {
      x: -currentTransform.x / currentTransform.k,
      y: -currentTransform.y / currentTransform.k,
      width: width / currentTransform.k,
      height: height / currentTransform.k,
    };

    // Check if node is outside viewport
    if (!this.isRectVisible(bounds, viewportBounds)) {
      this.centerNode(node);
    }
  }

  public findElement(node: INode): SVGGElement | null {
    const nodeElements = this.g.selectAll('g.node');
    let matchingElement: SVGGElement | null = null;

    nodeElements.each(function (d: any) {
      if (d.data === node) {
        matchingElement = this as SVGGElement;
      }
    });

    return matchingElement;
  }

  private isRectVisible(
    rect: { x: number; y: number; width: number; height: number },
    viewport: { x: number; y: number; width: number; height: number },
  ): boolean {
    return !(
      rect.x + rect.width < viewport.x ||
      rect.x > viewport.x + viewport.width ||
      rect.y + rect.height < viewport.y ||
      rect.y > viewport.y + viewport.height
    );
  }

  async toggleNode(node: INode, recursive: boolean): Promise<void> {
    const data = this.stateManager.getData();
    if (!data) return;

    // Use MindMapUtils.findNode to search through the entire tree
    const newNode = MindMapUtils.findNode(
      data,
      (n: INode) => n.state.key === node.state.key,
    );
    if (!newNode) return;

    if (recursive) {
      this.toggleRecursive(newNode);
    } else {
      if (!newNode.payload) newNode.payload = { fold: 0 };
      newNode.payload.fold = newNode.payload.fold ? 0 : 1;
    }

    this.render(); // Add this to ensure the view updates
  }

  private toggleRecursive(node: INode): void {
    if (!node.payload) node.payload = { fold: 0 };
    node.payload.fold = node.payload.fold ? 0 : 1;

    // Recursively toggle all children
    if (node.children) {
      node.children.forEach((child) => this.toggleRecursive(child));
    }
  }

  setCustomNodeHandler(
    handler: (node: INode, event: React.MouseEvent) => void,
  ) {
    if (this.nodeHandler instanceof MindMapNodeHandler) {
      this.nodeHandler.setCustomHandler(handler);
    }
  }

  attachNodeEventListeners() {
    this.g.selectAll('g.node').on('click', (event: MouseEvent, d: any) => {
      const recursive = event.ctrlKey || event.metaKey;
      this.stateManager.toggleNode(d, recursive);
    });
  }

  detachNodeEventListeners() {
    this.g.selectAll('g.node').on('click', null);
  }

  // Add cleanup method
  destroy() {
    // Unmount all React roots
    this.nodeRoots.forEach((root) => {
      root.unmount();
    });
    this.nodeRoots.clear();
  }
}
