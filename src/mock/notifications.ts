import type { NotificationItem } from "../notifications/notificationsData";

/**
 * Seed notifications for initial hydration and prototype experience.
 * Replaced when notifications endpoint GET /notifications/ is connected.
 */
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Morning check-in ready",
    title_am: "የጥዋት ምዝገባ ዝግጁ ነው",
    message: "Take 60 seconds to speak how you're feeling today. Your midwife can review any updates.",
    message_am: "ዛሬ የሚሰማዎትን ለመናገር 60 ሰከንድ ይውሰዱ። አዋላጅዎ ማንኛውንም አዲስ መረጃ መገምገም ይችላሉ።",
    time: "Today · 8:00 AM",
    time_am: "ዛሬ · 8:00 ጠዋት",
    category: "checkin",
    read: false,
    actionUrl: "#voice",
  },
  {
    id: "notif-2",
    title: "Midwife appointment reminder",
    title_am: "የአዋላጅ ቀጠሮ ማስታወሻ",
    message: "Upcoming 3rd ANC appointment scheduled with Dr. Naomi Adeyemi.",
    message_am: "ከዶ/ር ናዖሚ አደየሚ ጋር የሚደረግ 3ኛው የቅድመ ወሊድ ቀጠሮ ደርሷል።",
    time: "Yesterday · 4:30 PM",
    time_am: "ትናንት · 4:30 ከሰዓት",
    category: "appointment",
    read: false,
    actionUrl: "#calendar",
  },
  {
    id: "notif-3",
    title: "Iron supplement reminder",
    title_am: "የብረት እንክብል ማስታወሻ",
    message: "Don't forget your daily iron supplement with a glass of water or citrus juice.",
    message_am: "ዕለታዊ የብረት እንክብልዎን ከአንድ ብርጭቆ ውሃ ወይም ፍራፍሬ ጭማቂ ጋር መውሰድዎን አይርሱ።",
    time: "Yesterday · 8:00 AM",
    time_am: "ትናንት · 8:00 ጠዋት",
    category: "supplement",
    read: false,
    actionUrl: "#settings",
  },
  {
    id: "notif-4",
    title: "Week 24 milestone: baby is hearing sounds",
    title_am: "ሳምንት 24፡ ህፃኑ ድምጽ መስማት ጀምሯል",
    message: "Your little one's inner ear is fully formed now and can hear the cadence of your voice.",
    message_am: "የልጅዎ የውስጥ ጆሮ አሁን ሙሉ በሙሉ አድጓል፣ የእርስዎን ድምጽም መለየት ይችላል።",
    time: "2 days ago",
    time_am: "ከ2 ቀናት በፊት",
    category: "health",
    read: true,
  },
  {
    id: "notif-5",
    title: "Previous check-in summary compiled",
    title_am: "ያለፈው ምዝገባ ማጠቃለያ ተዘጋጅቷል",
    message: "Your monthly check-in entries were compiled into the latest ANC report.",
    message_am: "የወሩ ምዝገባዎች ወደ አዲሱ የቅድመ ወሊድ ሪፖርት ተጠቃለዋል።",
    time: "3 days ago",
    time_am: "ከ3 ቀናት በፊት",
    category: "appointment",
    read: true,
    actionUrl: "#reports",
  },
];
