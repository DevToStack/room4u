const Snackbar = ({ message, type }) => {
    return (
        <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-md text-sm 
          ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
            {message}
        </div>
    );
};

export default Snackbar;