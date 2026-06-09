import PageLayout from "@/components/PageLayout";

const SECTIONS = [
  {
    title: "What We Collect",
    items: [
      "Website URLs you enter for auditing",
      "Email address (when you sign in or make a payment)",
      "Payment information - processed securely by Razorpay; we never store card details",
      "Anonymous usage data via Google Analytics",
      "Anonymized session recordings via Microsoft Clarity",
    ],
  },
  {
    title: "How We Use Your Data",
    items: [
      "To run website audits and show you results",
      "To send you your audit report via email",
      "To restore your access on any device when you sign in",
      "To improve our product based on anonymous usage patterns",
    ],
  },
  {
    title: "What We Don't Do",
    items: [
      "We never sell your data to any third party",
      "We never share your email with advertisers or partners",
      "We never store your payment card details",
    ],
  },
  {
    title: "Data Storage",
    items: [
      "Email and payment records are stored in an encrypted database (Upstash Redis)",
      "Audit results are stored temporarily in your browser via localStorage",
      "Payment records are kept for 30 days - the duration of your report access",
    ],
  },
  {
    title: "Cookies & Analytics",
    items: [
      "Google Analytics - anonymous usage tracking (pages visited, session duration)",
      "Microsoft Clarity - anonymized session recordings to understand usability",
      "Session cookies for login, managed by NextAuth (no tracking cookies)",
    ],
  },
  {
    title: "Payment Security",
    items: [
      "All payments are processed by Razorpay, which is PCI DSS Level 1 compliant",
      "We receive only a confirmation of a successful payment - never card numbers, CVVs, or bank details",
    ],
  },
  {
    title: "Your Rights",
    items: [
      "Request deletion of your data: email support@fixlytics.app",
      "Unsubscribe from emails: reply to any email from us with 'Unsubscribe'",
    ],
  },
  {
    title: "Contact",
    items: [
      "Email: support@fixlytics.app",
      "We respond within 24 hours, Monday to Friday",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy">
      {SECTIONS.map(({ title, items }) => (
        <section key={title} style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20, fontWeight: 700, marginTop: 36, marginBottom: 12,
            color: "var(--navy-800)", letterSpacing: "-0.01em",
          }}>{title}</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {items.map((item) => (
              <li key={item} style={{
                fontSize: 16, lineHeight: 1.7, color: "var(--fg-2)",
                marginBottom: 6,
              }}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </PageLayout>
  );
}
