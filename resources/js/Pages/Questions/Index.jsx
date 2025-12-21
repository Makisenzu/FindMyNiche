import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

export default function Index({ 
    questions, 
    pagination, 
    filters, 
    totalQuestions,
    mainCategories,
    subCategories,
    categorizedSubCategories 
}) {
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedMainCategory, setSelectedMainCategory] = useState(filters.main_category || '');
    const [selectedSubCategory, setSelectedSubCategory] = useState(filters.sub_category || '');
    const [viewMode, setViewMode] = useState('grid');
    const [categoryStats, setCategoryStats] = useState(null);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [loadingSubCategories, setLoadingSubCategories] = useState(false);
    
    const [showNewMainCategoryModal, setShowNewMainCategoryModal] = useState(false);
    const [showNewSubCategoryModal, setShowNewSubCategoryModal] = useState(false);
    const [newMainCategory, setNewMainCategory] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [subCategoryMainCategory, setSubCategoryMainCategory] = useState('');

    const [localMainCategories, setLocalMainCategories] = useState(mainCategories);
    const [localSubCategories, setLocalSubCategories] = useState(subCategories);
    const [localCategorizedSubCategories, setLocalCategorizedSubCategories] = useState(categorizedSubCategories);

    const [modalFilteredSubCategories, setModalFilteredSubCategories] = useState([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: '',
        question: '',
        main_category: '',
        sub_category: '',
    });

    const fetchSubCategories = useCallback(async (mainCategory) => {
        if (!mainCategory) {
            setFilteredSubCategories([]);
            return;
        }
        
        setLoadingSubCategories(true);
        try {
            const response = await fetch(route('questions.sub-categories', { main_category: mainCategory }));
            const result = await response.json();
            if (result.success) {
                setFilteredSubCategories(result.data);
            }
        } catch (error) {
            console.error('Error fetching sub-categories:', error);
            setFilteredSubCategories([]);
        } finally {
            setLoadingSubCategories(false);
        }
    }, []);

    useEffect(() => {
        if (selectedMainCategory && categorizedSubCategories?.[selectedMainCategory]) {
            setFilteredSubCategories(categorizedSubCategories[selectedMainCategory]);
        } else {
            setFilteredSubCategories([]);
        }
    }, [selectedMainCategory, categorizedSubCategories]);

    const handleMainCategoryChange = (value) => {
        setSelectedMainCategory(value);
        setSelectedSubCategory('');
        
        if (value && categorizedSubCategories?.[value]) {
            setFilteredSubCategories(categorizedSubCategories[value]);
        } else {
            setFilteredSubCategories([]);
            if (value) {
                fetchSubCategories(value);
            }
        }
    };

    const openCreateModal = () => {
        reset();
        
        const maxId = questions.reduce((max, q) => {
            const qId = parseInt(q.id) || 0;
            return qId > max ? qId : max;
        }, 0);
        
        setData('id', maxId + 1);
        setData('main_category', '');
        setData('sub_category', '');
        setModalFilteredSubCategories([]);
        setEditingQuestion(null);
        setShowModal(true);
    };

    useEffect(() => {
        if (data.main_category && localCategorizedSubCategories[data.main_category]) {
            setModalFilteredSubCategories(localCategorizedSubCategories[data.main_category]);
        } else {
            setModalFilteredSubCategories([]);
        }
    }, [data.main_category, localCategorizedSubCategories]);

    const openEditModal = async (question) => {
        const response = await fetch(route('questions.show', question._id));
        const qData = await response.json();
        setData({
            id: qData.id || '',
            question: qData.question || '',
            main_category: qData.main_category || '',
            sub_category: qData.sub_category || '',
        });
        setEditingQuestion(qData);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowNewMainCategoryModal(false);
        setShowNewSubCategoryModal(false);
        setNewMainCategory('');
        setNewSubCategory('');
        setSubCategoryMainCategory('');
        setEditingQuestion(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingQuestion) {
            put(route('questions.update', editingQuestion._id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('questions.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(route('questions.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const createNewMainCategory = () => {
        if (!newMainCategory.trim()) {
            alert('Please enter a main category name');
            return;
        }
        
        if (localMainCategories.includes(newMainCategory)) {
            alert('This main category already exists');
            return;
        }
        
        router.post(route('questions.main-categories.create'), {
            name: newMainCategory
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                if (page.props.errors && page.props.errors.name) {
                    alert(page.props.errors.name);
                    return;
                }

                if (page.props.flash && page.props.flash.category_data) {
                    const categoryData = page.props.flash.category_data;
                    
                    const updatedMainCategories = [...localMainCategories, categoryData.name].sort();
                    setLocalMainCategories(updatedMainCategories);
                    
                    const updatedCategorizedSubCategories = { ...localCategorizedSubCategories };
                    if (!updatedCategorizedSubCategories[categoryData.name]) {
                        updatedCategorizedSubCategories[categoryData.name] = [];
                    }
                    setLocalCategorizedSubCategories(updatedCategorizedSubCategories);
                    
                    setData('main_category', categoryData.name);
                    setNewMainCategory('');
                    setShowNewMainCategoryModal(false);
                    
                    alert(`Main category "${categoryData.name}" added successfully!`);
                } else {
                    const updatedMainCategories = [...localMainCategories, newMainCategory].sort();
                    setLocalMainCategories(updatedMainCategories);
                    
                    const updatedCategorizedSubCategories = { ...localCategorizedSubCategories };
                    if (!updatedCategorizedSubCategories[newMainCategory]) {
                        updatedCategorizedSubCategories[newMainCategory] = [];
                    }
                    setLocalCategorizedSubCategories(updatedCategorizedSubCategories);
                    
                    setData('main_category', newMainCategory);
                    setNewMainCategory('');
                    setShowNewMainCategoryModal(false);
                    
                    alert(`Main category "${newMainCategory}" added successfully!`);
                }
            },
            onError: (errors) => {
                if (errors.name) {
                    alert(errors.name);
                } else if (errors.message) {
                    alert(errors.message);
                } else {
                    alert('Failed to create main category');
                }
            }
        });
    };

    const createNewSubCategory = () => {
        if (!newSubCategory.trim()) {
            alert('Please enter a sub category name');
            return;
        }
        
        if (!subCategoryMainCategory) {
            alert('Please select a main category for the sub category');
            return;
        }
        
        const existingSubCats = localCategorizedSubCategories[subCategoryMainCategory] || [];
        if (existingSubCats.includes(newSubCategory)) {
            alert('This sub category already exists under the selected main category');
            return;
        }

        router.post(route('questions.sub-categories.create'), {
            name: newSubCategory,
            main_category: subCategoryMainCategory
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                if (page.props.errors) {
                    if (page.props.errors.name) {
                        alert(page.props.errors.name);
                        return;
                    }
                    if (page.props.errors.main_category) {
                        alert(page.props.errors.main_category);
                        return;
                    }
                }
                
                if (page.props.flash && page.props.flash.category_data) {
                    const categoryData = page.props.flash.category_data;

                    const updatedCategorizedSubCategories = { ...localCategorizedSubCategories };
                    if (!updatedCategorizedSubCategories[categoryData.main_category]) {
                        updatedCategorizedSubCategories[categoryData.main_category] = [];
                    }
                    if (!updatedCategorizedSubCategories[categoryData.main_category].includes(categoryData.name)) {
                        updatedCategorizedSubCategories[categoryData.main_category].push(categoryData.name);
                        updatedCategorizedSubCategories[categoryData.main_category].sort();
                    }
                    setLocalCategorizedSubCategories(updatedCategorizedSubCategories);
                    
                    const updatedSubCategories = [...localSubCategories, categoryData.name].sort();
                    setLocalSubCategories(updatedSubCategories);
                    
                    setFilteredSubCategories(updatedCategorizedSubCategories[categoryData.main_category] || []);

                    setData('main_category', categoryData.main_category);
                    setData('sub_category', categoryData.name);
                    setNewSubCategory('');
                    setSubCategoryMainCategory('');
                    setShowNewSubCategoryModal(false);
                    
                    alert(`Sub category "${categoryData.name}" added successfully under "${categoryData.main_category}"!`);
                } else {
                    const updatedCategorizedSubCategories = { ...localCategorizedSubCategories };
                    if (!updatedCategorizedSubCategories[subCategoryMainCategory]) {
                        updatedCategorizedSubCategories[subCategoryMainCategory] = [];
                    }
                    if (!updatedCategorizedSubCategories[subCategoryMainCategory].includes(newSubCategory)) {
                        updatedCategorizedSubCategories[subCategoryMainCategory].push(newSubCategory);
                        updatedCategorizedSubCategories[subCategoryMainCategory].sort();
                    }
                    setLocalCategorizedSubCategories(updatedCategorizedSubCategories);
                    
                    const updatedSubCategories = [...localSubCategories, newSubCategory].sort();
                    setLocalSubCategories(updatedSubCategories);
                    
                    setFilteredSubCategories(updatedCategorizedSubCategories[subCategoryMainCategory] || []);
                    
                    setData('main_category', subCategoryMainCategory);
                    setData('sub_category', newSubCategory);
                    setNewSubCategory('');
                    setSubCategoryMainCategory('');
                    setShowNewSubCategoryModal(false);
                    
                    alert(`Sub category "${newSubCategory}" added successfully under "${subCategoryMainCategory}"!`);
                }
            },
            onError: (errors) => {
                if (errors.name) {
                    alert(errors.name);
                } else if (errors.main_category) {
                    alert(errors.main_category);
                } else if (errors.message) {
                    alert(errors.message);
                } else {
                    alert('Failed to create sub category');
                }
            }
        });
    };

    const applyFilters = () => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedMainCategory) params.main_category = selectedMainCategory;
        if (selectedSubCategory) params.sub_category = selectedSubCategory;
        
        router.get(route('questions.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedMainCategory('');
        setSelectedSubCategory('');
        setFilteredSubCategories([]);
        router.get(route('questions.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedMainCategory, selectedSubCategory]);

    useEffect(() => {
        fetch(route('questions.stats'))
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategoryStats(data.data);
                }
            });
    }, []);

    const changePage = (page) => {
        const params = { page };
        if (searchTerm) params.search = searchTerm;
        if (selectedMainCategory) params.main_category = selectedMainCategory;
        if (selectedSubCategory) params.sub_category = selectedSubCategory;
        
        router.get(route('questions.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Questions Library" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Questions Library</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Manage assessment questions with categories for niche discovery
                                </p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Question
                            </button>
                        </div>
                    </div>

                    {/* Stats & Filters Bar */}
                    <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Stats Cards */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Total Questions Card */}
                            <div className="bg-black rounded-xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Total Questions</p>
                                        <p className="text-4xl font-bold mt-2">{totalQuestions}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Categories Stats */}
                            {categoryStats && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories Overview</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Main Categories:</span>
                                            <span className="font-semibold">{Object.keys(categoryStats.by_main_category || {}).length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Sub Categories:</span>
                                            <span className="font-semibold">{Object.keys(categoryStats.by_sub_category || {}).length}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filters Card */}
                        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Search</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search questions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Main Category Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Main Category</label>
                                    <select
    value={selectedMainCategory}
    onChange={(e) => handleMainCategoryChange(e.target.value)}
    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
>
    <option value="">All Main Categories</option>
    {localMainCategories.map((category) => (
        <option key={category} value={category}>{category}</option>
    ))}
</select>
                                </div>

                                {/* Sub Category Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Sub Category
                                        {selectedMainCategory && (
                                            <span className="ml-1 text-gray-500">
                                                ({loadingSubCategories ? 'Loading...' : `${filteredSubCategories.length} available`})
                                            </span>
                                        )}
                                    </label>
                                    <select
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                        disabled={!selectedMainCategory || loadingSubCategories}
                                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">All Sub Categories</option>
                                        {filteredSubCategories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    {!selectedMainCategory && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Select a main category first
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Clear Filters
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        Showing {pagination.from} - {pagination.to} of {pagination.total}
                                    </span>
                                </div>
                                
                                {/* View Toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                            viewMode === 'grid'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        title="Grid View"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                            viewMode === 'table'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                        title="Table View"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Display */}
                    {questions.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="text-center py-20 px-4">
                                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">No questions found</h3>
                                <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                                    {searchTerm || selectedMainCategory || selectedSubCategory 
                                        ? 'Try adjusting your filters to see more results.'
                                        : 'Start building your question library by adding your first assessment question.'}
                                </p>
                                <button
                                    onClick={openCreateModal}
                                    className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create First Question
                                </button>
                            </div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {questions.map((question) => (
                                <div
                                    key={question._id}
                                    className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                >
                                    <div className="p-5">
                                        {/* Question ID Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white text-white text-xs font-bold">
                                                {/* Q #{question.id} */}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(question)}
                                                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(question._id)}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Category Badges */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {question.main_category && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {question.main_category}
                                                </span>
                                            )}
                                            {question.sub_category && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                                    {question.sub_category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Question Text */}
                                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 mb-3">
                                            {question.question || <span className="text-gray-400 italic">Empty question</span>}
                                        </p>

                                        {/* Footer */}
                                        {question.created_at && (
                                            <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(question.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Table View */
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Question
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Categories
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date Added
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {questions.map((question) => (
                                            <tr key={question._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900 line-clamp-2">
                                                        {question.question || <span className="text-gray-400 italic">Empty question</span>}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {question.main_category && (
                                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                                                                {question.main_category}
                                                            </span>
                                                        )}
                                                        {question.sub_category && (
                                                            <span className="block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded mt-1">
                                                                {question.sub_category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {question.created_at ? new Date(question.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(question)}
                                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <span className="text-gray-300">|</span>
                                                        <button
                                                            onClick={() => handleDelete(question._id)}
                                                            className="text-red-600 hover:text-red-900 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-center">
                            <nav className="flex items-center gap-1" aria-label="Pagination">
                                <button
                                    onClick={() => changePage(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                
                                <div className="flex items-center gap-1 mx-2">
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
                                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-semibold transition ${
                                                        page === pagination.current_page
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                            : 'text-gray-700 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === pagination.current_page - 2 ||
                                            page === pagination.current_page + 2
                                        ) {
                                            return <span key={page} className="px-2 text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => changePage(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Question Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={closeModal}>
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div 
                            className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {editingQuestion ? 'Edit Question' : 'Create New Question'}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {editingQuestion ? 'Update question details' : 'Add a new assessment question'}
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

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-6 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

                                        {/* Main Category with Add Button */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Main Category
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewMainCategoryModal(true)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add New
                                                </button>
                                            </div>
                                            <select
                                            value={data.main_category}
                                            onChange={(e) => {
                                                setData('main_category', e.target.value);
                                                setData('sub_category', '');
        
                                                if (e.target.value && localCategorizedSubCategories[e.target.value]) {
                                                    setModalFilteredSubCategories(localCategorizedSubCategories[e.target.value]);
                                                } else {
                                                    setModalFilteredSubCategories([]);
                                                }
                                            }}
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                        >
                                            <option value="">Select Main Category</option>
                                            {localMainCategories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                            {errors.main_category && <p className="mt-1.5 text-sm text-red-600">{errors.main_category}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Sub Category
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (data.main_category) {
                                                        setSubCategoryMainCategory(data.main_category);
                                                    }
                                                    setShowNewSubCategoryModal(true);
                                                }}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add New
                                            </button>
                                        </div>
    
                                        <select
                                            value={data.sub_category}
                                            onChange={(e) => setData('sub_category', e.target.value)}
                                            disabled={!data.main_category}
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select Sub Category</option>
                                            {modalFilteredSubCategories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
    
                                        {errors.sub_category && <p className="mt-1.5 text-sm text-red-600">{errors.sub_category}</p>}
                                        {!data.main_category && (
                                            <p className="mt-1.5 text-xs text-gray-500">
                                                Select a main category first to see available sub categories
                                            </p>
                                        )}
                                    </div>

                                    {/* Question Text */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Question Text <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.question}
                                            onChange={(e) => setData('question', e.target.value)}
                                            rows={4}
                                            placeholder="Enter your question here..."
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition resize-none"
                                            required
                                        />
                                        {errors.question && <p className="mt-1.5 text-sm text-red-600">{errors.question}</p>}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3">
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
                                            editingQuestion ? 'Update Question' : 'Create Question'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* New Main Category Modal */}
            {showNewMainCategoryModal && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div 
                            className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Create New Main Category</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add a new main category for questions</p>
                                </div>
                                <button
                                    onClick={() => setShowNewMainCategoryModal(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none rounded-lg p-1 hover:bg-gray-100 transition"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-6 py-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Main Category Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newMainCategory}
                                            onChange={(e) => setNewMainCategory(e.target.value)}
                                            placeholder="e.g., Technical Skills, Soft Skills"
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewMainCategoryModal(false)}
                                            className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={createNewMainCategory}
                                            className="w-full sm:w-auto px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                        >
                                            Create Main Category
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Sub Category Modal */}
            {showNewSubCategoryModal && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
                        
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        
                        <div 
                            className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Create New Sub Category</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add a new sub category under a main category</p>
                                </div>
                                <button
                                    onClick={() => setShowNewSubCategoryModal(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none rounded-lg p-1 hover:bg-gray-100 transition"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-6 py-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Select Main Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={subCategoryMainCategory}
                                            onChange={(e) => setSubCategoryMainCategory(e.target.value)}
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                        >
                                            <option value="">Select a main category</option>
                                            {localMainCategories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Sub Category Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newSubCategory}
                                            onChange={(e) => setNewSubCategory(e.target.value)}
                                            placeholder="e.g., Realistic, Healthcare, Teamwork"
                                            className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewSubCategoryModal(false)}
                                            className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={createNewSubCategory}
                                            disabled={!subCategoryMainCategory || !newSubCategory.trim()}
                                            className="w-full sm:w-auto px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            Create Sub Category
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}