import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Camera } from "./camera.js"
import { apiFetch } from "../../fetch.js"

import "../../css/overworld.css";

function overworld({coinlings, onRefresh}) {
    const [villages, setVillages] = useState([]);

    // for merging villages
    const [residentAmount, setResidentAmount] = useState({});
    const [draggingVillage, setDraggingVillage] = useState(null);
    const [hoveredVillage, setHoveredVillage] = useState(null);

    const {
        camera,
        MIN_SCALE,
        handleCameraDown,
        handleCameraMove,
        handleCameraUp,
    } = Camera();

    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const suppressClickRef = useRef(false);
    const navigate = useNavigate();

    const fetchVillages = async () => {
        try {
            const token = localStorage.getItem("token");
            const data = await apiFetch("/villages", { token });

            setVillages(data);
        } catch (err) {
            console.error("Failed to load villages:", err);
        }
    };

    // get amount of coinlings inside a village
    const fetchCount = async () => {
        const counts = {};
        for(const v of villages){
            counts[v._id] = coinlings.filter(g => g.village === v._id && !g.dead).length;
        }

        setResidentAmount(counts);
    }

    const updateVillagePosition = async (id, leftPercent, topPercent) => {
        try {
            const token = localStorage.getItem("token");
            await apiFetch(`/villages/${id}/position`, {
                method: "PUT",
                token,
                body: { leftPercent, topPercent },
            });
        } catch (err) {
            console.error("Failed to update village position:", err);
        }
    };

    const canMergeUI = (source, target) => {
        if (!source || !target) return false;
        if (source._id === target._id) return false;
        if (source.capacity !== target.capacity) return false;
        if (source.capacity === 128) return false;
        return true;
    };

    const mergeVillages = async (sourceId, targetId) => {
        try {
            const token = localStorage.getItem("token");
            await apiFetch("/villages/merge", {
                method: "POST",
                token,
                body: { sourceId, targetId },
            });

            await fetchVillages();
            if (onRefresh) await onRefresh();
            return true;
        } catch (err) {
            alert(err.message || "Cannot merge these villages");
            return false;
        }
    };

    // detect if currently dragged village overlaps with another village
    const checkVillageOverlap = (draggingId, leftPercent, topPercent) => {
        for (const v of villages) {
            if (v._id === draggingId) continue;

            const dx = Math.abs(v.leftPercent - leftPercent);
            const dy = Math.abs(v.topPercent - topPercent);

            if (Math.sqrt(dx * dx + dy * dy) < 5) {
                return v;
            }
        }
        return null;
    };

    const handleVillageMouseDown = (e, village) => {
        e.stopPropagation();
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - (rect.left + rect.width / 2),
            y: e.clientY - (rect.top + rect.height / 2),
        };

        setDraggingVillage(village._id);
        suppressClickRef.current = false;
    };

    useEffect(() => {
        fetchVillages();
    }, []);

    // refetch villages when coinlings change
    useEffect(() => {
        fetchVillages();
    }, [coinlings]);

    useEffect(() => {
        fetchCount();
    }, [villages, coinlings]);

    // drag logic
    useEffect(() => {
        if (!draggingVillage) return;

        const handleMouseMove = (e) => {
            const field = document.querySelector(".field > div");
            if (!field) return;

            const rect = field.getBoundingClientRect();

            const leftPercent = Math.min(
                Math.max(((e.clientX - rect.left - dragOffsetRef.current.x) / rect.width) * 100, 0),
                100
            );

            const topPercent = Math.min(
                Math.max(((e.clientY - rect.top - dragOffsetRef.current.y) / rect.height) * 100, 0), 
                100
            );

            const overlappingVillage = checkVillageOverlap(draggingVillage, leftPercent, topPercent);
            setHoveredVillage(overlappingVillage ? overlappingVillage._id : null);

            setVillages((prev) =>
                prev.map((v) =>
                    v._id === draggingVillage ? { ...v, leftPercent, topPercent } : v
                )
            );

            suppressClickRef.current = true;
        };

        const handleMouseUp = async () => {
            const source = villages.find(v => v._id === draggingVillage);
            const target = villages.find(v => v._id === hoveredVillage);

            if (source && target && canMergeUI(source, target)) {
                await mergeVillages(source._id, target._id);
            } else if (source) {
                // if didn't merge update village position
                await updateVillagePosition(source._id, source.leftPercent, source.topPercent);
            }

            setDraggingVillage(null);
            setHoveredVillage(null);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [draggingVillage, villages]);

    const cursorStyle = camera.scale > MIN_SCALE + 0.001 ? "grab" : "default";

    return (
        <div
            className="field"
            onMouseDown={handleCameraDown}
            onMouseMove={handleCameraMove}
            onMouseUp={handleCameraUp}
            onMouseLeave={handleCameraUp}
            style={{cursor: cursorStyle}}
        >
            <div
                style={{
                    width: "300vw",
                    height: "300vh",
                    transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
                    transformOrigin: "top left",
                    position: "relative",
                }}
            >
                {villages.map((v) => {
                    const isDragging = draggingVillage === v._id;
                    const isHovered = hoveredVillage === v._id;
                    const count = residentAmount[v._id] || 0;
                    const source = villages.find(vl => vl._id === draggingVillage);
                    const canMerge = isHovered && source && canMergeUI(source, v);
                    return (
                        <div
                            key={v._id}
                            title={`${v.name || "Village"} (${count}/${v.capacity})`}
                            onMouseDown={(e) => handleVillageMouseDown(e, v)}
                            onClick={(e) => {
                                if (suppressClickRef.current) {
                                    suppressClickRef.current = false;
                                    e.preventDefault();
                                    return;
                                }
                                navigate(`/village/${v._id}`);
                            }}
                            style={{
                                position: "absolute",
                                left: `${v.leftPercent}%`,
                                top: `${v.topPercent}%`,
                                width: "5%",
                                height: "5%",
                                transform: "translate(-50%, -50%)",
                                background: canMerge ? "#22c55e" : isHovered ? "#eab308" : "black",
                                cursor: isDragging ? "grabbing" : "grab",
                                borderRadius: "6px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                border: canMerge ? "3px solid #16a34a" : isHovered ? "3px solid #ca8a04" : "none",
                                transition: isDragging ? "none" : "background 0.2s",
                            }}
                        >
                            <div>{v.name || "V"}</div>
                            <div style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                                {count}/{v.capacity}
                            </div>
                            {canMerge && (
                                <div style={{ fontSize: "0.6rem", marginTop: "2px", fontWeight: "bold" }}>
                                    MERGE!
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default overworld;