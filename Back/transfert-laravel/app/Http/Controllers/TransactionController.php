<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Compte;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

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
                'transfert_type' => $request->input('transfert_type'),
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
            'transfert_type' => $request->input('transfert_type'),
            'receiver_phone' => $clientPhoneNumber,
            'code' => '',
            'date' => now(),
        ]);

        return response()->json(['message' => 'Deposit successful'], 200);
    }


    public function transfert(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sender_phone' => 'required|string|exists:clients,phone',
            'receiver_phone' => 'required|string|exists:clients,phone',
            'provider' => 'required|string|in:OM,WV,WR,CB',
            'amount' => 'required|numeric|min:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $senderPhoneNumber = $request->input('sender_phone');
        $receiverPhoneNumber = $request->input('receiver_phone');
        $provider = $request->input('provider');
        $amount = $request->input('amount');

        // Vérifiez si l'émetteur et le destinataire ont des comptes chez le même fournisseur
        $senderClient = Client::where('phone', $senderPhoneNumber)->first();
        $receiverClient = Client::where('phone', $receiverPhoneNumber)->first();

        if (!$senderClient || !$receiverClient) {
            return response()->json(['message' => 'Sender or receiver not found'], 404);
        }

        $senderAccount = Compte::where('client_id', $senderClient->id)->where('account_type', $provider)->first();
        $receiverAccount = Compte::where('client_id', $receiverClient->id)->where('account_type', $provider)->first();

        if (!$senderAccount) {
            return response()->json(['message' => 'Sender account not found'], 404);
        }

        if ($provider !== 'WR' && !$receiverAccount) {
            return response()->json(['message' => 'Receiver account not found'], 404);
        }

        // Vérifiez si le montant du transfert est inférieur au solde du compte de l'émetteur
        if ($amount > $senderAccount->solde) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }

        // Effectuez le transfert en débitant le compte de l'émetteur et en créditant le compte du destinataire
        $senderAccount->solde -= $amount;

        if ($provider === 'WR') {
            // Pour Wari, générer un code de 15 chiffres pour le destinataire
            $receiverCode = mt_rand(100000000000000, 999999999999999);
            Transaction::create([
                'client_id' => $senderClient->id,
                'montant' => $amount,
                'transfert_type' => 'transfert',
                'receiver_phone' => $receiverPhoneNumber,
                'code' => $receiverCode,
                'date' => now(),
            ]);
            return response()->json(['message' => 'Transfert successful', 'receiver_code' => $receiverCode], 200);
        } else {
            $receiverAccount->solde += $amount;

            // Appliquer les frais de transfert en fonction du fournisseur
            switch ($provider) {
                case 'OM':
                case 'WV':
                    $fees = 0.01; // 1% de frais pour OM et WV
                    break;
                case 'CB':
                    $fees = 0.05; // 5% de frais pour CB
                    break;
                default:
                    $fees = 0;
            }

            $feesAmount = $amount * $fees;
            $receiverAccount->solde -= $feesAmount;
        }

        // Sauvegardez les modifications dans la base de données
        $senderAccount->save();

        if ($provider !== 'WR') {
            $receiverAccount->save();
        }

        // Enregistrez la transaction
        Transaction::create([
            'client_id' => $senderClient->id,
            'compte_id' => $senderAccount->id,
            'montant' => $amount,
            'transfert_type' => 'transfert',
            'receiver_phone' => $receiverPhoneNumber,
            'code' => '',
            'date' => now(),
        ]);

        // Répondez avec un message de succès
        return response()->json(['message' => 'Transfert successful'], 200);
    }



    public function retrait(Request $request)
    {
        $request->validate([
            'receiver_phone' => 'required|string',
            'code' => 'required|string',
        ]);

        $receiverPhoneNumber = $request->input('receiver_phone');
        $code = $request->input('code');

        // Vérifier si le destinataire existe
        $receiverClient = Client::where('phone', $receiverPhoneNumber)->first();
        if (!$receiverClient) {
            return response()->json(['message' => 'Receiver client not found'], 404);
        }

        // Vérifier le code de retrait pour les transferts avec code (Wari et CB)
        $transaction = Transaction::where('receiver_phone', $receiverPhoneNumber)
            ->where('code', $code)
            ->where(function ($query) {
                $query->where('transfert_type', 'Wari')
                    ->orWhere('transfert_type', 'CB');
            })
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Invalid code'], 400);
        }

        // Vérifier si le retrait est toujours possible (dans les 24H pour les transferts immédiats)
        $retraitDate = Carbon::parse($transaction->date);
        $currentDate = Carbon::now();
        $diffInHours = $retraitDate->diffInHours($currentDate);

        if ($transaction->transfert_type === 'Wari' || $transaction->transfert_type === 'CB') {
            if ($diffInHours > 24) {
                return response()->json(['message' => 'Withdrawal period expired'], 400);
            }
        }

        // Effectuer le retrait
        $receiverAccount = Compte::where('client_id', $receiverClient->id)
            ->where('account_type', $transaction->transfert_type)
            ->first();

        if (!$receiverAccount) {
            return response()->json(['message' => 'Receiver account not found'], 404);
        }

        $receiverAccount->solde += $transaction->montant;
        $receiverAccount->save();

        // Marquer la transaction comme étant traitée (retrait effectué)
        $transaction->update(['code' => null]);

        return response()->json(['message' => 'Withdrawal successful'], 200);
    }



}
