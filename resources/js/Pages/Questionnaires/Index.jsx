import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ questionnaires, pagination, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingQuestionnaire, setEditingQuestionnaire] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        niche: '',
        questions: [{ question: '', type: 'multiple_choice', options: [''], required: true }],
        active: true,
    });

    const openCreateModal = () => {
        reset();
        setData('questions', [{ question: '', type: 'multiple_choice', options: [''], required: true }]);
        setEditingQuestionnaire(null);
        setShowModal(true);
    };

    const openEditModal = async (questionnaire) => {
        const response = await fetch(route('questionnaires.show', questionnaire._id));
        const qData = await response.json();
        setData({
            title: qData.title || '',
            description: qData.description || '',
            niche: qData.niche || '',
            questions: qData.questions || [{ question: '', type: 'multiple_choice', options: [''], required: true }],
            active: qData.active ?? true,
        });
        setEditingQuestionnaire(qData);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingQuestionnaire(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingQuestionnaire) {
            put(route('questionnaires.update', editingQuestionnaire._id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('questionnaires.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this questionnaire?')) {
            router.delete(route('questionnaires.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const toggleActive = (id, currentStatus) => {
        router.patch(route('questionnaires.update', id), { active: !currentStatus }, {
            preserveScroll: true
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(route('questionnaires.index'), { search: searchTerm }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const changePage = (page) => {
        router.get(route('questionnaires.index'), { page, search: searchTerm }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const addQuestion = () => {
        setData('questions', [...data.questions, { question: '', type: 'multiple_choice', options: [''], required: true }]);
    };

    const removeQuestion = (index) => {
        setData('questions', data.questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...data.questions];
        newQuestions[index][field] = value;
        setData('questions', newQuestions);
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...data.questions];
        newQuestions[questionIndex].options = [...(newQuestions[questionIndex].options || []), ''];
        setData('questions', newQuestions);
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        const newQuestions = [...data.questions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setData('questions', newQuestions);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...data.questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        setData('questions', newQuestions);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Questionnaires</h2>
                        <p className="mt-1 text-sm text-gray-600">Create and manage niche assessment questionnaires</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Questionnaire
                    </button>
                </div>
            }
        >
            <Head title="Questionnaires Management" />

            <div className="py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Search Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Search Questionnaires
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Search by title, niche, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                />
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{pagination.from || 0}</span> to <span className="font-semibold text-gray-900">{pagination.to || 0}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> questionnaires
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Questionnaires List */}
                    {questionnaires.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-center py-16 px-4">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No questionnaires found</h3>
                                <p className="mt-2 text-sm text-gray-500">Get started by creating your first questionnaire.</p>
                                <button
                                    onClick={openCreateModal}
                                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create First Questionnaire
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 sm:space-y-6 mb-8">
                                {questionnaires.map((questionnaire) => (
                                    <div
                                        key={questionnaire._id}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 overflow-hidden"
                                    >
                                        <div className="p-5 sm:p-6">
                                            {/* Header Section */}
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                                    {questionnaire.title}
                                                                </h3>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    questionnaire.active
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    {questionnaire.active ? '● Active' : '○ Inactive'}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                                                <div className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                                    </svg>
                                                                    <span className="font-medium text-gray-900">{questionnaire.niche}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {questionnaire.questions?.length || 0} questions
                                                                </div>
                                                            </div>
                                                            {questionnaire.description && (
                                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                                    {questionnaire.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex sm:flex-col gap-2 sm:items-end">
                                                    <button
                                                        onClick={() => toggleActive(questionnaire._id, questionnaire.active)}
                                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                                    >
                                                        {questionnaire.active ? (
                                                            <>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(questionnaire)}
                                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(questionnaire._id)}
                                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-700 order-2 sm:order-1">
                                            Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of{' '}
                                            <span className="font-medium">{pagination.total}</span> results
                                        </div>
                                        <nav className="flex items-center gap-2 order-1 sm:order-2" aria-label="Pagination">
                                            <button
                                                onClick={() => changePage(pagination.current_page - 1)}
                                                disabled={pagination.current_page === 1}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            >
                                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                <span className="hidden sm:inline">Previous</span>
                                            </button>
                                            
                                            <div className="hidden sm:flex items-center gap-2">
                                                {[...Array(pagination.last_page)].map((_, i) => {
                                                    const page = i + 1;
                                                    if (
                                                        page === 1 ||
                                                        page === pagination.last_page ||
                                                        (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => changePage(page)}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                                                    page === pagination.current_page
                                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                                        : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                                }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    } else if (
                                                        page === pagination.current_page - 2 ||
                                                        page === pagination.current_page + 2
                                                    ) {
                                                        return <span key={page} className="px-2 text-gray-500">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <div className="sm:hidden text-sm text-gray-700">
                                                Page {pagination.current_page} of {pagination.last_page}
                                            </div>

                                            <button
                                                onClick={() => changePage(pagination.current_page + 1)}
                                                disabled={pagination.current_page === pagination.last_page}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeModal}>
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div 
                            className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header - Sticky */}
                            <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {editingQuestionnaire ? 'Edit Questionnaire' : 'Create New Questionnaire'}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {editingQuestionnaire ? 'Update questionnaire details and questions' : 'Set up a new niche assessment questionnaire'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none rounded-lg p-1 hover:bg-gray-100 transition"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                <div className="px-6 py-6 space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="e.g., Web Development Assessment"
                                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                                required
                                            />
                                            {errors.title && <p className="mt-1.5 text-sm text-red-600">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Target Niche <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.niche}
                                                onChange={(e) => setData('niche', e.target.value)}
                                                placeholder="e.g., Web Development"
                                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                                required
                                            />
                                            {errors.niche && <p className="mt-1.5 text-sm text-red-600">{errors.niche}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={2}
                                            placeholder="Brief description of what this questionnaire assesses..."
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition resize-none"
                                        />
                                    </div>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.active}
                                            onChange={(e) => setData('active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active (visible to users)</span>
                                    </label>

                                    {/* Questions Section */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">Questions</h4>
                                                <p className="mt-1 text-sm text-gray-500">Add assessment questions for this niche</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addQuestion}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                            >
                                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Question
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {data.questions.map((q, qIndex) => (
                                                <div key={qIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h5 className="text-sm font-semibold text-gray-900">Question {qIndex + 1}</h5>
                                                        {data.questions.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeQuestion(qIndex)}
                                                                className="text-sm text-red-600 hover:text-red-800 font-medium transition"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            value={q.question}
                                                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                            placeholder="Enter your question..."
                                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm bg-white transition"
                                                            required
                                                        />

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <select
                                                                value={q.type}
                                                                onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                                                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm bg-white transition"
                                                            >
                                                                <option value="multiple_choice">Multiple Choice</option>
                                                                <option value="rating">Rating (1-5)</option>
                                                                <option value="text">Text Response</option>
                                                                <option value="yes_no">Yes/No</option>
                                                            </select>

                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={q.required}
                                                                    onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">Required question</span>
                                                            </label>
                                                        </div>

                                                        {q.type === 'multiple_choice' && (
                                                            <div className="pl-4 space-y-3 border-l-2 border-indigo-200">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-sm font-medium text-gray-700">Answer Options:</p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addOption(qIndex)}
                                                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                                                                    >
                                                                        + Add Option
                                                                    </button>
                                                                </div>
                                                                {q.options?.map((opt, oIndex) => (
                                                                    <div key={oIndex} className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={opt}
                                                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                            placeholder={`Option ${oIndex + 1}`}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white transition"
                                                                        />
                                                                        {q.options.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeOption(qIndex, oIndex)}
                                                                                className="px-3 py-2 text-red-600 hover:text-red-800 font-medium text-sm transition"
                                                                            >
                                                                                ×
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer - Sticky */}
                                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            editingQuestionnaire ? 'Update Questionnaire' : 'Create Questionnaire'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
