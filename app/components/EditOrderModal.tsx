import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Order, PackageLevel } from '../types';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => Promise<void>;
  order: Order | null;
}

export default function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
  const [formData, setFormData] = useState<Partial<Order> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData(JSON.parse(JSON.stringify(order))); // Deep copy
    }
  }, [order]);

  if (!isOpen || !order || !formData || !formData.customer || !formData.vehicle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData as Order);
      onClose();
    } catch (error) {
      console.error('Failed to update order', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateCustomer = (field: string, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      customer: { ...prev.customer!, [field]: value }
    }) : null);
  };

  const updateVehicle = (field: string, value: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      vehicle: { ...prev.vehicle!, [field]: value }
    }) : null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-xl font-bold text-white">Edit Order</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-green uppercase tracking-wider">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Full Name</label>
                <input
                  type="text"
                  value={formData.customer?.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.customer?.email}
                  onChange={(e) => updateCustomer('email', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Phone</label>
                <input
                  type="tel"
                  value={formData.customer?.phone}
                  onChange={(e) => updateCustomer('phone', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Vehicle Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-green uppercase tracking-wider">Vehicle Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Year</label>
                <input
                  type="number"
                  value={formData.vehicle?.year}
                  onChange={(e) => updateVehicle('year', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Make</label>
                <input
                  type="text"
                  value={formData.vehicle?.make}
                  onChange={(e) => updateVehicle('make', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Model</label>
                <input
                  type="text"
                  value={formData.vehicle?.model}
                  onChange={(e) => updateVehicle('model', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Trim (Optional)</label>
                <input
                  type="text"
                  value={formData.vehicle?.trim || ''}
                  onChange={(e) => updateVehicle('trim', e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none placeholder-zinc-700"
                  placeholder="---"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Package & Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-green uppercase tracking-wider">Order Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Selected Package</label>
                <select 
                    value={formData.package}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, package: e.target.value as PackageLevel }) : null)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none"
                >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Notes / Custom Details</label>
                <textarea
                  rows={3}
                  value={formData.jobRequest || ''}
                  onChange={(e) => setFormData(prev => prev ? ({ ...prev, jobRequest: e.target.value }) : null)}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-green/50 outline-none resize-none placeholder-zinc-700"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-brand-green hover:bg-brand-green/90 text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-green/20"
            >
              {saving ? 'Saving...' : (
                <>
                    <Save className="w-5 h-5" />
                    Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
