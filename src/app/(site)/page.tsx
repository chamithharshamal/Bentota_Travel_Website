import { HeroSection } from "@/components/site/hero";
import { PopularDestinationsSection } from "@/components/site/popular-destinations";
import { ExplorePackagesSection } from "@/components/site/explore-packages";
import { MomentsFromTravellersSection } from "@/components/site/moments-gallery";
import { ContactUsSection } from "@/components/site/contact-section";

export const revalidate = 300;

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularDestinationsSection />
      <ExplorePackagesSection />
      <MomentsFromTravellersSection />
      <ContactUsSection />
    </>
  );
}
