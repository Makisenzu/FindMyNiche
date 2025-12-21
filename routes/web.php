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

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');

    Route::get('/skills', [SkillController::class, 'index'])->name('skills.index');
    Route::get('/skills/{id}', [SkillController::class, 'show'])->name('skills.show');
    Route::post('/skills', [SkillController::class, 'store'])->name('skills.store');
    Route::put('/skills/{id}', [SkillController::class, 'update'])->name('skills.update');
    Route::delete('/skills/{id}', [SkillController::class, 'destroy'])->name('skills.destroy');
    
    Route::get('/questionnaires', [QuestionnaireController::class, 'index'])->name('questionnaires.index');
    Route::get('/questionnaires/{id}', [QuestionnaireController::class, 'show'])->name('questionnaires.show');
    Route::post('/questionnaires', [QuestionnaireController::class, 'store'])->name('questionnaires.store');
    Route::put('/questionnaires/{id}', [QuestionnaireController::class, 'update'])->name('questionnaires.update');
    Route::patch('/questionnaires/{id}', [QuestionnaireController::class, 'update'])->name('questionnaires.update.patch');
    Route::delete('/questionnaires/{id}', [QuestionnaireController::class, 'destroy'])->name('questionnaires.destroy');
    
    Route::get('/questions', [QuestionnaireController::class, 'questionsIndex'])->name('questions.index');
    Route::get('/questions/{id}', [QuestionnaireController::class, 'showQuestion'])->name('questions.show');
    Route::post('/questions', [QuestionnaireController::class, 'storeQuestion'])->name('questions.store');
    Route::put('/questions/{id}', [QuestionnaireController::class, 'updateQuestion'])->name('questions.update');
    Route::delete('/questions/{id}', [QuestionnaireController::class, 'destroyQuestion'])->name('questions.destroy');
    Route::get('/questions/stats', [QuestionnaireController::class, 'getQuestionStats'])->name('questions.stats');
    Route::get('/questions/sub-categories', [QuestionnaireController::class, 'getSubCategories'])->name('questions.sub-categories');
    Route::get('/questions/main-categories/all', [QuestionnaireController::class, 'getAllMainCategories'])->name('questions.main-categories.all');
    Route::get('/questions/sub-categories/all', [QuestionnaireController::class, 'getAllSubCategories'])->name('questions.sub-categories.all');
    Route::post('/questions/main-categories', [QuestionnaireController::class, 'createMainCategory'])->name('questions.main-categories.create');
    Route::post('/questions/sub-categories', [QuestionnaireController::class, 'createSubCategory'])->name('questions.sub-categories.create');

    Route::get('/questionnaires/niche/{niche}', [QuestionnaireController::class, 'getByNiche'])->name('questionnaires.by-niche');
    Route::get('/questionnaires/active', [QuestionnaireController::class, 'getActive'])->name('questionnaires.active');
    Route::get('/questions/list', [QuestionnaireController::class, 'getQuestions'])->name('questions.list');
});

Route::get('/test-firestore', [FirebaseTestController::class, 'testFirestore']);
Route::get('/firebase-data/{collection}', [FirebaseTestController::class, 'getData']);

Route::prefix('api')->group(function () {
    Route::get('/skills', [SkillController::class, 'index'])->name('api.skills.index');
    Route::get('/skills/categories', [SkillController::class, 'getCategories'])->name('api.skills.categories');
    Route::get('/skills/category/{category}', [SkillController::class, 'getByCategory'])->name('api.skills.by-category');
    
    Route::get('/questionnaires', [QuestionnaireController::class, 'getActive'])->name('api.questionnaires.active');
    Route::get('/questionnaires/niche/{niche}', [QuestionnaireController::class, 'getByNiche'])->name('api.questionnaires.by-niche');
    Route::get('/questions', [QuestionnaireController::class, 'getQuestions'])->name('api.questions');
});

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
