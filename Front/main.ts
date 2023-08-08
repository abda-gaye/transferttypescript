enum TransactionType {
  Depot = "depot",
  Retrait = "retrait",
  Transfert = "transfert",
}

const openModalBtn = document.getElementById(
  "openModalBtn"
) as HTMLButtonElement;
const addClientModal = document.getElementById(
  "addClientModal"
) as HTMLDivElement;
const closeModalBtn = document.getElementById(
  "closeModalBtn"
) as HTMLButtonElement;
const addClientForm = document.getElementById(
  "addClientForm"
) as HTMLFormElement;
const senderPhoneInput = document.querySelector(
  "#senderPhone"
) as HTMLInputElement;
const senderFullnameInput = document.querySelector(
  "#senderFullname"
) as HTMLInputElement;
const amountInput = document.querySelector("#amount") as HTMLInputElement;
const providerSelect = document.querySelector("#provider") as HTMLSelectElement;
const transactionTypeSelect = document.querySelector(
  "#transactionType"
) as HTMLSelectElement;
const receiverPhoneInput = document.querySelector(
  "#receiverPhone"
) as HTMLInputElement;
const receiverFullnameInput = document.querySelector(
  "#receiverFullname"
) as HTMLInputElement;
const submitButton = document.querySelector("#submitBtn") as HTMLButtonElement;
const messageDiv = document.querySelector("#messageDiv") as HTMLDivElement;
const destinataireDiv = document.querySelector(
  "#destinataireDiv"
) as HTMLDivElement;
const transactionLabel = document.getElementById(
  "transactionLabel"
) as HTMLLabelElement;
const viewHistoryBtn = document.getElementById(
  "viewHistoryBtn"
) as HTMLButtonElement;
const transactionHistoryDiv = document.getElementById(
  "transactionHistoryDiv"
) as HTMLDivElement;
const filterForm = document.getElementById("filterForm") as HTMLFormElement;
const filterDateInput = document.getElementById(
  "filterDate"
) as HTMLInputElement;
const filterAmountInput = document.getElementById(
  "filterAmount"
) as HTMLInputElement;
const filterPhoneInput = document.getElementById(
  "filterPhone"
) as HTMLInputElement;
const resetFilterBtn = document.getElementById(
  "resetFilterBtn"
) as HTMLButtonElement;

async function updateSenderFullname() {
  const senderPhone = senderPhoneInput.value;
  const fullname = await fetchFullname(senderPhone);
  senderFullnameInput.value = fullname;

  const clientExists = await checkClientExistence(senderPhone);
  viewHistoryBtn.style.display = clientExists ? "inline-block" : "none";
}

async function updateReceiverFullname() {
  const receiverPhone = receiverPhoneInput.value;
  const fullname = await fetchFullname(receiverPhone);
  receiverFullnameInput.value = fullname;
}

function showDestinataire(show: boolean) {
  destinataireDiv.style.display = show ? "block" : "none";
}
if (transactionTypeSelect) {
  transactionTypeSelect.addEventListener("change", () => {
    const selectedTransaction = transactionTypeSelect.value;
    showDestinataire(selectedTransaction !== TransactionType.Retrait);
  });
}

senderPhoneInput.addEventListener("input", updateSenderFullname);
receiverPhoneInput.addEventListener("input", updateReceiverFullname);

submitButton.addEventListener("click", async () => {
  await submitTransaction();
});

showDestinataire(false);

providerSelect.addEventListener("change", () => {
  const selectedProvider = providerSelect.value;
  switch (selectedProvider) {
    case "OM":
      transactionLabel.style.backgroundColor = "orange";
      break;
    case "WV":
      transactionLabel.style.backgroundColor = "blue";
      break;
    case "WR":
      transactionLabel.style.backgroundColor = "#93441A";
      break;
    case "CB":
      transactionLabel.style.backgroundColor = "#CA3C66";
      break;
    default:
      transactionLabel.style.backgroundColor = "transparent";
      break;
  }
});

