import React, { useState, useEffect } from "react";
import PageWrapper from "../../components/common/PageWrapper";
import config from "../../config/api.js";
import currencyManager from "../../utils/currency.js";

export default function CurrencySettings() {
  const [currencies, setCurrencies] = useState([]);
  const [currentCurrency, setCurrentCurrency] = useState('NGN');
  const [displayFormat, setDisplayFormat] = useState('symbol_amount');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    currency_code: '',
    currency_name: '',
    currency_symbol: ''
  });

  useEffect(() => {
    fetchCurrencySettings();
  }, []);

  const fetchCurrencySettings = async () => {
    setLoading(true);
    setError(null);
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
        setCurrencies(data.currencies);
        setCurrentCurrency(data.current_currency);
        setDisplayFormat(data.display_format);
      } else {
        // If API fails, show a helpful message about setting up the database
        if (data.error && data.error.includes('Table') && data.error.includes("doesn't exist")) {
          setError('Currency database tables not found. Please run the SQL script first: currency-settings.sql');
        } else {
          setError('Error fetching currency settings: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      setError('Error fetching currency settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultCurrency = async (currencyCode) => {
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
        setCurrentCurrency(currencyCode);
        // Update the currency manager
        await currencyManager.updateCurrency(currencyCode);
        // Refresh the currency manager data
        await currencyManager.initialize();
        alert('Default currency updated successfully! Changes will apply across the entire application.');
      } else {
        alert('Failed to update currency: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating currency: ' + error.message);
    }
  };

  const handleSetDisplayFormat = async (format) => {
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
        setDisplayFormat(format);
        // Update the currency manager
        await currencyManager.updateDisplayFormat(format);
        // Refresh the currency manager data
        await currencyManager.initialize();
        alert('Display format updated successfully! Changes will apply across the entire application.');
      } else {
        alert('Failed to update display format: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating display format: ' + error.message);
    }
  };

  const handleToggleCurrency = async (currencyId, isActive) => {
    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.currency), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'toggle_currency',
          currency_id: currencyId,
          is_active: !isActive
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCurrencies(prev => prev.map(currency => 
          currency.id === currencyId ? { ...currency, is_active: !isActive } : currency
        ));
        alert('Currency status updated successfully');
      } else {
        alert('Failed to update currency status: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating currency status: ' + error.message);
    }
  };

  const handleAddCurrency = async () => {
    if (!newCurrency.currency_code || !newCurrency.currency_name || !newCurrency.currency_symbol) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(config.getUrl(config.endpoints.admin.currency), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'add_currency',
          ...newCurrency
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Currency added successfully');
        setNewCurrency({ currency_code: '', currency_name: '', currency_symbol: '' });
        setShowAddModal(false);
        fetchCurrencySettings();
      } else {
        alert('Failed to add currency: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error adding currency: ' + error.message);
    }
  };

  const formatCurrencyPreview = (currency) => {
    const amount = 150000;
    switch (displayFormat) {
      case 'symbol_amount':
        return `${currency.currency_symbol}${amount.toLocaleString()}`;
      case 'amount_symbol':
        return `${amount.toLocaleString()}${currency.currency_symbol}`;
      case 'code_amount':
        return `${amount.toLocaleString()} ${currency.currency_code}`;
      default:
        return `${currency.currency_symbol}${amount.toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading currency settings...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          {error.includes('database tables not found') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Open phpMyAdmin</li>
                <li>Select the 'roomio' database</li>
                <li>Go to the SQL tab</li>
                <li>Copy and paste the contents of 'currency-settings.sql'</li>
                <li>Click 'Go' to execute the SQL</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">💰 Currency Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchCurrencySettings}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ➕ Add Currency
          </button>
        </div>
      </div>

      {/* Current Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Current Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <select
              value={currentCurrency}
              onChange={(e) => setCurrentCurrency(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.filter(c => c.is_active).map(currency => (
                <option key={currency.currency_code} value={currency.currency_code}>
                  {currency.currency_symbol} {currency.currency_name} ({currency.currency_code})
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSetDefaultCurrency(currentCurrency)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              💾 Save Default Currency
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Format</label>
            <select
              value={displayFormat}
              onChange={(e) => setDisplayFormat(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="symbol_amount">Symbol + Amount (₦150,000)</option>
              <option value="amount_symbol">Amount + Symbol (150,000₦)</option>
              <option value="code_amount">Amount + Code (150,000 NGN)</option>
            </select>
            <button
              onClick={() => handleSetDisplayFormat(displayFormat)}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              💾 Save Display Format
            </button>
          </div>
        </div>
        
        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Live Preview:</h4>
          <div className="text-lg font-semibold">
            {formatCurrencyPreview(currencies.find(c => c.currency_code === currentCurrency) || { currency_symbol: '₦', currency_code: 'NGN' })}
          </div>
          <p className="text-sm text-gray-500 mt-1">This is how currency will appear across the application</p>
        </div>
      </div>

      {/* Currency List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Available Currencies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencies.map((currency) => (
                <tr key={currency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{currency.currency_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{currency.currency_symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{currency.currency_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      currency.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {currency.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {currency.is_default && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {formatCurrencyPreview(currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!currency.is_default && (
                        <button
                          onClick={() => handleSetDefaultCurrency(currency.currency_code)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 px-2 py-1 rounded text-xs"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleCurrency(currency.id, currency.is_active)}
                        className={`px-2 py-1 rounded text-xs ${
                          currency.is_active 
                            ? 'text-red-600 hover:text-red-900 bg-red-100' 
                            : 'text-green-600 hover:text-green-900 bg-green-100'
                        }`}
                      >
                        {currency.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">Add New Currency</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={newCurrency.currency_code}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, currency_code: e.target.value.toUpperCase() }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., USD"
                    maxLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency Name</label>
                  <input
                    type="text"
                    value={newCurrency.currency_name}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, currency_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., US Dollar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={newCurrency.currency_symbol}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, currency_symbol: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., $"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCurrency({ currency_code: '', currency_name: '', currency_symbol: '' });
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCurrency}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Currency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
