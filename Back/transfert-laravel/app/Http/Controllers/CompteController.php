<?php

namespace App\Http\Controllers;

use App\Http\Resources\CompteResource;
use App\Models\Client;
use App\Models\Compte;
use Illuminate\Http\Request;

class CompteController extends Controller
{
    public function getCompteClientById($id){
        $Compte = Compte::where('client_id',$id)->first();
        if ($Compte) {
            return $Compte;
        }
        return response()->json(['message' => 'Compte inexistant'], 404);
    }

        public function store(Request $request)
        {
            $request->validate([
                'phone' => 'required',
                'account_type' => 'required|string|in:OM,WV,WR,CB',
                'solde' => 'required|numeric|min:0',
            ]);

            $client = Client::where('phone',$request["phone"])->first();
            $numero_compte =  $request->input('account_type').'_'.$client->phone;
            $compte = new Compte();
            $compte->client_id = $client->id;
            $compte->numero_compte = $numero_compte;
            $compte->account_type = $request->input('account_type');
            $compte->solde = $request->input('solde');
            $compte->save();

            return response()->json(['message' => 'Compte créé avec succès.'], 201);
        }

        public function getAllAccount()
    {
        $comptes = Compte::all();
    return CompteResource::collection($comptes);
    }






}
