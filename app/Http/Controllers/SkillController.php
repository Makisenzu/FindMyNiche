<?php

namespace App\Http\Controllers;

use App\Services\FirebaseCrudService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillController extends Controller
{
    protected $firebase;
    protected $collection = 'skills';

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index()
    {
        $skills = $this->firebase->readAll($this->collection);
        
        return Inertia::render('Skills/Index', [
            'skills' => $skills
        ]);
    }

    public function create()
    {
        return Inertia::render('Skills/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $validated['created_at'] = now()->toIso8601String();
        $validated['updated_at'] = now()->toIso8601String();

        $result = $this->firebase->create($this->collection, $validated);

        if ($result) {
            return redirect()->route('skills.index')->with('success', 'Skill created successfully');
        }

        return back()->with('error', 'Failed to create skill');
    }

    public function edit(string $id)
    {
        $skill = $this->firebase->read($this->collection, $id);
        
        if (!$skill) {
            return redirect()->route('skills.index')->with('error', 'Skill not found');
        }

        $skill['_id'] = $id;

        return Inertia::render('Skills/Edit', [
            'skill' => $skill
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $validated['updated_at'] = now()->toIso8601String();

        $result = $this->firebase->update($this->collection, $id, $validated);

        if ($result) {
            return redirect()->route('skills.index')->with('success', 'Skill updated successfully');
        }

        return back()->with('error', 'Failed to update skill');
    }

    public function destroy(string $id)
    {
        $result = $this->firebase->delete($this->collection, $id);

        if ($result) {
            return redirect()->route('skills.index')->with('success', 'Skill deleted successfully');
        }

        return back()->with('error', 'Failed to delete skill');
    }

    public function getByCategory(string $category)
    {
        $skills = $this->firebase->query($this->collection, ['category' => $category]);
        
        return response()->json([
            'success' => true,
            'data' => $skills
        ]);
    }

    public function getCategories()
    {
        $skills = $this->firebase->readAll($this->collection);
        $categories = array_unique(array_column($skills, 'category'));
        sort($categories);
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}
