// SimpleTree.ts
import { select, zoom } from 'd3';
import { Direction, IMarkmapOptions, IMarkmapState, INode } from './types';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ToolBar } from '../../components/ToolBar';
import {
  BasicMindMapNodeOperations,
  IMindMapTreeNodeOperations,
} from './lib/node-operations';
import { SimpleTreeRenderer } from './lib/renderer';
import { TreeStateManager } from './lib/state-manager';
export type { SimpleTreeOptions } from './types';

const treeStyles = `
  .node rect {
    fill: none;
    stroke-width: 1px;
  }

  .link {
    fill: none;
    stroke: #ddd;
    stroke-width: 1.5px;
  }
`;

export class SimpleTree {
  public options: Required<IMarkmapOptions>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private currentData: INode | null = null;
  private toolbarContainer: HTMLDivElement | null = null;
  private toolbarRoot: ReactDOM.Root | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  public state: IMarkmapState = {};

  private treeOperations: IMindMapTreeNodeOperations;
  private renderer: SimpleTreeRenderer;

  constructor(
    container: HTMLElement,
    options: IMarkmapOptions,
    private stateManager: TreeStateManager,
  ) {
    // Add styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = treeStyles;
    document.head.appendChild(styleElement);

    this.options = {
      width: options.width ?? 800,
      height: options.height ?? 600,
      nodeSize: options.nodeSize ?? [100, 30],
      direction: options.direction ?? Direction.LR,
      nodePadding: options.nodePadding ?? 10,
      levelSpacing: options.levelSpacing ?? 20,
      siblingSpacing: options.siblingSpacing ?? 8,
      showToolbar: options.showToolbar ?? true,
      ...options,
    };

    this.svg = select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, this.options.width, this.options.height]);

    // Initialize zoom behavior
    this.zoom = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    // Apply zoom behavior to SVG
    this.svg.call(this.zoom);

    // For RL direction, start from the right side
    const translateX =
      this.options.direction === Direction.RL
        ? (this.options.width * 3) / 4
        : this.options.width / 4;

    this.g = this.svg
      .append('g')
      .attr('transform', `translate(${translateX},${this.options.height / 2})`);

    if (this.options.showToolbar) {
      this.createToolbar(container);
    }

    this.renderer = new SimpleTreeRenderer(this.g, this.svg, stateManager);
    this.treeOperations = new BasicMindMapNodeOperations(
      stateManager,
      this.renderer,
    );
  }

  attachNodeEventListeners() {
    this.renderer.attachNodeEventListeners();
  }

  setCustomNodeHandler(
    handler: (node: INode, event: React.MouseEvent) => void,
  ) {
    this.renderer.setCustomNodeHandler(handler);
  }

  detachNodeEventListeners() {
    this.renderer.detachNodeEventListeners();
  }

  setData(data: INode) {
    this.stateManager.setData(data);
  }

  setOptions(opts: Partial<IMarkmapOptions> = {}) {
    this.stateManager.setOptions(opts);
  }

  private createToolbar(container: HTMLElement) {
    this.toolbarContainer = document.createElement('div');
    container.appendChild(this.toolbarContainer);

    this.toolbarRoot = ReactDOM.createRoot(this.toolbarContainer);
    this.toolbarRoot.render(
      React.createElement(ToolBar, {
        onZoomIn: () => this.zoomBy(1.2),
        onZoomOut: () => this.zoomBy(0.8),
        onReset: () => this.resetView(),
        onFit: () => this.fitView(),
        onCenter: () => this.centerNode(this.stateManager.getSelectedNode()),
      }),
    );
  }

  public zoomBy(factor: number) {
    this.renderer.zoomBy(factor);
  }

  public resetView() {
    this.renderer.resetView();
  }

  public fitView() {
    if (!this.currentData) return;
    this.renderer.fitView();
  }

  public centerNode(node: INode | null): void {
    if (!node) return;
    this.renderer.centerNode(node);
  }

  public ensureVisible(node: INode): void {
    this.renderer.ensureVisible(node);
  }

  public rescale(scale: number): void {
    this.renderer.rescale(scale);
  }

  render(data: INode) {
    this.setData(data);
    this.renderer.render();
  }

  setDirection(direction: Direction) {
    this.renderer.setDirection(direction);
  }

  destroy() {
    this.detachNodeEventListeners();
    this.svg.remove();
    if (this.toolbarRoot) {
      this.toolbarRoot.unmount();
    }
    this.toolbarContainer?.remove();
  }

  public findNode(predicate: (node: INode) => boolean): INode | null {
    const search = (node: INode): INode | null => {
      if (predicate(node)) return node;
      if (node.children) {
        for (const child of node.children) {
          const result = search(child);
          if (result) return result;
        }
      }
      return null;
    };

    return this.currentData ? search(this.currentData) : null;
  }

  public findElement(node: INode): SVGGElement | null {
    return this.renderer.findElement(node);
  }

  public create(parentNode: INode, content: string, position?: number): INode {
    return this.treeOperations.create(parentNode, content, position);
  }

  public setSelected(node: INode | null) {
    this.treeOperations.setSelected(node);
  }

  updateHighlight() {
    this.renderer.updateHighlight();
  }

  toggleNode(node: INode, recursive: boolean = false): void {
    this.renderer.toggleNode(node, recursive);
    this.renderer.render();
  }
}
