import * as vscode from 'vscode';
import { StringDetector, DetectedString } from './stringDetector';
import { Logger } from './logger';

export class StringTreeProvider implements vscode.TreeDataProvider<StringItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<StringItem | undefined | null | void> = new vscode.EventEmitter<StringItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<StringItem | undefined | null | void> = this._onDidChangeTreeData.event;

	constructor(
		private stringDetector: StringDetector,
		private logger: Logger
	) {}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: StringItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: StringItem): Thenable<StringItem[]> {
		if (!element) {
			// Root level - return detected strings
			const detectedStrings = this.stringDetector.getDetectedStrings();
			return Promise.resolve(this.createStringItems(detectedStrings));
		}
		return Promise.resolve([]);
	}

	private createStringItems(detectedStrings: DetectedString[]): StringItem[] {
		return detectedStrings.map(detectedString => {
			const item = new StringItem(
				detectedString.text,
				detectedString,
				vscode.TreeItemCollapsibleState.None
			);
			
			// Set description to show line number and quote type
			item.description = `Line ${detectedString.line + 1} (${detectedString.quoteType})`;
			
			// Set tooltip with full context
			item.tooltip = `Text: "${detectedString.text}"\nLine: ${detectedString.line + 1}\nQuote Type: ${detectedString.quoteType}\nLanguage: ${detectedString.languageId}`;
			
			// Set icon
			item.iconPath = new vscode.ThemeIcon('symbol-string');
			
			// Set context value for context menus
			item.contextValue = 'stringItem';
			
			// Add command to jump to string location
			item.command = {
				command: 'vscode.open',
				title: 'Go to string',
				arguments: [
					vscode.window.activeTextEditor?.document.uri,
					{
						selection: new vscode.Range(
							new vscode.Position(detectedString.line, detectedString.startChar),
							new vscode.Position(detectedString.line, detectedString.endChar)
						)
					}
				]
			};
			
			return item;
		});
	}
}

export class StringItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly detectedString: DetectedString,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}

	// Expose detected string properties for easy access
	get text(): string {
		return this.detectedString.text;
	}

	get line(): number {
		return this.detectedString.line;
	}

	get startChar(): number {
		return this.detectedString.startChar;
	}

	get endChar(): number {
		return this.detectedString.endChar;
	}

	get quoteType(): string {
		return this.detectedString.quoteType;
	}

	get languageId(): string {
		return this.detectedString.languageId;
	}
}