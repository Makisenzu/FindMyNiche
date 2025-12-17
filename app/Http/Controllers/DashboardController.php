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
        $questionnaires = $this->firebase->readAll('questionnaires');
        $users = $this->firebase->readAll('users');

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

        // Count total questionnaires
        $totalQuestionnaires = count($questionnaires);

        // Count active questionnaires
        $activeQuestionnaires = count(array_filter($questionnaires, function($q) {
            return isset($q['active']) && $q['active'] === true;
        }));

        // Count total questions across all questionnaires
        $totalQuestions = 0;
        foreach ($questionnaires as $questionnaire) {
            if (isset($questionnaire['questions']) && is_array($questionnaire['questions'])) {
                $totalQuestions += count($questionnaire['questions']);
            }
        }

        // Get questionnaires by niche
        $questionnairesByNiche = [];
        foreach ($questionnaires as $questionnaire) {
            $niche = $questionnaire['niche'] ?? 'Uncategorized';
            if (!isset($questionnairesByNiche[$niche])) {
                $questionnairesByNiche[$niche] = 0;
            }
            $questionnairesByNiche[$niche]++;
        }

        // Sort niches by count (descending)
        arsort($questionnairesByNiche);

        // Recent activities (last 5 skills and questionnaires)
        $recentSkills = array_slice(array_reverse($skills), 0, 5);
        $recentQuestionnaires = array_slice(array_reverse($questionnaires), 0, 5);

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
        // In a real app, you'd track creation dates
        $monthlyData = $this->generateMonthlyTrend($skills, $questionnaires);

        // Prepare user niche chart data (for pie chart)
        $nicheChartData = [
            'labels' => array_keys($usersByNiche),
            'values' => array_values($usersByNiche),
        ];

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalSkills' => $totalSkills,
                'totalQuestionnaires' => $totalQuestionnaires,
                'activeQuestionnaires' => $activeQuestionnaires,
                'totalQuestions' => $totalQuestions,
                'totalCategories' => count($skillsByCategory),
                'totalUsers' => $totalUsers,
                'usersWithNiche' => $usersWithNiche,
            ],
            'topCategories' => $topCategories,
            'questionnairesByNiche' => $questionnairesByNiche,
            'recentSkills' => $recentSkills,
            'recentQuestionnaires' => $recentQuestionnaires,
            'categoryChartData' => $categoryChartData,
            'monthlyTrend' => $monthlyData,
            'recentUsers' => $recentUsers,
            'usersByNiche' => $usersByNiche,
            'nicheChartData' => $nicheChartData,
        ]);
    }

    private function generateMonthlyTrend($skills, $questionnaires)
    {
        // Get last 6 months
        $months = [];
        $skillsData = [];
        $questionnairesData = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = $date->format('M Y');
            
            // For demo: simulate cumulative growth
            // In production, you'd filter by actual creation dates
            $skillsData[] = (int) (count($skills) * (1 - ($i * 0.15)));
            $questionnairesData[] = (int) (count($questionnaires) * (1 - ($i * 0.15)));
        }
        
        return [
            'labels' => $months,
            'skills' => $skillsData,
            'questionnaires' => $questionnairesData,
        ];
    }
}
