import React, { useCallback, useEffect, useState } from "react";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import { FaRepeat } from "react-icons/fa6";

import apiservice from "../../services/api.service";
import { useShellTheme } from "../../common/ThemeContext";
import ConnectGauge from "./ConnectGauge";
import styles from "./Connect.module.scss";

/** Matches internal/app codeValidity (5 minutes). */
const CODE_TTL_MS = 5 * 60 * 1000;

const PROMPT_TEXT = "Enter this code on your reMarkable under Account settings → Connect";

export default function CodeGenerator() {
  const { layout } = useShellTheme();
  const connect = layout?.connect || {};
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [issuedAt, setIssuedAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  const newCode = useCallback(async () => {
    setCode("");
    setError("");
    try {
      const next = await apiservice.getCode();
      setCode(next);
      setIssuedAt(Date.now());
    } catch (e) {
      setError(e);
    }
  }, []);

  useEffect(() => {
    newCode();
  }, [newCode]);

  useEffect(() => {
    if (!issuedAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [issuedAt]);

  useEffect(() => {
    if (!issuedAt) return;
    if (now - issuedAt >= CODE_TTL_MS) {
      newCode();
    }
  }, [now, issuedAt, newCode]);

  if (error) {
    return <div>{error.message || String(error)}</div>;
  }

  const remaining = Math.max(0, CODE_TTL_MS - (now - issuedAt));
  const progress = issuedAt ? remaining / CODE_TTL_MS : 1;
  const secs = Math.ceil(remaining / 1000);
  const gaugeLabel = issuedAt ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : "";

  const gaugeType = connect.gaugeType || "circle";
  const promptLocation = connect.promptLocation || "above";
  const promptStyle = connect.promptStyle || "plain";

  const prompt = (
    <p
      className={`${styles.prompt} ${styles[`prompt_${promptStyle}`] || ""}`}
      style={{
        color: "var(--rm-connect-prompt-fg)",
        background: promptStyle === "plain" ? "transparent" : "var(--rm-connect-prompt-bg)",
        borderColor: "var(--rm-connect-prompt-border)",
      }}
    >
      {PROMPT_TEXT}
    </p>
  );

  const codeBlock = (
    <div
      className={styles.code}
      style={{
        color: "var(--rm-connect-code-color)",
        fontFamily: "var(--rm-connect-font-family)",
        fontSize: "var(--rm-connect-font-size)",
      }}
    >
      {code || "········"}
    </div>
  );

  const gauge =
    gaugeType !== "none" ? (
      <ConnectGauge type={gaugeType} progress={progress} label={gaugeLabel} />
    ) : (
      <div className={styles.timerOnly} style={{ color: "var(--rm-connect-gauge-text)" }}>
        {gaugeLabel}
      </div>
    );

  const vertical = promptLocation === "above" || promptLocation === "below" || !promptLocation;
  const mainOrder = [];
  if (promptLocation === "above" || promptLocation === "left") mainOrder.push("prompt");
  mainOrder.push("code");
  if (promptLocation === "below" || promptLocation === "right") mainOrder.push("prompt");

  return (
    <div className={styles.page}>
      <Stack gap={4} className={styles.stack} style={{ alignItems: "center" }}>
        <Button onClick={newCode} aria-label="Generate new code">
          <FaRepeat />
        </Button>

        <div
          className={vertical ? styles.column : styles.row}
          data-prompt-location={promptLocation}
        >
          {mainOrder.map((part) =>
            part === "prompt" ? <React.Fragment key="prompt">{prompt}</React.Fragment> : <React.Fragment key="code">{codeBlock}</React.Fragment>
          )}
        </div>

        {gauge}
      </Stack>
    </div>
  );
}
