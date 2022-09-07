import { Editor, Plugin } from '@ckeditor/ckeditor5-core';
import { GFMDataProcessor } from './processor';

/**
 * The GitHub Flavored Markdown (GFM) plugin.
 */
export class Markdown extends Plugin {
  constructor(editor: Editor) {
    super(editor);

    editor.data.processor = new GFMDataProcessor(editor.data.viewDocument);

    editor.model.schema.addChildCheck((context, childDefinition) => {
      if (
        childDefinition.name == 'table' &&
        Array.from(context.getNames()).includes('table')
      ) {
        return false;
      }
    });
  }

  static get pluginName() {
    return 'Markdown';
  }
}
