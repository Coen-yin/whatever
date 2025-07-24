/**
 * AI Code Studio Pro - Complete JavaScript Implementation
 * A fully functional AI-powered code editor with extensive features
 */

class AICodeStudio {
    constructor() {
        // Core application state
        this.files = new Map();
        this.openTabs = new Set();
        this.activeFile = null;
        this.settings = this.getDefaultSettings();
        this.conversationHistory = [];
        this.undoStack = [];
        this.redoStack = [];
        this.searchResults = [];
        this.projectTemplates = this.getProjectTemplates();
        this.extensions = new Map();
        this.keybindings = this.getDefaultKeybindings();
        this.themes = this.getAvailableThemes();
        this.languages = this.getSupportedLanguages();
        
        // UI state
        this.currentTheme = 'dark';
        this.sidebarCollapsed = false;
        this.rightPanelCollapsed = false;
        this.activePanel = 'explorer';
        this.activeRightPanel = 'ai';
        this.zenMode = false;
        this.isAIResponding = false;
        
        // Editor state
        this.editorContent = '';
        this.editorPosition = { line: 1, column: 1 };
        this.selection = null;
        this.wordWrap = false;
        this.miniMapVisible = true;
        this.lineNumbersVisible = true;
        
        // AI Configuration
        this.aiConfig = {
            endpoint: 'https://openrouter.ai/api/v1/chat/completions',
            apiKey: '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',
            model: 'qwen/qwen3-coder:free',
            temperature: 0.7,
            maxTokens: 1000,
            systemPrompt: 'You are an expert programming assistant. Help users with coding questions, provide clean code examples, and explain programming concepts clearly.'
        };
        
        // Performance monitoring
        this.performance = {
            startTime: Date.now(),
            metrics: new Map()
        };
        
        // Initialize the application
        this.init();
    }

    // ==================== INITIALIZATION ====================
    
    async init() {
        try {
            this.showLoadingScreen();
            await this.loadUserSettings();
            await this.initializeComponents();
            await this.setupEventListeners();
            await this.loadDefaultProject();
            await this.initializeAI();
            this.hideLoadingScreen();
            this.showNotification('AI Code Studio Pro loaded successfully!', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Failed to initialize application', 'error');
            this.hideLoadingScreen();
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');
        
        const steps = [
            'Initializing AI Systems...',
            'Loading User Settings...',
            'Setting up Components...',
            'Configuring Event Listeners...',
            'Loading Default Project...',
            'Connecting to AI Service...',
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
        }, 500);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 1000);
    }

