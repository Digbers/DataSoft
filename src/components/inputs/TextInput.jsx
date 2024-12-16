import PropTypes from 'prop-types';
import { useState, forwardRef } from 'react';

const TextInput = forwardRef(({ text, setText, placeholder, typeInput, sizeClass = '', onKeyDown, disabled = false }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(text !== "");

  return (
    <div className="relative w-full">
      <label
        className={`absolute left-4 transition-all duration-300 text-purple-600 bg-white bg-opacity-40 rounded-lg ${
          isFocused || text
            ? ` text-sm -top-3 text-purple-600 bg-white bg-opacity-40 rounded-lg`
            : `${sizeClass === 'md' ? 'top-3' : 'top-1'} text-gray-500`
        }`}
        style={{ pointerEvents: "none"}}
      >
        <span
          className={`transition-all duration-100 ${
            isFocused || text ? 'text-purple-600 font-bold bg-white bg-opacity-40 rounded-lg dark:text-purple-50' : 'text-gray-500 dark:text-zinc-100'
          }`}
        >
          {placeholder}
        </span>
      </label>
      <input
        ref={ref}
        className={`w-full text-sm ${sizeClass === 'md' ? 'px-4 py-3' : 'px-2 py-1 h-8'} bg-white bg-opacity-80 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none border-2 focus:border-purple-400`}
        type={typeInput}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}  // Agregar el manejador de onKeyDown
        disabled={disabled}
      />
    </div>
  );
});
// Añadir displayName para el componente
TextInput.displayName = 'TextInput';

// PropTypes
TextInput.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setText: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  typeInput: PropTypes.string.isRequired,
  sizeClass: PropTypes.string,
  onKeyDown: PropTypes.func, // Agregar PropTypes para onKeyDown
  disabled: PropTypes.bool
};

export default TextInput;
