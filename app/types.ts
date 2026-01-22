export type PackageLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Custom';

export interface VehicleInfo {
  year: string;
  make: string;
  model: string;
  trim: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  createdAt: string;
  package: PackageLevel;
  customer: CustomerInfo;
  vehicle: VehicleInfo;
  jobRequest?: string;
  photoUrl?: string; // base64 or url
  status: 'pending' | 'completed' | 'cancelled';
}

export const PACKAGES: { level: PackageLevel; features: string[]; colorInfo: string; imageUrl: string }[] = [
  {
    level: 'Bronze',
    features: ['18" Hood', '18" Fenders', 'Mirrors'],
    colorInfo: 'border-bronze shadow-[0_0_15px_rgba(205,127,50,0.3)] text-bronze',
    imageUrl: '/images/bronze-diagram.png'
  },
  {
    level: 'Silver',
    features: ['18" Hood', '18" Fenders', 'Front Bumper', 'Headlights', 'Mirrors'],
    colorInfo: 'border-silver shadow-[0_0_15px_rgba(192,192,192,0.3)] text-silver',
    imageUrl: '/images/silver-diagram.png'
  },
  {
    level: 'Gold',
    features: ['Full Hood', 'Full Fenders', 'Front Bumper', 'Headlights', 'Mirrors'],
    colorInfo: 'border-gold shadow-[0_0_15px_rgba(255,215,0,0.3)] text-gold',
    imageUrl: '/images/gold-diagram.png'
  },
  {
    level: 'Platinum',
    features: ['Full Front End', 'Rocker Panels', 'A-Pillars', 'Roof Strip'],
    colorInfo: 'border-platinum shadow-[0_0_15px_rgba(229,228,226,0.3)] text-platinum',
    imageUrl: '/images/platinum-diagram.png'
  },
  {
    level: 'Diamond',
    features: ['Full Vehicle Protection'],
    colorInfo: 'border-diamond shadow-[0_0_15px_rgba(185,242,255,0.3)] text-diamond',
    imageUrl: '/images/diamond-diagram.png'
  },
  {
    level: 'Custom',
    features: ['Tailored to your needs'],
    colorInfo: 'border-zinc-500 shadow-[0_0_15px_rgba(161,161,170,0.3)] text-zinc-300',
    imageUrl: ''
  }
];
