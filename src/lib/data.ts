// 🐝 [HIVE_SWARM_STAMP] Autonomously Audited by Lukas Swarm
import { LucideIcon } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'Sports' | 'Woven' | 'Sets' | 'Events' | 'All';
  image: string;
  badge?: string | null;
  badgeColor?: string;
  rotation: string;
}

export const PRODUCTS: Product[] = [
  { id: 1, name: 'The "Court Side" Custom', price: 12.00, category: 'Sports', image: 'https://i.postimg.cc/GT8fy3KT/1473986136160.jpg', badge: 'FEATURED', badgeColor: 'bg-purple-600', rotation: '-1deg' },
  { id: 2, name: 'Galaxy Braid Wristlet', price: 15.00, category: 'Woven', image: 'https://i.postimg.cc/3WdV69TF/1000012195.jpg', badge: 'NEW', badgeColor: 'bg-indigo-600', rotation: '2deg' },
  { id: 3, name: 'Midnight "MAMA" Series', price: 10.00, category: 'Woven', image: 'https://i.postimg.cc/rzK3bgkg/1000012197.jpg', badge: null, rotation: '-2deg' },
  { id: 4, name: 'Team Spirit Bulk Pack', price: 45.00, category: 'Sets', image: 'https://i.postimg.cc/V0rhCsRh/20180707-193545.jpg', badge: 'BUNDLE', badgeColor: 'bg-pink-600', rotation: '1deg' },
  { id: 5, name: 'Vibrant Red Weave', price: 8.00, category: 'Woven', image: 'https://i.postimg.cc/ZvBQdYH0/1000012019.jpg', badge: null, rotation: '-1deg' },
  { id: 6, name: 'The "DIDI" Special', price: 10.00, category: 'Woven', image: 'https://i.postimg.cc/GT8fy3K8/1000012138.jpg', badge: 'CUSTOM', badgeColor: 'bg-rose-600', rotation: '2deg' },
  { id: 7, name: 'Pastel & Pink', price: 12.00, category: 'Woven', image: 'https://i.postimg.cc/Dm8HD5Tg/1529285017581-529.jpg', badge: null, rotation: '-1.5deg' },
  { id: 8, name: 'Duo Sets', price: 18.00, category: 'Sets', image: 'https://i.postimg.cc/hz3wvQLn/20180605-225108.jpg', badge: 'DUO', badgeColor: 'bg-amber-600', rotation: '1.5deg' },
  { id: 9, name: 'Coach & Grad Gifts', price: 12.00, category: 'Events', image: 'https://i.postimg.cc/WFfKzqGP/20180228-134138.jpg', badge: 'GIFT', badgeColor: 'bg-emerald-600', rotation: '-0.5deg' },
];
