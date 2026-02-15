# ZARIA UI Snapshot

## UI checklist (dark + light)
- Buttons: default / hover / disabled
- Textarea: focus / placeholder / disabled
- Card highlight: hover / focus-within
- Result panel readability
- Spacing rhythm: shell / card / header / body / actions
- Reduced motion: hover/focus states without animation

## Manual screenshots to capture (6)
1. Dark mode: module idle (default state)
2. Dark mode: card hover highlight + buttons hover
3. Dark mode: textarea focus + actions visible
4. Light mode: module idle (default state)
5. Light mode: card focus-within highlight + buttons hover
6. Light mode: textarea focus + result panel visible

## Accept/Reject criteria
- Accept: spacing is consistent and aligned across shell/card/header/body/actions
- Accept: borders use subtle silver by default and gold on focus/primary
- Accept: highlights are visible but not overpowering in both themes
- Reject: any hover/focus breaks layout, clips content, or reduces readability
- Reject: reduced-motion mode still animates or transforms elements
