"use strict";
// Récupérez les éléments HTML
const senderPhoneInput = document.getElementById('senderPhone');
const senderFullnameInput = document.getElementById('senderFullname');
const amountInput = document.getElementById('amount');
const providerSelect = document.getElementById('provider');
const transactionTypeSelect = document.getElementById('transactionType');
const receiverPhoneInput = document.getElementById('receiverPhone');
const receiverFullnameInput = document.getElementById('receiverFullname');
const submitButton = document.getElementById('submitBtn');
const messageDiv = document.getElementById('messageDiv');
submitButton.addEventListener('click', () => {
    const senderPhone = senderPhoneInput.value;
    const senderFullname = senderFullnameInput.value;
    const amount = parseFloat(amountInput.value);
    const provider = providerSelect.value;
    const transactionType = transactionTypeSelect.value;
    const receiverPhone = receiverPhoneInput.value;
    const receiverFullname = receiverFullnameInput.value;
    if (senderPhone === '' || provider === '' || transactionType === '' || receiverPhone === '') {
        messageDiv.textContent = 'Veuillez remplir tous les champs.';
        messageDiv.classList.remove('hidden', 'bg-green-500');
        messageDiv.classList.add('bg-red-500');
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.add('hidden');
        }, 1000);
        return;
    }
    fetch('http://127.0.0.1:8000/api/transaction/transfert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender_phone: senderPhone,
            provider: provider,
            amount: amount,
            transfert_type: transactionType,
            receiver_phone: receiverPhone,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
        console.log(data);
        messageDiv.textContent = 'Dépôt effectué avec succès !';
        messageDiv.classList.remove('hidden', 'bg-red-500');
        messageDiv.classList.add('bg-green-500');
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.add('hidden');
        }, 5000);
    })
        .catch((error) => {
        // Gérez les erreurs ici
        console.error(error);
        messageDiv.textContent = 'Une erreur s\'est produite lors du dépôt.';
        messageDiv.classList.remove('hidden', 'bg-green-500');
        messageDiv.classList.add('bg-red-500');
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.add('hidden');
        }, 5000);
    });
});
