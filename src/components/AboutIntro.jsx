
import React from "react";

export default function AboutIntro() {
  return (
    <>
      <style>{`
        .about-intro {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 24px;
          box-sizing: border-box;
          background: transparent;
          text-align: center;
        }

        .about-intro-text {
          max-width: 780px;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(26px, 3.3vw, 38px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.035em;
          color: #111;
        }

        .about-intro-highlight {
          color: #292d83;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }

        @media (max-width: 600px) {
          .about-intro {
            min-height: 100vh;
            padding: 80px 24px;
          }

          .about-intro-text {
            font-size: clamp(25px, 7vw, 32px);
            line-height: 1.15;
            letter-spacing: -0.025em;
          }
        }
      `}</style>

      <section className="about-intro">
        <p className="about-intro-text">
          I do my best work bringing order to chaos connecting{" "}
          <span className="about-intro-highlight">ideas</span>, turning loose
          thoughts into something tangible, building brands with a{" "}
          <span className="about-intro-highlight">point of view</span>, or
          creating experiences that make people{" "}
          <span className="about-intro-highlight">feel</span> something.
        </p>
      </section>
    </>
  );
}
