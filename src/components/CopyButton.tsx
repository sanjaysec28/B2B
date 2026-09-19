/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  disabled?: boolean;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  disabled = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (disabled || !textToCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older or restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        id="btn-copy-transcription"
        type="button"
        disabled={disabled}
        onClick={handleCopy}
        aria-label={copied ? 'Transcription copied to clipboard' : 'Copy transcription to clipboard'}
        title={copied ? 'Copied!' : 'Copy transcription'}
        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
          disabled
            ? 'opacity-35 cursor-not-allowed border-[#e2e8f0] bg-white text-[#94a3b8]'
            : copied
            ? 'border-emerald-300 bg-emerald-50/70 text-emerald-700 shadow-sm'
            : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#334155] hover:text-[#0f172a] shadow-[0_1px_2px_rgba(0,0,0,0.04)] active:scale-95'
        } ${className}`}
      >
        {copied ? (
          <Check className="w-5 h-5 text-emerald-600 transition-transform scale-110" />
        ) : (
          <Copy className="w-5 h-5 transition-transform" />
        )}
      </button>

      {/* Floating badge for feedback */}
      {copied && (
        <span
          role="status"
          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#0f172a] text-white text-[12px] font-medium rounded-md shadow-md pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
        >
          Copied
        </span>
      )}
    </div>
  );
};
