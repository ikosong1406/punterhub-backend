// emailTemplate.js
export const welcomeTemplate = (firstname, promoCode) => {
  const year = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome Email</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #09100d;
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #162821;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        padding: 20px;
        text-align: center;
        background-color: #09100d;
      }
      .header h1 {
        color: #fea92a;
        font-size: 28px;
        margin: 0;
      }
      .content {
        padding: 20px;
        color: #efefef;
        font-size: 16px;
        line-height: 1.6;
      }
      .highlight {
        color: #18ffc8;
        font-weight: bold;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        margin-top: 20px;
        background-color: #fea92a;
        color: #09100d;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      }
      .footer {
        padding: 15px;
        text-align: center;
        font-size: 12px;
        color: #376553;
        background-color: #09100d;
      }
      @media (max-width: 600px) {
        .content {
          font-size: 14px;
        }
        .header h1 {
          font-size: 22px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      
      <!-- Header -->
      <div class="header">
        <h1>Welcome to PunterHub</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>Hi <span class="highlight">${firstname}</span>,</p>
        <p>
          We’re excited to have you join our community of passionate punters and sports lovers. 
          Your account has been created successfully, and your journey starts now!
        </p>
        <p>
          Your unique promo code is: <span style="color:#f57cff; font-weight:bold;">${promoCode}</span>  
          Share this with friends to earn bonuses every time they sign up.
        </p>
        <p>
          Click below to log in and start exploring.
        </p>
        <a href="https://your-dashboard-url.com" class="button">Go to Dashboard</a>
        <p style="margin-top: 30px;">
          Need help? Just reply to this email — we’re here for you.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        &copy; ${year} PunterHub. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};
