import { useState, useRef } from "react";
import { RADIUS, CATS, SHADOWS, TRANSITIONS, ANIMATIONS, OUTLINE_NONE, FONT } from "../constants/index";
import { MdAttachRow } from "./MdAttachRow";
import { IconX, IconCheck, IconUser } from "./Icons";

const SUGGESTIONS = ["نظام", "خبير", "صديق", "محرر", "admin", "moderator"];

export default function PostInput({
  text,
  setText,
  note,
  setNote,
  category,
  setCategory,
  mdFile,
  setMdFile,
  videoUrl,
  pollOptions = [],
  setPollOptions,
  setVideoUrl,
  isBanned,
  isPosting,
  submit,
  err,
  setErr,
  openMdEditor,
  activeCatRef,
  currentPlaceholder,
  radiusXl,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0,
  R,
  // ملاحظة (TS migration): inputBase يُمرَّر من كل الاستدعاءات
  // (FloatingPostModal, MihbarShell) وهو مُستخدَم فعليًا كـ spread ستايل
  // موحّد (...inputBase) في كل مكوّنات الإدخال المشابهة (CommentItem,
  // ReplyItem, ThreadView, MdEditorPage)، لكن PostInput لا يطبّقه إطلاقًا —
  // يبدو نقصًا حقيقيًا سابقًا للترحيل (احتمال تنسيق بصري غير موحّد لحقل
  // الإدخال الرئيسي). الاسم يجب أن يبقى مطابقًا لما يُمرِّره المستدعيان.
  // eslint-disable-next-line no-unused-vars
  inputBase,
}) {
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef(null);

  const removePollOption = (idx) => {
    if (pollOptions.length <= 2) {
      const newOpts = [...pollOptions];
      newOpts[idx] = "";
      setPollOptions(newOpts);
      return;
    }
    const newOpts = pollOptions.filter((_, i) => i !== idx);
    setPollOptions(newOpts);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    setErr("");

    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const words = textBefore.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@") && lastWord.length >= 1) {
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name) => {
    const cursor = textareaRef.current.selectionStart;
    const textBefore = text.slice(0, cursor);
    const textAfter = text.slice(cursor);
    const words = textBefore.split(/\s/);
    words[words.length - 1] = "@" + name + " ";
    const newText = words.join(" ") + textAfter;
    setText(newText);
    setShowMentions(false);
    textareaRef.current.focus();
  };

  const hasPollContent = pollOptions.some(opt => (opt || "").trim() !== "");

  return (
    <div style={{ ...cardStyleFallback(CL, BORDERS, isMobile, R), borderRadius: radiusXl, padding: isMobile ? "14px" : "16px 18px", marginBottom: 14 }}>
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={currentPlaceholder}
          maxLength={300}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isMobile && !isBanned) {
              e.preventDefault();
              submit();
            }
          }}
          style={{
            width: "100%",
            minHeight: isMobile ? 80 : 90,
            background: "transparent",
            border: "none",
            outline: OUTLINE_NONE,
            resize: "none",
            color: CL.text,
            fontSize: R.textareaFont,
            lineHeight: 1.78,
            fontFamily: s.font,
            boxSizing: "border-box",
            caretColor: CL.accent,
            WebkitAppearance: "none",
          }}
        />

        {showMentions && (
          <div style={{ 
            position: "absolute", 
            bottom: "100%", 
            left: 0, 
            background: CL.surface, 
            border: BORDERS.default, 
            borderRadius: RADIUS.md, 
            // ملاحظة (TS migration): SHADOWS.lg غير موجودة في تعريف SHADOWS
            // (constants/index.ts يحتوي فقط modal/danger/postBtn) — كانت
            // boxShadow=undefined بصمت في JavaScript، يعني هذه القائمة
            // المنسدلة (اقتراحات الإشارة) تظهر بلا أي ظل بصري رغم كونها
            // عنصرًا عائمًا (position: absolute) فوق باقي المحتوى. هذا يبدو
            // باگًا بصريًا سابقًا للترحيل. أُبقي على نفس السلوك القديم هنا
            // (type assertion فقط لإسكات الخطأ) بدل تغيير المظهر ضمن مرحلة
            // الترحيل الآمن؛ إضافة قيمة SHADOWS.lg فعلية (أو استخدام
            // SHADOWS.modal الموجودة) قرار تصميمي منفصل يحتاج مراجعة بصرية.
            boxShadow: (SHADOWS as any).lg,
            zIndex: 100,
            padding: 4,
            display: "flex",
            flexDirection: "column",
            minWidth: 120,
            animation: "fadeIn 0.2s ease"
          }}>
            <div style={{ fontSize: 10, color: CL.textMuted, padding: "4px 8px", fontWeight: 700, borderBottom: `1px solid ${CL.borderFaint}` }}>
              {s.d === "rtl" ? "إشارة إلى:" : "Mention:"}
            </div>
            {SUGGESTIONS.map(name => (
              <button
                key={name}
                onClick={() => insertMention(name)}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: CL.text, 
                  textAlign: "start", 
                  padding: "8px 10px", 
                  fontSize: 13, 
                  borderRadius: RADIUS.sm,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: s.font
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = CL.borderFaint}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ width: 18, height: 18, borderRadius: RADIUS.circle, background: CL.accentDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconUser size={10} color={CL.accent} />
                </div>
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Poll Section */}
      <div style={{ 
        paddingTop: 12, 
        paddingBottom: 4,
        marginBottom: 8, 
        borderTop: `1px solid ${CL.borderFaint}`, 
        display: "flex", 
        flexDirection: "column", 
        gap: 8 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, border: `2px solid ${hasPollContent ? CL.accent : CL.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hasPollContent && <div style={{ width: 6, height: 6, borderRadius: 1, background: CL.accent }} />}
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: hasPollContent ? CL.accent : CL.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {s.d === "rtl" ? "استطلاع رأي" : "Poll"}
          </span>
        </div>

        {pollOptions.map((opt, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input 
                value={opt} 
                onChange={(e) => { 
                  const newOpts = [...pollOptions]; 
                  newOpts[idx] = e.target.value.slice(0, 50); 
                  setPollOptions(newOpts); 
                }} 
                placeholder={(s.d === "rtl" ? "الخيار " : "Option ") + (idx + 1)} 
                style={{ 
                  width: "100%", 
                  background: CL.borderFaint, 
                  border: (opt || "").trim() !== "" ? `1px solid ${CL.accentDim}` : BORDERS.default, 
                  borderRadius: RADIUS.sm, 
                  outline: OUTLINE_NONE, 
                  color: CL.text, 
                  fontSize: 13, 
                  padding: "10px 12px", 
                  fontFamily: s.font, 
                  boxSizing: "border-box", 
                  caretColor: CL.accent,
                  transition: TRANSITIONS.colorChange
                }} 
              />
              {(opt || "").trim() !== "" && (
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                   <IconCheck size={12} color={CL.accent} />
                </div>
              )}
            </div>
            {(pollOptions.length > 2 || (opt || "").trim() !== "") && (
              <button
                type="button"
                onClick={() => removePollOption(idx)}
                style={{
                  ...btn0,
                  width: 32,
                  height: 32,
                  borderRadius: RADIUS.circle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  color: CL.textMuted,
                  border: "none",
                  transition: TRANSITIONS.colorChange,
                }}
              >
                <IconX size={14} color={CL.textMuted} />
              </button>
            )}
          </div>
        ))}
        {pollOptions.length < 4 && (
          <button 
            type="button" 
            onClick={() => setPollOptions([...pollOptions, ""])} 
            style={{ 
              alignSelf: "flex-start", 
              background: "transparent", 
              border: "none", 
              color: CL.accent, 
              fontSize: 12, 
              fontWeight: 700, 
              padding: "4px 0", 
              cursor: "pointer", 
              fontFamily: s.font,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 0 }}>+</span>
            {s.d === "rtl" ? "إضافة خيار" : "Add Option"}
          </button>
        )}
      </div>
      <div style={{ paddingTop: 6, marginBottom: 4, borderTop: `1px solid ${CL.borderFaint}` }}>
        <MdAttachRow
          target="post"
          file={mdFile}
          onRemove={() => {
            setMdFile(null);
          }}
          openMdEditor={openMdEditor}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          CL={CL}
          BORDERS={BORDERS}
          isMobile={isMobile}
          s={s}
          btn0={btn0}
        />
      </div>

      <div style={{ paddingTop: 8, marginBottom: 8, borderTop: `1px solid ${CL.borderFaint}` }}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 100))}
          placeholder={s.notePh}
          maxLength={100}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: OUTLINE_NONE,
            color: CL.textSub,
            fontSize: isMobile ? 16 : 13,
            fontStyle: "italic",
            fontFamily: s.font,
            boxSizing: "border-box",
            caretColor: CL.accent,
            WebkitAppearance: "none",
          }}
        />
        <div style={{ textAlign: s.d === "rtl" ? "left" : "right", fontSize: FONT.badge, color: CL.textMuted, marginTop: 2 }}>
          {s.noteHint(note.length)}
        </div>
      </div>

      <div style={{ paddingTop: 8, marginBottom: 8, borderTop: `1px solid ${CL.borderFaint}` }}>
        <div
          role="radiogroup"
          aria-label={s.catLabel}
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {Object.keys(CATS).map((cat) => {
            const ci = CATS[cat];
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={active}
                ref={active ? activeCatRef : null}
                onClick={() => setCategory(cat)}
                style={{
                  ...btn0,
                  flexShrink: 0,
                  background: active ? ci.bg : CL.borderFaint,
                  border: `1px solid ${active ? ci.color : CL.border}`,
                  borderRadius: RADIUS.md,
                  padding: isMobile ? "9px 14px" : "6px 13px",
                  color: active ? ci.color : CL.textMuted,
                  fontSize: isMobile ? 13 : 12,
                  fontWeight: 700,
                  minHeight: isMobile ? 40 : "auto",
                  transition: TRANSITIONS.colorChange,
                }}
              >
                {s.cat(cat)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          borderTop: `1px solid ${CL.borderFaint}`,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: FONT.caption,
            color: err ? "#D07070" : text.length > 260 ? "#D07070" : CL.textMuted,
            wordBreak: "break-word",
            flex: 1,
            minWidth: 0,
          }}
        >
          {err || s.hint(text.length)}
        </span>
        <button
          onClick={submit}
          disabled={!(text || "").trim() || isBanned || isPosting}
          style={{
            ...btn0,
            background:
              !(text || "").trim() || isBanned || isPosting
                ? CL.accentDim
                : `linear-gradient(135deg,${CL.accent} 0%,#B5552F 100%)`,
            color: !(text || "").trim() || isBanned || isPosting ? CL.textMuted : "#fff",
            border: "none",
            borderRadius: 11,
            padding: isMobile ? "12px 20px" : "9px 20px",
            fontSize: isMobile ? 14 : 13,
            fontWeight: 700,
            flexShrink: 0,
            minHeight: isMobile ? 48 : "auto",
            display: "flex",
            alignItems: "center",
            gap: 7,
            opacity: !(text || "").trim() || isBanned ? 0.6 : isPosting ? 0.85 : 1,
            cursor: isPosting ? "default" : "pointer",
            transition: TRANSITIONS.colorChange,
            boxShadow: !(text || "").trim() || isBanned || isPosting ? "none" : SHADOWS.postBtn,
          }}
        >
          {isPosting && (
            <span
              style={{
                display: "inline-block",
                width: 13,
                height: 13,
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff",
                borderRadius: RADIUS.circle,
                animation: ANIMATIONS.spinBtn,
              }}
            />
          )}
          {isPosting ? s.btnPosting : s.btn}
        </button>
      </div>
    </div>
  );
}

function cardStyleFallback(CL, BORDERS, isMobile, R) {
  return {
    background: CL.surface,
    border: BORDERS.default,
    borderRadius: isMobile ? 14 : 18,
    padding: R.cardPad,
  };
}
