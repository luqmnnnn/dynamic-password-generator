document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generate');
    const copyBtn = document.getElementById('copy');
    const resultDiv = document.getElementById('result');
    const passwordDisplay = document.getElementById('password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');
    const strengthFeedback = document.getElementById('strength-feedback');
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    
    // Character sets
    const charSets = {
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    // Update length value display
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });
    
    // Generate password
    generateBtn.addEventListener('click', function() {
        // Add loading effect
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;
        
        // Small delay for UX purposes
        setTimeout(function() {
            generatePassword();
            generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Password';
            generateBtn.disabled = false;
        }, 300);
    });
    
    function generatePassword() {
        // Get user inputs
        const length = parseInt(lengthSlider.value);
        const keyword = document.getElementById('keyword').value.trim();
        const includeLower = document.getElementById('lowercase').checked;
        const includeUpper = document.getElementById('uppercase').checked;
        const includeNumbers = document.getElementById('numbers').checked;
        const includeSymbols = document.getElementById('symbols').checked;
        
        // Validate inputs
        if (length < 8 || length > 64) {
            showError('Password length must be between 8 and 64 characters');
            return;
        }
        
        if (keyword.length >= length) {
            showError('Keyword must be shorter than the password length');
            return;
        }
        
        if (!includeLower && !includeUpper && !includeNumbers && !includeSymbols) {
            showError('Please select at least one character type');
            return;
        }
        
        // Build character pool based on selected options
        let charPool = '';
        if (includeLower) charPool += charSets.lowercase;
        if (includeUpper) charPool += charSets.uppercase;
        if (includeNumbers) charPool += charSets.numbers;
        if (includeSymbols) charPool += charSets.symbols;
        
        // Generate password with optional keyword
        const password = generatePasswordWithKeyword(length, keyword, charPool);
        
        // Display password and strength
        passwordDisplay.textContent = password;
        updateStrengthMeter(password, keyword);
        resultDiv.style.display = 'block';
        
        // Add highlight animation
        passwordDisplay.classList.add('highlight');
        setTimeout(() => {
            passwordDisplay.classList.remove('highlight');
        }, 1500);
    }
    
    // Show error message
    function showError(message) {
        alert(message);
        generateBtn.innerHTML = '<i class="fas fa-key"></i> Generate Password';
        generateBtn.disabled = false;
    }
    
    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        const password = passwordDisplay.textContent;
        if (!password) return;
        
        navigator.clipboard.writeText(password).then(function() {
            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = 'var(--success)';
            
            setTimeout(function() {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = 'var(--accent)';
            }, 2000);
        }).catch(function() {
            copyBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
            copyBtn.style.background = 'var(--danger)';
            
            setTimeout(function() {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                copyBtn.style.background = 'var(--accent)';
            }, 2000);
        });
    });
    
    // Password generation function keeps keyword intact
    function generatePasswordWithKeyword(length, keyword, charPool) {
        let password = '';
        
        // If keyword is provided, incorporate it without modification
        if (keyword) {
            // Calculate how much randomness we need to add
            const randomLength = length - keyword.length;
            
            // Generate random characters
            for (let i = 0; i < randomLength; i++) {
                password += getRandomChar(charPool);
            }
            
            // Insert keyword at random position
            const insertPos = Math.floor(Math.random() * (randomLength + 1));
            password = password.slice(0, insertPos) + keyword + password.slice(insertPos);
        } else {
            // No keyword - generate completely random password
            for (let i = 0; i < length; i++) {
                password += getRandomChar(charPool);
            }
        }
        
        return password;
    }
    
    // Get random character from pool
    function getRandomChar(pool) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }
    
    // Password strength calculation (adjusted for intact keyword)
    function updateStrengthMeter(password, keyword) {
        let strength = 0;
        const length = password.length;
        
        // Length contributes up to 40 points (8 chars = 0, 64 chars = 40)
        strength += Math.min(40, (length - 8) * (40 / 56));
        
        // Character variety
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        
        const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
        strength += varietyCount * 15; // 15 points per character type
        
        // Deductions for predictable patterns (excluding the keyword)
        if (keyword) {
            const nonKeywordParts = password.split(keyword).join('');
            if (/(.)\1{2,}/.test(nonKeywordParts)) strength -= 15; // Repeated chars in non-keyword
            if (/123|234|345|456|567|678|789/.test(nonKeywordParts)) strength -= 10;
            if (/qwert|asdf|zxcv/.test(nonKeywordParts.toLowerCase())) strength -= 10;
            
            // Small deduction for using a keyword (since it's less random)
            strength = Math.max(0, strength - 5);
            
            // Bonus if keyword is not at start/end
            if (!password.startsWith(keyword) && !password.endsWith(keyword)) {
                strength += 5;
            }
        } else {
            if (/(.)\1{2,}/.test(password)) strength -= 15;
            if (/123|234|345|456|567|678|789/.test(password)) strength -= 10;
            if (/qwert|asdf|zxcv/.test(password.toLowerCase())) strength -= 10;
        }
        
        // Cap between 0 and 100
        strength = Math.max(0, Math.min(100, Math.round(strength)));
        
        // Update visual meter and labels
        strengthBar.style.width = strength + '%';
        
        // Set strength level and feedback
        let strengthText, feedback;
        if (strength < 30) {
            strengthText = "Weak";
            feedback = "Add more length and character types";
            strengthBar.style.background = "var(--danger)";
        } else if (strength < 60) {
            strengthText = "Moderate";
            feedback = "Could be stronger with more complexity";
            strengthBar.style.background = "var(--warning)";
        } else if (strength < 80) {
            strengthText = "Strong";
            feedback = "Good password, but could be better";
            strengthBar.style.background = "#3a86ff";
        } else {
            strengthText = "Very Strong";
            feedback = "Excellent password!";
            strengthBar.style.background = "var(--success)";
        }
        
        strengthLabel.textContent = strengthText;
        strengthFeedback.textContent = feedback;
        
        // Special case for very short passwords
        if (length < 12) {
            strengthFeedback.textContent = "Consider using a longer password for better security";
        }
    }
    
    // Generate a password on page load
    generateBtn.click();
});