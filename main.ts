import { Plugin } from 'obsidian';
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

export default class GhostTextPlugin extends Plugin {
  onload() {
    this.registerEditorExtension([
      ghostTextViewPlugin
    ]);
  }
}


class GhostTextPluginValue implements PluginValue {
  decorations : DecorationSet;
  constructor (view: EditorView) {
    this.decorations = this.createDecorations(view);
  }

  update(update: ViewUpdate ){
    if (update.selectionSet || update.docChanged) {
      this.decorations = this.createDecorations(update.view);
    }
  }

  createDecorations(view: EditorView){
    const widgets = [];
    const selection = view.state.selection;
    if (selection.ranges.length === 1){
      const pos = selection.main.head;
      widgets.push(
        Decoration.widget({
          widget: new GhostTextWidget(),
          side: 1
        }).range(pos)
      );
    }
    return Decoration.set(widgets);
  }
}

class GhostTextWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span');
    span.textContent = 'bar';
    span.style.opacity = '0.5'
    span.style.color = '#888'
    return span
  }
}
const ghostTextViewPlugin = ViewPlugin.fromClass(GhostTextPluginValue,
  {
    decorations: function(v){
      return v.decorations;
    }
  }
)