const keys = document.querySelectorAll('.key');
const displayInput = document.querySelector('.display .input');
const displayOutput = document.querySelector('.display .output');

let input = "";

// Add keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '(', ')', '%', 'Enter', 'Backspace', 'Escape'];
    
    if (validKeys.includes(key)) {
        e.preventDefault();
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

// Click handlers for calculator keys
for (let key of keys) {
    key.addEventListener('click', () => {
        const value = key.dataset.key;
        handleInput(value);
    });
}

function handleInput(value) {
    if (value === "clear") {
        input = "";
        displayInput.innerHTML = "0";
        displayOutput.innerHTML = "0";
    } else if (value === "backspace") {
        input = input.slice(0, -1);
        displayInput.innerHTML = cleanInput(input) || "0";
    } else if (value === "=") {
        try {
            let result = eval(prepareInput(input));
            
            // Handle division by zero
            if (!isFinite(result)) {
                throw new Error("Division by zero");
            }
            
            // Limit decimal places to 8
            if (result.toString().includes('.')) {
                result = parseFloat(result.toFixed(8));
            }
            
            displayOutput.innerHTML = cleanOutput(result);
        } catch (error) {
            displayOutput.innerHTML = "Error";
            setTimeout(() => {
                displayOutput.innerHTML = "0";
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