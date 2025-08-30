// emailTemplate.js
export const reset = (resetCode) => {
  const year = new Date().getFullYear();

  return `
  <!DOCTYPE html>
  <html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Password Reset</title>
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
      .code-box {
        display: inline-block;
        padding: 15px 30px;
        margin: 20px 0;
        background-color: #09100d;
        color: #f57cff;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 3px;
        border-radius: 6px;
        text-align: center;
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
      .warning {
        color: #ff6b6b;
        font-size: 14px;
        margin-top: 25px;
      }
      @media (max-width: 600px) {
        .content {
          font-size: 14px;
        }
        .header h1 {
          font-size: 22px;
        }
        .code-box {
          padding: 12px 20px;
          font-size: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      
      <!-- Header -->
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>
          We received a request to reset your PunterHub password. Use the reset code below to create a new password.
        </p>
        
        <div class="code-box">${resetCode}</div>
        
        <p>
          This code will expire in 10 minutes for security reasons.
        </p>
        
        <p>
          If you didn't request this reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <p class="warning">
          For your security, never share this code with anyone. PunterHub staff will never ask for this code.
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
