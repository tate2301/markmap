import { INode } from '../types';
import { SimpleTreeRenderer } from './renderer';
import { TreeStateManager } from './state-manager';

export interface IMindMapTreeNodeOperations {
  create: (parentNode: INode, content: string, position?: number) => INode;
  setSelected: (node: INode | null) => Promise<void>;
  applyCollapsing: (node: INode) => INode;
}

export abstract class MindMapTreeNodeOperations
  implements IMindMapTreeNodeOperations
{
  abstract setSelected(node: INode | null): Promise<void>;
  abstract applyCollapsing(node: INode): INode;
  abstract create(parentNode: INode, content: string, position?: number): INode;
}

export class BasicMindMapNodeOperations extends MindMapTreeNodeOperations {
  private stateManager: TreeStateManager;
  private renderer: SimpleTreeRenderer;

  constructor(stateManager: TreeStateManager, renderer: SimpleTreeRenderer) {
    super();
    this.stateManager = stateManager;
    this.renderer = renderer;
  }

  create(parentNode: INode, content: string, position?: number): INode {
    return this.renderer.createNode(parentNode, content, position);
  }

  async setSelected(node: INode | null): Promise<void> {
    this.stateManager.setSelectedNode(node || null);
    await this.renderer.render();
    this.renderer.updateNodes();
    this.renderer.updateHighlight();
  }

  public applyCollapsing(node: INode): INode {
    const newNode: INode = {
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
