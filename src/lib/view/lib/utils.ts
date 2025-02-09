import { Direction, IEnhancedNode, Rect } from '../types';

export interface IPureNode {
  content: string;
  children?: IPureNode[];
  collapsed?: boolean;
}
export interface IPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface IMindMapTreeUtils {
  convertPureNode: (pure: IPureNode) => IEnhancedNode;
}

function initializeNode(
  node: IEnhancedNode,
  depth = 0,
  parentDirection?: Direction,
  parentNode?: IEnhancedNode,
): IEnhancedNode {
  // Initialize state if it doesn't exist
  node.state = {
    depth,
    id: Math.random(),
    size: [0, 0],
    rect: { x: 0, y: 0, width: 0, height: 0 },
    path: `${depth}`,
    key: node.state?.key ?? `node-${Math.random()}`
  };


  // Set parent reference
  node.parent = parentNode;

  if (parentDirection === Direction.CENTER) {
    if (depth === 0) {
      // Root node
      node.direction = Direction.CENTER;
    } else if (depth === 1) {
      // Split immediate children into left and right groups based on index
      const siblings = parentNode?.children || [];
      const index = siblings.indexOf(node);
      node.direction = index % 2 === 0 ? Direction.RL : Direction.LR;
    } else {
      // Grandchildren follow their parent's direction
      node.direction = parentNode?.direction ?? Direction.LR;
    }
  } else {
    node.direction = parentDirection;
  }

  if (node.children) {
    node.children = node.children.map((child) =>
      initializeNode(child, depth + 1, node.direction, node),
    );
  } else {
    node.children = [];
  }

  return node;
}

class MindMapUtils implements IMindMapTreeUtils {
  /**
   * convertPureNode: Converts legacy IPureNode data into the INode format expected by SimpleTree.
   */
  convertPureNode(pure: IPureNode): IEnhancedNode {
    return {
      content: pure.content,
      payload: {
        fold: pure.collapsed ? 1 : 0,
      },
      children: pure.children
        ? pure.children.map((child) => this.convertPureNode(child))
        : [],
      state: {
        rect: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        id: 0,
        depth: 0,
        path: '',
        key: '',
        size: [0, 0],
      },
    };
  }

  static findNode(
    data: IEnhancedNode,
    predicate: (node: IEnhancedNode) => boolean,
  ): IEnhancedNode | null {
    const search = (node: IEnhancedNode): IEnhancedNode | null => {
      if (predicate(node)) return node;
      if (node.children) {
        for (const child of node.children) {
          const result = search(child);
          if (result) return result;
        }
      }
      return null;
    };

    return data ? search(data) : null;
  }

  static createDefaultRect(): Rect {
    return {x:0, y: 0, height: 0, width: 0}
  }

  static computeRectWithSize(rect: Rect, size: [number, number]): Rect {
    return {
      x: rect.x,
      y: rect.y,
      width: size[0],
      height: size[1],
    };
  }
}



export type { IMindMapTreeUtils };
export { MindMapUtils, initializeNode };
