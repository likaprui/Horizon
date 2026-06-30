/**
 * HORIZON TRADING LIBRARY - Data Schema
 * Structures for books, user annotations, and reading progress
 */

// ============================================
// SAMPLE DATA
// ============================================

export const SAMPLE_BOOK = {
  id: 'book-001',
  title: 'Principles of Technical Analysis',
  author: 'Market Masters',
  tag: 'Technical Analysis',
  accent: '#00d97e',
  description: 'Master candlestick patterns, support & resistance, and trend analysis with real market examples.',
  pages: 420,
  chapters: [
    {
      id: 'ch-001',
      title: 'Foundations of Market Psychology',
      content: [
        {
          id: 'para-001',
          type: 'heading',
          text: 'Chapter 1: Foundations of Market Psychology'
        },
        {
          id: 'para-002',
          type: 'paragraph',
          text: 'The principles of market psychology form the bedrock of sound investment philosophy. Understanding these concepts deeply is what separates the amateur speculator from the seasoned market participant who survives multiple market cycles.'
        },
        {
          id: 'para-003',
          type: 'paragraph',
          text: 'Markets have a remarkable capacity to humble even the most confident participants. The history of speculation is littered with fortunes made and lost in equal measure, often by the same individuals at different points in their careers.'
        },
        {
          id: 'para-004',
          type: 'quote',
          text: 'Risk comes from not knowing what you are doing. The most important quality for an investor is temperament, not intellect.'
        },
        {
          id: 'para-005',
          type: 'paragraph',
          text: 'In practice, the application of these principles requires both discipline and patience. Markets can remain irrational longer than you can remain solvent — a lesson every trader must internalize before committing real capital.'
        }
      ]
    },
    {
      id: 'ch-002',
      title: 'Understanding Candlestick Patterns',
      content: [
        {
          id: 'para-006',
          type: 'heading',
          text: 'Chapter 2: Understanding Candlestick Patterns'
        },
        {
          id: 'para-007',
          type: 'paragraph',
          text: 'Candlestick charting represents one of the oldest and most effective methods of analyzing price action. Developed in Japan centuries ago, these visual representations provide traders with information-rich displays of market sentiment.'
        }
      ]
    }
  ]
};

// Validation helpers
export const validateBook = (book) => {
  return (
    book.id &&
    book.title &&
    book.author &&
    book.chapters &&
    Array.isArray(book.chapters)
  );
};

export const validateHighlight = (highlight) => {
  return (
    highlight.id &&
    typeof highlight.chapterIndex === 'number' &&
    highlight.text &&
    ['yellow', 'green', 'blue', 'red'].includes(highlight.color)
  );
};

export const validateNote = (note) => {
  return (
    note.id &&
    typeof note.chapterIndex === 'number' &&
    note.text
  );
};