// Utilidades varias

// Importe en formato español SIN el símbolo (lo añade el componente con un espacio): "34,50"
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Emoji según el concepto del gasto (usa el mismo set que los chips del formulario)
const CATEGORY_EMOJI: Record<string, string> = {
  'súper': '🛒', 'super': '🛒',
  'restaurante': '🍽️',
  'gasolina': '⛽',
  'farmacia': '💊',
  'ocio': '🍿',
  'café': '☕', 'cafe': '☕',
};

export function conceptEmoji(concept: string): string {
  return CATEGORY_EMOJI[concept.trim().toLowerCase()] ?? '🧾';
}

export function formatDate(date: Date | any): string {
  if (!date) return '';

  // Si es un Timestamp de Firestore, convertir a Date
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }

  if (!(date instanceof Date)) {
    return String(date);
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(date: Date | any): string {
  if (!date) return '';

  // Si es un Timestamp de Firestore, convertir a Date
  if (date && typeof date.toDate === 'function') {
    date = date.toDate();
  }

  if (!(date instanceof Date)) {
    return String(date);
  }

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'ahora mismo';
  if (minutes < 60) return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;

  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
