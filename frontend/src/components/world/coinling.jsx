import { useState, useEffect } from "react"

function coinling({ position, onMove, onDragEnd, canDrag = true}){
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const {top, left, targetTop, targetLeft, duration} = position;
    const isMoving = Math.abs(left - targetLeft) > 0.5 || Math.abs(top - targetTop) > 0.5;

    // handles when coinling is clicked 
    const handleMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();

        // prevents drag if zoomed in (if canDrag = false then is zoomed in)
        if(!canDrag) return;
        
        const rect = e.target.getBoundingClientRect();

        // match the location of the mouse when dragging
        setOffset({x: e.clientX - rect.left, y: e.clientY - rect.top});
        setDragging(true);
    }

    // logic for dragging and dropping coinlings
    useEffect(() => {
        const handleMouseMove = (e) => {
            if(!dragging) return;

            // keeps coinling draggable inside field boundaries only
            const field = document.querySelector(".field");
            if(!field) return;

            const rect = field.getBoundingClientRect();

            const mouseX = (e.clientX - rect.left - offset.x) / rect.width;
            const mouseY = (e.clientY - rect.top - offset.y) / rect.height;

            onMove(mouseX * 100, mouseY * 100);
        };

        // drop coinling
        const handleMouseUp = () => {
            if(dragging){
                setDragging(false);
                onDragEnd?.();
            }
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging, offset, onMove, onDragEnd]);

    return (
        <img
            src="/sprites/coinling.png"
            alt="coinling"
            className={`coinling ${isMoving ? "coinling-moving" : ""}`}
            style={{
                top: `${top}%`,
                left: `${left}%`,
                transition: dragging
                    ? "none"
                    : `top ${duration}s linear, left ${duration}s linear`,
                position: "absolute",
                cursor: canDrag ? "grab" : "default",
                pointerEvents: canDrag ? "auto" : "none",
            }}
            onMouseDown={handleMouseDown}
            draggable={false}
        />
    );
}

export default coinling;