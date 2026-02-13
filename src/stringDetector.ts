import * as vscode from 'vscode';
import { Logger } from './logger';

export interface DetectedString {
	text: string;
	line: number;
	startChar: number;
	endChar: number;
	quoteType: string;
	languageId: string;
}

export class StringDetector {
	private detectedStrings: DetectedString[] = [];
	public detectionTimeout: NodeJS.Timeout | undefined;

	constructor(private logger: Logger) {}

	async detectStrings(document: vscode.TextDocument): Promise<DetectedString[]> {
		this.detectedStrings = [];
		this.logger.log(`Detecting strings in ${document.fileName}`);

		try {
			const text = document.getText();
			const lines = text.split('\n');

			for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
				const line = lines[lineIndex];
				const stringsInLine = this.extractStringsFromLine(line, lineIndex, document.languageId);
				this.detectedStrings.push(...stringsInLine);
			}

			this.logger.log(`Detected ${this.detectedStrings.length} strings`);
			return this.detectedStrings;
		} catch (error) {
			this.logger.error('Error detecting strings', error);
			return [];
		}
	}

	private extractStringsFromLine(line: string, lineIndex: number, languageId: string): DetectedString[] {
		const strings: DetectedString[] = [];
		const patterns = this.getStringPatterns(languageId);

		for (const pattern of patterns) {
			let match;
			while ((match = pattern.regex.exec(line)) !== null) {
				const fullMatch = match[0];
				const stringContent = match[1] || match[2] || match[3]; // Different capture groups for different quote types
				
				// Skip empty strings or very short strings
				if (!stringContent || stringContent.trim().length < 2) {
					continue;
				}

				// Skip strings that look like code (contain special characters)
				if (this.looksLikeCode(stringContent)) {
					continue;
				}

				strings.push({
					text: stringContent,
					line: lineIndex,
					startChar: match.index,
					endChar: match.index + fullMatch.length,
					quoteType: pattern.name,
					languageId
				});

				// Reset regex lastIndex to avoid infinite loops with global flag
				if (!pattern.regex.global) {
					break;
				}
			}
			// Reset regex for next iteration
			pattern.regex.lastIndex = 0;
		}

		return strings;
	}

	private getStringPatterns(languageId: string): Array<{name: string, regex: RegExp}> {
		const patterns = [
			// Double quotes
			{ name: 'double', regex: /"([^"\\]*(\\.[^"\\]*)*)"/g },
			// Single quotes
			{ name: 'single', regex: /'([^'\\]*(\\.[^'\\]*)*)'/g }
		];

		// Add language-specific patterns
		switch (languageId) {
			case 'javascript':
			case 'typescript':
			case 'javascriptreact':
			case 'typescriptreact':
				// Template literals
				patterns.push({ name: 'template', regex: /`([^`\\]*(\\.[^`\\]*)*)`/g });
				break;
			case 'python':
				// Triple quotes
				patterns.push({ name: 'triple-double', regex: /"""([\s\S]*?)"""/g });
				patterns.push({ name: 'triple-single', regex: /'''([\s\S]*?)'''/g });
				break;
			case 'csharp':
			case 'fsharp':
				// Verbatim strings
				patterns.push({ name: 'verbatim', regex: /@"([^"]*(?:""[^"]*)*)"/g });
				break;
			case 'php':
				// Heredoc and Nowdoc patterns could be added here
				break;
		}

		return patterns;
	}

	private looksLikeCode(text: string): boolean {
		// Skip strings that contain mostly code-like patterns
		const codePatterns = [
			/^[a-zA-Z_][a-zA-Z0-9_]*$/, // Single identifier
			/^\d+$/, // Just numbers
			/^[\w\-\.]+\.[a-zA-Z]{2,4}$/, // File extensions or URLs
			/^[#@$][\w\-]+/, // CSS selectors, variables
			/[{}\[\]();,]/, // Code punctuation
			/^\s*$/, // Empty or whitespace only
			/^[\w\s]*:\s*[\w\s]*$/, // Key-value pairs
			/^\w+\(.*\)$/, // Function calls
			/^[<>]=?|[!=]=|[&|]{2}/, // Operators
		];

		return codePatterns.some(pattern => pattern.test(text));
	}

	getDetectedStrings(): DetectedString[] {
		return this.detectedStrings;
	}

	clearDetectedStrings(): void {
		this.detectedStrings = [];
	}
}