import { noop } from 'markmap-common';
import { ITransformHooks } from '../../types';
import { definePlugin } from '../base';

const name = 'bidirectional';

const styles = [
  {
    type: 'style',
    data: `
      .markmap-node[data-direction="left"] {
        text-align: right;
      }
      
      .markmap-node[data-direction="left"] > g > circle {
        transform: translateX(-100%);
      }
      
      .markmap-link[data-direction="left"] path {
        transform: scaleX(-1);
        transform-origin: center;
      }
    `,
  },
];

const plugin = definePlugin({
  name,
  config: {
    styles,
  },
  transform(transformHooks: ITransformHooks) {
    let enableFeature = noop;

    // Add direction property to node data during transformation
    transformHooks.parser.tap((md) => {
      md.core.ruler.before('inline', 'bidirectional', (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
          const token = state.tokens[i];
          if (token.type === 'inline' && token.content) {
            // Look for direction markers [->] or [<-]
            const match = token.content.match(/^\[([-><])\] (.*)/);
            if (match) {
              const direction = match[1] === '<' ? 'left' : 'right';
              // Store direction in token metadata
              token.meta = token.meta || {};
              token.meta.direction = direction;
              // Remove the direction marker from content
              token.content = match[2];
            }
          }
        }
        return false;
      });
    });

    // Process direction during tree building
    transformHooks.afterParse.tap((_, context) => {
      const processNode = (
        node: any,
        parentDirection?: string,
        index?: number,
      ) => {
        // Check if node has explicit direction from markdown
        const nodeDirection = node.meta?.direction;

        // Set direction based on explicit marking or alternate if not specified
        if (nodeDirection) {
          node.direction = nodeDirection;
        } else if (parentDirection) {
          node.direction = parentDirection === 'right' ? 'left' : 'right';
        } else {
          node.direction = index % 2 === 0 ? 'right' : 'left';
        }

        // Add direction data attribute
        node.d = node.d || {};
        node.d['data-direction'] = node.direction;

        // Process children recursively
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any, idx: number) => {
            processNode(child, node.direction, idx);
          });
        }
      };

      if (context.root) {
        // Process the entire tree starting from root
        processNode(context.root);
      }

      enableFeature = () => {
        context.features[name] = true;
      };
      enableFeature();
    });

    return {
      styles: plugin.config?.styles,
    };
  },
});

export default plugin;
