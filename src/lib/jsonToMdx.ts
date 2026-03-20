import type { LLMResponse, LLMOption } from "../types/llmResponse";

function prop(value: unknown): string {
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  return `{${JSON.stringify(value)}}`;
}

function choiceOrWidget(
  question: unknown,
  options: LLMOption[],
  selectedOption?: string,
): string {
  // Always emit <Choices /> — when selectedOption is set, pass it as a prop
  // so the component renders the frozen/selected UI instead of interactive buttons.
  if (selectedOption) {
    return `<Choices\n  question=${prop(question)}\n  options={${JSON.stringify(options)}}\n  selectedOption=${prop(selectedOption)}\n/>`;
  }
  return `<Choices\n  question=${prop(question)}\n  options={${JSON.stringify(options)}}\n/>`;
}

export function jsonToMdx(
  response: LLMResponse,
  selectedOption?: string,
): string {
  const parts: string[] = [];

  // Alert always first
  if (response.alert) {
    const { severity, title, body } = response.alert;
    parts.push(
      `<Alert severity="${severity}" title="${title}" body="${body.replace(/"/g, '\\"')}" />`,
    );
  }

  const rt = response.response_type;

  // Title — skip for notfound (title is a prop on <NotFound />, not a heading)
  if (response.title && rt !== "notfound") {
    parts.push(`## ${response.title}`);
  }

  // Intro — skip for notfound (passed as message prop to <NotFound />)
  if (response.intro && rt !== "notfound") {
    parts.push(response.intro);
  }

  // ── answer ────────────────────────────────────────────────────────────
  if (rt === "answer") {
    if (response.chart) {
      parts.push(`<Mermaid chart={${JSON.stringify(response.chart)}} />`);
    }
    if (response.steps?.length) {
      const followUp = response.followUp
        ? `\n  followUp=${prop(response.followUp)}`
        : "";
      parts.push(
        `<Steps\n  steps={${JSON.stringify(response.steps)}}${followUp}\n/>`,
      );
    }
    if (response.glossaryItems?.length) {
      parts.push(
        `<Glossary\n  items={${JSON.stringify(response.glossaryItems)}}\n/>`,
      );
    }
    if (response.items?.length) {
      parts.push(
        `<Checklist\n  title=${prop(response.title)}\n  items={${JSON.stringify(response.items)}}\n/>`,
      );
    }
    if (response.options?.length) {
      parts.push(
        choiceOrWidget(response.title, response.options, selectedOption),
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

  // ── options ───────────────────────────────────────────────────────────
  if (rt === "options") {
    if (response.options?.length) {
      parts.push(
        choiceOrWidget(response.title, response.options, selectedOption),
      );
    }
  }

  // ── mixed ─────────────────────────────────────────────────────────────
  if (rt === "mixed") {
    if (response.chart) {
      parts.push(`<Mermaid chart={${JSON.stringify(response.chart)}} />`);
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
        choiceOrWidget(response.title, response.options, selectedOption),
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

  // ── notfound ──────────────────────────────────────────────────────────
  if (rt === "notfound") {
    parts.push(
      `<NotFound\n  title=${prop(response.title)}\n  message=${prop(response.intro ?? "I can help you troubleshoot — try rephrasing or asking something more specific. Here are a few examples of what I can help with:")}\n/>`,
    );
    if (response.options?.length) {
      parts.push(
        choiceOrWidget(
          response.title || response.intro || "",
          response.options,
          selectedOption,
        ),
      );
    }
  }

  // ── clarify ───────────────────────────────────────────────────────────
  if (rt === "clarify") {
    if (response.options?.length) {
      parts.push(
        choiceOrWidget(
          response.title || response.intro || "",
          response.options,
          selectedOption,
        ),
      );
    }
  }

  // Escalation always last before followUp
  if (response.escalation) {
    const { title, message, reason } = response.escalation;
    const reasonStr = reason ? `\n  reason=${prop(reason)}` : "";
    parts.push(
      `<Escalation\n  title=${prop(title)}\n  message=${prop(message)}${reasonStr}\n/>`,
    );
  }

  // Standalone followUp
  if (response.followUp) {
    parts.push(`<FollowUp question=${prop(response.followUp)} />`);
  }

  return parts.join("\n\n");
}
