import React from "react";

const ServCard = () => {
    return (
        <div className="flex flex-col h-[420px] w-[300px] m-1 border-solid border-2 rounded-xl overflow-hidden">
            <div className="max-h-[40%] flex justify-center items-center">
                <img src="https://placehold.co/600x400" alt="placeholder" className="w-full h-full object-cover" />
            </div>
            <div className=" h-[45%] flex flex-col">
                <div className="w-full flex items-center">
                    <div className="w-[30px] h-[30px] overflow-hidden rounded-full m-2 display-inline-block">
                        <img src="https://placehold.co/300x300" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-base font-bold mt-0.5">username</div>
                        <div className="text-sm text-gray-500 ">seller</div>
                    </div>
                </div>
                <div className="m-2 text-xl min-h-[50%] overflow-hidden">
                    <span className="mb-2">I will do website ui ux design, dashboard ui, mobile app ui ux design, ui ux design </span>
                </div>

                <div className="border-t-2 flex flex-row h-[10%]  ">
                    <div className="p-2 w-[50%] justify-left flex mt-1">
                        <span className="text-[12px] mt-2">⭐ 4.1 (100)</span>
                    </div>
                    <div className="w-[50%] h-[40px] overflow-hidden justify-center items-center flex p-3">
                        <img src="https://placehold.co/125x40" className="pt-3" />
                    </div>
                </div>
                
            </div>
            <div className="h-[15%] flex flex-row justify-between items-center pt-4 pl-4 pr-4">
                <div className="w-[20px] h-[20px]">
                    <img src="https://placehold.co/20x20" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-center ">
                    <span className="text-[12px] text-gray-500 text-right ">STARTING AT</span>
                    <span className="text-[16px] text-right font-bold pt-1">$99999999</span>
                </div>
            </div>
        </div>
    );
}

export default ServCard;