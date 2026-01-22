import fs from 'fs';
import path from 'path';
import { Order } from '@/app/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getOrders(): Order[] {
  if (!fs.existsSync(FILE_PATH)) {
    return [];
  }
  const fileData = fs.readFileSync(FILE_PATH, 'utf-8');
  try {
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error parsing orders file:', error);
    return [];
  }
}

export function saveOrder(order: Order): Order {
  const orders = getOrders();
  const newOrder = { ...order, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending' as const };
  orders.push(newOrder);
  fs.writeFileSync(FILE_PATH, JSON.stringify(orders, null, 2));
  return newOrder;
}

export function deleteOrder(id: string): void {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== id);
    fs.writeFileSync(FILE_PATH, JSON.stringify(filtered, null, 2));
}

export function updateOrder(updatedOrder: Order): void {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
        orders[index] = updatedOrder;
        fs.writeFileSync(FILE_PATH, JSON.stringify(orders, null, 2));
    }
}
