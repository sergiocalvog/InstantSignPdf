import React, { useState } from 'react';
import { X, Heart, Coffee, ExternalLink, Check, Copy, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(2);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tiers = [
    { id: 1, label: t.donationTier1Label, price: t.donationTier1Price },
    { id: 2, label: t.donationTier2Label, price: t.donationTier2Price },
    { id: 3, label: t.donationTier3Label, price: t.donationTier3Price },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with warm gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                {t.donationTitle} <Heart className="w-4 h-4 fill-white text-white" />
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                {t.donationSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm overflow-y-auto">
          <div className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">
            <p>{t.donationIntro1}</p>
            <p className="mt-2 font-medium text-zinc-800 dark:text-zinc-200">
              {t.donationIntro2}
            </p>
          </div>

          {/* Amount selector translated with respective currency */}
          <div className="grid grid-cols-3 gap-2.5">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedTier === tier.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-xs ring-2 ring-amber-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="text-xs font-semibold">{tier.label}</div>
                <div className="text-sm font-bold mt-0.5">{tier.price}</div>
              </button>
            ))}
          </div>

          {/* Direct Support Buttons */}
          <div className="space-y-2.5">
            <a
              href="https://buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-zinc-900 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <Coffee className="w-4 h-4" />
              <span>{t.donationBuyMeCoffee}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="https://paypal.me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0070BA] hover:bg-[#0070BA]/90 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t.donationPaypal}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>

          {/* Privacy Guarantee */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.donationGuarantee}</span>
          </div>

          {/* Share Alternative */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              {t.donationSharePrompt}
            </p>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.donationCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.donationCopyLink}</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-1 text-center">
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline transition-colors cursor-pointer"
            >
              {t.donationCloseBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
