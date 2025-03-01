"use client";

import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function Proceed2PayBtn({ bookingId }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const router = useRouter();

  //geting data from cookie
  useEffect(() => {
    const userCookie = getCookie("user");
    if (userCookie) {
      const userData = JSON.parse(userCookie);
      setSlot(userData.slot);
      setEmail(userData.email);
      setName(userData.name);
      const loc = userData.location.includes("Samta") ? "samta" : "kota";
      const formattedDate = userData.date.replace(/\s/g, "").toLowerCase();
      setLocation(loc);
      setDate(formattedDate);

      // Generate document ID once location and date are available
      setDocumentId(`${loc}-${formattedDate}`);
    } else {
      console.log("can't get cookie!");
    }
  }, []);

  //creating document id to access/change data
  const handleSubmit = async () => {
    setLoading(true);

    if (!documentId || !slot || !email || !date || !location) {
      console.error("Missing required fields at client side:", {
        slot,
        documentId,
        email,
        date,
        location,
      });
      setLoading(false);
      return;
    }

    //creating documentId for bookings collection
    const todayDate = dayjs().format("DMMMYY");
    const bookingsDocIdRough = `${todayDate}${bookingId}`;
    let bookingsDocId;
    if (!bookingsDocIdRough.length % 2) {
      bookingsDocId = `${todayDate}$D{bookingId}`;
    } else {
      bookingsDocId = bookingsDocIdRough;
    }

    try {
      const newVal = {
        available: false,
        email: email,
        bookingsDocId: bookingsDocId,
        bookedOn: todayDate,
        name: name,
        bookingDetail: {
          date: date,
          branch: location,
          slot: slot,
          bookingId: bookingId,
          amountPaid: "Rs.213",
        },
      };
      console.log("new val ", newVal);

      const response = await fetch("../api/database/updateDoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newVal: newVal,
          documentId: documentId,
        }),
      });
      const data = await response.json();

      setBookingSuccessMsg(true);
      setTimeout(() => {
        router.push("/book");
      }, 1000);
      console.log("data after trying updateDoc: ", data);
    } catch (error) {
      console.error("Error updating doc: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:w-[80%] w-[55%] flex justify-center flex-col items-center">
      {loading && !bookingSuccessMsg && <Loader height={16} width={16} />}
      {!loading && !bookingSuccessMsg && (
        <button
          className="w-full text-center md:text-base text-[14px] font-[400] cursor-pointer bg-red-500 hover:bg-[#dc3636] text-white md:py-2 py-1.5 rounded-md"
          onClick={handleSubmit}
        >
          Proceed to Payment
        </button>
      )}
      {bookingSuccessMsg && (
        <div className="md:font-medium text-sm">Booking Successful!</div>
      )}
    </div>
  );
}
