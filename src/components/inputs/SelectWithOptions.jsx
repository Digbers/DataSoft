import PropTypes from "prop-types";
import { useState } from "react";

const SelectWithOptions = ({
    options,
    placeholder,
    sizeClass = "",
    disabled = false,
    onChange,
    defaultValue = null, // Valor inicial predeterminado
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [selectedOption, setSelectedOption] = useState(defaultValue);
  
    const handleFocus = () => setIsFocused(true);
  
    const handleBlur = () => setIsFocused(false);
  
    const handleChange = (e) => {
      const selectedValue = e.target.value;
      //console.log(typeof selectedValue);
      //parseInt(selectedValue);
      const selectedObj = options.find((option) => option.value === parseInt(selectedValue));
      //console.log(selectedObj);
      //console.log(options);
      setSelectedOption(selectedObj);
      onChange(selectedObj);
    };
  
    return (
      <div className="relative w-full">
        <label
          className={`absolute left-4 transition-all duration-300 text-purple-600 bg-white bg-opacity-40 rounded-lg
            ${isFocused || selectedOption
              ? "text-sm -top-3 text-purple-600 bg-white bg-opacity-40 rounded-lg"
              : `${sizeClass === "md" ? "top-3" : "top-1"} text-gray-500`
            }`}
          style={{ pointerEvents: "none", WebkitTextStroke: "0.2px white" }}
        >
          <span
            className={`transition-all duration-100 font-bold
              ${isFocused || selectedOption ? "text-purple-600 font-bold bg-white bg-opacity-40 rounded-lg dark:text-purple-50" : "text-gray-500 dark:text-zinc-100"
              }`}
          >
            {placeholder}
          </span>
        </label>
        <select
          className={`w-full text-sm ${sizeClass === "md" ? "px-4 py-3" : "px-2 py-1 h-8"} bg-white bg-opacity-80 dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none border-2 focus:border-purple-400`}
          value={selectedOption?.value || ""}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
  
          {options.map((option, index) => (
            <option key={index} value={option.value} data-code={option.data} data-tipo={option.tipo}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

SelectWithOptions.propTypes = {
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string.isRequired,
  sizeClass: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.object,
};

export default SelectWithOptions;
