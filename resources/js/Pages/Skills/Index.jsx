import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ skills }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const categories = [...new Set(skills.map(skill => skill.category))].sort();

    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || skill.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const groupedSkills = filteredSkills.reduce((acc, skill) => {
        const category = skill.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {});

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this skill?')) {
            router.delete(route('skills.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Skills Management</h2>
                    <Link
                        href={route('skills.create')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Add New Skill
                    </Link>
                </div>
            }
        >
            <Head title="Skills Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6 flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Search skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {Object.keys(groupedSkills).length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    No skills found. <Link href={route('skills.create')} className="text-indigo-600 hover:text-indigo-800">Add your first skill</Link>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                                        <div key={category}>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                                                {category} ({categorySkills.length})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {categorySkills.map((skill) => (
                                                    <div
                                                        key={skill._id}
                                                        className="border rounded-lg p-4 hover:shadow-md transition"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {skill.icon && <span className="text-2xl">{skill.icon}</span>}
                                                                <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                                                            </div>
                                                        </div>
                                                        {skill.description && (
                                                            <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={route('skills.edit', skill._id)}
                                                                className="text-sm text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(skill._id)}
                                                                className="text-sm text-red-600 hover:text-red-800"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
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
