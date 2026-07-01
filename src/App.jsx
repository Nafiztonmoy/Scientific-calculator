import { useState } from "react";
import "./App.css";

export default function App() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [isRadian, setIsRadian] = useState(false); // Add toggle for degree/radian

  const isOperator = (v) => ["+", "-", "×", "÷", "^"].includes(v);

  const buttons = [
    "C", "⌫", "(", ")", "π", "e",
    "sin", "cos", "tan", "log", "ln", "sqrt",
    "7", "8", "9", "÷", "^", "%",
    "4", "5", "6", "×", "x²", "xʸ",
    "1", "2", "3", "-", ".", "=",
    "0", "+"
  ];

  const roundNice = (num) => {
    const rounded = Math.round((num + Number.EPSILON) * 100000000) / 100000000;
    return String(rounded);
  };

  const getCurrentNumber = (expr) => {
    let i = expr.length - 1;
    while (i >= 0 && !["+", "-", "×", "÷", "^", "(", ")"].includes(expr[i])) {
      i--;
    }
    return expr.slice(i + 1);
  };

  // New helper to wrap trig functions with degree conversion
  const wrapTrigFunction = (func, value) => {
    if (isRadian) {
      return `Math.${func}(${value})`;
    } else {
      return `Math.${func}(${value} * Math.PI / 180)`;
    }
  };

  const append = (value) => {
    setResult("");

    if (value === "C") {
      setExpression("");
      setResult("");
      return;
    }

    if (value === "⌫") {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    // Add degree/radian toggle
    if (value === "DEG/RAD") {
      setIsRadian(!isRadian);
      return;
    }

    if (value === "=") {
      if (!expression) return;

      try {
        // First, process the expression to handle functions
        let prepared = expression
          .replace(/π/g, `(${Math.PI})`)
          .replace(/\be\b/g, `(${Math.E})`)
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/\^/g, "**")
          .replace(/%/g, "/100");

        // Handle trigonometric functions with degree/radian support
        // This is a simplified approach - for complex expressions, you'd need a proper parser
        
        // Replace function names with their JavaScript equivalents
        prepared = prepared
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/log\(/g, "Math.log10(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/sqrt\(/g, "Math.sqrt(");

        // If not in radian mode, wrap trig functions
        if (!isRadian) {
          // Find and convert degree values in trig functions
          // This is a basic implementation - for complex expressions you might need a full parser
          const trigFunctions = ['Math.sin', 'Math.cos', 'Math.tan'];
          trigFunctions.forEach(func => {
            // Simple replacement - works for basic cases
            const regex = new RegExp(`${func}\\(([^)]+)\\)`, 'g');
            prepared = prepared.replace(regex, (match, content) => {
              return `${func}(${content} * Math.PI / 180)`;
            });
          });
        }

        // Auto-close parentheses
        const openParens = (prepared.match(/\(/g) || []).length;
        const closeParens = (prepared.match(/\)/g) || []).length;
        if (openParens > closeParens) {
          prepared += ")".repeat(openParens - closeParens);
        }

        // eslint-disable-next-line no-new-func
        const output = Function(`"use strict"; return (${prepared})`)();

        if (!Number.isFinite(output)) {
          setResult("Error");
          return;
        }

        setResult(roundNice(output));
      } catch (error) {
        console.error("Calculation error:", error);
        setResult("Error");
      }

      return;
    }

    if (value === "x²") {
      if (!expression) return;
      setExpression((prev) => `${prev}^2`);
      return;
    }

    if (value === "xʸ") {
      if (!expression) return;
      setExpression((prev) => `${prev}^`);
      return;
    }

    // Handle function buttons - add parentheses
    if (["sin", "cos", "tan", "log", "ln", "sqrt"].includes(value)) {
      setExpression((prev) => `${prev}${value}(`);
      return;
    }

    if (isOperator(value)) {
      if (!expression) return;

      if (isOperator(expression.slice(-1)) && value !== "-") {
        setExpression((prev) => prev.slice(0, -1) + value);
      } else {
        setExpression((prev) => prev + value);
      }
      return;
    }

    if (value === ".") {
      const current = getCurrentNumber(expression);
      if (current.includes(".")) return;

      if (!expression || isOperator(expression.slice(-1)) || expression.slice(-1) === "(") {
        setExpression((prev) => prev + "0.");
      } else {
        setExpression((prev) => prev + ".");
      }
      return;
    }

    setExpression((prev) => prev + value);
  };

  return (
    <div className="app">
      <div className="calculator">
        <div className="header">
          <p className="title">Scientific Calculator</p>
          <p className="subtitle">React app</p>
          <button 
            className={`mode-toggle ${isRadian ? 'radian' : 'degree'}`}
            onClick={() => setIsRadian(!isRadian)}
          >
            {isRadian ? 'RAD' : 'DEG'}
          </button>
        </div>

        <div className="display">
          <div className="expression">{expression || "0"}</div>
          <div className="result">{result}</div>
        </div>

        <div className="keys">
          {buttons.map((btn) => (
            <button
              key={btn}
              className={`key ${
                btn === "C"
                  ? "clear"
                  : btn === "="
                  ? "equal"
                  : btn === "⌫"
                  ? "delete"
                  : isOperator(btn)
                  ? "operator"
                  : ["sin", "cos", "tan", "log", "ln", "sqrt"].includes(btn)
                  ? "function"
                  : btn === "x²" || btn === "xʸ" || btn === "%"
                  ? "function"
                  : ""
              } ${btn === "=" ? "span-2" : ""}`}
              onClick={() => append(btn)}
            >
              {btn}
            </button>
          ))}
        </div>
        
        <div className="info">
          <span className="mode-label">
            Mode: {isRadian ? 'Radian' : 'Degree'}
          </span>
        </div>
      </div>
    </div>
  );
}