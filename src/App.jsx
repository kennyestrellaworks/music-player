import "./App.css";

function App() {
  return (
    <main className="artwork" aria-label="Centered portrait artwork">
      <div className="artwork__glow" aria-hidden="true" />
      <div className="artwork__composition">
        <img
          className="artwork__head"
          src="/images/head.png"
          alt="Green-toned portrait with closed eyes"
        />
        <img className="artwork__forehead" src="/images/forehead.png" alt="" />
        <div className="left-panel">
          <div className="panel-wrap">
            <img
              className="artwork__panel artwork__panel--left"
              src="/images/left-panel.png"
              alt=""
            />
            <div className="left-panel__content">
              <img
                className="panel-open__left"
                src="/images/panel-open-bg.png"
                alt=""
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="panel-wrap">
            <img
              className="artwork__panel artwork__panel--right"
              src="/images/right-panel.png"
              alt=""
            />
            <div className="right-panel__content">
              <img
                className="panel-open__right"
                src="/images/panel-open-bg.png"
                alt=""
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
