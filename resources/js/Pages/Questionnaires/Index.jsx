import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ questionnaires }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuestionnaires = questionnaires.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.niche.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this questionnaire?')) {
            router.delete(route('questionnaires.destroy', id));
        }
    };

    const toggleActive = (id, currentStatus) => {
        router.patch(route('questionnaires.update', id), { active: !currentStatus }, {
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Questionnaires Management</h2>
                    <Link
                        href={route('questionnaires.create')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Add New Questionnaire
                    </Link>
                </div>
            }
        >
            <Head title="Questionnaires Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search questionnaires..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            {filteredQuestionnaires.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No questionnaires found. <Link href={route('questionnaires.create')} className="text-indigo-600 hover:text-indigo-800">Create your first questionnaire</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredQuestionnaires.map((questionnaire) => (
                                        <div
                                            key={questionnaire._id}
                                            className="border rounded-lg p-6 hover:shadow-md transition"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {questionnaire.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            questionnaire.active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {questionnaire.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        <span className="font-medium">Niche:</span> {questionnaire.niche}
                                                    </p>
                                                    {questionnaire.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{questionnaire.description}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        {questionnaire.questions?.length || 0} questions
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={() => toggleActive(questionnaire._id, questionnaire.active)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        {questionnaire.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <Link
                                                        href={route('questionnaires.edit', questionnaire._id)}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(questionnaire._id)}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}