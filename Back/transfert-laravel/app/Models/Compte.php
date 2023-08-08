<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compte extends Model
{
    use HasFactory;

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    protected $guarded = [
        'id'
    ];
    protected $hidden = [
        "created_at",
		"updated_at"
    ];
}
