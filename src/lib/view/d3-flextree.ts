import { hierarchy } from 'd3-hierarchy';
import {
  INode,
  FlexTreeNode,
  IFlexTreeOptions,
  Direction,
  IFlexTreeLayout,
} from './types';
import { getLayoutStrategy, ILayoutStrategy } from './layout-strategies';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

class FlexTreeLayout implements IFlexTreeLayout {
  private readonly options: IFlexTreeOptions;
  private readonly layoutStrategy: ILayoutStrategy;

  constructor(options: Partial<IFlexTreeOptions> = {}) {
    this.options = {
      children: (data) => data.children,
      nodeSize: (node) => node.data.state.size,
      spacing: 0,
      direction: Direction.LR,
      minSpacing: 4,
      levelSpacing: 10,
      siblingSpacing: 8,
      ...options,
    };
    this.layoutStrategy = getLayoutStrategy(this.options.direction ?? Direction.LR);
  }

  hierarchy(data: INode): FlexTreeNode {
    const childrenAccessor = (node: INode) => {
      if (node.payload?.fold === 1) return [];
      return this.options.children ? this.options.children(node) : [];
    };
    return hierarchy(data, childrenAccessor) as FlexTreeNode;
  }

  private getNodeRect(node: FlexTreeNode): BoundingBox {
    const MAX_NODE_HEIGHT = 360;
    const DEFAULT_SIBLING_SPACING = 40
    const size = this.options.nodeSize?.(node) ?? [0, 0];
    
    // Get the height from node state or fall back to size parameter
    const height = size[1];
    
    // Only use MAX_NODE_HEIGHT if we have no height value
    const effectiveHeight = height ? Math.min(height, MAX_NODE_HEIGHT) : MAX_NODE_HEIGHT;
    
    return {
      x: node.x,
      y: node.y,
      width: size[0],
      height: effectiveHeight + (this.options.siblingSpacing ?? DEFAULT_SIBLING_SPACING)
    };
  }

