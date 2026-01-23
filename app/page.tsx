'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PackageLevel, PACKAGES, VehicleInfo, CustomerInfo } from './types';
import PackageCard from './components/PackageCard';
import OrderForm from './components/OrderForm';
import { ShieldCheck, ChevronDown } from 'lucide-react';

export default function Home() {
  const [selectedPackage, setSelectedPackage] = useState<PackageLevel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPackage && formRef.current) {
        // Delay to allow the expand animation to start rendering
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
  }, [selectedPackage]);

  const handleOrderSubmit = async (vehicle: VehicleInfo, customer: CustomerInfo, photo: File | null, notes: string, packageLevel: PackageLevel) => {
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        
        // Append fields
        formData.append('package', packageLevel);
        formData.append('jobRequest', notes);
        formData.append('status', 'pending');
        
        // Append nested objects as flattened fields or JSON strings
        // Based on our API needing flat fields for DB, let's send them flattened for easier consumption,
        // or just JSON stringify them and parse on server. Flattening is cleaner for FormData usually.
        formData.append('vehicle[year]', vehicle.year);
        formData.append('vehicle[make]', vehicle.make);
        formData.append('vehicle[model]', vehicle.model);
        formData.append('vehicle[trim]', vehicle.trim);
        
        formData.append('customer[name]', customer.name);
        formData.append('customer[email]', customer.email);
        formData.append('customer[phone]', customer.phone);

        if (photo) {
            formData.append('photo', photo);
        }

        const res = await fetch('/api/orders', {
            method: 'POST',
            body: formData, // fetch automatically sets Content-Type to multipart/form-data
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to submit order');
        }

        setOrderSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error("Submission error:", error);
        alert("Failed to submit order. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-12 h-12 text-brand-green" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Received</h1>
        <p className="text-zinc-400 mb-8 max-w-sm">
          Your PPF request has been submitted. We'll be in touch shortly.
        </p>
        <button 
          onClick={() => {
            setOrderSuccess(false);
            setSelectedPackage(null);
          }}
          className="px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 p-4 pt-8">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="flex justify-center mb-4">
            {/* Logo placeholder - using generic styling for now */}
            <div className="text-2xl font-black italic tracking-tighter border-2 border-brand-green px-4 py-1 rounded-sm text-brand-green">
                TOMMY PPF
            </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Paint Protection Film Premium Packages</h1>
        <p className="text-zinc-400 text-sm">Select a package for your vehicle</p>
      </header>

      {/* Package Selection */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.level}
            level={pkg.level}
            features={pkg.features}
            colorClass={pkg.colorInfo}
            imageUrl={pkg.imageUrl}
            isSelected={selectedPackage === pkg.level}
            onSelect={setSelectedPackage}
          />
        ))}
      </section>

      {/* Order Form Section */}
      <div 
        ref={formRef}
        className="transition-all duration-500 overflow-hidden opacity-100"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
                {selectedPackage && (
                    <div className="px-3 py-1 bg-brand-green/10 rounded-full text-brand-green text-xs font-bold border border-brand-green/20">
                        {selectedPackage} SELECTED
                    </div>
                )}
            </div>
            <OrderForm 
                onSubmit={handleOrderSubmit} 
                isSubmitting={isSubmitting} 
                initialPackage={selectedPackage} 
                onPackageChange={setSelectedPackage}
            />
        </div>
      </div>
    </main>
  );
}
