import { IEnhancedNode } from '../types';
import { SimpleTreeRenderer } from './renderer';
import { TreeStateManager } from './state-manager';

interface INodeHandler {
  handleNodeClick: (node: IEnhancedNode, event: React.MouseEvent) => void;
  setCustomHandler?: (
    handler: (node: IEnhancedNode, event: React.MouseEvent) => void,
  ) => void;
}

abstract class MindMapNodeHandler implements INodeHandler {
  protected customHandler?: (node: IEnhancedNode, event: React.MouseEvent) => void;

  abstract handleNodeClick: (node: IEnhancedNode, event: React.MouseEvent) => void;

  setCustomHandler(handler: (node: IEnhancedNode, event: React.MouseEvent) => void) {
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

  handleNodeClick = (node: IEnhancedNode, event: React.MouseEvent) => {
    // Execute default behavior
    if (event.metaKey) {
      this.renderer.toggleNode(node, true);
      this.renderer.updateFolds(node);
    } else {
      this.stateManager.setSelectedNode(node);
      
    }
    this.renderer.render();

    // Execute custom handler if provided
    if (this.customHandler) {
      this.customHandler(node, event);
    }
  };
}

export { MindMapNodeHandler, BasicMindMapNodeHandler };

export type { INodeHandler };
