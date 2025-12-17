<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FirebaseTestController;
use App\Http\Controllers\FirebaseCrudController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\QuestionnaireController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::get('/careers', function () {
        return Inertia::render('Careers');
    })->name('careers');

    // Users Management Routes
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');

    // Skills Management Routes
    Route::get('/skills', [SkillController::class, 'index'])->name('skills.index');
    Route::get('/skills/{id}', [SkillController::class, 'show'])->name('skills.show');
    Route::post('/skills', [SkillController::class, 'store'])->name('skills.store');
    Route::put('/skills/{id}', [SkillController::class, 'update'])->name('skills.update');
    Route::delete('/skills/{id}', [SkillController::class, 'destroy'])->name('skills.destroy');
    
    // Questionnaires Management Routes
    Route::get('/questionnaires', [QuestionnaireController::class, 'index'])->name('questionnaires.index');
    Route::get('/questionnaires/{id}', [QuestionnaireController::class, 'show'])->name('questionnaires.show');
    Route::post('/questionnaires', [QuestionnaireController::class, 'store'])->name('questionnaires.store');
    Route::put('/questionnaires/{id}', [QuestionnaireController::class, 'update'])->name('questionnaires.update');
    Route::patch('/questionnaires/{id}', [QuestionnaireController::class, 'update'])->name('questionnaires.update.patch');
    Route::delete('/questionnaires/{id}', [QuestionnaireController::class, 'destroy'])->name('questionnaires.destroy');
});

Route::get('/test-firestore', [FirebaseTestController::class, 'testFirestore']);
Route::get('/firebase-data/{collection}', [FirebaseTestController::class, 'getData']);

// API Routes for mobile app
Route::prefix('api')->group(function () {
    // Skills API
    Route::get('/skills', [SkillController::class, 'index'])->name('api.skills.index');
    Route::get('/skills/categories', [SkillController::class, 'getCategories'])->name('api.skills.categories');
    Route::get('/skills/category/{category}', [SkillController::class, 'getByCategory'])->name('api.skills.by-category');
    
    // Questionnaires API
    Route::get('/questionnaires', [QuestionnaireController::class, 'getActive'])->name('api.questionnaires.active');
    Route::get('/questionnaires/niche/{niche}', [QuestionnaireController::class, 'getByNiche'])->name('api.questionnaires.by-niche');
});

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
