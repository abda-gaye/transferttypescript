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
        $validatedData = $request->validate([
            'sender_phone' => 'required',
            'receiver_phone' => 'required',
            'provider' => 'required',
            'amount' => 'required|numeric',
            'transfert_type' => 'required|in:depot',
        ]);

        $senderClient = Client::where('phone', $validatedData['sender_phone'])->first();

        if (!$senderClient) {
            return response()->json(['message' => 'L\'expéditeur (client) n\'existe pas.'], 400);
        }
        $client = Client::where("phone", $validatedData['receiver_phone'])->first();
        $receveur = Compte::where('client_id', $client->id)->first();
        $receiver = Compte::where('numero_compte', $receveur->numero_compte)->first();
        if (!$receiver) {
            return response()->json(['message' => 'Le destinataire doit avoir un compte.'], 400);
        }
        $transaction = new Transaction();
        $transaction->client_id = $senderClient->id;
        $transaction->montant = $validatedData['amount'];
        $transaction->transfert_type = $validatedData['transfert_type'];
        $transaction->receiver_phone = explode("_", $receveur->numero_compte)[1];
        $transaction->date = now();
        $transaction->save();
        $receveur->solde += $validatedData['amount'];
        $receveur->save();

        return response()->json(['message' => 'Dépôt effectué avec succès.']);
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

        if ($amount > $senderAccount->solde) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }

        $senderAccount->solde -= $amount;

        if ($provider == 'WR') {
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

            switch ($provider) {
                case 'OM':
                case 'WV':
                    $fees = 0.01;
                    break;
                case 'CB':
                    $fees = 0.05;
                    break;
                default:
                    $fees = 0;
            }

            $feesAmount = $amount * $fees;
            $receiverAccount->solde -= $feesAmount;
        }

        $senderAccount->save();

        if ($provider !== 'WR') {
            $receiverAccount->save();
        }

        Transaction::create([
            'client_id' => $senderClient->id,
            'compte_id' => $senderAccount->id,
            'montant' => $amount,
            'transfert_type' => 'transfert',
            'receiver_phone' => $receiverPhoneNumber,
            'code' => '',
            'date' => now(),
        ]);

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

        $receiverClient = Client::where('phone', $receiverPhoneNumber)->first();
        if (!$receiverClient) {
            return response()->json(['message' => 'Receiver client not found'], 404);
        }

        $transaction = Transaction::where('receiver_phone', $receiverPhoneNumber)
            ->where('code', $code)
            ->where(function ($query) {
                $query->where('transfert_type', 'WR')
                    ->orWhere('transfert_type', 'CB');
            })
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Invalid code'], 400);
        }

        $retraitDate = Carbon::parse($transaction->date);
        $currentDate = Carbon::now();
        $diffInHours = $retraitDate->diffInHours($currentDate);

        if ($transaction->transfert_type === 'WR' || $transaction->transfert_type === 'CB') {
            if ($diffInHours > 24) {
                return response()->json(['message' => 'code expiré'], 400);
            }
        }

        $receiverAccount = Compte::where('client_id', $receiverClient->id)
            ->where('account_type', $transaction->transfert_type)
            ->first();

        if (!$receiverAccount) {
            return response()->json(['message' => 'Receiver account not found'], 404);
        }

        $receiverAccount->solde += $transaction->montant;
        $receiverAccount->save();

        $transaction->update(['code' => null]);

        return response()->json(['message' => 'Withdrawal successful'], 200);
    }

    public function getClientTransactionHistory($phone)
    {
        $client = Client::where('phone', $phone)->first();

        if (!$client) {
            return response()->json(['error' => 'Client not found'], 404);
        }

        $transactions = Transaction::where('client_id', $client->id)->get();

        return response()->json($transactions);
    }

    
}
