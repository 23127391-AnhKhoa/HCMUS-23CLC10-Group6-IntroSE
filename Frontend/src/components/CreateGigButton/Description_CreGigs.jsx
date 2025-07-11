// src/components/CreateGigButton/Description_CreGigs.jsx
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  AlignLeft, 
  AlignCenter, 
  AlignRight 
} from 'lucide-react';

const DescriptionCreGigs = ({ gigData, onInputChange, errors = {} }) => {
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const descriptionRef = useRef(null);

  const handleDescriptionChange = (e) => {
    onInputChange('description', e.target.value);
  };

  // Rich text editor functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    descriptionRef.current?.focus();
    // Trigger change event after command
    setTimeout(handleRichTextChange, 0);
  };

  const handleRichTextChange = () => {
    const content = descriptionRef.current?.innerHTML || '';
    // Only update if content has actually changed
    if (content !== gigData.description) {
      onInputChange('description', content);
    }
  };

  // Handle keyboard events for better UX
  const handleKeyDown = (e) => {
    // Allow common keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  // Update the contentEditable div when gigData.description changes
  useEffect(() => {
    if (descriptionRef.current && gigData.description !== descriptionRef.current.innerHTML) {
      descriptionRef.current.innerHTML = gigData.description || '';
    }
  }, [gigData.description]);

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleFaqInputChange = (field, value) => {
    setNewFaq(prev => ({ ...prev, [field]: value }));
  };

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      const updatedFaqs = [...(gigData.faqs || []), { ...newFaq }];
      onInputChange('faqs', updatedFaqs);
      setNewFaq({ question: '', answer: '' });
    }
  };

  const removeFaq = (index) => {
    const updatedFaqs = (gigData.faqs || []).filter((_, i) => i !== index);
    onInputChange('faqs', updatedFaqs);
  };

  // Initialize rich text editor content
  useEffect(() => {
    if (descriptionRef.current) {
      // Only set innerHTML if it's different from current content
      const currentContent = descriptionRef.current.innerHTML;
      const newContent = gigData.description || '';
      
      if (currentContent !== newContent) {
        descriptionRef.current.innerHTML = newContent;
      }
      
      // Set placeholder text if empty
      if (!newContent) {
        descriptionRef.current.innerHTML = '';
      }
    }
  }, []);

  const inputBaseClasses = "block w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const labelClasses = "block text-lg font-semibold text-slate-800 mb-2";

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 md:p-10">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">
        Description & FAQ
      </h2>
      
      <div className="space-y-8">
        {/* Rich Text Editor for Gig Description */}
        <div className="space-y-3">
          <label htmlFor="description" className={labelClasses}>
            Gig Description (Rich Text Editor)
          </label>
          <p className="text-sm text-slate-600 mb-4">
            Use the rich text editor to format your description with bold, italic, lists, and links.
            <span className="text-green-600 font-medium ml-2">✓ No character limit</span>
          </p>
          
          {/* Rich Text Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-300 rounded-t-lg">
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={insertLink}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title="Insert Link"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>
          
          {/* Rich Text Content Area */}
          <div
            ref={descriptionRef}
            contentEditable
            onInput={handleRichTextChange}
            onBlur={handleRichTextChange}
            onKeyDown={handleKeyDown}
            className="min-h-[200px] p-4 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            style={{ 
              borderTop: 'none',
              overflowY: 'auto',
              maxHeight: 'none' // Remove height restriction
            }}
            data-placeholder="Write your detailed service description here. Use the toolbar above to format your text..."
          />
          
          {errors.description && (
            <p className="text-red-600 text-sm mt-2">{errors.description}</p>
          )}
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <div>
            <h3 className={labelClasses}>Frequently Asked Questions</h3>
            <p className="text-sm text-slate-600">
              Add questions that buyers commonly ask about your service.
            </p>
          </div>

          {/* Existing FAQs */}
          {gigData.faqs && gigData.faqs.length > 0 && (
            <div className="space-y-4">
              {gigData.faqs.map((faq, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800">Q: {faq.question}</h4>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600">A: {faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add New FAQ */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-medium text-indigo-800 mb-3">Add New FAQ</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="faqQuestion" className="block text-sm font-medium text-slate-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  id="faqQuestion"
                  value={newFaq.question}
                  onChange={(e) => handleFaqInputChange('question', e.target.value)}
                  className={inputBaseClasses + " py-2 px-3"}
                  placeholder="e.g., How many revisions do you offer?"
                />
              </div>
              <div>
                <label htmlFor="faqAnswer" className="block text-sm font-medium text-slate-700 mb-1">
                  Answer
                </label>
                <textarea
                  id="faqAnswer"
                  rows={3}
                  value={newFaq.answer}
                  onChange={(e) => handleFaqInputChange('answer', e.target.value)}
                  className={`${inputBaseClasses} py-2 px-3 resize-none`}
                  placeholder="Provide a clear and helpful answer..."
                />
              </div>
              <button
                type="button"
                onClick={addFaq}
                disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Add FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-slate-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">
              {gigData.gigTitle || 'Your Gig Title'}
            </h4>
            <div 
              className="text-sm text-slate-600 mb-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: gigData.description || 'Your gig description will appear here...'
              }}
            />
            {gigData.faqs && gigData.faqs.length > 0 && (
              <div>
                <h5 className="font-medium text-slate-700 mb-2">FAQs ({gigData.faqs.length})</h5>
                <div className="space-y-2">
                  {gigData.faqs.slice(0, 2).map((faq, index) => (
                    <div key={index} className="text-xs text-slate-500">
                      <span className="font-medium">Q:</span> {faq.question}
                    </div>
                  ))}
                  {gigData.faqs.length > 2 && (
                    <p className="text-xs text-slate-400">...and {gigData.faqs.length - 2} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionCreGigs;