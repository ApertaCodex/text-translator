import * as vscode from 'vscode';

export class Logger {
	private outputChannel: vscode.OutputChannel;

	constructor() {
		this.outputChannel = vscode.window.createOutputChannel('Text Translator');
	}

	log(message: string): void {
		const timestamp = new Date().toISOString();
		this.outputChannel.appendLine(`[${timestamp}] ${message}`);
	}

	error(message: string, error?: any): void {
		const timestamp = new Date().toISOString();
		const errorDetails = error ? ` - ${error.toString()}` : '';
		this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}${errorDetails}`);
	}

	warn(message: string): void {
		const timestamp = new Date().toISOString();
		this.outputChannel.appendLine(`[${timestamp}] WARNING: ${message}`);
	}

	show(): void {
		this.outputChannel.show();
	}

	dispose(): void {
		this.outputChannel.dispose();
	}
}