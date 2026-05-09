import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  disabled?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  maxTags = 5,
  placeholder = 'Type and press Enter to add tags',
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      setError('Tag cannot be empty');
      return;
    }

    if (tags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    if (tags.includes(trimmedValue)) {
      setError('Tag already exists');
      return;
    }

    onChange([...tags, trimmedValue]);
    setInputValue('');
    setError('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
    setError('');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {!disabled && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={tags.length >= maxTags}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags reached` : placeholder}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={tags.length >= maxTags || !inputValue.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}

          <p className="text-xs text-gray-500 mt-1">
            {tags.length} / {maxTags} tags used
          </p>
        </>
      )}
    </div>
  );
};

export default TagInput;
