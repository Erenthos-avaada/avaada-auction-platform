import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const BASE   = process.env.NEXTAUTH_URL      || "https://avaada-auction-platform.vercel.app";

function wrap(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr><td style="background:#0d1f15;padding:24px 32px;text-align:center;">
        <span style="font-size:20px;font-weight:700;color:#34d364;font-family:Arial,sans-serif;">⬡ Avaada Auctions</span>
        <p style="margin:4px 0 0;font-size:11px;color:rgba(52,211,100,0.6);letter-spacing:0.08em;text-transform:uppercase;">Procurement Platform</p>
      </td></tr>
      <tr><td style="padding:28px 32px 0;">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${title}</h1>
      </td></tr>
      <tr><td style="padding:16px 32px 28px;font-size:14px;color:#475569;line-height:1.7;">${body}</td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Avaada Group · This is an automated message, please do not reply.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(label: string, url: string, color = "#34d364") {
  return `<p style="margin:20px 0 0;"><a href="${url}" style="display:inline-block;padding:11px 24px;background:${color};color:${color === "#34d364" ? "#0b1a12" : "#fff"};border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">${label}</a></p>`;
}

export async function sendVendorRegistrationAlert(adminEmails: string[], vendorName: string, companyName: string, vendorEmail: string) {
  return resend.emails.send({
    from: FROM, to: adminEmails,
    subject: `New vendor registration — ${companyName}`,
    html: wrap("New Vendor Registration", `
      <p>A new vendor has submitted a registration request and is awaiting your approval.</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:140px;">Company</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${companyName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Contact</td><td style="padding:8px 0;color:#0f172a;">${vendorName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:8px 0;color:#0f172a;">${vendorEmail}</td></tr>
      </table>
      ${btn("Review Vendor →", `${BASE}/admin/vendors`)}
    `),
  });
}

export async function sendVendorApprovedEmail(to: string, companyName: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Your registration has been approved — Avaada Auctions`,
    html: wrap("Registration Approved ✓", `
      <p>Congratulations! <strong>${companyName}</strong> has been approved as a vendor on the Avaada Auction Platform.</p>
      <p>You can now log in and participate in active auctions you are invited to.</p>
      ${btn("Go to Dashboard →", `${BASE}/login`)}
    `),
  });
}

// Rejected — can reapply
export async function sendVendorRejectedEmail(to: string, companyName: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Your vendor application status — Avaada Auctions`,
    html: wrap("Application Not Approved", `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>Thank you for your interest in the Avaada Auction Platform. After reviewing your application, we are unable to approve it at this time.</p>
      <p>If you believe this is an error or would like more information, please contact the Avaada procurement team directly.</p>
      <p>You are welcome to submit a new application once any outstanding issues have been resolved.</p>
      ${btn("Re-apply →", `${BASE}/register`, "#2563eb")}
    `),
  });
}

// Blacklisted — permanent ban, no reapply
export async function sendVendorBlacklistedEmail(to: string, companyName: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Account suspended — Avaada Auctions`,
    html: wrap("Account Suspended", `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>Your account on the Avaada Auction Platform has been <strong>suspended due to a policy violation</strong>.</p>
      <p>This action is permanent. Your account and all associated data have been restricted from platform access.</p>
      <p>If you believe this is an error, please contact the Avaada procurement team with supporting documentation.</p>
    `),
  });
}

export async function sendAuctionInviteEmail(to: string, companyName: string, auctionTitle: string, auctionId: string, endTime: Date) {
  const closes = endTime.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return resend.emails.send({
    from: FROM, to,
    subject: `You're invited to bid — ${auctionTitle}`,
    html: wrap("Auction Invitation", `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>You have been invited to participate in the following reverse auction:</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:12px 16px;color:#94a3b8;font-size:13px;width:140px;border-bottom:1px solid #e2e8f0;">Auction</td><td style="padding:12px 16px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;">${auctionTitle}</td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;font-size:13px;">Closes</td><td style="padding:12px 16px;color:#0f172a;">${closes}</td></tr>
      </table>
      ${btn("View Auction & Bid →", `${BASE}/vendor/auctions/${auctionId}`)}
      <p style="margin-top:16px;font-size:12px;color:#94a3b8;">This is a reverse auction — the lowest qualifying bid wins.</p>
    `),
  });
}

export async function sendAuctionClosingSoonEmail(to: string, companyName: string, auctionTitle: string, auctionId: string, minutesLeft: number) {
  return resend.emails.send({
    from: FROM, to,
    subject: `⏰ Closing in ${minutesLeft} min — ${auctionTitle}`,
    html: wrap(`Auction Closing in ${minutesLeft} Minutes`, `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>The following auction is closing soon:</p>
      <p style="font-size:18px;font-weight:700;color:#0f172a;margin:16px 0;">${auctionTitle}</p>
      <p style="display:inline-block;padding:8px 16px;background:#fef3c7;border-radius:6px;color:#92400e;font-weight:600;font-size:13px;">⏰ Closing in approximately ${minutesLeft} minutes</p>
      ${btn("Place Your Bid Now →", `${BASE}/vendor/auctions/${auctionId}`)}
    `),
  });
}

export async function sendAuctionClosedEmail(to: string, companyName: string, auctionTitle: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Auction closed — ${auctionTitle}`,
    html: wrap("Auction Closed", `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>The following auction has been closed:</p>
      <p style="font-size:16px;font-weight:700;color:#0f172a;margin:16px 0;">${auctionTitle}</p>
      <p>The Avaada procurement team will be in touch regarding the outcome. Thank you for your participation.</p>
    `),
  });
}
