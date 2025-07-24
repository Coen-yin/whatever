// CodeCraft AI - Complete JavaScript Implementation
class CodeCraftAI {
    constructor() {
        this.config = {
            AI_MODEL: 'qwen/qwen3-coder:free',
            API_KEY: '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',
            BASE_URL: 'https://openrouter.ai/api/v1',
            MAX_TOKENS: 4000,
            TEMPERATURE: 0.7
        };
        
        this.currentFile = 'main.js';
        this.currentLanguage = 'javascript';
        this.files = {
            'main.js': '// Start coding with AI assistance...\n// Type your prompt in the AI chat to generate code automatically!\n\nfunction greetUser(name) {\n    console.log(`Hello, ${name}! Welcome to CodeCraft AI!`);\n}\n\ngreetUser(\'Coen-yin\');',
            'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My Project</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
            'styles.css': '/* CSS Styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: #f4f4f4;\n}\n\
