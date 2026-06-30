import { useState, useEffect, useRef } from 'react';
import { C, panelStyle } from "../constants";
import { LibraryStorage, SyncManager } from '../utils/libraryService';

const highlightColorMap = {
  yellow: '#fbbf24',
  green: '#00d97e',
  blue: '#3b82f6',
  red: '#ef4444'
};

/**
 * Enhanced Book Reader with highlights, notes, and bookmarks
 */
function BookReader({ book, page, userId, onPageChange, onClose }) {
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showNotePanel, setShowNotePanel] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [highlightColor, setHighlightColor] = useState('yellow');
  const [readingProgress, setReadingProgress] = useState(0);
  const pageRef = useRef(null);

  // Load annotations from localStorage on mount
  useEffect(() => {
    loadAnnotations();
  }, [book.id]);

  // Calculate reading progress
  useEffect(() => {
    const progress = ((page + 1) / book.chapters.length) * 100;
    setReadingProgress(progress);
  }, [page, book.chapters.length]);

  // ============================================
  // STORAGE HANDLERS
  // ============================================

  const loadAnnotations = () => {
    try {
      const stored = localStorage.getItem(`library_${book.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setHighlights(data.highlights || []);
        setNotes(data.notes || []);
        setBookmarks(data.bookmarks || []);
      }
    } catch (e) {
      console.error('Failed to load annotations:', e);
    }
  };

  const saveAnnotations = (newHighlights, newNotes, newBookmarks) => {
    try {
      const data = {
        bookId: book.id,
        highlights: newHighlights,
        notes: newNotes,
        bookmarks: newBookmarks,
        lastUpdated: Date.now(),
        readingProgress: {
          currentChapter: page,
          percentComplete: readingProgress
        }
      };
      localStorage.setItem(`library_${book.id}`, JSON.stringify(data));
      
      // TODO: Sync with API
      // syncToServer(data);
    } catch (e) {
      console.error('Failed to save annotations:', e);
    }
  };

  // ============================================
  // HIGHLIGHT HANDLERS
  // ============================================

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection.toString().length) return;

    const selectedText = selection.toString();
    const newHighlight = {
      id: `hl-${Date.now()}`,
      chapterIndex: page,
      contentIndex: 0,
      text: selectedText,
      color: highlightColor,
      timestamp: Date.now()
    };

    const newHighlights = [...highlights, newHighlight];
    setHighlights(newHighlights);
    saveAnnotations(newHighlights, notes, bookmarks);
    window.getSelection().removeAllRanges();
  };

  const removeHighlight = (id) => {
    const newHighlights = highlights.filter(h => h.id !== id);
    setHighlights(newHighlights);
    saveAnnotations(newHighlights, notes, bookmarks);
  };

  const getPageHighlights = () => {
    return highlights.filter(h => h.chapterIndex === page);
  };

  // ============================================
  // NOTE HANDLERS
  // ============================================

  const addNote = () => {
    if (!noteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      chapterIndex: page,
      contentIndex: 0,
      text: noteText,
      timestamp: Date.now()
    };

    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    saveAnnotations(highlights, newNotes, bookmarks);
    setNoteText('');
    setShowNotePanel(null);
  };

  const removeNote = (id) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    saveAnnotations(highlights, newNotes, bookmarks);
  };

  const getPageNotes = () => {
    return notes.filter(n => n.chapterIndex === page);
  };

  // ============================================
  // BOOKMARK HANDLERS
  // ============================================

  const toggleBookmark = () => {
    const isBookmarked = bookmarks.some(b => b.chapterIndex === page);
    let newBookmarks;

    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.chapterIndex !== page);
    } else {
      newBookmarks = [...bookmarks, { chapterIndex: page, timestamp: Date.now() }];
    }

    setBookmarks(newBookmarks);
    saveAnnotations(highlights, notes, newBookmarks);
  };

  const isBookmarked = bookmarks.some(b => b.chapterIndex === page);

  return (
    <div ref={pageRef} onMouseUp={handleTextSelection}>
      {/* Breadcrumb nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-ghost" onClick={onClose}>Back to Library</button>
          <span style={{ color: C.textMuted, fontSize: 13 }}>/</span>
          <span style={{ color: C.textSub, fontSize: 13 }}>{book.title}</span>
        </div>
        <button
          className={isBookmarked ? "btn-green" : "btn-ghost"}
          onClick={toggleBookmark}
          style={{
            background: isBookmarked ? book.accent : "transparent",
            color: isBookmarked ? "white" : C.textSub,
            padding: "6px 12px",
            fontSize: 12
          }}
        >
          {isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, alignItems: "start" }}>
        {/* LEFT: Chapter Sidebar */}
        <div style={{ ...panelStyle, padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
          <div
            style={{
              fontSize: 12, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.08em", color: C.textMuted, marginBottom: 16,
            }}
          >
            Contents
          </div>
          {book.chapters.map((ch, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: page === i ? `${book.accent}15` : "none",
                border: "none",
                borderLeft: `2px solid ${page === i ? book.accent : "transparent"}`,
                padding: "10px 12px", cursor: "pointer",
                fontSize: 13, color: page === i ? book.accent : C.textSub,
                fontWeight: page === i ? 600 : 400,
                marginBottom: 2, borderRadius: "0 6px 6px 0", transition: "all 0.12s",
              }}
            >
              <span style={{ fontSize: 10, color: C.textMuted, marginRight: 8, fontFamily: "monospace" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {ch.title}
              {bookmarks.some(b => b.chapterIndex === i) && (
                <span style={{ marginLeft: 8, fontSize: 10, color: book.accent }}>★</span>
              )}
            </button>
          ))}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 7 }}>Progress</div>
            <div style={{ background: "#161616", borderRadius: 20, height: 4, overflow: "hidden" }}>
              <div
                style={{
                  background: book.accent, height: "100%",
                  width: `${readingProgress}%`,
                  borderRadius: 20, transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 5 }}>
              {Math.round(readingProgress)}% complete
            </div>
          </div>
        </div>

        {/* CENTER: Two-page spread */}
        <div
          style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            borderRadius: 12, overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            minHeight: 540, border: `1px solid ${C.border2}`,
          }}
        >
          {/* Left page */}
          <div
            style={{
              background: "#f9f5ec", padding: "44px 36px 44px 44px",
              borderRight: "2px solid #e8dfc8", minHeight: 540, position: "relative",
              userSelect: "text",
            }}
          >
            <div style={{ fontSize: 10, color: "#aaa09a", textTransform: "uppercase", letterSpacing: "3px", marginBottom: 36, fontFamily: "Georgia,serif" }}>
              {book.author}
            </div>
            <div style={{ fontSize: 10, color: "#bbb5ad", marginBottom: 20, fontFamily: "Georgia,serif" }}>
              Chapter {page + 1}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 26, lineHeight: 1.35, fontFamily: "Georgia,serif", color: "#1a1814", letterSpacing: "-0.3px" }}>
              {book.chapters[page].title}
            </h2>
            {book.chapters[page].content.map((item, idx) => (
              <div key={item.id}>
                {item.type === 'paragraph' && (
                  <p style={{ fontSize: 15, lineHeight: 1.9, color: "#2e2a24", fontFamily: "Georgia,serif", margin: idx > 0 ? '20px 0 0' : '0', position: 'relative' }}>
                    {item.text}
                  </p>
                )}
                {item.type === 'quote' && (
                  <blockquote
                    style={{
                      borderLeft: `3px solid ${book.accent}aa`,
                      paddingLeft: 18, margin: "24px 0",
                      fontStyle: "italic", color: "#6b6359",
                      fontSize: 15, fontFamily: "Georgia,serif", lineHeight: 1.7,
                    }}
                  >
                    {item.text}
                  </blockquote>
                )}
              </div>
            ))}
            <div style={{ position: "absolute", bottom: 32, left: 44, fontSize: 11, color: "#c0b8ae", fontFamily: "Georgia,serif" }}>
              {page * 78 + 24}
            </div>
          </div>

          {/* Right page */}
          <div style={{ background: "#f7f3e8", padding: "44px 44px 44px 36px", minHeight: 540, position: "relative", userSelect: "text" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#4a4238", marginBottom: 16 }}>
              Your Highlights on this page
            </div>
            {getPageHighlights().length === 0 ? (
              <p style={{ fontSize: 13, color: "#9a8f84", fontStyle: "italic" }}>
                Select text to highlight key passages
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {getPageHighlights().map(hl => (
                  <div
                    key={hl.id}
                    style={{
                      background: `${highlightColorMap[hl.color]}20`,
                      border: `1px solid ${highlightColorMap[hl.color]}44`,
                      borderLeft: `3px solid ${highlightColorMap[hl.color]}`,
                      padding: 12,
                      borderRadius: 6,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#2e2a24",
                      fontFamily: "Georgia,serif",
                      position: "relative"
                    }}
                  >
                    "{hl.text}"
                    <button
                      onClick={() => removeHighlight(hl.id)}
                      style={{
                        position: "absolute", top: 6, right: 6,
                        background: "none", border: "none", color: "#aaa",
                        cursor: "pointer", fontSize: 14
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: `1px solid #e8dfc8`, paddingTop: 16, marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#4a4238", marginBottom: 12 }}>
                Highlight color
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {['yellow', 'green', 'blue', 'red'].map(color => (
                  <button
                    key={color}
                    onClick={() => setHighlightColor(color)}
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: highlightColorMap[color],
                      border: highlightColor === color ? `2px solid #1a1814` : "2px solid transparent",
                      cursor: "pointer",
                      opacity: 0.7
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ position: "absolute", bottom: 32, right: 44, fontSize: 11, color: "#c0b8ae", fontFamily: "Georgia,serif" }}>
              {page * 78 + 25}
            </div>
          </div>
        </div>

        {/* RIGHT: Notes sidebar */}
        <div style={{ ...panelStyle, padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, marginBottom: 16 }}>
            Notes ({getPageNotes().length})
          </div>

          {getPageNotes().length === 0 ? (
            <p style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", marginBottom: 16 }}>
              No notes on this chapter yet
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {getPageNotes().map(note => (
                <div
                  key={note.id}
                  style={{
                    background: `${book.accent}10`,
                    border: `1px solid ${book.accent}33`,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: C.textSub,
                    position: "relative"
                  }}
                >
                  <div style={{ paddingRight: 24 }}>{note.text}</div>
                  <button
                    onClick={() => removeNote(note.id)}
                    style={{
                      position: "absolute", top: 8, right: 8,
                      background: "none", border: "none", color: C.textMuted,
                      cursor: "pointer", fontSize: 14,
                      opacity: 0.6
                    }}
                  >
                    ×
                  </button>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 6, opacity: 0.7 }}>
                    {new Date(note.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-green"
            onClick={() => setShowNotePanel(!showNotePanel)}
            style={{
              width: "100%", background: book.accent, color: "white",
              padding: "8px 12px", fontSize: 12, fontWeight: 600,
              border: "none", borderRadius: 6, cursor: "pointer", marginBottom: 12
            }}
          >
            {showNotePanel ? "Cancel" : "+ Add Note"}
          </button>

          {showNotePanel && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your thoughts..."
                style={{
                  width: "100%", minHeight: 80, padding: 10, borderRadius: 6,
                  border: `1px solid ${C.border}`, background: "#0f0f0f",
                  color: C.text, fontFamily: "inherit", fontSize: 12,
                  resize: "none"
                }}
              />
              <button
                onClick={addNote}
                style={{
                  background: book.accent, color: "white",
                  padding: "6px 12px", fontSize: 12, fontWeight: 600,
                  border: "none", borderRadius: 6, cursor: "pointer"
                }}
              >
                Save Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24 }}>
        <button
          className="btn-ghost"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          style={{ opacity: page === 0 ? 0.4 : 1 }}
        >
          ← Previous chapter
        </button>
        <span style={{ fontSize: 13, color: C.textMuted }}>
          {page + 1} / {book.chapters.length}
        </span>
        <button
          className="btn-green"
          style={{ background: book.accent, opacity: page === book.chapters.length - 1 ? 0.4 : 1 }}
          onClick={() => onPageChange(Math.min(book.chapters.length - 1, page + 1))}
          disabled={page === book.chapters.length - 1}
        >
          Next chapter →
        </button>
      </div>
    </div>
  );
}

export default BookReader;