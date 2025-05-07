import { Plugin } from 'obsidian';
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range } from "@codemirror/state";

const vetCompletions = {
	"temp" : "erature",
	"his" : "tory",
	"phy" : "iscal",
	"diag" : "nosis"
};

export default class GhostTextPlugin extends Plugin {
  onload () {
    this.registerEditorExtension([
      ghostTextExtension
    ]);
  }
}

class GhostTextPluginValue implements PluginValue {
  decorations: DecorationSet;
  constructor () {
    this.decorations = Decoration.none;
  }

  update (update: ViewUpdate) {
    //
    if (update.selectionSet || update.docChanged) {
      this.decorations = this.createDecoration(update.view)
      // completion logit here
    }
  }

  getCompletion(prefix: string) :string | null {
    for (const [trigger, completion] of Object.entries(vetCompletions)) {
      if (prefix.endsWith(trigger)) {
        return completion;
      } 
    }    
    return null
  }

  getPrefix(view: EditorView) :string {
    const pos = view.state.selection.main.head;    
    const line = view.state.doc.lineAt(pos)
    const prefix = view.state.sliceDoc(line.from, pos)
    return prefix
  }

  

  createDecoration(view: EditorView){ // should only show how
    const widgets: Range<Decoration>[] = []
    const selection = view.state.selection
    const prefix = this.getPrefix(view)
    const completion = this.getCompletion(prefix)

    // Feedback 5/7/25
    // The prefix and completion should have been declared earlier, a la LLM because
    // 1.  This implementation is calling function too often - You'd want to check whether there is a completion first before calling
    // 2.  You'd get the benefit of type checking and failing fast.  If there is no completion, you don't have to have to run this code in the first place
    // 3.  Now you run the getCompletion here, you also have the liability and responsibility of checking for things like NULL types.  Ugghh.... :(
    // 4.  Separation of concerns - you'd want your code to be modular as possible, generally, don't throw everything into one gauntlet.  It'll be very difficult to troubleshoot later on.  This includes type-safe
    // 5.  What is there is nothing to show?  You are rely on this function to handle that too.

    if (selection.ranges.length === 1){
      // push widget
      const pos = selection.main.head;
      widgets.push(
        Decoration.widget({
          widget: new CreateWidget(completion),
          side: 1
        }).range(pos)
      )
    } 
    

    return Decoration.set(widgets)
  }
}

class CreateWidget extends WidgetType {
  completion: string;
  constructor(completion:string){
    super()
    this.completion = completion;
  }
  toDOM() {
    const span = document.createElement('span');
    span.textContent = this.completion;
    span.style.color = '#888';
    span.style.opacity = '0.6';
    return span
  }
}



const ghostTextExtension = ViewPlugin.fromClass(GhostTextPluginValue, {
  decorations: v => v.decorations
})
