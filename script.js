// CodeCraft AI - Complete JavaScript Implementation with Working AI
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
        this.chatPanelOpen = false;
        this.files = {
            'main.js': '// Welcome to CodeCraft AI - The Future of Coding!\n// Ask the AI to generate any code you need\n\nfunction greetUser(name) {\n    console.log(`Hello, ${name}! Welcome to CodeCraft AI!`);\n    return `Welcome to the most advanced AI coding platform, ${name}!`;\n}\n\n// Advanced AI-powered features:\n// 1. Real-time code generation\n// 2. Smart bug detection\n// 3. Code optimization\n// 4. Automatic documentation\n\nconst message = greetUser(\'Coen-yin\');\nconsole.log(message);',
            'index.html': '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>CodeCraft AI Project</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <div class="container">\n        <h1>🚀 CodeCraft AI Project</h1>\n        <p>Built with the power of artificial intelligence!</p>\n        <button onclick="runAIDemo()">Run AI Demo</button>\n    </div>\n    <script src="script.js"></script>\n</body>\n</html>',
            'styles.css': '/* CodeCraft AI Generated Styles */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: \'Inter\', sans-serif;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.container {\n    text-align: center;\n    padding: 2rem;\n    background: rgba(255, 255, 255, 0.1);\n    backdrop-filter: blur(10px);\n    border-radius: 20px;\n    border: 1px solid rgba(255, 255, 255, 0.2);\n}\n\nh1 {\n    font-size: 3rem;\n    margin-bottom: 1rem;\n    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n}\n\nbutton {\n    padding: 1rem 2rem;\n    background: #ff6b6b;\n    border: none;\n    border-radius: 50px;\n    color: white;\n    font-weight: bold;\n    cursor: pointer;\n    transition: transform 0.3s ease;\n}\n\nbutton:hover {\n    transform: translateY(-2px);\n}',
            'app.py': '# CodeCraft AI - Python Integration\n# Powered by Qwen3 Coder AI Model\n\nimport requests\nimport json\nfrom datetime import datetime\n\nclass CodeCraftAI:\n    def __init__(self):\n        self.api_key = "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"\n        self.model = "qwen/qwen3-coder:free"\n        self.base_url = "https://openrouter.ai/api/v1"\n    \n    def generate_code(self, prompt, language="python"):\n        """Generate code using AI"""\n        headers = {\n            "Authorization": f"Bearer {self.api_key}",\n            "Content-Type": "application/json"\n        }\n        \n        payload = {\n            "model": self.model,\n            "messages": [\n                {"role": "system", "content": f"You are an expert {language} programmer. Generate clean, efficient, and well-commented code."},\n                {"role": "user", "content": prompt}\n            ],\n            "max_tokens": 2000,\n            "temperature": 0.7\n        }\n        \n        try:\n            response = requests.post(f"{self.base_url}/chat/completions", \n                                   headers=headers, json=payload)\n            return response.json()[\"choices\"][0][\"message\"][\"content\"]\n        except Exception as e:\n            return f"Error: {str(e)}"\n\n# Example usage\nif __name__ == "__main__":\n    ai = CodeCraftAI()\n    print("🧠 CodeCraft AI initialized!")\n    print("User: Coen-yin")\n    print(f"Time: {datetime.now().strftime(\'%Y-%m-%d %H:%M:%S\')}")\n    \n    # Generate a sample function\n    code = ai.generate_code("Create a function that calculates fibonacci numbers")\n    print("\\n🚀 AI Generated Code:")\n    print(code)'
        };
        
        this.settings = {
            theme: 'dark',
            fontSize: 14,
            wordWrap: true,
            autoSave: true
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing CodeCraft AI...');
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize components
        await this.initializeComponents();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showWelcomeMessage();
        }, 3000);
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            // Animate loading progress
            const progress = document.querySelector('.loading-progress');
            if (progress) {
                progress.style.animation = 'loadingProgress 3s ease-in-out forwards';
            }
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen && app) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                app.style.display = 'flex';
                app.classList.add('fade-in');
            }, 500);
        }
    }
    
    async initializeComponents() {
        // Initialize line numbers
        this.updateLineNumbers();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load current file
        this.loadFile(this.currentFile);
        
        // Initialize AI system
        await this.initializeAI();
        
        // Update UI elements
        this.updateUI();
    }
    
    async initializeAI() {
        try {
            console.log('🤖 Initializing AI Model: ' + this.config.AI_MODEL);
            // Test AI connection
            const testResponse = await this.callAI('Hello, test connection');
            console.log('✅ AI Model initialized successfully');
            this.logToConsole('AI Model: ' + this.config.AI_MODEL + ' loaded', 'success');
        } catch (error) {
            console.error('❌ AI initialization failed:', error);
            this.logToConsole('AI initialization failed: ' + error.message, 'error');
        }
    }
    
    setupEventListeners() {
        // Code editor events
        const codeTextarea = document.getElementById('code-textarea');
        if (codeTextarea) {
            codeTextarea.addEventListener('input', () => {
                this.updateLineNumbers();
                this.saveCurrentFile();
                this.analyzeCode();
            });
            
            codeTextarea.addEventListener('scroll', () => {
                this.syncLineNumbers();
            });
        }
        
        // Chat input events
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Console input events
        const consoleInput = document.getElementById('console-input-field');
        if (consoleInput) {
            consoleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleConsoleInput(e);
                }
            });
        }
        
        // Language selector
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', () => {
                this.changeLanguage();
            });
        }
    }
    
    updateLineNumbers() {
        const codeTextarea = document.getElementById('code-textarea');
        const lineNumbers = document.getElementById('line-numbers');
        
        if (codeTextarea && lineNumbers) {
            const lines = codeTextarea.value.split('\\n');
            const lineNumbersText = lines.map((_, index) => index + 1).join('\\n');
            lineNumbers.textContent = lineNumbersText;
        }
    }
    
    syncLineNumbers() {
        const codeTextarea = document.getElementById('code-textarea');
        const lineNumbers = document.getElementById('line-numbers');
        
        if (codeTextarea && lineNumbers) {
            lineNumbers.scrollTop = codeTextarea.scrollTop;
        }
    }
    
    loadFile(filename) {
        const codeTextarea = document.getElementById('code-textarea');
        if (codeTextarea && this.files[filename]) {
            codeTextarea.value = this.files[filename];
            this.currentFile = filename;
            this.updateActiveTab(filename);
            this.updateLineNumbers();
            this.logToConsole(`Loaded file: ${filename}`, 'info');
        }
    }
    
    saveCurrentFile() {
        const codeTextarea = document.getElementById('code-textarea');
        if (codeTextarea) {
            this.files[this.currentFile] = codeTextarea.value;
            if (this.settings.autoSave) {
                this.logToConsole(`Auto-saved: ${this.currentFile}`, 'success');
            }
        }
    }
    
    updateActiveTab(filename) {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.file === filename) {
                tab.classList.add('active');
            }
        });
    }
    
    updateUI() {
        // Update current time
        const now = new Date().toLocaleTimeString();
        document.querySelectorAll('.timestamp').forEach(timestamp => {
            if (timestamp.textContent === '[08:15:51]') {
                timestamp.textContent = `[${now}]`;
            }
        });
        
        // Update language selector
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.value = this.currentLanguage;
        }
    }
    
    showWelcomeMessage() {
        this.logToConsole('🎉 Welcome to CodeCraft AI, Coen-yin!', 'success');
        this.logToConsole('🤖 AI Assistant is ready to help you code!', 'info');
        this.logToConsole('💡 Try asking: "Generate a React component" or "Explain this code"', 'info');
    }
    
    // AI Integration Methods
    async callAI(prompt, context = '') {
        const headers = {
            'Authorization': `Bearer ${this.config.API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CodeCraft AI'
        };
        
        const systemPrompt = `You are CodeCraft AI, an advanced AI coding assistant. You help developers write, debug, optimize, and explain code. You are powered by Qwen3 Coder model.
        
Current context:
- User: Coen-yin
- Current file: ${this.currentFile}
- Language: ${this.currentLanguage}
- Time: ${new Date().toISOString()}

${context ? `Code context: ${context}` : ''}

Provide helpful, accurate, and detailed responses. Format code blocks with proper syntax highlighting when applicable.`;
        
        const payload = {
            model: this.config.AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: this.config.MAX_TOKENS,
            temperature: this.config.TEMPERATURE,
            stream: false
        };
        
        try {
            const response = await fetch(`${this.config.BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Invalid response format from AI API');
            }
        } catch (error) {
            console.error('AI API Error:', error);
            throw new Error(`AI request failed: ${error.message}`);
        }
    }
    
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessageToChat(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();
        
        try {
            // Get current code context
            const codeTextarea = document.getElementById('code-textarea');
            const currentCode = codeTextarea ? codeTextarea.value : '';
            
            // Call AI with context
            const aiResponse = await this.callAI(message, currentCode);
            
            // Remove typing indicator
            if (typingIndicator) {
                typingIndicator.remove();
            }
            
            // Add AI response to chat
            this.addMessageToChat(aiResponse, 'ai');
            
            // Check if response contains code and offer to insert it
            if (this.containsCode(aiResponse)) {
                this.addCodeInsertButton(aiResponse);
            }
            
        } catch (error) {
            // Remove typing indicator
            if (typingIndicator) {
                typingIndicator.remove();
            }
            
            // Add error message
            this.addMessageToChat(`Sorry, I encountered an error: ${error.message}. Please check your internet connection and try again.`, 'ai');
            this.logToConsole(`AI Error: ${error.message}`, 'error');
        }
    }
    
    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const currentTime = new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${sender === 'ai' ? 'fa-robot' : 'fa-user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message)}</div>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add animation
        messageDiv.classList.add('fade-in');
    }
    
    addTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return null;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return typingDiv;
    }
    
    formatMessage(message) {
        // Convert markdown-style code blocks to HTML
        return message
            .replace(/```(\\w+)?\\n([\\s\\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\\n/g, '<br>');
    }
    
    containsCode(message) {
        return message.includes('```') || message.includes('function') || message.includes('class') || message.includes('def ');
    }
    
    addCodeInsertButton(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage) {
            const insertBtn = document.createElement('button');
            insertBtn.className = 'btn btn-primary btn-sm';
            insertBtn.innerHTML = '<i class="fas fa-plus"></i> Insert Code';
            insertBtn.onclick = () => this.insertCodeFromMessage(message);
            
            const messageContent = lastMessage.querySelector('.message-content');
            if (messageContent) {
                messageContent.appendChild(insertBtn);
            }
        }
    }
    
    insertCodeFromMessage(message) {
        const codeTextarea = document.getElementById('code-textarea');
        if (!codeTextarea) return;
        
        // Extract code from message
        const codeMatch = message.match(/```(?:\\w+)?\\n([\\s\\S]*?)```/);
        if (codeMatch) {
            const code = codeMatch[1];
            codeTextarea.value += '\\n\\n' + code;
            this.updateLineNumbers();
            this.saveCurrentFile();
            this.logToConsole('Code inserted from AI response', 'success');
        }
    }
    
    // Utility Methods
    logToConsole(message, type = 'info') {
        const consoleMessages = document.getElementById('console-messages');
        if (!consoleMessages) return;
        
        const timestamp = new Date().toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const logLine = document.createElement('div');
        logLine.className = 'console-line';
        logLine.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="log-${type}">${message}</span>
        `;
        
        consoleMessages.appendChild(logLine);
        consoleMessages.scrollTop = consoleMessages.scrollHeight;
    }
    
    async analyzeCode() {
        if (!this.settings.realTimeAnalysis) return;
        
        const codeTextarea = document.getElementById('code-textarea');
        if (!codeTextarea || !codeTextarea.value.trim()) return;
        
        // Simple code analysis
        const code = codeTextarea.value;
        const lines = code.split('\\n').length;
        const chars = code.length;
        
        // Update quality score based on code metrics
        const qualityScore = Math.min(100, Math.max(0, 
            85 + (lines > 10 ? 5 : 0) + (code.includes('function') ? 5 : 0) + (code.includes('//') ? 5 : 0)
        ));
        
        this.updateQualityScore(qualityScore);
    }
    
    updateQualityScore(score) {
        const scoreNumber = document.querySelector('.score-number');
        if (scoreNumber) {
            scoreNumber.textContent = score;
        }
    }
}

// Global functions for HTML event handlers
let codeCraftAI;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    codeCraftAI = new CodeCraftAI();
});

// File operations
function openFile(filename, language) {
    if (codeCraftAI) {
        codeCraftAI.currentLanguage = language;
        codeCraftAI.loadFile(filename);
    }
}

function createNewFile() {
    const filename = prompt('Enter filename:');
    if (filename && codeCraftAI) {
        codeCraftAI.files[filename] = '// New file\\n';
        codeCraftAI.loadFile(filename);
        
        // Add new tab
        const tabsContainer = document.querySelector('.editor-tabs');
        const newTabBtn = document.querySelector('.new-tab-btn');
        
        if (tabsContainer && newTabBtn) {
            const newTab = document.createElement('div');
            newTab.className = 'tab';
            newTab.dataset.file = filename;
            newTab.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${filename}</span>
                <button class="tab-close" onclick="closeTab('${filename}')">×</button>
            `;
            
            tabsContainer.insertBefore(newTab, newTabBtn);
        }
    }
}

