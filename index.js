let isPowered = true;
const calculator = document.querySelector('.calculator');
const powerButton = document.createElement('button');
powerButton.className = 'power-button';
powerButton.innerHTML = '<span class="power-icon"></span>';
calculator.appendChild(powerButton);

const keys = document.querySelectorAll('.key');
const displayInput = document.querySelector('.display .input');
const displayOutput = document.querySelector('.display .output');

let input = "";
let lastResult = "0";

function resetCalculator() {
    input = "";
    displayInput.innerHTML = "0";
    displayOutput.innerHTML = "0";
    lastResult = "0";
}

function togglePower() {
    isPowered = !isPowered;
    
    if (!isPowered) {
        calculator.classList.add('powered-off');
        powerButton.classList.add('off');
        displayInput.innerHTML = "";
        displayOutput.innerHTML = "";
    } else {
        calculator.classList.remove('powered-off');
        powerButton.classList.remove('off');
        resetCalculator();
    }
}

// Power button event listener
powerButton.addEventListener('click', togglePower);

// Add keyboard support for power button
document.addEventListener('keydown', (e) => {
    // Optional: Add keyboard power toggle (e.g., F12 key)
    if (e.key === 'F12') {
        e.preventDefault();
        togglePower();
    }
});

// Modify keyboard support
document.addEventListener('keydown', (e) => {
    if (!isPowered) return; // Prevent keyboard input when powered off
    
    const key = e.key;
    const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '(', ')', '%', 'Enter', 'Backspace', 'Escape'];
    
    if (validKeys.includes(key)) {
        e.preventDefault(); // Prevent default behavior
        if (key === 'Enter') {
            handleInput('=');
        } else if (key === 'Escape') {
            handleInput('clear');
        } else if (key === 'Backspace') {
            handleInput('backspace');
        } else {
            handleInput(key);
        }
    }
});

// Modify event delegation for keys
document.querySelector('.keys').addEventListener('click', (e) => {
    const key = e.target.closest('.key');
    if (key && isPowered) {
        const value = key.dataset.key;
        handleInput(value);
    }
});

function handleInput(value) {
    if (!isPowered) return; // Prevent input when powered off
    
    if (value === "clear") {
        resetCalculator();
    } else if (value === "backspace") {
        // If last result was just calculated, clear everything
        if (displayOutput.innerHTML !== "0" && input === "") {
            resetCalculator();
        } else {
            input = input.slice(0, -1);
            displayInput.innerHTML = cleanInput(input) || "0";
        }
    } else if (value === "=") {
        try {
            // If input is empty, use last result
            const expressionToEvaluate = input || lastResult;
            let result = eval(prepareInput(expressionToEvaluate));
            
            // Handle division by zero
            if (!isFinite(result)) {
                throw new Error("Division by zero");
            }
            
            // Limit decimal places to 8
            if (result.toString().includes('.')) {
                result = parseFloat(result.toFixed(8));
            }
            
            // Store last result and display
            lastResult = result.toString();
            displayOutput.innerHTML = cleanOutput(result);
            
            // Clear input after calculation
            input = "";
            displayInput.innerHTML = "0";
        } catch (error) {
            displayOutput.innerHTML = "Error";
            setTimeout(() => {
                resetCalculator();
            }, 2000);
        }
    } else if (value === "brackets") {
        const openCount = (input.match(/\(/g) || []).length;
        const closeCount = (input.match(/\)/g) || []).length;
        
        if (openCount === closeCount || input.slice(-1) === '(') {
            input += "(";
        } else {
            input += ")";
        }
        
        displayInput.innerHTML = cleanInput(input);
    } else {
        // If last result was just calculated, start a new expression
        if (displayOutput.innerHTML !== "0" && input === "") {
            input = lastResult;
        }
        
        if (validateInput(value)) {
            input += value;
            displayInput.innerHTML = cleanInput(input);
        }
    }
}

function cleanInput(input) {
    let inputArray = input.split("");

    inputArray = inputArray.map(char => {
        switch(char) {
            case "*":
                return ` <span class="operator">×</span> `;
            case "/":
                return ` <span class="operator">÷</span> `;
            case "+":
                return ` <span class="operator">+</span> `;
            case "-":
                return ` <span class="operator">−</span> `;
            case "(":
                return `<span class="brackets">(</span>`;
            case ")":
                return `<span class="brackets">)</span>`;
            case "%":
                return `<span class="percent">%</span>`;
            default:
                return char;
        }
    });

    return inputArray.join("");
}

function cleanOutput(output) {
    let outputString = output.toString();
    
    // Handle exponential notation
    if (outputString.includes('e')) {
        return output.toLocaleString('en-US', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 8 
        });
    }

    let [integerPart, decimalPart] = outputString.split(".");
    
    // Add thousand separators
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    if (decimalPart) {
        return `${integerPart}.${decimalPart}`;
    }
    
    return integerPart;
}

function validateInput(value) {
    const lastInput = input.slice(-1);
    const operators = ["+", "-", "*", "/"];

    // Prevent multiple decimal points in a number
    if (value === ".") {
        const parts = input.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes(".")) {
            return false;
        }
    }

    // Prevent multiple operators in succession
    if (operators.includes(value)) {
        if (operators.includes(lastInput)) {
            return false;
        }
        // Prevent operator at start (except minus)
        if (input === "" && value !== "-") {
            return false;
        }
    }

    return true;
}

function prepareInput(input) {
    // Handle percentage calculations
    let prepared = input.replace(/(\d+\.?\d*)\%/g, (match, number) => {
        return `(${number}/100)`;
    });
    
    return prepared;
}