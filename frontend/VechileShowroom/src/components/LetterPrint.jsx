export const generateLetterHTML = (customer, company) => {
  const totalPayable = customer.emiSchedule ? customer.emiSchedule.filter(emi => emi.status === 'Overdue').reduce((sum, emi) => sum + (emi.amount + emi.overdueCharges), 0) : 0;
  const logoSrc = `${window.location.origin}/terraLogo.svg`;
  return `
    <html>
    <head>
      <title>Customer Letter</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 25px; line-height: 1.3; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .header-left { text-align: left; font-size: 18px; font-weight: bold; }
        .header-center { text-align: center; flex: 1; }
        .company-name { font-size: 20px; font-weight: bold; }
        .company-details { font-size: 11px; margin-top: 8px; }
        .date { text-align: right; margin-bottom: 15px; }
        .customer-address { margin-bottom: 15px; }
        .salutation { margin-bottom: 15px; }
        .content { margin-bottom: 15px; }
        .details { margin-left: 15px; margin-bottom: 15px; }
        .detail-row { margin-bottom: 5px; }
        .closing { margin-top: 20px; }
        .signature { margin-top: 35px; text-align: left; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 11px; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .customer-table td { word-break: break-word; }
        .amortization-table { font-size: 10px; }
        .amortization-table th, .amortization-table td { padding: 3px; }
        h4 { margin: 8px 0; font-size: 13px; }
        p { margin: 8px 0; }
        @media print {
          body { margin: 15px; font-size: 11px; }
          .amortization-table { font-size: 9px; }
          .amortization-table th, .amortization-table td { padding: 2px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div className="header-left">
            <img src={logoSrc} alt="terraLogo.svg" style={{ height: '20px', verticalAlign: 'middle', marginRight: '5px' }} />Terra Finance
          </div>
        <div class="header-center">
          RASHMI EXPORT PVT LIMITED<br>
          Corporate Office: Stesalit Tower, GP-Block, E-2-3, 8th Floor, Sector-v, Kolkata, 700091<br>
          Compliance@terrafinance.co.jp<br>
          GSTIN/UIN No.: 10JHAPK4278Q1ZW<br>
          CIN No.: U67100WB1990KTZ0PTC049807<br>
          Dealer Name: ATIF ENTERPRISES<br>
          Paschimpally, Near SBI Bank, Kishanganj (Bihar) 855107, Mob.: 8809173140<br> 
        </div>
      </div>

      <div class="date">${new Date().toLocaleDateString()}</div>

      <div class="customer-address">
        Name: ${customer.name}<br>
        ${customer.fatherName ? `S/o ${customer.fatherName}<br>` : ''}
        Address: ${customer.address}<br>
        Mobile: ${customer.mobileNo}
      </div>

      <div class="salutation">
        Dear ${customer.name},
      </div>

        <div class="content">
          <p>We are pleased to provide you with the details of your vehicle purchase and associated information.</p>

          <div class="details">
            <h4>Customer Details:</h4>
            <table class="customer-table">
              <tr>
                <td><strong>Customer ID:</strong> ${customer.customerId}</td>
                <td><strong>Date:</strong> ${customer.date}</td>
                <td><strong>Name:</strong> ${customer.name}</td>
              </tr>
              <tr>
                <td><strong>Father's Name:</strong> ${customer.fatherName}</td>
                <td><strong>Mobile No:</strong> ${customer.mobileNo}</td>
                <td><strong>CKYC No:</strong> ${customer.ckycNo}</td>
              </tr>
              <tr>
                <td colspan="3"><strong>Address:</strong> ${customer.address}</td>
              </tr>
            </table>

            <h4>Vehicle Details:</h4>
            <table class="customer-table">
              <tr>
                <td><strong>Vehicle Number:</strong> ${customer.vehicleNumber}</td>
                <td><strong>Engine Number:</strong> ${customer.engineNumber}</td>
                <td><strong>Make:</strong> ${customer.make}</td>
              </tr>
              <tr>
                <td><strong>Model:</strong> ${customer.model}</td>
                <td><strong>Chassis Number:</strong> ${customer.chassisNumber}</td>
                <td><strong>Registration Number:</strong> ${customer.regnNumber}</td>
              </tr>
              <tr>
                <td><strong>Battery Serial Number:</strong> ${customer.batterySerialNumber || 'N/A'}</td>
                <td><strong>Battery Count:</strong> ${customer.batteryCount || 'N/A'}</td>
                <td><strong>Ex-showroom Price:</strong> ₹${customer.exShowroomPrice}</td>
              </tr>
              <tr>
                <td><strong>Color:</strong> ${customer.color || 'N/A'}</td>
                <td><strong>Tool Kit:</strong> ${customer.toolKit || 'N/A'}</td>
                <td><strong>Battery Type:</strong> ${customer.batteryType || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Vehicle Charger Type:</strong> ${customer.vehicleChargerName || 'N/A'}</td>
                <td><strong>Sale Date:</strong> ${customer.saleDate || 'N/A'}</td>
              </tr>
            </table>

            <h4>Sales Details:</h4>
            <table class="customer-table">
              ${customer.saleType?.toLowerCase() === 'finance' ? `
                <tr>
                  <td><strong>Loan Number:</strong> ${customer.loanNumber}</td>
                  <td><strong>Sanction Amount:</strong> ₹${customer.totalAmount}</td>
                  <td><strong>Down Payment:</strong> ₹${customer.downPayment}</td>
                </tr>
                <tr>
                  <td><strong>Loan Amount:</strong> ₹${customer.loanAmount}</td>
                  <td><strong>Tenure:</strong> ${customer.tenure} months</td>
                  <td><strong>Sale Date:</strong> ${customer.saleDate}</td>
                </tr>
                <tr>
                  <td><strong>First EMI Date:</strong> ${customer.firstEmiDate}</td>
                  <td><strong>EMI Amount:</strong> ₹${customer.emiAmount}</td>
                  <td><strong>Loan Status:</strong> ${customer.salesStatus}</td>
                </tr>
              ` : customer.saleType?.toLowerCase() === 'cash' ? `
                <tr>
                  <td><strong>Total Amount:</strong> ₹${customer.totalAmount}</td>
                  <td><strong>Paid Amount:</strong> ₹${customer.paidAmount}</td>
                  <td><strong>Remaining Amount:</strong> ₹${customer.totalAmount - customer.paidAmount}</td>
                </tr>
                <tr>
                  <td><strong>Sale Date:</strong> ${customer.saleDate}</td>
                  <td><strong>Promised Payment Date:</strong> ${customer.promisedPaymentDate}</td>
                  <td><strong>Payment Status:</strong> ${customer.salesStatus}</td>
                </tr>
                ${(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const promisedDate = new Date(customer.promisedPaymentDate);
                  promisedDate.setHours(0, 0, 0, 0);
                  if (promisedDate < today) {
                    const remaining = parseFloat(customer.totalAmount) - parseFloat(customer.paidAmount);
                    const daysOverdue = Math.floor((today - promisedDate) / (1000 * 60 * 60 * 24));
                    const interest = Math.round(remaining * 0.175 / 365 * daysOverdue);
                    const total = remaining + interest;
                    return `
                <tr>
                  <td><strong>Interest (17.5% p.a. on Remaining for ${daysOverdue} days):</strong> ₹${interest} + Remaining ₹${remaining} = Total ₹${total}</td>
                  <td colspan="2"></td>
                </tr>
                `;
                  }
                  return '';
                })()}
              ` : ''}
            </table>

            ${customer.saleType?.toLowerCase() === 'finance' ? `
              <h4>EMI Amortization Schedule:</h4>
              <table class="amortization-table">
                <thead>
                  <tr>
                    <th>EMI No</th>
                    <th>Due Date</th>
                    <th>EMI Amount</th>
                    <th>Balance</th>
                    <th>Bucket</th>
                    <th>Overdue Charges</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${customer.emiSchedule && customer.emiSchedule.length > 0 ? customer.emiSchedule.map((emi, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${emi.date || ''}</td>
                      <td>₹${emi.amount || 0}</td>
                      <td>₹${emi.balance || 0}</td>
                      <td>${emi.bucket || 0}</td>
                      <td>₹${emi.overdueCharges || 0}</td>
                      <td>₹${(emi.amount + emi.overdueCharges) || 0}</td>
                      <td>${emi.status || 'Due'}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="10">No EMI schedule available</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="text-align: right; font-weight: bold;">Total Payable for Overdue EMIs:</td>
                    <td style="font-weight: bold;">₹${customer.emiSchedule ? customer.emiSchedule.filter(emi => emi.status === 'Overdue').reduce((sum, emi) => sum + (emi.amount + emi.overdueCharges), 0) : 0}</td>
                    <td colspan="5"></td>
                  </tr>
                </tfoot>
              </table>
            ` : ''}
          </div>

          <p>If you have any questions or require further assistance, please contact us.</p>
        </div>

      <div class="closing">
        Best Regards,<br>
        ${company.name}
      </div>

      <div class="signature">
        ___________________________<br>
        Authorized Signatory
      </div>
    </body>
    </html>
  `;
};