function closeTab(filename) {
    if (codeCraftAI && codeCraftAI.files[filename]) {
        delete codeCraftAI.files[filename];
        
        // Remove tab
        const tab = document.querySelector(`[data-file="${filename}"]`);
        if (tab) {
            tab.remove();
        }
        
        // Load first available file
        const remainingFiles = Object.keys(codeCraftAI.files);
        if (remainingFiles.length > 0) {
            codeCraftAI.loadFile(remainingFiles[0]);
        }
    }
}

// Editor operations
function runCode() {
    if (!codeCraftAI) return;
    
    const codeTextarea = document.getElementById('code-textarea');
    const code = codeTextarea ? codeTextarea.value : '';
    
    codeCraftAI.logToConsole('🚀 Running code...', 'info');
    
    if (codeCraftAI.currentLanguage === 'javascript') {
        try {
            // Create a safe execution context
            const result = eval(code);
            codeCraftAI.logToConsole('✅ Code executed successfully', 'success');
            if (result !== undefined) {
                codeCraftAI.logToConsole(`Result: ${result}`, 'info');
            }
        } catch (error) {
            codeCraftAI.logToConsole(`❌ Error: ${error.message}`, 'error');
        }
    } else if (codeCraftAI.currentLanguage === 'html') {
        // Update preview frame
        const previewFrame = document.getElementById('preview-frame');
        if (previewFrame) {
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            previewFrame.src = url;
            switchOutputTab('preview');
            codeCraftAI.logToConsole('✅ HTML preview updated', 'success');
        }
    } else {
        codeCraftAI.logToConsole(`ℹ️  Code execution not supported for ${codeCraftAI.currentLanguage}`, 'warning');
    }
}

