<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;
    public function compte()
    {
        return $this->hasMany(Compte::class);
    }
    protected $guarded = [
        'id'
    ];

    protected $hidden = [
        "created_at",
		"updated_at"
    ];


}
