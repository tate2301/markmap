import * as d3 from 'd3';
import {
  BasicMindMapNodeHandler,
  INodeHandler,
  MindMapNodeHandler,
} from './node-handler';
import { TreeStateManager } from './state-manager';
import { treeStyles } from '../tree-styles';
import { Direction, FlexTreeNode, INode, Rect } from '../types';
import { initializeNode, MindMapUtils } from './utils';
import { createElement } from 'react';
import flextree from '../d3-flextree';
import { defaultOptions } from '../constants';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Path from '../../../components/Link';
import NodeWrapper from '../../../components/NodeWrapper';

export class SimpleTreeRenderer {
  private g: d3.Selection<any, any, any, any>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private styleNode: d3.Selection<SVGStyleElement, unknown, null, undefined>;
  private nodeHandler: INodeHandler;
  private nodeRoots: Map<string, ReturnType<typeof createRoot>> = new Map();
  private nodePositions: Map<string, Rect> = new Map()
  private nodeSizes: Map<string, {width: number, height: number}> = new Map()
  private linkPositions: Map<string, { source: { x: number; y: number }, target: { x: number; y: number } }> = new Map();
  private layoutTimeout: ReturnType<typeof setTimeout> | null = null;

 
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
    return [treeStyles].filter(Boolean).join('\n');
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

  updateFolds(node: INode) {
    this.render()
  }

  private renderElement = (node: INode, transform: string, animate: boolean = true) => {
    const options = this.stateManager.getOptions()
    return createElement(NodeWrapper, {
      key: node.state.key,
      node: node,
      nodeSize: options.nodeSize ?? defaultOptions.nodeSize,
      onClick: this.nodeHandler.handleNodeClick,
      isSelected: node === this.stateManager.getSelectedNode(),
      transform: transform,
      onSizeChange: this.handleNodeSizeChange,
    })
  }

  private handleNodeSizeChange = (node: INode, width: number, height: number) => {
    // Get previous size from our tracking Map
    const prevNodeSize = this.nodeSizes.get(node.state.key) ?? {
      width: node.state.size[0],
      height: node.state.size[1]
    }

    const hasSizeChanged = prevNodeSize.width !== width || prevNodeSize.height !== height

    // Update size immediately if changed
    if (hasSizeChanged) {
      // Update the node's state
      node.state.size = [width, height];
      
      // Store the new size in our tracking Map
      this.nodeSizes.set(node.state.key, { width, height });
     
      
      // Clear any pending layout timeout
      if (this.layoutTimeout) {
        clearTimeout(this.layoutTimeout);
      }
      
      // Schedule a new layout update with a short delay to batch multiple size changes
      this.layoutTimeout = setTimeout(() => {
        console.log('Triggering layout update after size changes');
        this.render();
      }, 50); // 50ms delay to batch changes
    }
  }

  private shouldAnimateLink(
    prev: { source: { x: number; y: number }; target: { x: number; y: number } } | undefined,
    next: { source: { x: number; y: number }; target: { x: number; y: number } },
    threshold = 0.1
  ): boolean {
    // If link didn't exist previously => animate in
    if (!prev) return true;
  
    const movedSourceX = Math.abs(next.source.x - prev.source.x) > threshold;
    const movedSourceY = Math.abs(next.source.y - prev.source.y) > threshold;
    const movedTargetX = Math.abs(next.target.x - prev.target.x) > threshold;
    const movedTargetY = Math.abs(next.target.y - prev.target.y) > threshold;
  
    return (movedSourceX || movedSourceY || movedTargetX || movedTargetY);
  }

