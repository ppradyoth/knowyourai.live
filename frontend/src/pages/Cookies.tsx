import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Cookies() {
  return (
    <>
      <SEO title="Cookie Policy" description="How KnowYourAI uses cookies and similar technologies on its website and services." path="/cookies" />
      <Section eyebrow="Legal" title="Cookie Policy" description="Last updated: June 2026" />

      <section className="section">
        <div style={{ maxWidth: "72ch", margin: "0 auto" }} className="prose-legal">

        <h2>1. What Are Cookies</h2>
        <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently and to provide information to site operators. Similar technologies include local storage, session storage, and pixel tags.</p>

        <h2>2. How We Use Cookies</h2>
        <p>KnowYourAI, the independent project that operates knowyourai.live ("KnowYourAI," "we," "us," or "our") uses cookies and similar technologies on our website and services for the following purposes:</p>

        <h3>2.1 Strictly Necessary Cookies</h3>
        <p>These cookies are essential for the operation of our Services. They include:</p>
        <ul>
          <li><strong>Authentication cookies:</strong> To verify your identity and maintain your logged-in session</li>
          <li><strong>Security cookies:</strong> To detect and prevent fraudulent activity and protect against unauthorized access</li>
          <li><strong>Session cookies:</strong> To maintain state and preferences during your browsing session</li>
        </ul>
        <p>These cookies cannot be disabled without impairing the core functionality of the Services.</p>

        <h3>2.2 Performance and Analytics Cookies</h3>
        <p>These cookies help us understand how visitors interact with our website by collecting information about page visits, traffic sources, and usage patterns. This data is used in aggregate to improve the reliability and performance of the Services. We may use third-party analytics services such as Firebase Analytics.</p>

        <h3>2.3 Functional Cookies</h3>
        <p>These cookies remember choices you make (such as interface preferences or language settings) to provide a more personalized experience.</p>

        <h2>3. Third-Party Cookies</h2>
        <p>Some cookies may be set by third-party services that appear on our pages, including authentication providers (Firebase Authentication) and hosting infrastructure (Google Cloud / Firebase Hosting). We do not control the cookies set by third parties and recommend reviewing their respective privacy and cookie policies.</p>

        <h2>4. Managing Cookies</h2>
        <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
        <ul>
          <li>View what cookies are stored and delete them individually or in bulk</li>
          <li>Block third-party cookies</li>
          <li>Block cookies from specific sites</li>
          <li>Block all cookies</li>
          <li>Delete all cookies when you close your browser</li>
        </ul>
        <p>Please note that disabling or deleting cookies may affect the functionality of the Services, including the ability to log in, maintain sessions, and save preferences.</p>

        <h2>5. Do Not Track</h2>
        <p>Some browsers transmit "Do Not Track" (DNT) signals. There is currently no industry standard for how websites should respond to DNT signals. We do not currently respond to DNT signals, but we limit our data collection to what is necessary to operate the Services as described in our Privacy Policy.</p>

        <h2>6. Changes to This Policy</h2>
        <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date. Your continued use of the Services constitutes acceptance of the updated Cookie Policy.</p>

        <h2>7. Governing Law</h2>
        <p>This Cookie Policy shall be governed by and construed in accordance with the laws of India. Any disputes arising from this Cookie Policy shall be subject to the exclusive jurisdiction of the courts located in Mysore (Mysuru), Karnataka, India.</p>

        <h2>8. Contact</h2>
        <p>Questions about this Cookie Policy may be directed to us through the contact information provided on our website.</p>

        </div>
      </section>
    </>
  );
}
