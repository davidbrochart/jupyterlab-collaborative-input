import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import {
  INotebookTracker,
  INotebookModel,
  NotebookPanel,
} from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import CollaborativeInputWidget, { PLUGIN_NAME } from './collaborativeInputWidget';

class CollaborativeInputWidgetExtension implements DocumentRegistry.WidgetExtension {
  constructor(tracker: INotebookTracker) {
    this._tracker = tracker;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ) {
    return new CollaborativeInputWidget(panel, this._tracker);
  }

  private _tracker: INotebookTracker;
}

const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_NAME,
  autoStart: true,
  requires: [INotebookTracker, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    settingRegistry: ISettingRegistry
  ) => {
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new CollaborativeInputWidgetExtension(tracker)
    );

    // eslint-disable-next-line no-console
    console.log(`JupyterLab extension ${PLUGIN_NAME} is activated!`);
  },
};

export default extension;
