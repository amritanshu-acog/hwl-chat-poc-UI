/**
 * lib/jsonToMdx.ts
 */

import type { LLMResponse } from "../types/llmResponse";

function prop(value: unknown): string {
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  return `{${JSON.stringify(value)}}`;
}

export function jsonToMdx(response: LLMResponse): string {
  const parts: string[] = [];

  // Alert always first
  if (response.alert) {
    const { severity, title, body } = response.alert;
    parts.push(
      `<Alert severity="${severity}" title="${title}" body="${body.replace(/"/g, '\\"')}" />`,
    );
  }

  // Title
  if (response.title) {
    parts.push(`## ${response.title}`);
  }

  // Intro
  if (response.intro) {
    parts.push(response.intro);
  }

  const rt = response.response_type;

  // ── faq ──────────────────────────────────────────────────────────────────
  if (rt === "faq") {
    if (response.faqItems?.length) {
      parts.push(`<Faq\n  items={${JSON.stringify(response.faqItems)}}\n/>`);
    }
  }

  // ── quota_exceeded ────────────────────────────────────────────────────────
  if (rt === "quota_exceeded") {
    const msgStr = response.quotaMessage
      ? `\n  message=${prop(response.quotaMessage)}`
      : "";
    parts.push(`<QuotaExceeded${msgStr} />`);
  }

  // ── answer / clarify / options ────────────────────────────────────────────
  if (rt === "answer" || rt === "clarify" || rt === "options") {
    if (response.steps?.length) {
      const followUp = response.followUp
        ? `\n  followUp=${prop(response.followUp)}`
        : "";
      parts.push(
        `<Steps\n  steps={${JSON.stringify(response.steps)}}${followUp}\n/>`,
      );
    }
    if (response.items?.length) {
      parts.push(
        `<Checklist\n  title=${prop(response.title)}\n  items={${JSON.stringify(response.items)}}\n/>`,
      );
    }
    if (response.options?.length) {
      parts.push(
        `<Choices\n  question=${prop(response.title)}\n  options={${JSON.stringify(response.options)}}\n/>`,
      );
    }
    if (response.summary) {
      const { title, body, actions } = response.summary;
      const actionsStr = actions?.length
        ? `\n  actions={${JSON.stringify(actions)}}`
        : "";
      parts.push(
        `<Summary\n  title=${prop(title)}\n  body=${prop(body)}${actionsStr}\n/>`,
      );
    }
  }

  // ── mixed ─────────────────────────────────────────────────────────────────
  if (rt === "mixed") {
    if (response.chart) {
      const chart = response.chart.replace(/`/g, "\\`");
      parts.push(`<Mermaid chart={\`${chart}\`} />`);
    }
    if (response.stages?.length) {
      parts.push(
        `<FunnelChart\n  title=${prop(response.title)}\n  stages={${JSON.stringify(response.stages)}}\n/>`,
      );
    }
    if (response.steps?.length) {
      const followUp = response.followUp
        ? `\n  followUp=${prop(response.followUp)}`
        : "";
      parts.push(
        `<Steps\n  steps={${JSON.stringify(response.steps)}}${followUp}\n/>`,
      );
    }
    if (response.items?.length) {
      parts.push(
        `<Checklist\n  title=${prop(response.title)}\n  items={${JSON.stringify(response.items)}}\n/>`,
      );
    }
    if (response.options?.length) {
      parts.push(
        `<Choices\n  question=${prop(response.title)}\n  options={${JSON.stringify(response.options)}}\n/>`,
      );
    }
    if (response.summary) {
      const { title, body, actions } = response.summary;
      const actionsStr = actions?.length
        ? `\n  actions={${JSON.stringify(actions)}}`
        : "";
      parts.push(
        `<Summary\n  title=${prop(title)}\n  body=${prop(body)}${actionsStr}\n/>`,
      );
    }
  }

  if (rt === "notfound") {
    if (response.options?.length) {
      parts.push(
        `<Choices\n  question=${prop(response.title)}\n  options={${JSON.stringify(response.options)}}\n/>`,
      );
    }
  }

  // Escalation always last (if present)
  if (response.escalation) {
    const { title, message, reason } = response.escalation;
    const reasonStr = reason ? `\n  reason=${prop(reason)}` : "";
    parts.push(
      `<Escalation\n  title=${prop(title)}\n  message=${prop(message)}${reasonStr}\n/>`,
    );
  }

  return parts.join("\n\n");
}
