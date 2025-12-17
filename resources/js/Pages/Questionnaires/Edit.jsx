import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ questionnaire }) {
    const { data, setData, put, processing, errors } = useForm({
        title: questionnaire.title || '',
        description: questionnaire.description || '',
        niche: questionnaire.niche || '',
        questions: questionnaire.questions || [{ question: '', type: 'multiple_choice', options: [''], required: true }],
        active: questionnaire.active ?? true,
    });

    const addQuestion = () => {
        setData('questions', [...data.questions, {
            question: '',
            type: 'multiple_choice',
            options: [''],
            required: true
        }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = data.questions.filter((_, i) => i !== index);
        setData('questions', newQuestions);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('questionnaires.update', questionnaire._id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Questionnaire</h2>
                    <Link
                        href={route('questionnaires.index')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        Back to Questionnaires
                    </Link>
                </div>
            }
        >
            <Head title="Edit Questionnaire" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title *
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div>
                                    <label htmlFor="niche" className="block text-sm font-medium text-gray-700">
                                        Target Niche *
                                    </label>
                                    <input
                                        id="niche"
                                        type="text"
                                        value={data.niche}
                                        onChange={(e) => setData('niche', e.target.value)}
                                        placeholder="e.g., Web Development, Data Science"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                    {errors.niche && <p className="mt-1 text-sm text-red-600">{errors.niche}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="active"
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={(e) => setData('active', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                                    Active (visible to users)
                                </label>
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                                    >
                                        Add Question
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {data.questions.map((question, qIndex) => (
                                        <div key={qIndex} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-medium text-gray-700">Question {qIndex + 1}</h4>
                                                {data.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={question.question}
                                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                        placeholder="Enter your question"
                                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <select
                                                        value={question.type}
                                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                                        className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="multiple_choice">Multiple Choice</option>
                                                        <option value="rating">Rating</option>
                                                        <option value="text">Text</option>
                                                        <option value="yes_no">Yes/No</option>
                                                    </select>

                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={question.required}
                                                            onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Required</span>
                                                    </label>
                                                </div>

                                                {question.type === 'multiple_choice' && (
                                                    <div className="pl-4 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-sm font-medium text-gray-700">Options:</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => addOption(qIndex)}
                                                                className="text-xs text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                + Add Option
                                                            </button>
                                                        </div>
                                                        {question.options?.map((option, oIndex) => (
                                                            <div key={oIndex} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                    placeholder={`Option ${oIndex + 1}`}
                                                                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                                />
                                                                {question.options.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOption(qIndex, oIndex)}
                                                                        className="text-sm text-red-600 hover:text-red-800"
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

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Questionnaire'}
                                </button>
                                <Link
                                    href={route('questionnaires.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}