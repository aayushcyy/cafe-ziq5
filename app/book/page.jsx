"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../Components/Navbar";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import dayjs from "dayjs";
import BookingDiv from "../Components/BookingDiv";
import Loader from "../Components/Loader";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import useMyStore from "../store/store";

export default function page() {
  //location and date value
  const [locationValue, setLocationValue] = useState("");
  const [dateValue, setDateValue] = useState("Today");
  const [optionOpen, setOptionOpen] = useState(false);
  const [dateOptionOpen, setDateOptionOpen] = useState(false);
  const [largeDateOptionOpen, setLargeDateOptionOpen] = useState(false);
  const [tommDate, setTommDate] = useState("");
  const [afterTommDate, setAfterTommDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsData, setSlotsData] = useState(null);
  const [uniquePathId, setUniquePathId] = useState("");
  const [isUsserLoggedIn, setIsUsserLoggedIn] = useState(false);
  const locationDivRef = useRef(null);
  const dateDivRef = useRef(null);
  const dateDivRefLarge = useRef(null);
  const router = useRouter();

  //extracting zustand values
  const { setIsLoggedIn } = useMyStore();

  //checking if user logged in or not?
  useEffect(() => {
    const userD = getCookie("user");
    if (userD) {
      setIsUsserLoggedIn(true);
      setIsLoggedIn(true);
      console.log("userData found!");
    } else {
      setIsUsserLoggedIn(false);
      console.log("user data not found!");
    }
  }, [isUsserLoggedIn]);

  //generating upcoming 2 days
  useEffect(() => {
    const tomorrow = dayjs().add(1, "day").format("D MMM YY");
    setTommDate(tomorrow);
    const dayAfterTomorrow = dayjs().add(2, "day").format("D MMM YY");
    setAfterTommDate(dayAfterTomorrow);

    //handling outside click of inputs
    const handleClickOutside = (e) => {
      if (!locationDivRef.current.contains(e.target)) setOptionOpen(false);
      if (
        dateDivRefLarge.current &&
        !dateDivRefLarge.current.contains(e.target)
      )
        setLargeDateOptionOpen(false);
      if (!dateDivRef.current.contains(e.target)) setDateOptionOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //creating document Id
  const shortLocation = locationValue.includes("Samta") ? "samta" : "kota";
  const sDateValue =
    dateValue === "Today"
      ? dayjs().format("DMMMYY")
      : dateValue.replace(/\s/g, "");
  const temId = `${shortLocation}-${sDateValue}`;
  const documentId = temId.toLowerCase();

  useEffect(() => {
    const checkDocExistence = async () => {
      if (!locationValue || !dateValue) {
        console.log("Please fill all fields correctly");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch("/api/database/getDoc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentId }),
        });
        //empty the slots before filling in with new value
        setSlotsData(null);
        const data = await response.json();
        if (data.data.slots) {
          setSlotsData(data.data.slots);
        }
      } catch (error) {
        console.error("Error signing up: ", error);
        console.log("slots empty tha");
        //creating slots when slot wasn't available
        createSlots();
        console.log("called the createSlots functino");
      } finally {
        setLoading(false);
      }
    };
    checkDocExistence();
  }, [dateValue, locationValue]);

  //creating slots when it wasn't available
  const createSlots = async () => {
    console.log("creatSlots function starttttt!");
    setLoading(true);
    try {
      const response = await fetch("/api/database/createDoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dateValue, locationValue, documentId }),
      });
      setSlotsData(null);
      const data = await response.json();
      console.log("data: ", data);

      if (data.data.slots) {
        setSlotsData(data.data.slots);
        console.log("the data i got from creating doc: ", data);
        //setSlotsData(data.data.slots);
      }
    } catch (error) {
      console.error("Error creating doc: ", error);
    } finally {
      setLoading(false);
    }
  };

  //creating uniqueId
  useEffect(() => {
    if (dateValue === "Today") {
      const month = dayjs().format("MM");
      const date = dayjs().format("DD");
      setUniquePathId(month.concat(date));
    }
  }, [dateValue, locationValue]);

  //setting cookies to get values in dynamic page
  const handleSlotClick = (isAvailable, timeSlot) => {
    const userCookie = getCookie("user");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        userData.slot = timeSlot;
        userData.location = locationValue;
        userData.date =
          dateValue === "Today" ? dayjs().format("D MMM YY") : dateValue;

        setCookie("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    } else {
      console.warn("No existing user cookie found.");
    }

    if (isAvailable) {
      router.push(`/book/${uniquePathId}${timeSlot.slice(0, 2)}`);
    }
  };

  //finding todays date and current time hour
  const today = new Date();
  const currentHour = today.getHours();
  const formattedToday = today.toISOString().split("T")[0];
  console.log("today: and hours : ", formattedToday, currentHour);

  //function to convert string date into a proper date
  function convertDate(dateStr) {
    const months = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    // Use regex to correctly extract day, month, and year
    const match = dateStr.match(/^(\d{1,2})([a-z]{3})(\d{2})$/);
    if (!match) {
      console.error("Invalid date format. Expected format: '12feb25'", match);
      return null;
    }

    const day = match[1]; // First capture group (day)
    const monthStr = match[2].toLowerCase(); // Second capture group (month in lowercase)
    const year = "20" + match[3]; // Third capture group (year)

    // Convert month abbreviation to number
    const month = months[monthStr];

    if (!month) {
      console.error("Invalid month abbreviation:", monthStr);
      return null;
    }

    // Format as YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day.padStart(2, "0")}`;
    console.log(`Converted date: ${formattedDate}`);
    return formattedDate;
  }
  //function to convert string slot into a proper day hour
  function isSlotBefore(timeStr) {
    let [startTime] = timeStr.split(" - ").map((time) => {
      let hour = parseInt(time.slice(0, -2)); // Extract hour
      let period = time.slice(-2); // Extract AM/PM

      if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (period.toLowerCase() === "am" && hour === 12) hour = 0;

      return hour;
    });

    return startTime <= currentHour;
  }

  dateValue === "Today"
    ? convertDate(dayjs().format("DMMMYY").toLowerCase())
    : convertDate(dateValue.toLowerCase());

  return (
    <div className="w-full h-screen flex flex-col md:gap-0 lg:gap-2 gap-16 md:px-28 bg-[#E6E0E0] text-primaryText font-montserrat">
      <Navbar showBook={false} isUsserLoggedIn={isUsserLoggedIn} />
      <div className="w-full h-[90vh] flex md:flex-row md:justify-center lg:justify-center md:px-0 flex-col gap-3 px-6">
        {/* Input Container */}
        <div className="md:w-[50%] lg:w-[45%] md:flex-col flex flex-col md:gap-7 md:relative">
          {/* Location Selector */}
          <div
            ref={locationDivRef}
            className="md:flex flex-col lg:w-[23vw] md:w-[34vw] w-[88%] md:gap-2 gap-1 md:z-0 z-20 md:top-0 md:left-0 absolute md:relative top-14 left-5"
          >
            <p className="md:text-sm text-xs text-gray-400 md:mb-0 mb-1.5">
              Location
            </p>
            <div className="flex flex-col bg-white text-sm rounded-md">
              <div
                onClick={() => setOptionOpen(!optionOpen)}
                className="flex items-center justify-between py-2 px-[1vw] cursor-pointer"
              >
                <p className="font-medium md:text-sm text-[13px]">
                  {locationValue ? locationValue : "Select Location"}
                </p>{" "}
                <ChevronDownIcon height={100} className="size-5 md:size-6" />
              </div>
              {/* Location Selector */}
              {optionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                    type: "spring",
                  }}
                  className="flex flex-col border-t-[1px] border-[#ddddddc6]"
                >
                  <p
                    onClick={() => {
                      setLocationValue("Samta Colony, Raipur");
                      setOptionOpen(false);
                    }}
                    className="py-2 px-3 cursor-pointer md:text-sm text-[13px]"
                  >
                    Samta Colony, Raipur
                  </p>
                  <div className="w-full h-[1px] bg-[#ddddddc6]"></div>
                  <p
                    onClick={() => {
                      setLocationValue("Jagganath Chowk, Kota, Raipur");
                      setOptionOpen(false);
                    }}
                    className="py-2 px-3 cursor-pointer md:text-sm text-[13px]"
                  >
                    Jagganath Chowk, Kota, Raipur
                  </p>
                </motion.div>
              )}
            </div>
          </div>
          {/* Date Selector */}
          <div
            ref={dateDivRefLarge}
            className="hidden flex-col w-[11vw] gap-2 md:flex"
          >
            <p className="text-sm text-gray-400">Date</p>
            <div className="flex flex-col bg-white text-sm rounded-md">
              <div
                onClick={() => setLargeDateOptionOpen(!largeDateOptionOpen)}
                className="flex items-center justify-between py-2 cursor-pointer px-3"
              >
                <p className="font-medium">
                  {dateValue === "Today" ? "Today" : dateValue.slice(0, -2)}
                </p>{" "}
                <ChevronDownIcon height={20} />
              </div>
              {largeDateOptionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                    type: "spring",
                  }}
                  className="flex flex-col border-t-[1px] border-[#ddddddc6]"
                >
                  <p
                    onClick={() => {
                      setDateValue("Today");
                      setLargeDateOptionOpen(false);
                    }}
                    className="py-2 px-3 cursor-pointer hover:bg-red-100"
                  >
                    Today
                  </p>
                  <div className="w-full h-[1px] bg-[#ddddddc6]"></div>
                  <p
                    onClick={() => {
                      setDateValue(tommDate);
                      setLargeDateOptionOpen(false);
                      console.log("tommDate: ", tommDate);
                    }}
                    className="py-2 px-3 cursor-pointer hover:bg-red-100"
                  >
                    {tommDate.slice(0, -2)}
                  </p>
                  <div className="w-full h-[1px] bg-[#ddddddc6]"></div>
                  <p
                    onClick={() => {
                      setDateValue(afterTommDate);
                      setLargeDateOptionOpen(false);
                    }}
                    className="py-2 px-3 cursor-pointer hover:bg-red-100"
                  >
                    {afterTommDate.slice(0, -2)}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        {/* showing booking options */}
        <div className="md:w-[45%] lg:items-center lg:w-[30%] w-full flex flex-col">
          <div className="md:w-[90%] lg:w-full w-full flex flex-col lg:justify-center gap-2">
            <div className="flex justify-between w-full relative">
              <p className="md:text-sm text-xs text-gray-400">
                Available Slots
              </p>
              <div
                ref={dateDivRef}
                className="flex flex-col w-[28%] gap-2 md:hidden lg:hidden lg:left-0 absolute right-0 top-0 rounded-b-sm overflow-hidden"
              >
                <div className="flex flex-col text-sm rounded-md">
                  <div
                    onClick={() => setDateOptionOpen(!dateOptionOpen)}
                    className="flex items-center justify-between gap-2 cursor-pointer pl-2"
                  >
                    <p className="font-medium text-xs">
                      {dateValue === "Today" ? "Today" : dateValue.slice(0, -2)}
                    </p>{" "}
                    <ChevronDownIcon height={18} />
                  </div>
                  {dateOptionOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                        type: "spring",
                      }}
                      className="flex flex-col text-xs border-t-[1px] border-[#ddddddc6]"
                    >
                      <p
                        onClick={() => {
                          setDateValue("Today");
                          setDateOptionOpen(false);
                        }}
                        className="py-1.5 px-2 cursor-pointer bg-white"
                      >
                        Today
                      </p>
                      <div className="w-full h-[1px] bg-[#ddddddc6]"></div>
                      <p
                        onClick={() => {
                          setDateValue(tommDate);
                          setDateOptionOpen(false);
                        }}
                        className="py-1.5 px-2 cursor-pointer bg-white"
                      >
                        {tommDate.slice(0, -2)}
                      </p>
                      <div className="w-full h-[1px] bg-[#ddddddc6]"></div>
                      <p
                        onClick={() => {
                          setDateValue(afterTommDate);
                          setDateOptionOpen(false);
                        }}
                        className="py-1.5 px-2 cursor-pointer bg-white"
                      >
                        {afterTommDate.slice(0, -2)}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader height={40} width={40} />
              </div>
            ) : (
              <div className="flex flex-col md:w-[100%] lg:w-full item-center gap-[10px] h-[75vh] md:pr-0 lg:pr-5 overflow-y-scroll pb-10">
                {slotsData ? (
                  Object.entries(slotsData).map(([timeSlot, isAvailable]) => (
                    <div
                      key={timeSlot}
                      onClick={() => {
                        if (isUsserLoggedIn) {
                          if (
                            dateValue !== "Today" ||
                            !isSlotBefore(timeSlot)
                          ) {
                            handleSlotClick(isAvailable, timeSlot);
                          }
                        } else {
                          router.push("/../login");
                        }
                      }}
                      className={
                        dateValue !== "Today" || !isSlotBefore(timeSlot)
                          ? "block"
                          : "hidden"
                      }
                    >
                      <BookingDiv
                        fadeDiv={
                          dateValue === "Today" && isSlotBefore(timeSlot)
                        }
                        slot={timeSlot}
                        available={isAvailable}
                      />
                    </div>
                  ))
                ) : (
                  <p
                    className="md:text-sm lg:w-full lg:text-start text-xs font-medium text-center md:mt-0 mt-40
                  "
                  >
                    Please Select Date and Branch to see the Availability
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
