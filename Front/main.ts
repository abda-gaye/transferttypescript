// Récupérez les éléments HTML
const senderPhoneInput = document.querySelector('#senderPhone') as HTMLInputElement;
const senderFullnameInput = document.querySelector('#senderFullname') as HTMLInputElement;
const amountInput = document.querySelector('#amount') as HTMLInputElement;
const providerSelect = document.querySelector('#provider') as HTMLSelectElement;
const transactionTypeSelect = document.querySelector('#transactionType') as HTMLSelectElement;
const receiverPhoneInput = document.querySelector('#receiverPhone') as HTMLInputElement;
const receiverFullnameInput = document.querySelector('#receiverFullname') as HTMLInputElement;
const submitButton = document.querySelector('#submitBtn') as HTMLButtonElement;
const messageDiv = document.querySelector('#messageDiv') as HTMLDivElement;
const destinataireDiv = document.querySelector('#destinataireDiv') as HTMLDivElement;
const transactionLabel = document.getElementById('transactionLabel') as HTMLLabelElement;
const viewHistoryBtn = document.getElementById('viewHistoryBtn') as HTMLButtonElement;
const transactionHistoryDiv = document.getElementById('transactionHistoryDiv') as HTMLDivElement;

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

async function checkClientExistence(phone: string): Promise<boolean> {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/checkClientExistence/${phone}`);
        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function updateSenderFullname() {
    const senderPhone = senderPhoneInput.value;
    const fullname = await fetchFullname(senderPhone);
    senderFullnameInput.value = fullname;

    const clientExists = await checkClientExistence(senderPhone);
    viewHistoryBtn.style.display = clientExists ? 'inline-block' : 'none';
}

async function updateReceiverFullname() {
    const receiverPhone = receiverPhoneInput.value;
    const fullname = await fetchFullname(receiverPhone);
    receiverFullnameInput.value = fullname;
}

function showDestinataire(show: boolean) {
    destinataireDiv.style.display = show ? 'block' : 'none';
}

transactionTypeSelect.addEventListener('change', () => {
    const selectedTransaction = transactionTypeSelect.value;
    showDestinataire(selectedTransaction !== 'retrait');
});

senderPhoneInput.addEventListener('input', updateSenderFullname);

receiverPhoneInput.addEventListener('input', updateReceiverFullname);

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
        messageDiv.textContent = 'Transfert effectué avec succès !';
        messageDiv.classList.remove('hidden', 'bg-red-500');
        messageDiv.classList.add('bg-green-500');

        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.add('hidden');
        }, 5000);
    })
    .catch((error) => {
        console.error(error);
        messageDiv.textContent = 'Une erreur s\'est produite lors du transfert.';
        messageDiv.classList.remove('hidden', 'bg-green-500');
        messageDiv.classList.add('bg-red-500');

        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.classList.add('hidden');
        }, 5000);
    });
});

// Au chargement initial, masquer la partie destinataire
showDestinataire(false);

// Ajoutez un écouteur d'événements pour le changement de la liste déroulante des fournisseurs
providerSelect.addEventListener('change', () => {
    const selectedProvider = providerSelect.value;
    switch (selectedProvider) {
        case 'OM':
            transactionLabel.style.backgroundColor = 'orange';
            break;
        case 'WV':
            transactionLabel.style.backgroundColor = 'blue';
            break;
        case 'WR':
            transactionLabel.style.backgroundColor = '#93441A';
            break;
        case 'CB':
            transactionLabel.style.backgroundColor = '#CA3C66';
            break;
        default:
            transactionLabel.style.backgroundColor = 'transparent';
            break;
    }
});

// Afficher l'historique des transactions du client
viewHistoryBtn.addEventListener('click', async () => {
    const senderPhone = senderPhoneInput.value;
    const historyResponse = await fetch(`http://localhost:8000/api/transaction/history/${senderPhone}`);
    const historyData = await historyResponse.json();

    if (historyData.length === 0) {
        transactionHistoryDiv.textContent = 'Aucune transaction trouvée.';
    } else {
        transactionHistoryDiv.textContent = ''; // Effacer le contenu précédent
        const ul = document.createElement('ul');
        historyData.forEach((transaction: any) => {
            const li = document.createElement('li');
            li.textContent = `Date: ${transaction.date}, Montant: ${transaction.montant}, Type: ${transaction.transfert_type}`;
            ul.appendChild(li);
        });
        transactionHistoryDiv.appendChild(ul);
    }
});

// ... (Le reste du code)
