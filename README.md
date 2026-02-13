# Text Translator & Enhancer

A VS Code extension that automatically detects quoted strings in your code and offers translation to other languages or text enhancement/rephrasing capabilities.

## Features

### 🔍 String Detection
- Automatically detects quoted strings in any programming language
- Supports various quote types:
  - Double quotes: `"text"`
  - Single quotes: `'text'`
  - Template literals: `` `text` `` (JavaScript/TypeScript)
  - Triple quotes: `"""text"""` (Python)
  - Verbatim strings: `@"text"` (C#)
- Smart filtering to exclude code-like strings
- Real-time detection as you type

### 🌍 Translation
- Translate selected text or detected strings to multiple languages
- Configurable target languages
- Multiple output options:
  - Replace original text
  - Insert translation as comment
  - Copy to clipboard
  - Open in new document

### ✨ Text Enhancement
- Rephrase and enhance text in various styles:
  - Formal
  - Casual
  - Concise
  - Detailed
  - Professional
  - Creative
- Same flexible output options as translation

### 🎯 Smart Interface
- Dedicated sidebar panel showing all detected strings
- Context menus for quick actions
- Keyboard shortcuts for efficient workflow
- Click on detected strings to jump to their location

## Usage

### Commands
- **Translate Text** (`Ctrl+Shift+T`): Translate selected text
- **Enhance Text** (`Ctrl+Shift+E`): Enhance/rephrase selected text
- **Detect Strings** (`Ctrl+Shift+D`): Manually detect all strings in current file

### Sidebar Panel
1. Open the "Text Translator" panel in the Explorer sidebar
2. View all detected strings in the current file
3. Click on any string to jump to its location
4. Right-click for translation and enhancement options

### Context Menus
- Right-click on selected text for translation/enhancement options
- Use the toolbar in the sidebar panel for bulk operations

## Configuration

### Target Languages
Customize the list of available translation languages:

```json
"textTranslator.targetLanguages": [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese"
]
```

### Enhancement Types
Configure available text enhancement options:

```json
"textTranslator.enhancementTypes": [
  "Formal",
  "Casual",
  "Concise",
  "Detailed",
  "Professional",
  "Creative"
]
```

### Auto-Detection
Enable/disable automatic string detection:

```json
"textTranslator.autoDetectStrings": true
```

### Inline Actions
Show/hide inline action buttons:

```json
"textTranslator.showInlineActions": true
```

## Supported Languages

The extension detects strings in all programming languages with special support for:
- JavaScript/TypeScript (including template literals)
- Python (including triple-quoted strings)
- C# (including verbatim strings)
- PHP
- And many more!

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Text Translator & Enhancer"
4. Click Install

## API Integration

**Note**: This extension currently uses mock translation and enhancement for demonstration. To use real translation services, you would need to:

1. Integrate with translation APIs (Google Translate, Azure Translator, etc.)
2. Add AI text enhancement services (OpenAI, Azure OpenAI, etc.)
3. Configure API keys in settings

## Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## License

MIT License - see LICENSE file for details.
