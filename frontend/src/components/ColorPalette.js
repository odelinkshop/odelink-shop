import React, { useEffect, useMemo, useState } from 'react';

const ColorPalette = () => {
  const palettes = useMemo(
    () => [
      {
        id: 'premium_blue',
        name: 'Premium Blue',
        gradient: 'from-blue-600 to-purple-600',
        hex: '#2563eb',
        vars: {
          '--brand-1': '#2563eb',
          '--brand-2': '#9333ea',
          '--brand-3': '#db2777',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#ef4444',
          '--danger-2': '#dc2626',
          '--bg-0': '#f0f9ff',
          '--bg-1': '#ffffff',
          '--bg-2': '#f9fafb'
        }
      },
      {
        id: 'royal_purple',
        name: 'Royal Purple',
        gradient: 'from-purple-600 to-pink-600',
        hex: '#9333ea',
        vars: {
          '--brand-1': '#7c3aed',
          '--brand-2': '#9333ea',
          '--brand-3': '#db2777',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#fb7185',
          '--danger-2': '#e11d48',
          '--bg-0': '#faf5ff',
          '--bg-1': '#ffffff',
          '--bg-2': '#fdf2f8'
        }
      },
      {
        id: 'sunset_orange',
        name: 'Sunset Orange',
        gradient: 'from-orange-500 to-red-600',
        hex: '#f97316',
        vars: {
          '--brand-1': '#f97316',
          '--brand-2': '#f59e0b',
          '--brand-3': '#ef4444',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#ef4444',
          '--danger-2': '#dc2626',
          '--bg-0': '#fff7ed',
          '--bg-1': '#ffffff',
          '--bg-2': '#fff1f2'
        }
      },
      {
        id: 'emerald_green',
        name: 'Emerald Green',
        gradient: 'from-green-500 to-teal-600',
        hex: '#10b981',
        vars: {
          '--brand-1': '#10b981',
          '--brand-2': '#06b6d4',
          '--brand-3': '#14b8a6',
          '--success-1': '#10b981',
          '--success-2': '#059669',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#ef4444',
          '--danger-2': '#dc2626',
          '--bg-0': '#ecfdf5',
          '--bg-1': '#ffffff',
          '--bg-2': '#f0fdfa'
        }
      },
      {
        id: 'golden_amber',
        name: 'Golden Amber',
        gradient: 'from-amber-500 to-yellow-600',
        hex: '#f59e0b',
        vars: {
          '--brand-1': '#f59e0b',
          '--brand-2': '#ea580c',
          '--brand-3': '#ef4444',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#ef4444',
          '--danger-2': '#dc2626',
          '--bg-0': '#fffbeb',
          '--bg-1': '#ffffff',
          '--bg-2': '#fff7ed'
        }
      },
      {
        id: 'ruby_red',
        name: 'Ruby Red',
        gradient: 'from-red-500 to-pink-600',
        hex: '#ef4444',
        vars: {
          '--brand-1': '#ef4444',
          '--brand-2': '#db2777',
          '--brand-3': '#9333ea',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#ef4444',
          '--danger-2': '#dc2626',
          '--bg-0': '#fff1f2',
          '--bg-1': '#ffffff',
          '--bg-2': '#fdf2f8'
        }
      },
      {
        id: 'ocean_cyan',
        name: 'Ocean Cyan',
        gradient: 'from-cyan-500 to-blue-600',
        hex: '#06b6d4',
        vars: {
          '--brand-1': '#06b6d4',
          '--brand-2': '#2563eb',
          '--brand-3': '#7c3aed',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#ef4444',
          '--danger-2': '#dc2626',
          '--bg-0': '#ecfeff',
          '--bg-1': '#ffffff',
          '--bg-2': '#eff6ff'
        }
      },
      {
        id: 'rose_pink',
        name: 'Rose Pink',
        gradient: 'from-rose-400 to-pink-600',
        hex: '#fb7185',
        vars: {
          '--brand-1': '#fb7185',
          '--brand-2': '#db2777',
          '--brand-3': '#f59e0b',
          '--success-1': '#22c55e',
          '--success-2': '#16a34a',
          '--warning-1': '#f59e0b',
          '--warning-2': '#ea580c',
          '--danger-1': '#fb7185',
          '--danger-2': '#e11d48',
          '--bg-0': '#fff1f2',
          '--bg-1': '#ffffff',
          '--bg-2': '#fffbeb'
        }
      }
    ],
    []
  );

  const [selectedId, setSelectedId] = useState('premium_blue');

  const applyTheme = (palette) => {
    const root = document.documentElement;
    Object.entries(palette.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('odelink_theme_palette');
      const initial = palettes.find((p) => p.id === saved) || palettes[0];
      setSelectedId(initial.id);
      applyTheme(initial);
    } catch (e) {
      const initial = palettes[0];
      setSelectedId(initial.id);
      applyTheme(initial);
    }
  }, [palettes]);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 z-50 max-w-xs sm:max-w-xs">
      <h3 className="text-sm font-bold text-gray-800 mb-3">🎨 Premium Renk Paleti</h3>
      <div className="grid grid-cols-5 gap-2">
        {palettes.map((color, index) => (
          <div
            key={index}
            className="relative group"
            title={color.name}
          >
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.gradient} cursor-pointer transform transition-all duration-200 hover:scale-110 hover:rotate-3 shadow-md hover:shadow-lg`}
              style={{ backgroundColor: color.hex }}
              onClick={() => {
                setSelectedId(color.id);
                applyTheme(color);
                try {
                  localStorage.setItem('odelink_theme_palette', color.id);
                } catch (e) {
                  // ignore
                }
              }}
            />
            {selectedId === color.id && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white" />
            )}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity max-w-[160px] text-center whitespace-normal break-words">
              {color.name}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-600 text-center">
        Tıkla renkleri değiştir!
      </div>
    </div>
  );
};

export default ColorPalette;
