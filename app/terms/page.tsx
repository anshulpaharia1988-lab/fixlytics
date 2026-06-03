import PageLayout from "@/components/PageLayout";

const SECTIONS = [
  {
    title: "Service description",
    body: "Fixlytics provides automated website audits covering UX, SEO, and performance. The free audit shows a summary of issues. The full report - including detailed fixes and copy-paste recommendations - is available for a one-time fee of ₹2,400 per URL.",
  },
  {
    title: "Payment terms",
    body: "Full report access costs ₹2,400 (Indian Rupees) as a one-time payment per URL. Access is valid for 30 days on the same device and browser. No subscription is created. Payments are processed by Razorpay.",
  },
  {
    title: "Refund policy",
    body: "We offer a 7-day money back guarantee. If you are not satisfied with your report for any reason, email support@fixlytics.app within 7 days of purchase and we will issue a full refund, no questions asked.",
  },
  {
    title: "No guarantee of specific results",
    body: "Fixlytics provides analysis and recommendations based on automated tools and best practices. We cannot guarantee specific improvements in traffic, conversions, or search rankings. Results depend on implementation and many external factors beyond our control.",
  },
  {
    title: "Acceptable use",
    body: "You may only submit URLs you own or have permission to audit. Do not use Fixlytics to audit websites without authorisation. We reserve the right to terminate access for abuse.",
  },
  {
    title: "Limitation of liability",
    body: "Fixlytics is provided 'as is'. We are not liable for any direct or indirect damages arising from use of our service. Our total liability is limited to the amount you paid for the service.",
  },
  {
    title: "Contact",
    body: "Questions about these terms? Email support@fixlytics.app.",
  },
];

export default function TermsPage() {
  return (
    <PageLayout title="Terms of Service">
      {SECTIONS.map(({ title, body }) => (
        <section key={title} style={{ marginBottom: 36 }}>
          <h2 style={{
            fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 10,
            color: "var(--navy-800)", letterSpacing: "-0.01em",
          }}>{title}</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--fg-2)", marginBottom: 0 }}>{body}</p>
        </section>
      ))}
    </PageLayout>
  );
}
