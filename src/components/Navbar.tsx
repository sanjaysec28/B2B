/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onContactClick?: () => void;
  onDashboardClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onContactClick, onDashboardClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#f8fafc]/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 transition-all">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Left: Brand Logo / Name */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            id="brand-logo"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-lg"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 duration-200">
              {/* Voice glyph */}
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-white/70 rounded-full"></span>
                <span className="w-0.5 h-3 bg-white rounded-full"></span>
                <span className="w-0.5 h-2 bg-white/90 rounded-full"></span>
                <span className="w-0.5 h-1 bg-white/60 rounded-full"></span>
              </div>
            </div>
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
              Vaani
            </span>
          </a>
          <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-full">
            Tamil English Companion
          </span>
        </div>

        {/* Center: Minimal Navigation Links (Desktop) */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-600"
        >
          <a
            href="#products"
            className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md py-1"
          >
            Products
          </a>
          <a
            href="#developers"
            className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md py-1"
          >
            Developers
          </a>
          <a
            href="#resources"
            className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md py-1"
          >
            Resources
          </a>
          <a
            href="#company"
            className="transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md py-1"
          >
            Company
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            id="nav-contact-btn"
            type="button"
            onClick={onContactClick}
            className="px-3.5 py-1.5 text-[13px] font-medium text-slate-700 hover:text-slate-900 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-white active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            Contact Us
          </button>
          <button
            id="nav-dashboard-btn"
            type="button"
            onClick={onDashboardClick}
            className="px-4 py-1.5 text-[13px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            <span>Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center">
          <button
            id="mobile-menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#475569] hover:text-[#0f172a] rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e2e8f0] bg-white px-6 py-5 flex flex-col gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <a
            href="#products"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[15px] font-medium text-[#334155] hover:text-[#0f172a] py-1"
          >
            Products
          </a>
          <a
            href="#developers"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[15px] font-medium text-[#334155] hover:text-[#0f172a] py-1"
          >
            Developers
          </a>
          <a
            href="#resources"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[15px] font-medium text-[#334155] hover:text-[#0f172a] py-1"
          >
            Resources
          </a>
          <a
            href="#company"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[15px] font-medium text-[#334155] hover:text-[#0f172a] py-1"
          >
            Company
          </a>
          <div className="pt-3 border-t border-[#f1f5f9] flex flex-col sm:hidden gap-2.5">
            <button
              id="mobile-contact-btn"
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onContactClick?.();
              }}
              className="w-full py-2.5 text-center text-[14px] font-medium text-[#334155] rounded-full border border-[#e2e8f0] hover:bg-slate-50"
            >
              Contact Us
            </button>
            <button
              id="mobile-dashboard-btn"
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onDashboardClick?.();
              }}
              className="w-full py-2.5 text-center text-[14px] font-medium text-white bg-[#0f172a] rounded-full shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
