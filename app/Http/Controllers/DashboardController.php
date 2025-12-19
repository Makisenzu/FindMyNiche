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
        // Fetch data from Firebase
        $skills = $this->firebase->readAll('skills');
        $users = $this->firebase->readAll('users');
        $questions = $this->firebase->readAll('questions');

        // Count total skills
        $totalSkills = count($skills);

        // Count skills by category
        $skillsByCategory = [];
        foreach ($skills as $skill) {
            $category = $skill['category'] ?? 'Uncategorized';
            if (!isset($skillsByCategory[$category])) {
                $skillsByCategory[$category] = 0;
            }
            $skillsByCategory[$category]++;
        }

        // Sort categories by count (descending)
        arsort($skillsByCategory);

        // Get top 5 categories
        $topCategories = array_slice($skillsByCategory, 0, 5, true);

        // Count total questions from questions collection
        $totalQuestions = count($questions);

        // Recent activities (last 5 skills)
        $recentSkills = array_slice(array_reverse($skills), 0, 5);

        // User statistics
        $totalUsers = count($users);
        $recentUsers = array_slice(array_reverse($users), 0, 10);

        // Users with completed assessments
        $usersWithNiche = count(array_filter($users, function($user) {
            return isset($user['niche']) && !empty($user['niche']);
        }));

        // Count users by niche
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

        // Prepare chart data for skills by category (for pie chart)
        $categoryChartData = [
            'labels' => array_keys($skillsByCategory),
            'values' => array_values($skillsByCategory),
        ];

        // Prepare trend data (simulate monthly growth for line chart)
        $monthlyData = $this->generateMonthlyTrend($skills, $questions);

        // Prepare user niche chart data (for pie chart)
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
        // Get last 6 months
        $months = [];
        $skillsData = [];
        $questionsData = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = $date->format('M Y');
            
            // For demo: simulate cumulative growth
            // In production, you'd filter by actual creation dates
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
