'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { Search, Lock } from 'lucide-react';
import AdminOrderCard from '../components/AdminOrderCard';
import ConfirmModal from '../components/ConfirmModal';

import EditOrderModal from '../components/EditOrderModal';
import { supabase } from '@/lib/supabase';
import { LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      }
      setAuthLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        setError(error.message);
        setPassword('');
    }
    // If successful, onAuthStateChange will handle transition
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const res = await fetch(`/api/orders/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== deleteId));
      } else {
        alert('Failed to delete. Ensure you are logged in as admin.');
      }
    } catch (error) {
      alert('Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSaveOrder = async (updatedOrder: Order) => {
    try {
      const res = await fetch(`/api/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
      });
      
      if (res.ok) {
        setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setEditingOrder(null);
      } else {
         alert('Failed to update order. Ensure you are logged in as admin.');
      }
    } catch (error) {
      alert('Failed to save changes');
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: Order['status']) => {
    try {
      const updated = { ...order, status: newStatus };
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      
      if (res.ok) {
        setOrders(orders.map(o => o.id === order.id ? updated : o));
      } else {
         alert('Failed to update. Ensure you are logged in as admin.');
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.vehicle.make.toLowerCase().includes(filter.toLowerCase()) || 
      o.vehicle.model.toLowerCase().includes(filter.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(filter.toLowerCase()) ||
      o.id.includes(filter);
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).reverse(); 


  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center text-zinc-500 animate-pulse">Connecting...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-brand-green/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-brand-green">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-zinc-500 text-sm">Sign in with your admin usage credentials</p>
          </div>

          <div className="space-y-4">
             <input
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                }}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/50 placeholder-zinc-600"
                placeholder="Admin Email"
                required
                autoFocus
            />
            <input
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                }}
                className={`w-full bg-black border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all
                    ${error 
                        ? 'border-red-500/50 focus:ring-red-500/20' 
                        : 'border-zinc-800 focus:ring-brand-green/50'
                    }`}
                placeholder="Password"
                required
            />
            {error && (
                <div className="text-red-400 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                </div>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-brand-green text-black font-bold py-3 rounded-xl hover:bg-brand-green/90 transition-colors shadow-lg shadow-brand-green/20 disabled:opacity-50"
          >
            {isLoggingIn ? 'Signing In...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-zinc-400 hover:text-white transition-colors mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Requests Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-zinc-900 rounded-lg text-sm text-zinc-400 border border-zinc-800">
            <span className="text-white font-bold">{orders.length}</span> Total Orders
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                title="Sign Out"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </header>

      <div className="space-y-4">
        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap capitalize ${
                statusFilter === status 
                  ? 'bg-brand-green/10 text-brand-green border-brand-green/50' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search name, make, model, or ID..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 animate-pulse">Loading orders...</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500">No orders found matching your criteria</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onDelete={(id) => setDeleteId(id)}
                onStatusUpdate={handleStatusUpdate}
                onEdit={(order) => setEditingOrder(order)}
              />
            ))
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message="Are you sure you want to permanently delete this order? This action cannot be undone."
      />

      <EditOrderModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveOrder}
        order={editingOrder}
      />
    </div>
  );
}
