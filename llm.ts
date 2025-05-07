import { Editor, MarkdownView, Notice, Plugin, TFile } from "obsidian";
import { EditorView, ViewPlugin, ViewUpdate, PluginValue, Decoration, DecorationSet, WidgetType } from '@codemirror/view';

const vetCompletions = {
	"temp" : "erature",
	"his" : "tory",
	"phy" : "iscal",
	"diag" : "nosis"
}

 export default class GhostTextCompletionPlugin extends Plugin {
	onload(){
		this.registerEditorExtension([
			ghostTextCompletionExtension
		])
	}
}

class GhostTextCompletionExtension implements PluginValue {
	decorations: DecorationSet = Decoration.none;

	update(update: ViewUpdate){
		if (update.docChanged || update.selectionSet) {
			const prefix = this.getPrefix(update.view)
			const completion = this.getCompletion(prefix)
			if (completion) {
				this.decorations = this.createDecoration(update.view, completion)
			} else {
				this.decorations = Decoration.none
			}			
		} 		
	}

	getPrefix(view: EditorView) :string {
		const cursorPos = view.state.selection.main.head;
		const line = view.state.doc.lineAt(cursorPos);
		const prefix = view.state.sliceDoc(line.from, cursorPos);
		return prefix;
	}

	getCompletion(prefix: string) :string | null {
		for (const [trigger, completion] of Object.entries(vetCompletions)){
			if (prefix.endsWith(trigger)){
				return completion;
			}
		}
		return null;
	}

	createDecoration(view: EditorView, completion: string) {
		const widgets = [];
		const selection = view.state.selection;
		if (selection.ranges.length === 1) {
			const pos = selection.main.head;
			widgets.push(
				Decoration.widget({
					widget: new CreateWidget(completion),
					side: 1
				}).range(pos)
			)
		}
		return Decoration.set(widgets);
	}
}


class CreateWidget extends WidgetType {
	constructor(readonly completion: string){
		super();
	}
	toDOM(view: EditorView) {
		const span = document.createElement('span');
		span.textContent = this.completion
		span.style.color = '#888';
		span.style.opacity = '0.6';
		return span
	}
}

const ghostTextCompletionExtension = ViewPlugin.fromClass(GhostTextCompletionExtension, {
	decorations: v => v.decorations
})