import "./desk-mock.css";

export function DeskMock() {
  return (
    <section className="desk-mock-section" aria-label="Product preview">
      <div className="desk-mock" aria-hidden="true">
        <header className="desk-mock__header">
          <span className="desk-mock__brand">Commons</span>
          <span className="desk-mock__badge">Owner</span>
        </header>

        <div className="desk-mock__desk">
          <div className="desk-mock__main">
            <div className="desk-mock__brief">
              <p className="desk-mock__brief-title">Checkout rewrite</p>
              <p className="desk-mock__brief-line" />
              <p className="desk-mock__brief-line desk-mock__brief-line--short" />
            </div>

            <div className="desk-mock__packet">
              <p className="desk-mock__packet-eyebrow">Open packet</p>
              <p className="desk-mock__packet-question">Ship Friday?</p>
            </div>
          </div>

          <aside className="desk-mock__rail">
            <p className="desk-mock__rail-label">Wall</p>
            <p className="desk-mock__wall-empty">No calls yet</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
