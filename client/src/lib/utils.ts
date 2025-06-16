import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  // Simple phone formatting for Australian numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function getSearchTermColor(searchTerm: string): string {
  const colors = {
    'coffee shops': 'bg-purple-500',
    'chiropractors': 'bg-green-600',
    'Black Friday deals': 'bg-orange-600',
    'tutoring services': 'bg-blue-600',
  };
  return colors[searchTerm as keyof typeof colors] || 'bg-gray-500';
}

export function getPlatformBadges(platforms: string): Array<{name: string, color: string}> {
  const platformList = platforms.split(', ').map(p => p.trim());
  const badges = [];
  
  for (const platform of platformList) {
    switch (platform.toLowerCase()) {
      case 'facebook':
        badges.push({ name: 'Facebook', color: 'bg-blue-100 text-blue-800' });
        break;
      case 'instagram':
        badges.push({ name: 'Instagram', color: 'bg-pink-100 text-pink-800' });
        break;
      case 'messenger':
        badges.push({ name: 'Messenger', color: 'bg-gray-100 text-gray-800' });
        break;
      case 'audience_network':
        badges.push({ name: 'Audience Network', color: 'bg-indigo-100 text-indigo-800' });
        break;
      case 'threads':
        badges.push({ name: 'Threads', color: 'bg-slate-100 text-slate-800' });
        break;
      default:
        badges.push({ name: platform, color: 'bg-gray-100 text-gray-800' });
    }
  }
  
  return badges;
}

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
