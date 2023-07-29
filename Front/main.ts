// Récupérez les éléments HTML
const senderPhoneInput = document.getElementById('senderPhone') as HTMLInputElement;
const senderFullnameInput = document.getElementById('senderFullname') as HTMLInputElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const providerSelect = document.getElementById('provider') as HTMLSelectElement;
const transactionTypeSelect = document.getElementById('transactionType') as HTMLSelectElement;
const receiverPhoneInput = document.getElementById('receiverPhone') as HTMLInputElement;
const receiverFullnameInput = document.getElementById('receiverFullname') as HTMLInputElement;
const submitButton = document.getElementById('submitBtn') as HTMLButtonElement;
const messageDiv = document.getElementById('messageDiv') as HTMLDivElement;

async function fetchFullname(phone: string): Promise<string> {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/getFullName/${phone}`);
        const data = await response.json();
        return data.fullname;
    } catch (error) {
        console.error(error);
        return '';
    }
}

// Événement "input" pour le champ de numéro de téléphone de l'expéditeur
senderPhoneInput.addEventListener('input', async () => {
    const senderPhone = senderPhoneInput.value;
    const fullname = await fetchFullname(senderPhone);
    senderFullnameInput.value = fullname;
});

// Événement "input" pour le champ de numéro de téléphone du destinataire
receiverPhoneInput.addEventListener('input', async () => {
    const receiverPhone = receiverPhoneInput.value;
    const fullname = await fetchFullname(receiverPhone);
    receiverFullnameInput.value = fullname;
});

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
        }, 5000);
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
