import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Coinling from "./coinling.jsx"
import useCoinlings from "./useCoinlings.js"
import Dialogue from "./dialogue.jsx"
import { Camera } from "./camera.js"
import { apiFetch } from "../../fetch.js"

function view() {
    const { id } = useParams();
    const [village, setVillage] = useState(null);
    const [selected, setSelected] = useState(null); 
    const [coinlings, setCoinlings] = useState([]);
    const { 
        camera, 
        MIN_SCALE, 
        // used to tell if scroll wheel was used
        lastWheel,
        handleCameraDown, 
        handleCameraMove, 
        handleCameraUp } 
    = Camera();

    // calculate accessible area based on current village capacity
    const getPlayableAreaPercent = (capacity) => {
        const capacityToPercent = {
            2: 12.5,
            4: 17.677,
            8: 25,
            16: 35.355,
            32: 50,
            64: 70.711,
            128: 100
        };
        return capacityToPercent[capacity] || 12.5;
    };

    const playableAreaPercent = village ? getPlayableAreaPercent(village.capacity) : 100;
    const centerOffset = (100 - playableAreaPercent) / 2;

    // helper to close selected dialogue and unpause/resume the coinling
    const closeSelected = (sel = selected) => {
        if (!sel) return;

        const i = sel.index;
        const coinlingEl = document.querySelectorAll(".coinling");
        const el = coinlingEl[i];
        if (el) el.style.transition = "none";

        setPositions((prev) =>
            prev.map((pos, idx) =>
                idx === i
                    ? {
                        ...pos,
                        paused: false,
                        forceStop: false,
                        duration: 3 + Math.random() * 2,
                        targetTop: centerOffset + Math.random() * playableAreaPercent,
                        targetLeft: centerOffset + Math.random() * playableAreaPercent,
                    }
                    : pos
            )
        );

        setSelected(null);
    };

    // close dialogue whenever the user uses the scroll wheel; ensures coinling is unpaused
    useEffect(() => {
        if (!selected) return;
        // lastWheel updates on any wheel event
        closeSelected();
    }, [lastWheel]);

    // recalculate rect based on camera
    useEffect(() => {
        if (!selected) return;

        const el = document.querySelectorAll(".coinling")[selected.index];
        if (!el) return;

        const rect = el.getBoundingClientRect();
        setSelected(prev => ({ ...prev, rect }));
    }, [camera.scale]);

    useEffect(() => {
        async function fetchVillage() {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
                const token = userInfo.token;
                const payload = await apiFetch(`/villages/${id}`, {token});

                setVillage(payload.village);
                setCoinlings(payload.coinlings || []);
            } catch (err) {
                console.error("Failed to load village:", err);
            }
        }
        fetchVillage();
    }, [id]);

    const count = coinlings.length;
    const {positions, setPositions} = useCoinlings(count, playableAreaPercent, centerOffset);

    return (
        <div
            className="field"
            onMouseDown={handleCameraDown}
            onMouseMove={handleCameraMove}
            onMouseUp={handleCameraUp}
            onMouseLeave={handleCameraUp}
            style={{ cursor: camera.scale > MIN_SCALE + 0.001 ? "grab" : "default" }}
        >
            <div
                style={{
                    width: "300vw",
                    height: "300vh",
                    transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
                    transformOrigin: "top left",
                    position: "relative",
                    background: "#000", // non accessible area is black
                }}
            >
                {/* accessible area container */}
                <div
                    style={{
                        position: "absolute",
                        top: `${centerOffset}%`,
                        left: `${centerOffset}%`,
                        width: `${playableAreaPercent}%`,
                        height: `${playableAreaPercent}%`,
                        background: "#fff",
                        pointerEvents: "none",
                    }}
                    className="playable-area"
                ></div>

                {positions.map((p, i) => (
                    <Coinling
                        key={i}
                        coinling={coinlings[i]}
                        ref={(el) => {
                            if (el && selected?.index === i && !selected.rect) {
                                const rect = el.getBoundingClientRect();
                                setSelected((prev) => ({...prev, rect}));
                            }
                        }}
                        position={p}
                        canDrag={camera.scale <= MIN_SCALE + 0.001}
                        playableAreaPercent={playableAreaPercent}
                        playableAreaOffset={centerOffset}
                        onClick={(e) => {
                            // immediately stop transition when clicked
                            const el = e.currentTarget;
                            const field = document.querySelector(".field > div");
                            if (!field) return;

                            const fieldRect = field.getBoundingClientRect();
                            const rect = el.getBoundingClientRect();

                            const leftPercent = ((rect.left - fieldRect.left) / fieldRect.width) * 100;
                            const topPercent = ((rect.top - fieldRect.top) / fieldRect.height) * 100;

                            el.style.transition = "none";

                            el.style.left = `${leftPercent}%`;
                            el.style.top = `${topPercent}%`;

                            setPositions(prev =>
                                prev.map((pos, idx) =>
                                    idx === i
                                        ? {
                                            ...pos,
                                            top: topPercent,
                                            left: leftPercent,
                                            targetTop: topPercent,
                                            targetLeft: leftPercent,
                                            paused: true,
                                            forceStop: true,
                                            duration: 0
                                        }
                                        : pos
                                )
                            );

                            setSelected({index: i, rect: null});
                        }}
                        onMove={(newLeftPercent, newTopPercent) => {
                            // constrain movement to accessible area
                            const minPos = centerOffset;
                            const maxPos = centerOffset + playableAreaPercent;
                            
                            const constrainedLeft = Math.min(Math.max(newLeftPercent, minPos), maxPos);
                            const constrainedTop = Math.min(Math.max(newTopPercent, minPos), maxPos);
                            
                            setPositions((prev) =>
                                prev.map((pos, idx) =>
                                    idx === i
                                        ? {
                                            ...pos,
                                            dragging: true,
                                            left: constrainedLeft,
                                            top: constrainedTop,
                                        }
                                        : pos
                                )
                            );
                        }}
                        onDragEnd={() => {
                            setPositions((prev) =>
                                prev.map((pos, idx) => (idx === i ? {...pos, dragging: false} : pos))
                            );
                        }}
                    />
                ))}

                {selected?.rect && (
                    <Dialogue
                        coinling={{...coinlings[selected.index], position: positions[selected.index]}}
                        screenRect={selected.rect}
                        cameraScale={camera.scale}
                        onNameUpdated={(updatedCoinling) => {
                            setCoinlings((prev) =>
                                prev.map((c, idx) =>
                                    idx === selected.index ? updatedCoinling : c
                                )
                            );
                        }}
                        onClose={() => {
                            const coinlingEl = document.querySelectorAll(".coinling");
                            const el = coinlingEl[selected.index];

                            if (el) el.style.transition = "";

                            setPositions((prev) =>
                                prev.map((pos, idx) =>
                                    idx === selected.index
                                        ? {
                                            ...pos,
                                            paused: false,
                                            forceStop: false,
                                            duration: 3 + Math.random() * 2,
                                            targetTop: centerOffset + Math.random() * playableAreaPercent,
                                            targetLeft: centerOffset + Math.random() * playableAreaPercent
                                        }
                                        : pos
                                )
                            );
                            setSelected(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default view;