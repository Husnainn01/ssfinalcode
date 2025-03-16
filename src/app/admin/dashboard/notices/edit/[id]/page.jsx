"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminMenu from '@/app/admin/components/template/adminMenu';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

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

export default function EditNoticePage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    isActive: true,
    showOnPages: ['all'],
    expiresAt: new Date(+new Date() + 30*24*60*60*1000).toISOString().split('T')[0],
    position: 'top'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [pages, setPages] = useState(['all', 'home', 'faq', 'contact', 'about', 'listings', 'blog']);
  const [selectedPages, setSelectedPages] = useState(['all']);

  useEffect(() => {
    setEditorLoaded(true);
    if (id) {
      fetchNotice();
    }
  }, [id]);

  const fetchNotice = async () => {
    try {
      const response = await fetch(`/api/notices/${id}`);
      if (!response.ok) throw new Error('Failed to fetch notice');
      
      const data = await response.json();
      
      // Format the date for the input field
      const formattedData = {
        ...data,
        expiresAt: new Date(data.expiresAt).toISOString().split('T')[0]
      };
      
      setFormData(formattedData);
      setSelectedPages(data.showOnPages || ['all']);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notice:', error);
      toast.error('Failed to load notice');
      router.push('/admin/dashboard/notices');
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
      content: content
    });
  };

  const handlePageSelection = (e) => {
    const value = e.target.value;
    let newSelectedPages;
    
    if (value === 'all') {
      // If 'all' is selected, clear other selections
      newSelectedPages = ['all'];
    } else {
      // If any other page is selected, remove 'all' from the selection
      const withoutAll = selectedPages.filter(page => page !== 'all');
      
      if (selectedPages.includes(value)) {
        // If the page is already selected, remove it
        newSelectedPages = withoutAll.filter(page => page !== value);
      } else {
        // If the page is not selected, add it
        newSelectedPages = [...withoutAll, value];
      }
      
      // If no pages are selected, default to 'all'
      if (newSelectedPages.length === 0) {
        newSelectedPages = ['all'];
      }
    }
    
    setSelectedPages(newSelectedPages);
    setFormData({
      ...formData,
      showOnPages: newSelectedPages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate form
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error('Title and content are required');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/notices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update notice');
      
      toast.success('Notice updated successfully');
      router.push('/admin/dashboard/notices');
    } catch (error) {
      console.error('Error updating notice:', error);
      toast.error('Failed to update notice');
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Notice</h1>
          <p className="text-gray-600">Update this notice or announcement</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notice title"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                Content
              </label>
              {editorLoaded && (
                <ReactQuill
                  value={formData.content}
                  onChange={handleEditorChange}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white rounded-lg"
                  style={{ height: '200px', marginBottom: '50px' }}
                  placeholder="Enter notice content with formatting..."
                />
              )}
              <div className="mt-16"></div> {/* Space for the editor */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                  Notice Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                  Position
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="top">Top of page</option>
                  <option value="bottom">Bottom of page</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiresAt">
                Expiration Date
              </label>
              <input
                type="date"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Show On Pages
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {pages.map(page => (
                  <label key={page} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={page}
                      checked={selectedPages.includes(page)}
                      onChange={handlePageSelection}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700 capitalize">{page}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select "all" to show on all pages, or select specific pages.
              </p>
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
                onClick={() => router.push('/admin/dashboard/notices')}
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
                {saving ? 'Saving...' : 'Update Notice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminMenu>
  );
} 