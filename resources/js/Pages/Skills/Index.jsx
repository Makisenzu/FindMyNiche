import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ skills, categories, pagination, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterCategory, setFilterCategory] = useState(filters.category || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        category: '',
        description: '',
        icon: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingSkill(null);
        setShowModal(true);
    };

    const openEditModal = async (skill) => {
        const response = await fetch(route('skills.show', skill._id));
        const skillData = await response.json();
        setData({
            name: skillData.name || '',
            category: skillData.category || '',
            description: skillData.description || '',
            icon: skillData.icon || '',
        });
        setEditingSkill(skillData);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSkill(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingSkill) {
            put(route('skills.update', editingSkill._id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('skills.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this skill?')) {
            router.delete(route('skills.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleSearch = () => {
        router.get(route('skills.index'), {
            search: searchTerm,
            category: filterCategory,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search || filterCategory !== filters.category) {
                handleSearch();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterCategory]);

    const changePage = (page) => {
        router.get(route('skills.index'), {
            page,
            search: searchTerm,
            category: filterCategory,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Skills Management</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage your IT skills catalog</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Skill
                    </button>
                </div>
            }
        >
            <Head title="Skills Management" />

            <div className="py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filters Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="lg:col-span-2">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Skills
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
                                            placeholder="Search by name or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                        />
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{pagination.from || 0}</span> to <span className="font-semibold text-gray-900">{pagination.to || 0}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> skills
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Skills Grid */}
                    {skills.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-center py-16 px-4">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No skills found</h3>
                                <p className="mt-2 text-sm text-gray-500">Get started by creating your first skill.</p>
                                <button
                                    onClick={openCreateModal}
                                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Your First Skill
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                                {skills.map((skill) => (
                                    <div
                                        key={skill._id}
                                        className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 overflow-hidden"
                                    >
                                        <div className="p-5 sm:p-6">
                                            {/* Icon and Category */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {skill.icon ? (
                                                        <span className="text-3xl sm:text-4xl">{skill.icon}</span>
                                                    ) : (
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                                    {skill.category}
                                                </span>
                                            </div>

                                            {/* Skill Name */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                                                {skill.name}
                                            </h3>

                                            {/* Description */}
                                            {skill.description && (
                                                <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[4rem]">
                                                    {skill.description}
                                                </p>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => openEditModal(skill)}
                                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(skill._id)}
                                                    className="inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
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
                    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
                        
                        <div 
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {editingSkill ? 'Update skill information' : 'Fill in the details below'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Skill Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., JavaScript, Python"
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                        required
                                    />
                                    {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="category"
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="e.g., Programming, Design, Marketing"
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                        required
                                    />
                                    {errors.category && <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>}
                                </div>

                                <div>
                                    <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Icon (Emoji)
                                    </label>
                                    <input
                                        id="icon"
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        placeholder="💻 🎨 📊"
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500">Optional: Add an emoji to represent this skill</p>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Brief description of the skill..."
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition resize-none"
                                    />
                                </div>

                                {/* Modal Footer */}
                                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 border-t border-gray-200">
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
                                            editingSkill ? 'Update Skill' : 'Create Skill'
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
