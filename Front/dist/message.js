"use strict";
// message.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.showMessage = void 0;
// Fonction pour afficher un message
function showMessage(message, isSuccess) {
    const messageDiv = document.getElementById('messageDiv');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden', isSuccess ? 'bg-red-500' : 'bg-green-500');
    messageDiv.classList.add(isSuccess ? 'bg-green-500' : 'bg-red-500');
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.classList.add('hidden');
    }, 5000);
}
exports.showMessage = showMessage;
