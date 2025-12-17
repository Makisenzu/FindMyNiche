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

    public function index()
    {
        $questionnaires = $this->firebase->readAll($this->collection);
        
        return Inertia::render('Questionnaires/Index', [
            'questionnaires' => $questionnaires
        ]);
    }

    public function create()
    {
        return Inertia::render('Questionnaires/Create');
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
            return redirect()->route('questionnaires.index')->with('success', 'Questionnaire created successfully');
        }

        return back()->with('error', 'Failed to create questionnaire');
    }

    public function edit(string $id)
    {
        $questionnaire = $this->firebase->read($this->collection, $id);
        
        if (!$questionnaire) {
            return redirect()->route('questionnaires.index')->with('error', 'Questionnaire not found');
        }

        $questionnaire['_id'] = $id;

        return Inertia::render('Questionnaires/Edit', [
            'questionnaire' => $questionnaire
        ]);
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
            return redirect()->route('questionnaires.index')->with('success', 'Questionnaire updated successfully');
        }

        return back()->with('error', 'Failed to update questionnaire');
    }

    public function destroy(string $id)
    {
        $result = $this->firebase->delete($this->collection, $id);

        if ($result) {
            return redirect()->route('questionnaires.index')->with('success', 'Questionnaire deleted successfully');
        }

        return back()->with('error', 'Failed to delete questionnaire');
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
}
