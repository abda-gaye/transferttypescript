// message.ts

// Fonction pour afficher un message
export function showMessage(message: string, isSuccess: boolean) {
    const messageDiv = document.getElementById('messageDiv') as HTMLDivElement;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden', isSuccess ? 'bg-red-500' : 'bg-green-500');
    messageDiv.classList.add(isSuccess ? 'bg-green-500' : 'bg-red-500');

    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.classList.add('hidden');
    }, 5000);
}
