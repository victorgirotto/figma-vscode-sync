import * as vscode from 'vscode';
import * as path from 'path';
import { FigmaComponents } from './figma-components';
import { CurrentFileUtil } from './util/current-file-util';

export class FigmaLayerProvider implements vscode.TreeDataProvider<FigmaLayer> {
    
    // onDidChangeTreeData?: vscode.Event<FigmaLayer | null | undefined> | undefined;    
    private changeTreeDataEmitter: vscode.EventEmitter<FigmaLayer> = new vscode.EventEmitter<FigmaLayer>();
	readonly onDidChangeTreeData: vscode.Event<FigmaLayer> = this.changeTreeDataEmitter.event;

    components: FigmaComponents | undefined;

    constructor(components?: FigmaComponents){
        this.components = components;
    }

    refresh(layer?: FigmaLayer){
        this.changeTreeDataEmitter.fire(layer);
    }

    getTreeItem(element: FigmaLayer): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FigmaLayer | undefined): vscode.ProviderResult<FigmaLayer[]> {
        // Check if there are components to be displayed
        if(this.components){
            // There are components. Add them.
            // Create mapping function
            let toTreeItem = (component:any)=>{
                let collapsibleState;
                if(['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE'].includes(component.type)){
                    collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                } else {
                    collapsibleState = vscode.TreeItemCollapsibleState.None;
                }
                return new FigmaLayer(component, component.name, collapsibleState, component.type);
            };
    
            // Map the element's children
            let nodes = this.components.components;
            if(element){
                nodes = element.node.children;
            }
            let items: FigmaLayer[] = [];
            if(nodes){
                // Map the nodes to tree items
                items = nodes.map(c => toTreeItem(c));
            }
            return Promise.resolve(items);
        } else {
            // There are no components. Check if file type is correct.
            if(CurrentFileUtil.isFileLanguageID('less')){
                // This is a less file.

            } else {
                // This is not a less file. 

            }
        }
    }    
}

export class FigmaLayer extends vscode.TreeItem {

    selector: string;

    constructor(
        public node: any,
		public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public type: string,
		public readonly command?: vscode.Command
	) {
        super(label, collapsibleState);
        this.id = node.id;
        this.contextValue = this.type;
        this.selector = '';
    }
    
    get tooltip(): string {
        return this.id ? this.id : '';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'media', 'sidebar', `${this.type}.svg`),
		dark: path.join(__filename, '..', '..', 'media', 'sidebar', `${this.type}.svg`)
    };

    setLink(selector: string){
        this.selector = selector;
    }

}