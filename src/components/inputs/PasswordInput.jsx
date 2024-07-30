import PropTypes from 'prop-types';
const PasswordInput = ({ password, setPassword, showPassword, setShowPassword }) => {
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        className='text-sm px-4 py-3 rounded-lg w-full bg-gray-200 focus:bg-gray-100 border border-gray-200 focus:outline-none focus:border-purple-400'
        placeholder='Contraseña'
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
  };

export default PasswordInput;
