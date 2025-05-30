
        // DOM Elements
        const loginContainer = document.getElementById('loginContainer');
        const loginBox = document.getElementById('loginBox');
        const usernameInput = document.getElementById('usernameInput');
        const loginBtn = document.getElementById('loginBtn');
        const notepadContainer = document.getElementById('notepadContainer');
        const displayName = document.getElementById('displayName');
        const userName = document.getElementById('userName');
        const userDropdown = document.getElementById('userDropdown');
        const textEditor = document.getElementById('textEditor');
        const charCount = document.getElementById('charCount');
        const lineCount = document.getElementById('lineCount');
        const wordCount = document.getElementById('wordCount');
        
        // Terms elements
        const termsCheckbox = document.getElementById('termsCheckbox');
        const termsLink = document.getElementById('termsLink');
        const privacyLink = document.getElementById('privacyLink');
        
        // File operation elements
        const newBtn = document.getElementById('newBtn');
        const openBtn = document.getElementById('openBtn');
        const saveBtn = document.getElementById('saveBtn');
        const saveAsBtn = document.getElementById('saveAsBtn');
        const printBtn = document.getElementById('printBtn');
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        const cutBtn = document.getElementById('cutBtn');
        const copyBtn = document.getElementById('copyBtn');
        const pasteBtn = document.getElementById('pasteBtn');
        
        // Dialog elements
        const saveDialog = document.getElementById('saveDialog');
        const saveDialogClose = document.getElementById('saveDialogClose');
        const saveDialogCancel = document.getElementById('saveDialogCancel');
        const saveDialogConfirm = document.getElementById('saveDialogConfirm');
        const saveFilename = document.getElementById('saveFilename');
        const openDialog = document.getElementById('openDialog');
        const openDialogClose = document.getElementById('openDialogClose');
        const openDialogCancel = document.getElementById('openDialogCancel');
        const fileInput = document.getElementById('fileInput');
        
        // CMD Terminal elements
        const cmdTerminal = document.getElementById('cmdTerminal');
        const cmdInput = document.getElementById('cmdInput');
        const cmdOutput = cmdTerminal.querySelector('.cmd-output');
        
        // App state
        let currentFile = null;
        let isModified = false;
        const editHistory = [];
        let historyPointer = -1;

        // Check login state on page load
        document.addEventListener('DOMContentLoaded', function() {
            checkLoginState();
            initEventListeners();
        });

        function checkLoginState() {
            const savedUsername = localStorage.getItem('slideNoteUsername');
            if (savedUsername) {
                // User is logged in
                loginContainer.style.display = 'none';
                notepadContainer.style.display = 'flex';
                displayName.textContent = savedUsername;
                loadFromLocalStorage();
                setTimeout(() => textEditor.focus(), 100);
            } else {
                // User is not logged in
                loginContainer.style.display = 'flex';
                notepadContainer.style.display = 'none';
                usernameInput.focus();
            }
        }

        function initEventListeners() {
            // Login
            loginBtn.addEventListener('click', handleLogin);
            usernameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') handleLogin();
            });
            
            // Terms checkbox
            termsCheckbox.addEventListener('change', function() {
                loginBtn.disabled = !this.checked;
            });
            
            // Terms links
            termsLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "https://aboutslide.netlify.app/terms";
            });
            
            privacyLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = "https://aboutslide.netlify.app/privacy";
            });
            
            // User menu
            userName.addEventListener('click', toggleUserDropdown);
            document.addEventListener('click', function(e) {
                if (!userName.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
            
            // Dropdown items
            document.querySelector('.dropdown-item.logout').addEventListener('click', handleLogout);
            document.querySelector('.dropdown-item.social').addEventListener('click', function() {
                saveToLocalStorage();
                window.location.href = 'insta.html';
            });
            document.querySelector('.dropdown-item.cmd-btn').addEventListener('click', function() {
                userDropdown.classList.remove('show');
                toggleCmdTerminal();
            });

            document.querySelector('.dropdown-item.admin').addEventListener('click', function() {
                saveToLocalStorage();
                window.location.href = 'allimglogin.html';
            });
            document.querySelector('.dropdown-item.adv-btn').addEventListener('click', function() {
                saveToLocalStorage();
                window.location.href = 'advancenote.html';
            });

            document.querySelector('.dropdown-item.abt-btn').addEventListener('click', function() {
                saveToLocalStorage();
                window.location.href = 'https://aboutslide.netlify.app';
            });
            
            document.querySelector('.dropdown-item.chat').addEventListener('click', function() {
                saveToLocalStorage();
                window.location.href = 'chat.html';
            });

            // Commands help button
            document.querySelector('.commands-help-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                showCommandsHelp(e);
            });
            
            // Text editor
            textEditor.addEventListener('input', updateCounters);
            textEditor.addEventListener('input', handleTextChange);
            textEditor.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
                    this.selectionStart = this.selectionEnd = start + 1;
                    updateCounters();
                    handleTextChange();
                }
            });
            
            // Save content to localStorage when the page is about to unload
            window.addEventListener('beforeunload', function(e) {
                saveToLocalStorage();
            });
            
            // File operations
            newBtn.addEventListener('click', newFile);
            openBtn.addEventListener('click', () => openDialog.classList.add('show'));
            saveBtn.addEventListener('click', saveFile);
            saveAsBtn.addEventListener('click', saveFileAs);
            printBtn.addEventListener('click', printFile);
            undoBtn.addEventListener('click', undo);
            redoBtn.addEventListener('click', redo);
            cutBtn.addEventListener('click', cutText);
            copyBtn.addEventListener('click', copyText);
            pasteBtn.addEventListener('click', pasteText);
            
            // Dialog events
            saveDialogClose.addEventListener('click', () => saveDialog.classList.remove('show'));
            saveDialogCancel.addEventListener('click', () => saveDialog.classList.remove('show'));
            saveDialogConfirm.addEventListener('click', confirmSave);
            openDialogClose.addEventListener('click', () => openDialog.classList.remove('show'));
            openDialogCancel.addEventListener('click', () => openDialog.classList.remove('show'));
            fileInput.addEventListener('change', handleFileSelect);
            
            // CMD Terminal events
            cmdInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const command = this.value.trim();
                    this.value = '';
                    
                    if (command.toLowerCase() === 'exit') {
                        toggleCmdTerminal();
                        return;
                    }
                    
                    // Execute command
                    executeCommand(command);
                }
            });
            
            // Save with Ctrl+S
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    saveFile();
                }
                
                // Undo/Redo with Ctrl+Z/Y
                if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    undo();
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            });
        }
        
        // Save content to localStorage
        function saveToLocalStorage() {
            const content = textEditor.value;
            localStorage.setItem('slideNoteContent', content);
            localStorage.setItem('slideNoteModified', isModified.toString());
        }
        
        // Load content from localStorage
        function loadFromLocalStorage() {
            const savedContent = localStorage.getItem('slideNoteContent');
            const savedModified = localStorage.getItem('slideNoteModified');
            
            if (savedContent !== null) {
                textEditor.value = savedContent;
                isModified = savedModified === 'true';
                updateCounters();
                
                // Initialize history with the loaded content
                editHistory.length = 0;
                editHistory.push(savedContent);
                historyPointer = 0;
            }
        }
        
        function toggleCmdTerminal() {
            cmdTerminal.classList.toggle('show');
            if (cmdTerminal.classList.contains('show')) {
                cmdInput.focus();
            }
        }
        
        // Show commands help modal
        function showCommandsHelp(e) {
            e.stopPropagation();
            userDropdown.classList.remove('show');
            
            // Create or reuse modal
            let helpModal = document.getElementById('commandsHelpModal');
            if (!helpModal) {
                helpModal = document.createElement('div');
                helpModal.id = 'commandsHelpModal';
                helpModal.className = 'commands-help-modal';
                helpModal.innerHTML = `
                    <button class="close-help">&times;</button>
                    <h3>Available Commands</h3>
                    <ul class="command-list">
                        <li><span class="command-name">sig-[query]</span> <span class="command-desc">- Search Google</span></li>
                        <li><span class="command-name">sip-[query]</span> <span class="command-desc">- Search Pinterest</span></li>
                        <li><span class="command-name">siy-[query]</span> <span class="command-desc">- Search Youtube</span></li>
                        <li><span class="command-name">siypp-[query]</span> <span class="command-desc">- Search YesPPic</span></li>
                        <li><span class="command-name">six-[query]</span> <span class="command-desc">- Search XV</span></li>
                        <li><span class="command-name">sihtp-[query]</span> <span class="command-desc">- Search Hdtube</span></li>
                        <li><span class="command-name">sisvp-[query]</span> <span class="command-desc">- Search Svid.pro</span></li>
                        <li><span class="command-name">siep-[query]</span> <span class="command-desc">- Search Epor</span></li>
                        <li><span class="command-name">open-[query]</span> <span class="command-desc">- Open Site</span></li>
                        <li><span class="command-name">admin</span> <span class="command-desc">- Admin Database</span></li>
                        <li><span class="command-name">dark</span> <span class="command-desc">- Open Dark Root</span></li>
                        <li><span class="command-name">exit</span> <span class="command-desc">- Close terminal</span></li>
                        <li><span class="command-name">[URL]</span> <span class="command-desc">- Open any website</span></li>
                    </ul>
                `;
                document.body.appendChild(helpModal);
                
                // Add event listeners
                helpModal.querySelector('.close-help').addEventListener('click', () => {
                    helpModal.classList.remove('show');
                });
                
                // Close when clicking outside
                document.addEventListener('click', (e) => {
                    if (!helpModal.contains(e.target) && e.target !== document.querySelector('.commands-help-btn')) {
                        helpModal.classList.remove('show');
                    }
                });
            }
            
            helpModal.classList.add('show');
        }
        
        function executeCommand(command) {
            // Add command to output
            addToOutput(`$ > ${command}`);
            
            // Check for exit command
            if (command.toLowerCase() === 'exit') {
                toggleCmdTerminal();
                return;
            }
            
            // Check for asas command
            if (command.toLowerCase() === 'dark') {
                addToOutput('Redirecting to Dark root....');
                saveToLocalStorage();
                window.location.href = 'slidesuxxlogin.html';
                return;
            }

            if (command.toLowerCase().startsWith('sig-')) {
                const searchQuery = command.substring(4).trim();
                if (searchQuery) {
                    addToOutput(`Searching Google for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after sig-');
                }
                return;
            }

            if (command.toLowerCase().startsWith('sip-')) {
                const searchQuery = command.substring(4).trim();
                if (searchQuery) {
                    addToOutput(`Searching Pinterest for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after sip-');
                }
                return;
            }

            if (command.toLowerCase().startsWith('siy-')) {
                const searchQuery = command.substring(4).trim();
                if (searchQuery) {
                    addToOutput(`Searching Youtube for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after siy-');
                }
                return;
            }
            if (command.toLowerCase().startsWith('siypp-')) {
                const searchQuery = command.substring(6).trim();
                if (searchQuery) {
                    addToOutput(`Searching YesPPic for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.yespornpics.com/sex/${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after siypp-');
                }
                return;
            }
            if (command.toLowerCase().startsWith('six-')) {
                const searchQuery = command.substring(4).trim();
                if (searchQuery) {
                    addToOutput(`Searching xv for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href=`https://www.xvideos2.com/?k=${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after six-');
                }
                return;
            }
            if (command.toLowerCase().startsWith('sihtp-')) {
                const searchQuery = command.substring(6).trim();
                if (searchQuery) {
                    addToOutput(`Searching HdTube.p for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.hdtube.porn/search/pins/?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after sihtp-');
                }
                return;
            }
            if (command.toLowerCase().startsWith('sisvp-')) {
                const searchQuery = command.substring(6).trim();
                if (searchQuery) {
                    addToOutput(`Searching SVID.pro for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.sexvid.pro/s/${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after sisvp-');
                }
                return;
            }

            if (command.toLowerCase() === 'admin') {
                addToOutput('Enter Admin ID Like $  >admin-####');
                addToOutput('#### is your key');
                return;
            }

            if (command.toLowerCase() === 'admin-sexy') {
                addToOutput('Redirecting to Database....');
                saveToLocalStorage();
                window.location.href = 'databaselogin.html';
                return;
            }

            if (command.toLowerCase().startsWith('siep-')) {
                const searchQuery = command.substring(5).trim();
                if (searchQuery) {
                    addToOutput(`Searching Epor for: ${searchQuery}`);
                    saveToLocalStorage();
                    window.location.href = `https://www.eporner.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;
                } else {
                    addToOutput('Please enter a search term after siep-');
                }
                return;
            }

            if (command.toLowerCase().startsWith('open-')) {
                const searchQuery = command.substring(5).trim();
                if (searchQuery) {
                    let countdown = 3;
                    const countdownInterval = setInterval(() => {
                        if (countdown > 0) {
                            addToOutput(`Opening in ${countdown}...`);
                            countdown--;
                        } else {
                            clearInterval(countdownInterval);
                            addToOutput(`Opening Site:-: ${searchQuery}`);
                            saveToLocalStorage();
                            window.location.href = `https://${encodeURIComponent(searchQuery)}`;
                        }
                    }, 1000);
                } else {
                    addToOutput('Please enter a search term after open-');
                }
                return;
            }
            
            // Special handling for Instagram
            if (command.toLowerCase().includes('instagram.com')) {
                addToOutput('Opening Instagram... (may be blocked by browser)');
                saveToLocalStorage();
                window.location.href = 'https://www.instagram.com';
                setTimeout(() => {
                    window.location.href = 'https://www.instagram.com';
                }, 100);
                return;
            }
            
            // Check if it's a URL
            if (isValidUrl(command)) {
                let url = command;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                addToOutput(`Opening ${url} in new tab...`);
                saveToLocalStorage();
                const newWindow = window.location.href = url;
                
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    addToOutput('Popup was blocked! Please allow popups for this site.');
                    addToOutput('Alternatively, try copying and pasting this URL in your browser:');
                    addToOutput(url);
                }
            } else {
                addToOutput(`Command not recognized: ${command}`);
            }
        }
        
        function addToOutput(text) {
            const outputLine = document.createElement('div');
            outputLine.className = 'cmd-output';
            outputLine.textContent = text;
            cmdTerminal.insertBefore(outputLine, cmdTerminal.querySelector('.cmd-line'));
            cmdTerminal.scrollTop = cmdTerminal.scrollHeight;
        }
        
        function isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                const pattern = /^[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}$/;
                return pattern.test(string);
            }
        }
        
        function handleLogin() {
            const username = usernameInput.value.trim();
            if (username === '') {
                alert('Please enter a username');
                return;
            }
            
            // Save username to localStorage
            localStorage.setItem('slideNoteUsername', username);
            
            // Animate login transition
            loginBox.classList.add('hidden');
            
            setTimeout(() => {
                loginContainer.style.display = 'none';
                notepadContainer.style.display = 'flex';
                displayName.textContent = username;
                
                // Load saved content
                loadFromLocalStorage();
                
                // Focus editor after a small delay
                setTimeout(() => {
                    textEditor.focus();
                }, 100);
            }, 300);
        }
        
        function handleLogout() {
            userDropdown.classList.remove('show');
            
            // Clear user data from localStorage
            localStorage.removeItem('slideNoteUsername');
            localStorage.removeItem('slideNoteContent');
            localStorage.removeItem('slideNoteModified');
            
            currentFile = null;
            isModified = false;
            updateCounters();
            
            // Reset history
            editHistory.length = 0;
            historyPointer = -1;
            
            // Show login
            notepadContainer.style.display = 'none';
            loginContainer.style.display = 'flex';
            loginBox.classList.remove('hidden');
            usernameInput.value = '';
            usernameInput.focus();
            
            // Reset terms checkbox
            termsCheckbox.checked = false;
            loginBtn.disabled = true;
            
            // Close CMD if open
            cmdTerminal.classList.remove('show');
        }
        
        function toggleUserDropdown() {
            userDropdown.classList.toggle('show');
        }
        
        function updateCounters() {
            const text = textEditor.value;
            
            // Character count
            charCount.textContent = text.length;
            
            // Line count
            const lines = text.split('\n').length;
            lineCount.textContent = lines;
            
            // Word count
            const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            wordCount.textContent = words;
        }
        
        function handleTextChange() {
            if (!isModified) {
                isModified = true;
            }
            
            // Save to history
            const currentText = textEditor.value;
            if (editHistory[historyPointer] !== currentText) {
                if (historyPointer < editHistory.length - 1) {
                    editHistory.length = historyPointer + 1;
                }
                
                editHistory.push(currentText);
                historyPointer++;
            }
            
            // Save to localStorage on each change
            saveToLocalStorage();
        }
        
        function newFile() {
            if (isModified) {
                if (confirm('You have unsaved changes. Create new file anyway?')) {
                    textEditor.value = '';
                    currentFile = null;
                    isModified = false;
                    updateCounters();
                    saveToLocalStorage();
                }
            } else {
                textEditor.value = '';
                currentFile = null;
                updateCounters();
                saveToLocalStorage();
            }
        }
        
        function saveFile() {
            if (currentFile) {
                // Save to existing file
                saveToFile(currentFile.name, textEditor.value);
                isModified = false;
                saveToLocalStorage();
            } else {
                // Show save as dialog
                saveFileAs();
            }
        }
        
        function saveFileAs() {
            saveFilename.value = currentFile ? currentFile.name : 'document.txt';
            saveDialog.classList.add('show');
            saveFilename.focus();
            saveFilename.select();
        }
        
        function confirmSave() {
            const filename = saveFilename.value.trim();
            if (filename === '') {
                alert('Please enter a filename');
                return;
            }
            
            saveToFile(filename, textEditor.value);
            currentFile = { name: filename };
            isModified = false;
            saveDialog.classList.remove('show');
            saveToLocalStorage();
        }
        
        function saveToFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        }
        
        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                textEditor.value = e.target.result;
                currentFile = file;
                isModified = false;
                updateCounters();
                openDialog.classList.remove('show');
                saveToLocalStorage();
            };
            reader.readAsText(file);
        }
        
        function printFile() {
            window.print();
        }
        
        function undo() {
            if (historyPointer > 0) {
                historyPointer--;
                textEditor.value = editHistory[historyPointer];
                updateCounters();
                saveToLocalStorage();
            }
        }
        
        function redo() {
            if (historyPointer < editHistory.length - 1) {
                historyPointer++;
                textEditor.value = editHistory[historyPointer];
                updateCounters();
                saveToLocalStorage();
            }
        }
        
        function cutText() {
            const selectedText = textEditor.value.substring(
                textEditor.selectionStart,
                textEditor.selectionEnd
            );
            
            if (selectedText) {
                navigator.clipboard.writeText(selectedText);
                
                const start = textEditor.selectionStart;
                const end = textEditor.selectionEnd;
                textEditor.value = textEditor.value.substring(0, start) + textEditor.value.substring(end);
                textEditor.selectionStart = textEditor.selectionEnd = start;
                
                updateCounters();
                handleTextChange();
                saveToLocalStorage();
            }
        }
        
        function copyText() {
            const selectedText = textEditor.value.substring(
                textEditor.selectionStart,
                textEditor.selectionEnd
            );
            
            if (selectedText) {
                navigator.clipboard.writeText(selectedText);
            }
        }
    
  // Disable right-click
  document.addEventListener('contextmenu', event => event.preventDefault());

  // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
  document.addEventListener('keydown', event => {
    if (
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) ||
      (event.ctrlKey && event.key === 'U')
    ) {
      event.preventDefault();
    }
  });


        function pasteText() {
            navigator.clipboard.readText().then(text => {
                const start = textEditor.selectionStart;
                const end = textEditor.selectionEnd;
                textEditor.value = textEditor.value.substring(0, start) + text + textEditor.value.substring(end);
                textEditor.selectionStart = textEditor.selectionEnd = start + text.length;
                
                updateCounters();
                handleTextChange();
                saveToLocalStorage();
            }).catch(err => {
                console.error('Failed to read clipboard: ', err);
            });
        }
