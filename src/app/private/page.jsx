"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/private/PageHeader";
import BookingInformationSection from "@/components/private/BookingInformationSection";
import TripDetailSection from "@/components/private/TripDetailSection";
import TripOptionSection from "@/components/private/TripOptionSection";
import TripFromSection from "@/components/private/TripFromSection";
import SuccessState from "@/components/private/SuccessState";
import SubmitBar from "@/components/private/SubmitBar";
import TermsModal from "@/components/private/TermsModal";
import Subs from "@/components/landing/Subs";
import { initialForm } from "@/components/private/helpers/initialState";
import { validate } from "@/components/private/helpers/validation";
import { destinationsData } from "@/infrastructure/data/destinationsData";

export default function PrivateTripPage() {
  const [form, setForm] = useState(initialForm);

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Participant handlers
  const addParticipant = () => {
    const newP = {
      id: `pax-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      fullName: "", birthDate: "", gender: "", phone: "", email: "", relationship: "",
    };
    setForm((prev) => ({ ...prev, participants: [...prev.participants, newP] }));
  };

  const updateParticipant = (id, field, value) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => p.id === id ? { ...p, [field]: value } : p),
    }));
  };

  const removeParticipant = (id) => {
    setForm((prev) => ({ ...prev, participants: prev.participants.filter((p) => p.id !== id) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setShowTerms(true);
  };

  const handleAgree = () => {
    setShowTerms(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setErrors({});
    setForm(initialForm);
  };

  const budgetValue = form.tripType === "explorer" && form.selectedDestinasi
    ? form.selectedDestinasi.priceMin
    : form.budget;

  if (submitted) {
    return (
      <SuccessState
        form={form}
        onReset={resetForm}
      />
    );
  }

  return (
    <>
      <Navbar />

      {showTerms && (
        <TermsModal
          onAgree={handleAgree}
          onClose={() => setShowTerms(false)}
        />
      )}

      <main className="min-h-screen bg-white">

        <PageHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">

              <BookingInformationSection
                form={form}
                set={set}
                errors={errors}
                onAddParticipant={addParticipant}
                onUpdateParticipant={updateParticipant}
                onRemoveParticipant={removeParticipant}
              />
              <TripDetailSection
                form={form}
                set={set}
                errors={errors}
                budgetValue={budgetValue}
              />
              <TripOptionSection
                form={form}
                set={set}
                errors={errors}
                destinationsData={destinationsData}
              />
              <TripFromSection
                form={form}
                set={set}
                errors={errors}
              />
              <SubmitBar />

            </div>
          </form>
        </div>
      </main>
      <Subs />
      <Footer />
    </>
  );
}
