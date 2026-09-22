import type { Metadata } from "next";
import { getSettings } from "@/lib/server/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Privacy notice" };

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <article className="mx-auto max-w-prose px-4 pt-14 leading-relaxed sm:px-0">
      <h1 className="text-4xl font-bold">Privacy notice</h1>
      <p className="mt-2 text-sm text-ocean-950/60">
        Template text. Review with the business owner before launch.
      </p>
      <div className="mt-8 space-y-5 text-ocean-950/85">
        <p>
          {settings.businessName} collects the details you enter in the booking form: your name, nationality, email
          address, phone or WhatsApp number, trip preferences, pickup point and any notes.
        </p>
        <p>
          We use these details only to respond to your booking request, arrange your trip, and contact you about it. We
          use your nationality to show the correct price and currency.
        </p>
        <p>
          Your details are stored securely with our hosting and database providers. We do not sell your information or
          use it for advertising.
        </p>
        <p>
          We handle personal data in line with Sri Lanka&apos;s Personal Data Protection Act No. 9 of 2022. You can ask us
          to see, correct or delete your details at any time
          {settings.contactEmail ? (
            <>
              {" "}by writing to <a className="font-semibold text-ocean-600 underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            </>
          ) : null}
          .
        </p>
      </div>
    </article>
  );
}
