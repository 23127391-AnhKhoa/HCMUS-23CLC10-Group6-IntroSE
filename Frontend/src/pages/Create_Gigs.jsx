// src/pages/Create_Gigs.jsx
import React, { useState, useEffect } from 'react';
import OverviewCreGigs from '../components/CreateGigButton/Overview_CreGigs';
import PricingCreGigs from '../components/CreateGigButton/Pricing_CreGigs_Fixed';
import DescriptionCreGigs from '../components/CreateGigButton/Description_CreGigs';
import ReviewPublish from '../components/CreateGigButton/ReviewPublish';
import NavbarLD from '../Common/Navbar_LD';
import LoadingOverlay from '../Common/LoadingOverlay';
import Stepper from '../components/CreateGigButton/Stepper/Stepper';
import GigPublishSuccess from '../components/GigPublishSuccess';
import ApiService from '../services/CreateGigs.service';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


// ĐỊNH NGHĨA CÁC BƯỚC TẠO GIG
const GIG_CREATION_STEPS = [
  {
    id: 1,
    name: 'Overview',
    component: OverviewCreGigs,
    title: "Create Your Gig",
    description: "Let's start with the basics."
  },
  {
    id: 2,
    name: 'Pricing',
    component: PricingCreGigs,
    title: "Scope & Pricing",
    description: "Define your service scope and pricing."
  },
  { // ++ BƯỚC MỚI: DESCRIPTION (đã bao gồm media upload)
    id: 3,
    name: 'Description',
    component: DescriptionCreGigs, // ++ Gán component mới (đã có MediaGalleryManager)
    title: "Description & Media",
    description: "Describe your gig, upload media, and add frequently asked questions."
  },
  { // Bước Publish bây giờ là bước 4
    id: 4,
    name: 'Publish',
    component: ReviewPublish, // ++ Gán component ReviewPublish
    title: "Review & Publish",
    description: "Almost there! Review your gig and publish."
  },
];

