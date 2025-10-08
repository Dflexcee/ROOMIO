import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/api.js';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState({
    currency_code: 'NGN',
    currency_symbol: '₦',
    currency_name: 'Nigerian Naira'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrency();

    // Listen for currency updates from admin panel
    const handleCurrencyUpdate = (event) => {
      if (event.detail && event.detail.currency) {
        fetchCurrency(); // Refresh from API
      }
    };

    window.addEventListener('currencyUpdated', handleCurrencyUpdate);
    return () => window.removeEventListener('currencyUpdated', handleCurrencyUpdate);
  }, []);

  const fetchCurrency = async () => {
    try {
      const response = await fetch(config.getUrl('/currency/get.php'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.currency) {
          setCurrency(data.currency);
        }
      }
    } catch (error) {
      console.error('Failed to fetch currency:', error);
      // Keep default NGN currency on error
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return `${currency.currency_symbol}${Number(amount).toLocaleString()}`;
  };

  const currencySymbol = currency.currency_symbol;

  return (
    <CurrencyContext.Provider value={{ currency, loading, formatCurrency, currencySymbol, refreshCurrency: fetchCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