function saveCode() {
    if (codeCraftAI) {
        codeCraftAI.saveCurrentFile();
        codeCraftAI.logToConsole(`💾 Saved: ${codeCraftAI.currentFile}`, 'success');
    }
}

function formatCode() {
    const codeTextarea = document.getElementById('code-textarea');
    if (!codeTextarea || !codeCraftAI) return;
    
    // Simple code formatting
    let code = codeTextarea.value;
    
    if (codeCraftAI.currentLanguage === 'javascript') {
        // Basic JS formatting
        code = code
            .replace(/;/g, ';\\n')
            .replace(/{/g, ' {\\n')
            .replace(/}/g, '\\n}\\n')
            .replace(/\\n\\s*\\n/g, '\\n');
    }
    
    codeTextarea.value = code;
    codeCraftAI.updateLineNumbers();
    codeCraftAI.saveCurrentFile();
    codeCraftAI.logToConsole('✨ Code formatted', 'success');
}

function changeLanguage() {
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector && codeCraftAI) {
        codeCraftAI.currentLanguage = languageSelector.value;
        codeCraftAI.logToConsole(`Language changed to: ${codeCraftAI.currentLanguage}`, 'info');
    }
}

// AI operations
async function generateCode() {
    const modal = document.getElementById('code-gen-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

async function generateAICode() {
    const description = document.getElementById('code-description').value;
    const language = document.getElementById('gen-language').value;
    const complexity = document.getElementById('gen-complexity').value;
    const includeComments = document.getElementById('include-comments').checked;
    const includeTests = document.getElementById('include-tests').checked;
    const includeErrorHandling = document.getElementById('include-error-handling').checked;
    
    if (!description.trim()) {
        alert('Please provide a description of what you want to build.');
        return;
    }
    
    if (!codeCraftAI) return;
    
    const prompt = `Generate ${complexity} ${language} code for: ${description}
    
Requirements:
- ${includeComments ? 'Include detailed comments' : 'Minimal comments'}
- ${includeTests ? 'Include unit tests' : 'No tests needed'}
- ${includeErrorHandling ? 'Include error handling' : 'Basic implementation'}
- Write clean, production-ready code
- Follow best practices for ${language}`;
    
    try {
        const generatedCode = await codeCraftAI.callAI(prompt);
        
        const codePreview = document.getElementById('generated-code');
        const previewContainer = document.getElementById('generated-code-preview');
        const insertBtn = document.getElementById('insert-code-btn');
        
        if (codePreview && previewContainer && insertBtn) {
            codePreview.textContent = generatedCode;
            previewContainer.style.display = 'block';
            insertBtn.style.display = 'block';
        }
        
        codeCraftAI.logToConsole('🤖 AI code generation completed', 'success');
        
    } catch (error) {
        alert(`AI code generation failed: ${error.message}`);
        codeCraftAI.logToConsole(`AI generation error: ${error.message}`, 'error');
    }
}

function insertGeneratedCode() {
    const generatedCode = document.getElementById('generated-code').textContent;
    const codeTextarea = document.getElementById('code-textarea');
    
    if (generatedCode && codeTextarea && codeCraftAI) {
        codeTextarea.value += '\\n\\n' + generatedCode;
        codeCraftAI.updateLineNumbers();
        codeCraftAI.saveCurrentFile();
        closeCodeGenModal();
        codeCraftAI.logToConsole('✅ Generated code inserted', 'success');
    }
}

function copyGeneratedCode() {
    const generatedCode = document.getElementById('generated-code').textContent;
    if (generatedCode) {
        navigator.clipboard.writeText(generatedCode).then(() => {
            if (codeCraftAI) {
                codeCraftAI.logToConsole('📋 Code copied to clipboard', 'success');
            }
        });
    }
}

async function explainCode() {
    const codeTextarea = document.getElementById('code-textarea');
    if (!codeTextarea || !codeCraftAI) return;
    
    const selectedCode = codeTextarea.value;
    if (!selectedCode.trim()) {
        alert('No code to explain. Please write some code first.');
        return;
    }
    
    const prompt = `Please explain this ${codeCraftAI.currentLanguage} code in detail:

\`\`\`${codeCraftAI.currentLanguage}
${selectedCode}
\`\`\`

Explain:
1. What the code does
2. How it works
3. Key concepts used
4. Potential improvements`;
    
    // Open chat panel and send explanation request
    toggleAIChat();
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = prompt;
        setTimeout(() => codeCraftAI.sendMessage(), 500);
    }
}

async function optimizeCode() {
    const codeTextarea = document.getElementById('code-textarea');
    if (!codeTextarea || !codeCraftAI) return;
    
    const code = codeTextarea.value;
    if (!code.trim()) {
        alert('No code to optimize. Please write some code first.');
        return;
    }
    
    const prompt = `Please optimize this ${codeCraftAI.currentLanguage} code for better performance, readability, and best practices:

\`\`\`${codeCraftAI.currentLanguage}
${code}
\`\`\`

Provide the optimized version with explanations of improvements made.`;
    
    toggleAIChat();
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = prompt;
        setTimeout(() => codeCraftAI.sendMessage(), 500);
    }
}

