'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createExpense, getWeekStart } from '@/lib/firestore';

const SUGGESTIONS = [
  { emoji: '🛒', label: 'Súper' },
  { emoji: '🍽️', label: 'Restaurante' },
  { emoji: '⛽', label: 'Gasolina' },
  { emoji: '💊', label: 'Farmacia' },
  { emoji: '🍿', label: 'Ocio' },
  { emoji: '☕', label: 'Café' },
];

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus en el campo de importe
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  const handleAmountChange = (value: string) => {
    // Solo permitir números y un punto decimal
    const cleaned = value.replace(/[^\d.]/g, '');

    // Solo un punto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      parts.pop();
    }

    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      parts[1] = parts[1].slice(0, 2);
    }

    setAmount(parts.join('.'));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setConcept(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !amount || !concept) {
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return;
    }

    setIsLoading(true);

    try {
      const weekStart = getWeekStart();

      await createExpense({
        paidBy: user.uid,
        amount: amountValue,
        concept: concept.trim(),
        weekStart,
        createdAt: new Date(),
      });

      // Mostrar animación de éxito
      setShowSuccess(true);

      // Reset campos después de un momento
      setTimeout(() => {
        setAmount('');
        setConcept('');
        setShowSuccess(false);
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
        onSuccess?.();
      }, 1000);
    } catch (error) {
      console.error('Error al guardar gasto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de importe */}
      <div onClick={() => amountInputRef.current?.focus()} className="cursor-pointer bg-[#211F18] border border-[#302D24] rounded-3xl p-8 text-center mt-1">
        <div className="text-xs font-bold tracking-widest uppercase text-[#6B6759] mb-2">
          Importe
        </div>
        <div className="flex items-baseline justify-center gap-2">
          <span
            className={`input-amount text-6xl ${amount ? 'text-[#F4F1E8]' : 'text-[#4A483F]'}`}
          >
            {amount || '0.00'}
          </span>
          <span className="text-3xl font-bold text-[#5E5B50]">€</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#6B6759]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="16" height="18" rx="3" stroke="#6B6759" strokeWidth="1.8"/>
            <path d="M8 8h8M8 12h8M8 16h4" stroke="#6B6759" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Toca para escribir
        </div>
      </div>

      {/* Campo de concepto */}
      <div className="mt-4">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="¿En qué lo gastaste?"
          className="input-text w-full"
          maxLength={60}
          disabled={isLoading || showSuccess}
          autoFocus={amount !== ''}
        />
        <div className="text-right text-xs text-[#6B6759] mt-1">
          {concept.length}/60
        </div>
      </div>

      {/* Sugerencias rápidas */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => handleSuggestionClick(suggestion.label)}
            className={`chip ${concept === suggestion.label ? 'chip-active' : ''}`}
            disabled={isLoading || showSuccess}
          >
            {suggestion.emoji} {suggestion.label}
          </button>
        ))}
      </div>

      <div className="flex-1"></div>

      {/* Botón guardar */}
      <div className="pt-4 pb-6">
        <button
          type="submit"
          disabled={!amount || !concept || isLoading || showSuccess}
          className={`btn-primary w-full ${!amount || !concept ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            background: (!amount || !concept) ? '#252319' : '#C8FF4D',
            color: (!amount || !concept) ? '#5E5B50' : '#15140F'
          }}
        >
          {showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              ¡Guardado!
            </span>
          ) : isLoading ? (
            'Guardando...'
          ) : (
            'Guardar gasto'
          )}
        </button>
      </div>
    </form>
  );
}
