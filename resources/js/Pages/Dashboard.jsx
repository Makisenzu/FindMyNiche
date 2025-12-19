import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard({ stats, topCategories, recentSkills, categoryChartData, monthlyTrend, recentUsers, usersByNiche, nicheChartData }) {
    // Pie chart configuration
    const pieData = {
        labels: categoryChartData.labels,
        datasets: [
            {
                label: 'Skills',
                data: categoryChartData.values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Indigo
                    'rgba(16, 185, 129, 0.8)',   // Green
                    'rgba(59, 130, 246, 0.8)',   // Blue
                    'rgba(168, 85, 247, 0.8)',   // Purple
                    'rgba(245, 158, 11, 0.8)',   // Amber
                    'rgba(239, 68, 68, 0.8)',    // Red
                    'rgba(236, 72, 153, 0.8)',   // Pink
                    'rgba(20, 184, 166, 0.8)',   // Teal
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(20, 184, 166, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    };

    // Line chart configuration
    const lineData = {
        labels: monthlyTrend.labels,
        datasets: [
            {
                label: 'Skills',
                data: monthlyTrend.skills,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(99, 102, 241)',
            },
            {
                label: 'Questions',
                data: monthlyTrend.questions,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(16, 185, 129)',
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                    },
                    usePointStyle: true,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    return (
        <AuthenticatedLayout
        >
            <Head title="Dashboard" />

            <div className="py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        {/* Total Users */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    {stats.usersWithNiche} with niche assigned
                                </p>
                            </div>
                        </div>

                        {/* Total Skills */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Skills</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSkills}</p>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link 
                                    href={route('skills.index')} 
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    View all skills →
                                </Link>
                            </div>
                        </div>

                        {/* Total Questions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Questions</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalQuestions}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link 
                                    href={route('questions.index')} 
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    View all questions →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Pie Chart - Skills by Category */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Skills Distribution</h3>
                                <p className="text-sm text-gray-500 mt-1">Skills breakdown by category</p>
                            </div>
                            <div className="h-80">
                                {categoryChartData.labels.length > 0 ? (
                                    <Pie data={pieData} options={pieOptions} />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-sm text-gray-500">No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Line Chart - Growth Trend */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Growth Trend</h3>
                                <p className="text-sm text-gray-500 mt-1">6-month growth overview</p>
                            </div>
                            <div className="h-80">
                                <Line data={lineData} options={lineOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Top Categories */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Top Skill Categories</h3>
                            <span className="text-sm text-gray-500">{stats.totalCategories} total</span>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(topCategories).length > 0 ? (
                                Object.entries(topCategories).map(([category, count], index) => (
                                    <div key={category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">{category}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-indigo-600 h-2 rounded-full" 
                                                    style={{ width: `${(count / stats.totalSkills) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-600 w-8 text-right">{count}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">No categories yet</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Recent Skills */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Skills</h3>
                                <Link 
                                    href={route('skills.index')} 
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {recentSkills && recentSkills.length > 0 ? (
                                    recentSkills.map((skill) => (
                                        <div key={skill._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{skill.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{skill.category}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-8">No skills added yet</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Users Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                                <p className="text-sm text-gray-500 mt-1">Latest registered users</p>
                            </div>
                            <span className="text-sm text-gray-500">{stats.totalUsers} total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niche</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentUsers && recentUsers.length > 0 ? (
                                        recentUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-600 font-medium text-sm">
                                                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-gray-900">{user.email}</p>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {user.niche ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {user.niche}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Not assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-gray-600">
                                                        {user.selectedSkills ? user.selectedSkills.length : 0} skills
                                                    </p>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.niche 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {user.niche ? 'Complete' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
