import Command from '@ckeditor/ckeditor5-core/src/command';
import Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import first from '@ckeditor/ckeditor5-utils/src/first';
import Schema from '@ckeditor/ckeditor5-engine/src/model/schema';

export class AdmonitionCommand extends Command {
  private _lastType?: string;

  refresh() {
    this.value = this._getValue();
    this.isEnabled = this._checkEnabled();
  }

  execute(options: any = {}) {
    const editor = this.editor;
    const model = editor.model;
    const schema = model.schema;
    const selection = model.document.selection;

    const blocks = Array.from(selection.getSelectedBlocks());

    const value =
      options.forceValue === undefined ? !this.value : options.forceValue;
    const type = getType(
      options,
      this._lastType,
      editor.config.get('admonition.types')[0].type
    );

    model.change((writer) => {
      if (!value) {
        this._removeAdmonition(writer, blocks.filter(findAdmonition));
      } else {
        const blocksToAdmonition = blocks.filter((block) => {
          // Already quoted blocks needs to be considered while quoting too
          // in order to reuse their <bQ> elements.
          return findAdmonition(block) || checkCanBeAdmonition(schema, block);
        });

        this._applyAdmonition(writer, blocksToAdmonition, type);
      }
    });
  }

  _getValue() {
    const selection = this.editor.model.document.selection;

    const firstBlock = first(selection.getSelectedBlocks());

    return !!(firstBlock && findAdmonition(firstBlock));
  }

  _checkEnabled() {
    if (this.value) {
      return true;
    }

    const selection = this.editor.model.document.selection;
    const schema = this.editor.model.schema;

    const firstBlock = first(selection.getSelectedBlocks());

    if (!firstBlock) {
      return false;
    }

    return checkCanBeAdmonition(schema, firstBlock);
  }

  _applyAdmonition(writer: Writer, blocks: Element[], type: string) {
    this._lastType = type;

    const admonitionsToMerge = [];

    // Quote all groups of block. Iterate in the reverse order to not break following ranges.
    getRangesOfBlockGroups(writer, blocks)
      .reverse()
      .forEach((groupRange) => {
        let quote = findAdmonition(groupRange.start);

        if (!quote) {
          quote = writer.createElement('admonition', { admonition: type });

          writer.wrap(groupRange, quote);
        } else {
          writer.setAttribute('admonition', type, quote);
        }

        admonitionsToMerge.push(quote);
      });

    admonitionsToMerge.reverse().reduce((currentAdmonition, nextAdmonition) => {
      if (currentAdmonition.nextSibling == nextAdmonition) {
        writer.merge(writer.createPositionAfter(currentAdmonition));

        return currentAdmonition;
      }

      return nextAdmonition;
    });
  }

  _removeAdmonition(writer: Writer, blocks: Element[]) {
    // Unquote all groups of block. Iterate in the reverse order to not break following ranges.
    getRangesOfBlockGroups(writer, blocks)
      .reverse()
      .forEach((groupRange) => {
        if (groupRange.start.isAtStart && groupRange.end.isAtEnd) {
          writer.unwrap(groupRange.start.parent);

          return;
        }

        // The group of blocks are at the beginning of an <bQ> so let's move them left (out of the <bQ>).
        if (groupRange.start.isAtStart) {
          const positionBefore = writer.createPositionBefore(
            groupRange.start.parent
          );

          writer.move(groupRange, positionBefore);

          return;
        }

        // The blocks are in the middle of an <bQ> so we need to split the <bQ> after the last block
        // so we move the items there.
        if (!groupRange.end.isAtEnd) {
          writer.split(groupRange.end);
        }

        // Now we are sure that groupRange.end.isAtEnd is true, so let's move the blocks right.

        const positionAfter = writer.createPositionAfter(groupRange.end.parent);

        writer.move(groupRange, positionAfter);
      });
  }
}

function findAdmonition(elementOrPosition) {
  return elementOrPosition.parent.name == 'admonition'
    ? elementOrPosition.parent
    : null;
}

function getType(
  options: {
    type?: string;
    usePreviousTypeChoice?: boolean;
  },
  lastType: string | undefined,
  defaultType: string
) {
  if (options.type) {
    return options.type;
  }

  if (options.usePreviousTypeChoice && lastType) {
    return lastType;
  }

  return defaultType;
}

function getRangesOfBlockGroups(writer, blocks) {
  let startPosition;
  let i = 0;
  const ranges = [];

  while (i < blocks.length) {
    const block = blocks[i];
    const nextBlock = blocks[i + 1];

    if (!startPosition) {
      startPosition = writer.createPositionBefore(block);
    }

    if (!nextBlock || block.nextSibling != nextBlock) {
      ranges.push(
        writer.createRange(startPosition, writer.createPositionAfter(block))
      );
      startPosition = null;
    }

    i++;
  }

  return ranges;
}

function checkCanBeAdmonition(schema: Schema, block: Element) {
  // TMP will be replaced with schema.checkWrap().
  const isAdmonitionAllowed = schema.checkChild(block.parent, 'admonition');
  const isBlockAllowedInAdmonition = schema.checkChild(
    ['$root', 'admonition'],
    block
  );

  return isAdmonitionAllowed && isBlockAllowedInAdmonition;
}