viewHistoryBtn.addEventListener("click", async () => {
  const senderPhone = senderPhoneInput.value;
  const historyResponse = await fetch(
    `http://localhost:8000/api/transaction/history/${senderPhone}`
  );
  const historyData = await historyResponse.json();

  if (historyData.length === 0) {
    transactionHistoryDiv.textContent = "Aucune transaction trouvée.";
  } else {
    transactionHistoryDiv.textContent = "";
    const ul = document.createElement("ul");
    historyData.forEach((transaction: any) => {
      const li = document.createElement("li");
      li.textContent = `Date: ${transaction.date}, Montant: ${transaction.montant}, Type: ${transaction.transfert_type}`;
      ul.appendChild(li);
    });
    transactionHistoryDiv.appendChild(ul);
  }
});

function openModal() {
  addClientModal.style.display = "flex";
}

function closeModal() {
  addClientModal.style.display = "none";
}

openModalBtn.addEventListener("click", () => {
  openModal();
});

closeModalBtn.addEventListener("click", () => {
  closeModal();
});

addClientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fullname = (document.getElementById("fullname") as HTMLInputElement)
    .value;
  const phone = (document.getElementById("phone") as HTMLInputElement).value;
  fetch("http://127.0.0.1:8000/api/addClient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullname, phone }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
      } else {
        alert("Une erreur est survenue lors de l'ajout du client.");
      }
      closeModal();
    })
    .catch((error) => {
      console.error("Erreur lors de la requête POST:", error);
      alert("Une erreur est survenue lors de la requête.");
    });
});

function filterTransactions(transactions: any[]) {
  const filterDate = filterDateInput.value;
  const filterAmount = parseFloat(filterAmountInput.value);
  const filterPhone = filterPhoneInput.value;

  return transactions.filter((transaction) => {
    let isMatch = true;
    if (filterDate !== "") {
      isMatch = isMatch && transaction.date.includes(filterDate);
    }
    if (!isNaN(filterAmount)) {
      isMatch = isMatch && transaction.montant === filterAmount;
    }
    if (filterPhone !== "") {
      isMatch =
        isMatch &&
        (transaction.sender_phone.includes(filterPhone) ||
          transaction.receiver_phone.includes(filterPhone));
    }
    return isMatch;
  });
}

async function displayFilteredHistory() {
  const senderPhone = senderPhoneInput.value;
  const historyResponse = await fetch(
    `http://localhost:8000/api/transaction/history/${senderPhone}`
  );
  const historyData = await historyResponse.json();

  const filteredTransactions = filterTransactions(historyData);

  if (filteredTransactions.length === 0) {
    transactionHistoryDiv.textContent = "Aucune transaction trouvée.";
  } else {
    transactionHistoryDiv.textContent = "";
    const ul = document.createElement("ul");
    filteredTransactions.forEach((transaction: any) => {
      const li = document.createElement("li");
      li.textContent = `Date: ${transaction.date}, Montant: ${transaction.montant}, Type: ${transaction.transfert_type}`;
      ul.appendChild(li);
    });
    transactionHistoryDiv.appendChild(ul);
  }
}

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  displayFilteredHistory();
});

resetFilterBtn.addEventListener("click", (event) => {
  event.preventDefault();
  filterForm.reset();
  displayFilteredHistory();
});
async function fetchFullname(phone: string): Promise<string> {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/getFullName/${phone}`
    );
    const data = await response.json();
    return data.fullname;
  } catch (error) {
    console.error(error);
    return "";
  }
}

async function checkClientExistence(phone: string): Promise<boolean> {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/checkClientExistence/${phone}`
    );
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// ...

const createAccountBtn = document.getElementById(
  "createAccountBtn"
) as HTMLButtonElement;
createAccountBtn.addEventListener("click", () => {
  openCreateAccountModal();
  loadClients();
});

function openCreateAccountModal() {
  const createAccountModal = document.getElementById(
    "createAccountModal"
  ) as HTMLDivElement;
  createAccountModal.style.display = "flex";
}

// async function loadClients() {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/api/allclient");
//     const data = await response.json();
//     const clientSelect = document.getElementById(
//       "clientSelect"
//     ) as HTMLSelectElement;
//     clientSelect.innerHTML = "";

