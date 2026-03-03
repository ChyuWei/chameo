export interface HighlightMark {
  id: string;
  text: string;
  color: string;
  /** CSS selector path to the container element */
  anchorSelector: string;
  /** text offset within the anchor element */
  anchorOffset: number;
  focusOffset: number;
  note?: string;
  createdAt: number;
}

export interface TextSelection {
  text: string;
  context: string;
  /** URL of the page where the selection was made */
  pageUrl: string;
  pageTitle: string;
}
