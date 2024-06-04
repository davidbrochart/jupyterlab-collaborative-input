import {
  NotebookPanel,
  INotebookTracker,
  type CellList,
} from '@jupyterlab/notebook';
import { IObservableList } from '@jupyterlab/observables';
import { Cell, CodeCell, ICellModel } from '@jupyterlab/cells';
import { YCodeCell } from '@jupyter/ydoc';
import * as Y from 'yjs';
import { Panel, Widget } from '@lumino/widgets';
import { OutputPrompt } from '@jupyterlab/outputarea';
import { ybinding } from '@jupyterlab/codemirror';
import { StateCommand } from '@codemirror/state';
import { EditorView, KeyBinding, keymap } from '@codemirror/view';

const OUTPUT_AREA_ITEM_CLASS = 'jp-OutputArea-child';
const OUTPUT_AREA_STDIN_ITEM_CLASS = 'jp-OutputArea-stdin-item';
const OUTPUT_AREA_PROMPT_CLASS = 'jp-OutputArea-prompt';
const OUTPUT_AREA_OUTPUT_CLASS = 'jp-OutputArea-output';
const STDIN_CLASS = 'jp-Stdin';
const STDIN_PROMPT_CLASS = 'jp-Stdin-prompt';
const STDIN_INPUT_CLASS = 'jp-Stdin-input';

export const PLUGIN_NAME = 'jupyterlab-collaborative-input';

export default class CollaborativeInputWidget extends Widget {
  constructor(
    panel: NotebookPanel,
    tracker: INotebookTracker
  ) {
    super();
    this._panel = panel;
    //this._tracker = tracker;

    const cells = panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCell, this);
  }

  updateConnectedCell(
    sender: CellList,
    changed: IObservableList.IChangedArgs<ICellModel>
  ): void {
    //changed.oldValues.forEach(this._unobserveStdinOutput.bind(this));
    changed.newValues.forEach(this._observeStdinOutput.bind(this));
  }

  _observeStdinOutput(cellModel: ICellModel) {
    const codeCell = this._getCodeCell(cellModel);
    cellModel.sharedModel.changed.connect((sender: any, args: any) => { this.handleStdin(codeCell, args); });
    const youtputs = (cellModel.sharedModel as YCodeCell).ymodel.get('outputs');
    for (const youtput of youtputs) {
      if (youtput instanceof Y.Map && youtput.get('output_type') === 'stdin') {
        const prompt = youtput.get('prompt');
        const password = youtput.get('password');
        this.createInputWidget(codeCell, prompt, password, youtput);
      }
    }
  }

  handleStdin(sender: any, args: any): void {
    if (
      args.outputsChange !== undefined &&
      args.outputsChange[0].insert !== undefined
    ) {
      const newOutput = args.outputsChange[0].insert[0];
      const output_type = newOutput.get('output_type');
      if (output_type === 'stdin') {
        const prompt = newOutput.get('prompt');
        const password = newOutput.get('password');
        this.createInputWidget(sender, prompt, password, newOutput);
      }
    }
  }

  createInputWidget(
    cellModel: any,
    prompt: string,
    password: boolean,
    stdinOutput: Y.Map<any>
  ): void {
    const inputWidget = new InputWidget(
      prompt,
      password,
      stdinOutput,
      (cellModel.model.sharedModel as YCodeCell).awareness
    );
    const panel = new Panel();
    panel.addClass(OUTPUT_AREA_ITEM_CLASS);
    panel.addClass(OUTPUT_AREA_STDIN_ITEM_CLASS);
    const outputPrompt = new OutputPrompt();
    outputPrompt.addClass(OUTPUT_AREA_PROMPT_CLASS);
    panel.addWidget(outputPrompt);
    inputWidget.addClass(OUTPUT_AREA_OUTPUT_CLASS);
    panel.addWidget(inputWidget);
    cellModel.outputArea.layout.addWidget(panel);
  }

  _getCodeCell(cellModel: ICellModel): CodeCell | null {
    if (cellModel.type === 'code') {
      const cell = this._panel.content.widgets.find(
        (widget: Cell) => widget.model === cellModel
      );
      return cell as CodeCell;
    }
    return null;
  }

  private _panel: NotebookPanel;

}

class InputWidget extends Widget {
  constructor(
    prompt: string,
    password: boolean,
    stdinOutput: any,
    awareness: any
  ) {
    const node = document.createElement('div');
    const promptNode = document.createElement('pre');
    promptNode.className = STDIN_PROMPT_CLASS;
    promptNode.textContent = prompt;
    const input1 = document.createElement('div');
    input1.className = STDIN_INPUT_CLASS;
    input1.style.border = 'thin solid';
    const input2 = document.createElement('div');
    if (password === true) {
      (input2.style as any).webkitTextSecurity = 'disc';
    }
    input1.appendChild(input2);
    node.appendChild(promptNode);
    promptNode.appendChild(input1);
    const stdin = stdinOutput.get('value');
    const ybind = ybinding({ ytext: stdin });
    const submit: StateCommand = ({ state, dispatch }) => {
      stdinOutput.set('submitted', true);
      return true;
    };
    const submitWithEnter: KeyBinding = {
      key: 'Enter',
      run: submit
    };
    new EditorView({
      doc: stdin.toString(),
      extensions: [keymap.of([submitWithEnter]), ybind],
      parent: input2
    });
    super({ node });
    this.addClass(STDIN_CLASS);
  }
}
