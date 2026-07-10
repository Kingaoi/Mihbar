export { IconThumbsUp, IconHandshake, IconHeart, IconSparkles, IconFlag, IconMessageCircle, IconReply, IconPencil, IconTrash, IconArrowRight, IconLock, IconUnlock, IconUser, IconSettings, IconPaperclip, IconUpload, IconQuote, IconLink, IconImage, IconPause, IconAlertTriangle } from './Icons1';
export { IconSearch, IconBell, IconSprout, IconClock, IconStar, IconMail, IconFileText, IconSun, IconMoon, IconCopy, IconX, IconDownload, IconMonitor, IconSproutLoader, IconCheck, REACTION_ICONS } from './Icons2';
export function IconBookmark({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
