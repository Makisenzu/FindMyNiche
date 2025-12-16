<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Google\Auth\Credentials\ServiceAccountCredentials;

class FirebaseCrudService
{
    protected $projectId = 'findmyniche-bbd0f';
    protected $accessToken;
    protected $baseUrl;

    public function __construct()
    {
        $this->accessToken = $this->getAccessToken();
        $this->baseUrl = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents";
    }

    protected function getAccessToken()
    {
        try {
            $credentialsPath = storage_path('firebase/findmyniche-bbd0f-firebase-adminsdk-fbsvc-71bce25d84.json');
            $credentials = json_decode(file_get_contents($credentialsPath), true);
            
            $auth = new ServiceAccountCredentials(
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

    /**
     * CREATE - Add a new document to a collection
     * 
     * @param string $collection - Collection name (e.g., 'posts', 'products')
     * @param array $data - Data to store ['title' => 'Hello', 'price' => 100]
     * @param string|null $documentId - Optional custom document ID
     * @return array|null
     */
    public function create(string $collection, array $data, string $documentId = null)
    {
        if (!$this->accessToken) {
            return null;
        }

        try {
            $fields = $this->convertToFirestoreFields($data);
            
            if ($documentId) {
                // Create with custom ID
                $url = "{$this->baseUrl}/{$collection}/{$documentId}";
                $response = Http::withToken($this->accessToken)->patch($url, ['fields' => $fields]);
            } else {
                // Auto-generate ID
                $url = "{$this->baseUrl}/{$collection}";
                $response = Http::withToken($this->accessToken)->post($url, ['fields' => $fields]);
            }

            if ($response->successful()) {
                return $this->extractFirestoreFields($response->json()['fields'] ?? []);
            }

            Log::error('Firebase CREATE failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Firebase CREATE error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * READ - Get a single document by ID
     * 
     * @param string $collection - Collection name
     * @param string $documentId - Document ID
     * @return array|null
     */
    public function read(string $collection, string $documentId)
    {
        if (!$this->accessToken) {
            return null;
        }

        try {
            $url = "{$this->baseUrl}/{$collection}/{$documentId}";
            $response = Http::withToken($this->accessToken)->get($url);

            if ($response->successful()) {
                return $this->extractFirestoreFields($response->json()['fields'] ?? []);
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Firebase READ error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * READ ALL - Get all documents from a collection
     * 
     * @param string $collection - Collection name
     * @param int $limit - Maximum number of documents to return
     * @return array
     */
    public function readAll(string $collection, int $limit = 100)
    {
        if (!$this->accessToken) {
            return [];
        }

        try {
            $url = "{$this->baseUrl}/{$collection}?pageSize={$limit}";
            $response = Http::withToken($this->accessToken)->get($url);

            if ($response->successful()) {
                $documents = $response->json()['documents'] ?? [];
                $results = [];

                foreach ($documents as $doc) {
                    $data = $this->extractFirestoreFields($doc['fields'] ?? []);
                    // Extract document ID from the path
                    $pathParts = explode('/', $doc['name']);
                    $data['_id'] = end($pathParts);
                    $results[] = $data;
                }

                return $results;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Firebase READ ALL error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * UPDATE - Update an existing document
     * 
     * @param string $collection - Collection name
     * @param string $documentId - Document ID
     * @param array $data - Data to update
     * @return bool
     */
    public function update(string $collection, string $documentId, array $data)
    {
        if (!$this->accessToken) {
            return false;
        }

        try {
            $url = "{$this->baseUrl}/{$collection}/{$documentId}";
            $fields = $this->convertToFirestoreFields($data);
            
            $response = Http::withToken($this->accessToken)->patch($url, ['fields' => $fields]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Firebase UPDATE failed: ' . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error('Firebase UPDATE error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * DELETE - Delete a document
     * 
     * @param string $collection - Collection name
     * @param string $documentId - Document ID
     * @return bool
     */
    public function delete(string $collection, string $documentId)
    {
        if (!$this->accessToken) {
            return false;
        }

        try {
            $url = "{$this->baseUrl}/{$collection}/{$documentId}";
            $response = Http::withToken($this->accessToken)->delete($url);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Firebase DELETE error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * QUERY - Query documents with filters
     * 
     * @param string $collection - Collection name
     * @param array $where - Where conditions ['field' => 'value']
     * @param int $limit - Maximum results
     * @return array
     */
    public function query(string $collection, array $where = [], int $limit = 100)
    {
        if (!$this->accessToken) {
            return [];
        }

        try {
            $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents:runQuery";
            
            $structuredQuery = [
                'from' => [['collectionId' => $collection]],
                'limit' => $limit
            ];

            // Add where conditions
            if (!empty($where)) {
                $filters = [];
                foreach ($where as $field => $value) {
                    $filters[] = [
                        'fieldFilter' => [
                            'field' => ['fieldPath' => $field],
                            'op' => 'EQUAL',
                            'value' => $this->convertSingleValue($value)
                        ]
                    ];
                }
                
                if (count($filters) > 1) {
                    $structuredQuery['where'] = [
                        'compositeFilter' => [
                            'op' => 'AND',
                            'filters' => $filters
                        ]
                    ];
                } else {
                    $structuredQuery['where'] = $filters[0];
                }
            }

            $response = Http::withToken($this->accessToken)->post($url, [
                'structuredQuery' => $structuredQuery
            ]);

            if ($response->successful()) {
                $results = [];
                $documents = $response->json();

                foreach ($documents as $doc) {
                    if (isset($doc['document'])) {
                        $data = $this->extractFirestoreFields($doc['document']['fields'] ?? []);
                        $pathParts = explode('/', $doc['document']['name']);
                        $data['_id'] = end($pathParts);
                        $results[] = $data;
                    }
                }

                return $results;
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Firebase QUERY error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Convert PHP array to Firestore field format
     */
    protected function convertToFirestoreFields(array $data): array
    {
        $fields = [];

        foreach ($data as $key => $value) {
            $fields[$key] = $this->convertSingleValue($value);
        }

        return $fields;
    }

    /**
     * Convert single value to Firestore format
     */
    protected function convertSingleValue($value): array
    {
        if (is_string($value)) {
            return ['stringValue' => $value];
        } elseif (is_int($value)) {
            return ['integerValue' => (string) $value];
        } elseif (is_float($value)) {
            return ['doubleValue' => $value];
        } elseif (is_bool($value)) {
            return ['booleanValue' => $value];
        } elseif (is_null($value)) {
            return ['nullValue' => null];
        } elseif ($value instanceof \DateTime) {
            return ['timestampValue' => $value->format('c')];
        } elseif (is_array($value)) {
            // Check if it's an associative array (map) or indexed array
            if (array_keys($value) !== range(0, count($value) - 1)) {
                // Associative array - convert to map
                return ['mapValue' => ['fields' => $this->convertToFirestoreFields($value)]];
            } else {
                // Indexed array - convert to array
                $arrayValues = [];
                foreach ($value as $item) {
                    $arrayValues[] = $this->convertSingleValue($item);
                }
                return ['arrayValue' => ['values' => $arrayValues]];
            }
        }

        return ['stringValue' => (string) $value];
    }

    /**
     * Extract Firestore fields to PHP array
     */
    protected function extractFirestoreFields(array $fields): array
    {
        $data = [];

        foreach ($fields as $key => $value) {
            if (isset($value['stringValue'])) {
                $data[$key] = $value['stringValue'];
            } elseif (isset($value['integerValue'])) {
                $data[$key] = (int) $value['integerValue'];
            } elseif (isset($value['doubleValue'])) {
                $data[$key] = (float) $value['doubleValue'];
            } elseif (isset($value['booleanValue'])) {
                $data[$key] = $value['booleanValue'];
            } elseif (isset($value['timestampValue'])) {
                $data[$key] = $value['timestampValue'];
            } elseif (isset($value['arrayValue'])) {
                $data[$key] = $this->extractArrayValue($value['arrayValue']);
            } elseif (isset($value['mapValue'])) {
                $data[$key] = $this->extractFirestoreFields($value['mapValue']['fields'] ?? []);
            }
        }

        return $data;
    }

    /**
     * Extract array values from Firestore
     */
    protected function extractArrayValue(array $arrayValue): array
    {
        $result = [];
        $values = $arrayValue['values'] ?? [];

        foreach ($values as $value) {
            if (isset($value['stringValue'])) {
                $result[] = $value['stringValue'];
            } elseif (isset($value['integerValue'])) {
                $result[] = (int) $value['integerValue'];
            } elseif (isset($value['doubleValue'])) {
                $result[] = (float) $value['doubleValue'];
            } elseif (isset($value['booleanValue'])) {
                $result[] = $value['booleanValue'];
            }
        }

        return $result;
    }
}
