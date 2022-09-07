import { Plugin } from '@ckeditor/ckeditor5-core';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { Delete } from '@ckeditor/ckeditor5-typing';
import { AdmonitionCommand } from './admonitioncommand';

export class AdmonitionEditing extends Plugin {
  static get pluginName() {
    return 'AdmonitionEditing';
  }

  static get requires() {
    return [Enter, Delete];
  }

  constructor(editor) {
    super(editor);

    editor.config.define('admonition', {
      types: [
        { type: 'note', label: 'Note' },
        { type: 'tip', label: 'Tip' },
        { type: 'warning', label: 'Warning' },
        { type: 'caution', label: 'Caution' },
        { type: 'important', label: 'Important' },
      ],
    });
  }

  init() {
    const editor = this.editor;
    const schema = editor.model.schema;

    // The main command.
    editor.commands.add('admonition', new AdmonitionCommand(editor));

    schema.register('admonition', {
      inheritAllFrom: '$container',
      allowAttributes: ['admonition'],
    });

    editor.conversion.for('downcast').elementToElement({
      model: 'admonition',
      view: 'div',
    });

    editor.conversion.for('downcast').attributeToAttribute({
      model: 'admonition',
      view: (admonition) => ({
        key: 'class',
        value: `admonition admonition-${admonition}`,
      }),
    });

    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'div',
        // classes: /admonition/,
      },
      model: (viewElement, { writer }) => {
        const admonition = Array.from(viewElement.getClassNames())
          ?.pop()
          ?.split('-')
          .pop();
        console.log(admonition);
        return writer.createElement('admonition', {
          admonition,
        });
      },
    });

    // Postfixer which cleans incorrect model states connected with admonitions.
    editor.model.document.registerPostFixer((writer) => {
      const changes = editor.model.document.differ.getChanges();

      for (const entry of changes) {
        if (entry.type == 'insert') {
          const element = entry.position.nodeAfter;

          if (!element) {
            // We are inside a text node.
            continue;
          }

          if (element.is('element', 'admonition') && element.isEmpty) {
            // Added an empty admonition - remove it.
            writer.remove(element);

            return true;
          } else if (
            element.is('element', 'admonition') &&
            !schema.checkChild(entry.position, element)
          ) {
            // Added a admonition in incorrect place. Unwrap it so the content inside is not lost.
            writer.unwrap(element);

            return true;
          } else if (element.is('element')) {
            // Just added an element. Check that all children meet the scheme rules.
            const range = writer.createRangeIn(element);

            for (const child of range.getItems()) {
              if (
                child.is('element', 'admonition') &&
                !schema.checkChild(writer.createPositionBefore(child), child)
              ) {
                writer.unwrap(child);

                return true;
              }
            }
          }
        } else if (entry.type == 'remove') {
          const parent = entry.position.parent;

          if (parent.is('element', 'admonition') && parent.isEmpty) {
            // Something got removed and now admonition is empty. Remove the admonition as well.
            writer.remove(parent);

            return true;
          }
        }
      }

      return false;
    });

    const viewDocument = this.editor.editing.view.document;
    const selection = editor.model.document.selection;
    const admonitionCommand = editor.commands.get('admonition');

    // Overwrite default Enter key behavior.
    // If Enter key is pressed with selection collapsed in empty block inside a quote, break the quote.
    this.listenTo(
      viewDocument,
      'enter',
      (evt, data) => {
        if (!selection.isCollapsed || !admonitionCommand.value) {
          return;
        }

        const { parent: positionParent } = selection.getLastPosition()!;

        if (positionParent.isEmpty) {
          editor.execute('admonition');
          editor.editing.view.scrollToTheSelection();

          data.preventDefault();
          evt.stop();
        }
      },
      { context: 'div' }
    );

    // Overwrite default Backspace key behavior.
    // If Backspace key is pressed with selection collapsed in first empty block inside a quote, break the quote.
    this.listenTo(
      viewDocument,
      'delete',
      (evt, data) => {
        if (
          data.direction !== 'backward' ||
          !selection.isCollapsed ||
          !admonitionCommand.value
        ) {
          return;
        }

        const { parent: positionParent } = selection.getLastPosition()!;

        if (positionParent.isEmpty && !positionParent.previousSibling) {
          editor.execute('admonition');
          editor.editing.view.scrollToTheSelection();

          data.preventDefault();
          evt.stop();
        }
      },
      { context: 'div' }
    );
  }
}
