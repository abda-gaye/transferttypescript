<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
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
            "fullname" => $this->faker->name,
            "phone" => $phoneNumber, // Utilisez la variable $phoneNumber ici
        ];
    }
}
