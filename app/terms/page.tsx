import type { Metadata } from "next";
import { Bullets, LEGAL, LegalPage, Section } from "../legal";

export const metadata: Metadata = {
  title: "Terms of use",
};

/*
  A plain-language starting point, written for how Veriq works today.
  It is NOT legal advice. Have a lawyer read and adjust it before you launch,
  especially "Our responsibility", "Governing law" and anything about fees.
*/
export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <Section title="1. About these terms">
        <p>
          Veriq is an online service that lets manufacturers give their products unique codes, and lets
          customers check those codes. {LEGAL.name} (“we”, “us”) runs Veriq. By creating an account or
          using the verification page, you agree to these terms. If you don’t agree, please don’t use Veriq.
        </p>
      </Section>

      <Section title="2. What a verification result means">
        <Bullets
          items={[
            <><strong>Genuine</strong> means the code is registered on Veriq by the manufacturer shown, and it had not been checked before.</>,
            <><strong>Checked before</strong> means the code has already been verified. This can happen if a code was copied onto a fake product, or if the same person checks twice. Be careful, and contact the manufacturer if you are unsure.</>,
            <><strong>Not recognised</strong> means we have no record of the code.</>,
          ]}
        />
        <p>
          A result is based only on the records the manufacturer created on Veriq. We do not inspect
          products. A result is not a promise that a product is authentic, safe, or fit for its purpose.
        </p>
      </Section>

      <Section title="3. Company accounts">
        <Bullets
          items={[
            "A company must apply and be approved by us before it can create codes. We may approve, reject or suspend any application or account.",
            "You must give accurate business information and genuine documents, and you must be allowed to act for the business.",
            "Keep your password secret. You are responsible for what happens under your account.",
          ]}
        />
      </Section>

      <Section title="3a. Codes and products">
        <Bullets
          items={[
            "Create codes only for your own genuine products.",
            "You are responsible for putting each code on the right product and for the accuracy of the product name and information you enter.",
            "Keep your codes safe. We cannot stop someone copying a code that is printed on a product.",
          ]}
        />
      </Section>

      <Section title="4. Using Veriq properly">
        <p>You must not:</p>
        <Bullets
          items={[
            "guess or test codes in bulk, or try to get around our limits on attempts;",
            "copy the service’s data automatically (scraping) or disrupt how it works;",
            "upload false, stolen or unlawful documents or information;",
            "pretend to be another person or business, or use Veriq to help sell counterfeit goods.",
          ]}
        />
      </Section>

      <Section title="5. Your content">
        <p>
          Your logo, documents, product names and information stay yours. You allow us to store them and to
          use them to run Veriq. This includes showing your business name, logo, product name and product
          information to anyone who verifies one of your codes. Your verification documents are used only to
          review your application.
        </p>
      </Section>

      <Section title="6. Availability">
        <p>
          We try to keep Veriq running, but we cannot promise it will always be available or free of errors.
          We may change, pause or stop parts of the service.
        </p>
      </Section>

      <Section title="7. Our responsibility">
        <p>
          As far as the law allows, we are not responsible for losses that come from relying on a
          verification result, from counterfeit or faulty products, or from codes being copied. Nothing in
          these terms limits any right you have by law that cannot be limited.
        </p>
      </Section>

      <Section title="8. Ending your use">
        <p>
          You can stop using Veriq at any time. We may suspend or close an account that breaks these terms
          or puts others at risk.
        </p>
      </Section>

      <Section title="9. Changes to these terms">
        <p>
          We may update these terms. The date at the top shows the latest version. If you keep using Veriq
          after a change, you accept the new terms.
        </p>
      </Section>

      <Section title="10. Governing law">
        <p>[GOVERNING LAW AND COURTS, for example: these terms are governed by the laws of Nigeria.]</p>
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