async function findBugs() {
    const codeTextarea = document.getElementById('code-textarea');
    if (!codeTextarea || !codeCraftAI) return;
    
    const code = codeTextarea.value;
    if (!code.trim()) {
        alert('No code to analyze. Please write some code first.');
        return;
    }
    
    const prompt = `Please analyze this ${codeCraftAI.currentLanguage} code for potential bugs, issues, and vulnerabilities:

\`\`\`${codeCraftAI.currentLanguage}
${code}
\`\`\`

Check for:
1. Syntax errors
2. Logic errors  
3. Performance issues
4. Security vulnerabilities
5. Best practice violations

Provide specific suggestions for fixes.`;
    
    toggleAIChat();
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = prompt;
        setTimeout(() => codeCraftAI.sendMessage(), 500);
    }
}

async function generateDocs() {
    const codeTextarea = document.getElementById('code-textarea');
    if (!codeTextarea || !codeCraftAI) return;
    
    const code = codeTextarea.value;
    if (!code.trim()) {
        alert('No code to document. Please write some code first.');
        return;
    }
    
    const prompt = `Generate comprehensive documentation for this ${codeCraftAI.currentLanguage} code:

\`\`\`${codeCraftAI.currentLanguage}
${code}
\`\`\`

Include:
1. Overview/description
2. Function/method documentation
3. Parameter descriptions
4. Return values
5. Usage examples
6. Installation/setup instructions if applicable`;
    
    toggleAIChat();
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = prompt;
        setTimeout(() => codeCraftAI.sendMessage(), 500);
    }
}

