import PropTypes from 'prop-types';
import { useState } from 'react';

const PasswordInput = ({ password, setPassword, showPassword, setShowPassword, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(password !== "");
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="relative w-full">
      <label
        className={`absolute left-4 transition-all duration-300 ${
          isFocused || password
            ? "text-sm -top-3 text-purple-600 font-bold"
            : "top-3 text-gray-500 "
        }`}
        style={{ pointerEvents: 'none'}}
      >
        <span className={`transition-all duration-100 ${isFocused || password ? 'text-purple-600 dark:text-purple-50 bg-white rounded-lg' : 'text-gray-500 dark:text-zinc-100'}`}>
          {placeholder}
        </span>
      </label>
      <input
        className="w-full text-sm px-4 py-3 bg-white dark:bg-gray-600 border-gray-300 rounded-md shadow-sm focus:outline-none border-2 focus:border-purple-400"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
        onClick={togglePasswordVisibility}
      >
        <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
      </button>
    </div>
  );
};
PasswordInput.propTypes = {
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  setShowPassword: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired
};

export default PasswordInput;