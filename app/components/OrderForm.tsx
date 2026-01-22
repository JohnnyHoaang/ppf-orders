import React, { useState, useCallback } from 'react';
import { VehicleInfo, CustomerInfo, PackageLevel, PACKAGES } from '../types';
import { Camera, Upload, User, Mail, Phone, FileImage, ShieldCheck } from 'lucide-react';

interface OrderFormProps {
  onSubmit: (vehicle: VehicleInfo, customer: CustomerInfo, photo: File | null, notes: string, packageLevel: PackageLevel) => void;
  isSubmitting: boolean;
  initialPackage?: PackageLevel | null;
  onPackageChange?: (level: PackageLevel) => void;
}

export default function OrderForm({ onSubmit, isSubmitting, initialPackage, onPackageChange }: OrderFormProps) {
  // Initialize with initialPackage if provided, otherwise default to Custom or allow empty?
  // User workflow: if they selected a package, it should be pre-selected.
  // If they just scrolled down, they should be able to select one.
  const [selectedPackage, setSelectedPackage] = useState<PackageLevel>(initialPackage || 'Custom');
  
  const [vehicle, setVehicle] = useState<VehicleInfo>({ year: '', make: '', model: '', trim: '' });
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', email: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Update selected package if initialPackage changes (e.g. user clicks a card)
  React.useEffect(() => {
    if (initialPackage) {
      setSelectedPackage(initialPackage);
    }
  }, [initialPackage]);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPackage = e.target.value as PackageLevel;
    setSelectedPackage(newPackage);
    if (onPackageChange) {
      onPackageChange(newPackage);
    }
  };

  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; phone?: string } = {};
    let isValid = true;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation (simple check for at least 10 digits)
    const phoneRegex = /^\d{10,}$/;
    // Strip non-digits for check
    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        onSubmit(vehicle, customer, photo, notes, selectedPackage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setPhoto(file);
      } else {
        alert('Please upload an image file');
      }
    }
  }, []);

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/50 placeholder-zinc-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ... Package Selection ... */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Package Selection</h3>
        <div className="relative">
            <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
            <select
                value={selectedPackage}
                onChange={handlePackageChange}
                className={`${inputClass} pl-10 appearance-none`}
            >
                {PACKAGES.map(pkg => (
                    <option key={pkg.level} value={pkg.level}>
                        {pkg.level}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {/* Customer Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Customer Information</h3>
        <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
            <input
                required
                type="text"
                placeholder="Full Name"
                className={`${inputClass} pl-10`}
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className={`${inputClass} pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                    value={customer.email}
                    onChange={(e) => {
                        setCustomer({ ...customer, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
                )}
            </div>
            <div className="relative group">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    className={`${inputClass} pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                    value={customer.phone}
                    onChange={(e) => {
                        setCustomer({ ...customer, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                />
                {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>
                )}
            </div>
        </div>
      </div>

      {/* Vehicle Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-300 border-b border-zinc-800 pb-2">Vehicle Information</h3>
        <div className="grid grid-cols-2 gap-4">
            <input
            required
            type="text"
            placeholder="Year"
            className={inputClass}
            value={vehicle.year}
            onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
            />
            <input
            required
            type="text"
            placeholder="Make"
            className={inputClass}
            value={vehicle.make}
            onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <input
            required
            type="text"
            placeholder="Model"
            className={inputClass}
            value={vehicle.model}
            onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
            />
            <input
            type="text"
            placeholder="Trim Level"
            className={inputClass}
            value={vehicle.trim}
            onChange={(e) => setVehicle({ ...vehicle, trim: e.target.value })}
            />
        </div>

        <textarea
            placeholder="Additional Job Requests / Custom Customizations..."
            className={`${inputClass} min-h-[100px]`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Photo Upload Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-400">Vehicle Photo</label>
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex items-center justify-center w-full transition-all duration-300 ${isDragging ? 'scale-[1.02] ring-2 ring-brand-green bg-zinc-800' : ''}`}
        >
          <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging ? 'border-brand-green bg-zinc-800' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600'}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {photo ? (
                <div className="text-center animate-in fade-in zoom-in">
                  <FileImage className="w-10 h-10 mb-3 text-brand-green mx-auto" />
                  <p className="text-sm text-brand-green font-semibold">{photo.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{(photo.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-xs text-zinc-500 mt-2">Click or Drop to change</p>
                </div>
              ) : (
                <>
                  <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-brand-green animate-bounce' : 'text-zinc-500'}`} />
                  <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-zinc-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-brand-green to-emerald-600 text-black font-bold py-4 rounded-xl shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Order...' : 'Submit Order'}
      </button>
    </form>
  );
}
