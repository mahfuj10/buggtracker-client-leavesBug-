const OTP_TEMPLATE = (otp) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeavesBug OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
        }
        .otp-box {
            display: flex;
            justify-content: center;
            column-gap: 10px;
        }
        .otp-box input {
            border: none;
            outline: none;
            background-color: transparent;
            font-size: 18px;
            width: 40px;
            text-align: center;
            border: 2px solid #333;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 20px;
        }
        .instructions {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
            text-align: center;
        }
        .app-name {
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OTP</h1>
        </div>
        <div class="otp-box">
            <input type="text" value=${otp.slice(0,1)} readonly>
            <input type="text" value=${otp.slice(1,2)} readonly>
            <input type="text" value=${otp.slice(2,3)} readonly>
            <input type="text" value=${otp.slice(3,4)} readonly>
            <input type="text" value=${otp.slice(4,5)} readonly>
        </div>
        <div class="instructions">
            Please use the OTP <b>${otp}</b> above to verify your account on <span class="app-name">LeavesBug</span>.
        </div>
    </div>
</body>
</html>
`;
const OTP_TEMPLATE_SUBJECT = '🔑 OTP for LeavesBug Account Creation 🌿';

const WElCOME_TEMPLATE = (name) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to LeavesBug</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 20px 0; text-align: center;">
                <img src="https://tse2.mm.bing.net/th/id/OIG2.TNsD34rBnNif_vxI1gY8?pid=ImgGn" alt="LeavesBug Logo" width="150">
            </td>
        </tr>
        <tr>
            <td style="padding: 20px;">
                <h2 style="color: #333333;">Welcome to LeavesBug!</h2>
                <p style="color: #666666;">Hello <strong>${name}</strong>,</p>
                <p style="color: #666666;">We're excited to welcome you to LeavesBug, your ultimate bug tracking platform. With LeavesBug, you can easily manage and track bugs, collaborate with your team, and ensure the quality of your software projects.</p>
                <p style="color: #666666;">Get started now and experience the power of LeavesBug!</p>
                <p style="color: #666666;">Best Regards,<br>The LeavesBug Team</p>
            </td>
        </tr>
    </table>

</body>
</html>
`;

const WElCOME_TEMPLATE_SUBJECT  = '🎉 Welcome to LeavesBug - Your Ultimate Bug Tracking Platform 🐛';

const TEAM_INVITATION_TEMPLATE = (SENDER_IMAGE_URL, SENDER_NAME, SENDER_EMAIL, REDIRECT_LINK) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            width: 150px; /* Adjust size as needed */
            height: auto;
        }
        .sender-info {
            margin-bottom: 20px;
        }
        .sender-info img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 10px;
            vertical-align: middle;
        }
        .sender-info span {
            vertical-align: middle;
            font-weight: bold;
        }
        .invitation-text {
            margin-bottom: 20px;
        }
        .invitation-button {
            text-align: center;
        }
        .invitation-button a {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://tse2.mm.bing.net/th/id/OIG2.TNsD34rBnNif_vxI1gY8?pid=ImgGn" alt="LeavesBug Logo">
        </div>
        <div class="header">
            <h2>You're Invited to Join Our Team!</h2>
        </div>
        <div class="sender-info">
            <img src=${SENDER_IMAGE_URL} alt="Sender Image">
            <span>${SENDER_NAME} - (${SENDER_EMAIL})</span>
        </div>
        <div class="invitation-text">
            <p>Hello,</p>
            <p>You have been invited to join our team. We believe your skills and expertise will be valuable in achieving our goals.</p>
            <p>Click the button below to accept the invitation and join our team.</p>
        </div>
        <div class="invitation-button">
            <a href=${REDIRECT_LINK}>Accept Invitation</a>
        </div>
    </div>
</body>
</html>`;

const TEAM_INVITATION_SUBJECT = '📨 Invitation: Join Our Team 🌱';

const TEAM_DELETE_CONFIRMATION_TEMPLATE = (team_name, creator_name, creator_email) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Deletion Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">

    <!-- Header -->
    <header style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 28px; color: #007bff;">🚀 Team Deleted Successfully! 🎉</h1>
    </header>

    <!-- Success Emoji -->
    <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 50px;">✅</span>
    </div>

    <!-- Confirmation Message -->
    <div style="background-color: #fff; border-radius: 5px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <p style="text-align: center; font-size: 16px;">Hey there,</p>
        <p style="text-align: center; font-size: 16px;">Just a quick note to let you know that the <strong>${team_name}</strong> team has been successfully deleted.</p>
        <p style="text-align: center; font-size: 16px;">Deleted by <b>${creator_name}</b> (Team Creator)</p>
        <p style="text-align: center; font-size: 12px;margin-top: -10px">${creator_email} </p>
    </div>

    <!-- Additional Information -->
    <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 16px;">Have a great day ahead!</p>
        <p style="font-size: 16px;">Best Regards,<br>LeavesBug Team</p>
    </div>

</body>
</html>`;

const TEAM_DELETE_CONFIRMATION_SUBJECT = 'Successfully shutdown | 😢 Farewell, Team! Deleting the Past with LeavesBug 😔';

const TEAM_INVITATION_REJECT_TEMPLATE = (invitor_name, invited_person_name) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation Rejected</title>
    <style>
     .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            width: 80px; 
            height: auto;
            border-radius: 5px;
        }
     </style>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f7fd; padding: 20px;">

<div class="logo">
<img src="https://tse2.mm.bing.net/th/id/OIG2.TNsD34rBnNif_vxI1gY8?pid=ImgGn" alt="LeavesBug Logo" />
</div>
   

    <!-- Notification Message -->
    <div style="background-color: #fff; border-radius: 5px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <p style="text-align: center; font-size: 16px;">Hello ${invitor_name},</p>
        <p style="text-align: center; font-size: 16px;">We regret to inform you that the invitation you sent to ${invited_person_name} has been rejected.</p>
        <p style="text-align: center; font-size: 16px;">While this is disappointing, we encourage you to continue building and managing your bug tracker community.</p>
    </div>

    <!-- Additional Information -->
    <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 16px;">If you have any questions or need further assistance, feel free to reach out to us.</p>
        <p style="font-size: 16px;">Best Regards,<br> <b>LeavesBug Support</b></p>
    </div>

</body>
</html>`;

const TEAM_INVITATION_REJECT_SUBJECT = 'Invitation Rejected';

module.exports = {
  OTP_TEMPLATE,
  WElCOME_TEMPLATE,
  TEAM_INVITATION_TEMPLATE,
  TEAM_DELETE_CONFIRMATION_TEMPLATE,
  TEAM_INVITATION_REJECT_TEMPLATE,
  OTP_TEMPLATE_SUBJECT,
  WElCOME_TEMPLATE_SUBJECT,
  TEAM_INVITATION_SUBJECT,
  TEAM_DELETE_CONFIRMATION_SUBJECT,
  TEAM_INVITATION_REJECT_SUBJECT
};