    async loadUserSettings() {
        try {
            const savedSettings = localStorage.getItem('aiCodeStudioSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            
            const savedTheme = localStorage.getItem('aiCodeStudioTheme') || 'dark';
            this.setTheme(savedTheme);
            
            const savedFiles = localStorage.getItem('aiCodeStudioFiles');
            if (savedFiles) {
                const fileData = JSON.parse(savedFiles);
                Object.entries(fileData).forEach(([path, data]) => {
                    this.files.set(path, data);
                });
            }
            
            const savedProject = localStorage.getItem('aiCodeStudioProject');
            if (savedProject) {
                const projectData = JSON.parse(savedProject);
                this.activeFile = projectData.activeFile;
                this.openTabs = new Set(projectData.openTabs || []);
            }
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
    }

    async initializeComponents() {
        // Initialize file tree
        this.updateFileTree();
        
        // Initialize templates
        this.updateTemplateGrid();
        
        // Initialize welcome screen
        this.updateWelcomeScreen();
        
        // Initialize panels
        this.updatePanels();
        
        // Initialize status bar
        this.updateStatusBar();
        
        // Initialize editor
        this.initializeEditor();
        
        // Initialize AI chat
        this.initializeAIChat();
    }

    // ==================== FILE MANAGEMENT ====================
    
    createFile(fileName, content = '', language = 'text', folder = '/') {
        const fullPath = this.normalizePath(folder + fileName);
        
        if (this.files.has(fullPath)) {
            this.showNotification(`File ${fileName} already exists`, 'warning');
            return false;
        }
        
        const fileData = {
            name: fileName,
            path: fullPath,
            content: content,
            language: language,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            size: content.length,
            icon: this.getFileIcon(language),
            isFolder: false,
            isModified: false
        };
        
        this.files.set(fullPath, fileData);
        this.updateFileTree();
        this.saveProject();
        
        this.showNotification(`File ${fileName} created successfully`, 'success');
        return true;
    }

    createFolder(folderName, parentFolder = '/') {
        const fullPath = this.normalizePath(parentFolder + folderName + '/');
        
        if (this.files.has(fullPath)) {
            this.showNotification(`Folder ${folderName} already exists`, 'warning');
            return false;
        }
        
        const folderData = {
            name: folderName,
            path: fullPath,
            content: '',
            language: 'folder',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            size: 0,
            icon: '📁',
            isFolder: true,
            isExpanded: true,
            children: []
        };
        
        this.files.set(fullPath, folderData);
        this.updateFileTree();
        this.saveProject();
        
        this.showNotification(`Folder ${folderName} created successfully`, 'success');
        return true;
    }

    openFile(filePath) {
        if (!this.files.has(filePath)) {
            this.showNotification(`File not found: ${filePath}`, 'error');
            return false;
        }
        
        const file = this.files.get(filePath);
        if (file.isFolder) {
            this.toggleFolder(filePath);
            return false;
        }
        
        this.activeFile = filePath;
        this.openTabs.add(filePath);
        
        this.updateTabs();
        this.updateFileTree();
        this.loadFileContent(filePath);
        this.updateStatusBar();
        
        // Show editor if welcome screen is active
        this.showEditor();
        
        return true;
    }

    closeFile(filePath) {
        if (!this.openTabs.has(filePath)) return;
        
        // Check if file is modified
        const file = this.files.get(filePath);
        if (file && file.isModified) {
            if (!confirm(`File ${file.name} has unsaved changes. Close anyway?`)) {
                return false;
            }
        }
        
        this.openTabs.delete(filePath);
        
        // If this was the active file, switch to another open tab
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
        
        return true;
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

    deleteFile(filePath) {
        if (!this.files.has(filePath)) return false;
        
        const file = this.files.get(filePath);
        if (!confirm(`Are you sure you want to delete ${file.name}?`)) {
            return false;
        }
        
        // Close file if it's open
        if (this.openTabs.has(filePath)) {
            this.closeFile(filePath);
        }
        
        // Delete file and any children if it's a folder
        if (file.isFolder) {
            const childrenToDelete = Array.from(this.files.keys()).filter(path => 
                path.startsWith(filePath) && path !== filePath
            );
            childrenToDelete.forEach(childPath => {
                if (this.openTabs.has(childPath)) {
                    this.closeFile(childPath);
                }
                this.files.delete(childPath);
            });
        }
        
        this.files.delete(filePath);
        this.updateFileTree();
        this.saveProject();
        
        this.showNotification(`${file.isFolder ? 'Folder' : 'File'} ${file.name} deleted successfully`, 'success');
        return true;
    }

    renameFile(filePath, newName) {
        if (!this.files.has(filePath) || !newName.trim()) return false;
        
        const file = this.files.get(filePath);
        const newPath = this.normalizePath(this.getParentPath(filePath) + newName + (file.isFolder ? '/' : ''));
        
        if (this.files.has(newPath)) {
            this.showNotification(`${file.isFolder ? 'Folder' : 'File'} ${newName} already exists`, 'error');
            return false;
        }
        
        // Update file data
        file.name = newName;
        file.path = newPath;
        file.modified = new Date().toISOString();
        
        // Move file to new path
        this.files.delete(filePath);
        this.files.set(newPath, file);
        
        // Update tabs if file is open
        if (this.openTabs.has(filePath)) {
            this.openTabs.delete(filePath);
            this.openTabs.add(newPath);
            
            if (this.activeFile === filePath) {
                this.activeFile = newPath;
            }
        }
        
        // Update children paths if it's a folder
        if (file.isFolder) {
            const childrenToUpdate = Array.from(this.files.entries()).filter(([path]) => 
                path.startsWith(filePath) && path !== filePath
            );
            
            childrenToUpdate.forEach(([oldChildPath, childFile]) => {
                const newChildPath = oldChildPath.replace(filePath, newPath);
                childFile.path = newChildPath;
                this.files.delete(oldChildPath);
                this.files.set(newChildPath, childFile);
                
                // Update tabs
                if (this.openTabs.has(oldChildPath)) {
                    this.openTabs.delete(oldChildPath);
                    this.openTabs.add(newChildPath);
                    
                    if (this.activeFile === oldChildPath) {
                        this.activeFile = newChildPath;
                    }
                }
            });
        }
        
        this.updateTabs();
        this.updateFileTree();
        this.updateStatusBar();
        this.saveProject();
        
        this.showNotification(`${file.isFolder ? 'Folder' : 'File'} renamed to ${newName}`, 'success');
        return true;
    }

    // ==================== EDITOR FUNCTIONALITY ====================
    
    initializeEditor() {
        const editor = document.getElementById('codeEditor');
        if (!editor) return;
        
        // Set up editor properties
        editor.style.fontFamily = this.settings.fontFamily;
        editor.style.fontSize = `${this.settings.fontSize}px`;
        editor.style.lineHeight = this.settings.lineHeight;
        editor.style.tabSize = this.settings.tabSize;
        
        // Add input event listener
        editor.addEventListener('input', (e) => {
            this.handleEditorInput(e);
        });
        
        // Add selection change listener
        editor.addEventListener('selectionchange', () => {
            this.updateCursorPosition();
        });
        
        // Add keydown listener for shortcuts
        editor.addEventListener('keydown', (e) => {
            this.handleEditorKeydown(e);
        });
        
        // Add paste listener
        editor.addEventListener('paste', (e) => {
            this.handleEditorPaste(e);
        });
        
        // Add drag and drop listeners
        editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.showDragOverlay();
        });
        
        editor.addEventListener('drop', (e) => {
            e.preventDefault();
            this.hideDragOverlay();
            this.handleFileDrop(e);
        });
        
        // Initialize syntax highlighting
        this.updateSyntaxHighlighting();
        
        // Initialize line numbers
        this.updateLineNumbers();
    }

    handleEditorInput(event) {
        if (!this.activeFile) return;
        
        const editor = event.target;
        const file = this.files.get(this.activeFile);
        
        if (file) {
            file.isModified = true;
            file.size = editor.value.length;
            this.files.set(this.activeFile, file);
            
            this.updateTabs();
            this.updateStatusBar();
            this.updateLineNumbers();
            this.updateSyntaxHighlighting();
            
            // Auto-save if enabled
            if (this.settings.autoSave) {
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.saveFile();
                }, this.settings.autoSaveDelay);
            }
            
            // AI auto-suggestions if enabled
            if (this.settings.aiAutoSuggestions) {
                this.debounceAISuggestions();
            }
        }
        
