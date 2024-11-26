import PropTypes from "prop-types";
import { useState } from "react";

const SelectInput = ({ value, setValue, options, placeholder, sizeClass = '', disabled = false }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);

    const handleBlur = () => setIsFocused(false);

    return (
        <div className="relative w-full">
            <label
                className={`absolute left-4 transition-all duration-300 text-purple-600 bg-white bg-opacity-40 rounded-lg
                    ${isFocused || value
                        ? "text-sm -top-3 text-purple-600 bg-white bg-opacity-40 rounded-lg"
                        : `${sizeClass === 'md' ? 'top-3' : 'top-1'} text-gray-500`
                    }`}
                style={{ pointerEvents: "none", WebkitTextStroke: "0.2px white" }}
            >
                <span
                    className={`transition-all duration-100 font-bold
                        ${isFocused || value ? " text-purple-600 font-bold bg-white bg-opacity-40 rounded-lg dark:text-purple-50" : "text-gray-500 dark:text-zinc-100"
                        }`}
                >
                    {placeholder}
                </span>
            </label>
            <select
                className={`w-full text-sm ${sizeClass === 'md' ? 'px-4 py-3' : 'px-2 py-1 h-8'} bg-white bg-opacity-80 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none border-2 focus:border-purple-400`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
            >
                {/* Agregar una opción vacía para cuando no haya ningún valor seleccionado */}
                <option value="" disabled hidden></option>
                
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
SelectInput.propTypes = {
    value: PropTypes.string.isRequired,
    setValue: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    placeholder: PropTypes.string.isRequired,
    sizeClass: PropTypes.string,
    disabled: PropTypes.bool,
};

export default SelectInput;
