import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { Markdown } from '../markdown';
import { GFMDataProcessor } from '../processor';
import { ClassicTestEditor } from './_utils/classictesteditor';

describe('Markdown', () => {
  test('has proper name', () => {
    expect(Markdown.pluginName).toBe('Markdown');
  });

  test('should set editor.data.processor', () => {
    return ClassicTestEditor.create('', {
      plugins: [Markdown],
    }).then((editor: ClassicEditor) => {
      expect(editor.data.processor).toBeInstanceOf(GFMDataProcessor);

      editor.destroy(); // Tests cleanup.
    });
  });
});
