export const generateLetterHTML = (customer, company) => {
  return `
    <html>
    <head>
      <title>Customer Letter</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 25px; line-height: 1.3; font-size: 13px; }
        .header { text-align: center; margin-bottom: 20px; }
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
        <div class="company-name">${company.name}</div>
        <div class="company-details">
          ${company.address}<br>
          Phone: ${company.phone} | Email: ${company.email}
        </div>
      </div>

      <div class="date">${new Date().toLocaleDateString()}</div>

      <div class="customer-address">
        ${customer.name}<br>
        ${customer.fatherName ? `S/o ${customer.fatherName}<br>` : ''}
        ${customer.address}<br>
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
                <td colspan="3"><strong>Ex-showroom Price:</strong> ₹${customer.exShowroomPrice}</td>
              </tr>
            </table>

            <h4>Sales Details:</h4>
            <table class="customer-table">
              <tr>
                <td colspan="3"><strong>Sale Type:</strong> ${customer.saleType}</td>
              </tr>
              ${customer.saleType?.toLowerCase() === 'finance' ? `
                <tr>
                  <td><strong>Loan Number:</strong> ${customer.loanNumber}</td>
                  <td><strong>Sanction Amount:</strong> ₹${customer.sanctionAmount}</td>
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
                  <td><strong>Loan Status:</strong> ${customer.loanStatus}</td>
                </tr>
                <tr>
                  <td colspan="3"><strong>Next EMI Date:</strong> ${customer.nextEmiDate}</td>
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
                  <td><strong>Payment Status:</strong> ${customer.loanStatus}</td>
                </tr>
              ` : ''}
            </table>

            ${customer.saleType?.toLowerCase() === 'finance' ? `
              <h4>EMI Amortization Schedule:</h4>
              <table class="amortization-table">
                <thead>
                  <tr>
                    <th>EMI No</th>
                    <th>Due Date</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>EMI Amount</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  ${customer.emiSchedule && customer.emiSchedule.length > 0 ? customer.emiSchedule.map((emi, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${emi.dueDate || ''}</td>
                      <td>₹${emi.principal || 0}</td>
                      <td>₹${emi.interest || 0}</td>
                      <td>₹${emi.amount || 0}</td>
                      <td>₹${emi.balance || 0}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="6">No EMI schedule available</td></tr>'}
                </tbody>
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
