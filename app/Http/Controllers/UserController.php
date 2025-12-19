<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\FirebaseCrudService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function index(Request $request)
    {
        $users = $this->firebase->readAll('users');
        $search = $request->input('search', '');
        if ($search) {
            $users = array_filter($users, function($user) use ($search) {
                $searchLower = strtolower($search);
                return (isset($user['name']) && stripos($user['name'], $search) !== false) ||
                       (isset($user['email']) && stripos($user['email'], $search) !== false) ||
                       (isset($user['niche']) && stripos($user['niche'], $search) !== false);
            });
        }
        $users = array_reverse($users);
        $perPage = 15;
        $page = $request->input('page', 1);
        $total = count($users);
        $lastPage = ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginatedUsers = array_slice($users, $offset, $perPage);

        return Inertia::render('Users/Index', [
            'users' => array_values($paginatedUsers),
            'pagination' => [
                'current_page' => (int)$page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total),
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show($id)
    {
        $user = $this->firebase->read('users', $id);
        return response()->json($user);
    }
}
