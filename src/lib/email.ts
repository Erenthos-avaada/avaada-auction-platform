import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@avaada.com";

export async function sendAuctionInviteEmail(to: string, auctionTitle: string, auctionId: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `You are invited to bid: ${auctionTitle}`,
    html: `<p>You have been invited to participate in the auction: <strong>${auctionTitle}</strong>.</p>
           <p><a href="${process.env.NEXTAUTH_URL}/vendor/auctions/${auctionId}">Click here to view and bid</a></p>`,
  });
}

export async function sendAuctionClosingSoonEmail(to: string, auctionTitle: string, auctionId: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Closing Soon: ${auctionTitle}`,
    html: `<p>The auction <strong>${auctionTitle}</strong> is closing soon.</p>
           <p><a href="${process.env.NEXTAUTH_URL}/vendor/auctions/${auctionId}">Place your bid now</a></p>`,
  });
}

export async function sendVendorApprovalEmail(to: string, status: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your vendor registration has been ${status.toLowerCase()}`,
    html: `<p>Your vendor registration on the Avaada Auction Platform has been <strong>${status.toLowerCase()}</strong>.</p>`,
  });
}
