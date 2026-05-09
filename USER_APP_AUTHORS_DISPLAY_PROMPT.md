# PROMPT: Display Authors Section in User Application

## Goal
Fetch the list of authors from the Supabase database and display them in the **exact same order** as configured by the admin in the Authors management panel. The admin sets the display order by typing a position number (1, 2, 3...) directly into each author row, which saves a `display_order` value (0-indexed) per author to the database. The user app must always reflect this saved order.

---

## Database Table: `authors`

**Table name**: `authors`
**Supabase schema**: `public`

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `name_en` | text | Author name in English |
| `name_kn` | text (nullable) | Author name in Kannada |
| `bio_en` | text (nullable) | Biography in English |
| `bio_kn` | text (nullable) | Biography in Kannada |
| `profile_image` | text (nullable) | URL of author's profile photo |
| `display_order` | integer | Sort order set by admin (0 = first, 1 = second, etc.) |
| `is_active` | boolean | Only show authors where `is_active = true` |

> The admin sets `display_order` by typing a position number (1-based) in the admin panel. It is stored as 0-indexed in the database. Always sort by this field ascending — it is the single source of truth for display order.

---

## How to Fetch Authors (Correct Order)

Always query authors with:
1. Filter: `is_active = true` (only show active authors)
2. Sort: `display_order ASC` (0 = shown first)

### Supabase JS Query

```typescript
const { data: authors, error } = await supabase
  .from('authors')
  .select('id, name_en, name_kn, bio_en, bio_kn, profile_image, display_order')
  .eq('is_active', true)
  .order('display_order', { ascending: true });
```

> **Important**: Never sort by `name_en`, `created_at`, or any other field. Always use `display_order ASC` so the user sees exactly what the admin configured.

---

## Authentication

No authentication is required to read authors. The `authors` table has a public SELECT RLS policy for all rows where `is_active = true`. Use the anon key:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,   // or import.meta.env.VITE_SUPABASE_URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  // or import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Display Logic

### Language Handling
- If the user has selected **Kannada** as their language preference:
  - Show `name_kn` (fall back to `name_en` if `name_kn` is null/empty)
  - Show `bio_kn` (fall back to `bio_en` if `bio_kn` is null/empty)
- If the user has selected **English** (or no preference):
  - Show `name_en`
  - Show `bio_en`

### Profile Image
- If `profile_image` is not null, display it as a circular avatar
- If `profile_image` is null, display a placeholder showing the author's first initial or a generic person icon

### Bio Text
- If bio is available, display it truncated to 2–3 lines with a "Read more" option on detail view
- If bio is null, simply don't show the bio section

---

## UI Placement Options

### Option A: Authors Section on Homepage
A horizontal scrollable row or grid section titled "Our Featured Authors" or "ನಮ್ಮ ಲೇಖಕರು". Shows all active authors in `display_order` sequence.

### Option B: Authors Listing Page (`/authors`)
A full page grid layout showing all active authors with photo, name, bio preview, and a link to filter books by that author.

### Option C: Author Name on Book Cards / Detail Pages
On each book card and the book detail page, show the author's profile image + name as a clickable link that navigates to a filtered view of all books by that author.

---

## Recommended Component Structure

```
AuthorsSection/
  AuthorsSection.tsx      ← Main section wrapper, fetches data
  AuthorCard.tsx          ← Single author card (image, name, bio)
```

### AuthorsSection.tsx

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AuthorCard from './AuthorCard';

interface Author {
  id: string;
  name_en: string;
  name_kn: string | null;
  bio_en: string | null;
  bio_kn: string | null;
  profile_image: string | null;
  display_order: number;
}

export default function AuthorsSection({ language = 'en' }: { language?: 'en' | 'kn' }) {
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      const { data } = await supabase
        .from('authors')
        .select('id, name_en, name_kn, bio_en, bio_kn, profile_image, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      setAuthors(data || []);
    };
    fetchAuthors();
  }, []);

  return (
    <section>
      <h2>{language === 'kn' ? 'ನಮ್ಮ ಲೇಖಕರು' : 'Our Authors'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {authors.map((author) => (
          <AuthorCard key={author.id} author={author} language={language} />
        ))}
      </div>
    </section>
  );
}
```

### AuthorCard.tsx

```tsx
interface Author {
  id: string;
  name_en: string;
  name_kn: string | null;
  bio_en: string | null;
  bio_kn: string | null;
  profile_image: string | null;
}

interface Props {
  author: Author;
  language?: 'en' | 'kn';
}

export default function AuthorCard({ author, language = 'en' }: Props) {
  const name = language === 'kn' ? (author.name_kn || author.name_en) : author.name_en;
  const bio = language === 'kn' ? (author.bio_kn || author.bio_en) : author.bio_en;

  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-3">
        {author.profile_image ? (
          <img src={author.profile_image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-900">{name}</h3>
      {bio && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{bio}</p>
      )}
    </div>
  );
}
```

---

## Key Rules

1. **Always use `display_order ASC`** — this is the exact order the admin configured by entering position numbers
2. **Always filter `is_active = true`** — inactive authors must not be shown to users
3. **Never hardcode author names or order** — always fetch from Supabase
4. **Respect language preference** — show Kannada fields (`name_kn`, `bio_kn`) when available and user prefers Kannada
5. **Handle nulls gracefully** — all fields except `name_en` and `display_order` can be null; always fall back to `_en` fields

---

## Summary

| What | Value |
|------|-------|
| Table | `public.authors` |
| Filter | `is_active = true` |
| Sort | `display_order ASC` (0 = first) |
| Auth needed | No (public SELECT policy, anon key is sufficient) |
| Language toggle | Use `name_kn` / `bio_kn` when language = Kannada, fall back to `_en` if null |
| Order source | Admin sets position numbers (1, 2, 3...) in the admin panel — stored as 0-indexed `display_order` |