  private computeNodeRectWithSize(node: INode)  {
    const size = this.nodeSizes.get(node.state.key) ?? { width: 0, height: 0 };
    
    return MindMapUtils.computeRectWithSize(node.state.rect, [size.width, size.height]);

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
  
    // Build the flextree layout
    const tree = flextree({
      direction: options.direction,
      levelSpacing: options.levelSpacing,
      siblingSpacing: options.siblingSpacing,
      nodeSize: (node: FlexTreeNode) => {
        // Use the node's stored size if available, otherwise fall back to default

        const storedSize = this.nodeSizes.get(node.data.state.key)
        const size: [number, number] = storedSize ? [storedSize.width, storedSize.height] : options.nodeSize ?? defaultOptions.nodeSize;

        return size;
      },
    });
  
    const root = tree.hierarchy(initializedData);
    tree.layout(root);
  
    // --------------------------------------------------
    // 1) HELPER to check if a node's rect changed
    // --------------------------------------------------
    const rectHasChanged = (
      nodeKey: string,
      nextRect: Rect,
      threshold = 0.1
    ): boolean => {
      // If node not previously tracked => it's "new," so we say it changed
      const prevRect = this.nodePositions.get(nodeKey);
      if (!prevRect) return true;
  
      const deltaX = Math.abs(nextRect.x - prevRect.x);
      const deltaY = Math.abs(nextRect.y - prevRect.y);
      return (deltaX > threshold || deltaY > threshold);
    };
  
    // --------------------------------------------------
    // 2) RENDER LINKS, animate if source/target node rect changed
    // --------------------------------------------------
    const linkSelection = this.g
      .selectAll('g.link-container')
      .data(root.links())
      .join('g')
      .attr('class', 'link-container');
  
    linkSelection.each((d, i, elements) => {
      // Unique key for this link
      const container = elements[i];
      const linkKey = d.source.data.state.key + '-' + d.target.data.state.key;

      const sourceRect = this.computeNodeRectWithSize(d.source.data);
      const targetRect = this.computeNodeRectWithSize(d.target.data);
  
      // Check if either node has moved
      const sourceChanged = rectHasChanged(
        d.source.data.state.key,
        sourceRect
      );
      const targetChanged = rectHasChanged(
        d.target.data.state.key,
        targetRect
      );
      const animateFlag = sourceChanged || targetChanged;

      console.log({sourceHeight: d.source.data.state.rect.height, targetHeight: d.target.data.state.rect.height})
  
      // Render the link with animateFlag
      const reactRoot = createRoot(container as HTMLElement);
      reactRoot.render(
        createElement(
          StrictMode,
          null,
          createElement(Path, {
            // Pass the computed source/target positions
            source: {
              x: sourceRect.x,
              y: sourceRect.y,
              rect: sourceRect,
            },
            target: {
              x: targetRect.x,
              y: targetRect.y,
              rect: targetRect,
            },
            direction: options.direction ?? defaultOptions.direction,
            nodeSize: options.nodeSize ?? defaultOptions.nodeSize,
            sourceDirection: d.source.data.direction,
            targetDirection: d.target.data.direction,
            sourceDepth: d.source.depth,  
            animateFlag: animateFlag,
          })
        )
      );
    });
  
    // --------------------------------------------------
    // 3) RENDER NODES
    // --------------------------------------------------
    const nodes = this.g
      .selectAll('g.node-wrapper')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node-wrapper');
  
    nodes.selectAll('*').remove();
  
    // Helper to decide whether a node is new or moved
    const shouldAnimateNode = (prev: Rect | undefined, next: Rect, threshold = 0.1): boolean => {
      if (!prev) return true; // new node or not tracked
      const deltaX = Math.abs(next.x - prev.x);
      const deltaY = Math.abs(next.y - prev.y);
      return (deltaX > threshold || deltaY > threshold);
    };
  
    nodes.each((d, i, elements) => {
      const container = elements[i];
      const newRect: Rect = d.data.state.rect;
      const prevRect = this.nodePositions.get(d.data.state.key);
  
      // Is this node new or significantly moved?
      const animateFlag = shouldAnimateNode(prevRect, newRect);
      d.data.state.shouldAnimate = animateFlag;
  
      // Update stored position for next time
      this.nodePositions.set(d.data.state.key, { ...newRect });
  
      // The transform for this node
      const transform = `translate(${newRect.x},${newRect.y})`;
  
      // Create new root and store it
      const reactRoot = createRoot(container as HTMLElement);
      this.nodeRoots.set(d.data.state.key, reactRoot);
  
      reactRoot.render(
        createElement(
          StrictMode,
          null,
          this.renderElement(d.data, transform, d.data.state.shouldAnimate)
        )
      );
    });
  
    // Optionally call highlight function, etc.
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

  public fitView(): void {
    const bounds = this.g.node()?.getBBox();
    if (!bounds) return;

    const width = this.svg.node()?.clientWidth || 800;
    const height = this.svg.node()?.clientHeight || 600;

    const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9; // 90% fit
    const centerX = width / 2 - (bounds.x + bounds.width / 2) * scale;
    const centerY = height / 2 - (bounds.y + bounds.height / 2) * scale;

    this.svg
      .transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(centerX, centerY).scale(scale)
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

    const bounds = nodeElement.getBBox();
    const width = this.svg.node()?.clientWidth || 800;
    const height = this.svg.node()?.clientHeight || 600;

    // Get current transform to maintain the current scale
    const currentTransform = this.svg.property('__zoom') || d3.zoomIdentity;
    const scale = currentTransform.k;

    // Calculate center position
    const centerX = width / 2 - (bounds.x + bounds.width / 2) * scale;
    const centerY = height / 2 - (bounds.y + bounds.height / 2) * scale;

    this.svg
      .transition()
      .duration(300)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(centerX, centerY).scale(scale)
      );
  }

