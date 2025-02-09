import * as d3 from 'd3';
import {
  BasicMindMapNodeHandler,
  INodeHandler,
  MindMapNodeHandler,
} from './node-handler';
import { TreeStateManager } from './state-manager';
import { treeStyles } from '../tree-styles';
import { Direction, FlexTreeNode, IEnhancedNode, Rect, BoundingBox } from '../types';
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
  private spatialIndex: d3.Quadtree<d3.HierarchyNode<IEnhancedNode>> | null = null;
  private styleNode: d3.Selection<SVGStyleElement, unknown, null, undefined>;
  private nodeHandler: INodeHandler;
  private nodeRoots: Map<string, ReturnType<typeof createRoot>> = new Map();
  private linkRoots: Map<string, ReturnType<typeof createRoot>> = new Map();
  private nodePositions: Map<string, Rect> = new Map();
  private nodeSizes: Map<string, {width: number, height: number}> = new Map();
  private layoutTimeout: ReturnType<typeof setTimeout> | null = null;
  private renderQueue: Set<string> = new Set(); // Track nodes that need updates
  private isRenderScheduled: boolean = false;
  private boundingBoxCache: Map<string, BoundingBox> = new Map();
  private currentViewport: { x: number; y: number; width: number; height: number } | null = null;
  private currentTransform: d3.ZoomTransform | null = null;
  private previousNodeKeys: Set<string> = new Set();
  private previousFoldStates: Map<string, number> = new Map();

  private handleZoom = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    this.currentTransform = event.transform;
    this.g.attr('transform', event.transform.toString());
    
    // Clear any existing render timeout
    if (this.layoutTimeout) {
      clearTimeout(this.layoutTimeout);
    }
    
    // Clear previous states during zoom to prevent animations
    this.previousNodeKeys.clear();
    this.previousFoldStates.clear();
    
    // Update viewport and schedule render
    this.updateViewport();
    
    // Use requestAnimationFrame for smooth updates during continuous pan/zoom
    if (!this.isRenderScheduled) {
      this.isRenderScheduled = true;
      requestAnimationFrame(() => {
        this.render();
        this.isRenderScheduled = false;
      });
    }
  };

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
      .on('zoom', this.handleZoom);

    this.svg.call(this.zoom);

    this.styleNode = (this as any).svg
      .append('defs')
      .append('style')
      .attr('type', 'text/css');

    this.updateStyle();

    // Initial viewport setup
    this.updateViewport();

    // Add resize observer to handle window resizing
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.updateViewport();
        this.scheduleRender();
      });
      resizeObserver.observe(svg.node()!);
    }
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

  createNode(parentNode: IEnhancedNode, content: string, position?: number): IEnhancedNode {
    const newNode: IEnhancedNode = {
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

  updateFolds() {
    this.render()
  }

  private renderElement = (node: IEnhancedNode, transform: string,) => {
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

  private handleNodeSizeChange = (node: IEnhancedNode, width: number, height: number) => {
    const nodeKey = node.state.key;
    const prevSize = this.nodeSizes.get(nodeKey);
    
    if (!prevSize || Math.abs(prevSize.width - width) > 1 || Math.abs(prevSize.height - height) > 1) {
      node.state.size = [width, height];
      this.nodeSizes.set(nodeKey, { width, height });
      
      // Clear any pending layout timeout
      if (this.layoutTimeout) {
        clearTimeout(this.layoutTimeout);
      }
      
      // Trigger immediate render for significant size changes
      this.render();
    }
  }

  private scheduleRender = () => {
    if (this.isRenderScheduled) return;
    
    this.isRenderScheduled = true;
    if (this.layoutTimeout) clearTimeout(this.layoutTimeout);
    
    this.layoutTimeout = setTimeout(() => {
      this.processRenderQueue();
      this.isRenderScheduled = false;
    }, 50);
  }

  private processRenderQueue() {
    if (this.renderQueue.size === 0) return;
    
    const affectedNodes = Array.from(this.renderQueue);
    this.renderQueue.clear();
    this.boundingBoxCache.clear();
    
    // If more than 30% of nodes are affected, do a full render
    const totalNodes = this.nodePositions.size;
    if (affectedNodes.length > totalNodes * 0.3) {
      this.render();
      return;
    }

    // Otherwise, update only affected nodes and their connections
    this.updatePartialRender(affectedNodes);
  }

  private updatePartialRender(nodeKeys: string[]) {
    const data = this.stateManager.getData();
    if (!data) return;

    const options = this.stateManager.getOptions();
    const tree = flextree({
      direction: options.direction,
      levelSpacing: options.levelSpacing,
      siblingSpacing: Math.max(options.siblingSpacing ?? 8, 8),
      nodeSize: (node: FlexTreeNode) => {
        // Use the node's stored size if available, otherwise fall back to default
        const storedSize = this.nodeSizes.get(node.data.state.key);
        const size: [number, number] = storedSize 
          ? [storedSize.width + 8, storedSize.height + 8]  // Add padding to node sizes
          : options.nodeSize ?? defaultOptions.nodeSize;
        return size;
      },
    });

    const root = tree.hierarchy(data);
    tree.layout(root);

    nodeKeys.forEach(nodeKey => {
      const node = root.descendants().find(d => d.data.state.key === nodeKey);
      if (node) {
        this.updateNodeAndConnections(node);
      }
    });
  }

  private updateNodeAndConnections(node: FlexTreeNode) {
    const nodeKey = node.data.state.key;
    const nodeSelection = this.g.selectAll(`g.node-wrapper[data-key="${nodeKey}"]`);
    
    if (!nodeSelection.empty()) {
      const transform = `translate(${node.data.state.rect.x},${node.data.state.rect.y})`;
      const root = this.nodeRoots.get(nodeKey);
      
      if (root) {
        root.render(
          createElement(
            StrictMode,
            null,
            this.renderElement(node.data, transform)
          )
        );
      }

      // Update connected links
      if (node.parent) {
        this.updateLink(node.parent, node);
      }
      if (node.children) {
        node.children.forEach(child => this.updateLink(node, child));
      }
    }
  }

  private updateLink(source: FlexTreeNode, target: FlexTreeNode) {
    const sourceRect = this.computeNodeRectWithSize(source.data);
    const targetRect = this.computeNodeRectWithSize(target.data);
    const options = this.stateManager.getOptions();
    
    return createElement(Path, {
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
      sourceDirection: source.data.direction,
      targetDirection: target.data.direction,
      sourceDepth: source.depth,
      animateFlag: false, // Disable animations for better performance
    });
  }


  private computeNodeRectWithSize(node: IEnhancedNode)  {
    const size = this.nodeSizes.get(node.state.key) ?? { width: 0, height: 0 };
    
    return MindMapUtils.computeRectWithSize(node.state.rect, [size.width, size.height]);
  }

  private updateViewport() {
    if (!this.svg.node()) return;

    const svgRect = this.svg.node()!.getBoundingClientRect();
    const transform = this.currentTransform || d3.zoomIdentity;

    // Calculate the visible viewport in the tree's coordinate system with padding
    const padding = 100; // Add padding to pre-render nodes just outside viewport
    this.currentViewport = {
      x: -transform.x / transform.k - padding,
      y: -transform.y / transform.k - padding,
      width: (svgRect.width / transform.k) + (padding * 2),
      height: (svgRect.height / transform.k) + (padding * 2)
    };

    // Optimize by only checking nodes that might need cleanup
    const nodesToCheck = Array.from(this.nodePositions.entries());
    for (const [key, rect] of nodesToCheck) {
      if (!this.isRectVisible(rect, this.currentViewport)) {
        this.nodePositions.delete(key);
        const root = this.nodeRoots.get(key);
        if (root) {
          root.unmount();
          this.nodeRoots.delete(key);
        }
      }
    }
  }



  private updateSpatialIndex(nodes: d3.HierarchyNode<IEnhancedNode>[]): void {
    this.spatialIndex = d3.quadtree<d3.HierarchyNode<IEnhancedNode>>()
      .x(d => d.data.state.rect.x)
      .y(d => d.data.state.rect.y)
      .addAll(nodes);
  }

  private findVisibleNodes(viewport: { x: number; y: number; width: number; height: number }): d3.HierarchyNode<IEnhancedNode>[] {
    if (!this.spatialIndex) return [];

    const visibleNodes: d3.HierarchyNode<IEnhancedNode>[] = [];
    this.spatialIndex.visit((node, x0, y0, x1, y1) => {
      // Early exit if quadtree node is outside viewport
      if (x1 < viewport.x || x0 > viewport.x + viewport.width || 
          y1 < viewport.y || y0 > viewport.y + viewport.height) {
        return true; // Skip this branch
      }
      
      // Check if this is a leaf node with data
      if ('data' in node && node.data && 'data' in node.data) {
        const hierarchyNode = node.data;
        const nodeRect = this.computeNodeRectWithSize(hierarchyNode.data);
        const expandedRect = {
          x: nodeRect.x - 20,
          y: nodeRect.y - 20,
          width: nodeRect.width + 40,
          height: nodeRect.height + 40
        };
        if (this.isRectVisible(expandedRect, viewport)) {
          visibleNodes.push(hierarchyNode);
        }
      }
      return false; // Continue traversing this branch
    });

    return visibleNodes;
  }

 

  private buildTree() {
    const options = this.stateManager.getOptions();
    return flextree({
      direction: options.direction,
      levelSpacing: options.levelSpacing,
      siblingSpacing: Math.max(options.siblingSpacing ?? 8, 8),
      nodeSize: (node: FlexTreeNode) => {
        const storedSize = this.nodeSizes.get(node.data.state.key);
        return storedSize 
          ? [storedSize.width + 8, storedSize.height + 8]
          : options.nodeSize ?? defaultOptions.nodeSize;
      },
    });
  }

  private updateNodeElement(node: d3.HierarchyNode<IEnhancedNode>, element: Element | null) {
    if(!element) return
    const transform = `translate(${node.data.state.rect.x},${node.data.state.rect.y})`;
    let root = this.nodeRoots.get(node.data.state.key);
    
    if (!root) {
      root = createRoot(element as HTMLElement);
      this.nodeRoots.set(node.data.state.key, root);
    }

    // Use React.memo or similar optimization in NodeWrapper component
    root.render(
      createElement(
        StrictMode,
        null,
        this.renderElement(node.data, transform) // Disable animations for better performance
      )
    );
  }

  private cleanupInvisibleNodes() {
    // Cleanup React roots for nodes that are no longer visible
    for (const [key, root] of this.nodeRoots.entries()) {
      const nodeElement = this.g.select(`g.node-wrapper[data-key="${key}"]`).node();
      if (!nodeElement) {
        root.unmount();
        this.nodeRoots.delete(key);
      }
    }
  }




  render(): void {
    const data = this.stateManager.getData();
    if (!data) return;

    const options = this.stateManager.getOptions();
    const initializedData = initializeNode(data, 0, options.direction);
    const tree = this.buildTree();
    const root = tree.hierarchy(initializedData);
    tree.layout(root);

    // Update spatial index with all nodes
    const treeNodes = root.descendants();
    this.updateSpatialIndex(treeNodes);

    // Get visible nodes using quadtree
    const visibleNodes = this.findVisibleNodes(this.currentViewport!);
    const visibleNodeKeys = new Set(visibleNodes.map(node => node.data.state.key));

    // Get visible links
    const visibleLinks = root.links().filter(link =>
      visibleNodeKeys.has(link.source.data.state.key) ||
      visibleNodeKeys.has(link.target.data.state.key)
    );

    // Efficient DOM updates using d3.join
    const linkContainers = this.g.selectAll('g.link-container')
      .data(visibleLinks, (d: any) => `${d.source.data.state.key}-${d.target.data.state.key}`);

    linkContainers.join(
      enter => enter.append('g')
      .attr('class', 'link-container')
      .attr('data-link', d => `${d.source.data.state.key}-${d.target.data.state.key}`)
      .each((d: any, i, elements) => {
        const linkKey = `${d.source.data.state.key}-${d.target.data.state.key}`;
        let root = this.linkRoots.get(linkKey);
        if (!root) {
        root = createRoot(elements[i] as Element);
        this.linkRoots.set(linkKey, root);
        }
        root.render(
        createElement(StrictMode, null, this.updateLink(d.source, d.target))
        );
      }),
      update => update.each((d: any, i, elements) => {
      const linkKey = `${d.source.data.state.key}-${d.target.data.state.key}`;
      let root = this.linkRoots.get(linkKey);
      if (!root) {
        root = createRoot(elements[i] as HTMLElement);
        this.linkRoots.set(linkKey, root);
      }
      root.render(
        createElement(StrictMode, null, this.updateLink(d.source, d.target))
      );
      }),
      exit => exit.each((d: any) => {
      const linkKey = `${d.source.data.state.key}-${d.target.data.state.key}`;
      const root = this.linkRoots.get(linkKey);
      if (root) {
        root.unmount();
        this.linkRoots.delete(linkKey);
      }
      }).remove()
    );

    const nodeContainers = this.g.selectAll('g.node-wrapper')
      .data(visibleNodes, (d: any) => d.data.state.key);

    nodeContainers.join(
      enter => enter.append('g')
        .attr('class', 'node-wrapper')
        .attr('data-key', d => d.data.state.key)
        .each((d: any, i, elements) => this.updateNodeElement(d, elements[i])),
      update => update.each((d: any, i, elements) => this.updateNodeElement(d, elements[i] as Element)),
      exit => exit.each((d: any) => {
        const root = this.nodeRoots.get(d.data.state.key);
        if (root) {
          root.unmount();
          this.nodeRoots.delete(d.data.state.key);
        }
      }).remove()
    );

    this.cleanupInvisibleNodes();
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

    const svgNode = this.svg.node();
    if (!svgNode) return;

    const width = svgNode.clientWidth || 800;
    const height = svgNode.clientHeight || 600;
    
    // Add padding for better visual appearance (10% of the container size)
    const padding = {
        horizontal: width * 0.1,
        vertical: height * 0.1
    };
    
    // Calculate available space considering padding
    const availableWidth = width - (padding.horizontal * 2);
    const availableHeight = height - (padding.vertical * 2);

    // Calculate scale to fit 90% of the available space
    const scale = Math.min(
        availableWidth / bounds.width,
        availableHeight / bounds.height
    ) * 0.9; // 90% of the calculated scale for some breathing room

    // Calculate translation to center the entire tree content
    const centerX = (width - bounds.width * scale) / 2 - bounds.x * scale;
    const centerY = (height - bounds.height * scale) / 2 - bounds.y * scale;

    // Create and apply the transform
    const transform = d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(scale);

    // Update current transform
    this.currentTransform = transform;

    // Apply the transform with transition
    this.svg
        .transition()
        .duration(750)
        .call(this.zoom.transform, transform)
        .on('end', () => {
            this.updateViewport();
            this.render();
        });

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

  public centerNode(node: IEnhancedNode): void {
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

  public ensureVisible(node: IEnhancedNode): void {
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

  public findElement(node: IEnhancedNode): SVGGElement | null {
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

  async toggleNode(node: IEnhancedNode, recursive: boolean): Promise<void> {
    const data = this.stateManager.getData();
    if (!data) return;

    // Use MindMapUtils.findNode to search through the entire tree
    const newNode = MindMapUtils.findNode(
      data,
      (n: IEnhancedNode) => n.state.key === node.state.key,
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

  private toggleRecursive(node: IEnhancedNode, isParent?: boolean): void {
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
    handler: (node: IEnhancedNode, event: React.MouseEvent) => void,
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

    this.linkRoots.forEach((root) => {
      root.unmount();
    });
    this.linkRoots.clear();
    
    // Clear spatial index
    this.spatialIndex = null;
  }
}
