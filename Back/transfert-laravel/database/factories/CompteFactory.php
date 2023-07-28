<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Compte>
 */
class CompteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $phonePrefixes = ['77', '76', '70', '78', '75'];
        $phoneNumber = $this->faker->randomElement($phonePrefixes) . $this->faker->numerify('#######');

        return [
            'client_id' => Client::factory(),
            'numero_compte' => $this->faker->unique()->regexify('[a-zA-Z]{2}_\d{9}'),
            'phone_receiver' => $phoneNumber,
            'account_type' => $this->faker->randomElement(['OM', 'WV', 'WR', 'CB']),
            'solde' => $this->faker->randomFloat(2, 0, 1000000),
        ];
    }
}
