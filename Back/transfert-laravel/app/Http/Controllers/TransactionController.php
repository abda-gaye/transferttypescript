<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function depot(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|exists:clients,phone',
            'type_account' => 'required|string|in:OM,WV,WR,CB',
            'amount' => 'required|numeric|min:500',
        ]);

        $clientPhoneNumber = $request->input('phone');
        $provider = $request->input('type_account');
        $amount = $request->input('amount');

        $client = Client::where('phone', $clientPhoneNumber)->first();

        if (!$client) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        if ($provider === 'WR') {
            // Effectuer le dépôt et générer un code de 15 chiffres pour le destinataire
            $receiverCode = mt_rand(100000000000000, 999999999999999);

            Transaction::create([
                'client_id' => $client->id,
                'montant' => $amount,
                'transfert_type' => 'depot',
                'receiver_phone' => $clientPhoneNumber,
                'code' => $receiverCode,
                'date' => now(),
            ]);

            return response()->json(['message' => 'Deposit successful', 'receiver_code' => $receiverCode], 200);
        }

        $clientAccount = Compte::where('client_id', $client->id)->where('account_type', $provider)->first();

        if (!$clientAccount) {
            return response()->json(['message' => 'Client account not found'], 404);
        }

        if ($amount > $clientAccount->solde) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }

        $clientAccount->solde -= $amount;
        $clientAccount->save();

        Transaction::create([
            'client_id' => $client->id,
            'compte_id' => $clientAccount->id,
            'montant' => $amount,
            'transfert_type' => 'depot',
            'receiver_phone' => $clientPhoneNumber,
            'code' => '',
            'date' => now(),
        ]);

        return response()->json(['message' => 'Deposit successful'], 200);
    }
}
