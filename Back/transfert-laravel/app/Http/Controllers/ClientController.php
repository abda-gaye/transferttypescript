<?php
namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function getFullNameByPhoneNumber($phoneNumber)
    {
        $client = Client::where('phone', $phoneNumber)->first();

        if ($client) {
            return response()->json(['fullname' => $client->fullname]);
        } else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }

    public function checkClientExistence($phone)
    {
        $client = Client::where('phone', $phone)->first();

        if ($client) {
            return response()->json(['exists' => true], 200);
        } else {
            return response()->json(['exists' => false], 200);
        }
    }

    public function addClient(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string',
            'phone' => 'required|string|unique:clients',
        ]);

        $fullname = $request->input('fullname');
        $phone = $request->input('phone');
        $client = new Client();
        $client->fullname = $fullname;
        $client->phone = $phone;
        $client->save();
        return response()->json(['message' => 'Client ajouté avec succès'], 201);
    }

    public function allClient()
{
    return Client::all(['id as clientId', 'fullname']);
}

    public function getClientNameByAccountNumber($accountNumber)
    {
        $client = Client::where('numero_compte', $accountNumber)->first();

        if ($client) {
            return response()->json(['fullname' => $client->fullname]);
        } else {
            return response()->json(['fullname' => 'Client non trouvé'], 404);
        }
    }
}
