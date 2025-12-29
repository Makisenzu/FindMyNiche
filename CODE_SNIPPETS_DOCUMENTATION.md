
## Backend Code Snippets

### 1. Firebase CRUD Service - Data Type Conversion Algorithm

Code snippet name/title: **Firestore Field Type Conversion to PHP**

Detailed Description: This algorithm converts Firebase Firestore's complex field format (which wraps values in type-specific objects like `stringValue`, `integerValue`, etc.) into standard PHP arrays. It handles nested structures including maps and arrays recursively, making Firestore data usable in PHP applications.

Code Snippet:
```php
protected function convertToFirestoreFields(array $data): array
{
    $fields = [];

    foreach ($data as $key => $value) {
        $fields[$key] = $this->convertSingleValue($value);
    }

    return $fields;
}

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
```

---

### 2. Firebase Query Builder with Multiple Filters

Code snippet name/title: **Firestore Structured Query with AND Composite Filters**

Detailed Description: This algorithm constructs complex Firestore queries using the structured query API. It builds filter conditions dynamically and combines multiple filters using composite AND operations. The algorithm handles both single and multiple where conditions efficiently.

Code Snippet:
```php
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
```

---

### 3. Firebase Authentication Token Generation

Code snippet name/title: **Google Service Account OAuth Token Generation**

Detailed Description: This algorithm generates OAuth 2.0 access tokens using Google Service Account credentials for server-to-server authentication. It reads the service account JSON file, creates ServiceAccountCredentials, and fetches a valid access token for Firestore API calls.

Code Snippet:
```php
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
```

---

### 4. User Observer Pattern for Firestore Sync

Code snippet name/title: **Laravel Eloquent Observer for Automatic Firestore Synchronization**

Detailed Description: This observer pattern implementation automatically synchronizes local database user changes to Firestore. It hooks into Laravel's Eloquent model lifecycle events (created, updated, deleted) to maintain data consistency between MySQL and Firestore databases.

Code Snippet:
```php
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
```

---

### 5. Google OAuth Authentication Flow

Code snippet name/title: **Google OAuth Login with User Creation and Firebase Sync**

Detailed Description: This algorithm implements the complete Google OAuth authentication flow. It handles the OAuth callback, retrieves user information from Google, creates or updates local user records, syncs to Firestore, and establishes an authenticated session.

Code Snippet:
```php
public function callback()
{
    try {
        $googleUser = Socialite::driver('google')->user();

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            }
        } else {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => Hash::make(Str::random(24)),
                'email_verified_at' => now(),
            ]);
        }

        $this->firebaseUserService->syncUserToFirestore($user);

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    } catch (\Exception $e) {
        return redirect()->route('login')->withErrors([
            'email' => 'Unable to login with Google. Please try again.',
        ]);
    }
}
```

---

### 6. Skills Management with Pagination and Filtering

Code snippet name/title: **Server-Side Filtering and Pagination Algorithm**

Detailed Description: This algorithm implements server-side filtering and pagination for skills management. It fetches all skills from Firestore, applies search and category filters using array operations, calculates pagination metadata, and returns a sliced subset of results for optimal performance.

Code Snippet:
```php
public function index(Request $request)
{
    $perPage = 12;
    $page = $request->input('page', 1);
    $search = $request->input('search', '');
    $category = $request->input('category', '');
    
    $allSkills = $this->firebase->readAll($this->collection);

    $filteredSkills = array_filter($allSkills, function($skill) use ($search, $category) {
        $matchesSearch = empty($search) || 
            stripos($skill['name'], $search) !== false || 
            stripos($skill['description'] ?? '', $search) !== false;
        
        $matchesCategory = empty($category) || $skill['category'] === $category;
        
        return $matchesSearch && $matchesCategory;
    });
    
    $categories = array_unique(array_column($allSkills, 'category'));
    sort($categories);

    $total = count($filteredSkills);
    $lastPage = ceil($total / $perPage);
    $offset = ($page - 1) * $perPage;
    $paginatedSkills = array_slice($filteredSkills, $offset, $perPage);
    
    return Inertia::render('Skills/Index', [
        'skills' => array_values($paginatedSkills),
        'categories' => $categories,
        'pagination' => [
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => (int) $page,
            'last_page' => (int) $lastPage,
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ],
        'filters' => [
            'search' => $search,
            'category' => $category,
        ]
    ]);
}
```

