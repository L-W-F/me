import { unified } from 'unified';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { directiveFromMarkdown } from 'mdast-util-directive';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toHast, all } from 'mdast-util-to-hast';
import { directive } from 'micromark-extension-directive';
import { gfm } from 'micromark-extension-gfm';
import { hast2fragment } from './hast2fragment';

const processor = unified()
  .use(
    function parse(options) {
      this.Parser = (doc) => {
        return fromMarkdown(doc, options);
      };
    },
    {
      extensions: [
        directive(),
        gfm({
          singleTilde: true,
        }),
      ],
      mdastExtensions: [directiveFromMarkdown, gfmFromMarkdown()],
    }
  )
  .use(
    function mdast2hast(options) {
      return (tree) => {
        return toHast(tree, options);
      };
    },
    {
      handlers: {
        containerDirective: (h, node) => {
          return h(
            node,
            'div',
            {
              className: ['admonition', `admonition-${node.name}`],
            },
            all(h, node)
          );
        },
      },
    }
  )
  .use(function stringify(options) {
    this.Compiler = (tree) => {
      return hast2fragment(tree, options, this.data('document'));
    };
  })
  .freeze();

/**
 * Parses markdown string to ViewFragment.
 *
 * @param {String} markdown
 * @returns {DocumentFragment}
 */
export function markdown2fragment(markdown, options) {
  return processor().data(options).processSync(markdown).result;
}
