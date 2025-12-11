import { useState, useEffect } from "react"

export default function useCoinlings(count, playableAreaPercent = 100, playableAreaOffset = 0){
    const [positions, setPositions] = useState([]);
    const coinlingSize = 10;

    // calculate constraints for movement within accessible area
    const minPos = playableAreaOffset;
    const maxPos = playableAreaOffset + playableAreaPercent;
    const constrainedFieldWidth = playableAreaPercent;
    const constrainedFieldHeight = playableAreaPercent;

    // initializes position data for each coinling, runs everytime count changes
    useEffect(() => {
        const newPositions = [];
        for(let i = 0; i < count; i++){
            // determines where coinling will start (random within accessible area)
            const startTop = minPos + Math.random() * (constrainedFieldHeight - coinlingSize);
            const startleft = minPos + Math.random() * (constrainedFieldWidth - coinlingSize);
            // determines where coinling should move (random within accessible area)
            const targetTop = minPos + Math.random() * (constrainedFieldHeight - coinlingSize);
            const targetLeft = minPos + Math.random() * (constrainedFieldWidth - coinlingSize);

            newPositions.push({
                top: startTop,
                left: startleft,
                targetTop,
                targetLeft,
                duration: 3 + Math.random() * 2,
                paused: false
            });
        }

        setPositions(newPositions);
    }, [count, playableAreaPercent, playableAreaOffset]);

    // movement logic
    useEffect(() => {
        const intervals = [];

        positions.forEach((_, index) => {
            // run for each coinling, not optimized for > 100 
            const move = () => {
                setPositions((prev) => 
                    prev.map((p, i) => {
                        if(i !== index) return p;
                        
                        // calculates current position and target position using pythagorean theorem
                        const dx = p.targetLeft - p.left;
                        const dy = p.targetTop - p.top;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if(p.dragging || p.paused) return p;

                        // waits before generating a new random target
                        if(distance < 1 && !p.waiting){
                            const waitTime = 5000 + Math.random() * 7000;
                            setTimeout(() => {
                                setPositions((prev) =>
                                    prev.map((ent, idx) =>
                                        idx === i ? {
                                            ...ent,
                                            waiting: false,
                                            targetTop: minPos + Math.random() * (constrainedFieldHeight - coinlingSize),
                                            targetLeft: minPos + Math.random() * (constrainedFieldWidth - coinlingSize),
                                            duration: 3 + Math.random() * 2,
                                        } : ent
                                    )
                                );
                            }, waitTime);

                            return  {...p, waiting: true};
                        }

                        // generates movement speed
                        const speed = Math.max(0.2, Math.min(2, distance / 20));
                        const stepX = (dx / distance) * speed;
                        const stepY = (dy / distance) * speed;

                        // keeps coinling inside accessible area
                        return {
                            ...p,
                            top: Math.min(Math.max(p.top + stepY, minPos), maxPos - coinlingSize),
                            left: Math.min(Math.max(p.left + stepX, minPos), maxPos - coinlingSize),
                        };
                    })
                );
            };

            // animation
            const delay = Math.random() * 500;
            const interval = setInterval(move, 50 + delay);
            intervals.push(interval);
        });

        // cleanup
        return () => intervals.forEach(clearInterval);
    }, [positions, minPos, maxPos, constrainedFieldHeight, constrainedFieldWidth, coinlingSize]);

    return{positions, setPositions};
}