import React from 'react';
import { Order, PACKAGES, PackageLevel } from '../types';
import { Trash2, Car, User, Mail, Phone, Edit } from 'lucide-react';

interface AdminOrderCardProps {
  order: Order;
  onDelete: (id: string) => void;
  onStatusUpdate: (order: Order, newStatus: Order['status']) => void;
  onEdit: (order: Order) => void;
}

export default function AdminOrderCard({ order, onDelete, onStatusUpdate, onEdit }: AdminOrderCardProps) {
  const getPackageColor = (level: PackageLevel) => {
    return PACKAGES.find(p => p.level === level)?.colorInfo.split(' ')[2] || 'text-white';
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all shadow-lg">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {/* Vehicle & Package Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPackageColor(order.package).replace('text-', 'border-').replace('text-', 'text-')}`}>
              {order.package}
            </span>
            <span className="text-xs text-zinc-500 ml-auto md:ml-0">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-zinc-400" />
            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model} 
            <span className="text-zinc-500 font-normal text-base">{order.vehicle.trim}</span>
          </h3>

          {/* Customer Info */}
          {order.customer && (
              <div className="text-sm text-zinc-400 flex flex-wrap gap-4 mt-2 mb-2">
                    <span className="flex items-center gap-1"><User className="w-4 h-4"/> {order.customer.name}</span>
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {order.customer.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {order.customer.phone}</span>
              </div>
          )}
          
          {order.jobRequest && (
            <div className="p-3 bg-zinc-950 rounded-lg text-sm text-zinc-300 border border-zinc-800/50 whitespace-pre-wrap">
              <span className="text-zinc-500 block text-xs mb-1 uppercase tracking-wider">Requests</span>
              {order.jobRequest}
            </div>
          )}
        </div>

        {/* Photo Preview */}
        {order.photoUrl && (
          <div className="w-full md:w-32 h-32 flex-shrink-0 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden md:order-last">
            <img src={order.photoUrl} alt="Vehicle" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Actions */}
        <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-4">
          <div className="flex items-center gap-2 mb-2">
              <select 
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order, e.target.value as Order['status'])}
                  className="bg-black border border-zinc-700 text-xs rounded-lg px-2 py-1 text-white focus:outline-none"
              >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
              </select>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
             <button 
                onClick={() => onEdit(order)}
                className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-colors"
                title="Edit Order"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(order.id)}
                className="p-2 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                title="Delete Order"
              >
                <Trash2 className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
