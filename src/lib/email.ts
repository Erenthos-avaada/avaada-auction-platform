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
      <!-- Header -->
      <tr><td style="background:#0d1f15;padding:24px 32px;text-align:center;">
        <span style="font-size:20px;font-weight:700;color:#34d364;font-family:Arial,sans-serif;">⬡ Avaada Auctions</span>
        <p style="margin:4px 0 0;font-size:11px;color:rgba(52,211,100,0.6);letter-spacing:0.08em;text-transform:uppercase;">Procurement Platform</p>
      </td></tr>
      <!-- Title -->
      <tr><td style="padding:28px 32px 0;">
        <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${title}</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:16px 32px 28px;font-size:14px;color:#475569;line-height:1.7;">
        ${body}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Avaada Group · This is an automated message, please do not reply.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(label: string, url: string) {
  return `<p style="margin:20px 0 0;"><a href="${url}" style="display:inline-block;padding:11px 24px;background:#34d364;color:#0b1a12;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">${label}</a></p>`;
}

// 1. Notify admins when a new vendor registers
export async function sendVendorRegistrationAlert(adminEmails: string[], vendorName: string, companyName: string, vendorEmail: string) {
  return resend.emails.send({
    from: FROM, to: adminEmails,
    subject: `New vendor registration — ${companyName}`,
    html: wrap("New Vendor Registration", `
      <p>A new vendor has submitted a registration request and is awaiting your approval.</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;width:140px;">Company</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${companyName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Contact Name</td><td style="padding:8px 0;color:#0f172a;">${vendorName}</td></tr>
        <tr><td style="padding:8px 0;color:#94a3b8;font-size:13px;">Email</td><td style="padding:8px 0;color:#0f172a;">${vendorEmail}</td></tr>
      </table>
      ${btn("Review Vendor →", `${BASE}/admin/vendors`)}
    `),
  });
}

// 2. Notify vendor when approved
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

// 3. Notify vendor when rejected
export async function sendVendorRejectedEmail(to: string, companyName: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Your registration status — Avaada Auctions`,
    html: wrap("Registration Update", `
      <p>Thank you for your interest in the Avaada Auction Platform.</p>
      <p>After reviewing your application, we are unable to approve <strong>${companyName}</strong> at this time.</p>
      <p>If you believe this is an error or would like more information, please contact the Avaada procurement team directly.</p>
    `),
  });
}

// 4. Notify vendor when invited to an auction
export async function sendAuctionInviteEmail(to: string, companyName: string, auctionTitle: string, auctionId: string, endTime: Date) {
  const closes = endTime.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return resend.emails.send({
    from: FROM, to,
    subject: `You're invited to bid — ${auctionTitle}`,
    html: wrap("Auction Invitation", `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>You have been invited to participate in the following reverse auction on the Avaada Procurement Platform:</p>
      <table style="width:100%;margin:16px 0;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:12px 16px;color:#94a3b8;font-size:13px;width:140px;border-bottom:1px solid #e2e8f0;">Auction</td><td style="padding:12px 16px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;">${auctionTitle}</td></tr>
        <tr><td style="padding:12px 16px;color:#94a3b8;font-size:13px;">Closes</td><td style="padding:12px 16px;color:#0f172a;">${closes}</td></tr>
      </table>
      <p>Log in to view full specifications and place your bid before the auction closes.</p>
      ${btn("View Auction & Bid →", `${BASE}/vendor/auctions/${auctionId}`)}
      <p style="margin-top:16px;font-size:12px;color:#94a3b8;">This is a reverse auction — the lowest qualifying bid wins. Bids are binding.</p>
    `),
  });
}

// 5. Notify invited vendors when auction closes soon (30 min)
export async function sendAuctionClosingSoonEmail(to: string, companyName: string, auctionTitle: string, auctionId: string, minutesLeft: number) {
  return resend.emails.send({
    from: FROM, to,
    subject: `⏰ Closing in ${minutesLeft} min — ${auctionTitle}`,
    html: wrap(`Auction Closing in ${minutesLeft} Minutes`, `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>The following auction is closing soon. This is your last chance to place or update your bid:</p>
      <p style="font-size:18px;font-weight:700;color:#0f172a;margin:16px 0;">${auctionTitle}</p>
      <p style="display:inline-block;padding:8px 16px;background:#fef3c7;border-radius:6px;color:#92400e;font-weight:600;font-size:13px;">⏰ Closing in approximately ${minutesLeft} minutes</p>
      ${btn("Place Your Bid Now →", `${BASE}/vendor/auctions/${auctionId}`)}
    `),
  });
}

// 6. Notify invited vendors when auction is closed
export async function sendAuctionClosedEmail(to: string, companyName: string, auctionTitle: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Auction closed — ${auctionTitle}`,
    html: wrap("Auction Closed", `
      <p>Dear <strong>${companyName}</strong>,</p>
      <p>The following auction has been closed by the procurement team:</p>
      <p style="font-size:16px;font-weight:700;color:#0f172a;margin:16px 0;">${auctionTitle}</p>
      <p>The Avaada procurement team will be in touch regarding the outcome. Thank you for your participation.</p>
    `),
  });
}