  private computeSubtreeBoundingBox(node: FlexTreeNode): BoundingBox {
    const nodeRect = this.getNodeRect(node);
    
    if (!node.children || node.children.length === 0) {
      return nodeRect;
    }

    // Get bounding boxes of all children
    const childBoxes = node.children.map(child => this.computeSubtreeBoundingBox(child));

    // Compute the union of all boxes
    const minX = Math.min(nodeRect.x, ...childBoxes.map(box => box.x));
    const minY = Math.min(nodeRect.y, ...childBoxes.map(box => box.y));
    const maxX = Math.max(nodeRect.x + nodeRect.width, ...childBoxes.map(box => box.x + box.width));
    const maxY = Math.max(nodeRect.y + nodeRect.height, ...childBoxes.map(box => box.y + box.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private computeLayoutTB(
    node: FlexTreeNode,
    currentY: number,
    parentX: number = 0
  ): { boundingBox: BoundingBox; offset: number } {
    const nodeRect = this.getNodeRect(node);
      
    // Position this node vertically
    node.y = currentY;

    if (!node.children || node.children.length === 0) {
      node.x = parentX + (nodeRect.width / 2);
      return {
        boundingBox: {
          x: node.x - nodeRect.width / 2,
          y: node.y,
          width: nodeRect.width,
          height: nodeRect.height
        },
        offset: parentX
      };
    }

    let totalChildrenWidth = 0;
    const childBoxes: BoundingBox[] = [];
    let currentChildX = parentX;

    // First pass: compute bounding boxes and set initial positions
    node.children.forEach((child, i) => {
      const childRect = this.getNodeRect(child);
      const result = this.computeLayoutTB(
        child,
        currentY + nodeRect.height + this.options.levelSpacing!,
        currentChildX
      );
      childBoxes.push(result.boundingBox);

      if (i < node.children!.length - 1) {
        const nextChildRect = this.getNodeRect(node.children![i + 1]);
        // Dynamic gap calculation based on node heights
        const gap = (childRect.height / 2) + (nextChildRect.height / 2) + this.options.minSpacing!;
        totalChildrenWidth += result.boundingBox.width + gap;
        currentChildX += result.boundingBox.width + gap;
      } else {
        totalChildrenWidth += result.boundingBox.width;
        currentChildX += result.boundingBox.width;
      }
    });

    const effectiveWidth = Math.max(nodeRect.width, totalChildrenWidth);
    node.x = parentX + (effectiveWidth / 2);

    // Compute final bounding box
    const boundingBox = {
      x: parentX,
      y: currentY,
      width: effectiveWidth,
      height: nodeRect.height + this.options.levelSpacing! + 
        Math.max(...childBoxes.map(box => box.height))
    };

    return { boundingBox, offset: parentX };
  }

  private computeLayoutLR(
    node: FlexTreeNode,
    currentX: number,
    parentY: number = 0
  ): { boundingBox: BoundingBox; offset: number } {
    const nodeRect = this.getNodeRect(node);
    
    // Position this node horizontally
    node.x = currentX;

    if (!node.children || node.children.length === 0) {
      node.y = parentY;
      return {
        boundingBox: {
          x: node.x,
          y: node.y,
          width: nodeRect.width,
          height: nodeRect.height
        },
        offset: parentY
      };
    }

    let totalChildrenHeight = 0;
    const childBoxes: BoundingBox[] = [];
    let currentChildY = parentY;

    // First pass: calculate child positions and total height
    node.children.forEach((child, i) => {
      const childRect = this.getNodeRect(child);
      
      // Add spacing between siblings, but with more reasonable values
      if (i > 0) {
        // Use a smaller base spacing and smaller proportional factor
        const spacing = Math.max(
          this.options.siblingSpacing ?? 16,  // Reduced default spacing
          childRect.height * 0.1  // Reduced to 10% of node height as minimum spacing
        );
        currentChildY += spacing;
      }

      const result = this.computeLayoutLR(
        child,
        currentX + nodeRect.width + (this.options.levelSpacing ?? 10),
        currentChildY
      );
      
      childBoxes.push(result.boundingBox);
      currentChildY += result.boundingBox.height;
      totalChildrenHeight = currentChildY - parentY;
    });

    // Center the parent node relative to its children
    node.y = parentY + (totalChildrenHeight / 2) - (nodeRect.height / 2);

    // Calculate the final bounding box
    const boundingBox = {
      x: currentX,
      y: parentY,
      width: nodeRect.width + (this.options.levelSpacing ?? 10) + 
        Math.max(...childBoxes.map(box => box.width)),
      height: Math.max(totalChildrenHeight, nodeRect.height)
    };

    return { boundingBox, offset: parentY };
  }

  layout = (root: FlexTreeNode): FlexTreeNode => {
    if (this.options.direction === Direction.CENTER) {
      return this.layoutCentered(root);
    }

    if (this.options.direction === Direction.LR || this.options.direction === Direction.RL) {
      this.computeLayoutLR(root, 0, 0);
    } else {
      this.computeLayoutTB(root, 0, 0);
    }

    // Transform coordinates and set final rect
    root.descendants().forEach((d) => {
      const size = this.options.nodeSize?.(d as FlexTreeNode) ?? [0, 0];
      const result = this.layoutStrategy.transformCoordinates(
        d.x,
        d.y,
        size,
        d as FlexTreeNode,
      );
      d.data.state.rect = {
        x: result.x,
        y: result.y,
        width: result.width,
        height: result.height,
      };
    });

    return root;
  };

  /**
   * CENTER layout: Places root at center and arranges children evenly on both sides.
   * Left children use RL layout, right children use LR layout.
   */
  private layoutCentered(root: FlexTreeNode): FlexTreeNode {
    if (!root.children) return root;

    const leftChildren = root.children.filter((_, i) => i % 2 === 0);
    const rightChildren = root.children.filter((_, i) => i % 2 === 1);

    // Center root node at (0,0)
    const rootSize = this.options.nodeSize?.(root) ?? [0, 0];
    root.data.direction = Direction.CENTER;
    root.data.state.rect = {
      x: 0,
      y: 0,
      width: rootSize[0],
      height: rootSize[1],
    };

    let leftBoundingBox: BoundingBox = { x: 0, y: 0, width: 0, height: 0 };
    let rightBoundingBox: BoundingBox = { x: 0, y: 0, width: 0, height: 0 };

    // Layout left side
    if (leftChildren.length > 0) {
      const leftRoot = this.hierarchy({
        ...root.data,
        children: leftChildren.map((c) => c.data),
      });
      const leftLayout = new FlexTreeLayout({
        ...this.options,
        direction: Direction.RL,
      });
      leftLayout.layout(leftRoot);
      leftBoundingBox = leftLayout.computeSubtreeBoundingBox(leftRoot);
      leftRoot.descendants().forEach((d) => {
        d.x -= leftBoundingBox.width + this.options.levelSpacing!;
        // Adjust y to center align with the root.
        d.y -= (leftBoundingBox.height - root.data.state.rect.height) / 2;
      });
    }

    // Layout right side
    if (rightChildren.length > 0) {
      const rightRoot = this.hierarchy({
        ...root.data,
        children: rightChildren.map((c) => c.data),
      });
      const rightLayout = new FlexTreeLayout({
        ...this.options,
        direction: Direction.LR,
      });
      rightLayout.layout(rightRoot);
      rightBoundingBox = rightLayout.computeSubtreeBoundingBox(rightRoot);
      rightRoot.descendants().forEach((d) => {
        d.x += this.options.levelSpacing!;
        // Adjust y to center align with the root.
        d.y -= (rightBoundingBox.height - root.data.state.rect.height) / 2;
      });
    }

    // Adjust root position to center the layout
    const totalWidth = leftBoundingBox.width + rightBoundingBox.width + this.options.levelSpacing!;
root.x = totalWidth / 2;

// Calculate effective heights
const leftEffectiveHeight = leftChildren.length > 0 ? leftBoundingBox.height : root.data.state.rect.height;
const rightEffectiveHeight = rightChildren.length > 0 ? rightBoundingBox.height : root.data.state.rect.height;
const effectiveHeight = Math.max(leftEffectiveHeight, rightEffectiveHeight);

root.y = (effectiveHeight / 2) - (root.data.state.rect.height / 2);

// Calculate the center of the root node.
const rootCenterY = root.y + (root.data.state.rect.height / 2);

// Now, calculate the translation offsets based on the subtree centers.
// Each subtree's center is (boundingBox.y + effectiveHeight/2)
const leftTranslateY = leftChildren.length > 0 ?
  (rootCenterY - (leftBoundingBox.y + leftEffectiveHeight / 2)) :
  (rootCenterY - (root.data.state.rect.height / 2));

const rightTranslateY = rightChildren.length > 0 ?
  (rootCenterY - (rightBoundingBox.y + rightEffectiveHeight / 2)) :
  (rootCenterY - (root.data.state.rect.height / 2));


console.log({
  effectiveHeight,
  leftTranslateY,
  rightTranslateY,
  y: root
});

    return root;
  }

  private getNodeSize(): [number, number] {
    const spacing = this.options.levelSpacing || 20;
    const siblingSpacing = this.options.siblingSpacing || 10;
    if (
      [Direction.TB, Direction.BT].includes(
        this.options.direction ?? Direction.LR,
      )
    ) {
      return [spacing, siblingSpacing * 2];
    }
    return [siblingSpacing, spacing];
  }
}

export default function flextree(
  options?: Partial<IFlexTreeOptions>,
): FlexTreeLayout {
  return new FlexTreeLayout(options);
}
