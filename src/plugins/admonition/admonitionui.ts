import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';
import { addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import admonitionIcon from './admonition.svg';
import './admonition.css';

export class AdmonitionUI extends Plugin {
  static get pluginName() {
    return 'AdmonitionUI';
  }

  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add('admonition', (locale) => {
      const command = editor.commands.get('admonition');
      const dropdownView = createDropdown(locale, SplitButtonView);
      const splitButtonView = dropdownView.buttonView;

      splitButtonView.set({
        label: 'Insert admonition',
        tooltip: true,
        icon: admonitionIcon,
        isToggleable: true,
      });

      splitButtonView.bind('isOn').to(command, 'value', (value) => !!value);

      splitButtonView.on('execute', () => {
        editor.execute('admonition', {
          usePreviousTypeChoice: true,
        });

        editor.editing.view.focus();
      });

      dropdownView.on('execute', (evt) => {
        editor.execute('admonition', {
          type: evt.source.type,
          forceValue: true,
        });

        editor.editing.view.focus();
      });

      dropdownView.class = 'ck-admonition-dropdown';
      dropdownView.bind('isEnabled').to(command);

      addListToDropdown(dropdownView, this._getTypeListItemDefinitions());

      return dropdownView;
    });
  }

  _getTypeListItemDefinitions() {
    const editor = this.editor;
    const command = editor.commands.get('admonition');
    const typeDefs = editor.config.get('admonition.types');
    const itemDefinitions = new Collection();

    for (const { type, label } of typeDefs) {
      const definition = {
        type: 'button',
        model: new Model({
          type,
          label,
          withText: true,
        }),
      };

      definition.model.bind('isOn').to(command, 'value', (value) => {
        return value === definition.model.type;
      });

      itemDefinitions.add(definition);
    }

    return itemDefinitions;
  }
}
