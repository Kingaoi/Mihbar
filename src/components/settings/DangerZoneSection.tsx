import { IconAlertTriangle, IconTrash, IconUnlock } from "../Icons";
import { FONT, RADIUS } from "../../constants/index";

export default function DangerZoneSection({
  confirmPurgeContent,
  confirmPurgeOwnershipOnly,
  CL,
  BORDERS,
  isMobile,
  s,
  btn0,
}) {
  return (
    <>
      <div
        style={{
          fontSize: FONT.caption,
          color: CL.danger,
          fontWeight: 700,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <IconAlertTriangle size={13} color={CL.danger} /> {s.settingsDangerZone}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={confirmPurgeContent}
          className="pressable"
          style={{
            ...btn0,
            textAlign: s.d === "rtl" ? "right" : "left",
            background: CL.dangerDim,
            border: BORDERS.danger,
            borderRadius: RADIUS.md,
            padding: isMobile ? "13px 14px" : "11px 14px",
            color: CL.danger,
            fontSize: FONT.body,
            fontWeight: 700,
            minHeight: isMobile ? 46 : "auto",
          }}
        >
          <span style={{ display: "inline-flex", verticalAlign: "middle", marginInlineEnd: 6 }}>
            <IconTrash size={14} color={CL.danger} />
          </span>
          {s.deleteContentBtn}
        </button>
        <button
          onClick={confirmPurgeOwnershipOnly}
          className="pressable"
          style={{
            ...btn0,
            textAlign: s.d === "rtl" ? "right" : "left",
            background: CL.flagDim,
            border: BORDERS.flag,
            borderRadius: RADIUS.md,
            padding: isMobile ? "13px 14px" : "11px 14px",
            color: CL.flag,
            fontSize: FONT.body,
            fontWeight: 700,
            minHeight: isMobile ? 46 : "auto",
          }}
        >
          <span style={{ display: "inline-flex", verticalAlign: "middle", marginInlineEnd: 6 }}>
            <IconUnlock size={14} color={CL.flag} />
          </span>
          {s.deleteOwnershipBtn}
        </button>
      </div>
    </>
  );
}