  public ensureVisible(node: INode): void {
    const nodeElement = this.findElement(node);
    if (!nodeElement) return;

    const bounds = nodeElement.getBBox();
    const width = this.svg.node()?.clientWidth || 800;
    const height = this.svg.node()?.clientHeight || 600;

    const currentTransform = this.svg.property('__zoom') || d3.zoomIdentity;
    const viewportBounds = {
      x: -currentTransform.x / currentTransform.k,
      y: -currentTransform.y / currentTransform.k,
      width: width / currentTransform.k,
      height: height / currentTransform.k,
    };

    // If node is not visible, center it
    if (!this.isRectVisible(bounds, viewportBounds)) {
      // Calculate center position while maintaining current scale
      const scale = currentTransform.k;
      const centerX = width / 2 - (bounds.x + bounds.width / 2) * scale;
      const centerY = height / 2 - (bounds.y + bounds.height / 2) * scale;

      this.svg
        .transition()
        .duration(300)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(centerX, centerY).scale(scale)
        );
    }
  }

  public findElement(node: INode): SVGGElement | null {
    const nodeElements = this.g.selectAll('g.node-wrapper');
    let matchingElement: SVGGElement | null = null;

    nodeElements.each(function (d: any) {
      if (d?.data === node) {
        matchingElement = this as SVGGElement;
      }
    });

    return matchingElement;
  }

  private isRectVisible(
    rect: { x: number; y: number; width: number; height: number },
    viewport: { x: number; y: number; width: number; height: number },
  ): boolean {
    // Add some padding to ensure the node isn't right at the edge
    const padding = 20;
    return !(
      rect.x + rect.width + padding < viewport.x ||
      rect.x - padding > viewport.x + viewport.width ||
      rect.y + rect.height + padding < viewport.y ||
      rect.y - padding > viewport.y + viewport.height
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
      this.toggleRecursive(newNode, true);
    } else {
      if (!newNode.payload) newNode.payload = { fold: 0 };
      newNode.payload.fold = newNode.payload.fold ? 0 : 1;
    }

    // this.render(); // Add this to ensure the view updates
  }

  private toggleRecursive(node: INode, isParent?: boolean): void {
    if (!node.payload) node.payload = { fold: 0 };
    node.payload.fold = node.payload.fold ? 0 : 1;

    if (node.payload.fold === 1 && !isParent) {
      this.nodePositions.set(node.state.key, MindMapUtils.createDefaultRect())
    }

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
    // Clear any pending timeouts
    if (this.layoutTimeout) {
      clearTimeout(this.layoutTimeout);
    }
    
    // Unmount all React roots
    this.nodeRoots.forEach((root) => {
      root.unmount();
    });
    this.nodeRoots.clear();
  }
}
