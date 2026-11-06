import { HomeScreen } from "@/components/home/HomeScreen";
import { MOCK_UNITS } from "@/lib/mock";

export default function HomePage() {
  // TODO(wiring): read units from the ContentBundle (content loader).
  return <HomeScreen units={MOCK_UNITS} />;
}