const CreateGigsPage = () => {
  const { authUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStepId, setCurrentStepId] = useState(GIG_CREATION_STEPS[0].id);
  const totalSteps = GIG_CREATION_STEPS.length;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedGigData, setPublishedGigData] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false); // Track publishing state
  const [categories, setCategories] = useState([]); // Store categories from API

  const [gigData, setGigData] = useState({
    // Overview fields
    gigTitle: '',
    category: '',
    subcategory: '',
    searchTags: [],
    positiveKeywords: '',
    cover_image: '',
    additional_media: [], // URLs only
    additional_media_metadata: [], // Full metadata with fileType, fileName, etc.
    // Pricing fields
    price: '',
    delivery_days: 7,
    num_of_edits: 3,
    // Description fields
    description: '',
    faqs: [],
    // Additional fields for API
    owner_id: authUser?.uuid || '', // Get from AuthContext
  });

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Validation functions for each step
  const validateOverviewStep = () => {
    const stepErrors = {};
    
    if (!gigData.gigTitle.trim()) {
      stepErrors.gigTitle = 'Gig title is required';
    } else if (gigData.gigTitle.length < 10) {
      stepErrors.gigTitle = 'Gig title must be at least 10 characters';
    }
    
    if (!gigData.category) {
      stepErrors.category = 'Please select a category';
    }
    
    if (!gigData.subcategory) {
      stepErrors.subcategory = 'Please select a subcategory';
    }
    
    if (!gigData.cover_image || !gigData.cover_image.trim()) {
      stepErrors.cover_image = 'Cover image is required';
    }
    
    if (!gigData.searchTags || gigData.searchTags.length === 0) {
      stepErrors.searchTags = 'Please add at least one search tag';
    }
    
    return stepErrors;
  };

  const validatePricingStep = () => {
    const stepErrors = {};
    
    if (!gigData.price || parseFloat(gigData.price) < 1) {
      stepErrors.price = 'Price must be at least $1';
    }
    
    if (!gigData.delivery_days || gigData.delivery_days < 1) {
      stepErrors.delivery_days = 'Delivery time must be at least 1 day';
    } else if (gigData.delivery_days > 365) {
      stepErrors.delivery_days = 'Delivery time cannot exceed 365 days';
    }
    
    if (gigData.num_of_edits < 0) {
      stepErrors.num_of_edits = 'Number of edits cannot be negative';
    }
    
    return stepErrors;
  };

  const validateDescriptionStep = () => {
    const stepErrors = {};
    
    if (!gigData.description.trim()) {
      stepErrors.description = 'Gig description is required';
    }
    // Removed all character limits for description
    
    return stepErrors;
  };

  const validateCurrentStep = () => {
    let stepErrors = {};
    
    switch (currentStepId) {
      case 1: // Overview
        stepErrors = validateOverviewStep();
        break;
      case 2: // Pricing
        stepErrors = validatePricingStep();
        break;
      case 3: // Description
        stepErrors = validateDescriptionStep();
        break;
      default:
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      console.log('[CreateGigs] Fetching categories...');
      const response = await fetch('http://localhost:8000/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCategories(data.data || []);
          console.log('[CreateGigs] Categories loaded successfully:', data.data?.length || 0, 'categories');
          console.log('[CreateGigs] Sample category structure:', data.data?.[0]);
        } else {
          console.warn('[CreateGigs] Categories API returned non-success status:', data.status);
        }
      } else {
        console.warn('[CreateGigs] Categories API response not ok:', response.status);
      }
    } catch (err) {
      console.error('[CreateGigs] Error fetching categories:', err);
      // Don't set error state as categories are optional for now
    }
  };

  // Check if user is authenticated and fetch categories
  useEffect(() => {
    if (!authUser) {
      navigate('/login', { 
        state: { 
          from: '/create-gig',
          message: 'Please login to create a gig' 
        }
      });
    } else {
      setGigData(prev => ({ ...prev, owner_id: authUser.uuid }));
    }
    
    // Fetch categories when component mounts
    fetchCategories();
  }, [authUser, navigate]);

  const handleInputChange = (fieldName, value) => {
    setGigData(prevData => ({ ...prevData, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleCategoryChange = (fieldName, value) => {
    setGigData(prevData => {
      const newData = { ...prevData, [fieldName]: value };
      if (fieldName === 'category') {
        newData.subcategory = '';
      }
      return newData;
    });
  };

  const handleUpdateTagsArray = (updatedTagsArray) => {
    setGigData(prevData => ({ ...prevData, searchTags: updatedTagsArray }));
  };

  // Calculate total price with surcharges (same logic as PricingCreGigs and ReviewPublish)
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(gigData.price) || 0;
    const deliveryDays = parseInt(gigData.delivery_days) || 7;
    const numOfEdits = parseInt(gigData.num_of_edits) || 0;
    
    // Fast delivery surcharge
    let deliverySurcharge = 0;
    if (deliveryDays === 1) {
      deliverySurcharge = basePrice * 0.5; // 50% surcharge for 1-day delivery
    } else if (deliveryDays === 2) {
      deliverySurcharge = basePrice * 0.25; // 25% surcharge for 2-day delivery  
    } else if (deliveryDays === 3) {
      deliverySurcharge = basePrice * 0.1; // 10% surcharge for 3-day delivery
    }
    
    // Extra revisions fee (more than 3 revisions)
    let revisionFee = 0;
    if (numOfEdits > 3) {
      revisionFee = (numOfEdits - 3) * (basePrice * 0.1); // 10% of base price per extra revision
    }
    
    return basePrice + deliverySurcharge + revisionFee;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStepId, isLoading]);

  const proceedToNextStep = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      setLoadingMessage("Please fix the errors before continuing");
      setTimeout(() => setIsLoading(false), 1500);
      return;
    }

    const currentStepIndex = GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId);
    const currentStepDetails = GIG_CREATION_STEPS[currentStepIndex];
    console.log(`Data for Step: ${currentStepDetails.name}`, gigData);

    if (currentStepIndex < totalSteps - 1) {
      const nextStepDetails = GIG_CREATION_STEPS[currentStepIndex + 1];
      setLoadingMessage(`Proceeding to ${nextStepDetails?.name || 'Next Step'}...`);
      setCurrentStepId(nextStepDetails.id);
    } else {
      // Final step - publish the gig
      await publishGig();
    }
  };

  const publishGig = async () => {
    // Prevent double submission
    if (isPublishing || isLoading) {
      console.log('Already publishing, preventing duplicate submission');
      return;
    }

    try {
      setIsPublishing(true);
      setIsLoading(true);
      setLoadingMessage("Publishing your gig...");
      
      // Calculate the total price with surcharges
      const totalPrice = calculateTotalPrice();
      console.log('Publishing gig with calculated total price:', totalPrice);
      
      // Get the correct category ID
      const categoryId = getSelectedCategoryId();
      if (!categoryId) {
        throw new Error('Please select a valid category');
      }
      
      const gigPayload = {
        title: gigData.gigTitle,
        cover_image: gigData.cover_image,
        description: gigData.description,
        price: totalPrice, // Use calculated total price instead of base price
        delivery_days: parseInt(gigData.delivery_days),
        num_of_edits: parseInt(gigData.num_of_edits),
        category_id: categoryId, // Use the new category ID logic
        owner_id: gigData.owner_id,
        status: 'active'
      };

      console.log('Publishing gig with payload:', gigPayload);
      
      const response = await ApiService.createGig(gigPayload);
      console.log('Gig created successfully:', response);
      
      // If successful, create gig media entries for additional images
      if (response.status === 'success' && response.data.id) {
        setLoadingMessage("Setting up gig gallery...");
        
        try {
          // Add cover image as first media entry
          await ApiService.createGigMedia(response.data.id, {
            media_type: 'image',
            url: gigData.cover_image
          });
          console.log(`✅ Created cover image media entry: ${gigData.cover_image}`);

          // Add additional media entries if any
          if (gigData.additional_media_metadata && gigData.additional_media_metadata.length > 0) {
            for (const media of gigData.additional_media_metadata) {
              try {
                // Use fileType from metadata to determine media type accurately
                let mediaType = 'image'; // default
                
                if (media.fileType) {
                  if (media.fileType.startsWith('video/')) {
                    mediaType = 'video';
                  } else if (media.fileType.startsWith('image/')) {
                    mediaType = 'image';
                  }
                } else {
                  // Fallback to URL extension if fileType not available
                  const url = media.url.toLowerCase();
                  if (url.includes('.mp4') || url.includes('.avi') || url.includes('.mov') || url.includes('.webm') || url.includes('.mkv')) {
                    mediaType = 'video';
                  }
                }
                
                await ApiService.createGigMedia(response.data.id, {
                  media_type: mediaType,
                  url: media.url
                });
                
                console.log(`✅ Created gig media entry: ${mediaType} - ${media.fileName || media.url}`);
              } catch (mediaError) {
                console.warn('Could not create additional gig media entry:', mediaError);
                // Continue with other media even if one fails
              }
            }
          }
        } catch (mediaError) {
          console.warn('Could not create gig media entries:', mediaError);
          // Don't fail the whole process for this
        }
      }
      
      setLoadingMessage("Gig published successfully!");
      
      setTimeout(() => {
        setIsLoading(false);
        setIsPublishing(false);
        setPublishedGigData(response.data);
        setShowSuccessModal(true);
      }, 2000);
      
    } catch (error) {
      console.error('Error publishing gig:', error);
      setLoadingMessage("Error publishing gig...");
      
      setTimeout(() => {
        setIsLoading(false);
        setIsPublishing(false);
        setErrors({ 
          publish: `Failed to publish gig: ${error.message}. Please try again.` 
        });
      }, 1500);
    } finally {
      // Ensure publishing state is reset even if something unexpected happens
      setIsPublishing(false);
    }
  };

  // Helper function to map category names to IDs using the fetched categories
  const getCategoryIdFromName = (categoryName) => {
    if (!categoryName || !categories.length) {
      console.warn('[CreateGigs] No category name or categories not loaded yet');
      return null;
    }

    // First try to find in parent categories
    const parentCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase() && cat.parent_id === null
    );
    
    if (parentCategory) {
      return parentCategory.id;
    }

    // Then try to find in subcategories
    for (const parentCat of categories) {
      if (parentCat.children && parentCat.children.length > 0) {
        const subcategory = parentCat.children.find(subCat => 
          subCat.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (subcategory) {
          return subcategory.id;
        }
      }
    }

    console.warn('[CreateGigs] Category not found:', categoryName);
    return null;
  };

  // Helper function to get category ID from the selected subcategory (if any) or category
  const getSelectedCategoryId = () => {
    // If subcategory is selected, use subcategory ID
    if (gigData.subcategory) {
      return getCategoryIdFromName(gigData.subcategory);
    }
    // Otherwise use main category ID
    if (gigData.category) {
      return getCategoryIdFromName(gigData.category);
    }
    return null;
  };

  const goBackOneStep = () => {
     const currentStepIndex = GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId);
    if (currentStepIndex > 0) {
      const prevStepDetails = GIG_CREATION_STEPS[currentStepIndex - 1];
      setLoadingMessage(`Returning to ${prevStepDetails?.name || 'Previous Step'}...`);
      setCurrentStepId(prevStepDetails.id);
    }
  };

  const handleSubmitGig = (event) => {
    event.preventDefault();
    
    // Validate current step
    if (!validateCurrentStep()) {
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      proceedToNextStep();
    }, 50);
  };

  const currentStepDetails = GIG_CREATION_STEPS.find(step => step.id === currentStepId) || GIG_CREATION_STEPS[0];
  // Component cho các bước chưa định nghĩa sẽ hiển thị placeholder
  const CurrentStepComponent = currentStepDetails.component || (() => (
    <div className="text-center p-10 bg-white dark:bg-slate-800 shadow-xl rounded-xl">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Component for '{currentStepDetails.name}'</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">This step component is not yet defined.</p>
    </div>
  ));

  return (
    <>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      {showSuccessModal && publishedGigData && (
        <GigPublishSuccess 
          gigData={publishedGigData} 
          onClose={() => setShowSuccessModal(false)} 
        />
      )}
      <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 font-sans pt-16 ${isLoading ? 'filter blur-sm pointer-events-none' : ''}`}>
        <NavbarLD />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 pb-2">
                {currentStepDetails.title}
              </h1>
              <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 sm:mt-4 max-w-2xl mx-auto">
                {currentStepDetails.description}
              </p>
            </div>
            <div className="mb-10 sm:mb-12 px-2 sm:px-0">
              <Stepper
                steps={GIG_CREATION_STEPS}
                currentStepId={currentStepId}
              />
            </div>
            <form onSubmit={handleSubmitGig}>
              {/* Display validation errors */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <CurrentStepComponent
                gigData={gigData}
                onInputChange={handleInputChange}
                onCategoryChange={handleCategoryChange}
                onUpdateTagsArray={handleUpdateTagsArray}
                errors={errors}
                categories={categories} // Pass categories to components
                onPublish={currentStepDetails.name === 'Publish' ? publishGig : undefined}
                isPublishing={currentStepDetails.name === 'Publish' ? isPublishing : false}
                isLoading={currentStepDetails.name === 'Publish' ? isLoading : false}
              />
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-300 dark:border-slate-700">
                <div>
                  {GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId) > 0 && (
                    <button
                      type="button"
                      onClick={goBackOneStep}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-6 py-3 border border-slate-400 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId) < totalSteps - 1 ? 'Save & Continue' : 'Save & Publish'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateGigsPage;