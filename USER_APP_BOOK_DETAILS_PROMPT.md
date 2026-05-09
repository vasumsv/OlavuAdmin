# PROMPT: Display Book Metadata on Product Detail Page

## Goal
Add a "Book Details" section to the product detail page that displays real book information including ISBN, Publisher, Pages, Language, and Binding type.

---

## Database Fields Available

The following fields are available in your Supabase `books` table:

| Field Name | Data Type | Example Value | Description |
|------------|-----------|---------------|-------------|
| `isbn` | text | "978-0-06-112241-5" | International Standard Book Number |
| `publisher` | text | "Penguin Random House" | Publisher name (English) |
| `publisher_kn` | text | "ಪೆಂಗ್ವಿನ್ ರಾಂಡಮ್ ಹೌಸ್" | Publisher name (Kannada) |
| `pages` | integer | 324 | Total number of pages |
| `language` | text | "english" | Book language (values: "english", "kannada", "bilingual") |
| `binding` | text | "hardbound" | Binding type (values: "hardbound" = Hard Bind, "paperback" = Paperback) |

**Important**: All fields are optional (can be null/empty). Only display fields that have actual data.

---

## What to Build

### 1. Create a "Book Details" or "Specifications" Section

Add this section on your product detail page (book detail page). It should display:

- **ISBN**: Show the ISBN number
- **Publisher**: Show publisher name (use Kannada version if user language is Kannada)
- **Pages**: Show total page count
- **Language**: Show as "English", "Kannada", or "Bilingual"
- **Binding**: Show as "Hard Bound" or "Paperback"

### 2. Visual Design Requirements

**Layout**: Clean, organized grid or list format

**Styling**:
- Section should have a clear heading "Book Details" or "Specifications"
- Each field should have a label and value
- Use icons (optional but recommended) for visual appeal
- Maintain consistent spacing
- Mobile responsive

**Example Layout**:

```
┌────────────────────────────────────────┐
│  BOOK DETAILS                          │
├────────────────────────────────────────┤
│  📚 ISBN: 978-0-06-112241-5            │
│  🏢 Publisher: Penguin Random House    │
│  📖 Pages: 324                          │
│  🌐 Language: English                   │
│  📕 Binding: Paperback                  │
└────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Update Your Book Interface/Type

Ensure your TypeScript interface (or PropTypes) includes these fields:

```typescript
interface Book {
  id: string;
  title_en: string;
  title_kn?: string;
  author: string;
  isbn?: string;              // ← Add this
  publisher?: string;         // ← Add this
  publisher_kn?: string;      // ← Add this
  pages?: number;             // ← Add this
  language?: string;          // ← Add this
  binding?: string;           // ← Add this
  selling_price: number;
  mrp: number;
  image?: string;
  description?: string;
  // ... other fields
}
```

### Step 2: Fetch Data from Supabase

Make sure your query includes these fields:

```typescript
const { data: book, error } = await supabase
  .from('books')
  .select('*')  // This gets all fields including the new metadata
  .eq('id', bookId)
  .single();
```

Or explicitly:

```typescript
const { data: book, error } = await supabase
  .from('books')
  .select(`
    id,
    title_en,
    title_kn,
    author,
    isbn,
    publisher,
    publisher_kn,
    pages,
    language,
    binding,
    selling_price,
    mrp,
    image,
    description,
    stock_qty
  `)
  .eq('id', bookId)
  .single();
```

### Step 3: Create Helper Functions

Create functions to format the raw database values into user-friendly text:

```typescript
// Format language value
const formatLanguage = (language: string | undefined): string => {
  if (!language) return '';

  const languageMap: Record<string, string> = {
    'english': 'English',
    'kannada': 'ಕನ್ನಡ', // or 'Kannada'
    'bilingual': 'Bilingual (English & Kannada)'
  };

  return languageMap[language] || language;
};

// Format binding type
const formatBinding = (binding: string | undefined): string => {
  if (!binding) return '';

  const bindingMap: Record<string, string> = {
    'hardbound': 'Hard Bound',
    'paperback': 'Paperback'
  };

  return bindingMap[binding] || binding;
};

