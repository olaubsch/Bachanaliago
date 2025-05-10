import { useEffect, useRef } from "react";
import { gsap } from "gsap";
// If you have DrawSVGPlugin:
// import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
// gsap.registerPlugin(DrawSVGPlugin);

export default function ZigzagBackground() {
    const pathRef = useRef(null);

    useEffect(() => {
        const path = pathRef.current;
        const length = path.getTotalLength();

        // Double the dash array
        path.style.strokeDasharray = length * 2;
        path.style.strokeDashoffset = 0;

        // Animate from 0 → length*2, then loop
        gsap.to(path, {
            strokeDashoffset: 1,
            duration: 10,
            repeat: -1,
            ease: "linear",
            // If you prefer wrapping via modifiers instead:
            // modifiers: {
            //   strokeDashoffset: (offset) => gsap.utils.wrap(0, length * 2, parseFloat(offset))
            // }
        });
    }, []);

    return (
        <svg
            className="zigzagSVG"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none",
            }}
            viewBox="0 0 200 300"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                pathLength="1"
                ref={pathRef}
                d="M100,-10 Q 0,50 100,90 T 100,170 T 100,250 T 100,330"
                fill="none"
                stroke="#C4BACE"
                strokeWidth="32"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
