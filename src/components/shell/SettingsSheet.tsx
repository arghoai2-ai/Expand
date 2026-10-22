import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { FormSheet } from '../common/FormSheet.tsx';
import type { AppThemeMode, NumberGrouping } from '../../types/index.ts';
import { Moon, Sun, Monitor, Bell, Download, Upload, RotateCcw, DollarSign, FileCode } from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFlutterExport: () => void;
}

export function SettingsSheet({ isOpen, onClose, onOpenFlutterExport }: SettingsSheetProps) {
  const {
    settings,
    updateSettings,
    resetAllSeedData,
    exportData,
    importData,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleRequestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      showToast('Notifications are not supported in this browser environment');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        showToast('Notification permission granted!');
        new Notification('Expand Alerts Enabled', {
          body: 'You will receive reminders for delivery deadlines and payment dates.',
        });
      } else {
        showToast('Notification permission was denied or dismissed');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not request notification permission');
    }
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expand_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const success = importData(reader.result);
        if (success) onClose();
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & System Preferences"
      subtitle="Theme, currency, offline data, and notifications"
    >
      <div className="space-y-6 text-xs">
        {/* Theme Mode */}
        <div>
          <label className="block font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Appearance Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'system' as AppThemeMode, label: 'System', icon: Monitor },
              { mode: 'light' as AppThemeMode, label: 'Light', icon: Sun },
              { mode: 'dark' as AppThemeMode, label: 'Dark', icon: Moon },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateSettings({ themeMode: mode })}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  settings.themeMode === mode
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency & Number Format */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
          <label className="block font-semibold text-zinc-900 dark:text-zinc-100">
            Currency & Number Style
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Currency Symbol</span>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => updateSettings({ currencySymbol: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-center font-bold text-sm"
              />
            </div>

            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Grouping Format</span>
              <select
                value={settings.numberGrouping}
                onChange={(e) => updateSettings({ numberGrouping: e.target.value as NumberGrouping })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-medium"
              >
                <option value="lakhCrore">Lakh / Crore (1,25,000)</option>
                <option value="standard">Standard (125,000)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reminders & Notifications */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-zinc-500" />
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Delivery & Due Reminders
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Scheduled notifications for tomorrow's commitments
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.remindersEnabled}
                onChange={(e) => updateSettings({ remindersEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
            <span className="text-[11px] text-zinc-500">
              Browser alert permission: <strong className="uppercase">{notificationStatus}</strong>
            </span>
            {notificationStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestNotificationPermission}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Request Permission
              </button>
            )}
          </div>
        </div>

        {/* Backup & Restore Data */}
        <div className="space-y-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
            Offline Data Management
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <Download size={14} />
              <span>Export Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 font-medium transition-colors"
            >
              <Upload size={14} />
              <span>Restore Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          <button
            type="button"
            onClick={resetAllSeedData}
            className="w-full mt-1 p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset to realistic sample demonstration data</span>
          </button>
        </div>

        {/* Flutter / Dart Code Export Viewer */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFlutterExport();
            }}
            className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-between text-zinc-900 dark:text-zinc-100 transition-colors"
          >
            <div className="flex items-center gap-2 text-left">
              <FileCode size={16} className="text-zinc-500" />
              <div>
                <span className="font-semibold block">Flutter / Dart Source Code</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Inspect or copy compile-ready Dart files for Flutter mobile
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-zinc-400">View &rarr;</span>
          </button>
        </div>
      </div>
    </FormSheet>
  );
}
