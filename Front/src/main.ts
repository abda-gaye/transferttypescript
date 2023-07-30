
import { fetchFullname } from './api';
import { showMessage } from './message';

const senderPhoneInput = document.querySelector('#senderPhone') as HTMLInputElement;
const senderFullnameInput = document.querySelector('#senderFullname') as HTMLInputElement;
const amountInput = document.querySelector('#amount') as HTMLInputElement;
const providerSelect = document.querySelector('#provider') as HTMLSelectElement;
const transactionTypeSelect = document.querySelector('#transactionType') as HTMLSelectElement;
const receiverPhoneInput = document.querySelector('#receiverPhone') as HTMLInputElement;
const receiverFullnameInput = document.querySelector('#receiverFullname') as HTMLInputElement;
const submitButton = document.querySelector('#submitBtn') as HTMLButtonElement;

senderPhoneInput.addEventListener('input', async () => {
    const senderPhone = senderPhoneInput.value;
    const fullname = await fetchFullname(senderPhone);
    senderFullnameInput.value = fullname;
});

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
        showMessage('Veuillez remplir tous les champs.', false);
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
        showMessage('Transfert effectué avec succès !', true);
    })
    .catch((error) => {
        console.error(error);
        showMessage('Une erreur s\'est produite lors du transfert.', false);
    });
});
