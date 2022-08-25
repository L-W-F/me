import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import { GFMDataProcessor } from './processor';

ClassicEditor.create(document.querySelector('#editor') as HTMLElement, {
  plugins: [
    BlockQuote,
    Bold,
    Code,
    CodeBlock,
    Essentials,
    Heading,
    HeadingButtonsUI,
    HorizontalLine,
    Image,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    Italic,
    Link,
    LinkImage,
    List,
    MediaEmbed,
    Paragraph,
    ParagraphButtonUI,
    RemoveFormat,
    SourceEditing,
    Strikethrough,
    Table,
    TableToolbar,
    function MarkdownProcessor(editor: ClassicEditor) {
      editor.data.processor = new GFMDataProcessor(
        editor.data.viewDocument
      ) as any;
    },
    function DisallowNestingTables(editor) {
      editor.model.schema.addChildCheck((context, childDefinition) => {
        if (
          childDefinition.name == 'table' &&
          Array.from(context.getNames()).includes('table')
        ) {
          return false;
        }
      });
    },
  ],
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'removeFormat',
      '|',
      'paragraph',
      'heading2',
      'heading3',
      'heading4',
      '|',
      'bold',
      'italic',
      'strikethrough',
      '|',
      'horizontalLine',
      'blockQuote',
      '|',
      'bulletedList',
      'numberedList',
      'indent',
      'outdent',
      '|',
      'insertTable',
      'uploadImage',
      'mediaEmbed',
      'link',
      '|',
      'code',
      'codeBlock',
      '|',
      'sourceEditing',
    ],
  },
  codeBlock: {
    languages: [
      { language: 'c', label: 'C' },
      { language: 'cpp', label: 'C++' },
      { language: 'java', label: 'Java' },
      { language: 'js', label: 'JavaScript' },
      { language: 'json', label: 'JSON' },
    ],
  },
  heading: {
    options: [
      // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html#heading-levels
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      {
        model: 'heading2',
        view: 'h2',
        title: 'Heading 2',
        class: 'ck-heading_heading2',
      },
      {
        model: 'heading3',
        view: 'h3',
        title: 'Heading 3',
        class: 'ck-heading_heading3',
      },
      {
        model: 'heading4',
        view: 'h4',
        title: 'Heading 4',
        class: 'ck-heading_heading4',
      },
    ],
  },
  image: {
    toolbar: [
      'imageStyle:block',
      'imageStyle:inline',
      '|',
      'imageTextAlternative',
      '|',
      'linkImage',
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow'],
  },
})
  .then((editor) => {
    document.querySelector('#output').textContent = editor.getData();

    editor.model.document.on('change:data', (...args) => {
      document.querySelector('#output').textContent = editor.getData();
    });
  })
  .catch((error) => {
    console.error(error.stack);
  });
