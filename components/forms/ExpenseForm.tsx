'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createExpense, getWeekStart, getDocumentId } from '@/lib/firestore';
import { useImageUpload } from '@/hooks/useImageUpload';

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
  const { uploadReceipt, isUploading } = useImageUpload();
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [note, setNote] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen');
      return;
    }

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setReceiptFile(file);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      // Generar ID del expense y subir foto si existe
      let receipt_url = null;
      if (receiptFile) {
        const expenseId = getDocumentId('expenses');
        receipt_url = await uploadReceipt(receiptFile, expenseId);
      }

      await createExpense({
        paidBy: user.uid,
        amount: amountValue,
        concept: concept.trim(),
        weekStart,
        createdAt: new Date(),
        note: note.trim() || null,
        receipt_url,
      });

      // Mostrar animación de éxito
      setShowSuccess(true);

      // Reset campos después de un momento
      setTimeout(() => {
        setAmount('');
        setConcept('');
        setNote('');
        setShowNoteField(false);
        setReceiptFile(null);
        setReceiptPreview(null);
        setShowSuccess(false);
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
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

      {/* Campo de nota opcional */}
      <div className="mt-3">
        {!showNoteField ? (
          <button
            type="button"
            onClick={() => setShowNoteField(true)}
            className="text-sm text-[#8E887B] hover:text-[#C8FF4D] transition-colors"
            disabled={isLoading || showSuccess}
          >
            + Añadir nota
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 140))}
              placeholder="Contexto opcional (ej: era el cumpleaños de tu madre)"
              className="input-text w-full h-20 resize-none text-sm"
              maxLength={140}
              disabled={isLoading || showSuccess}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#6B6759]">{note.length}/140</span>
              <button
                type="button"
                onClick={() => { setShowNoteField(false); setNote(''); }}
                className="text-xs text-[#6B6759] hover:text-[#8E887B]"
                disabled={isLoading || showSuccess}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón de foto de ticket */}
      <div className="flex justify-end mb-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReceiptChange}
          className="hidden"
          disabled={isLoading || showSuccess}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-[#8E887B] hover:text-[#C8FF4D] transition-colors flex items-center gap-1"
          disabled={isLoading || showSuccess}
        >
          📷 Adjuntar ticket
        </button>
      </div>

      {/* Preview de la imagen */}
      {receiptPreview && (
        <div className="relative bg-[#211F18] border border-[#302D24] rounded-2xl p-4 mb-4">
          <img
            src={receiptPreview}
            alt="Vista previa del ticket"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={handleRemoveReceipt}
            className="absolute top-2 right-2 w-8 h-8 bg-[#211F18] border border-[#302D24] text-white rounded-full flex items-center justify-center hover:text-[#C8FF4D] transition-colors"
            disabled={isLoading || showSuccess}
          >
            ×
          </button>
        </div>
      )}

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
