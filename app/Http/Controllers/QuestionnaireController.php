<?php

namespace App\Http\Controllers;

use App\Services\FirebaseCrudService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuestionnaireController extends Controller
{
    protected $firebase;
    protected $collection = 'questionnaires';

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index(Request $request)
    {
        $perPage = 10;
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        
        $allQuestionnaires = $this->firebase->readAll($this->collection);

        $filtered = array_filter($allQuestionnaires, function($q) use ($search) {
            return empty($search) || 
                stripos($q['title'], $search) !== false || 
                stripos($q['niche'] ?? '', $search) !== false ||
                stripos($q['description'] ?? '', $search) !== false;
        });
        
        $total = count($filtered);
        $lastPage = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginated = array_slice($filtered, $offset, $perPage);
        
        return Inertia::render('Questionnaires/Index', [
            'questionnaires' => array_values($paginated),
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
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'niche' => 'required|string|max:255',
            'questions' => 'required|array',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,rating,text,yes_no',
            'questions.*.options' => 'nullable|array',
            'questions.*.required' => 'boolean',
            'active' => 'boolean',
        ]);

        $validated['created_at'] = now()->toIso8601String();
        $validated['updated_at'] = now()->toIso8601String();
        $validated['active'] = $validated['active'] ?? true;

        $result = $this->firebase->create($this->collection, $validated);

        if ($result) {
            return back()->with('success', 'Questionnaire created successfully');
        }

        return back()->with('error', 'Failed to create questionnaire');
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'niche' => 'required|string|max:255',
            'questions' => 'required|array',
            'questions.*.question' => 'required|string',
            'questions.*.type' => 'required|in:multiple_choice,rating,text,yes_no',
            'questions.*.options' => 'nullable|array',
            'questions.*.required' => 'boolean',
            'active' => 'boolean',
        ]);

        $validated['updated_at'] = now()->toIso8601String();

        $result = $this->firebase->update($this->collection, $id, $validated);

        if ($result) {
            return back()->with('success', 'Questionnaire updated successfully');
        }

        return back()->with('error', 'Failed to update questionnaire');
    }

    public function destroy(string $id)
    {
        $result = $this->firebase->delete($this->collection, $id);

        if ($result) {
            return back()->with('success', 'Questionnaire deleted successfully');
        }

        return back()->with('error', 'Failed to delete questionnaire');
    }

    public function show(string $id)
    {
        $questionnaire = $this->firebase->read($this->collection, $id);
        
        if (!$questionnaire) {
            return response()->json(['error' => 'Questionnaire not found'], 404);
        }

        $questionnaire['_id'] = $id;
        return response()->json($questionnaire);
    }

    public function getByNiche(string $niche)
    {
        $questionnaires = $this->firebase->query($this->collection, [
            'niche' => $niche,
            'active' => true
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $questionnaires
        ]);
    }

    public function getActive()
    {
        $questionnaires = $this->firebase->query($this->collection, ['active' => true]);
        
        return response()->json([
            'success' => true,
            'data' => $questionnaires
        ]);
    }

    public function getQuestions()
    {
        $questions = $this->firebase->readAll('questions');
        
        $filteredQuestions = array_filter($questions, function($q) {
            return !empty($q['question']);
        });
        
        usort($filteredQuestions, function($a, $b) {
            return ($a['id'] ?? 0) - ($b['id'] ?? 0);
        });
        
        return response()->json([
            'success' => true,
            'data' => $filteredQuestions
        ]);
    }

    public function getSubCategories(Request $request)
    {
        $mainCategory = $request->input('main_category', '');
        
        $allQuestions = $this->firebase->readAll('questions');
        
        $subCategories = [];
        foreach ($allQuestions as $question) {
            if (isset($question['main_category']) && 
                isset($question['sub_category']) && 
                ($mainCategory === '' || $question['main_category'] === $mainCategory)) {
                $subCategories[$question['sub_category']] = true;
            }
        }
        
        $subCategories = array_keys($subCategories);
        sort($subCategories);
        
        return response()->json([
            'success' => true,
            'data' => $subCategories
        ]);
    }

    public function createMainCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
    
        $allQuestions = $this->firebase->readAll('questions');
        $existingMainCategories = [];
        
        foreach ($allQuestions as $question) {
            if (isset($question['main_category'])) {
                $existingMainCategories[] = $question['main_category'];
            }
        }
        
        if (in_array($validated['name'], $existingMainCategories)) {
            return back()->withErrors([
                'name' => 'Main category already exists'
            ]);
        }
    
        return back()->with('success', 'Main category can be used')->with('category_data', [
            'name' => $validated['name']
        ]);
    }

    public function createSubCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'main_category' => 'required|string|max:255',
        ]);
    
        $allQuestions = $this->firebase->readAll('questions');
        $existingSubCategories = [];
        
        foreach ($allQuestions as $question) {
            if (isset($question['main_category']) && 
                $question['main_category'] === $validated['main_category'] &&
                isset($question['sub_category'])) {
                $existingSubCategories[] = $question['sub_category'];
            }
        }
        
        if (in_array($validated['name'], $existingSubCategories)) {
            return back()->withErrors([
                'name' => 'Sub category already exists under this main category'
            ]);
        }

        return back()->with('success', 'Sub category can be used')->with('category_data', [
            'name' => $validated['name'],
            'main_category' => $validated['main_category']
        ]);
    }

    public function getAllMainCategories()
    {
        $allQuestions = $this->firebase->readAll('questions');
        
        $mainCategories = [];
        foreach ($allQuestions as $question) {
            if (isset($question['main_category'])) {
                $mainCategories[$question['main_category']] = true;
            }
        }
        
        $mainCategories = array_keys($mainCategories);
        sort($mainCategories);
        
        return response()->json([
            'success' => true,
            'data' => $mainCategories
        ]);
    }

    public function getAllSubCategories(Request $request)
    {
        $mainCategory = $request->input('main_category', '');
        
        $allQuestions = $this->firebase->readAll('questions');
        
        $subCategories = [];
        foreach ($allQuestions as $question) {
            if (isset($question['sub_category'])) {
                if (empty($mainCategory) || 
                    (isset($question['main_category']) && $question['main_category'] === $mainCategory)) {
                    $subCategories[$question['sub_category']] = true;
                }
            }
        }
        
        $subCategories = array_keys($subCategories);
        sort($subCategories);
        
        return response()->json([
            'success' => true,
            'data' => $subCategories
        ]);
    }

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

    public function storeQuestion(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'main_category' => 'nullable|string|max:255',
            'sub_category' => 'nullable|string|max:255',
        ]);

        $allQuestions = $this->firebase->readAll('questions');
        $existingIds = [];
        foreach ($allQuestions as $q) {
            if (isset($q['id'])) {
                $existingIds[] = $q['id'];
            }
        }


        $validated['created_at'] = now()->toIso8601String();
        $validated['updated_at'] = now()->toIso8601String();

        $result = $this->firebase->create('questions', $validated);

        if ($result) {
            return back()->with('success', 'Question created successfully');
        }

        return back()->with('error', 'Failed to create question');
    }

    public function updateQuestion(Request $request, string $id)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'id' => 'required|integer',
            'main_category' => 'nullable|string|max:255',
            'sub_category' => 'nullable|string|max:255',
        ]);
        
        $existingQuestion = $this->firebase->read('questions', $id);
        if (!$existingQuestion) {
            return back()->with('error', 'Question not found');
        }

        if ($validated['id'] != $existingQuestion['id']) {
            $allQuestions = $this->firebase->readAll('questions');
            $existingIds = [];
            foreach ($allQuestions as $q) {
                if (isset($q['id'])) {
                    $existingIds[] = $q['id'];
                }
            }
            
            if (in_array($validated['id'], $existingIds)) {
                return back()->withErrors(['id' => 'Question ID already exists'])->withInput();
            }
        }

        $validated['updated_at'] = now()->toIso8601String();

        $result = $this->firebase->update('questions', $id, $validated);

        if ($result) {
            return back()->with('success', 'Question updated successfully');
        }

        return back()->with('error', 'Failed to update question');
    }

    public function destroyQuestion(string $id)
    {
        $result = $this->firebase->delete('questions', $id);

        if ($result) {
            return back()->with('success', 'Question deleted successfully');
        }

        return back()->with('error', 'Failed to delete question');
    }

    public function showQuestion(string $id)
    {
        $question = $this->firebase->read('questions', $id);
        
        if (!$question) {
            return response()->json(['error' => 'Question not found'], 404);
        }

        $question['_id'] = $id;
        return response()->json($question);
    }

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
}