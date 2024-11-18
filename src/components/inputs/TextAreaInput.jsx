
import PropTypes from 'prop-types';
import { useState } from 'react';

const TextAreaInput = ({ text, setText, placeholder, typeInput, disabled = false }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(text !== "");

  return (
    <div className="relative w-full">
      <label
        className={`absolute left-4 transition-all duration-300 ${
          isFocused || text
            ? "text-sm -top-3 text-purple-600 font-bold"
            : "top-1 text-gray-500"
        }`}
        style={{ pointerEvents: 'none', WebkitTextStroke: '0.2px white' }} 
      >
        <span
          className={`transition-all duration-100 ${
            isFocused || text ? 'text-purple-600 dark:text-purple-50' : 'text-gray-500 dark:text-zinc-100'
          }`}
        >
          {placeholder}
        </span>
      </label>
      <input
        className="w-full h-8 text-sm px-2 py-1 bg-white dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none border-2 focus:border-purple-400"
        type={typeInput}
        value={text}
        onChange={(e) => setText(e)}  // Pasa el evento completo
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      />

    </div>
  );
}

TextAreaInput.propTypes = {
  text: PropTypes.string.isRequired,
  setText: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  typeInput: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
}

export default TextAreaInput;
