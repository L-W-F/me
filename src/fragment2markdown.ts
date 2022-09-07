import { unified } from 'unified';
import { all, toMdast } from 'hast-util-to-mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { containerFlow } from 'mdast-util-to-markdown/lib/util/container-flow';
import { track } from 'mdast-util-to-markdown/lib/util/track';
import { fragment2hast } from './fragment2hast';

const processor = unified()
  .use(
    function parse(options) {
      this.Parser = (doc, raw) => {
        return toMdast(fragment2hast(raw), options, this.data('document'));
      };
    },
    {
      newlines: false,
      handlers: {
        div: (h, node) => {
          const admonition = node.properties.className?.[1]?.split('-').pop();

          if (admonition) {
            return h(
              node,
              'admonition',
              { properties: { admonition } },
              all(h, node)
            );
          }

          console.log(node);

          return all(h, node);
        },
      },
    }
  )
  .use(
    function stringify(options) {
      this.Compiler = (tree) => {
        return toMarkdown(tree, options);
      };
    },
    {
      fences: true,
      join: [
        (left, right, parent) => {
          if (parent.spread) {
            if (left.type.slice(0, 4) === 'list' && right.type !== 'text') {
              return 0;
            }
            if (left.type !== 'text' && right.type.slice(0, 4) === 'list') {
              return 0;
            }
          }
        },
      ],
      rule: '-',
      extensions: [gfmToMarkdown()],
      handlers: {
        admonition: (node, parent, context, safeOptions) => {
          const marker = ':::';
          const exit = context.enter('admonition');
          const tracker = track(safeOptions);
          let value = tracker.move(`${marker}${node.properties.admonition}\n`);
          value += tracker.move(
            containerFlow(node, context, {
              before: value,
              after: marker,
              ...safeOptions,
              ...tracker.current(),
            })
          );
          value += tracker.move(`\n${marker}`);
          exit();
          return value;
        },
      },
    }
  )
  .freeze();

/**
 * Parses ViewFragment to a markdown string.
 *
 * @param {DocumentFragment} fragment
 * @param {{ [key: string]: unknown }} options
 * @returns {String}
 */
export function fragment2markdown(fragment, options = {}) {
  return processor().data(options).processSync(fragment).toString();
}
