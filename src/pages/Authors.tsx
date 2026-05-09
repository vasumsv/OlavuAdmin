import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, User, CheckCircle, XCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Author {
  id: string;
  name_en: string;
  name_kn?: string;
  bio_en?: string;
  bio_kn?: string;
  profile_image?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [orderInputs, setOrderInputs] = useState<Record<string, string>>({});
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  const [formData, setFormData] = useState({
    name_en: '',
    name_kn: '',
    bio_en: '',
    bio_kn: '',
    profile_image: '',
    is_active: true
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      const list = data || [];
      setAuthors(list);
      const inputs: Record<string, string> = {};
      list.forEach(a => { inputs[a.id] = String(a.display_order + 1); });
      setOrderInputs(inputs);
    } catch (error) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (authorId: string, value: string) => {
    setOrderInputs(prev => ({ ...prev, [authorId]: value }));
    setOrderDirty(true);
    setOrderSaved(false);
  };

  const handleUpdateOrder = async () => {
    setSavingOrder(true);

    const sorted = [...authors].sort((a, b) => {
      const posA = parseInt(orderInputs[a.id] ?? String(a.display_order + 1), 10);
      const posB = parseInt(orderInputs[b.id] ?? String(b.display_order + 1), 10);
      const validA = isNaN(posA) ? a.display_order + 1 : posA;
      const validB = isNaN(posB) ? b.display_order + 1 : posB;
      if (validA !== validB) return validA - validB;
      return a.display_order - b.display_order;
    });

    const reassigned = sorted.map((a, idx) => ({ ...a, display_order: idx }));

    try {
      await Promise.all(
        reassigned.map(a =>
          supabase.from('authors').update({ display_order: a.display_order }).eq('id', a.id)
        )
      );
      setAuthors(reassigned);
      const inputs: Record<string, string> = {};
      reassigned.forEach(a => { inputs[a.id] = String(a.display_order + 1); });
      setOrderInputs(inputs);
      setOrderDirty(false);
      setOrderSaved(true);
      setTimeout(() => setOrderSaved(false), 3000);
    } catch {
      fetchAuthors();
    } finally {
      setSavingOrder(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_kn: '',
      bio_en: '',
      bio_kn: '',
      profile_image: '',
      is_active: true
    });
    setFormErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSaving(true);

    try {
      const errors: string[] = [];
      if (!formData.name_en.trim()) errors.push('English name is required');
      if (errors.length > 0) {
        setFormErrors(errors);
        setSaving(false);
        return;
      }

      if (editingAuthor) {
        const { error } = await supabase
          .from('authors')
          .update({
            name_en: formData.name_en.trim(),
            name_kn: formData.name_kn.trim() || null,
            bio_en: formData.bio_en.trim() || null,
            bio_kn: formData.bio_kn.trim() || null,
            profile_image: formData.profile_image.trim() || null,
            is_active: formData.is_active
          })
          .eq('id', editingAuthor.id);

        if (error) throw error;
      } else {
        const maxOrder = authors.length > 0
          ? Math.max(...authors.map(a => a.display_order))
          : -1;

        const { error } = await supabase
          .from('authors')
          .insert([{
            name_en: formData.name_en.trim(),
            name_kn: formData.name_kn.trim() || null,
            bio_en: formData.bio_en.trim() || null,
            bio_kn: formData.bio_kn.trim() || null,
            profile_image: formData.profile_image.trim() || null,
            is_active: formData.is_active,
            display_order: maxOrder + 1
          }]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingAuthor(null);
      resetForm();
      fetchAuthors();
    } catch (error: any) {
      setFormErrors([error.message || 'Failed to save author']);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name_en: author.name_en,
      name_kn: author.name_kn || '',
      bio_en: author.bio_en || '',
      bio_kn: author.bio_kn || '',
      profile_image: author.profile_image || '',
      is_active: author.is_active
    });
    setShowAddModal(true);
  };

  const handleDelete = async (authorId: string) => {
    if (!confirm('Are you sure you want to delete this author?')) return;

    try {
      const { error } = await supabase
        .from('authors')
        .delete()
        .eq('id', authorId);

      if (error) throw error;
      fetchAuthors();
    } catch (error) {
      // Error handled
    }
  };

  const toggleStatus = async (authorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('authors')
        .update({ is_active: !currentStatus })
        .eq('id', authorId);

      if (error) throw error;
      fetchAuthors();
    } catch (error) {
      // Error handled
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.name_kn && author.name_kn.toLowerCase().includes(searchTerm.toLowerCase()))
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600 mt-1">Manage book authors with custom ordering</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpdateOrder}
            disabled={savingOrder || !orderDirty}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              orderSaved
                ? 'bg-green-600 text-white'
                : orderDirty
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {savingOrder ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : orderSaved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Order Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Order
              </>
            )}
          </button>
          <button
            onClick={() => {
              setEditingAuthor(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Author
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Edit the <span className="font-semibold text-gray-800">Order</span> numbers, then click <span className="font-semibold text-gray-800">Update Order</span> to save the new positions.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAuthors.map((author) => (
            <div
              key={author.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <label className="text-xs text-gray-400 font-medium">Order</label>
                <input
                  type="number"
                  min={1}
                  max={authors.length}
                  value={orderInputs[author.id] ?? String(author.display_order + 1)}
                  onChange={(e) => handleOrderChange(author.id, e.target.value)}
                  className="w-14 text-center px-1 py-1.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                {author.profile_image ? (
                  <img
                    src={author.profile_image}
                    alt={author.name_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{author.name_en}</h3>
                  {author.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {author.name_kn && (
                  <p className="text-sm text-gray-600">{author.name_kn}</p>
                )}
                {author.bio_en && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{author.bio_en}</p>
                )}
                <div className="mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    author.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {author.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(author.id, author.is_active)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    author.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {author.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleEdit(author)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(author.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAuthors.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No authors found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Add your first author to get started'}
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingAuthor ? 'Edit Author' : 'Add New Author'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Please fix the following errors:
                        </h3>
                        <ul className="mt-2 text-sm text-red-700 list-disc pl-5">
                          {formErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter author name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Kannada)
                    </label>
                    <input
                      type="text"
                      value={formData.name_kn}
                      onChange={(e) => setFormData({ ...formData, name_kn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="ಲೇಖಕರ ಹೆಸರು"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.profile_image}
                    onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter profile image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography (English)
                  </label>
                  <textarea
                    value={formData.bio_en}
                    onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Enter author biography"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography (Kannada)
                  </label>
                  <textarea
                    value={formData.bio_kn}
                    onChange={(e) => setFormData({ ...formData, bio_kn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="ಲೇಖಕರ ಜೀವನ ಚರಿತ್ರೆ"
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

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingAuthor(null);
                      resetForm();
                    }}
                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      editingAuthor ? 'Update Author' : 'Create Author'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;
