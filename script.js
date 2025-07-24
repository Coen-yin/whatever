/**
 * AI Code Studio Pro - Complete Working Implementation
 * A fully functional AI-powered code editor
 */

class AICodeStudio {
    constructor() {
        // Core application state
        this.files = new Map();
        this.openTabs = new Set();
        this.activeFile = null;
        this.settings = {
            theme: 'dark',
            fontSize: 14,
            autoSave: true,
            aiModel: 'qwen/qwen3-coder:free',
            temperature: 0.7,
            maxTokens: 1000
        };
        this.conversationHistory = [];
        this.isAIResponding = false;
        
        // Editor state
        this.editorPosition = { line: 1, column: 1 };
        
        // AI Configuration
        this.aiConfig = {
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            apiKey: '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',
            model: 'qwen/qwen3-coder:free',
            temperature: 0.7,
            maxTokens: 1000
        };
        
        // Initialize the application
        this.init();
    }

    // ==================== INITIALIZATION ====================
    
    async init() {
        try {
            console.log('Initializing AI Code Studio Pro...');
            
            // Show loading screen with progress
            this.showLoadingScreen();
            
            // Load user settings
            await this.loadUserSettings();
            
            // Initialize default files
            this.initializeDefaultFiles();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI components
            this.updateFileTree();
            this.initializeAIChat();
            
            // Hide loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showNotification('AI Code Studio Pro loaded successfully!', 'success');
            }, 2000);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoadingScreen();
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');
        
        if (!loadingScreen || !progressFill || !loadingText) return;
        
