<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FirebaseUserService;
use Illuminate\Console\Command;

class SyncUsersToFirestore extends Command
{
    protected $signature = 'users:sync-firestore {--user-id=}';

    protected $description = 'Sync users from SQLite to Firebase Firestore';

    protected $firebaseUserService;

    public function __construct(FirebaseUserService $firebaseUserService)
    {
        parent::__construct();
        $this->firebaseUserService = $firebaseUserService;
    }

    public function handle()
    {
        $userId = $this->option('user-id');

        if ($userId) {
            $user = User::find($userId);
            
            if (!$user) {
                $this->error("User with ID {$userId} not found.");
                return 1;
            }

            $this->info("Syncing user: {$user->name} ({$user->email})");
            
            if ($this->firebaseUserService->syncUserToFirestore($user)) {
                $this->info("✓ User synced successfully!");
            } else {
                $this->error("✗ Failed to sync user. Check logs for details.");
                return 1;
            }

            return 0;
        }

        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->info('No users found to sync.');
            return 0;
        }

        $this->info("Found {$users->count()} users to sync...");
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $synced = 0;
        $failed = 0;

        foreach ($users as $user) {
            if ($this->firebaseUserService->syncUserToFirestore($user)) {
                $synced++;
            } else {
                $failed++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Sync complete!");
        $this->info("✓ Synced: {$synced}");
        
        if ($failed > 0) {
            $this->warn("✗ Failed: {$failed}");
        }

        return 0;
    }
}