        this.updateCursorPosition();
    }

    handleEditorKeydown(event) {
        const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
        const isCtrl = ctrlKey || metaKey;
        
        // Handle keyboard shortcuts
        if (isCtrl) {
            switch (key.toLowerCase()) {
                case 's':
                    event.preventDefault();
                    this.saveFile();
                    break;
                case 'n':
                    event.preventDefault();
                    if (shiftKey) {
                        this.showModal('newFileModal');
                    } else {
                        this.createNewProject();
                    }
                    break;
                case 'o':
                    event.preventDefault();
                    this.openProject();
                    break;
                case 'f':
                    event.preventDefault();
                    this.showFindReplace();
                    break;
                case 'h':
                    event.preventDefault();
                    this.showFindReplace(true);
                    break;
                case 'g':
                    event.preventDefault();
                    this.showGoToLine();
                    break;
                case 'z':
                    event.preventDefault();
                    if (shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
                case 'd':
                    event.preventDefault();
                    this.duplicateLine();
                    break;
                case '/':
                    event.preventDefault();
                    this.toggleComment();
                    break;
                case 'p':
                    event.preventDefault();
                    if (shiftKey) {
                        this.showCommandPalette();
                    }
                    break;
                case 'w':
                    event.preventDefault();
                    if (this.activeFile) {
                        this.closeFile(this.activeFile);
                    }
                    break;
            }
        }
        
        // Handle other shortcuts
        switch (key) {
            case 'F5':
                event.preventDefault();
                this.runCode();
                break;
            case 'F11':
                event.preventDefault();
                this.toggleZenMode();
                break;
            case 'Tab':
                if (!isCtrl && !altKey) {
                    event.preventDefault();
                    this.handleTabKey(shiftKey);
                }
                break;
            case 'Enter':
                if (shiftKey) {
                    event.preventDefault();
                    this.insertLineAbove();
                } else if (isCtrl) {
                    event.preventDefault();
                    this.insertLineBelow();
                }
                break;
        }
    }

    handleTabKey(isShiftPressed) {
        const editor = document.getElementById('codeEditor');
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        if (start === end) {
            // No selection - insert tab or spaces
            const tabString = this.settings.insertSpaces ? 
                ' '.repeat(this.settings.tabSize) : '\t';
            
            if (isShiftPressed) {
                // Shift+Tab - remove indentation
                this.removeIndentation();
            } else {
                // Tab - add indentation
                editor.setRangeText(tabString, start, end, 'end');
            }
        } else {
            // Selection exists - indent/unindent lines
            if (isShiftPressed) {
                this.unindentSelection();
            } else {
                this.indentSelection();
            }
        }
        
        this.updateLineNumbers();
    }

    updateCursorPosition() {
        const editor = document.getElementById('codeEditor');
        if (!editor) return;
        
        const text = editor.value;
        const cursorPos = editor.selectionStart;
        
        // Calculate line and column
        const textBeforeCursor = text.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        this.editorPosition = { line, column };
        
        // Update selection info
        if (editor.selectionStart !== editor.selectionEnd) {
            const selectionLength = editor.selectionEnd - editor.selectionStart;
            const selectedText = text.substring(editor.selectionStart, editor.selectionEnd);
            const selectedLines = selectedText.split('\n').length;
            
            this.selection = {
                start: editor.selectionStart,
                end: editor.selectionEnd,
                length: selectionLength,
                lines: selectedLines
            };
        } else {
            this.selection = null;
        }
        
        this.updateStatusBar();
        this.updateEditorInfo();
    }

    updateLineNumbers() {
        const editor = document.getElementById('codeEditor');
        const lineNumbers = document.getElementById('lineNumbers');
        
        if (!editor || !lineNumbers || !this.settings.showLineNumbers) return;
        
        const lines = editor.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            const isActive = i === this.editorPosition.line;
            lineNumbersHTML += `<div class="line-number${isActive ? ' active' : ''}">${i}</div>`;
        }
        
        lineNumbers.innerHTML = lineNumbersHTML;
    }

    updateSyntaxHighlighting() {
        if (!this.settings.syntaxHighlighting || !this.activeFile) return;
        
        const file = this.files.get(this.activeFile);
        if (!file) return;
        
        const editor = document.getElementById('codeEditor');
        const overlay = document.getElementById('editorOverlay');
        
        if (!editor || !overlay) return;
        
        // Apply syntax highlighting based on language
        const highlightedCode = this.highlightSyntax(editor.value, file.language);
        overlay.innerHTML = highlightedCode;
    }

    highlightSyntax(code, language) {
        // Basic syntax highlighting implementation
        let highlighted = this.escapeHtml(code);
        
        switch (language.toLowerCase()) {
            case 'javascript':
            case 'typescript':
                highlighted = this.highlightJavaScript(highlighted);
                break;
            case 'python':
                highlighted = this.highlightPython(highlighted);
                break;
            case 'html':
                highlighted = this.highlightHTML(highlighted);
                break;
            case 'css':
                highlighted = this.highlightCSS(highlighted);
                break;
            case 'json':
                highlighted = this.highlightJSON(highlighted);
                break;
            case 'markdown':
                highlighted = this.highlightMarkdown(highlighted);
                break;
        }
        
        return highlighted;
    }

    highlightJavaScript(code) {
        // Keywords
        const keywords = [
            'const', 'let', 'var', 'function', 'class', 'extends', 'import', 'export',
            'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break',
            'continue', 'return', 'try', 'catch', 'finally', 'throw', 'async', 'await',
            'true', 'false', 'null', 'undefined', 'typeof', 'instanceof', 'new', 'this'
        ];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            code = code.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Strings
        code = code.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, 
            '<span class="string">$1$2$1</span>');
        
        // Template literals
        code = code.replace(/(`)((?:\\.|[^\\`])*?)(`)/g, 
            '<span class="string">$1$2$3</span>');
        
        // Numbers
        code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, 
            '<span class="number">$1</span>');
        
        // Comments
        code = code.replace(/\/\/.*$/gm, 
            '<span class="comment">$&</span>');
        code = code.replace(/\/\*[\s\S]*?\*\//g, 
            '<span class="comment">$&</span>');
        
        // Functions
        code = code.replace(/\b(\w+)(?=\s*\()/g, 
            '<span class="function">$1</span>');
        
        return code;
    }

    highlightPython(code) {
        const keywords = [
            'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'with', 'as',
            'try', 'except', 'finally', 'raise', 'import', 'from', 'return',
            'break', 'continue', 'pass', 'lambda', 'yield', 'global', 'nonlocal',
            'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is'
        ];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            code = code.replace(regex, `<span class="keyword">${keyword}</span>`);
        });
        
        // Strings
        code = code.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, 
            '<span class="string">$1$2$1</span>');
        
        // Triple quoted strings
        code = code.replace(/(""")([\s\S]*?)(""")/g, 
            '<span class="string">$1$2$3</span>');
        
        // Numbers
        code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, 
            '<span class="number">$1</span>');
        
        // Comments
        code = code.replace(/#.*$/gm, 
            '<span class="comment">$&</span>');
        
        // Functions
        code = code.replace(/\bdef\s+(\w+)/g, 
            '<span class="keyword">def</span> <span class="function">$1</span>');
        
        return code;
    }

    highlightHTML(code) {
        // HTML tags
        code = code.replace(/&lt;(\/?[\w\s="'-]+)&gt;/g, 
            '<span class="keyword">&lt;$1&gt;</span>');
        
        // Attributes
        code = code.replace(/(\w+)=("[^"]*"|'[^']*')/g, 
            '<span class="variable">$1</span>=<span class="string">$2</span>');
        
        // Comments
        code = code.replace(/&lt;!--[\s\S]*?--&gt;/g, 
            '<span class="comment">$&</span>');
        
        return code;
    }

    highlightCSS(code) {
        // Selectors
        code = code.replace(/([.#]?[\w-]+)(?=\s*{)/g, 
            '<span class="keyword">$1</span>');
        
        // Properties
        code = code.replace(/(\w+(?:-\w+)*)\s*:/g, 
            '<span class="variable">$1</span>:');
        
        // Values
        code = code.replace(/:\s*([^;]+);/g, 
            ': <span class="string">$1</span>;');
        
        // Comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, 
            '<span class="comment">$&</span>');
        
        return code;
    }

    highlightJSON(code) {
        // Keys
        code = code.replace(/"([^"]+)"(\s*:)/g, 
            '<span class="string">"$1"</span>$2');
        
        // String values
        code = code.replace(/:\s*"([^"]*)"/g, 
            ': <span class="string">"$1"</span>');
        
        // Numbers
        code = code.replace(/:\s*(-?\d+(?:\.\d+)?)/g, 
            ': <span class="number">$1</span>');
        
        // Booleans and null
        code = code.replace(/:\s*(true|false|null)/g, 
            ': <span class="keyword">$1</span>');
        
        return code;
    }

    // ==================== AI INTEGRATION ====================
    
    async initializeAI() {
        try {
            // Test AI connection
            const testResponse = await this.callAI('Hello! Are you working correctly?');
            if (testResponse) {
                this.updateAIStatus('online');
                this.showNotification('AI Assistant connected successfully', 'success');
            }
        } catch (error) {
            console.error('AI initialization error:', error);
            this.updateAIStatus('offline');
            this.showNotification('AI Assistant connection failed', 'warning');
        }
    }

    initializeAIChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // Add welcome message
        this.addAIMessage(`👋 Welcome to AI Code Studio Pro! I'm your intelligent coding assistant.

I can help you with:
• **Code Generation** - Write code from natural language descriptions
• **Bug Detection** - Find and fix issues in your code
• **Code Review** - Analyze code quality and suggest improvements
• **Documentation** - Generate comments and documentation
• **Optimization** - Improve code performance and readability
• **Learning** - Explain complex programming concepts

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
            
            // Add user message to chat
            this.addUserMessage(message);
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Prepare context
            let contextMessage = message;
            if (includeContext && this.activeFile) {
                const file = this.files.get(this.activeFile);
                const editor = document.getElementById('codeEditor');
                
                if (file && editor) {
                    const currentCode = editor.value;
                    const selectedText = this.getSelectedText();
                    
                    contextMessage = `File: ${file.name} (${file.language})
${selectedText ? `Selected code:\n\`\`\`${file.language}\n${selectedText}\n\`\`\`` : `Current code:\n\`\`\`${file.language}\n${currentCode}\n\`\`\``}

User question: ${message}`;
                }
            }
            
            // Call AI API
            const response = await this.callAI(contextMessage);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to chat
            this.addAIMessage(response);
            
            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );
            
            // Keep conversation history manageable
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
                    { role: 'system', content: this.aiConfig.systemPrompt },
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
                <div class="message-actions">
                    <button class="message-action" title="Copy" onclick="codeStudio.copyToClipboard('${this.escapeHtml(message)}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
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
                <div class="message-actions">
                    <button class="message-action" title="Copy" onclick="codeStudio.copyToClipboard('${this.escapeHtml(message)}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action" title="Like" onclick="codeStudio.rateMessage(this, 'like')">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button class="message-action" title="Dislike" onclick="codeStudio.rateMessage(this, 'dislike')">
                        <i class="fas fa-thumbs-down"></i>
                    </button>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
    }

    formatAIResponse(message) {
        // Format code blocks
        let formatted = message.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const lang = language || 'text';
            const escapedCode = this.escapeHtml(code.trim());
            const highlightedCode = this.highlightSyntax(escapedCode, lang);
            
            return `
                <div class="code-block">
                    <div class="code-block-header">
                        <span class="code-lang">${lang}</span>
                        <button class="copy-code-btn" onclick="codeStudio.copyCodeBlock(this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div class="code-content">${highlightedCode}</div>
                </div>
            `;
        });
        
        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, 
            '<code class="inline-code">$1</code>');
        
        // Format bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Format line breaks
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

    // ==================== UI MANAGEMENT ====================
    
    updateFileTree() {
        const fileTree = document.getElementById('fileTree');
        if (!fileTree) return;
        
        fileTree.innerHTML = '';
        
        // Sort files and folders
        const sortedFiles = Array.from(this.files.entries()).sort(([pathA, fileA], [pathB, fileB]) => {
            // Folders first
            if (fileA.isFolder && !fileB.isFolder) return -1;
            if (!fileA.isFolder && fileB.isFolder) return 1;
            // Then alphabetically
            return fileA.name.localeCompare(fileB.name);
        });
        
        // Build tree structure
        const tree = this.buildFileTree(sortedFiles);
        this.renderFileTree(tree, fileTree);
    }

    buildFileTree(files) {
        const tree = { children: [] };
        
        for (const [path, file] of files) {
            const parts = path.split('/').filter(Boolean);
            let current = tree;
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                let child = current.children.find(c => c.name === part);
                
                if (!child) {
                    child = {
                        name: part,
                        path: parts.slice(0, i + 1).join('/') + (i < parts.length - 1 ? '/' : ''),
                        file: i === parts.length - 1 ? file : null,
                        children: []
                    };
                    current.children.push(child);
                }
                
                current = child;
            }
        }
        
        return tree;
    }

    renderFileTree(node, container, level = 0) {
        for (const child of node.children) {
            const item = document.createElement('div');
            item.className = `file-item ${this.activeFile === child.path ? 'active' : ''}`;
            item.dataset.path = child.path;
            item.style.paddingLeft = `${level * 20 + 12}px`;
            
            const file = child.file || { isFolder: true, name: child.name, icon: '📁' };
            
            item.innerHTML = `
                <span class="file-icon ${file.isFolder ? 'folder-icon' : ''}">${file.icon}</span>
                <span class="file-name">${file.name}</span>
                <div class="file-actions">
                    <button class="file-action-btn" title="Rename" onclick="codeStudio.startRename('${child.path}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="file-action-btn" title="Delete" onclick="codeStudio.deleteFile('${child.path}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add click event
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (file.isFolder) {
                    this.toggleFolder(child.path);
                } else {
                    this.openFile(child.path);
                }
            });
            
            container.appendChild(item);
            
            // Render children if folder is expanded
            if (file.isFolder && file.isExpanded && child.children.length > 0) {
                this.renderFileTree(child, container, level + 1);
            }
        }
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
                <button class="tab-close" onclick="codeStudio.closeFile('${filePath}')" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add click event to switch tabs
            tab.addEventListener('click', (e) => {
                if (e.target.closest('.tab-close')) return;
                this.openFile(filePath);
            });
            
            tabsContainer.appendChild(tab);
        });
    }

    updateStatusBar() {
        // Update current file info
        const currentFileEl = document.getElementById('filePathStatus');
        const languageStatusEl = document.getElementById('languageStatus');
        const positionStatusEl = document.getElementById('positionStatus');
        const encodingStatusEl = document.getElementById('encodingStatus');
        
        if (this.activeFile && this.files.has(this.activeFile)) {
            const file = this.files.get(this.activeFile);
            
            if (currentFileEl) {
                currentFileEl.textContent = file.path;
            }
            
            if (languageStatusEl) {
                const langSpan = languageStatusEl.querySelector('span');
                if (langSpan) {
                    langSpan.textContent = this.getLanguageDisplayName(file.language);
                }
            }
            
            if (encodingStatusEl) {
                encodingStatusEl.textContent = 'UTF-8';
            }
        } else {
            if (currentFileEl) {
                currentFileEl.textContent = 'Welcome to AI Code Studio Pro';
            }
            
            if (languageStatusEl) {
                const langSpan = languageStatusEl.querySelector('span');
                if (langSpan) {
                    langSpan.textContent = 'Plain Text';
                }
            }
        }
        
        // Update cursor position
        if (positionStatusEl) {
            if (this.selection) {
                positionStatusEl.textContent = `Ln ${this.editorPosition.line}, Col ${this.editorPosition.column} (${this.selection.length} selected)`;
            } else {
                positionStatusEl.textContent = `Ln ${this.editorPosition.line}, Col ${this.editorPosition.column}`;
            }
        }
        
        // Update other status items
        this.updateProblemsStatus();
        this.updateSyncStatus();
    }

    updateProblemsStatus() {
        const problemsStatusEl = document.getElementById('problemsStatus');
        if (problemsStatusEl) {
            // This would integrate with a linter/checker
            const problemCount = 0; // Placeholder
            const span = problemsStatusEl.querySelector('span');
            if (span) {
                span.textContent = `${problemCount} Problems`;
            }
        }
    }

    updateSyncStatus() {
        const syncStatusEl = document.getElementById('syncStatus');
        if (syncStatusEl) {
            const span = syncStatusEl.querySelector('span');
            if (span) {
                span.textContent = 'Synced';
            }
        }
    }

    updateWelcomeScreen() {
        const recentProjects = document.getElementById('recentProjects');
        const welcomeTemplates = document.getElementById('welcomeTemplates');
        
        // Update recent projects
        if (recentProjects) {
            recentProjects.innerHTML = this.getRecentProjects().map(project => `
                <div class="recent-project" onclick="codeStudio.loadProject('${project.id}')">
                    <div class="recent-project-icon">
                        <i class="${project.icon}"></i>
                    </div>
                    <div class="recent-project-info">
                        <h4>${project.name}</h4>
                        <p>${project.description}</p>
                        <small>Last opened: ${this.formatDate(project.lastOpened)}</small>
                    </div>
                </div>
            `).join('');
        }
        
        // Update templates
        if (welcomeTemplates) {
            const featuredTemplates = Array.from(this.projectTemplates.values()).slice(0, 6);
            welcomeTemplates.innerHTML = featuredTemplates.map(template => `
                <div class="template-card" onclick="codeStudio.createFromTemplate('${template.id}')">
                    <div class="template-header">
                        <div class="template-icon">
                            <i class="${template.icon}"></i>
                        </div>
                        <div class="template-title">${template.name}</div>
                    </div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    updateTemplateGrid() {
        const templatesGrid = document.getElementById('templatesGrid');
        if (!templatesGrid) return;
        
        const templates = Array.from(this.projectTemplates.values());
        templatesGrid.innerHTML = templates.map(template => `
            <div class="template-card" onclick="codeStudio.createFromTemplate('${template.id}')">
                <div class="template-header">
                    <div class="template-icon">
                        <i class="${template.icon}"></i>
                    </div>
                    <div class="template-title">${template.name}</div>
                </div>
                <div class="template-description">${template.description}</div>
                <div class="template-tags">
                    ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
                </div>
                <div class="template-footer">
                    <span class="template-difficulty">${template.difficulty}</span>
                    <span class="template-time">${template.estimatedTime}</span>
                </div>
            </div>
        `).join('');
    }

    // ==================== EVENT LISTENERS ====================
    
    async setupEventListeners() {
        // Header buttons
        this.setupHeaderEventListeners();
        
        // Activity bar
        this.setupActivityBarEventListeners();
        
        // Sidebar
        this.setupSidebarEventListeners();
        
        // AI Chat
        this.setupAIChatEventListeners();
        
        // Modals
        this.setupModalEventListeners();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // File operations
        this.setupFileOperationListeners();
        
        // Drag and drop
        this.setupDragAndDropListeners();
        
        // Context menu
        this.setupContextMenuListeners();
        
        // Welcome screen
        this.setupWelcomeScreenListeners();
        
        // Toolbar
        this.setupToolbarListeners();
        
        // Window events
        this.setupWindowEventListeners();
    }

    setupHeaderEventListeners() {
        // New project
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.createNewProject());
        }
        
        // Open project
        const openProjectBtn = document.getElementById('openProjectBtn');
        if (openProjectBtn) {
            openProjectBtn.addEventListener('click', () => this.openProject());
        }
        
        // Save project
        const saveProjectBtn = document.getElementById('saveProjectBtn');
        if (saveProjectBtn) {
            saveProjectBtn.addEventListener('click', () => this.saveFile());
        }
        
        // Undo/Redo
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        
        // Run code
        const runCodeBtn = document.getElementById('runCodeBtn');
        if (runCodeBtn) {
            runCodeBtn.addEventListener('click', () => this.runCode());
        }
        
        // Debug
        const debugBtn = document.getElementById('debugBtn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => this.startDebugging());
        }
        
        // Share
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareProject());
        }
        
        // Export
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportProject());
        }
        
        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal('settingsModal'));
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // User menu
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
        }
    }

    setupActivityBarEventListeners() {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', () => {
                const panel = item.dataset.panel;
                this.switchPanel(panel);
                
                // Update active state
                activityItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    setupSidebarEventListeners() {
        // Panel buttons
        const newFileBtn = document.getElementById('newFileBtn');
        const newFolderBtn = document.getElementById('newFolderBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const collapseAllBtn = document.getElementById('collapseAllBtn');
        
        if (newFileBtn) {
            newFileBtn.addEventListener('click', () => this.showModal('newFileModal'));
        }
        
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', () => this.showNewFolderDialog());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshFileTree());
        }
        
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => this.collapseAllFolders());
        }
        
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    }

    setupAIChatEventListeners() {
        // Send button
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
            
            // Auto-resize textarea
            aiInput.addEventListener('input', () => {
                aiInput.style.height = 'auto';
                aiInput.style.height = aiInput.scrollHeight + 'px';
            });
        }
        
        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
        
        // Model selector
        const modelSelector = document.getElementById('modelSelector');
        if (modelSelector) {
            modelSelector.addEventListener('change', (e) => {
                this.aiConfig.model = e.target.value;
                this.saveSettings();
                this.updateCurrentModelDisplay();
            });
        }
        
        // AI toolbar buttons
        const attachCodeBtn = document.getElementById('attachCodeBtn');
        const voiceInputBtn = document.getElementById('voiceInputBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const aiSettingsBtn = document.getElementById('aiSettingsBtn');
        
        if (attachCodeBtn) {
            attachCodeBtn.addEventListener('click', () => this.attachCurrentCode());
        }
        
        if (voiceInputBtn) {
            voiceInputBtn.addEventListener('click', () => this.startVoiceInput());
        }
        
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearAIChat());
        }
        
        if (aiSettingsBtn) {
            aiSettingsBtn.addEventListener('click', () => this.showModal('aiSettingsModal'));
        }
    }

    setupModalEventListeners() {
        // Modal close buttons
        const modalCloses = document.querySelectorAll('.modal-close, [data-modal]');
        modalCloses.forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                const modalId = closeBtn.dataset.modal || closeBtn.closest('.modal').id;
                this.hideModal(modalId);
            });
        });
        
        // Modal backdrops
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
        this.setupSettingsModal();
        
        // New file modal
        this.setupNewFileModal();
        
        // AI settings modal
        this.setupAISettingsModal();
    }

    setupSettingsModal() {
        // Settings navigation
        const settingsNavItems = document.querySelectorAll('.settings-nav-item');
        settingsNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSettingsSection(section);
                
                // Update active state
                settingsNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Range inputs
        const rangeInputs = document.querySelectorAll('.form-range');
        rangeInputs.forEach(range => {
            range.addEventListener('input', () => {
                const valueSpan = range.nextElementSibling;
                if (valueSpan && valueSpan.classList.contains('range-value')) {
                    valueSpan.textContent = range.value;
                }
            });
        });
        
        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettingsFromModal());
        }
    }

    setupNewFileModal() {
        const createFileBtn = document.getElementById('createFileBtn');
        const newFileNameInput = document.getElementById('newFileNameInput');
        const newFileTypeSelect = document.getElementById('newFileTypeSelect');
        
        if (createFileBtn) {
            createFileBtn.addEventListener('click', () => this.createFileFromModal());
        }
        
        if (newFileNameInput) {
            newFileNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createFileFromModal();
                }
            });
        }
        
        // Update file extension when type changes
        if (newFileTypeSelect && newFileNameInput) {
            newFileTypeSelect.addEventListener('change', () => {
                const selectedType = newFileTypeSelect.value;
                const extension = this.getFileExtension(selectedType);
                const currentName = newFileNameInput.value;
                
                // Remove old extension and add new one
                const nameWithoutExt = currentName.replace(/\.[^/.]+$/, '');
                newFileNameInput.value = nameWithoutExt + extension;
            });
        }
    }

    setupAISettingsModal() {
        const temperatureModalRange = document.getElementById('temperatureModalRange');
        const tempDisplay = document.getElementById('tempDisplay');
        const saveAiSettingsBtn = document.getElementById('saveAiSettingsBtn');
        
        if (temperatureModalRange && tempDisplay) {
            temperatureModalRange.addEventListener('input', () => {
                tempDisplay.textContent = temperatureModalRange.value;
            });
        }
        
        if (saveAiSettingsBtn) {
            saveAiSettingsBtn.addEventListener('click', () => this.saveAISettingsFromModal());
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const { ctrlKey, metaKey, shiftKey, altKey, key } = e;
            const isCtrl = ctrlKey || metaKey;
            
            // Global shortcuts
            if (isCtrl && shiftKey) {
                switch (key.toLowerCase()) {
                    case
