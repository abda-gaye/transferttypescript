<?php
namespace Database\Factories;

use App\Models\Client;
use App\Models\Compte;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompteFactory extends Factory
{
    public function definition(): array
    {
        $phonePrefixes = ['77', '76', '70', '78', '75'];
        $provider = $this->faker->randomElement(['OM', 'WV', 'WR', 'CB']);

        // Récupérer un client existant ou en créer un nouveau s'il n'en existe pas
        $client = Client::query()->inRandomOrder()->first();

        $phoneNumber = $client->phone;

        // Générer le numéro de compte en utilisant le fournisseur et le numéro de téléphone du client
        $accountNumber = $provider . '_' . $phoneNumber;

        return [
            'client_id' => $client->id,
            'numero_compte' => $accountNumber,
            'account_type' => $provider,
            'solde' => $this->faker->randomFloat(2, 0, 1000000),
        ];
    }
}

