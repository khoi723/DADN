const messageBox = document.getElementById('message');

const View = {
        showSuccess: (text) => {
            messageBox.textContent = text;
            messageBox.className = 'message success';
            messageBox.classList.remove('hidden');
        },
        showError: (text) => {
            messageBox.textContent = text;
            messageBox.className = 'message error';
            messageBox.classList.remove('hidden');
        },
        hideMessage: () => {
            messageBox.classList.add('hidden');
        }
    };
export default View;