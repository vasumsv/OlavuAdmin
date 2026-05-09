import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Grid2x2 as Grid, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name_en: string;
  name_kn: string;
  slug: string;
  parent_id?: string;
  category_image?: string;
  category_url?: string;
  description?: string;
  book_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name_en: '',
    name_kn: '',
    description: '',
    description_kn: '',
    category_image: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      // Update book count for each category
      const categoriesWithCount = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'active');
          
          return { ...category, book_count: count || 0 };
        })
      );

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    try {
      // Validate required fields
      const errors: string[] = [];
      
      if (!formData.name_en.trim()) errors.push('English category name is required');
      if (!formData.name_kn.trim()) errors.push('Kannada category name is required');
      
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }
      
      const slug = formData.name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            ...formData,
            slug,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            ...formData,
            slug,
            sort_order: categories.length
          }]);

        if (error) throw error;
      }

      setFormData({
        name_en: '',
        name_kn: '',
        description: '',
        description_kn: '',
        category_image: '',
        is_active: true
      });
      setShowAddModal(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
     
     // Handle specific database errors
     if (error.message?.includes('duplicate key')) {
       setFormErrors(['Category name already exists. Please use a different name.']);
     } else if (error.message?.includes('violates check constraint')) {
       setFormErrors(['Invalid data format. Please check your input values.']);
     } else {
       setFormErrors([error.message || 'Failed to save category. Please try again.']);
     }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en,
      name_kn: category.name_kn,
      description: category.description || '',
      description_kn: '',
      category_image: category.category_image || '',
      is_active: category.is_active
    });
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const toggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_kn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage book categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name_en: '',
              name_kn: '',
              description: '',
              description_kn: '',
              category_image: '',
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
              {category.category_image ? (
                <img
                  src={category.category_image}
                  alt={category.name_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Grid className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name_en}</h3>
                  <p className="text-sm text-gray-600">{category.name_kn}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {category.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {category.book_count} books
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleStatus(category.id, category.is_active)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    category.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {category.is_active ? 'Deactivate' : 'Activate'}
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Grid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No categories found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Try adjusting your search' : 'Add your first category to get started'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Messages */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Please fix the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {formErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter English name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name (Kannada) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_kn}
                  onChange={(e) => setFormData({ ...formData, name_kn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="ವರ್ಗದ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Enter description in English"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Kannada)
                </label>
                <textarea
                  value={formData.description_kn}
                  onChange={(e) => setFormData({ ...formData, description_kn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="ವಿವರಣೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image URL
                </label>
                <input
                  type="url"
                  value={formData.category_image}
                  onChange={(e) => setFormData({ ...formData, category_image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter category image URL"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;