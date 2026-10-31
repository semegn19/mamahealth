import type { Metadata } from "next";
import { VoiceCheckin } from "../../src/voice/VoiceCheckin";

export default function Page() {
  return <VoiceCheckin />;
}

export const metadata: Metadata = { title: "Voice check-in — Mama Health" };
