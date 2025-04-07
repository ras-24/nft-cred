interface HTMLElement {
  dataset: {
    theme?: string;
    forcedTheme?: string;
    [key: string]: string | undefined;
  }
}

interface DocumentElement extends HTMLElement {
  classList: DOMTokenList;
}
