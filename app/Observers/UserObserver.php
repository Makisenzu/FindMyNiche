<?php

namespace App\Observers;

use App\Models\User;
use App\Services\FirebaseUserService;

class UserObserver
{
    protected $firebaseUserService;

    public function __construct(FirebaseUserService $firebaseUserService)
    {
        $this->firebaseUserService = $firebaseUserService;
    }

    public function created(User $user): void
    {
        $this->firebaseUserService->syncUserToFirestore($user);
    }

    public function updated(User $user): void
    {
        $this->firebaseUserService->syncUserToFirestore($user);
    }

    public function deleted(User $user): void
    {
        $this->firebaseUserService->deleteUserFromFirestore($user->id);
    }

    public function forceDeleted(User $user): void
    {
        $this->firebaseUserService->deleteUserFromFirestore($user->id);
    }
}
