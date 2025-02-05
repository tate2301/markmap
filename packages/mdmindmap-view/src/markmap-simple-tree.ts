import { IPureNode, MindMapUtils } from './components/lib/utils';
import { SimpleTree } from './simple-tree';
import { IMarkmapOptions } from './types';

import { defaultOptions } from './constants';
import { TreeStateManager } from './components/lib/state-manager';

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

  private static resolveSVGElement(
    svgOrSelector: string | SVGElement | ID3SVGElement,
  ): SVGElement {
    if (typeof svgOrSelector === 'string') {
      const found = document.querySelector<SVGElement>(svgOrSelector);
      if (!found) {
        throw new Error(
          `SVG element not found for selector "${svgOrSelector}"`,
        );
      }
      return found;
    } else {
      return svgOrSelector as SVGElement;
    }
  }

  private static getContainer() {
    return document.createElement('div');
  }
}
