import { hierarchy, tree as d3Tree } from 'd3-hierarchy';
import {
  INode,
  FlexTreeNode,
  IFlexTreeOptions,
  Direction,
  IFlexTreeLayout,
} from './types';
import { getLayoutStrategy, ILayoutStrategy } from './layout-strategies';

class FlexTreeLayout implements IFlexTreeLayout {
  private readonly options: IFlexTreeOptions;
  private readonly layoutStrategy: ILayoutStrategy;

  constructor(options: Partial<IFlexTreeOptions> = {}) {
    this.options = {
      children: (data) => data.children,
      nodeSize: (node) => node.data.state.size,
      spacing: 0,
      direction: Direction.LR,
      minSpacing: 5,
      levelSpacing: 20,
      siblingSpacing: 10,
      ...options,
    };
    this.layoutStrategy = getLayoutStrategy(
      this.options.direction ?? Direction.LR,
    );
  }

  hierarchy(data: INode): FlexTreeNode {
    const childrenAccessor = (node: INode) => {
      if (node.payload?.fold === 1) {
        return [];
      }
      if (!this.options.children) {
        return [];
      }
      return this.options.children(node);
    };

    return hierarchy(data, childrenAccessor) as FlexTreeNode;
  }

  layout = (root: FlexTreeNode): FlexTreeNode => {
    if (this.options.direction === Direction.CENTER) {
      return this.layoutCentered(root);
    }

    const treeLayout = d3Tree<INode>().nodeSize(
      this.layoutStrategy.getNodeSize(
        this.options.levelSpacing ?? 20,
        this.options.siblingSpacing ?? 10,
      ),
    );

    const tree = treeLayout(root);

    tree.descendants().forEach((d) => {
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

  private layoutCentered(root: FlexTreeNode): FlexTreeNode {
    if (!root.children) {
      return root;
    }

    // Split children into left and right groups based on index parity
    const leftChildren = root.children.filter((_, i) => i % 2 === 0);
    const rightChildren = root.children.filter((_, i) => i % 2 === 1);

    // Create and layout left subtree
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

      // Update original tree's left children positions
      leftChildren.forEach((child, i) => {
        const layoutedChild = leftRoot.children?.[i];
        if (layoutedChild) {
          child.data.state.rect = layoutedChild.data.state.rect;
          child.data.direction = Direction.RL; // Mark as left side node
        }
      });
    }

    // Create and layout right subtree
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

      // Update original tree's right children positions
      rightChildren.forEach((child, i) => {
        const layoutedChild = rightRoot.children?.[i];
        if (layoutedChild) {
          child.data.state.rect = layoutedChild.data.state.rect;
          child.data.direction = Direction.LR; // Mark as right side node
        }
      });
    }

    // Position root node at center
    root.data.direction = Direction.CENTER;
    root.data.state.rect = {
      x: 0,
      y: 0,
      width: root.data.state.rect.width,
      height: root.data.state.rect.height,
    };

    return root;
  }

  private getNodeSize(): [number, number] {
    const spacing = this.options.levelSpacing || 20;
    const siblingSpacing = this.options.siblingSpacing || 10;

    // For vertical layouts (TB/BT), swap the spacing values and increase sibling spacing
    if (
      [Direction.TB, Direction.BT].includes(
        this.options.direction ?? Direction.LR,
      )
    ) {
      return [spacing, siblingSpacing * 2]; // Double the vertical spacing between siblings
    }

    // For horizontal layouts (LR/RL)
    return [siblingSpacing, spacing];
  }
}

export default function flextree(
  options?: Partial<IFlexTreeOptions>,
): FlexTreeLayout {
  return new FlexTreeLayout(options);
}
