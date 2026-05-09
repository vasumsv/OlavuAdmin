import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Gift,
  Package,
  X,
  Image as ImageIcon,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Book {
  id: string;
  title_en: string;
  author: string;
  sku: string;
  selling_price: number;
  stock_qty: number;
  image?: string;
}

interface GiftCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  books: (Book & { quantity: number })[];
  is_active: boolean;
  created_at: string;
}

const GiftCombos: React.FC = () => {
  const [combos, setCombos] = useState<GiftCombo[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState<GiftCombo | null>(null);
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<(Book & { quantity: number })[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: ['', '', '', '', ''],
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  useEffect(() => {
    fetchCombos();
    fetchBooks();
  }, []);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const { data: combosData, error } = await supabase
        .from('gift_combos')
        .select(`
          *,
          gift_combo_books (
            quantity,
            books (
              id,
              title_en,
              author,
              sku,
              selling_price,
              stock_qty,
              image
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedCombos = (combosData || []).map(combo => ({
        ...combo,
        books: combo.gift_combo_books.map((gcb: any) => ({
          ...gcb.books,
          quantity: gcb.quantity
        }))
      }));

      setCombos(transformedCombos);
    } catch (error) {
      console.error('Error fetching gift combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title_en, author, selling_price, stock_qty, image, sku')
        .eq('status', 'active')
        .gt('stock_qty', 0)
        .order('title_en');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleAddCombo = () => {
    setEditingCombo(null);
    setSelectedBooks([]);
    setFormData({
      name: '',
      description: '',
      price: '',
      images: ['', '', '', '', ''],
      is_active: true
    });
    setFormErrors([]);
    setShowAddModal(true);
  };

  const handleEditCombo = (combo: GiftCombo) => {
    setEditingCombo(combo);
    setSelectedBooks(combo.books);
    setFormData({
      name: combo.name,
      description: combo.description || '',
      price: combo.price.toString(),
      images: combo.images.length > 0 ? [...combo.images, ...Array(5 - combo.images.length).fill('')] : ['', '', '', '', ''],
      is_active: combo.is_active
    });
    setFormErrors([]);
    setShowAddModal(true);
  };

  const handleBookSelect = (book: Book) => {
    // Check if book is out of stock
    if (book.stock_qty <= 0) {
      setStockWarnings([`"${book.title_en}" is out of stock and cannot be added to combo`]);
      setTimeout(() => setStockWarnings([]), 5000);
      return;
    }

    const existingBook = selectedBooks.find(b => b.id === book.id);
    if (!existingBook) {
      setSelectedBooks([...selectedBooks, { ...book, quantity: 1 }]);
    } else {
      // Increase quantity if book already selected
      setSelectedBooks(selectedBooks.map(b => 
        b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b
      ));
    }
    setBookSearchTerm('');
    setStockWarnings([]); // Clear warnings on successful add
  };

  const handleBookRemove = (bookId: string) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== bookId));
  };

  const handleQuantityChange = (bookId: string, quantity: number) => {
    if (quantity < 1) {
      handleBookRemove(bookId);
      return;
    }
    
    // Check if requested quantity exceeds available stock
    const book = selectedBooks.find(b => b.id === bookId);
    if (book && quantity > book.stock_qty) {
      setStockWarnings([`Cannot add ${quantity} copies of "${book.title_en}". Only ${book.stock_qty} available in stock.`]);
      setTimeout(() => setStockWarnings([]), 5000);
      return;
    }
    
    setSelectedBooks(selectedBooks.map(b => 
      b.id === bookId ? { ...b, quantity } : b
    ));
    setStockWarnings([]); // Clear warnings on successful update
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const calculateSuggestedPrice = () => {
    const totalPrice = selectedBooks.reduce((sum, book) => sum + (book.selling_price * book.quantity), 0);
    return Math.round(totalPrice * 0.9); // 10% discount suggestion
  };

  const handleDelete = async (comboId: string) => {
    if (!confirm('Are you sure you want to delete this gift combo?')) return;

    try {
      const { error } = await supabase
        .from('gift_combos')
        .delete()
        .eq('id', comboId);

      if (error) throw error;
      fetchCombos();
    } catch (error) {
      console.error('Error deleting gift combo:', error);
    }
  };

  const toggleStatus = async (comboId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('gift_combos')
        .update({ is_active: !currentStatus })
        .eq('id', comboId);

      if (error) throw error;
      fetchCombos();
    } catch (error) {
      console.error('Error updating combo status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setStockWarnings([]);
    setSaving(true);

    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      
      if (!formData.name.trim()) errors.push('Combo name is required');
      if (!formData.description.trim()) errors.push('Description is required');
      if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
      if (selectedBooks.length < 2) errors.push('At least 2 books are required for a combo');
      
      // Check stock availability for all selected books
      selectedBooks.forEach(book => {
        if (book.stock_qty <= 0) {
          errors.push(`"${book.title_en}" is out of stock`);
        } else if (book.quantity > book.stock_qty) {
          errors.push(`"${book.title_en}": Requested ${book.quantity} but only ${book.stock_qty} available`);
        }
      });
      
      // Calculate maximum possible combos
      const maxCombos = Math.min(...selectedBooks.map(book => Math.floor(book.stock_qty / book.quantity)));
      if (maxCombos <= 0) {
        errors.push('Cannot create combo: Insufficient stock for selected books');
      } else if (maxCombos < 5) {
        warnings.push(`Warning: Only ${maxCombos} combo(s) can be made with current stock levels`);
      }
      
      if (errors.length > 0) {
        setFormErrors(errors);
        setStockWarnings(warnings);
        return;
      }
      
      if (warnings.length > 0) {
        setStockWarnings(warnings);
      }

      // Filter out empty images
      const validImages = formData.images.filter(img => img.trim() !== '');

      const comboData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        images: validImages,
        is_active: formData.is_active
      };

      let comboId: string;

      if (editingCombo) {
        // Update existing combo
        const { error } = await supabase
          .from('gift_combos')
          .update(comboData)
          .eq('id', editingCombo.id);

        if (error) throw error;
        comboId = editingCombo.id;

        // Delete existing combo books
        await supabase
          .from('gift_combo_books')
          .delete()
          .eq('combo_id', comboId);
      } else {
        // Create new combo
        const { data, error } = await supabase
          .from('gift_combos')
          .insert([comboData])
          .select()
          .single();

        if (error) throw error;
        comboId = data.id;
      }

      // Insert combo books
      const comboBooks = selectedBooks.map(book => ({
        combo_id: comboId,
        book_id: book.id,
        quantity: book.quantity
      }));

      const { error: booksError } = await supabase
        .from('gift_combo_books')
        .insert(comboBooks);

      if (booksError) throw booksError;

      setShowAddModal(false);
      setEditingCombo(null);
      fetchCombos();
      
    } catch (error: any) {
      console.error('Error saving gift combo:', error);
      if (error.message?.includes('duplicate key')) {
        setFormErrors(['A combo with this name already exists.']);
      } else {
        setFormErrors([error.message || 'Failed to save gift combo']);
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title_en.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.sku.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const filteredCombos = combos.filter(combo =>
    combo.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Gift Combos</h1>
          <p className="text-gray-600 mt-1">Create and manage book gift combinations</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-4 sm:mt-0">
            <Gift className="h-4 w-4" />
            <span>
              Total Combos: {combos.length} | 
              Active: {combos.filter(c => c.is_active).length} | 
              Inactive: {combos.filter(c => !c.is_active).length}
            </span>
          </div>
        </div>
        <button
          onClick={handleAddCombo}
          className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Gift Combo
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search gift combos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Combos Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredCombos.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No gift combos found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search' : 'Create your first gift combo to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCombos.map((combo) => (
              <div key={combo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Combo Image */}
                <div className="h-48 bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
                  {combo.images.length > 0 && combo.images[0] ? (
                    <img
                      src={combo.images[0]}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gift className="h-16 w-16 text-gray-400" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{combo.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{combo.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      combo.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {combo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-lg font-bold text-green-600">₹{combo.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{combo.books.length} books included</p>
                  </div>

                  {/* Books in combo */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Books included:</p>
                    <div className="space-y-1">
                      {combo.books.slice(0, 3).map((book) => (
                        <div key={book.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">{book.title_en}</span>
                          <span className="text-gray-500">×{book.quantity}</span>
                        </div>
                      ))}
                      {combo.books.length > 3 && (
                        <p className="text-xs text-gray-500">+{combo.books.length - 3} more books</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleStatus(combo.id, combo.is_active)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        combo.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {combo.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCombo(combo)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(combo.id)}
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCombo ? 'Edit Gift Combo' : 'Create New Gift Combo'}
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
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Combo Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g., Classic Literature Bundle"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        placeholder="Describe this gift combo..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0.00"
                        />
                        {selectedBooks.length >= 2 && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, price: calculateSuggestedPrice().toString() })}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                          >
                            Suggest: ₹{calculateSuggestedPrice()}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Combo Images (Max 5)
                      </label>
                      <div className="space-y-2">
                        {formData.images.map((image, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="url"
                              value={image}
                              onChange={(e) => handleImageChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder={`Image ${index + 1} URL`}
                            />
                            {image && (
                              <div className="w-10 h-10 border border-gray-300 rounded overflow-hidden">
                                <img
                                  src={image}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Book Selection */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Books for Combo *
                      </label>
                      
                      {/* Book Search */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          value={bookSearchTerm}
                          onChange={(e) => setBookSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Search by title, author, or SKU..."
                        />
                      </div>

                      {/* Book Search Results */}
                      {bookSearchTerm && (
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg mb-3">
                          {filteredBooks.slice(0, 5).map((book) => (
                            <button
                              key={book.id}
                              type="button"
                              onClick={() => handleBookSelect(book)}
                              disabled={book.stock_qty <= 0}
                              className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                                book.stock_qty <= 0 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'hover:bg-gray-50 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{book.title_en}</p>
                                  <p className="text-xs text-gray-500">{book.author} • SKU: {book.sku}</p>
                                  {book.stock_qty <= 0 && (
                                    <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-green-600">₹{book.selling_price}</p>
                                  <p className={`text-xs ${book.stock_qty <= 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {book.stock_qty} in stock
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                          {filteredBooks.length === 0 && (
                            <div className="p-3 text-center text-gray-500 text-sm">
                              No books found matching "{bookSearchTerm}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Selected Books */}
                      {/* Stock Warnings */}
                      {stockWarnings.length > 0 && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <XCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Stock Warnings:</h3>
                              <div className="mt-1 text-sm text-yellow-700">
                                <ul className="list-disc pl-5 space-y-1">
                                  {stockWarnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Selected Books ({selectedBooks.length})
                        </p>
                        {selectedBooks.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No books selected yet</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedBooks.map((book) => (
                              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {book.image && (
                                    <img
                                      src={book.image}
                                      alt={book.title_en}
                                      className="w-8 h-10 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{book.title_en}</p>
                                    <p className="text-xs text-gray-500">{book.author}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(book.id, book.quantity - 1)}
                                      className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300"
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center text-sm">{book.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(book.id, book.quantity + 1)}
                                      className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={book.quantity >= book.stock_qty}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-medium text-green-600">₹{book.selling_price * book.quantity}</span>
                                    {book.quantity > book.stock_qty && (
                                      <p className="text-xs text-red-500">Exceeds stock!</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleBookRemove(book.id)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedBooks.length >= 2 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Total individual price:</strong> ₹{selectedBooks.reduce((sum, book) => sum + (book.selling_price * book.quantity), 0)}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Suggested combo price (10% off):</strong> ₹{calculateSuggestedPrice()}
                          </p>
                          <p className="text-sm text-blue-700">
                            <strong>Max combos possible:</strong> {Math.min(...selectedBooks.map(book => Math.floor(book.stock_qty / book.quantity)))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active (visible to customers)
                  </label>
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
                      <Gift className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : (editingCombo ? 'Update Combo' : 'Create Combo')}
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

export default GiftCombos;