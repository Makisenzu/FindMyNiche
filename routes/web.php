<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FirebaseTestController;
use App\Http\Controllers\FirebaseCrudController;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::get('/careers', function () {
        return Inertia::render('Careers');
    })->name('careers');
});

Route::get('/test-firestore', [FirebaseTestController::class, 'testFirestore']);
Route::get('/firebase-data/{collection}', [FirebaseTestController::class, 'getData']);

// Firebase CRUD Routes
Route::middleware('auth')->group(function () {
    Route::get('/firebase/{collection}', [FirebaseCrudController::class, 'index']);
    Route::post('/firebase/{collection}', [FirebaseCrudController::class, 'store']);
    Route::get('/firebase/{collection}/{id}', [FirebaseCrudController::class, 'show']);
    Route::put('/firebase/{collection}/{id}', [FirebaseCrudController::class, 'update']);
    Route::patch('/firebase/{collection}/{id}', [FirebaseCrudController::class, 'update']);
    Route::delete('/firebase/{collection}/{id}', [FirebaseCrudController::class, 'destroy']);
    Route::post('/firebase/{collection}/query', [FirebaseCrudController::class, 'query']);
});

require __DIR__.'/auth.php';
