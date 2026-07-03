import HeroSlider from "@/Component/LandingToken/Merch/HeroSlider";
import MerchCard from "@/Component/LandingToken/Merch/MerchCard";
import TokenAbout from "@/Component/LandingToken/TokenAbout";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full">
      <TokenAbout />
      <HeroSlider />
      <MerchCard />
    </div>
  );
}
