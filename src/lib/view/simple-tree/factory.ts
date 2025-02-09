import { IPureNode, MindMapUtils } from './utils';
import { SimpleTree } from '.';
import { IMarkmapOptions } from '../types';

import { defaultOptions } from '../constants';
import { TreeStateManager } from './state-manager';

export interface ID3SVGElement extends SVGElement {
  __markmap?: any;
}

export class MarkmapFactory {
  private static utils: MindMapUtils = new MindMapUtils();

  static create(
    container: HTMLElement,
    opts: Partial<IMarkmapOptions> = {},
    data?: IPureNode | null,
  ) {
    const treeOptions: IMarkmapOptions = {
      ...defaultOptions,
      ...opts,
    };

    const stateManager = new TreeStateManager();
    const simpleTree = new SimpleTree(container, treeOptions, stateManager);

    if (data) {
      const preparedData = this.utils.convertPureNode(data);
      simpleTree.setData(preparedData);
    }

    simpleTree.attachNodeEventListeners();

    return simpleTree;
  }
}
