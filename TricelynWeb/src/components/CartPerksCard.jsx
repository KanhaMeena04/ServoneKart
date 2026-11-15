import React, { useState } from 'react';
import { Heart, HeartHandshake, Info, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const TIP_OPTIONS = [
  { label: 'Not Now', value: 0 },
  { label: '₹10', value: 10 },
  { label: '₹20', value: 20 },
  { label: '₹30', value: 30 },
  { label: '₹50', value: 50 },
];

const CartPerksCard = ({ className = '' }) => {
  const { 
    donationAmount, 
    toggleDonation, 
    setDonationAmount, 
    riderTip, 
    setRiderTip 
  } = useCart();

  const [showDonationInfo, setShowDonationInfo] = useState(false);

  const isDonationChecked = donationAmount > 0;

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* ============================================================
          1. ORPHAN CHILDREN EDUCATION DONATION CARD
          (Matches Screenshot 2: "Feeding India donation" replaced with 
          "Orphan Children Education donation")
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs hover:border-amber-300 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Peach / Amber Heart Badge (Matches Screenshot 2) */}
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] border border-[#FFE2CC] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <span className="text-lg">🧡</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
                  Orphan Children Education donation
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">
                Working towards education, meals & healthcare for underprivileged orphan children...{' '}
                <button
                  type="button"
                  onClick={() => setShowDonationInfo(!showDonationInfo)}
                  className="text-gray-700 underline font-semibold hover:text-[#0B3EDB]"
                >
                  {showDonationInfo ? 'less' : 'read more'}
                </button>
              </p>

              {showDonationInfo && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[10px] text-amber-900 leading-relaxed animate-in fade-in">
                  100% of your ₹1 contribution directly funds school textbooks, notebook kits, and nutritious meals for partner child care foundations across India.
                </div>
              )}
            </div>
          </div>

          {/* ₹1 Amount + Checkbox (Matches Screenshot 2) */}
          <div 
            onClick={() => toggleDonation(1)}
            className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 pt-0.5"
          >
            <span className="text-xs sm:text-sm font-black text-gray-900">₹1</span>
            <div 
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isDonationChecked 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              {isDonationChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. TIP YOUR DELIVERY PARTNER CARD
          (Matches Screenshot 2: "Tip your delivery partner")
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
            Tip your delivery partner
          </h4>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">
            Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
          </p>
        </div>

        {/* Tip Pills / Options */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {TIP_OPTIONS.map((opt) => {
            const isSelected = (riderTip === opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRiderTip(opt.value)}
                className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#0B3EDB] text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CartPerksCard;
