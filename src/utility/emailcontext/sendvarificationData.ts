const APP_URL = process.env.APP_URL || "https://rishab-beta.vercel.app/auth";
const COMPANY_NAME = process.env.COMPANY_NAME || "Your Company";

const emailcontext = {
  sendVerificationData: (username: string, otp: number, subject: string) => {
    const safeUsername = username || "User";

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject}</title>
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    background:#f4f4f4;
    margin:0;
    padding:0;
  }
  .container{
    max-width:600px;
    margin:20px auto;
    background:#ffffff;
    border-radius:6px;
    overflow:hidden;
    border:1px solid #e5e5e5;
  }
  .header{
    background:#4CAF50;
    color:white;
    text-align:center;
    padding:15px;
  }
  .content{
    padding:25px;
    color:#333;
    font-size:14px;
  }
  .otp{
    font-size:28px;
    letter-spacing:6px;
    text-align:center;
    background:#f2f2f2;
    padding:12px;
    margin:20px 0;
    border-radius:5px;
    font-weight:bold;
  }
  .button{
    display:inline-block;
    padding:10px 18px;
    background:#4CAF50;
    color:#fff;
    text-decoration:none;
    border-radius:4px;
    margin-top:10px;
  }
  .footer{
    text-align:center;
    font-size:12px;
    color:#777;
    padding:15px;
    border-top:1px solid #eee;
  }
</style>
</head>

<body>
  <div class="container">

    <div class="header">
      <h2>Email Verification</h2>
    </div>

    <div class="content">
      <p>Hello <strong>${safeUsername}</strong>,</p>

      <p>Thank you for registering with our service. Please use the verification code below:</p>

      <div class="otp">${otp}</div>

      <p>This code will expire in <strong>10 minutes</strong>.</p>

      <p>If you did not request this code, you can safely ignore this email.</p>

      <p>
        <a class="button" href="${APP_URL}">
          Verify Account
        </a>
      </p>

      <p>Best regards,<br/>The Support Team</p>
    </div>

    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
`;
  },
};

export default emailcontext;