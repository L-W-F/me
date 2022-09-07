import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { AdmonitionEditing } from './admonitionediting';
import { AdmonitionUI } from './admonitionui';

export class Admonition extends Plugin {
  static get requires() {
    return [AdmonitionEditing, AdmonitionUI];
  }

  static get pluginName() {
    return 'Admonition';
  }
}