//     data.forEach((client: any) => {
//       const option = document.createElement("option");
//       option.value = client.clientId;
//       option.textContent = client.fullname;
//       clientSelect.appendChild(option);
//     });
//   } catch (error) {
//     console.error("Erreur lors du chargement des clients:", error);
//   }
// }

function closeCreateAccountModal() {
  const createAccountModal = document.getElementById(
    "createAccountModal"
  ) as HTMLDivElement;
  createAccountModal.style.display = "none";
}

const closeAccountModalBtn = document.getElementById(
  "closeAccountModalBtn"
) as HTMLButtonElement;
closeAccountModalBtn.addEventListener("click", () => {
  closeCreateAccountModal();
});

const createAccountForm = document.getElementById(
  "createAccountForm"
) as HTMLFormElement;
createAccountForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const clientSelect = document.getElementById("clientSelect") as HTMLSelectElement;
  const accountType = document.getElementById("accountType") as HTMLSelectElement;
  const initialBalanceInput = document.getElementById("initialBalance") as HTMLInputElement;

  const selectedClientOption = clientSelect.options[clientSelect.selectedIndex];
  const selectedClientId = +selectedClientOption.value;
  const selectedAccountType = accountType.value;
  const initialBalance = parseFloat(initialBalanceInput.value);

  if (!selectedClientId || !selectedAccountType || isNaN(initialBalance)) {
    alert("Veuillez remplir tous les champs du formulaire.");
    return;
  }




  fetch("http://127.0.0.1:8000/api/createCompte", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: selectedClientId,
      account_type: selectedAccountType,
      solde: initialBalance,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.message) {
        alert("Le compte a été créé avec succès.");
        closeCreateAccountModal();
      } else {
        alert("Une erreur est survenue lors de la création du compte.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête POST:", error);
      alert("Une erreur est survenue lors de la requête.");
    });
});

async function submitTransaction() {
  const senderPhone = senderPhoneInput.value;
  const senderFullname = senderFullnameInput.value;
  const amount = parseFloat(amountInput.value);
  const provider = providerSelect.value;
  const transactionType = transactionTypeSelect.value;
  const receiverPhone = receiverPhoneInput.value;
  const receiverFullname = receiverFullnameInput.value;
  console.log(transactionType);

  if (
    !senderPhone ||
    !senderFullname ||
    isNaN(amount) ||
    !provider ||
    !transactionType
  ) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  const transaction: any = {
    sender_phone: senderPhone,
    sender_fullname: senderFullname,
    amount: amount,
    provider: provider,
    transaction_type: transactionType,
  };
  let deposit: any = {};
  if (transactionType === TransactionType.Transfert) {
    if (amount < 500) {
      alert("le montant doit etre superieur à 500");
    }
    if (!receiverPhone || !receiverFullname) {
      alert("Veuillez remplir tous les champs du destinataire.");
      return;
    }
    transaction["receiver_phone"] = receiverPhone;
    transaction["receiver_fullname"] = receiverFullname;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transaction/transfert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        }
      );

      const data = await response.json();
      if (data.message) {
        alert(data.message);
      } else {
        alert(
          "Une erreur est survenue lors de la soumission de la transaction."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la requête POST:", error);
      alert("Une erreur est survenue lors de la requête.");
    }
  } else if (transactionType == "depot") {
    if (amount < 500) {
      alert("le montant doit etre superieur à 500");
    }
    const receiverPhoneNumber = receiverPhone;

    const deposit: any = {
      sender_phone: senderPhone,
      receiver_phone: receiverPhoneNumber,
      amount: amount,
      provider: provider,
      transfert_type: "depot",
    };
    console.log(JSON.stringify(deposit));

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transaction/depot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deposit),
        }
      );

      const datas = await response.json();

      if (datas.message) {
        messageDiv.textContent = datas.message;
        messageDiv.classList.remove("hidden");
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 3000);
      } else {
        alert(
          "Une erreur est survenue lors de la soumission de la transaction."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la requête POST:", error);
      alert("Une erreur est survenue.");
    }
  }
}
