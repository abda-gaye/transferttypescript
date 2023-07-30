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

}
