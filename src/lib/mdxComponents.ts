/**
 * lib/mdxComponents.ts
 * --------------------
 * Single source of truth for all components available inside MDX strings.
 */

import { Alert } from "../mdx-components/Alert";
import { Steps } from "../mdx-components/Steps";
import { Checklist } from "../mdx-components/Checklist";
import { Choices } from "../mdx-components/Choices";
import { Escalation } from "../mdx-components/Escalation";
import { Summary } from "../mdx-components/Summary";
import { Mermaid } from "../mdx-components/Mermaid";
import { FunnelChart } from "../mdx-components/FunnelChart";
import { Faq } from "../mdx-components/Faq";
import { QuotaExceeded } from "../mdx-components/QuotaExceeded";

export const mdxComponents = {
  Alert,
  Steps,
  Checklist,
  Choices,
  Escalation,
  Summary,
  Mermaid,
  FunnelChart,
  Faq,
  QuotaExceeded,
};
