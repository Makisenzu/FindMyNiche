<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\FirebaseCrudService;

class DashboardController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

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
}
