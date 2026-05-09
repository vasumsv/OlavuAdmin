/*
  # Add Dummy Categories Data

  1. New Categories
    - Creates sample book categories in both English and Kannada
    - Includes main categories like Fiction, Non-Fiction, Children's Books, etc.
    - Each category has proper slugs, descriptions, and is set as active
    - Categories are ordered by sort_order for proper display

  2. Category Details
    - All categories are active and ready for use
    - Includes both English and Kannada names and descriptions
    - Proper slug generation for URL-friendly names
    - Sequential sort ordering for consistent display
*/

-- Log start of category data insertion
DO $$ BEGIN
  RAISE NOTICE 'Starting insertion of dummy categories data...';
END $$;

-- Insert dummy categories
INSERT INTO categories (
  name_en, 
  name_kn, 
  slug, 
  description, 
  description_kn,
  is_active, 
  sort_order,
  book_count
) VALUES 
-- Fiction Categories
('Fiction', 'ಕಾದಂಬರಿ', 'fiction', 
 'Novels, short stories, and fictional literature', 
 'ಕಾದಂಬರಿಗಳು, ಸಣ್ಣ ಕಥೆಗಳು ಮತ್ತು ಕಾಲ್ಪನಿಕ ಸಾಹಿತ್ಯ', 
 true, 1, 0),

('Romance', 'ಪ್ರೇಮ ಕಥೆಗಳು', 'romance', 
 'Love stories and romantic novels', 
 'ಪ್ರೇಮ ಕಥೆಗಳು ಮತ್ತು ರೋಮ್ಯಾಂಟಿಕ್ ಕಾದಂಬರಿಗಳು', 
 true, 2, 0),

('Mystery & Thriller', 'ರಹಸ್ಯ ಮತ್ತು ಥ್ರಿಲ್ಲರ್', 'mystery-thriller', 
 'Mystery novels, detective stories, and thrillers', 
 'ರಹಸ್ಯ ಕಾದಂಬರಿಗಳು, ಪತ್ತೇದಾರಿ ಕಥೆಗಳು ಮತ್ತು ಥ್ರಿಲ್ಲರ್‌ಗಳು', 
 true, 3, 0),

('Science Fiction', 'ವಿಜ್ಞಾನ ಕಾಲ್ಪನಿಕ', 'science-fiction', 
 'Futuristic and scientific fiction stories', 
 'ಭವಿಷ್ಯದ ಮತ್ತು ವೈಜ್ಞಾನಿಕ ಕಾಲ್ಪನಿಕ ಕಥೆಗಳು', 
 true, 4, 0),

-- Non-Fiction Categories
('Biography & Autobiography', 'ಜೀವನ ಚರಿತ್ರೆ', 'biography-autobiography', 
 'Life stories of famous personalities and autobiographies', 
 'ಪ್ರಸಿದ್ಧ ವ್ಯಕ್ತಿಗಳ ಜೀವನ ಕಥೆಗಳು ಮತ್ತು ಆತ್ಮಚರಿತ್ರೆಗಳು', 
 true, 5, 0),

('History', 'ಇತಿಹಾಸ', 'history', 
 'Historical books and accounts of past events', 
 'ಐತಿಹಾಸಿಕ ಪುಸ್ತಕಗಳು ಮತ್ತು ಹಿಂದಿನ ಘಟನೆಗಳ ವಿವರಣೆಗಳು', 
 true, 6, 0),

('Philosophy', 'ತತ್ವಶಾಸ್ತ್ರ', 'philosophy', 
 'Philosophical thoughts and spiritual wisdom', 
 'ತಾತ್ವಿಕ ಚಿಂತನೆಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ', 
 true, 7, 0),

('Self Help', 'ಸ್ವಯಂ ಸಹಾಯ', 'self-help', 
 'Personal development and motivational books', 
 'ವ್ಯಕ್ತಿತ್ವ ಅಭಿವೃದ್ಧಿ ಮತ್ತು ಪ್ರೇರಣಾದಾಯಕ ಪುಸ್ತಕಗಳು', 
 true, 8, 0),

-- Educational Categories
('Academic & Textbooks', 'ಶೈಕ್ಷಣಿಕ ಪಠ್ಯ ಪುಸ್ತಕಗಳು', 'academic-textbooks', 
 'Educational textbooks and academic references', 
 'ಶೈಕ್ಷಣಿಕ ಪಠ್ಯ ಪುಸ್ತಕಗಳು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಉಲ್ಲೇಖಗಳು', 
 true, 9, 0),

