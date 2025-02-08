import { INode } from '../types';
import { SimpleTreeRenderer } from './renderer';
import { TreeStateManager } from './state-manager';

interface INodeHandler {
  handleNodeClick: (node: INode, event: React.MouseEvent) => void;
  setCustomHandler?: (
    handler: (node: INode, event: React.MouseEvent) => void,
  ) => void;
}

abstract class MindMapNodeHandler implements INodeHandler {
  protected customHandler?: (node: INode, event: React.MouseEvent) => void;

  abstract handleNodeClick: (node: INode, event: React.MouseEvent) => void;

  setCustomHandler(handler: (node: INode, event: React.MouseEvent) => void) {
    this.customHandler = handler;
  }
}

class BasicMindMapNodeHandler extends MindMapNodeHandler {
  constructor(
    private renderer: SimpleTreeRenderer,
    private stateManager: TreeStateManager,
  ) {
    super();
  }

  handleNodeClick = (node: INode, event: React.MouseEvent) => {
    // Execute default behavior
    if (event.metaKey) {
      this.renderer.toggleNode(node, true);
      this.renderer.updateFolds(node);
    } else {
      this.stateManager.setSelectedNode(node);
      if (!node.payload) node.payload = { fold: 0 };
      node.payload.fold = node.payload.fold ? 0 : 1;
    }
    this.renderer.updateHighlight();

    // Execute custom handler if provided
    if (this.customHandler) {
      this.customHandler(node, event);
    }
  };
}

export { MindMapNodeHandler, BasicMindMapNodeHandler };

export type { INodeHandler };
