import { defaultOptions } from '../constants';
import { IMarkmapOptions, IEnhancedNode } from '../types';
import { SimpleTreeRenderer } from './renderer';

export class TreeStateManager {
  private selectedNode: IEnhancedNode | null = null;
  private currentData: IEnhancedNode | null = null;
  private options: Required<IMarkmapOptions> = defaultOptions;
  private renderer?: SimpleTreeRenderer;

  constructor() {}

  setOptions(opts: Partial<IMarkmapOptions>) {
    this.options = {
      ...this.options,
      ...opts,
    };
  }

  getOptions(): IMarkmapOptions {
    return this.options;
  }

  setRenderer(renderer: SimpleTreeRenderer) {
    this.renderer = renderer;
  }

  setSelectedNode(node: IEnhancedNode | null) {
    this.selectedNode = node;
    this.renderer?.updateHighlight();
  }

  getSelectedNode(): IEnhancedNode | null {
    return this.selectedNode;
  }

  setData(data: IEnhancedNode | null) {
    this.currentData = data;
  }

  getData(): IEnhancedNode | null {
    return this.currentData;
  }

  async toggleNode(node: IEnhancedNode, recursive: boolean): Promise<void> {
    if (recursive) {
      this.toggleRecursive(node);
    } else {
      if (node.payload) {
        node.payload.fold = node.payload.fold ? 0 : 1;
      } else {
        node.payload = { fold: 1 };
      }
    }
  }

  private toggleRecursive(node: IEnhancedNode): void {
    if (node.payload) {
      node.payload.fold = node.payload.fold ? 0 : 1;
    } else {
      node.payload = { fold: 1 };
    }
    if (node.children) {
      node.children.forEach((child) => this.toggleRecursive(child));
    }
  }
}
