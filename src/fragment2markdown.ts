import { unified } from 'unified';
import { toMdast } from 'hast-util-to-mdast';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { u } from 'unist-builder';
import { toHast } from './fragment2hast';

const processor = unified()
  .use(
    function parse(options) {
      this.Parser = (doc, raw) => {
        return toMdast(toHast(raw), options, this.data('document'));
      };
    },
    {
      newlines: false,
      handlers: {
        oembed: (h, node) => {
          return h(
            node,
            'link',
            {
              url: node.properties.url,
            },
            [u('text', '!oembed')]
          );
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
