import { useState, useCallback } from "react";

export function useMdEditor({ setMdFile, setCommentMdFile, setReplyMdFile }) {
  const [mdEditorState, setMdEditorState] = useState(null);

  const openMdEditor = useCallback((target, existingFile) => {
    setMdEditorState({ target, file: existingFile || { name: "", content: "" } });
  }, []);

  const closeMdEditor = useCallback(() => {
    setMdEditorState(null);
  }, []);

  const saveMdEditor = useCallback((file) => {
    if (mdEditorState?.target === "post") setMdFile(file);
    else if (mdEditorState?.target === "comment") setCommentMdFile(file);
    else if (mdEditorState?.target === "reply") setReplyMdFile(file);
    closeMdEditor();
  }, [mdEditorState, closeMdEditor, setMdFile, setCommentMdFile, setReplyMdFile]);

  return {
    mdEditorState,
    openMdEditor,
    closeMdEditor,
    saveMdEditor,
  };
}

export default useMdEditor;
