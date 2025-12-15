<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseUserService
{
    protected $projectId = 'findmyniche-bbd0f';
    protected $accessToken;

    public function __construct()
    {
        $this->accessToken = $this->getAccessToken();
    }

    protected function getAccessToken()
    {
        try {
            $credentialsPath = storage_path('firebase/findmyniche-bbd0f-firebase-adminsdk-fbsvc-71bce25d84.json');
            $credentials = json_decode(file_get_contents($credentialsPath), true);
            
            $auth = new \Google\Auth\Credentials\ServiceAccountCredentials(
                'https://www.googleapis.com/auth/datastore',
                $credentials
            );
            
            $token = $auth->fetchAuthToken();
            return $token['access_token'];
        } catch (\Exception $e) {
            Log::error('Failed to get Firebase access token: ' . $e->getMessage());
            return null;
        }
    }

    public function syncUserToFirestore(User $user)
    {
        if (!$this->accessToken) {
            return false;
        }

        try {
            $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/users/{$user->id}";
            
            $fields = [
                'id' => ['integerValue' => (string) $user->id],
                'name' => ['stringValue' => $user->name ?? ''],
                'email' => ['stringValue' => $user->email ?? ''],
                'created_at' => ['timestampValue' => $user->created_at->toIso8601String()],
                'updated_at' => ['timestampValue' => $user->updated_at->toIso8601String()],
            ];

            if ($user->google_id) {
                $fields['google_id'] = ['stringValue' => $user->google_id];
            }

            if ($user->avatar) {
                $fields['avatar'] = ['stringValue' => $user->avatar];
            }

            if ($user->email_verified_at) {
                $fields['email_verified_at'] = ['timestampValue' => $user->email_verified_at->toIso8601String()];
            }

            $userData = ['fields' => $fields];

            $response = Http::withToken($this->accessToken)->patch($url, $userData);

            if ($response->successful()) {
                return true;
            }

            Log::error('Failed to sync user to Firestore: ' . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to sync user to Firestore: ' . $e->getMessage());
            return false;
        }
    }

    public function getUserFromFirestore($userId)
    {
        if (!$this->accessToken) {
            return null;
        }

        try {
            $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/users/{$userId}";
            
            $response = Http::withToken($this->accessToken)->get($url);

            if ($response->successful()) {
                return $this->extractFirestoreFields($response->json()['fields'] ?? []);
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Failed to get user from Firestore: ' . $e->getMessage());
            return null;
        }
    }

    public function deleteUserFromFirestore($userId)
    {
        if (!$this->accessToken) {
            return false;
        }

        try {
            $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/users/{$userId}";
            
            $response = Http::withToken($this->accessToken)->delete($url);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Failed to delete user from Firestore: ' . $e->getMessage());
            return false;
        }
    }

    protected function extractFirestoreFields($fields)
    {
        $data = [];
        foreach ($fields as $key => $value) {
            if (isset($value['stringValue'])) {
                $data[$key] = $value['stringValue'];
            } elseif (isset($value['integerValue'])) {
                $data[$key] = (int)$value['integerValue'];
            } elseif (isset($value['timestampValue'])) {
                $data[$key] = $value['timestampValue'];
            }
        }
        return $data;
    }
}
