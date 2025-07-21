import React, { useState } from 'react'; // Cần useState cho currentTagInput
import { XMarkIcon } from '@heroicons/react/24/solid'; // Cần cho nút xóa tag
import MediaGalleryManager from './MediaGalleryManager';

// Props bây giờ sẽ là onUpdateTagsArray thay vì onTagsChange
const OverviewCreGigs = ({ gigData, onInputChange, onCategoryChange, onUpdateTagsArray, errors = {}, categories = [] }) => {
  const MAX_TITLE_LENGTH = 80;
  const MAX_TAGS = 5;

  // State cục bộ cho input tag hiện tại
  const [currentTagInput, setCurrentTagInput] = useState('');

  const handleGigTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      onInputChange('gigTitle', value);
    }
  };

  const handlePositiveKeywordsChange = (e) => {
    onInputChange('positiveKeywords', e.target.value);
  };

  // Use categories from props instead of hardcoded ones
  const selectedCategoryObject = categories.find(cat => 
    cat.name === gigData.category && cat.parent_id === null
  );
  
  console.log('[OverviewCreGigs] Current category selection:', {
    selectedCategory: gigData.category,
    selectedSubcategory: gigData.subcategory,
    availableCategories: categories.length,
    foundCategoryObject: selectedCategoryObject?.name,
    availableSubcategories: selectedCategoryObject?.children?.length || 0
  });

  const inputBaseClasses = "block w-full text-sm text-slate-800 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const labelClasses = "block text-lg font-semibold text-slate-800 mb-1";

  // --- LOGIC CHO TAG INPUT ---
  const handleTagInputChange = (e) => {
    setCurrentTagInput(e.target.value);
  };

  const addTag = (tagValue) => {
    const newTag = tagValue.trim().toLowerCase();
    const sanitizedTag = newTag.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' '); 
    
    if (sanitizedTag && gigData.searchTags.length < MAX_TAGS && !gigData.searchTags.includes(sanitizedTag)) {
      const updatedTags = [...gigData.searchTags, sanitizedTag];
      onUpdateTagsArray(updatedTags); // Sử dụng callback mới
    }
    setCurrentTagInput('');
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      if (currentTagInput.trim()) {
        addTag(currentTagInput);
      }
    }
    if (e.key === 'Backspace' && !currentTagInput && gigData.searchTags.length > 0) {
      const updatedTags = gigData.searchTags.slice(0, -1);
      onUpdateTagsArray(updatedTags); // Sử dụng callback mới
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = gigData.searchTags.filter(tag => tag !== tagToRemove);
    onUpdateTagsArray(updatedTags); // Sử dụng callback mới
  };
  // --- KẾT THÚC LOGIC CHO TAG INPUT ---


  return (
    <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl space-y-12">
      
      {/* Gig Title Section */}
      <div className="space-y-3">
        <label htmlFor="gigTitle" className={labelClasses}>Gig title</label>
        <p className="text-sm text-slate-600">As your Gig storefront, your title is the most important place to include keywords that buyers would likely use to search for a service like yours.</p>
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-sm text-slate-500 pointer-events-none">I will</span>
          <textarea id="gigTitle" name="gigTitle" rows="3" className={`${inputBaseClasses} pl-14 pr-16 py-3 leading-relaxed ${errors.gigTitle ? 'border-red-500 focus:border-red-500' : ''}`} placeholder="do something I'm really good at" value={gigData.gigTitle || ''} onChange={handleGigTitleChange} aria-describedby="gigTitle-description gigTitle-counter"/>
          <div id="gigTitle-counter" className="absolute right-4 bottom-3 text-xs text-slate-500">{gigData.gigTitle?.length || 0} / {MAX_TITLE_LENGTH}</div>
        </div>
        {errors.gigTitle && (
          <p className="text-sm text-red-600 mt-1">{errors.gigTitle}</p>
        )}
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <label className={labelClasses}>Category</label>
        <p className="text-sm text-slate-600">Choose the category and sub-category most suitable for your Gig.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="sr-only">Main Category</label>
            <select id="category" name="category" className={`${inputBaseClasses} py-3 px-4 ${errors.category ? 'border-red-500 focus:border-red-500' : ''}`} value={gigData.category || ''} onChange={(e) => onCategoryChange('category', e.target.value)}>
              <option value="" disabled>SELECT A CATEGORY</option>
              {categories.filter(cat => cat.parent_id === null).map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label htmlFor="subcategory" className="sr-only">Sub Category</label>
            <select id="subcategory" name="subcategory" className={`${inputBaseClasses} py-3 px-4 ${errors.subcategory ? 'border-red-500 focus:border-red-500' : ''}`} value={gigData.subcategory || ''} onChange={(e) => onCategoryChange('subcategory', e.target.value)} disabled={!gigData.category || !selectedCategoryObject?.children?.length}>
              <option value="" disabled>SELECT A SUBCATEGORY</option>
              {selectedCategoryObject?.children?.map(subcat => (<option key={subcat.id} value={subcat.name}>{subcat.name}</option>))}
            </select>
            {errors.subcategory && (
              <p className="text-sm text-red-600 mt-1">{errors.subcategory}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search Tags & Positive Keywords Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {/* Search Tags Section - ĐÃ ĐƯỢC CẬP NHẬT */}
        <div className="space-y-3">
          <label htmlFor="search-tags-input" className={labelClasses}>Search tags</label>
          <p className="text-sm text-slate-600">Tag your Gig with buzz words that are relevant to the services you offer. Use up to {MAX_TAGS} tags to get found.</p>
          <div 
            className={`${inputBaseClasses} flex flex-wrap items-center gap-x-2 gap-y-1.5 p-2.5 min-h-[50px] cursor-text ${errors.searchTags ? 'border-red-500 focus:border-red-500' : ''}`} 
            onClick={() => document.getElementById('search-tags-input')?.focus()}
          >
            {gigData.searchTags.map((tag, index) => (
              <span key={index} className="flex items-center bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                {tag}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                  className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none transform hover:scale-110"
                  aria-label={`Remove ${tag} tag`}
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {gigData.searchTags.length < MAX_TAGS && (
              <input
                id="search-tags-input"
                type="text"
                value={currentTagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className="flex-grow p-1 bg-transparent border-none focus:ring-0 text-sm text-slate-800 placeholder-slate-500 outline-none min-w-[120px]"
                placeholder={gigData.searchTags.length === 0 ? "e.g., logo design, web development" : "Add another tag..."}
                aria-describedby="searchTags-description"
              />
            )}
          </div>
          {errors.searchTags && (
            <p className="text-sm text-red-600 mt-1">{errors.searchTags}</p>
          )}
          <p id="searchTags-description" className="text-xs text-slate-500">
            {MAX_TAGS - gigData.searchTags.length} tags remaining. Use letters and numbers only.
          </p>
        </div>

        {/* Positive Keywords Section */}
        <div className="space-y-3">
          <label htmlFor="positiveKeywords" className={labelClasses}>Positive keywords</label>
          <p className="text-sm text-slate-600">Enter search terms you feel your buyers will use when looking for your service.</p>
          <textarea id="positiveKeywords" name="positiveKeywords" rows="4" className={`${inputBaseClasses} py-3 px-4 resize-none leading-relaxed`} value={gigData.positiveKeywords || ''} onChange={handlePositiveKeywordsChange} placeholder="e.g., professional, high-quality, fast delivery"/>
        </div>
      </div>

      {/* Media Gallery Manager - Cover Image and Additional Media */}
      <MediaGalleryManager 
        gigData={gigData}
        onInputChange={onInputChange}
        errors={errors}
      />

      {/* Negative Keywords Section */}
      <div className="space-y-3">
        <label className={labelClasses}>Negative keywords <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full tracking-wide shadow-md align-middle">PLUS</span></label>
        <p className="text-sm text-slate-600">Negative keywords enable Seller Plus members to prevent their Gigs from matching with irrelevant search terms.</p>
        <button type="button" className="px-6 py-2.5 border border-slate-400 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">Tell me more</button>
      </div>

      {/* Please note Section */}
      <div className="flex items-start p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-sm">
        <svg className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
        <p className="text-sm text-amber-900"><span className="font-semibold">Please note:</span> Some categories require that sellers verify their skills.</p>
      </div>
    </div>
  );
};

export default OverviewCreGigs;