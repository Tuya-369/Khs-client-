import HeroSlider from "@/components/LandingToken/Merch/HeroSlider";
import MerchCard from "@/components/LandingToken/Merch/MerchCard";
import TokenAbout from "@/components/LandingToken/TokenAbout";

export default function Home() {
  return (
    <div className="w-full">
      <TokenAbout />
      <HeroSlider />
      <MerchCard itemLimit={8} />
    </div>
  );
}
