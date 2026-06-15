import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { type, text, email, url } = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Fixlytics <support@fixlytics.app>',
      to: 'anshul.paharia1988@gmail.com',
      subject: `${type === 'positive' ? '👍' : '👎'} New feedback from Fixlytics`,
      html: `
        <h2>${type === 'positive' ? '👍 Positive' : '👎 Negative'} Feedback</h2>
        <p><strong>Site audited:</strong> ${url}</p>
        <p><strong>Feedback:</strong> ${text || 'No message'}</p>
        <p><strong>User email:</strong> ${email || 'Not provided'}</p>
      `,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false });
  }
}
