import React, { useState, useEffect } from 'react';
import { X, User, IdCard, Calendar, MapPin, Save, Check } from 'lucide-react';
import { UserDataPresets } from '../types';
import { StorageService } from '../services/storage';
import { useI18n } from '../i18n/I18nContext';

interface UserDataPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePresets: (presets: UserDataPresets) => void;
}

export const UserDataPresetsModal: React.FC<UserDataPresetsModalProps> = ({
  isOpen,
  onClose,
  onSavePresets,
}) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<UserDataPresets>(StorageService.getPresets());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(StorageService.getPresets());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePresets(formData);
    onSavePresets(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {t.presetsModalTitle}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.presetsModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              {t.presetsFullNameLabel}:
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder={t.presetsFullNamePlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-zinc-400" />
              {t.presetsIdLabel}:
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              placeholder={t.presetsIdPlaceholder}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              {t.presetsDateFormatLabel}:
            </label>
            <select
              value={formData.dateFormat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateFormat: e.target.value as UserDataPresets['dateFormat'],
                })
              }
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 cursor-pointer"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 04/10/2026)</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 04-10-2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO: 2026-10-04)</option>
              <option value="LONG_ES">
                {t.presetsDateFormatLabel} (e.g. {new Date().toLocaleDateString(t.presetsSaveBtn === 'Guardar mis datos' ? 'es-ES' : t.presetsSaveBtn === '保存我的信息' ? 'zh-CN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })})
              </option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              {t.presetsCancelBtn}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.sigSaveBtn}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t.presetsSaveBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
