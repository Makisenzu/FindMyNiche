<?php

namespace App\Http\Controllers;

use App\Services\FirebaseCrudService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
