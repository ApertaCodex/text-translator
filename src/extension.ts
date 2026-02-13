import * as vscode from 'vscode';
import { StringDetector } from './stringDetector';
import { TranslationManager } from './translationManager';
import { StringTreeProvider } from './stringTreeProvider';
import { Logger } from './logger';

let extensionContext: vscode.ExtensionContext;
let stringDetector: StringDetector;
let translationManager: TranslationManager;
let stringTreeProvider: StringTreeProvider;
let logger: Logger;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	logger = new Logger();
	stringDetector = new StringDetector(logger);
	translationManager = new TranslationManager(logger);
	stringTreeProvider = new StringTreeProvider(stringDetector, logger);

	// Register tree data provider
	vscode.window.createTreeView('textTranslatorView', {
		treeDataProvider: stringTreeProvider,
		showCollapseAll: true
	});

	// Set context to show the view
	vscode.commands.executeCommand('setContext', 'textTranslator.enabled', true);

	// Register commands
	const commands = [
		vscode.commands.registerCommand('myext.translateText', async () => {
			await handleTranslateCommand();
		}),
		vscode.commands.registerCommand('myext.enhanceText', async () => {
			await handleEnhanceCommand();
		}),
		vscode.commands.registerCommand('myext.detectStrings', async () => {
			await handleDetectStringsCommand();
		}),
		vscode.commands.registerCommand('myext.openTranslationPanel', async () => {
			await handleOpenTranslationPanel();
		}),
		vscode.commands.registerCommand('myext.translateString', async (stringItem) => {
			await handleTranslateString(stringItem);
		}),
		vscode.commands.registerCommand('myext.enhanceString', async (stringItem) => {
			await handleEnhanceString(stringItem);
		})
	];

	// Register event listeners
	const listeners = [
		vscode.window.onDidChangeActiveTextEditor(() => {
			if (getConfig('autoDetectStrings')) {
				handleDetectStringsCommand();
			}
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (getConfig('autoDetectStrings') && event.document === vscode.window.activeTextEditor?.document) {
				// Debounce string detection
				clearTimeout(stringDetector.detectionTimeout);
				stringDetector.detectionTimeout = setTimeout(() => {
					handleDetectStringsCommand();
				}, 1000);
			}
		})
	];

	// Add all disposables to context
	context.subscriptions.push(...commands, ...listeners);

	// Initial string detection
	if (getConfig('autoDetectStrings') && vscode.window.activeTextEditor) {
		handleDetectStringsCommand();
	}

	logger.log('Text Translator extension activated');
}

async function handleTranslateCommand(): Promise<void> {
	try {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor found');
			return;
		}

		const selection = editor.selection;
		const text = selection.isEmpty ? '' : editor.document.getText(selection);

		if (!text.trim()) {
			vscode.window.showWarningMessage('Please select text to translate');
			return;
		}

		await translationManager.translateText(text, editor, selection);
	} catch (error) {
		logger.error('Error in translate command', error);
		vscode.window.showErrorMessage('Failed to translate text');
	}
}

async function handleEnhanceCommand(): Promise<void> {
	try {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor found');
			return;
		}

		const selection = editor.selection;
		const text = selection.isEmpty ? '' : editor.document.getText(selection);

		if (!text.trim()) {
			vscode.window.showWarningMessage('Please select text to enhance');
			return;
		}

		await translationManager.enhanceText(text, editor, selection);
	} catch (error) {
		logger.error('Error in enhance command', error);
		vscode.window.showErrorMessage('Failed to enhance text');
	}
}

async function handleDetectStringsCommand(): Promise<void> {
	try {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		await stringDetector.detectStrings(editor.document);
		stringTreeProvider.refresh();
		
		const stringCount = stringDetector.getDetectedStrings().length;
		vscode.window.showInformationMessage(`Detected ${stringCount} string(s) in the current file`);
	} catch (error) {
		logger.error('Error detecting strings', error);
		vscode.window.showErrorMessage('Failed to detect strings');
	}
}

async function handleOpenTranslationPanel(): Promise<void> {
	try {
		await vscode.commands.executeCommand('textTranslatorView.focus');
	} catch (error) {
		logger.error('Error opening translation panel', error);
	}
}

async function handleTranslateString(stringItem: any): Promise<void> {
	try {
		if (!stringItem || !stringItem.text) {
			return;
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor found');
			return;
		}

		const range = new vscode.Range(
			new vscode.Position(stringItem.line, stringItem.startChar),
			new vscode.Position(stringItem.line, stringItem.endChar)
		);

		await translationManager.translateText(stringItem.text, editor, new vscode.Selection(range.start, range.end));
	} catch (error) {
		logger.error('Error translating string item', error);
		vscode.window.showErrorMessage('Failed to translate string');
	}
}

async function handleEnhanceString(stringItem: any): Promise<void> {
	try {
		if (!stringItem || !stringItem.text) {
			return;
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor found');
			return;
		}

		const range = new vscode.Range(
			new vscode.Position(stringItem.line, stringItem.startChar),
			new vscode.Position(stringItem.line, stringItem.endChar)
		);

		await translationManager.enhanceText(stringItem.text, editor, new vscode.Selection(range.start, range.end));
	} catch (error) {
		logger.error('Error enhancing string item', error);
		vscode.window.showErrorMessage('Failed to enhance string');
	}
}

function getConfig(key: string): any {
	return vscode.workspace.getConfiguration('textTranslator').get(key);
}

export function deactivate() {
	logger?.dispose();
}