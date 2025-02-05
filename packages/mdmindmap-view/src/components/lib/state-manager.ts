import { defaultOptions } from '../../constants';
import { IMarkmapOptions, IMarkmapState, INode } from '../../types';
import { SimpleTreeRenderer } from '../../components/lib/renderer';

export class TreeStateManager {
  private state: IMarkmapState = {};
  private selectedNode: INode | null = null;
  private currentData: INode | null = null;
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

  setSelectedNode(node: INode | null) {
    this.selectedNode = node;
    this.renderer?.updateHighlight();
  }

  getSelectedNode(): INode | null {
    return this.selectedNode;
  }

  setData(data: INode | null) {
    this.currentData = data;
  }

  getData(): INode | null {
    return this.currentData;
  }

  async toggleNode(node: INode, recursive: boolean): Promise<void> {
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

  private toggleRecursive(node: INode): void {
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
