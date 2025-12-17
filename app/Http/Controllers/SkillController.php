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

    public function index(Request $request)
    {
        $perPage = 12;
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $category = $request->input('category', '');
        
        $allSkills = $this->firebase->readAll($this->collection);
        
        // Filter skills
        $filteredSkills = array_filter($allSkills, function($skill) use ($search, $category) {
            $matchesSearch = empty($search) || 
                stripos($skill['name'], $search) !== false || 
                stripos($skill['description'] ?? '', $search) !== false;
            
            $matchesCategory = empty($category) || $skill['category'] === $category;
            
            return $matchesSearch && $matchesCategory;
        });
        
        // Get unique categories
        $categories = array_unique(array_column($allSkills, 'category'));
        sort($categories);
        
        // Paginate
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
            return back()->with('success', 'Skill created successfully');
        }

        return back()->with('error', 'Failed to create skill');
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
            return back()->with('success', 'Skill updated successfully');
        }

        return back()->with('error', 'Failed to update skill');
    }

    public function destroy(string $id)
    {
        $result = $this->firebase->delete($this->collection, $id);

        if ($result) {
            return back()->with('success', 'Skill deleted successfully');
        }

        return back()->with('error', 'Failed to delete skill');
    }

    public function show(string $id)
    {
        $skill = $this->firebase->read($this->collection, $id);
        
        if (!$skill) {
            return response()->json(['error' => 'Skill not found'], 404);
        }

        $skill['_id'] = $id;
        return response()->json($skill);
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
