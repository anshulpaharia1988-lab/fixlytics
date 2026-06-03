import PageLayout from "@/components/PageLayout";

const SECTIONS = [
  {
    title: "What we collect",
    body: "When you use Fixlytics, we temporarily process the URL you submit in order to run your audit. We do not store your URL beyond the duration of your session. If you purchase a full report, your payment is handled entirely by Razorpay - we never see or store your card details.",
  },
  {
    title: "Payment data",
    body: "All payments are processed by Razorpay, which is PCI DSS compliant. Fixlytics only receives confirmation of a successful payment - no card numbers, CVVs, or bank account details are shared with us.",
  },
  {
    title: "Cookies and local storage",
    body: "We use browser localStorage to remember which URLs you have already paid for, so you don't need to pay again within 30 days. No tracking cookies are set. No third-party analytics are used.",
  },
  {
    title: "Third-party services",
    body: "We use Google PageSpeed Insights API to retrieve performance data for your site. Your URL is sent to Google's API as part of this request. Please refer to Google's privacy policy for details on how they handle this data.",
  },
  {
    title: "Data retention",
    body: "We do not maintain a database of user accounts or submitted URLs. Audit results are computed on the fly and not stored on our servers after your session ends.",
  },
  {
    title: "Contact",
    body: "If you have any questions about this policy, email us at support@fixlytics.app. We respond within 24 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy">
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
