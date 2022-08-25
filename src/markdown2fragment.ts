import { unified } from 'unified';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { gfm } from 'micromark-extension-gfm';
import { toHast, all } from 'mdast-util-to-hast';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';
import { toFragment } from './hast2fragment';

const processor = unified()
  .use(
    function parse(options) {
      this.Parser = (doc) => {
        return fromMarkdown(doc, options);
      };
    },
    {
      extensions: [
        gfm({
          singleTilde: true,
        }),
      ],
      mdastExtensions: [gfmFromMarkdown()],
    }
  )
  .use(function table() {
    return (tree) => {
      visit(tree, 'table', (table, index, parent) => {
        if (parent.type !== 'figure') {
          parent.children.splice(
            index,
            1,
            u('figure', { class: 'table' }, [
              u('text', '\n'),
              table,
              u('text', '\n'),
            ])
          );

          return [visit.SKIP, index];
        }
      });
    };
  })
  .use(function image() {
    return (tree) => {
      visit(tree, 'paragraph', (paragraph, index, parent) => {
        if (paragraph.children.length !== 1) {
          return;
        }

        let match = false;
        let target = paragraph.children[0];

        if (target.type === 'image' || target.type === 'imageReference') {
          match = true;
        }

        if (target.type === 'link') {
          if (target.children.length !== 1) {
            return;
          }

          target = target.children[0];

          if (target.type === 'image' || target.type === 'imageReference') {
            match = true;
          }
        }

        if (match) {
          parent.children.splice(
            index,
            1,
            u('figure', { class: 'image' }, [
              u('text', '\n'),
              ...paragraph.children,
              u('text', '\n'),
            ])
          );

          return [visit.SKIP, index];
        }
      });
    };
  })
  .use(function oembed() {
    return (tree) => {
      visit(tree, 'paragraph', (paragraph, index, parent) => {
        if (paragraph.children.length !== 1) {
          return;
        }

        let target = paragraph.children[0];

        if (target.type === 'link') {
          if (target.children.length !== 1) {
            return;
          }

          const url = target.url;

          target = target.children[0];

          if (target.type === 'text' && target.value === '!oembed') {
            parent.children.splice(
              index,
              1,
              u('figure', { class: 'media' }, [
                u('text', '\n'),
                u('oembed', { url }),
                u('text', '\n'),
              ])
            );

            return [visit.SKIP, index];
          }
        }
      });
    };
  })
  .use(
    function mdast2hast(options) {
      return (tree) => {
        return toHast(tree, options);
      };
    },
    {
      handlers: {
        figure: (h, node) => {
          return h(node, 'figure', { class: node.class }, all(h, node));
        },
        oembed: (h, node) => {
          return h(node, 'oembed', { url: node.url });
        },
      },
    }
  )
  .use(function stringify(options) {
    this.Compiler = (tree) => {
      return toFragment(tree, options, this.data('document'));
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
