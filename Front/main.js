"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function fetchFullname(phone) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`http://127.0.0.1:8000/api/getFullName/${phone}`);
            const data = yield response.json();
            return data.fullname;
        }
        catch (error) {
            console.error(error);
            return '';
        }
    });
}
// Événement "input" pour le champ de numéro de téléphone de l'expéditeur
senderPhoneInput.addEventListener('input', () => __awaiter(void 0, void 0, void 0, function* () {
    const senderPhone = senderPhoneInput.value;
    const fullname = yield fetchFullname(senderPhone);
    senderFullnameInput.value = fullname;
}));
// Événement "input" pour le champ de numéro de téléphone du destinataire
receiverPhoneInput.addEventListener('input', () => __awaiter(void 0, void 0, void 0, function* () {
    const receiverPhone = receiverPhoneInput.value;
    const fullname = yield fetchFullname(receiverPhone);
    receiverFullnameInput.value = fullname;
}));
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
