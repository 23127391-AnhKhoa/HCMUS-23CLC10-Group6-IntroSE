// src/pages/Create_Gigs.jsx
import React, { useState, useEffect } from 'react';
import OverviewCreGigs from '../components/CreateGigButton/Overview_CreGigs';
import PricingCreGigs from '../components/CreateGigButton/Pricing_CreGigs';
import DescriptionCreGigs from '../components/CreateGigButton/Description_CreGigs'; // ++ IMPORT Description component
import NavbarLD from '../components/LandingPage/Navbar_LD';
import LoadingOverlay from '../Common/LoadingOverlay';
import Stepper from '../components/CreateGigButton/Stepper/Stepper';


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
  { // ++ BƯỚC MỚI: DESCRIPTION
    id: 3,
    name: 'Description',
    component: DescriptionCreGigs, // ++ Gán component mới
    title: "Description & FAQ",
    description: "Describe your gig in detail and add frequently asked questions."
  },
  { // Bước Publish bây giờ là bước 4
    id: 4,
    name: 'Publish',
    // component: PublishComponent, // Sẽ tạo component này sau nếu cần
    title: "Review & Publish",
    description: "Almost there! Review your gig and publish."
  },
];

const CreateGigsPage = () => {
  const [currentStepId, setCurrentStepId] = useState(GIG_CREATION_STEPS[0].id);
  const totalSteps = GIG_CREATION_STEPS.length;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");

  const [gigData, setGigData] = useState({
    // Overview fields
    gigTitle: '',
    category: '',
    subcategory: '',
    searchTags: [],
    positiveKeywords: '',
    // Pricing fields (sẽ được thêm khi bạn phát triển Pricing_CreGigs)
    // basicPackagePrice: '',
    // Description fields (sẽ được thêm khi bạn phát triển Description_CreGigs)
    // gigFullDescription: '',
    // faqs: [],
  });

  const handleInputChange = (fieldName, value) => {
    setGigData(prevData => ({ ...prevData, [fieldName]: value }));
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

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStepId, isLoading]);

  const proceedToNextStep = () => {
    const currentStepIndex = GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId);
    const currentStepDetails = GIG_CREATION_STEPS[currentStepIndex];
    console.log(`Data for Step: ${currentStepDetails.name}`, gigData);

    if (currentStepIndex < totalSteps - 1) {
      const nextStepDetails = GIG_CREATION_STEPS[currentStepIndex + 1];
      setLoadingMessage(`Proceeding to ${nextStepDetails?.name || 'Next Step'}...`);
      setCurrentStepId(nextStepDetails.id);
    } else {
      setLoadingMessage("Publishing Gig...");
      console.log('Final Gig Data for Submission:', gigData);
      setTimeout(() => {
        alert('All steps completed! Gig Published (Simulated).');
        setIsLoading(false);
      }, 1000);
    }
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
    setIsLoading(true);
    setTimeout(() => {
      proceedToNextStep();
    }, 50);
  };

  const handleBack = () => {
    const currentStepIndex = GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId);
    if (currentStepIndex > 0) {
      setIsLoading(true);
      setTimeout(() => {
        goBackOneStep();
      }, 50);
    }
  };

  const handleSaveAndPreview = () => {
    setIsLoading(true);
    setLoadingMessage("Saving and Preparing Preview...");
    console.log('Save & Preview Clicked. Current Data:', gigData);
    setTimeout(() => {
      alert('Gig data saved, redirecting to preview (Simulated)!');
      setIsLoading(false);
    }, 1000);
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
              <CurrentStepComponent
                gigData={gigData}
                onInputChange={handleInputChange}
                onCategoryChange={handleCategoryChange}
                onUpdateTagsArray={handleUpdateTagsArray}
              />
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-300 dark:border-slate-700">
                <div>
                  {GIG_CREATION_STEPS.findIndex(step => step.id === currentStepId) > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-6 py-3 border border-slate-400 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSaveAndPreview}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 border border-slate-400 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save & Preview
                  </button>
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