---

### 7. Dashboard Statistics Generation Algorithm

Code snippet name/title: **Multi-Source Data Aggregation for Dashboard Analytics**

Detailed Description: This algorithm aggregates data from multiple Firestore collections (skills, users, questions) to generate comprehensive dashboard statistics. It calculates totals, performs grouping by categories, sorts by frequency, and prepares chart-ready data structures.

Code Snippet:
```php
public function index()
{
    $skills = $this->firebase->readAll('skills');
    $users = $this->firebase->readAll('users');
    $questions = $this->firebase->readAll('questions');

    $totalSkills = count($skills);

    $skillsByCategory = [];
    foreach ($skills as $skill) {
        $category = $skill['category'] ?? 'Uncategorized';
        if (!isset($skillsByCategory[$category])) {
            $skillsByCategory[$category] = 0;
        }
        $skillsByCategory[$category]++;
    }

    arsort($skillsByCategory);
    $topCategories = array_slice($skillsByCategory, 0, 5, true);
    $totalQuestions = count($questions);

    $recentSkills = array_slice(array_reverse($skills), 0, 5);
    $totalUsers = count($users);
    $recentUsers = array_slice(array_reverse($users), 0, 10);
    $usersWithNiche = count(array_filter($users, function($user) {
        return isset($user['niche']) && !empty($user['niche']);
    }));
    $usersByNiche = [];
    foreach ($users as $user) {
        if (isset($user['niche']) && !empty($user['niche'])) {
            $niche = $user['niche'];
            if (!isset($usersByNiche[$niche])) {
                $usersByNiche[$niche] = 0;
            }
            $usersByNiche[$niche]++;
        }
    }
    arsort($usersByNiche);
    $categoryChartData = [
        'labels' => array_keys($skillsByCategory),
        'values' => array_values($skillsByCategory),
    ];

    $monthlyData = $this->generateMonthlyTrend($skills, $questions);
    $nicheChartData = [
        'labels' => array_keys($usersByNiche),
        'values' => array_values($usersByNiche),
    ];

    return Inertia::render('Dashboard', [
        'stats' => [
            'totalSkills' => $totalSkills,
            'totalQuestions' => $totalQuestions,
            'totalCategories' => count($skillsByCategory),
            'totalUsers' => $totalUsers,
            'usersWithNiche' => $usersWithNiche,
        ],
        'topCategories' => $topCategories,
        'recentSkills' => $recentSkills,
        'categoryChartData' => $categoryChartData,
        'monthlyTrend' => $monthlyData,
        'recentUsers' => $recentUsers,
        'usersByNiche' => $usersByNiche,
        'nicheChartData' => $nicheChartData,
    ]);
}

private function generateMonthlyTrend($skills, $questions)
{
    $months = [];
    $skillsData = [];
    $questionsData = [];
    
    for ($i = 5; $i >= 0; $i--) {
        $date = now()->subMonths($i);
        $months[] = $date->format('M Y');
        
        $skillsData[] = (int) (count($skills) * (1 - ($i * 0.15)));
        $questionsData[] = (int) (count($questions) * (1 - ($i * 0.15)));
    }
    
    return [
        'labels' => $months,
        'skills' => $skillsData,
        'questions' => $questionsData,
    ];
}
```

---

### 8. Questions Category Management System

Code snippet name/title: **Dynamic Category Extraction and Hierarchical Filtering**

Detailed Description: This algorithm manages a hierarchical category system (main categories and subcategories) for questions. It extracts unique categories from question data, maintains relationships between main and subcategories, performs filtered searches, and provides paginated results with category statistics.

Code Snippet:
```php
public function questionsIndex(Request $request)
{
    $perPage = 20;
    $page = $request->input('page', 1);
    $search = $request->input('search', '');
    $mainCategory = $request->input('main_category', '');
    $subCategory = $request->input('sub_category', '');
    
    $allQuestions = $this->firebase->readAll('questions');

    $filtered = array_filter($allQuestions, function($q) use ($search, $mainCategory, $subCategory) {
        $matches = !empty($q['question']);
        
        if ($search) {
            $matches = $matches && stripos($q['question'], $search) !== false;
        }
        
        if ($mainCategory) {
            $matches = $matches && isset($q['main_category']) && $q['main_category'] === $mainCategory;
        }
        
        if ($subCategory) {
            $matches = $matches && isset($q['sub_category']) && $q['sub_category'] === $subCategory;
        }
        
        return $matches;
    });
    
    usort($filtered, function($a, $b) {
        return ($a['id'] ?? 0) - ($b['id'] ?? 0);
    });

    $mainCategories = [];
    $subCategories = [];
    $categorizedSubCategories = [];
    
    foreach ($allQuestions as $question) {
        if (isset($question['main_category'])) {
            $mainCategories[$question['main_category']] = true;

            if (isset($question['sub_category'])) {
                $mainCat = $question['main_category'];
                $subCat = $question['sub_category'];
                
                if (!isset($categorizedSubCategories[$mainCat])) {
                    $categorizedSubCategories[$mainCat] = [];
                }
                $categorizedSubCategories[$mainCat][$subCat] = true;
            }
        }
        if (isset($question['sub_category'])) {
            $subCategories[$question['sub_category']] = true;
        }
    }
    
    $mainCategories = array_keys($mainCategories);
    sort($mainCategories);
    $subCategories = array_keys($subCategories);
    sort($subCategories);
    
    foreach ($categorizedSubCategories as &$subCats) {
        $subCats = array_keys($subCats);
        sort($subCats);
    }

    $total = count($filtered);
    $totalQuestions = count($allQuestions);
    $lastPage = ceil($total / $perPage);
    $offset = ($page - 1) * $perPage;
    $paginated = array_slice($filtered, $offset, $perPage);
    
    return Inertia::render('Questions/Index', [
        'questions' => array_values($paginated),
        'totalQuestions' => $totalQuestions,
        'mainCategories' => $mainCategories,
        'subCategories' => $subCategories,
        'categorizedSubCategories' => $categorizedSubCategories,
        'pagination' => [
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => (int) $page,
            'last_page' => (int) $lastPage,
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ],
        'filters' => [
            'search' => $search,
            'main_category' => $mainCategory,
            'sub_category' => $subCategory,
        ]
    ]);
}
```

---

### 9. Question Statistics Generation

Code snippet name/title: **Category-Based Question Distribution Analytics**

Detailed Description: This algorithm generates statistical analysis of questions by counting their distribution across main categories and subcategories. It processes all questions, builds frequency maps, sorts them by count in descending order, and returns structured analytics data.

Code Snippet:
```php
public function getQuestionStats()
{
    $questions = $this->firebase->readAll('questions');
    
    $stats = [
        'total' => count($questions),
        'by_main_category' => [],
        'by_sub_category' => []
    ];
    
    foreach ($questions as $question) {
        if (isset($question['main_category'])) {
            $mainCat = $question['main_category'];
            if (!isset($stats['by_main_category'][$mainCat])) {
                $stats['by_main_category'][$mainCat] = 0;
            }
            $stats['by_main_category'][$mainCat]++;
        }
        
        if (isset($question['sub_category'])) {
            $subCat = $question['sub_category'];
            if (!isset($stats['by_sub_category'][$subCat])) {
                $stats['by_sub_category'][$subCat] = 0;
            }
            $stats['by_sub_category'][$subCat]++;
        }
    }
    
    arsort($stats['by_main_category']);
    arsort($stats['by_sub_category']);
    
    return response()->json([
        'success' => true,
        'data' => $stats
    ]);
}
```

---

## Frontend Code Snippets

### 10. React Debounced Search Implementation

Code snippet name/title: **Automatic Debounced Search with URL State Management**

Detailed Description: This React hook implements a debounced search mechanism that automatically triggers server requests after a 300ms delay. It uses useEffect to monitor search term changes and maintains URL query parameters for bookmarkable filtered states using Inertia.js router.

Code Snippet:
```javascript
const [searchTerm, setSearchTerm] = useState(filters.search || '');
const [filterCategory, setFilterCategory] = useState(filters.category || '');

const handleSearch = () => {
    router.get(route('skills.index'), {
        search: searchTerm,
        category: filterCategory,
    }, {
        preserveState: true,
        preserveScroll: true,
    });
};

useEffect(() => {
    const timer = setTimeout(() => {
        if (searchTerm !== filters.search || filterCategory !== filters.category) {
            handleSearch();
        }
    }, 300);
    return () => clearTimeout(timer);
}, [searchTerm, filterCategory]);
```

---

### 11. Chart.js Configuration for Dashboard Analytics

Code snippet name/title: **Multi-Dataset Line Chart with Gradient Fill Configuration**

Detailed Description: This configuration creates a responsive line chart using Chart.js showing growth trends over time. It implements gradient fills, custom tooltips with percentage calculations, smooth tension curves, and responsive scaling with proper axis configuration for optimal data visualization.

Code Snippet:
```javascript
const lineData = {
    labels: monthlyTrend.labels,
    datasets: [
        {
            label: 'Skills',
            data: monthlyTrend.skills,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(99, 102, 241)',
        },
        {
            label: 'Questions',
            data: monthlyTrend.questions,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(16, 185, 129)',
        },
    ],
};

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 15,
                font: {
                    size: 12,
                },
                usePointStyle: true,
            },
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1,
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
        },
        x: {
            grid: {
                display: false,
            },
        },
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false,
    },
};
```

---

### 12. Pie Chart with Percentage Tooltips

Code snippet name/title: **Dynamic Pie Chart with Custom Percentage Tooltip Formatter**

Detailed Description: This Chart.js pie chart configuration displays categorical data distribution with dynamic color generation. The custom tooltip callback calculates and displays percentages alongside absolute values, providing comprehensive data insights at a glance.

Code Snippet:
```javascript
const pieData = {
    labels: categoryChartData.labels,
    datasets: [
        {
            label: 'Skills',
            data: categoryChartData.values,
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',   // Indigo
                'rgba(16, 185, 129, 0.8)',   // Green
                'rgba(59, 130, 246, 0.8)',   // Blue
                'rgba(168, 85, 247, 0.8)',   // Purple
                'rgba(245, 158, 11, 0.8)',   // Amber
                'rgba(239, 68, 68, 0.8)',    // Red
                'rgba(236, 72, 153, 0.8)',   // Pink
                'rgba(20, 184, 166, 0.8)',   // Teal
            ],
            borderColor: [
                'rgba(99, 102, 241, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(20, 184, 166, 1)',
            ],
            borderWidth: 2,
        },
    ],
};

const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                padding: 15,
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                }
            }
        }
    },
};
```

---

### 13. Dynamic Form Modal with Inertia.js

Code snippet name/title: **CRUD Modal Form with Inertia.js Form Helper**

Detailed Description: This React component implements a reusable modal form that handles both create and update operations. It uses Inertia.js useForm hook for form state management, includes validation error handling, and performs optimistic UI updates with preserveScroll behavior.

