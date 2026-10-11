type Tool = {
  name: string;
  description: string;
  url: string;
  type?: string;
};

const tools: Tool[] = [
  {
    name: "INVOICE GENERATOR",
    description:
      "Create a clean invoice, update totals as you work, and download a PDF. Free to use, with your details kept on your device.",
    url: "/tools/invoice-generator/",
    type: "LIVE \u00b7 FREE",
  },
  {
    name: "PDF EDITOR",
    description:
      "Edit supported PDF text, move or erase detected objects, and add text. Files stay on your device.",
    url: "/tools/pdf-editor/",
    type: "POC \u00b7 FREE",
  },
];

export default function Tools() {
  return (
    <section id="tools" className="content-section tools-section">
      <div className="section-container">
        <div className="section-intro">
          <p className="section-eyebrow">FREE TOOLS</p>
          <h2>
            USE THEM,
            <br />
            FREE.
          </h2>
        </div>

        <p className="tools-description">
          Small, practical web apps built to make everyday work easier.
        </p>

        {tools.length > 0 ? (
          <div className="tools-grid">
            {tools.map((tool, index) => (
              <article className="tool-card" key={tool.name}>
                <div className="tool-card-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {tool.type && <span className="tool-status">{tool.type}</span>}
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <a href={tool.url}>
                  Open free {tool.name.toLowerCase()} <span aria-hidden="true">&#8599;&#65038;</span>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="tools-empty-state">
            <span className="tools-empty-index" aria-hidden="true">01</span>
            <p>Your tools will appear here as you add them.</p>
          </div>
        )}
      </div>
    </section>
  );
}
