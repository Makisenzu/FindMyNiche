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

    public function questionsIndex(Request $request)
    {
        $perPage = 20;
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        
        $allQuestions = $this->firebase->readAll('questions');

        $filtered = array_filter($allQuestions, function($q) use ($search) {
            if (!empty($search)) {
                return !empty($q['question']) && stripos($q['question'], $search) !== false;
            }
            return true;
        });
        
        usort($filtered, function($a, $b) {
            return ($a['id'] ?? 0) - ($b['id'] ?? 0);
        });

        $total = count($filtered);
        $totalQuestions = count($allQuestions);
        $lastPage = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginated = array_slice($filtered, $offset, $perPage);
        
        return Inertia::render('Questions/Index', [
            'questions' => array_values($paginated),
            'totalQuestions' => $totalQuestions,
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

    public function storeQuestion(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'id' => 'required|integer',
        ]);

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
        ]);

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
}
