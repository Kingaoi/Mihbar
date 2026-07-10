import { motion, AnimatePresence } from "motion/react";
import { IconX } from "./Icons";
import { RADIUS } from "../constants/index";
import PostInput from "./PostInput";

// ملاحظة (Motion migration): كان يستقبل floatingModalVisible/floatingModalClosing
// مُدارَين يدويًا. الآن يستقبل isOpen مباشرة، وAnimatePresence يتولى
// أنيميشن الدخول/الخروج (overlay fade + card pop) داخليًا.
export function FloatingPostModal({
  isOpen,
  setFloatingPostOpen,
  text, setText, note, setNote, category, setCategory,
  mdFile, setMdFile, videoUrl, setVideoUrl, pollOptions, setPollOptions, isBanned,
  isPosting, submit, err, setErr, openMdEditor, activeCatRef,
  CL, BORDERS, isMobile, s, btn0, inputBase, R
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="floating-post-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
            boxSizing: "border-box",
          }}
          onClick={() => setFloatingPostOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{
              width: "100%",
              maxWidth: 500,
              background: CL.surface,
              borderRadius: 18,
              boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${CL.borderFaint}` }}>
              <h3 style={{ margin: 0, fontSize: 16, color: CL.text }}>{s.newPost || "منشور جديد"}</h3>
              <button
                onClick={() => setFloatingPostOpen(false)}
                className="pressable"
                style={{ ...btn0, background: "none", border: "none", color: CL.textMuted, display: "flex", padding: 4, cursor: "pointer" }}
              >
                <IconX size={20} color={CL.textMuted} />
              </button>
            </div>
            <div style={{ padding: 10, maxHeight: "80vh", overflowY: "auto", scrollbarWidth: "none" }}>
              <PostInput
                text={text} setText={setText} note={note} setNote={setNote} category={category} setCategory={setCategory}
                mdFile={mdFile} setMdFile={setMdFile} videoUrl={videoUrl} setVideoUrl={setVideoUrl} pollOptions={pollOptions} setPollOptions={setPollOptions} isBanned={isBanned}
                isPosting={isPosting}
                submit={() => {
                  submit();
                  setFloatingPostOpen(false);
                }}
                err={err} setErr={setErr} openMdEditor={openMdEditor} activeCatRef={activeCatRef}
                currentPlaceholder={s.PLACEHOLDERS[0]} radiusXl={(RADIUS as any).xl || 18} CL={CL} BORDERS={BORDERS} isMobile={isMobile} s={s}
                btn0={btn0} inputBase={inputBase} R={R}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
