import type { Metadata } from "next";
import { Bullets, LEGAL, LegalPage, Section } from "../legal";

export const metadata: Metadata = {
  title: "Privacy policy",
};

/*
  A plain-language starting point, written for what Veriq actually stores today.
  It is NOT legal advice. Have a lawyer read it before you launch, including:
  your lawful bases, retention periods, transfers outside Nigeria, and whether you must
  register with the Nigeria Data Protection Commission (NDPC).
*/
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <Section title="1. Who we are">
        <p>
          {LEGAL.name} runs Veriq and decides how personal information is used on it. You can reach us at{" "}
          {LEGAL.email}.
        </p>
      </Section>

      <Section title="2. What we collect">
        <p><strong>Company accounts</strong></p>
        <Bullets
          items={[
            "Your name and email, and your password. Your password is handled by Google’s Firebase sign-in service, which stores it in scrambled form. We never see it.",
            "Business details: business name, address, email, phone number, website, product category and logo.",
            "Verification documents that you upload so we can review your application.",
            "Your products and codes: product names and information, each code, whether you marked it as copied, how many times it was checked, and the time of the first and latest check.",
          ]}
        />
        <p><strong>Customers who check a code</strong></p>
        <Bullets
          items={[
            "We do not ask customers for a name, email or phone number, and we do not keep a record of who checked a code. We only update the code’s check count and the time of the check.",
            "If someone enters a code we don’t recognise, we keep a scrambled (hashed) version of their network address together with a count, to stop people guessing codes. These records are deleted automatically after about a day.",
          ]}
        />
        <p><strong>Cookies and logs</strong></p>
        <Bullets
          items={[
            "We use one cookie to keep you logged in. It is needed for the service to work. We use no advertising or analytics cookies.",
            "Our hosting provider keeps ordinary server logs, which can include network addresses and the pages requested.",
          ]}
        />
      </Section>

      <Section title="3. Why we use it">
        <Bullets
          items={[
            "To create and run your account and review company applications.",
            "To create codes and show verification results to customers.",
            "To prevent abuse, such as guessing codes or false applications.",
            "To contact you about your account, for example to reset a password or tell you about a decision on your application.",
            "To meet legal duties.",
          ]}
        />
        <p>[LAWYER: state the lawful basis for each purpose under the Nigeria Data Protection Act 2023.]</p>
      </Section>

      <Section title="4. Who can see it">
        <Bullets
          items={[
            "Customers who verify a code see the manufacturer’s name and logo, and the product name and information.",
            "Verification documents are seen only by us, to review applications.",
            "Service providers who run Veriq for us: Google (Firebase) for sign-in and our database, and our hosting provider (Vercel). They may only use the data to provide their service to us.",
            "Authorities, if the law requires us to share information.",
          ]}
        />
        <p>We do not sell personal information.</p>
      </Section>

      <Section title="5. Where it is stored">
        <p>
          Our providers may store and process data on servers outside Nigeria. [LAWYER: describe the
          safeguards you rely on for transfers.]
        </p>
      </Section>

      <Section title="6. How long we keep it">
        <Bullets
          items={[
            "Account and company records: while the account is open, and for [PERIOD] after it closes.",
            "Documents from rejected applications: [PERIOD].",
            "Codes and their check counts: for as long as the company keeps them.",
            "Guessing-protection records: about one day.",
          ]}
        />
      </Section>

      <Section title="7. Keeping it safe">
        <p>
          Passwords are scrambled by our sign-in provider. Documents can be opened only by our admin
          account, and the pages that run the service check who you are on our servers. No online system is
          completely secure, so we cannot promise absolute safety.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          Under the Nigeria Data Protection Act 2023 you have rights over your personal information. These
          include asking to see it, correct it or delete it, objecting to how it is used, withdrawing your
          consent, and receiving a copy of it. To use a right, contact us at {LEGAL.email}. You can also make
          a complaint to the Nigeria Data Protection Commission (NDPC).
        </p>
      </Section>

      <Section title="9. Children">
        <p>Veriq is for businesses and their customers. It is not meant for children.</p>
      </Section>

      <Section title="10. Changes">
        <p>We may update this policy. The date at the top shows the latest version.</p>
      </Section>

      <Section title="11. Contact">
        <p>
          {LEGAL.name}
          <br />
          {LEGAL.address}
          <br />
          {LEGAL.email}
        </p>
      </Section>
    </LegalPage>
  );
}