        const steps = [
            'Initializing AI Systems...',
            'Loading User Settings...',
            'Setting up Components...',
            'Configuring Event Listeners...',
            'Loading Default Project...',
            'Ready to Code!'
        ];
        
        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < steps.length) {
                loadingText.textContent = steps[currentStep];
                progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
                currentStep++;
            } else {
                clearInterval(stepInterval);
            }
        }, 300);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    async loadUserSettings() {
        try {
            const savedSettings = localStorage.getItem('aiCodeStudioSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            
            const savedTheme = localStorage.getItem('aiCodeStudioTheme') || 'dark';
            this.setTheme(savedTheme);
            
            // Load saved files
            const savedFiles = localStorage.getItem('aiCodeStudioFiles');
            if (savedFiles) {
                const fileData = JSON.parse(savedFiles);
                Object.entries(fileData).forEach(([path, data]) => {
                    this.files.set(path, data);
                });
            }
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
    }

    initializeDefaultFiles() {
        // Create default files if none exist
        if (this.files.size === 0) {
            this.createFile('main.js', `// Welcome to AI Code Studio Pro!
// Your intelligent coding companion

console.log('Hello, World!');

function greetUser(name) {
    return \`Welcome to AI Code Studio Pro, \${name}!\`;
}

// Try asking the AI assistant for help with:
// - Code generation and completion
// - Bug fixes and debugging  
// - Code optimization
// - Documentation and explanations

const message = greetUser('${this.getCurrentUser()}');
console.log(message);

// Start coding and let AI assist you!`, 'javascript');

            this.createFile('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My AI Code Studio Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to AI Code Studio Pro</h1>
        <p>This project was created with AI assistance!</p>
        <button onclick="showMessage()">Click Me</button>
    </div>
    <script src="main.js"></script>
</body>
</html>`, 'html');

            this.createFile('styles.css', `/* AI Code Studio Pro Project Styles */
body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

button {
    background: #0066ff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s ease;
}

button:hover {
    background: #0052cc;
}`, 'css');
        }
    }

    getCurrentUser() {
        return 'Coen-yin'; // Current user from the prompt
    }

    // ==================== FILE MANAGEMENT ====================
    
    createFile(fileName, content = '', language = 'text') {
        const fileData = {
            name: fileName,
            path: '/' + fileName,
            content: content,
            language: language,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            size: content.length,
            icon: this.getFileIcon(language),
            isFolder: false,
            isModified: false
        };
        
        this.files.set(fileData.path, fileData);
        this.saveProject();
        return fileData.path;
    }

    getFileIcon(language) {
        const icons = {
            javascript: '📄',
            html: '🌐',
            css: '🎨',
            python: '🐍',
            json: '📋',
            markdown: '📝',
            text: '📄'
        };
        return icons[language] || '📄';
    }

    openFile(filePath) {
        if (!this.files.has(filePath)) return false;
        
        const file = this.files.get(filePath);
        if (file.isFolder) return false;
        
        this.activeFile = filePath;
        this.openTabs.add(filePath);
        
        this.updateTabs();
        this.updateFileTree();
        this.loadFileContent(filePath);
        this.updateStatusBar();
        this.showEditor();
        
        return true;
    }

    loadFileContent(filePath) {
        const file = this.files.get(filePath);
        const editor = document.getElementById('codeEditor');
        const languageSelector = document.getElementById('languageSelector');
        
        if (file && editor) {
            editor.value = file.content;
            
            if (languageSelector) {
                languageSelector.value = file.language;
            }
            
            this.updateLineNumbers();
            this.updateCursorPosition();
        }
    }

    saveFile(filePath = this.activeFile) {
        if (!filePath || !this.files.has(filePath)) return false;
        
        const file = this.files.get(filePath);
        const editor = document.getElementById('codeEditor');
        
        if (editor && filePath === this.activeFile) {
            const content = editor.value;
            file.content = content;
            file.modified = new Date().toISOString();
            file.size = content.length;
            file.isModified = false;
            
            this.files.set(filePath, file);
            this.updateTabs();
            this.updateStatusBar();
            this.saveProject();
            
            this.showNotification(`File ${file.name} saved successfully`, 'success');
            return true;
        }
        
        return false;
    }

    saveProject() {
        try {
            const projectData = {
                files: Object.fromEntries(this.files),
                activeFile: this.activeFile,
                openTabs: Array.from(this.openTabs)
            };
            localStorage.setItem('aiCodeStudioFiles', JSON.stringify(Object.fromEntries(this.files)));
            localStorage.setItem('aiCodeStudioProject', JSON.stringify(projectData));
        } catch (error) {
            console.error('Error saving project:', error);
        }
    }

    // ==================== UI MANAGEMENT ====================
    
    updateFileTree() {
        const fileTree = document.getElementById('fileTree');
        if (!fileTree) return;
        
        fileTree.innerHTML = '';
        
        // Sort files
        const sortedFiles = Array.from(this.files.entries()).sort(([pathA, fileA], [pathB, fileB]) => {
            if (fileA.isFolder && !fileB.isFolder) return -1;
            if (!fileA.isFolder && fileB.isFolder) return 1;
            return fileA.name.localeCompare(fileB.name);
        });
        
        sortedFiles.forEach(([path, file]) => {
            const item = document.createElement('div');
            item.className = `file-item ${this.activeFile === path ? 'active' : ''}`;
            item.dataset.path = path;
            
            item.innerHTML = `
                <span class="file-icon">${file.icon}</span>
                <span class="file-name">${file.name}</span>
            `;
            
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openFile(path);
            });
            
            fileTree.appendChild(item);
        });
    }

    updateTabs() {
        const tabsContainer = document.getElementById('tabsContainer');
        if (!tabsContainer) return;
        
        tabsContainer.innerHTML = '';
        
        Array.from(this.openTabs).forEach(filePath => {
            const file = this.files.get(filePath);
            if (!file) return;
            
            const tab = document.createElement('button');
            tab.className = `tab ${this.activeFile === filePath ? 'active' : ''} ${file.isModified ? 'modified' : ''}`;
            tab.dataset.path = filePath;
            
            tab.innerHTML = `
                <span class="tab-icon">${file.icon}</span>
                <span class="tab-name">${file.name}</span>
                <button class="tab-close" onclick="event.stopPropagation(); codeStudio.closeTab('${filePath}')" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            tab.addEventListener('click', (e) => {
                if (e.target.closest('.tab-close')) return;
                this.openFile(filePath);
            });
            
            tabsContainer.appendChild(tab);
        });
    }

    closeTab(filePath) {
        this.openTabs.delete(filePath);
        
        if (this.activeFile === filePath) {
            const remainingTabs = Array.from(this.openTabs);
            if (remainingTabs.length > 0) {
                this.activeFile = remainingTabs[remainingTabs.length - 1];
                this.loadFileContent(this.activeFile);
            } else {
                this.activeFile = null;
                this.showWelcomeScreen();
            }
        }
        
        this.updateTabs();
        this.updateFileTree();
        this.updateStatusBar();
    }

    showEditor() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const editorWrapper = document.getElementById('codeEditorWrapper');
        
        if (welcomeScreen) welcomeScreen.classList.remove('active');
        if (editorWrapper) editorWrapper.classList.remove('hidden');
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const editorWrapper = document.getElementById('codeEditorWrapper');
        
        if (welcomeScreen) welcomeScreen.classList.add('active');
        if (editorWrapper) editorWrapper.classList.add('hidden');
    }

    updateStatusBar() {
        const filePathStatus = document.getElementById('filePathStatus');
        const languageStatus = document.getElementById('languageStatus');
        const positionStatus = document.getElementById('positionStatus');
        
        if (this.activeFile && this.files.has(this.activeFile)) {
            const file = this.files.get(this.activeFile);
            
            if (filePathStatus) {
                filePathStatus.textContent = file.path;
            }
            
            if (languageStatus) {
                const langSpan = languageStatus.querySelector('span');
                if (langSpan) {
                    langSpan.textContent = this.getLanguageDisplayName(file.language);
                }
            }
        } else {
            if (filePathStatus) {
                filePathStatus.textContent = 'Welcome to AI Code Studio Pro';
            }
        }
        
        if (positionStatus) {
            const span = positionStatus.querySelector('span');
            if (span) {
                span.textContent = `Ln ${this.editorPosition.line}, Col ${this.editorPosition.column}`;
            }
        }
    }

    getLanguageDisplayName(language) {
        const names = {
            javascript: 'JavaScript',
            html: 'HTML',
            css: 'CSS',
            python: 'Python',
            json: 'JSON',
            markdown: 'Markdown',
            text: 'Plain Text'
        };
        return names[language] || 'Plain Text';
    }

    updateLineNumbers() {
        const editor = document.getElementById('codeEditor');
        const lineNumbers = document.getElementById('lineNumbers');
        
        if (!editor || !lineNumbers) return;
        
        const lines = editor.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            const isActive = i === this.editorPosition.line;
            lineNumbersHTML += `<div class="line-number${isActive ? ' active' : ''}">${i}</div>`;
        }
        
        lineNumbers.innerHTML = lineNumbersHTML;
    }

    updateCursorPosition() {
        const editor = document.getElementById('codeEditor');
        if (!editor) return;
        
        const text = editor.value;
        const cursorPos = editor.selectionStart;
        
        const textBeforeCursor = text.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        this.editorPosition = { line, column };
        this.updateStatusBar();
        this.updateLineNumbers();
    }

    // ==================== AI INTEGRATION ====================
    
    initializeAIChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        this.addAIMessage(`👋 Hello ${this.getCurrentUser()}! I'm your AI coding assistant.

I can help you with:
• **Code Generation** - Write code from descriptions
• **Bug Detection** - Find and fix issues in your code
• **Code Review** - Analyze and improve your code
• **Documentation** - Generate comments and docs
• **Optimization** - Improve performance and readability

What would you like to work on today?`);
    }

    async sendAIMessage(message, includeContext = true) {
        if (this.isAIResponding) {
            this.showNotification('AI is already responding. Please wait.', 'warning');
            return;
        }
        
        try {
            this.isAIResponding = true;
            this.updateAIStatus('thinking');
            
            this.addUserMessage(message);
            this.showTypingIndicator();
            
            let contextMessage = message;
            if (includeContext && this.activeFile) {
                const file = this.files.get(this.activeFile);
                const editor = document.getElementById('codeEditor');
                
                if (file && editor) {
                    const currentCode = editor.value;
                    contextMessage = `File: ${file.name} (${file.language})

Current code:
\`\`\`${file.language}
${currentCode}
\`\`\`

User question: ${message}`;
                }
            }
            
            const response = await this.callAI(contextMessage);
            
            this.hideTypingIndicator();
            this.addAIMessage(response);
            
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );
            
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }
            
        } catch (error) {
            console.error('AI message error:', error);
            this.hideTypingIndicator();
            this.addAIMessage(`Sorry, I encountered an error: ${error.message}`);
            this.showNotification('AI request failed', 'error');
        } finally {
            this.isAIResponding = false;
            this.updateAIStatus('online');
        }
    }

    async callAI(message) {
        const response = await fetch(this.aiConfig.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.aiConfig.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Code Studio Pro'
            },
            body: JSON.stringify({
                model: this.aiConfig.model,
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are an expert programming assistant. Help users with coding questions, provide clean code examples, and explain programming concepts clearly. Format code blocks properly with language specification.'
                    },
                    ...this.conversationHistory.slice(-8),
                    { role: 'user', content: message }
                ],
                max_tokens: this.aiConfig.maxTokens,
                temperature: this.aiConfig.temperature,
                stream: false
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error('No response generated');
        }
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender">You</span>
                    <span class="timestamp">${this.formatTime(new Date())}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    addAIMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender">AI Assistant</span>
                    <span class="timestamp">${this.formatTime(new Date())}</span>
                </div>
                <div class="message-text">${this.formatAIResponse(message)}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    formatAIResponse(message) {
        let formatted = message.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const lang = language || 'text';
            const escapedCode = this.escapeHtml(code.trim());
            
            return `
                <div class="code-block">
                    <div class="code-block-header">
                        <span class="code-lang">${lang}</span>
                        <button class="copy-code-btn" onclick="codeStudio.copyCodeBlock(this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div class="code-content">${escapedCode}</div>
                </div>
            `;
        });
        
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-text">AI is typing</div>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        this.scrollChatToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollChatToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    updateAIStatus(status) {
        const aiStatusBar = document.getElementById('aiStatusBar');
        const statusIndicator = document.querySelector('.ai-indicator');
        
        if (aiStatusBar) {
            const statusText = aiStatusBar.querySelector('span');
            if (statusText) {
                switch (status) {
                    case 'online':
                        statusText.textContent = 'AI Ready';
                        break;
                    case 'thinking':
                        statusText.textContent = 'AI Thinking...';
                        break;
                    case 'offline':
                        statusText.textContent = 'AI Offline';
                        break;
                }
            }
        }
        
        if (statusIndicator) {
            statusIndicator.className = `ai-indicator ${status}`;
        }
    }

    copyCodeBlock(button) {
        const codeBlock = button.closest('.code-block');
        const codeContent = codeBlock.querySelector('.code-content');
        const text = codeContent.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            this.showNotification('Failed to copy code to clipboard', 'error');
        });
    }

    // ==================== EVENT LISTENERS ====================
    
    setupEventListeners() {
        // Header buttons
        this.setupHeaderEventListeners();
        
        // Activity bar
        this.setupActivityBarEventListeners();
        
        // AI Chat
        this.setupAIChatEventListeners();
        
        // Editor
        this.setupEditorEventListeners();
        
        // Modals
        this.setupModalEventListeners();
        
        // Welcome screen
        this.setupWelcomeScreenEventListeners();
        
        // Window events
        this.setupWindowEventListeners();
    }

    setupHeaderEventListeners() {
        const newProjectBtn = document.getElementById('newProjectBtn');
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        const runCodeBtn = document.getElementById('runCodeBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const themeToggle = document.getElementById('themeToggle');
        
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.createNewProject());
        }
        
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', () => this.saveFile());
        }
        
        if (runCodeBtn) {
            runCodeBtn.addEventListener('click', () => this.runCode());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setupActivityBarEventListeners() {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', () => {
                const panel = item.dataset.panel;
                this.switchPanel(panel);
                
                activityItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    setupAIChatEventListeners() {
        const sendBtn = document.getElementById('sendBtn');
        const aiInput = document.getElementById('aiInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleAIInput());
        }
        
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleAIInput();
                }
            });
            
            aiInput.addEventListener('input', () => {
                aiInput.style.height = 'auto';
                aiInput.style.height = aiInput.scrollHeight + 'px';
            });
        }
        
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    setupEditorEventListeners() {
        const editor = document.getElementById('codeEditor');
        if (!editor) return;
        
        editor.addEventListener('input', (e) => {
            this.handleEditorInput(e);
        });
        
        editor.addEventListener('keydown', (e) => {
            this.handleEditorKeydown(e);
        });
        
        editor.addEventListener('click', () => {
            this.updateCursorPosition();
        });
        
        editor.addEventListener('keyup', () => {
            this.updateCursorPosition();
        });
    }

    setupModalEventListeners() {
        const modalCloses = document.querySelectorAll('.modal-close, [data-modal]');
        modalCloses.forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = closeBtn.dataset.modal || closeBtn.closest('.modal').id;
                this.hideModal(modalId);
            });
        });
        
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            backdrop.addEventListener('click', () => {
                const modal = backdrop.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Settings modal
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettingsFromModal());
        }
        
        const temperatureRange = document.getElementById('temperatureRange');
        const temperatureDisplay = document.getElementById('temperatureDisplay');
        if (temperatureRange && temperatureDisplay) {
            temperatureRange.addEventListener('input', () => {
                temperatureDisplay.textContent = temperatureRange.value;
            });
        }
        
        // New file modal
        const newFileBtn = document.getElementById('newFileBtn');
        const createFileBtn = document.getElementById('createFileBtn');
        
        if (newFileBtn) {
            newFileBtn.addEventListener('click', () => this.showModal('newFileModal'));
        }
        
        if (createFileBtn) {
            createFileBtn.addEventListener('click', () => this.createFileFromModal());
        }
    }

    setupWelcomeScreenEventListeners() {
        const createProjectBtn = document.getElementById('createProjectBtn');
        const openExistingBtn = document.getElementById('openExistingBtn');
        
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => this.createNewProject());
        }
        
        if (openExistingBtn) {
            openExistingBtn.addEventListener('click', () => this.openExistingProject());
        }
    }

    setupWindowEventListeners() {
        // Auto-save on window unload
        window.addEventListener('beforeunload', () => {
            this.saveProject();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });
    }

    // ==================== EVENT HANDLERS ====================
    
    handleAIInput() {
        const aiInput = document.getElementById('aiInput');
        if (!aiInput) return;
        
        const message = aiInput.value.trim();
        if (!message) return;
        
        aiInput.value = '';
        aiInput.style.height = 'auto';
        
        this.sendAIMessage(message);
    }

    handleQuickAction(action) {
        const actionMessages = {
            explain: 'Please explain how this code works',
            debug: 'Please help me find and fix any bugs in this code',
            optimize: 'Please help me optimize this code for better performance',
            document: 'Please add appropriate comments and documentation to this code'
        };
        
        const message = actionMessages[action];
        if (message) {
            this.sendAIMessage(message);
        }
    }

    handleEditorInput(event) {
        if (!this.activeFile) return;
        
        const file = this.files.get(this.activeFile);
        if (file) {
            file.isModified = true;
            file.size = event.target.value.length;
            this.files.set(this.activeFile, file);
            
            this.updateTabs();
            this.updateStatusBar();
            this.updateLineNumbers();
            
            if (this.settings.autoSave) {
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.saveFile();
                }, 2000);
            }
        }
    }

    handleEditorKeydown(event) {
        const { ctrlKey, metaKey, key } = event;
        const isCtrl = ctrlKey || metaKey;
        
        if (isCtrl) {
            switch (key.toLowerCase()) {
                case 's':
                    event.preventDefault();
                    this.saveFile();
                    break;
                case 'n':
                    event.preventDefault();
                    this.showModal('newFileModal');
                    break;
            }
        }
    }

    handleGlobalKeydown(event) {
        const { ctrlKey, metaKey, shiftKey, key } = event;
        const isCtrl = ctrlKey || metaKey;
        
        if (isCtrl && shiftKey && key.toLowerCase() === 'p') {
            event.preventDefault();
            // Command palette would go here
        }
    }

    handleWindowResize() {
        // Handle responsive layout changes
        this.updateLayout();
    }

    // ==================== UTILITY METHODS ====================
    
    switchPanel(panelName) {
        const panels = document.querySelectorAll('.sidebar-panel');
        panels.forEach(panel => panel.classList.remove('active'));
        
        const targetPanel = document.getElementById(panelName + 'Panel');
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // Focus first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    createNewProject() {
        if (confirm('Create a new project? Current changes will be saved.')) {
            this.saveProject();
            this.files.clear();
            this.openTabs.clear();
            this.activeFile = null;
            this.conversationHistory = [];
            
            this.initializeDefaultFiles();
            this.updateFileTree();
            this.updateTabs();
            this.showWelcomeScreen();
            
            this.showNotification('New project created!', 'success');
        }
    }

    openExistingProject() {
        // In a real implementation, this would open a file picker
        this.showNotification('File picker not implemented in demo', 'info');
    }

    runCode() {
        if (!this.activeFile) {
            this.showNotification('No file selected to run', 'warning');
            return;
        }
        
        const file = this.files.get(this.activeFile);
        if (file.language === 'javascript') {
            try {
                const result = eval(file.content);
                console.log('Code executed:', result);
                this.showNotification('Code executed successfully! Check console for output.', 'success');
            } catch (error) {
                console.error('Execution error:', error);
                this.showNotification(`Execution error: ${error.message}`, 'error');
            }
        } else {
            this.showNotification('Code execution only supported for JavaScript files', 'info');
        }
    }

    setTheme(theme) {
        this.settings.theme = theme;
        document.body.setAttribute('data-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        localStorage.setItem('aiCodeStudioTheme', theme);
    }

    toggleTheme() {
        const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showNotification(`Switched to ${newTheme} theme`, 'success');
    }

    saveSettingsFromModal() {
        const aiModelSelect = document.getElementById('aiModelSelect');
        const temperatureRange = document.getElementById('temperatureRange');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const autoSaveCheck = document.getElementById('autoSaveCheck');
        
        if (aiModelSelect) {
            this.settings.aiModel = aiModelSelect.value;
            this.aiConfig.model = aiModelSelect.value;
        }
        
        if (temperatureRange) {
            this.settings.temperature = parseFloat(temperatureRange.value);
            this.aiConfig.temperature = parseFloat(temperatureRange.value);
        }
        
        if (fontSizeSelect) {
            this.settings.fontSize = parseInt(fontSizeSelect.value);
            const editor = document.getElementById('codeEditor');
            if (editor) {
                editor.style.fontSize = `${this.settings.fontSize}px`;
            }
        }
        
        if (autoSaveCheck) {
            this.settings.autoSave = autoSaveCheck.checked;
        }
        
        localStorage.setItem('aiCodeStudioSettings', JSON.stringify(this.settings));
        this.hideModal('settingsModal');
        this.showNotification('Settings saved successfully!', 'success');
    }

    createFileFromModal() {
        const nameInput = document.getElementById('newFileNameInput');
        const typeSelect = document.getElementById('newFileTypeSelect');
        
        if (!nameInput || !typeSelect) return;
        
        const fileName = nameInput.value.trim();
        const fileType = typeSelect.value;
        
        if (!fileName) {
            this.showNotification('Please enter a file name', 'warning');
            return;
        }
        
        const filePath = this.createFile(fileName, '', fileType);
        this.openFile(filePath);
        
        nameInput.value = '';
        this.hideModal('newFileModal');
        this.showNotification(`File ${fileName} created successfully!`, 'success');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) {
            console.log(`${type.toUpperCase()}: ${message}`);
            return;
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                    ${this.getNotificationTitle(type)}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || 'Info';
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateLayout() {
        // Handle responsive layout updates
        const mainContainer = document.querySelector('.main-container');
        if (window.innerWidth < 768 && mainContainer) {
            mainContainer.classList.add('mobile');
        } else if (mainContainer) {
            mainContainer.classList.remove('mobile');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codeStudio = new AICodeStudio();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.codeStudio) {
        window.codeStudio.showNotification('An unexpected error occurre
