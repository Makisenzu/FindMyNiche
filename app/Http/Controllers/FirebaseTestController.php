<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Laravel\Firebase\Facades\Firebase;

class FirebaseTestController extends Controller
{
    public function testFirestore()
    {
        try {
            $auth = Firebase::auth();
            
            return response()->json([
                'success' => true,
                'message' => 'Firebase credentials are valid!',
                'project_id' => 'findmyniche-bbd0f',
                'note' => 'To access Firestore collections, use: /firebase-data/{collection_name}'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    
    public function getData($collection)
    {
        try {
            $credentialsPath = storage_path('firebase/findmyniche-bbd0f-firebase-adminsdk-fbsvc-71bce25d84.json');
            $credentials = json_decode(file_get_contents($credentialsPath), true);
            
            $auth = new \Google\Auth\Credentials\ServiceAccountCredentials(
                'https://www.googleapis.com/auth/datastore',
                $credentials
            );
            
            $token = $auth->fetchAuthToken();
            $accessToken = $token['access_token'];
            
            $projectId = 'findmyniche-bbd0f';
            $url = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/{$collection}";
            
            $response = \Illuminate\Support\Facades\Http::withToken($accessToken)->get($url);
            
            if ($response->successful()) {
                $documents = $response->json()['documents'] ?? [];
                
                $data = [];
                foreach ($documents as $doc) {
                    $id = basename($doc['name']);
                    $fields = $this->extractFirestoreFields($doc['fields'] ?? []);
                    
                    $data[] = [
                        'id' => $id,
                        'data' => $fields
                    ];
                }
                
                return response()->json([
                    'success' => true,
                    'collection' => $collection,
                    'items' => $data,
                    'count' => count($data)
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => $response->body()
            ], $response->status());
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function extractFirestoreFields($fields)
    {
        $data = [];
        foreach ($fields as $key => $value) {
            if (isset($value['stringValue'])) {
                $data[$key] = $value['stringValue'];
            } elseif (isset($value['integerValue'])) {
                $data[$key] = (int)$value['integerValue'];
            } elseif (isset($value['doubleValue'])) {
                $data[$key] = (float)$value['doubleValue'];
            } elseif (isset($value['booleanValue'])) {
                $data[$key] = $value['booleanValue'];
            } elseif (isset($value['timestampValue'])) {
                $data[$key] = $value['timestampValue'];
            } elseif (isset($value['arrayValue'])) {
                $data[$key] = $this->extractArray($value['arrayValue']['values'] ?? []);
            } elseif (isset($value['mapValue'])) {
                $data[$key] = $this->extractFirestoreFields($value['mapValue']['fields'] ?? []);
            } else {
                $data[$key] = null;
            }
        }
        return $data;
    }
    
    private function extractArray($values)
    {
        $array = [];
        foreach ($values as $value) {
            if (isset($value['stringValue'])) {
                $array[] = $value['stringValue'];
            } elseif (isset($value['integerValue'])) {
                $array[] = (int)$value['integerValue'];
            } elseif (isset($value['mapValue'])) {
                $array[] = $this->extractFirestoreFields($value['mapValue']['fields'] ?? []);
            }
        }
        return $array;
    }
}
