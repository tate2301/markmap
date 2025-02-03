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

    transformHooks.parser.tap((md) => {
      // Add custom token rule for direction markers
      md.core.ruler.before('inline', 'bidirectional', (state) => {
        for (let i = 0; i < state.tokens.length; i++) {
          const token = state.tokens[i];
          if (token.type === 'inline' && token.content) {
            // Look for direction markers [->] or [<-]
            token.content = token.content.replace(
              /\[([-><])\] /,
              (_, direction) => {
                const dir = direction === '<' ? 'left' : 'right';
                return `<span data-direction="${dir}"></span>`;
              }
            );
          }
        }
        return false;
      });
    });

    transformHooks.beforeParse.tap((_, context) => {
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