Code Snippet:
```javascript
const [showModal, setShowModal] = useState(false);
const [editingSkill, setEditingSkill] = useState(null);

const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    category: '',
    description: '',
    icon: '',
});

const openCreateModal = () => {
    reset();
    setEditingSkill(null);
    setShowModal(true);
};

const openEditModal = async (skill) => {
    const response = await fetch(route('skills.show', skill._id));
    const skillData = await response.json();
    setData({
        name: skillData.name || '',
        category: skillData.category || '',
        description: skillData.description || '',
        icon: skillData.icon || '',
    });
    setEditingSkill(skillData);
    setShowModal(true);
};

const closeModal = () => {
    setShowModal(false);
    setEditingSkill(null);
    reset();
};

const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingSkill) {
        put(route('skills.update', editingSkill._id), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    } else {
        post(route('skills.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    }
};
```

---

### 14. Hierarchical Category Filtering System

Code snippet name/title: **Cascading Dropdown Filter with Dynamic Subcategory Loading**

Detailed Description: This React component implements a hierarchical filtering system where selecting a main category dynamically filters and loads relevant subcategories. It uses useEffect hooks to manage state changes and maintains filtered subcategory lists based on parent category selection.

Code Snippet:
```javascript
const [selectedMainCategory, setSelectedMainCategory] = useState(filters.main_category || '');
const [selectedSubCategory, setSelectedSubCategory] = useState(filters.sub_category || '');
const [filteredSubCategories, setFilteredSubCategories] = useState([]);
const [loadingSubCategories, setLoadingSubCategories] = useState(false);

const fetchSubCategories = useCallback(async (mainCategory) => {
    if (!mainCategory) {
        setFilteredSubCategories([]);
        return;
    }
    
    setLoadingSubCategories(true);
    try {
        const response = await fetch(route('questions.sub-categories', { main_category: mainCategory }));
        const result = await response.json();
        if (result.success) {
            setFilteredSubCategories(result.data);
        }
    } catch (error) {
        console.error('Error fetching sub-categories:', error);
        setFilteredSubCategories([]);
    } finally {
        setLoadingSubCategories(false);
    }
}, []);

useEffect(() => {
    if (selectedMainCategory && categorizedSubCategories?.[selectedMainCategory]) {
        setFilteredSubCategories(categorizedSubCategories[selectedMainCategory]);
    } else {
        setFilteredSubCategories([]);
    }
}, [selectedMainCategory, categorizedSubCategories]);

const handleMainCategoryChange = (value) => {
    setSelectedMainCategory(value);
    setSelectedSubCategory('');
    
    if (value && categorizedSubCategories?.[value]) {
        setFilteredSubCategories(categorizedSubCategories[value]);
    } else {
        setFilteredSubCategories([]);
        if (value) {
            fetchSubCategories(value);
        }
    }
};
```

---

### 15. Pagination Component Logic

Code snippet name/title: **Client-Side Pagination State Management with URL Synchronization**

Detailed Description: This algorithm manages pagination state in React while maintaining URL synchronization through Inertia.js router. It handles page changes, preserves filter states, and implements smooth scrolling behavior for better user experience.

Code Snippet:
```javascript
const changePage = (page) => {
    router.get(route('skills.index'), {
        page,
        search: searchTerm,
        category: filterCategory,
    }, {
        preserveState: true,
        preserveScroll: true,
    });
};

// Pagination component rendering
<div className="flex items-center justify-between">
    <div className="text-sm text-gray-700">
        Showing {pagination.from} to {pagination.to} of {pagination.total} results
    </div>
    <div className="flex space-x-2">
        <button
            onClick={() => changePage(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
            Previous
        </button>
        <span className="px-4 py-2">
            Page {pagination.current_page} of {pagination.last_page}
        </span>
        <button
            onClick={() => changePage(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
            Next
        </button>
    </div>
</div>
```

---

## Routing and Middleware

### 16. Laravel Route Configuration with Middleware Groups

Code snippet name/title: **RESTful API Routes with Authentication Middleware**

