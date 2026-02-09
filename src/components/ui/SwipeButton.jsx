import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

export default function SwipeButton({ onSwipe, isCheckedIn }) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const containerRef = useRef(null);
    const buttonWidth = 50; // Width of the sliding circle
    const maxDrag = useRef(0);

    useEffect(() => {
        if (containerRef.current) {
            maxDrag.current = containerRef.current.clientWidth - buttonWidth - 8; // 8px for padding
        }
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let newX = e.clientX - containerRect.left - buttonWidth / 2;
        newX = Math.max(0, Math.min(newX, maxDrag.current));
        setDragX(newX);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        let newX = e.touches[0].clientX - containerRect.left - buttonWidth / 2;
        newX = Math.max(0, Math.min(newX, maxDrag.current));
        setDragX(newX);
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragX > maxDrag.current * 0.9) {
            onSwipe();
            setDragX(0); // Reset after successful swipe (or keep it if you want it to stay)
        } else {
            setDragX(0); // Snap back
        }
    };

    return (
        <div
            className={`relative w-full h-16 rounded-full overflow-hidden select-none transition-colors duration-300 ${isCheckedIn ? 'bg-red-500' : 'bg-primary'
                }`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
        >
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg pointer-events-none">
                {isCheckedIn ? 'Swipe to Clock Out' : 'Swipe to Clock In'}
            </div>

            <div
                ref={containerRef}
                className="absolute top-1 left-1 bottom-1 right-1"
            >
                <div
                    className="h-14 w-14 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer absolute top-0"
                    style={{ transform: `translateX(${dragX}px)` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    <ChevronRight className={isCheckedIn ? 'text-red-500' : 'text-primary'} />
                </div>
            </div>
        </div>
    );
}
