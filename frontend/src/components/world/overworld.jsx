import useCoinlings from "./useCoinlings.js"
import Coinling from "./coinling.jsx"
import {Camera} from "./camera.js"

import "../../css/overworld.css"

function overworld({ coinlings = [] }){
    const count = coinlings.length;
    const{positions, setPositions} = useCoinlings(count);

    // camera hook provides viewport dimensions and zoom/pan controls that update on window resize
    const{
        camera,
        MIN_SCALE,
        handleCameraDown,
        handleCameraMove,
        handleCameraUp,
    } = Camera();

    // dynamic cursor style 
    const cursorStyle = camera.scale > MIN_SCALE + 0.001 ? "grab" : "default";

    return(
        // field container: responsive viewport that fills entire screen and adapts to window resize
        <div
            className="field"
            onMouseDown={handleCameraDown}
            onMouseMove={handleCameraMove}
            onMouseUp={handleCameraUp}
            onMouseLeave={handleCameraUp}
            style={{ cursor: cursorStyle }}
        >
            {/* world layer: 3x viewport size with camera transform applied for responsive pan/zoom */}
            <div
                style={{
                    width: "300vw",
                    height: "300vh",
                    transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
                    transformOrigin: "top left",
                    position: "relative",
                }}
            >
                {positions.map((p, i) => (
                    <Coinling
                        key={i}
                        position={p}
                        canDrag={camera.scale <= MIN_SCALE + 0.001}
                        onMove={(newLeftPercent, newTopPercent) => {
                            setPositions((prev) =>
                                prev.map((pos, idx) =>
                                    idx === i ? {
                                        ...pos,
                                        dragging: true,
                                        left: Math.min(Math.max(newLeftPercent, 0), 100),
                                        top: Math.min(Math.max(newTopPercent, 0), 100),
                                    } : pos
                                )
                            );
                        }}

                        onDragEnd={() => {
                            setPositions((prev) =>
                                prev.map((pos, idx) =>
                                    idx === i ? { ...pos, dragging: false } : pos
                                )
                            );
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default overworld;