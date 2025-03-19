import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';

// Function to format the answer with proper HTML structure
function formatAnswer(answer) {
  if (!answer) return '';

  // Split answer based on triple backticks (```)
  const parts = answer.split(/```([\s\S]*?)```/g);

  return parts
    .map((part, index) => {
      if (index % 2 === 1) {
        // This means it's a code block
        return `<pre class="language-python bg-gray-900 text-white p-4 rounded-lg overflow-x-auto"><code class="language-python">${part.trim()}</code></pre>`;
      }

      // Process regular text formatting
      let formatted = part
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>') // Bold
        .replace(/(\d+)\.\s/g, '<br /><strong class="text-blue-600">$1.</strong> '); // Numbered list

      return formatted;
    })
    .join('');
}

function Questions({ question }) {
  useEffect(() => {
    Prism.highlightAll();
  }, [question?.answer]);

  return (
    <div className="max-w-5xl mx-auto mt-6 p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
      {/* Question Title */}
      <h2 className="font-extrabold text-2xl md:text-3xl text-center text-gray-800 leading-relaxed">
        ❓ {question?.question}
      </h2>

      {/* Divider */}
      <div className="my-4 border-t border-gray-300"></div>

      {/* Answer Section */}
      <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-300">
        <div
          className="text-gray-700 text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatAnswer(question?.answer) }}
        />
      </div>
    </div>
  );
}

export default Questions;