Detailed Description: This routing configuration defines a comprehensive RESTful API structure with proper middleware authentication. It groups related routes, applies authentication guards, and organizes public API endpoints separately from authenticated routes.

Code Snippet:
```php
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
});

Route::prefix('api')->group(function () {
    Route::get('/skills', [SkillController::class, 'index'])->name('api.skills.index');
    Route::get('/skills/categories', [SkillController::class, 'getCategories'])->name('api.skills.categories');
    Route::get('/skills/category/{category}', [SkillController::class, 'getByCategory'])->name('api.skills.by-category');
    
    Route::get('/questionnaires', [QuestionnaireController::class, 'getActive'])->name('api.questionnaires.active');
    Route::get('/questionnaires/niche/{niche}', [QuestionnaireController::class, 'getByNiche'])->name('api.questionnaires.by-niche');
    Route::get('/questions', [QuestionnaireController::class, 'getQuestions'])->name('api.questions');
});
```

---

### 17. Generic Firebase CRUD Controller

Code snippet name/title: **Flexible Collection-Based REST API Controller**

Detailed Description: This generic controller provides complete CRUD operations for any Firestore collection through a single implementation. It accepts collection names as route parameters, enabling dynamic resource management without creating separate controllers for each collection type.

Code Snippet:
```php
namespace App\Http\Controllers;

use App\Services\FirebaseCrudService;
use Illuminate\Http\Request;

class FirebaseCrudController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index(Request $request, string $collection)
    {
        $data = $this->firebase->readAll($collection);
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => count($data)
        ]);
    }

    public function store(Request $request, string $collection)
    {
        $data = $request->all();

        $documentId = $request->input('_id') ?? null;
        if ($documentId) {
            unset($data['_id']);
        }
        
        $result = $this->firebase->create($collection, $data, $documentId);
        
        if ($result) {
            return response()->json([
                'success' => true,
                'message' => 'Document created successfully',
                'data' => $result
            ], 201);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to create document'
        ], 500);
    }

    public function show(string $collection, string $id)
    {
        $data = $this->firebase->read($collection, $id);
        
        if ($data) {
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Document not found'
        ], 404);
    }

    public function update(Request $request, string $collection, string $id)
    {
        $data = $request->all();
        
        $result = $this->firebase->update($collection, $id, $data);
        
        if ($result) {
            return response()->json([
                'success' => true,
                'message' => 'Document updated successfully'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to update document'
        ], 500);
    }

    public function destroy(string $collection, string $id)
    {
        $result = $this->firebase->delete($collection, $id);
        
        if ($result) {
            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete document'
        ], 500);
    }

    public function query(Request $request, string $collection)
    {
        $where = $request->input('where', []);
        $limit = $request->input('limit', 100);
        
        $data = $this->firebase->query($collection, $where, $limit);
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => count($data)
        ]);
    }
}
```

---

## Key Algorithms Summary

1. **Firestore Type Conversion**: Bidirectional conversion between PHP arrays and Firestore's typed field format
2. **Composite Query Builder**: Dynamic construction of complex Firestore queries with multiple filters
3. **OAuth Token Generation**: Service account authentication for server-to-server API access
4. **Observer Pattern**: Automatic data synchronization between MySQL and Firestore
5. **OAuth Flow**: Complete Google authentication implementation with user management
6. **Server-Side Filtering**: Efficient filtering and pagination of large datasets
7. **Data Aggregation**: Multi-source statistics generation for analytics dashboards
8. **Hierarchical Filtering**: Parent-child category system with dynamic loading
9. **Debounced Search**: Performance-optimized search with automatic request delay
10. **Chart Configuration**: Professional data visualization with Chart.js
11. **Form State Management**: Comprehensive CRUD form handling with Inertia.js
12. **RESTful Routing**: Clean API structure with proper middleware organization
13. **Generic CRUD**: Flexible controller supporting any Firestore collection