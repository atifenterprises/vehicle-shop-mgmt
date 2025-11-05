import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';

const BatteryInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateWarrantyEndDate = (startDate, months) => {
    if (!startDate || !months) return 'N/A';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toLocaleDateString();
  };

  const getMaxWarrantyMonths = (batteries) => {
    if (!batteries || batteries.length === 0) return 0;
    return Math.max(...batteries.map(b => parseInt(b.warrantyMonths) || 0));
  };

  useEffect(() => {
    const fetchSaleAndBatteries = async () => {
      try {
        // First fetch the sale record to get serial numbers
        const saleResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/battery-sales/${id}`);
        if (!saleResponse.ok) {
          throw new Error('Failed to fetch sale details');
        }
        const saleData = await saleResponse.json();

        // Then fetch battery details from batteries table using serial numbers
        const serialNumbers = saleData.serialNumber || [];
        if (serialNumbers.length > 0) {
          const batteriesPromises = serialNumbers.map(serial =>
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/batteries/${serial}`)
          );
          const batteriesResponses = await Promise.all(batteriesPromises);

          const batteriesData = await Promise.all(
            batteriesResponses.map(async (response, index) => {
              if (response.ok) {
                return await response.json();
              } else {
                console.warn(`Failed to fetch battery ${serialNumbers[index]}`);
                return null;
              }
            })
          );

          // Filter out null responses and combine with sale data
          const validBatteries = batteriesData.filter(b => b !== null);
          setSale({
            ...saleData,
            batteries: validBatteries
          });
        } else {
          setSale(saleData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleAndBatteries();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoice-container">
        <div className="loading">Loading invoice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoice-container">
        <div className="error">Error: {error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/batteries')}>
          Back to Batteries
        </button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="invoice-container">
        <div className="error">Sale not found</div>
        <button className="btn btn-primary" onClick={() => navigate('/batteries')}>
          Back to Batteries
        </button>
      </div>
    );
  }

  const logoSrc = `${window.location.origin}/terraLogo.svg`;

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <button className="btn btn-secondary" onClick={() => navigate('/batteries')}>
          ← Back to Batteries
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          Print Invoice
        </button>
      </div>

      <div className="invoice-content">
        <div className="header">
          <div className="header-left">
            <img src={logoSrc} alt="terraLogo.svg" style={{ height: '20px', verticalAlign: 'middle', marginRight: '5px' }} />Terra Finance
          </div>
          <div className="header-center">
            RASHMI EXPORT PVT LIMITED<br />
            Corporate Office: Stesalit Tower, GP-Block, E-2-3, 8th Floor, Sector-v, Kolkata, 700091<br />
            Compliance@terrafinance.co.jp<br />
            GSTIN/UIN No.: 10JHAPK4278Q1ZW<br />
            CIN No.: U67100WB1990KTZ0PTC049807<br />
            Dealer Name: ATIF ENTERPRISES<br />
            Paschimpally, Near SBI Bank, Kishanganj (Bihar) 855107, Mob.: 8809173140<br />
          </div>
          <div className="header-right">
            Date: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="invoice-title">
          <h1>Battery Sale Invoice</h1>
          <p>Invoice ID: #{sale.id}</p>
        </div>

        <div className="invoice-details">
          <div className="invoice-section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> {sale.customerName}</p>
            <p><strong>Mobile:</strong> {sale.customerMobile}</p>
            <p><strong>Address:</strong> {sale.customerAddress}</p>
          </div>

          <div className="invoice-section">
            <h3>Sale Details</h3>
            <p><strong>Sale Date:</strong> {new Date(sale.saleDate).toLocaleDateString()}</p>
            <p><strong>Invoice Date:</strong> {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Warranty Months:</strong> {getMaxWarrantyMonths(sale.batteries)}</p>
            <p><strong>Warranty Start Date:</strong> {sale.warrantyStartDate ? new Date(sale.warrantyStartDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Warranty End Date:</strong> {calculateWarrantyEndDate(sale.warrantyStartDate, getMaxWarrantyMonths(sale.batteries))}</p>
          </div>
        </div>

        <div className="invoice-table">
          <h3>Batteries Sold</h3>
          <table>
            <thead>
              <tr>
                <th>Sl. No.</th>
                <th>Serial Number</th>
                <th>Battery Name</th>
                <th>Battery Type</th>
                <th>Warranty (Months)</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {sale.batteries.map((battery, index) => (
                <tr key={battery.serialNumber || index}>
                  <td>{index + 1}</td>
                  <td>{battery.serialNumber}</td>
                  <td>{battery.batteryName}</td>
                  <td>{battery.batteryType}</td>
                  <td>{battery.warrantyMonths}</td>
                  <td>₹{battery.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Total Amount:</span>
            <span>₹{sale.totalAmount || 0}</span>
          </div>
          <div className="summary-row">
            <span>Paid Amount:</span>
            <span>₹{sale.paidAmount || 0}</span>
          </div>
          <div className="summary-row">
            <span>Remaining Amount:</span>
            <span>₹{sale.remainingAmount || 0}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
};

export default BatteryInvoice;
