<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post("/transaction/depot",[TransactionController::class,'depot']);
Route::post("/transaction/transfert",[TransactionController::class,'transfert']);
Route::post("/transaction/retrait",[TransactionController::class,'retrait']);
Route::get('/getFullName/{phoneNumber}',[ClientController::class,'getFullNameByPhoneNumber']);
Route::get('/transaction/history/{client_id}', [TransactionController::class, 'getClientTransactionHistory']);
Route::get('/checkClientExistence/{phone}', [ClientController::class, 'checkClientExistence']);
