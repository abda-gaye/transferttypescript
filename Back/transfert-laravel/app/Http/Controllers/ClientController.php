<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function getFullNameByPhoneNumber($phoneNumber)
    {
        // Recherchez l'utilisateur dans la base de données par le numéro de téléphone
        $client = Client::where('phone', $phoneNumber)->first();

        // Vérifiez si l'utilisateur a été trouvé
        if ($client) {
            // Renvoyer le fullname de l'utilisateur
            return response()->json(['fullname' => $client->fullname]);
        } else {
            // Renvoyer une réponse indiquant que l'utilisateur n'a pas été trouvé
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }
}
