import PropTypes from 'prop-types';
const TextInput = ({ text, setText }) => {

    return (
        <div>
            <input className=' w-full text-sm  px-4 py-3 bg-gray-200 focus:bg-gray-100 border  border-gray-200 rounded-lg focus:outline-none focus:border-purple-400'
            placeholder="Usuario"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            />
        </div>
    );
}

TextInput.propTypes = {
    text: PropTypes.string.isRequired,
    setText: PropTypes.func.isRequired
}

export default TextInput