// Get publisher based on user's language preference
const getPublisher = (
  book: Book,
  userLanguage: 'en' | 'kn'
): string | undefined => {
  if (userLanguage === 'kn' && book.publisher_kn) {
    return book.publisher_kn;
  }
  return book.publisher;
};
```

### Step 4: Create the BookDetails Component

**Option A: Simple List Style**

```tsx
import React from 'react';
import { BookOpen, Building2, Languages, BookMarked, Hash } from 'lucide-react';

interface BookDetailsProps {
  book: Book;
  userLanguage?: 'en' | 'kn';
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, userLanguage = 'en' }) => {
  const formatLanguage = (lang: string): string => {
    const map: Record<string, string> = {
      'english': 'English',
      'kannada': 'ಕನ್ನಡ',
      'bilingual': 'Bilingual'
    };
    return map[lang] || lang;
  };

  const formatBinding = (binding: string): string => {
    const map: Record<string, string> = {
      'hardbound': 'Hard Bind',
      'paperback': 'Paperback'
    };
    return map[binding] || binding;
  };

  const publisher = userLanguage === 'kn' && book.publisher_kn
    ? book.publisher_kn
    : book.publisher;

  // Don't show section if no metadata exists
  const hasMetadata = book.isbn || publisher || book.pages ||
                     book.language || book.binding;

  if (!hasMetadata) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Book Details
      </h3>

      <div className="space-y-3">
        {book.isbn && (
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">ISBN: </span>
              <span className="text-gray-900 font-medium">{book.isbn}</span>
            </div>
          </div>
        )}

        {publisher && (
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Publisher: </span>
              <span className="text-gray-900 font-medium">{publisher}</span>
            </div>
          </div>
        )}

        {book.pages && (
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Pages: </span>
              <span className="text-gray-900 font-medium">{book.pages}</span>
            </div>
          </div>
        )}

        {book.language && (
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Language: </span>
              <span className="text-gray-900 font-medium">
                {formatLanguage(book.language)}
              </span>
            </div>
          </div>
        )}

        {book.binding && (
          <div className="flex items-center gap-3">
            <BookMarked className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-sm text-gray-500">Binding: </span>
              <span className="text-gray-900 font-medium">
                {formatBinding(book.binding)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
```

**Option B: Grid Style (Better for Desktop)**

```tsx
const BookDetails: React.FC<BookDetailsProps> = ({ book, userLanguage = 'en' }) => {
  const formatLanguage = (lang: string): string => {
    const map: Record<string, string> = {
      'english': 'English',
      'kannada': 'ಕನ್ನಡ',
      'bilingual': 'Bilingual'
    };
    return map[lang] || lang;
  };

  const formatBinding = (binding: string): string => {
    const map: Record<string, string> = {
      'hardbound': 'Hard Bind',
      'paperback': 'Paperback'
    };
    return map[binding] || binding;
  };

  const publisher = userLanguage === 'kn' && book.publisher_kn
    ? book.publisher_kn
    : book.publisher;

  const hasMetadata = book.isbn || publisher || book.pages ||
                     book.language || book.binding;

  if (!hasMetadata) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Specifications
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {book.isbn && (
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              ISBN
            </div>
            <div className="text-gray-900 font-medium">
              {book.isbn}
            </div>
          </div>
        )}

        {publisher && (
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Publisher
            </div>
            <div className="text-gray-900 font-medium">
              {publisher}
            </div>
          </div>
        )}

        {book.pages && (
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Pages
            </div>
            <div className="text-gray-900 font-medium">
              {book.pages}
            </div>
          </div>
        )}

        {book.language && (
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Language
            </div>
            <div className="text-gray-900 font-medium">
              {formatLanguage(book.language)}
            </div>
          </div>
        )}

        {book.binding && (
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Binding
            </div>
            <div className="text-gray-900 font-medium">
              {formatBinding(book.binding)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
```

**Option C: Table Style (Clean and Minimal)**

```tsx
const BookDetails: React.FC<BookDetailsProps> = ({ book, userLanguage = 'en' }) => {
  const formatLanguage = (lang: string): string => {
    const map: Record<string, string> = {
      'english': 'English',
      'kannada': 'ಕನ್ನಡ',
      'bilingual': 'Bilingual'
    };
    return map[lang] || lang;
  };

  const formatBinding = (binding: string): string => {
    const map: Record<string, string> = {
      'hardbound': 'Hard Bind',
      'paperback': 'Paperback'
    };
    return map[binding] || binding;
  };

  const publisher = userLanguage === 'kn' && book.publisher_kn
    ? book.publisher_kn
    : book.publisher;

  const details = [
    { label: 'ISBN', value: book.isbn },
    { label: 'Publisher', value: publisher },
    { label: 'Pages', value: book.pages },
    { label: 'Language', value: book.language ? formatLanguage(book.language) : undefined },
    { label: 'Binding', value: book.binding ? formatBinding(book.binding) : undefined },
  ].filter(item => item.value); // Only keep items with values

  if (details.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Book Details
      </h3>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {details.map((detail, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3">
                  {detail.label}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {detail.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookDetails;
```

### Step 5: Add Component to Product Detail Page

In your existing product detail page component, add the BookDetails component:

```tsx
import BookDetails from './components/BookDetails'; // Adjust path as needed

const ProductDetailPage = () => {
  const [book, setBook] = useState<Book | null>(null);

  // ... your existing fetch logic

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing product info: images, title, price, etc. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Product images */}
        <div>
          {/* Your image gallery */}
        </div>

        {/* Right: Product info */}
        <div>
          <h1>{book?.title_en}</h1>
          <p className="text-gray-600">{book?.author}</p>
          <div className="text-2xl font-bold">₹{book?.selling_price}</div>

          {/* Add to cart button, etc. */}
        </div>
      </div>

      {/* Product description */}
      <div className="mt-8">
        <h2>Description</h2>
        <p>{book?.description}</p>
      </div>

      {/* ✨ ADD THIS: Book Details Section ✨ */}
      {book && <BookDetails book={book} userLanguage="en" />}

      {/* Reviews, related products, etc. */}
    </div>
  );
};
```

---

## Mobile Responsive Design

Make sure your component looks good on mobile:

```tsx
// Mobile-optimized version
<div className="bg-white rounded-lg shadow-sm p-4 mt-6">
  <h3 className="text-base font-semibold text-gray-900 mb-3">
    Book Details
  </h3>

  <div className="space-y-2 text-sm">
    {book.isbn && (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">ISBN</span>
        <span className="font-medium text-gray-900 text-right">{book.isbn}</span>
      </div>
    )}

    {publisher && (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Publisher</span>
        <span className="font-medium text-gray-900 text-right">{publisher}</span>
      </div>
    )}

    {/* Continue for other fields */}
  </div>
</div>
```

---

## Icons (Optional but Recommended)

If you're using Lucide React (like in your admin panel):

```bash
npm install lucide-react
```

Icons to use:
- **ISBN**: `Hash` or `Barcode`
- **Publisher**: `Building2` or `Building`
- **Pages**: `BookOpen` or `FileText`
- **Language**: `Languages` or `Globe`
- **Binding**: `BookMarked` or `Book`

```tsx
import { BookOpen, Building2, Languages, BookMarked, Hash } from 'lucide-react';
```

---

## Styling with Tailwind CSS

Here are ready-to-use Tailwind classes:

```tsx
// Card container
className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-200"

// Section heading
className="text-lg font-semibold text-gray-900 mb-4"

// Detail row
className="flex items-center gap-3 py-2"

// Icon
className="h-5 w-5 text-gray-500"

// Label
className="text-sm text-gray-600"

// Value
className="text-base font-medium text-gray-900"
```

---

## Testing Checklist

After implementation, test these scenarios:

- [ ] Book WITH all metadata displays all fields correctly
- [ ] Book WITH some metadata displays only available fields
- [ ] Book WITH NO metadata doesn't show the section at all
- [ ] ISBN displays correctly
- [ ] Publisher name displays correctly
- [ ] Kannada publisher displays when language is Kannada
- [ ] Page count displays as number
- [ ] Language shows as "English", "Kannada", or "Bilingual" (not raw values)
- [ ] Binding shows as "Hard Bound" or "Paperback" (not raw values)
- [ ] Mobile responsive (looks good on small screens)
- [ ] Desktop layout (looks good on large screens)
- [ ] Icons (if used) are visible and aligned
- [ ] No console errors
- [ ] No layout breaks with long text (e.g., long publisher names)

---

## Example: Complete Working Component (Copy-Paste Ready)

```tsx
import React from 'react';
import { BookOpen, Building2, Languages, BookMarked, Hash } from 'lucide-react';

interface Book {
  id: string;
  title_en: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publisher_kn?: string;
  pages?: number;
  language?: string;
  binding?: string;
  selling_price: number;
  [key: string]: any;
}

interface BookDetailsProps {
  book: Book;
  userLanguage?: 'en' | 'kn';
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, userLanguage = 'en' }) => {
  // Format language for display
  const formatLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'english': 'English',
      'kannada': 'ಕನ್ನಡ',
      'bilingual': 'Bilingual (English & Kannada)'
    };
    return languageMap[lang.toLowerCase()] || lang;
  };

  // Format binding type for display
  const formatBinding = (binding: string): string => {
    const bindingMap: Record<string, string> = {
      'hardbound': 'Hard Bound',
      'paperback': 'Paperback'
    };
    return bindingMap[binding.toLowerCase()] || binding;
  };

  // Get publisher based on language preference
  const publisher = userLanguage === 'kn' && book.publisher_kn
    ? book.publisher_kn
    : book.publisher;

  // Check if we have any metadata to display
  const hasMetadata = book.isbn || publisher || book.pages ||
                     book.language || book.binding;

  // Don't render if no metadata
  if (!hasMetadata) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Book Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {book.isbn && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Hash className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                ISBN
              </div>
              <div className="text-gray-900 font-medium break-all">
                {book.isbn}
              </div>
            </div>
          </div>
        )}

        {publisher && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Building2 className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Publisher
              </div>
              <div className="text-gray-900 font-medium break-words">
                {publisher}
              </div>
            </div>
          </div>
        )}

        {book.pages && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Pages
              </div>
              <div className="text-gray-900 font-medium">
                {book.pages}
              </div>
            </div>
          </div>
        )}

        {book.language && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Languages className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Language
              </div>
              <div className="text-gray-900 font-medium">
                {formatLanguage(book.language)}
              </div>
            </div>
          </div>
        )}

        {book.binding && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <BookMarked className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Binding
              </div>
              <div className="text-gray-900 font-medium">
                {formatBinding(book.binding)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
```

---

## Usage in Your Page

```tsx
import BookDetails from '@/components/BookDetails';

// In your product detail page component
<div>
  {/* Product images, title, price, etc. */}

  {/* Description section */}

  {/* Book Details - ADD THIS */}
  {book && <BookDetails book={book} userLanguage="en" />}

  {/* Reviews, related products, etc. */}
</div>
```

---

## Quick Start Summary

1. **Update Book interface** - Add isbn, publisher, publisher_kn, pages, language, binding fields
2. **Copy the BookDetails component** - Use Option A, B, C, or the complete example above
3. **Add component to product page** - Place it after description or where appropriate
4. **Test with real data** - Make sure it handles missing data gracefully
5. **Style as needed** - Adjust colors, spacing to match your design

---

## Need Help?

- All database fields are already set up ✅
- Admin panel is working and can add this data ✅
- Just need to display it on the frontend ✅

Choose one of the component options above, copy it to your user app, and you're done!

---

## Preview

**With full data:**
```
┌─────────────────────────────────────────────┐
│  BOOK DETAILS                               │
├─────────────────────────────────────────────┤
│  📚 ISBN                                    │
│     978-0-06-112241-5                       │
│                                             │
│  🏢 Publisher                               │
│     Penguin Random House                    │
│                                             │
│  📖 Pages                                   │
│     324                                     │
│                                             │
│  🌐 Language                                │
│     English                                 │
│                                             │
│  📕 Binding                                 │
│     Paperback                               │
└─────────────────────────────────────────────┘
```

**With partial data (some fields missing):**
```
┌─────────────────────────────────────────────┐
│  BOOK DETAILS                               │
├─────────────────────────────────────────────┤
│  🏢 Publisher                               │
│     HarperCollins India                     │
│                                             │
│  📖 Pages                                   │
│     256                                     │
│                                             │
│  🌐 Language                                │
│     ಕನ್ನಡ                                   │
└─────────────────────────────────────────────┘
```

That's it! Copy the code and implement it in your user-facing application. 🚀
