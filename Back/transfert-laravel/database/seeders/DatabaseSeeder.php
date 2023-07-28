<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Client;
use App\Models\Compte;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Client::factory(10)->create()->each(function ($client) {
            $client->comptes()->saveMany(Compte::factory(2)->make());
        });
    }
}
