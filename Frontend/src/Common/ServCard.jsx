import React from "react";

const ServCard = () => {
    return (
        <div className="flex flex-col h-[420px] w-[300px] m-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover-scale transition-shadow duration-300">
            {/* Image Section */}
            <div className="h-[40%] relative overflow-hidden">
                <img 
                    src="https://placehold.co/600x400" 
                    alt="Service preview" 
                    className="w-full h-full object-cover hover-scale transition-transform duration-300" 
                />
            </div>
            
            {/* Content Section */}
            <div className="h-[45%] flex flex-col p-4">
                {/* Seller Info */}
                <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-100">
                        <img 
                            src="https://placehold.co/300x300" 
                            alt="Seller avatar" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-800">username</div>
                        <div className="text-xs text-gray-500">Professional Seller</div>
                    </div>
                </div>
                
                {/* Service Title */}
                <div className="flex-1">
                    <p className="text-base text-gray-700 line-clamp-3 leading-relaxed max-h-[60px] min-h-[26px]">
                        I will do website ui ux design and development for your business aaaa
                    </p>
                </div>

                {/* Rating and Badge */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex items-center">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="text-sm font-medium text-gray-700 ml-1">4.1</span>
                        <span className="text-xs text-gray-500 ml-1">(100)</span>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Featured
                    </div>
                </div>
            </div>
            
            {/* Footer Section */}
            <div className="h-[15%] flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="w-5 h-5">
                    <img 
                        src="https://placehold.co/20x20" 
                        alt="Heart icon" 
                        className="w-full h-full object-cover cursor-pointer hover-scale transition-opacity" 
                    />
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Starting at</div>
                    <div className="text-lg font-bold text-gray-800">$99</div>
                </div>
            </div>
        </div>
    );
}

export default ServCard;