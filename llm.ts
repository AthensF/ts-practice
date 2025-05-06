import { Plugin } from 'obsidian';
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";

export default class GhostTextPlugin extends Plugin {
  async onload() {
    console.log('Loading GhostText Plugin');    
    this.registerEditorExtension([
      ghostTextViewPlugin
    ]);
  }
}

// Define a proper named class that implements PluginValue
class GhostTextPluginView implements PluginValue {
  decorations: DecorationSet;
  
  constructor(view: EditorView) {
    this.decorations = this.createDecorations(view);
  }
  
  update(update: ViewUpdate) {
    if (update.selectionSet || update.docChanged) {
      this.decorations = this.createDecorations(update.view);
    }
  }
  
  createDecorations(view: EditorView) {
    const widgets = [];
    const selection = view.state.selection;    
    if (selection.ranges.length === 1) {
      const pos = selection.main.head;
      widgets.push(
        Decoration.widget({
          widget: new GhostTextWidget(),
          side: 1 // After cursor
        }).range(pos)
      );
    }    
    return Decoration.set(widgets); // Convert to a DecorationSet
  }
}

// Create the ViewPlugin using the named class
const ghostTextViewPlugin = ViewPlugin.fromClass(GhostTextPluginView, {
  decorations: v => v.decorations
});

class GhostTextWidget extends WidgetType {
  toDOM() {
    const span = document.createElement("span");
    span.textContent = "bar";
    span.className = "cm-ghost-text";
    span.style.opacity = "0.4";
    span.style.color = "#888";
    return span;
  }
}