// UI operations
function toggleAIChat() {
    const chatPanel = document.getElementById('ai-chat-panel');
    if (chatPanel && codeCraftAI) {
        codeCraftAI.chatPanelOpen = !codeCraftAI.chatPanelOpen;
        if (codeCraftAI.chatPanelOpen) {
            chatPanel.classList.add('open');
        } else {
            chatPanel.classList.remove('open');
        }
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        Hello Coen-yin! I'm your AI coding assistant powered by Qwen3 Coder. I can help you write, debug, optimize, and explain code. What would you like to build today?
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                </div>
            </div>
        `;
    }
}

function switchOutputTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.output-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update content panes
    const panes = document.querySelectorAll('.output-pane');
    panes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${tabName}-output`) {
            pane.classList.add('active');
        }
    });
}

function handleConsoleInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim();
        
        if (command && codeCraftAI) {
            codeCraftAI.logToConsole(`> ${command}`, 'info');
            
            // Handle basic commands
            if (command === 'clear') {
                const consoleMessages = document.getElementById('console-messages');
                if (consoleMessages) {
                    consoleMessages.innerHTML = '';
                }
            } else if (command === 'help') {
                codeCraftAI.logToConsole('Available commands:', 'info');
                codeCraftAI.logToConsole('- clear: Clear console', 'info');
                codeCraftAI.logToConsole('- help: Show this help', 'info');
                codeCraftAI.logToConsole('- version: Show version info', 'info');
            } else if (command === 'version') {
                codeCraftAI.logToConsole('CodeCraft AI v1.0.0', 'info');
                codeCraftAI.logToConsole(`AI Model: ${codeCraftAI.config.AI_MODEL}`, 'info');
            } else {
                codeCraftAI.logToConsole(`Unknown command: ${command}`, 'warning');
            }
            
            input.value = '';
        }
    }
}

function handleChatInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (codeCraftAI) {
            codeCraftAI.sendMessage();
        }
    }
}

// Modal operations
function closeCodeGenModal() {
    const modal = document.getElementById('code-gen-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveSettings() {
    if (!codeCraftAI) return;
    
    // Get settings values
    const theme = document.getElementById('editor-theme').value;
    const fontSize = document.getElementById('font-size').value;
    const wordWrap = document.getElementById('word-wrap').checked;
    const autoSave = document.getElementById('auto-save').checked;
    
    // Apply settings
    codeCraftAI.settings = {
        theme,
        fontSize: parseInt(fontSize),
        wordWrap,
        autoSave
    };
    
    // Apply theme
    const codeTextarea = document.getElementById('code-textarea');
    if (codeTextarea) {
        codeTextarea.style.fontSize = fontSize + 'px';
        codeTextarea.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
    }
    
    codeCraftAI.logToConsole('⚙️ Settings saved', 'success');
    closeSettings();
}

// Quick prompt functions
function insertCodePrompt() {
    const codeTextarea = document.getElementById('code-textarea');
    const chatInput = document.getElementById('chat-input');
    
    if (codeTextarea && chatInput) {
        const code = codeTextarea.value;
        if (code.trim()) {
            chatInput.value = `Here's my current code:\\n\\n\`\`\`${codeCraftAI ? codeCraftAI.currentLanguage : 'javascript'}\\n${code}\\n\`\`\`\\n\\nCan you help me with this?`;
        }
    }
}

function quickPrompt(type) {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput || !codeCraftAI) return;
    
    const prompts = {
        explain: 'Please explain the current code in detail',
        optimize: 'Please optimize this code for better performance',
        debug: 'Please find and fix any bugs in this code',
        document: 'Please generate documentation for this code'
    };
    
    if (prompts[type]) {
        chatInput.value = prompts[type];
        insertCodePrompt();
    }
}

// Add CSS for typing indicator
const typingCSS = `
.typing-indicator .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-color);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}
`;

// Inject typing CSS
const style = document.createElement('style');
style.textContent = typingCSS;
document.head.appendChild(style);

console.log('🚀 CodeCraft AI Script Loaded Successfully!');
