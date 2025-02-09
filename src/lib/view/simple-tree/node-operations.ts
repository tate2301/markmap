import { IEnhancedNode } from '../types';
import { SimpleTreeRenderer } from './renderer';
import { TreeStateManager } from './state-manager';

export interface IMindMapTreeNodeOperations {
  create: (parentNode: IEnhancedNode, content: string, position?: number) => IEnhancedNode;
  setSelected: (node: IEnhancedNode | null) => Promise<void>;
  applyCollapsing: (node: IEnhancedNode) => IEnhancedNode;
}

export abstract class MindMapTreeNodeOperations
  implements IMindMapTreeNodeOperations
{
  abstract setSelected(node: IEnhancedNode | null): Promise<void>;
  abstract applyCollapsing(node: IEnhancedNode): IEnhancedNode;
  abstract create(parentNode: IEnhancedNode, content: string, position?: number): IEnhancedNode;
}

export class BasicMindMapNodeOperations extends MindMapTreeNodeOperations {
  private stateManager: TreeStateManager;
  private renderer: SimpleTreeRenderer;

  constructor(stateManager: TreeStateManager, renderer: SimpleTreeRenderer) {
    super();
    this.stateManager = stateManager;
    this.renderer = renderer;
  }

  create(parentNode: IEnhancedNode, content: string, position?: number): IEnhancedNode {
    return this.renderer.createNode(parentNode, content, position);
  }

  async setSelected(node: IEnhancedNode | null): Promise<void> {
    this.stateManager.setSelectedNode(node || null);
    await this.renderer.render();
    this.renderer.updateHighlight();
  }

  public applyCollapsing(node: IEnhancedNode): IEnhancedNode {
    const newNode: IEnhancedNode = {
      ...node,
      children: node.children ? [...node.children] : [],
    };
    if (node.payload?.fold) {
      newNode.children = [];
    } else if (node.children) {
      newNode.children = node.children.map((child) =>
        this.applyCollapsing(child),
      );
    }
    return newNode;
  }
}
