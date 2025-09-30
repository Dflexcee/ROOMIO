// Currency utility functions
import config from '../config/api.js';

class CurrencyManager {
  constructor() {
    this.currentCurrency = 'NGN';
    this.currencySymbol = '₦';
    this.displayFormat = 'symbol_amount';
    this.currencies = [];
    this.isInitialized = false;
  }

  // Initialize currency settings
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.currency), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.currencies = data.currencies;
        this.currentCurrency = data.current_currency;
        this.displayFormat = data.display_format;
        this.currencySymbol = this.currencies.find(c => c.currency_code === this.currentCurrency)?.currency_symbol || '₦';
        this.isInitialized = true;
      } else {
        // Silently fallback to default values if API fails
        this.setDefaultValues();
      }
    } catch (error) {
      // Silently fallback to default values if API fails
      console.log('Currency API not available, using defaults');
      this.setDefaultValues();
    }
  }

  // Set default currency values
  setDefaultValues() {
    this.currentCurrency = 'NGN';
    this.currencySymbol = '₦';
    this.displayFormat = 'symbol_amount';
    this.currencies = [
      { currency_code: 'NGN', currency_name: 'Nigerian Naira', currency_symbol: '₦', is_active: true, is_default: true }
    ];
    this.isInitialized = true;
  }

  // Format currency amount
  formatCurrency(amount, currencyCode = null, format = null) {
    const code = currencyCode || this.currentCurrency;
    const displayFormat = format || this.displayFormat;
    const symbol = this.currencies.find(c => c.currency_code === code)?.currency_symbol || this.currencySymbol;
    
    const formattedAmount = typeof amount === 'number' ? amount.toLocaleString() : amount;
    
    switch (displayFormat) {
      case 'symbol_amount':
        return `${symbol}${formattedAmount}`;
      case 'amount_symbol':
        return `${formattedAmount}${symbol}`;
      case 'code_amount':
        return `${formattedAmount} ${code}`;
      default:
        return `${symbol}${formattedAmount}`;
    }
  }

  // Get currency symbol
  getCurrencySymbol(currencyCode = null) {
    const code = currencyCode || this.currentCurrency;
    return this.currencies.find(c => c.currency_code === code)?.currency_symbol || this.currencySymbol;
  }

  // Get current currency
  getCurrentCurrency() {
    return this.currentCurrency;
  }

  // Get all currencies
  getCurrencies() {
    return this.currencies;
  }

  // Update currency settings
  async updateCurrency(currencyCode) {
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.currency), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'set_default_currency',
          currency_code: currencyCode
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.currentCurrency = currencyCode;
        this.currencySymbol = this.currencies.find(c => c.currency_code === currencyCode)?.currency_symbol || '₦';
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('currencyUpdated', { 
          detail: { 
            currency: currencyCode, 
            symbol: this.currencySymbol 
          } 
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating currency:', error);
      return false;
    }
  }

  // Update display format
  async updateDisplayFormat(format) {
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.currency), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'set_display_format',
          display_format: format
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        this.displayFormat = format;
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('currencyFormatUpdated', { 
          detail: { 
            format: format 
          } 
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating display format:', error);
      return false;
    }
  }
}

// Create singleton instance
const currencyManager = new CurrencyManager();

// Initialize on import
currencyManager.initialize();

export default currencyManager;
