import Navbar from "@/app/Components/Navbar";
import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default async function page({ params }) {
  const slug = (await params).slug;

  return (
    <div className="w-full h-screen flex flex-col px-36 bg-[#E6E0E0] text-primaryText font-montserrat">
      <Navbar showBook={false} showBook2={false} />
      <div className="w-full flex justify-center h-[90vh]">
        <div className="flex flex-col w-2/4 items-center pt-10">
          {/* Receipt div */}
          <div className="bg-[#FFFFFF] pt-5 flex flex-col w-[60%] relative">
            <div className="flex flex-col gap-[4px] justify-center px-7 text-sm font-[410]">
              <p className="uppercase text-sm font-normal text-orange-700 mb-4">
                Booking Summary
              </p>
              <p className="text-orange-700 italic">1028F25</p>
              <p>Name: Aayush Chaudhary</p>
              <p>Email: aayupcy@gmail.com</p>
              <p>Date: 28 Feb 2025</p>
              <div className="flex items-start gap-1">
                <p>Branch: </p>
                <p className="w-[70%]">Kota, Raipur</p>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  Slot: 10AM - 11AM{" "}
                  <span className="text-[#7d7d7d]">(1Hr)</span>
                </p>{" "}
                <p className="text-sm">Rs.200</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-[#7d7d7d]">Convenience Fee</p>
                <p>Rs.13</p>
              </div>
              <div className="flex overflow-hidden font-thin text-[#939393cd]">
                ........................................................................................................................................................................................................................................
              </div>
              <div className="flex items-center justify-between">
                <p>Sub Total</p>
                <p>Rs.213</p>
              </div>
            </div>
            <div className="flex items-center justify-between px-7 py-2 text-base bg-orange-200 mt-2 font-medium">
              <p>Amount Payable</p>
              <p>Rs.213</p>
            </div>
            {/* circle div */}
            <div className="bg-[#E6E0E0] w-5 h-5 rounded-full absolute top-1/2 -translate-y-1/2 -left-[10px]"></div>
            <div className="bg-[#E6E0E0] w-5 h-5 rounded-full absolute top-1/2 -translate-y-1/2 -right-[10px]"></div>
          </div>
          {/* information div */}
          <div className="flex gap-1 py-2 mt-3 w-[60%]">
            <InformationCircleIcon className="size-4" />{" "}
            <p className="flex items-center text-xs w-[90%]">
              By proceeding, I express my consent to complete this transaction.
            </p>
          </div>
          {/* Proceed button */}
          <div className="w-[60%] text-center font-medium cursor-pointer bg-red-500 hover:bg-[#dc3636] text-white py-2 rounded-md">
            Proceed to Payment
          </div>
        </div>
      </div>
    </div>
  );
}
