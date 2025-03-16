"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminMenu from '@/app/admin/components/template/adminMenu';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

// Categories for Q&A
const categories = [
  'General Questions',
  'Vehicles & Inventory',
  'Buying & Paying',
  'Booking & Shipping',
  'Documentation',
  'Receiving Your Cargo',
  'Country Regulations',
  'Glossary Of Terms',
  'Other'
];

// Quill editor modules and formats
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'align',
  'color', 'background',
  'link'
];

export default function EditQnaPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General Questions',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    setEditorLoaded(true);
    if (id) {
      fetchQnaItem();
    }
  }, [id]);

  const fetchQnaItem = async () => {
    try {
      const response = await fetch(`/api/qna/${id}`);
      if (!response.ok) throw new Error('Failed to fetch Q&A item');
      
      const data = await response.json();
      setFormData({
        ...data,
        // Ensure category is one of the valid options
        category: categories.includes(data.category) ? data.category : 'General Questions'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Q&A item:', error);
      toast.error('Failed to load Q&A item');
      router.push('/admin/dashboard/qna');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      answer: content
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate form
      if (!formData.question.trim() || !formData.answer.trim()) {
        toast.error('Question and answer are required');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/qna/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date()
        }),
      });

      if (!response.ok) throw new Error('Failed to update Q&A item');
      
      toast.success('Q&A item updated successfully');
      router.push('/admin/dashboard/qna');
    } catch (error) {
      console.error('Error updating Q&A item:', error);
      toast.error('Failed to update Q&A item');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminMenu>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AdminMenu>
    );
  }

  return (
    <AdminMenu>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Q&A</h1>
          <p className="text-gray-600">Update this question and answer</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
                Question
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the question"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="answer">
                Answer
              </label>
              {editorLoaded && (
                <ReactQuill
                  value={formData.answer}
                  onChange={handleEditorChange}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white rounded-lg"
                  style={{ height: '200px', marginBottom: '50px' }}
                  placeholder="Enter the answer with formatting..."
                />
              )}
              <div className="mt-16"></div> {/* Space for the editor */}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard/qna')}
                className="mr-4 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none ${
                  saving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving...' : 'Update Q&A'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminMenu>
  );
} 