('Language Learning', 'ಭಾಷಾ ಕಲಿಕೆ', 'language-learning', 
 'Books for learning different languages', 
 'ವಿವಿಧ ಭಾಷೆಗಳನ್ನು ಕಲಿಯಲು ಪುಸ್ತಕಗಳು', 
 true, 10, 0),

-- Children's Categories
('Children''s Books', 'ಮಕ್ಕಳ ಪುಸ್ತಕಗಳು', 'childrens-books', 
 'Books specially designed for children of all ages', 
 'ಎಲ್ಲಾ ವಯಸ್ಸಿನ ಮಕ್ಕಳಿಗಾಗಿ ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಿದ ಪುಸ್ತಕಗಳು', 
 true, 11, 0),

('Picture Books', 'ಚಿತ್ರ ಪುಸ್ತಕಗಳು', 'picture-books', 
 'Illustrated books for young children', 
 'ಚಿಕ್ಕ ಮಕ್ಕಳಿಗಾಗಿ ಚಿತ್ರಿತ ಪುಸ್ತಕಗಳು', 
 true, 12, 0),

-- Poetry & Literature
('Poetry', 'ಕಾವ್ಯ', 'poetry', 
 'Collections of poems and poetic works', 
 'ಕವಿತೆಗಳ ಸಂಗ್ರಹಗಳು ಮತ್ತು ಕಾವ್ಯ ಕೃತಿಗಳು', 
 true, 13, 0),

('Classic Literature', 'ಶಾಸ್ತ್ರೀಯ ಸಾಹಿತ್ಯ', 'classic-literature', 
 'Timeless literary classics and masterpieces', 
 'ಕಾಲಾತೀತ ಸಾಹಿತ್ಯಿಕ ಶ್ರೇಷ್ಠ ಕೃತಿಗಳು ಮತ್ತು ಮಾಸ್ಟರ್‌ಪೀಸ್‌ಗಳು', 
 true, 14, 0),

-- Regional & Cultural
('Kannada Literature', 'ಕನ್ನಡ ಸಾಹಿತ್ಯ', 'kannada-literature', 
 'Literature written in Kannada language', 
 'ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಬರೆಯಲಾದ ಸಾಹಿತ್ಯ', 
 true, 15, 0),

('Regional Authors', 'ಪ್ರಾದೇಶಿಕ ಲೇಖಕರು', 'regional-authors', 
 'Books by local and regional authors', 
 'ಸ್ಥಳೀಯ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಲೇಖಕರ ಪುಸ್ತಕಗಳು', 
 true, 16, 0),

-- Spiritual & Religious
('Spiritual & Religious', 'ಆಧ್ಯಾತ್ಮಿಕ ಮತ್ತು ಧಾರ್ಮಿಕ', 'spiritual-religious', 
 'Books on spirituality, religion, and faith', 
 'ಆಧ್ಯಾತ್ಮಿಕತೆ, ಧರ್ಮ ಮತ್ತು ನಂಬಿಕೆಯ ಮೇಲಿನ ಪುಸ್ತಕಗಳು', 
 true, 17, 0),

-- Health & Lifestyle
('Health & Wellness', 'ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮ', 'health-wellness', 
 'Books on health, fitness, and wellness', 
 'ಆರೋಗ್ಯ, ಫಿಟ್‌ನೆಸ್ ಮತ್ತು ಯೋಗಕ್ಷೇಮದ ಮೇಲಿನ ಪುಸ್ತಕಗಳು', 
 true, 18, 0),

('Cooking & Food', 'ಅಡುಗೆ ಮತ್ತು ಆಹಾರ', 'cooking-food', 
 'Recipe books and culinary guides', 
 'ಪಾಕವಿಧಾನ ಪುಸ್ತಕಗಳು ಮತ್ತು ಪಾಕಶಾಸ್ತ್ರ ಮಾರ್ಗದರ್ಶಿಗಳು', 
 true, 19, 0),

-- Business & Economics
('Business & Economics', 'ವ್ಯಾಪಾರ ಮತ್ತು ಅರ್ಥಶಾಸ್ತ್ರ', 'business-economics', 
 'Books on business, finance, and economics', 
 'ವ್ಯಾಪಾರ, ಹಣಕಾಸು ಮತ್ತು ಅರ್ಥಶಾಸ್ತ್ರದ ಮೇಲಿನ ಪುಸ್ತಕಗಳು', 
 true, 20, 0);

-- Log completion
DO $$ BEGIN
  RAISE NOTICE 'Successfully inserted 20 dummy categories';
  RAISE NOTICE 'Categories include: Fiction, Non-Fiction, Educational, Children''s Books, Poetry, Regional Literature, and more';
  RAISE NOTICE 'All categories are active and ready for use';
END $$;