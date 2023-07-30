"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const message_1 = require("./message");
const senderPhoneInput = document.querySelector('#senderPhone');
const senderFullnameInput = document.querySelector('#senderFullname');
const amountInput = document.querySelector('#amount');
const providerSelect = document.querySelector('#provider');
const transactionTypeSelect = document.querySelector('#transactionType');
const receiverPhoneInput = document.querySelector('#receiverPhone');
const receiverFullnameInput = document.querySelector('#receiverFullname');
const submitButton = document.querySelector('#submitBtn');
senderPhoneInput.addEventListener('input', async () => {
    const senderPhone = senderPhoneInput.value;
    const fullname = await (0, api_1.fetchFullname)(senderPhone);
    senderFullnameInput.value = fullname;
});
receiverPhoneInput.addEventListener('input', async () => {
    const receiverPhone = receiverPhoneInput.value;
    const fullname = await (0, api_1.fetchFullname)(receiverPhone);
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
        (0, message_1.showMessage)('Veuillez remplir tous les champs.', false);
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
        (0, message_1.showMessage)('Transfert effectué avec succès !', true);
    })
        .catch((error) => {
        console.error(error);
        (0, message_1.showMessage)('Une erreur s\'est produite lors du transfert.', false);
    });
});
