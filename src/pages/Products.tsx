import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Package, Filter, Eye, EyeOff, X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TagInput from '../components/TagInput';

interface Book {
  id: string;
  sku: string;
  title_en: string;
  title_kn?: string;
  author: string;
  author_kn?: string;
  publisher?: string;
  publisher_kn?: string;
  isbn?: string;
  cost_price: number;
  mrp: number;
  selling_price: number;
  stock_qty: number;
  min_threshold: number;
  description?: string;
  description_kn?: string;
  status: 'active' | 'inactive';
  image?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  category_id: string;
  keywords?: string[];
  tags?: string[];
  language?: 'english' | 'kannada' | 'bilingual';
  pages?: number;
  weight_grams?: number;
  dimensions?: string;
  binding?: string;
  title_spelling_tags_en?: string[];
  title_spelling_tags_kn?: string[];
  author_spelling_tags_en?: string[];
  author_spelling_tags_kn?: string[];
  created_at: string;
}

interface Category {
  id: string;
  name_en: string;
  name_kn: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Book | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Image management state
  const [imageFields, setImageFields] = useState<string[]>(['', '']);

  // Calculate profit/loss percentage
  const calculateProfitLossPercentage = (): { value: string; isProfit: boolean; isLoss: boolean; isZero: boolean } => {
    const costPrice = parseFloat(formData.cost_price);
    const sellingPrice = parseFloat(formData.selling_price);

    if (!costPrice || isNaN(costPrice) || costPrice === 0 || !sellingPrice || isNaN(sellingPrice)) {
      return { value: '-', isProfit: false, isLoss: false, isZero: true };
    }

    const percentage = ((sellingPrice - costPrice) / costPrice) * 100;
    const formattedPercentage = percentage.toFixed(2);

    return {
      value: percentage > 0 ? `+${formattedPercentage}%` : percentage < 0 ? `${formattedPercentage}%` : `${formattedPercentage}%`,
      isProfit: percentage > 0,
      isLoss: percentage < 0,
      isZero: percentage === 0
    };
  };
  
  const [formData, setFormData] = useState({
    sku: '',
    title_en: '',
    title_kn: '',
    author: '',
    author_kn: '',
    publisher: '',
    publisher_kn: '',
    isbn: '',
    cost_price: '',
    mrp: '',
    selling_price: '',
    stock_qty: '',
    min_threshold: '',
    description: '',
    description_kn: '',
    status: 'active' as 'active' | 'inactive',
    category_id: '',
    keywords: '',
    tags: [] as string[],
    language: 'english' as 'english' | 'kannada' | 'bilingual',
    pages: '',
    weight_grams: '',
    dimensions: '',
    binding: '',
    title_spelling_tags_en: '',
    title_spelling_tags_kn: '',
    author_spelling_tags_en: '',
    author_spelling_tags_kn: '',
    author_profile_image: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_en, name_kn')
        .eq('is_active', true)
        .order('name_en');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      // Error handling
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      title_en: '',
      title_kn: '',
      author: '',
      author_kn: '',
      publisher: '',
      publisher_kn: '',
      isbn: '',
      cost_price: '',
      mrp: '',
      selling_price: '',
      stock_qty: '',
      min_threshold: '',
      description: '',
      description_kn: '',
      status: 'active',
      category_id: '',
      keywords: '',
      tags: [],
      language: 'english',
      pages: '',
      weight_grams: '',
      dimensions: '',
      binding: '',
      title_spelling_tags_en: '',
      title_spelling_tags_kn: '',
      author_spelling_tags_en: '',
      author_spelling_tags_kn: '',
      author_profile_image: ''
    });
    setImageFields(['']);
    setFormErrors([]);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (product: Book) => {
    setEditingProduct(product);
    
    // Initialize image fields from all available image columns
    const productImages = [];
    
    // Load from all image columns
    if (product.image && product.image.trim() !== '') {
      productImages.push(product.image);
    }
    if (product.image2 && product.image2.trim() !== '') {
      productImages.push(product.image2);
    }
    if (product.image3 && product.image3.trim() !== '') {
      productImages.push(product.image3);
    }
    if (product.image4 && product.image4.trim() !== '') {
      productImages.push(product.image4);
    }
    if (product.image5 && product.image5.trim() !== '') {
      productImages.push(product.image5);
    }
    
    // Ensure we have at least 1 slot
    while (productImages.length < 1) {
      productImages.push('');
    }
    
    setImageFields(productImages);
    
    setFormData({
      sku: product.sku || '',
      title_en: product.title_en || '',
      title_kn: product.title_kn || '',
      author: product.author || '',
      author_kn: product.author_kn || '',
      publisher: product.publisher || '',
      publisher_kn: product.publisher_kn || '',
      isbn: product.isbn || '',
      cost_price: product.cost_price != null ? product.cost_price.toString() : '',
      mrp: product.mrp != null ? product.mrp.toString() : '',
      selling_price: product.selling_price != null ? product.selling_price.toString() : '',
      stock_qty: product.stock_qty != null ? product.stock_qty.toString() : '',
      min_threshold: product.min_threshold != null ? product.min_threshold.toString() : '',
      description: product.description || '',
      description_kn: product.description_kn || '',
      status: product.status,
      category_id: product.category_id || '',
      keywords: product.keywords ? product.keywords.join(', ') : '',
      tags: product.tags || [],
      language: product.language || 'english',
      pages: product.pages?.toString() || '',
      weight_grams: product.weight_grams?.toString() || '',
      dimensions: product.dimensions || '',
      binding: product.binding || '',
      title_spelling_tags_en: product.title_spelling_tags_en ? product.title_spelling_tags_en.join(', ') : '',
      title_spelling_tags_kn: product.title_spelling_tags_kn ? product.title_spelling_tags_kn.join(', ') : '',
      author_spelling_tags_en: product.author_spelling_tags_en ? product.author_spelling_tags_en.join(', ') : '',
      author_spelling_tags_kn: product.author_spelling_tags_kn ? product.author_spelling_tags_kn.join(', ') : '',
      author_profile_image: product.author_profile_image || ''
    });
    setShowAddModal(true);
  };

