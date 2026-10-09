import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Terms() {
  return (
    <>
      <SEO title="Terms of Service" description="Terms governing access to and use of KnowYourAI services and platform." path="/terms" />
      <Section eyebrow="Legal" title="Terms of Service" description="Last updated: June 2026" />

      <section className="section">
        <div style={{ maxWidth: "72ch", margin: "0 auto" }} className="prose-legal">

        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using any services, tools, APIs, or websites provided by KnowYourAI, the independent project that operates knowyourai.live ("KnowYourAI," "we," "us," or "our"), you ("you," "your," or "Client") agree to be bound by these Terms of Service ("Terms"). If you are using the services on behalf of an organization, you represent that you have authority to bind that organization to these Terms. If you do not agree to these Terms, you must not access or use the services.</p>

        <h2>2. Description of Services</h2>
        <p>KnowYourAI provides AI security assessment, adversarial testing, red-teaming, and related consulting and software services ("Services"). This includes, without limitation, the IntentScan testing tool, IntentEnforce runtime proxy, the KnowYourAI API, web-based dashboards, and any associated documentation, reports, or deliverables.</p>

        <h2>3. Eligibility</h2>
        <p>You must be at least 18 years of age and have the legal capacity to enter into a binding agreement. By using the Services, you represent and warrant that you meet these requirements.</p>

        <h2>4. Account Responsibilities</h2>
        <p>You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use. We are not liable for any loss or damage arising from your failure to protect your account credentials.</p>

        <h2>5. Acceptable Use</h2>
        <p>You agree to use the Services only for lawful purposes and only on systems and endpoints that you own or have explicit written authorization to test. You shall not:</p>
        <ul>
          <li>Use the Services to test, attack, probe, or scan any system without proper authorization from the system owner</li>
          <li>Use the Services to engage in any activity that violates applicable laws, regulations, or third-party rights</li>
          <li>Attempt to reverse-engineer, decompile, or disassemble any part of the Services</li>
          <li>Use the Services to develop competing products or services</li>
          <li>Transmit malware, viruses, or other harmful code through the Services</li>
          <li>Resell, sublicense, or redistribute the Services without prior written consent</li>
          <li>Misrepresent your identity, authorization level, or affiliation when using the Services</li>
        </ul>
        <p>You are solely and entirely responsible for ensuring that your use of the Services complies with all applicable laws and regulations in your jurisdiction, including but not limited to computer fraud, data protection, and privacy laws.</p>

        <h2>6. Client Responsibilities</h2>
        <p>You acknowledge and agree that:</p>
        <ul>
          <li>You are solely responsible for obtaining all necessary authorizations, consents, and permissions before directing the Services at any system, API, endpoint, or data</li>
          <li>You are solely responsible for all scan configurations, prompts, target API endpoints, and other inputs submitted through the Services</li>
          <li>You bear full responsibility for any consequences arising from your use of the Services, including any impact on third-party systems</li>
          <li>Any findings, reports, or outputs produced by the Services are informational only and do not constitute legal, compliance, or security certification</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>All intellectual property rights in the Services, including software, methodologies, algorithms, documentation, and branding, remain the exclusive property of KnowYourAI. Nothing in these Terms grants you any ownership interest in the Services. You retain ownership of your own data and configurations submitted to the Services.</p>

        <h2>8. Confidentiality</h2>
        <p>Each party agrees to keep confidential all non-public information received from the other party in connection with the Services. This obligation does not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was already known to the receiving party; (c) is independently developed without reference to confidential information; or (d) is required to be disclosed by law or court order.</p>

        <h2>9. Disclaimer of Warranties</h2>
        <p><strong>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE.</strong> To the fullest extent permitted by applicable law, KnowYourAI expressly disclaims all warranties, including but not limited to:</p>
        <ul>
          <li>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
          <li>Any warranty that the Services will be uninterrupted, error-free, secure, or free of harmful components</li>
          <li>Any warranty regarding the accuracy, completeness, reliability, or timeliness of any results, reports, findings, or outputs produced by the Services</li>
          <li>Any warranty that the Services will detect all vulnerabilities, security issues, or risks in any system</li>
          <li>Any warranty that following our recommendations will prevent security incidents or breaches</li>
        </ul>
        <p>You acknowledge that no security testing methodology can guarantee the identification of all vulnerabilities, and that the absence of findings does not constitute a certification of security.</p>

        <h2>10. Limitation of Liability</h2>
        <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL KNOWYOURAI, ITS OPERATORS, CONTRIBUTORS, AGENTS, OR AFFILIATES BE LIABLE FOR ANY:</strong></p>
        <ul>
          <li>Indirect, incidental, special, consequential, exemplary, or punitive damages</li>
          <li>Loss of profits, revenue, data, goodwill, business opportunities, or anticipated savings</li>
          <li>Damages arising from interruption of business, loss of use, or cost of procurement of substitute services</li>
          <li>Damages arising from unauthorized access to or alteration of your data or systems</li>
          <li>Damages arising from any third-party claims related to your use of the Services</li>
        </ul>
        <p><strong>IN NO EVENT SHALL KNOWYOURAI'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES EXCEED THE TOTAL AMOUNT PAID BY YOU TO KNOWYOURAI IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED US DOLLARS (USD $100), WHICHEVER IS LESS.</strong></p>
        <p>These limitations apply regardless of the legal theory upon which the claim is based, including breach of contract, tort (including negligence), strict liability, or any other theory, and even if KnowYourAI has been advised of the possibility of such damages.</p>

        <h2>11. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless KnowYourAI, its operators, contributors, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney's fees) arising out of or related to: (a) your use or misuse of the Services; (b) your violation of these Terms; (c) your violation of any applicable law or regulation; (d) your infringement of any third-party rights; (e) any unauthorized testing of third-party systems conducted through the Services; or (f) any data or content you submit to the Services.</p>

        <h2>12. Service Modifications and Termination</h2>
        <p>We reserve the right to modify, suspend, or discontinue the Services (or any part thereof) at any time, with or without notice. We may terminate or suspend your access to the Services immediately, without prior notice, for any reason, including if we reasonably believe you have violated these Terms. Upon termination, your right to use the Services ceases immediately.</p>

        <h2>13. Changes to Terms</h2>
        <p>We may update these Terms at any time by posting the revised version on our website. Your continued use of the Services after such changes constitutes acceptance of the updated Terms. It is your responsibility to review these Terms periodically.</p>

        <h2>14. Governing Law and Jurisdiction</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or the Services shall be subject to the exclusive jurisdiction of the courts located in Mysore (Mysuru), Karnataka, India. You irrevocably consent to the jurisdiction and venue of such courts and waive any objection based on inconvenient forum.</p>

        <h2>15. Dispute Resolution</h2>
        <p>Before initiating any legal proceedings, you agree to first attempt to resolve any dispute informally by contacting us. If the dispute is not resolved within thirty (30) days of the initial notice, either party may proceed with formal legal proceedings in the courts specified above.</p>

        <h2>16. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be enforced to the maximum extent permissible, and the remaining provisions shall remain in full force and effect.</p>

        <h2>17. Entire Agreement</h2>
        <p>These Terms, together with any applicable service agreements or order forms, constitute the entire agreement between you and KnowYourAI regarding the Services and supersede all prior agreements, communications, and understandings.</p>

        <h2>18. No Waiver</h2>
        <p>The failure of KnowYourAI to exercise or enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</p>

        <h2>19. Force Majeure</h2>
        <p>KnowYourAI shall not be liable for any failure or delay in performing its obligations where such failure or delay results from circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, pandemics, power failures, internet disruptions, government actions, or third-party service failures.</p>

        <h2>20. Contact</h2>
        <p>Questions about these Terms may be directed to us through the contact information provided on our website.</p>

        </div>
      </section>
    </>
  );
}
