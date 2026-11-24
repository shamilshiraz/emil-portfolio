
import React from "react";

const Loader = () => {
  return (
    <section className="track" id="track">
      <div className="stage" id="stage">
        <div className="row" id="row">
          <span className="word" id="left">
            Emil
          </span>

          <div className="slot" id="slot">
            <div className="site" id="site">
              <canvas id="cv"></canvas>

              <div className="txt" id="txt">
                <div>Emil Hassan</div>

                <div className="role">
                  <span>Creative</span>

                  <span className="cyc" id="cyc">
                    <span id="typed"></span>
                    <i className="caret" id="caret"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span className="word" id="right">
            Hassan
          </span>
        </div>
      </div>
    </section>
  );
};

export default Loader;
