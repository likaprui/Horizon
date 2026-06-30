/**
 * SAMPLE BOOK DATA - for testing and API responses
 * This shows the expected structure for book content
 */

export const sampleBooks = [
  {
    id: "book-principles-ta",
    title: "Principles of Technical Analysis",
    author: "Market Masters",
    tag: "Technical Analysis",
    accent: "#00d97e",
    description: "Master candlestick patterns, support & resistance, and trend analysis with real market examples.",
    pages: 420,
    difficulty: "intermediate",
    chapters: [
      {
        id: "ch-001",
        title: "Foundations of Market Psychology",
        content: [
          {
            id: "para-001",
            type: "heading",
            text: "Chapter 1: Foundations of Market Psychology"
          },
          {
            id: "para-002",
            type: "paragraph",
            text: "The principles of market psychology form the bedrock of sound investment philosophy. Understanding these concepts deeply is what separates the amateur speculator from the seasoned market participant who survives multiple market cycles. Markets are driven not merely by fundamentals, but by the collective psychology of participants making buy and sell decisions every second."
          },
          {
            id: "para-003",
            type: "paragraph",
            text: "Markets have a remarkable capacity to humble even the most confident participants. The history of speculation is littered with fortunes made and lost in equal measure, often by the same individuals at different points in their careers. What separates success from failure is not intelligence, but discipline and the ability to manage emotions under pressure."
          },
          {
            id: "para-004",
            type: "quote",
            text: "Risk comes from not knowing what you are doing. The most important quality for an investor is temperament, not intellect."
          },
          {
            id: "para-005",
            type: "paragraph",
            text: "In practice, the application of these principles requires both discipline and patience. Markets can remain irrational longer than you can remain solvent — a lesson every trader must internalize before committing real capital. This is why proper risk management and position sizing are not optional extras, but essential survival tools."
          }
        ]
      },
      {
        id: "ch-002",
        title: "Understanding Candlestick Patterns",
        content: [
          {
            id: "para-006",
            type: "heading",
            text: "Chapter 2: Understanding Candlestick Patterns"
          },
          {
            id: "para-007",
            type: "paragraph",
            text: "Candlestick charting represents one of the oldest and most effective methods of analyzing price action. Developed in Japan centuries ago, these visual representations of price movement provide traders with a compact yet information-rich display of market sentiment during any given time period."
          },
          {
            id: "para-008",
            type: "paragraph",
            text: "Each candlestick consists of four key price points: open, high, low, and close. The body of the candle shows the range between open and close, while the wicks (shadows) extend to the high and low points reached during the period. The color of the candle — traditionally red or green — immediately conveys market direction: green for bullish (close above open) and red for bearish (close below open)."
          },
          {
            id: "para-009",
            type: "quote",
            text: "The market is a device for transferring money from the impatient to the patient."
          },
          {
            id: "para-010",
            type: "paragraph",
            text: "Understanding candlestick patterns requires recognizing that each pattern tells a story about the battle between buyers and sellers. A hammer pattern, for instance, shows how sellers pushed prices lower (the long lower wick) but buyers recovered ground by the close, signaling potential reversal. A shooting star shows buyers' initial strength followed by seller dominance, suggesting weakness ahead."
          }
        ]
      },
      {
        id: "ch-003",
        title: "Support and Resistance Levels",
        content: [
          {
            id: "para-011",
            type: "heading",
            text: "Chapter 3: Support and Resistance Levels"
          },
          {
            id: "para-012",
            type: "paragraph",
            text: "Support and resistance levels are the foundation of technical analysis. Support is a price level where demand is strong enough to prevent further decline, while resistance is a level where supply is sufficient to prevent further advance. These levels are not magical — they emerge from the collective memory and behavior of market participants."
          },
          {
            id: "para-013",
            type: "paragraph",
            text: "When a price level has been tested multiple times and held, traders gain confidence in its validity. Old resistance can become new support when broken, and vice versa. This dynamic interaction creates trading opportunities for disciplined traders who understand how these levels shift as market sentiment changes."
          }
        ]
      }
    ]
  },

  {
    id: "book-risk-management",
    title: "Risk Management Mastery",
    author: "Sarah Chen",
    tag: "Risk Management",
    accent: "#ff6b6b",
    description: "Learn position sizing, stop-loss strategies, and portfolio protection techniques used by professional traders.",
    pages: 380,
    difficulty: "beginner",
    chapters: [
      {
        id: "ch-001",
        title: "The Psychology of Risk",
        content: [
          {
            id: "para-001",
            type: "heading",
            text: "Chapter 1: The Psychology of Risk"
          },
          {
            id: "para-002",
            type: "paragraph",
            text: "Risk management begins with understanding your relationship to risk. Every trader has a different risk tolerance, shaped by their financial situation, experience, and psychological makeup. The key is matching your trading strategy to your actual risk tolerance, not the risk tolerance you think you should have."
          },
          {
            id: "para-003",
            type: "quote",
            text: "A man may imagine himself capable of anything, but a trader's success is ultimately determined by his capital preservation skills."
          }
        ]
      },
      {
        id: "ch-002",
        title: "Position Sizing Fundamentals",
        content: [
          {
            id: "para-004",
            type: "heading",
            text: "Chapter 2: Position Sizing Fundamentals"
          },
          {
            id: "para-005",
            type: "paragraph",
            text: "Position size is the lever of profitability and ruin. Too large, and a normal market fluctuation becomes catastrophic. Too small, and you miss the opportunity to compound your gains. The art of position sizing involves calculating exactly how much you can risk per trade based on your account size and risk tolerance."
          }
        ]
      }
    ]
  },

  {
    id: "book-market-psychology",
    title: "The Psychology of Money and Markets",
    author: "Dr. Robert Mills",
    tag: "Market Psychology",
    accent: "#3b82f6",
    description: "Explore behavioral finance, cognitive biases, and emotional trading patterns that affect all market participants.",
    pages: 456,
    difficulty: "advanced",
    chapters: [
      {
        id: "ch-001",
        title: "Cognitive Biases in Trading",
        content: [
          {
            id: "para-001",
            type: "heading",
            text: "Chapter 1: Cognitive Biases in Trading"
          },
          {
            id: "para-002",
            type: "paragraph",
            text: "Our brains are pattern-recognition machines, evolved over millions of years to help us survive. But these same mechanisms that kept our ancestors alive now work against us in the markets. Confirmation bias leads us to seek information that supports our existing positions while ignoring contradictory signals. Recency bias makes us overweight recent events and underestimate long-term probabilities."
          },
          {
            id: "para-003",
            type: "paragraph",
            text: "Anchoring bias causes us to fixate on a particular price level, often the price at which we entered a trade. This bias prevents us from objectively reassessing our positions when new information emerges. Loss aversion bias makes losses feel twice as painful as gains feel pleasant, leading to revenge trading and larger losses."
          }
        ]
      }
    ]
  },

  {
    id: "book-chart-patterns",
    title: "Advanced Chart Patterns & Their Trade Setup",
    author: "Michael Anderson",
    tag: "Chart Patterns",
    accent: "#fbbf24",
    description: "Deep dive into head-and-shoulders, triangles, flags, and breakout patterns with real market examples.",
    pages: 524,
    difficulty: "advanced",
    chapters: [
      {
        id: "ch-001",
        title: "Double Tops and Double Bottoms",
        content: [
          {
            id: "para-001",
            type: "heading",
            text: "Chapter 1: Double Tops and Double Bottoms"
          },
          {
            id: "para-002",
            type: "paragraph",
            text: "Double tops and bottoms are reversal patterns that form when a price reaches the same level twice, establishing significant resistance or support. The validity of these patterns depends on several factors: the depth of the reaction between the two peaks or troughs, the time elapsed between formations, and volume confirmation."
          }
        ]
      }
    ]
  },

  {
    id: "book-fundamental-analysis",
    title: "Fundamental Analysis for Traders",
    author: "James Peterson",
    tag: "Fundamental Analysis",
    accent: "#8b5cf6",
    description: "Understand financial statements, earnings reports, and macroeconomic factors that drive long-term price movements.",
    pages: 468,
    difficulty: "intermediate",
    chapters: [
      {
        id: "ch-001",
        title: "Reading Financial Statements",
        content: [
          {
            id: "para-001",
            type: "heading",
            text: "Chapter 1: Reading Financial Statements"
          },
          {
            id: "para-002",
            type: "paragraph",
            text: "Financial statements are the foundation of fundamental analysis. The balance sheet shows a company's assets, liabilities, and equity at a specific point in time. The income statement reveals revenues, expenses, and profits over a period. The cash flow statement tracks actual movement of cash — often more important than accounting profits."
          }
        ]
      }
    ]
  },

  {
    id: "book-day-trading-secrets",
    title: "Day Trading Secrets of the Professionals",
    author: "Lisa Goldman",
    tag: "Day Trading",
    accent: "#ec4899",
    description: "Intraday trading strategies, scalping techniques, and time-tested methods for consistent daily profits.",
    pages: 392,
    difficulty: "advanced",
    chapters: [
      {
        id: "ch-001",
        title: "Opening Bell Strategies",
        content: [
          {
            id: "para-001",
            type: "heading",
            text: "Chapter 1: Opening Bell Strategies"
          },
          {
            id: "para-002",
            type: "paragraph",
            text: "The opening bell is the most volatile time of the trading day. Volume surges, spreads widen, and price action is explosive. Successful day traders have learned to harness this volatility rather than be consumed by it. The first 30 minutes of trading often set the tone for the entire session."
          }
        ]
      }
    ]
  }
];

/**
 * Export utility to format book data for API response
 */
export function formatBooksForAPI(books) {
  return {
    books: books,
    total: books.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Mock API response handler for development
 */
export function getMockBook(bookId) {
  const book = sampleBooks.find(b => b.id === bookId);
  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }
  return {
    ...book,
    loadedAt: new Date().toISOString()
  };
}

/**
 * Utility to generate realistic page numbers for books
 */
export function calculatePageNumbers(chapters) {
  let currentPage = 1;
  return chapters.map((chapter, index) => {
    const pageStart = currentPage;
    // Estimate: ~250 words per page, ~50-100 words per content item
    const estimatedPages = Math.ceil(
      chapter.content.reduce((sum, item) => sum + item.text.split(' ').length, 0) / 250
    );
    currentPage += estimatedPages;
    return {
      ...chapter,
      startPage: pageStart,
      endPage: currentPage - 1
    };
  });
}