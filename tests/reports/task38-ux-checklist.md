# Task 38 — Widget UX Sanity Checklist

**How to use:**
Open the app in your browser with a valid token. Go through each item manually. Mark ✅ pass or ❌ fail. Add notes where needed.

---

## 1. Auth Gate

| #   | Check                                                                                              | Result | Notes |
| --- | -------------------------------------------------------------------------------------------------- | ------ | ----- |
| A01 | App loads without a token — shows a readable "not authorised" message, not a blank screen or crash |        |       |
| A02 | App loads with an expired token — shows session expired message clearly                            |        |       |
| A03 | App loads with a valid token — goes straight to chat, no extra steps needed                        |        |       |

---

## 2. First Message

| #   | Check                                                  | Result | Notes |
| --- | ------------------------------------------------------ | ------ | ----- |
| B01 | Input box is visible and focused on load               |        |       |
| B02 | Send button is clearly identifiable                    |        |       |
| B03 | Pressing Enter sends the message                       |        |       |
| B04 | Loading indicator appears while waiting for response   |        |       |
| B05 | Loading indicator disappears when response arrives     |        |       |
| B06 | User message appears in chat immediately after sending |        |       |

---

## 3. Response Rendering

| #   | Check                                                                      | Result | Notes |
| --- | -------------------------------------------------------------------------- | ------ | ----- |
| C01 | Direct answer — response text is readable, no raw markdown symbols visible |        |       |
| C02 | Numbered steps — each step is on its own line, clearly numbered            |        |       |
| C03 | Options type — each option is shown as a clickable item or button          |        |       |
| C04 | Clicking an option sends it as the next message                            |        |       |
| C05 | Clarification question — question text is clearly shown                    |        |       |
| C06 | Clarification — input area is available to type a response                 |        |       |
| C07 | Mixed type — both narrative and conditional sections are visible           |        |       |
| C08 | Escalation section — appears at the bottom of the response                 |        |       |
| C09 | Escalation section — is not cut off or hidden below the fold               |        |       |
| C10 | Long response — page or chat area scrolls, nothing overflows               |        |       |

---

## 4. Citations

| #   | Check                                                | Result | Notes |
| --- | ---------------------------------------------------- | ------ | ----- |
| D01 | Citations are shown when present                     |        |       |
| D02 | Source filename is readable                          |        |       |
| D03 | No citations shown on clarify or not_found responses |        |       |

---

## 5. Not Found / Fallback

| #   | Check                                                               | Result | Notes |
| --- | ------------------------------------------------------------------- | ------ | ----- |
| E01 | Out of scope question — fallback message is shown, not a blank area |        |       |
| E02 | Fallback message is readable and not a raw error                    |        |       |

---

## 6. Error States

| #   | Check                                                          | Result | Notes |
| --- | -------------------------------------------------------------- | ------ | ----- |
| F01 | API failure — user sees a readable error message, not a crash  |        |       |
| F02 | Error message does not expose raw stack trace or API internals |        |       |
| F03 | Quota exceeded — message is clear and tells user what to do    |        |       |
| F04 | After an error — input box is still usable, user can try again |        |       |

---

## 7. Session and Sidebar

| #   | Check                                                   | Result | Notes |
| --- | ------------------------------------------------------- | ------ | ----- |
| G01 | Session title appears after first response              |        |       |
| G02 | Session title is 6 words or fewer                       |        |       |
| G03 | Previous sessions are listed in sidebar                 |        |       |
| G04 | Clicking a previous session loads its history correctly |        |       |
| G05 | Starting a new session clears the chat area             |        |       |

---

## 8. General Usability

| #   | Check                                                 | Result | Notes |
| --- | ----------------------------------------------------- | ------ | ----- |
| H01 | Font size is readable without zooming                 |        |       |
| H02 | Contrast between text and background is sufficient    |        |       |
| H03 | Input box does not block any part of the last message |        |       |
| H04 | App is usable at 1280x800 resolution                  |        |       |
| H05 | App is usable at 1920x1080 resolution                 |        |       |

---

## Summary

| Category            | Total  | Passed | Failed |
| ------------------- | ------ | ------ | ------ |
| Auth Gate           | 3      |        |        |
| First Message       | 6      |        |        |
| Response Rendering  | 10     |        |        |
| Citations           | 3      |        |        |
| Not Found           | 2      |        |        |
| Error States        | 4      |        |        |
| Session and Sidebar | 5      |        |        |
| General Usability   | 5      |        |        |
| **Total**           | **38** |        |        |

---

**Tester:**
**Date:**
**Browser:**
**Token source:** URL param / VITE_DEV_TOKEN
**Known issues:**
