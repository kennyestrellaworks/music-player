<button
  type="button"
  className="panel-open__left"
  onClick={() => setIsLeftPanelOpen((prev) => !prev)}
  aria-label={isLeftPanelOpen ? "Collapse left panel" : "Expand left panel"}
  aria-pressed={isLeftPanelOpen}
></button>;
