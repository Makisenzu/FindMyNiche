import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Careers({ auth }) {
    const [careers, setCareers] = useState([]);
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [showCareerModal, setShowCareerModal] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [careerForm, setCareerForm] = useState({
        title: '',
        description: '',
        requirements: '',
        salary_range: '',
        growth_potential: ''
    });

    const [questionForm, setQuestionForm] = useState({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0
    });

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/firebase/careers');
            setCareers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching careers:', error);
        }
        setLoading(false);
    };

    const createCareer = async () => {
        try {
            await axios.post('/firebase/careers', {
                ...careerForm,
                questions: [],
                created_at: new Date().toISOString()
            });
            setShowCareerModal(false);
            setCareerForm({ title: '', description: '', requirements: '', salary_range: '', growth_potential: '' });
            fetchCareers();
        } catch (error) {
            console.error('Error creating career:', error);
        }
    };

    const deleteCareer = async (careerId) => {
        if (!confirm('Are you sure you want to delete this career?')) return;
        
        try {
            await axios.delete(`/firebase/careers/${careerId}`);
            fetchCareers();
            if (selectedCareer?._id === careerId) {
                setSelectedCareer(null);
            }
        } catch (error) {
            console.error('Error deleting career:', error);
        }
    };

    const addQuestion = async () => {
        if (!selectedCareer) return;

        try {
            const updatedQuestions = [
                ...(selectedCareer.questions || []),
                {
                    id: Date.now().toString(),
                    question: questionForm.question,
                    options: questionForm.options,
                    correct_answer: questionForm.correct_answer
                }
            ];

            await axios.put(`/firebase/careers/${selectedCareer._id}`, {
                questions: updatedQuestions
            });

            setShowQuestionModal(false);
            setQuestionForm({ question: '', options: ['', '', '', ''], correct_answer: 0 });
            
            // Refresh the selected career
            const response = await axios.get(`/firebase/careers/${selectedCareer._id}`);
            setSelectedCareer({ ...response.data.data, _id: selectedCareer._id });
            fetchCareers();
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const deleteQuestion = async (questionId) => {
        if (!selectedCareer) return;
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            const updatedQuestions = selectedCareer.questions.filter(q => q.id !== questionId);
            
            await axios.put(`/firebase/careers/${selectedCareer._id}`, {
                questions: updatedQuestions
            });

            const response = await axios.get(`/firebase/careers/${selectedCareer._id}`);
            setSelectedCareer({ ...response.data.data, _id: selectedCareer._id });
            fetchCareers();
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...questionForm.options];
        newOptions[index] = value;
        setQuestionForm({ ...questionForm, options: newOptions });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Careers Management"
        >
            <Head title="Careers" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setShowCareerModal(true)}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Career
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Careers List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Careers</h2>
                        </div>
                        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : careers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No careers found. Add your first career!
                                </div>
                            ) : (
                                careers.map((career) => (
                                    <div
                                        key={career._id}
                                        onClick={() => setSelectedCareer(career)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                                            selectedCareer?._id === career._id
                                                ? 'border-violet-600 bg-violet-50'
                                                : 'border-gray-200 hover:border-violet-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{career.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {career.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {career.questions?.length || 0} Questions
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteCareer(career._id);
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Career Details & Questions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {selectedCareer ? (
                            <>
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">{selectedCareer.title}</h2>
                                    <p className="text-sm text-gray-600 mt-1">{selectedCareer.description}</p>
                                    {selectedCareer.salary_range && (
                                        <p className="text-sm text-gray-700 mt-2">
                                            <span className="font-medium">Salary:</span> {selectedCareer.salary_range}
                                        </p>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-gray-900">Assessment Questions</h3>
                                        <button
                                            onClick={() => setShowQuestionModal(true)}
                                            className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition"
                                        >
                                            Add Question
                                        </button>
                                    </div>
                                    <div className="space-y-4 max-h-[450px] overflow-y-auto">
                                        {(!selectedCareer.questions || selectedCareer.questions.length === 0) ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No questions yet. Add assessment questions!
                                            </div>
                                        ) : (
                                            selectedCareer.questions.map((q, index) => (
                                                <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-medium text-gray-900">
                                                            {index + 1}. {q.question}
                                                        </p>
                                                        <button
                                                            onClick={() => deleteQuestion(q.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1 ml-4">
                                                        {q.options.map((option, optIdx) => (
                                                            <div 
                                                                key={optIdx}
                                                                className={`text-sm px-2 py-1 rounded ${
                                                                    optIdx === q.correct_answer
                                                                        ? 'bg-green-100 text-green-800 font-medium'
                                                                        : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {String.fromCharCode(65 + optIdx)}. {option}
                                                                {optIdx === q.correct_answer && ' ✓'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>Select a career to view and manage questions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Career Modal */}
            {showCareerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Add New Career</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Career Title</label>
                                <input
                                    type="text"
                                    value={careerForm.title}
                                    onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={careerForm.description}
                                    onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Brief description of the career"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                                <textarea
                                    value={careerForm.requirements}
                                    onChange={(e) => setCareerForm({ ...careerForm, requirements: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="Required skills and qualifications"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                                <input
                                    type="text"
                                    value={careerForm.salary_range}
                                    onChange={(e) => setCareerForm({ ...careerForm, salary_range: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="e.g., $60,000 - $120,000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Potential</label>
                                <input
                                    type="text"
                                    value={careerForm.growth_potential}
                                    onChange={(e) => setCareerForm({ ...careerForm, growth_potential: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="e.g., High, Medium, Low"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowCareerModal(false);
                                    setCareerForm({ title: '', description: '', requirements: '', salary_range: '', growth_potential: '' });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createCareer}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                            >
                                Create Career
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Add Assessment Question</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <textarea
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Enter your question here"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                                {questionForm.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-600 w-6">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                        />
                                        <input
                                            type="radio"
                                            name="correct_answer"
                                            checked={questionForm.correct_answer === index}
                                            onChange={() => setQuestionForm({ ...questionForm, correct_answer: index })}
                                            className="w-5 h-5 text-violet-600"
                                        />
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500 mt-2">Select the correct answer with the radio button</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowQuestionModal(false);
                                    setQuestionForm({ question: '', options: ['', '', '', ''], correct_answer: 0 });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addQuestion}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                            >
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
