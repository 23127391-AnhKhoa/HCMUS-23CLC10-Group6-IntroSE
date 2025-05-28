// src/pages/Create_Gigs.jsx
import React, { useState, useEffect } from 'react';
import OverviewCreGigs from '../components/CreateGigButton/Overview_CreGigs';
<<<<<<< Updated upstream
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
=======
import PricingCreGigs from '../components/CreateGigButton/Pricing_CreGigs'; // ++ IMPORT Pricing component
import NavbarLD from '../components/LandingPage/Navbar_LD';

// ++ ĐỊNH NGHĨA CÁC BƯỚC TẠO GIG
const GIG_CREATION_STEPS = [
  { 
    id: 1, 
    name: 'Overview', 
    component: OverviewCreGigs,
    title: "Create Your Gig",
    description: "Let's start with the basics. This information helps buyers find and understand your service."
  },
  { 
    id: 2, 
    name: 'Pricing', 
    component: PricingCreGigs,
    title: "Scope & Pricing",
    description: "Define the scope of your service, pricing tiers, and any valuable add-ons you offer."
  },
  // { id: 3, name: 'Description & FAQ', component: DescriptionFaqSection, title: "...", description: "..." },
  // { id: 4, name: 'Requirements', component: RequirementsSection, title: "...", description: "..." },
  // { id: 5, name: 'Gallery', component: GallerySection, title: "...", description: "..." },
  // { id: 6, name: 'Publish', component: PublishSection, title: "...", description: "..." },
];

const CreateGigsPage = () => {
  const [currentStepId, setCurrentStepId] = useState(GIG_CREATION_STEPS[0].id); // ++ Quản lý bước hiện tại bằng ID
  const totalSteps = GIG_CREATION_STEPS.length;
>>>>>>> Stashed changes

  const [gigData, setGigData] = useState({
    // Overview fields
    gigTitle: '',
    category: '',
    subcategory: '',
    searchTags: [],
    positiveKeywords: '',
<<<<<<< Updated upstream
    // Pricing fields (sẽ được thêm khi bạn phát triển Pricing_CreGigs)
    // basicPackagePrice: '',
    // Description fields (sẽ được thêm khi bạn phát triển Description_CreGigs)
    // gigFullDescription: '',
    // faqs: [],
=======
    // Pricing fields (sẽ được thêm sau)
    // basicPackagePrice: '', 
    // standardPackagePrice: '',
    // premiumPackagePrice: '',
    // ... các trường dữ liệu khác cho các bước sau
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    // console.log("Gig Data Updated:", gigData);
    // Scroll lên đầu trang khi component được render hoặc bước thay đổi
    window.scrollTo(0, 0);
  }, [currentStepId]); // Chạy khi currentStepId thay đổi

  const handleSubmitGig = (event) => {
    event.preventDefault();
    const currentStepDetails = GIG_CREATION_STEPS.find(step => step.id === currentStepId);
    console.log(`Data for Step: ${currentStepDetails.name}`, gigData);

    if (currentStepId < totalSteps) {
      // Chuyển sang bước tiếp theo
      setCurrentStepId(prevId => prevId + 1);
      alert(`Proceeding to ${GIG_CREATION_STEPS.find(step => step.id === currentStepId + 1)?.name || 'next step'}.`);
    } else {
      // Bước cuối cùng, thực hiện publish/submit cuối cùng
      alert('All steps completed! Publishing Gig (Simulated). Check console for final data.');
      console.log('Final Gig Data for Submission:', gigData);
      // TODO: Logic gửi dữ liệu lên server
    }
  };

  const handleBack = () => {
    if (currentStepId > GIG_CREATION_STEPS[0].id) {
      setCurrentStepId(prevId => prevId - 1);
>>>>>>> Stashed changes
    }
  };

  const handleSaveAndPreview = () => {
    setIsLoading(true);
    setLoadingMessage("Saving and Preparing Preview...");
    console.log('Save & Preview Clicked. Current Data:', gigData);
<<<<<<< Updated upstream
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
=======
    alert('Gig data saved, redirecting to preview (Simulated)!');
    // TODO: Logic lưu dữ liệu và chuyển sang trang preview
  };

  // ++ Lấy thông tin và component của bước hiện tại
  const currentStepDetails = GIG_CREATION_STEPS.find(step => step.id === currentStepId);
  const CurrentStepComponent = currentStepDetails.component;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pt-16">
      <NavbarLD />
      
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 pb-2">
              {currentStepDetails.title} {/* ++ Tiêu đề động */}
            </h1>
            <p className="mt-3 text-lg text-slate-600 sm:mt-4 max-w-2xl mx-auto">
              {currentStepDetails.description} {/* ++ Mô tả động */}
            </p>
            {/* Optional: Progress bar or step indicator */}
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-500">
                Step {currentStepId} of {totalSteps}: {currentStepDetails.name}
              </p>
              {/* You can add a visual progress bar here */}
            </div>
          </div>

          <form onSubmit={handleSubmitGig}>
            {/* ++ Render component của bước hiện tại */}
            {CurrentStepComponent && (
              <CurrentStepComponent
                gigData={gigData}
                onInputChange={handleInputChange}
                // Các props này chủ yếu cho Overview, Pricing_CreGigs sẽ không dùng đến
                // nhưng truyền vào không gây hại
                onCategoryChange={handleCategoryChange} 
                onUpdateTagsArray={handleUpdateTagsArray}
                // Bạn có thể thêm các props khác cần thiết cho các bước cụ thể ở đây
              />
            )}
            
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-300">
              {/* ++ Nút Back */}
              <div>
                {currentStepId > GIG_CREATION_STEPS[0].id && (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="w-full sm:w-auto px-6 py-3 border border-slate-400 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  type="button" 
                  onClick={handleSaveAndPreview}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-400 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save & Preview
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {/* ++ Text nút thay đổi tùy theo bước */}
                  {currentStepId < totalSteps ? 'Save & Continue' : 'Save & Publish'} 
                </button>
              </div>
>>>>>>> Stashed changes
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