  const addImageField = () => {
    if (imageFields.length < 5) {
      setImageFields([...imageFields, '']);
    }
  };

  const removeImageField = (index: number) => {
    if (imageFields.length > 1) {
      const newFields = imageFields.filter((_, i) => i !== index);
      setImageFields(newFields);
    }
  };

  const updateImageField = (index: number, value: string) => {
    const newFields = [...imageFields];
    newFields[index] = value;
    setImageFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setSaving(true);

    try {
      const errors: string[] = [];
      
      if (!formData.sku.trim()) errors.push('SKU is required');
      if (!formData.title_en.trim()) errors.push('English title is required');
      if (!formData.author.trim()) errors.push('Author is required');
      if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) errors.push('Valid cost price is required');
      if (!formData.mrp || parseFloat(formData.mrp) <= 0) errors.push('Valid MRP is required');
      if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) errors.push('Valid selling price is required');
      if (!formData.stock_qty || parseInt(formData.stock_qty) < 0) errors.push('Valid stock quantity is required');
      if (!formData.category_id) errors.push('Category is required');
      
      // Check that at least 1 image is provided
      const validImages = imageFields.filter(img => img.trim() !== '');
      if (validImages.length < 1) {
        errors.push('At least 1 product image is required');
      }
      
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      // Filter out empty images and assign to database fields
      const filteredImages = imageFields.filter(img => img.trim() !== '');
      
      const productData = {
        sku: formData.sku.trim(),
        title_en: formData.title_en.trim(),
        title_kn: formData.title_kn.trim() || null,
        author: formData.author.trim(),
        author_kn: formData.author_kn.trim() || null,
        publisher: formData.publisher.trim() || null,
        publisher_kn: formData.publisher_kn.trim() || null,
        isbn: formData.isbn.trim() || null,
        cost_price: parseFloat(formData.cost_price),
        mrp: parseFloat(formData.mrp),
        selling_price: parseFloat(formData.selling_price),
        stock_qty: parseInt(formData.stock_qty),
        min_threshold: parseInt(formData.min_threshold),
        description: formData.description.trim() || null,
        description_kn: formData.description_kn.trim() || null,
        status: formData.status,
        image: filteredImages[0] || null,
        image2: filteredImages[1] || null,
        image3: filteredImages[2] || null,
        image4: filteredImages[3] || null,
        image5: filteredImages[4] || null,
        category_id: formData.category_id || null,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        language: formData.language,
        pages: formData.pages ? parseInt(formData.pages) : null,
        weight_grams: formData.weight_grams ? parseInt(formData.weight_grams) : null,
        dimensions: formData.dimensions.trim() || null,
        binding: formData.binding.trim() || null,
        title_spelling_tags_en: formData.title_spelling_tags_en ? formData.title_spelling_tags_en.split(',').map(k => k.trim()).filter(k => k) : [],
        title_spelling_tags_kn: formData.title_spelling_tags_kn ? formData.title_spelling_tags_kn.split(',').map(k => k.trim()).filter(k => k) : [],
        author_spelling_tags_en: formData.author_spelling_tags_en ? formData.author_spelling_tags_en.split(',').map(k => k.trim()).filter(k => k) : [],
        author_spelling_tags_kn: formData.author_spelling_tags_kn ? formData.author_spelling_tags_kn.split(',').map(k => k.trim()).filter(k => k) : [],
        author_profile_image: formData.author_profile_image.trim() || null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('books')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('books')
          .insert([productData]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      if (error.message?.includes('duplicate key')) {
        setFormErrors(['A product with this SKU already exists.']);
      } else {
        setFormErrors([error.message || 'Failed to save product']);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      // Error handling
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your book inventory</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title_en}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{product.title_en}</p>
                        {product.title_kn && (
                          <p className="text-sm text-gray-600">{product.title_kn}</p>
                        )}
                        <p className="text-sm text-gray-500">{product.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm">{product.sku}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="font-medium text-green-600">₹{product.selling_price}</p>
                      <p className="text-gray-500 line-through">₹{product.mrp}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="font-medium">{product.stock_qty}</p>
                      {product.stock_qty <= product.min_threshold && (
                        <p className="text-red-500 text-xs">Low stock</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status === 'active' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleStatus(product.id, product.status)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          product.status === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {product.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || statusFilter
                ? 'Try adjusting your filters'
                : 'Add your first product to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Messages */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter product SKU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title_en}
                        onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter English title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title (Kannada)
                      </label>
                      <input
                        type="text"
                        value={formData.title_kn}
                        onChange={(e) => setFormData({ ...formData, title_kn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="ಶೀರ್ಷಿಕೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter author name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author (Kannada)
                      </label>
                      <input
                        type="text"
                        value={formData.author_kn}
                        onChange={(e) => setFormData({ ...formData, author_kn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="ಲೇಖಕರ ಹೆಸರನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author Profile Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.author_profile_image}
                        onChange={(e) => setFormData({ ...formData, author_profile_image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter author profile image URL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images *
                      </label>
                      <div className="space-y-3">
                        {imageFields.map((image, index) => (
                          <div key={`image-${index}`} className="flex items-center space-x-2">
                            <div className="flex-1">
                              <input
                                type="url"
                                value={image}
                                onChange={(e) => updateImageField(index, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder={`Image ${index + 1} URL ${index < 1 ? '(Required)' : '(Optional)'}`}
                                required={index < 1}
                              />
                            </div>
                            {image && (
                              <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
                                <img
                                  src={image}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            {index >= 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageField(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {imageFields.length < 5 && (
                          <button
                            type="button"
                            onClick={addImageField}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Image ({imageFields.length}/5)
                          </button>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          At least 1 image is required. You can add up to 5 images total.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.cost_price}
                          onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          MRP *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Selling Price *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.selling_price}
                          onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Profit / Loss %
                        <span className="ml-1 text-xs text-gray-500 font-normal" title="This shows profit or loss percentage based on cost price">
                          (Auto-calculated)
                        </span>
                      </label>
                      <div
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-lg ${
                          calculateProfitLossPercentage().isProfit
                            ? 'text-green-600'
                            : calculateProfitLossPercentage().isLoss
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {calculateProfitLossPercentage().value === '-' ? (
                          <span className="text-sm font-normal text-gray-400">Enter cost price and selling price</span>
                        ) : (
                          calculateProfitLossPercentage().value
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.stock_qty}
                          onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Threshold
                        </label>
                        <input
                          type="number"
                          value={formData.min_threshold}
                          onChange={(e) => setFormData({ ...formData, min_threshold: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => {
                          setFormData({ ...formData, category_id: e.target.value });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (Max 8)
                      </label>
                      <TagInput
                        tags={formData.tags}
                        onChange={(tags) => setFormData({ ...formData, tags })}
                        maxTags={8}
                        placeholder="Type a tag and press Enter"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add relevant tags for this product (e.g., "Thriller", "Mystery", "Kannada")
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        placeholder="Enter product description"
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
                        placeholder="ಉತ್ಪನ್ನದ ವಿವರಣೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ನಮೂದಿಸಿ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Book Details Section */}
                    <div className="col-span-2 border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Book Details</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Additional book-specific information for better cataloging and customer information.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ISBN
                          </label>
                          <input
                            type="text"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter ISBN number"
                          />
                          <p className="text-xs text-gray-500 mt-1">International Standard Book Number</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publisher
                          </label>
                          <input
                            type="text"
                            value={formData.publisher}
                            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter publisher name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publisher (Kannada)
                          </label>
                          <input
                            type="text"
                            value={formData.publisher_kn}
                            onChange={(e) => setFormData({ ...formData, publisher_kn: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="ಪ್ರಕಾಶಕರ ಹೆಸರು"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of Pages
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.pages}
                            onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter total pages"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language
                          </label>
                          <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value as 'english' | 'kannada' | 'bilingual' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="english">English</option>
                            <option value="kannada">Kannada</option>
                            <option value="bilingual">Bilingual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Binding
                          </label>
                          <select
                            value={formData.binding}
                            onChange={(e) => setFormData({ ...formData, binding: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="">Select binding type</option>
                            <option value="hardbound">Hard Bind</option>
                            <option value="paperback">Paperback</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Spelling Tags Section */}
                    <div className="col-span-2 border-t pt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Search Spelling Tags</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Add common misspellings and variations to help customers find products even with typos.
                        Separate multiple tags with commas. Max 10 tags per field.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title Spelling Tags (English)
                          </label>
                          <textarea
                            value={formData.title_spelling_tags_en}
                            onChange={(e) => setFormData({ ...formData, title_spelling_tags_en: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={2}
                            placeholder="e.g., Alchemist, Almist, Allchmist, Alchimist"
                          />
                          <p className="text-xs text-gray-500 mt-1">Common misspellings of the book title</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title Spelling Tags (Kannada)
                          </label>
                          <textarea
                            value={formData.title_spelling_tags_kn}
                            onChange={(e) => setFormData({ ...formData, title_spelling_tags_kn: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={2}
                            placeholder="ಶೀರ್ಷಿಕೆಯ ಕಾಗುಣಿತ ವ್ಯತ್ಯಾಸಗಳು"
                          />
                          <p className="text-xs text-gray-500 mt-1">ಕನ್ನಡ ಶೀರ್ಷಿಕೆಯ ಸಾಮಾನ್ಯ ತಪ್ಪು ಕಾಗುಣಿತಗಳು</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Author Spelling Tags (English)
                          </label>
                          <textarea
                            value={formData.author_spelling_tags_en}
                            onChange={(e) => setFormData({ ...formData, author_spelling_tags_en: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={2}
                            placeholder="e.g., Paulo Coelho, Paulo Coelo, Paul Coelho"
                          />
                          <p className="text-xs text-gray-500 mt-1">Common misspellings of the author name</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Author Spelling Tags (Kannada)
                          </label>
                          <textarea
                            value={formData.author_spelling_tags_kn}
                            onChange={(e) => setFormData({ ...formData, author_spelling_tags_kn: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={2}
                            placeholder="ಲೇಖಕರ ಹೆಸರಿನ ಕಾಗುಣಿತ ವ್ಯತ್ಯಾಸಗಳು"
                          />
                          <p className="text-xs text-gray-500 mt-1">ಕನ್ನಡ ಲೇಖಕರ ಹೆಸರಿನ ಸಾಮಾನ್ಯ ತಪ್ಪು ಕಾಗುಣಿತಗಳು</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Package className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
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

export default Products;