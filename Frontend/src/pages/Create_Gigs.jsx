// src/pages/Create_Gigs.jsx
import React, { useState, useEffect } from 'react';
import OverviewCreGigs from '../components/CreateGigButton/Overview_CreGigs'; 
// 1. IMPORT NAVBAR_LD TỪ ĐÚNG ĐƯỜNG DẪN
import NavbarLD from '../components/LandingPage/Navbar_LD'; // Đường dẫn này dựa trên cấu trúc bạn cung cấp trước đó

const CreateGigsPage = () => {
  // Giữ lại logic quản lý bước nếu bạn dự định mở rộng sau này,
  // nhưng hiện tại, chúng ta sẽ chỉ hiển thị bước Overview.
  // const GIG_CREATION_STEPS = [
  //   { id: 1, name: 'Overview', href: '#overview', component: OverviewCreGigs },
  //   // { id: 2, name: 'Pricing', href: '#pricing', component: PricingSection },
  //   // ... các bước khác
  // ];
  // const [currentStepId, setCurrentStepId] = useState(GIG_CREATION_STEPS[0].id);
  // const totalSteps = GIG_CREATION_STEPS.length;

  // Vì hiện tại chỉ có 1 bước là Overview, có thể đơn giản hóa currentStep nếu không cần quản lý nhiều bước
  const [currentStep, setCurrentStep] = useState(1); // Giữ lại để logic nút "Save & Continue" có thể tham chiếu

  const [gigData, setGigData] = useState({
    gigTitle: '',
    category: '',
    subcategory: '',
    searchTags: [],
    positiveKeywords: '',
    // Các trường dữ liệu khác cho các bước sau này có thể được thêm vào đây
  });

  // --- HÀM XỬ LÝ INPUT ---
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
    // console.log("Gig Data Updated:", gigData);
    // Scroll lên đầu trang khi component được render (nếu cần)
    // window.scrollTo(0, 0); // Có thể không cần nếu Navbar chiếm không gian đúng
  }, []); // Chạy một lần khi component mount

  const handleSubmitGig = (event) => {
    event.preventDefault();
    console.log('Submitting Gig Data (Overview Step):', gigData);
    alert('Form submitted (Simulated). Check console for data.');
    // Nếu có nhiều bước, bạn sẽ xử lý chuyển bước hoặc publish ở đây
    // if (currentStep === totalSteps) { /* Publish */ } else { /* setCurrentStep(prev => prev + 1) */ }
  };

  const handleSaveAndPreview = () => {
    console.log('Save & Preview Clicked. Current Data:', gigData);
    alert('Gig data saved, redirecting to preview (Simulated)!');
  };

  return (
    // Div bao ngoài này cần có padding-top để nội dung không bị Navbar_LD che
    // Giả sử Navbar_LD của bạn có position: fixed và chiều cao là h-16 (4rem)
    <div className="min-h-screen bg-slate-100 font-sans pt-16"> {/* Thêm pt-16 ở đây */}
      
      {/* 2. RENDER NAVBAR_LD Ở ĐẦU TRANG CREATE GIGS */}
      <NavbarLD />
      
      {/* Phần nội dung chính của trang Create Gigs */}
      {/* Không còn nền gradient ở div này vì Navbar đã chiếm phần đầu */}
      <div className="py-12 px-4 sm:px-6 lg:px-8"> {/* Thêm padding cho nội dung */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 pb-2">
              Create Your Gig
            </h1>
            <p className="mt-3 text-lg text-slate-600 sm:mt-4 max-w-2xl mx-auto">
              Let's start with the basics. This information helps buyers find and understand your service.
            </p>
          </div>

          <form onSubmit={handleSubmitGig}>
            {/* Hiện tại chỉ render OverviewCreGigs */}
            <OverviewCreGigs
              gigData={gigData}
              onInputChange={handleInputChange}
              onCategoryChange={handleCategoryChange}
              onUpdateTagsArray={handleUpdateTagsArray}
            />
            
            <div className="mt-12 flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-slate-300">
              {/* Nút Back (sẽ không hiển thị vì currentStep = 1 và không có logic nhiều bước phức tạp hiện tại) */}
              {/* {currentStep > 1 && (
                <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="...">Back</button>
              )} */}
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
                {/* Vì chỉ có 1 bước nên nút này có thể là "Save" hoặc "Continue to Next Step" (nếu có) */}
                Save & Continue 
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGigsPage;