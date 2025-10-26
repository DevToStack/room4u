'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import NextImage from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faTimes,
    faExpand,
    faPlay,
    faPause
} from '@fortawesome/free-solid-svg-icons';

/**
 * Refactored GallerySection
 *
 * Props:
 *  - images: Array<{ id?, image_url, image_name? }> (required)
 *  - initialIndex: number (optional)
 *  - groupSize: number (optional, default 4)
 */
const GallerySection = ({ images = [], initialIndex = 0, groupSize = 4 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [groupStart, setGroupStart] = useState(Math.floor(initialIndex / groupSize) * groupSize);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [autoPlay, setAutoPlay] = useState(false);
    const [mainImageLoaded, setMainImageLoaded] = useState(false);

    const autoPlayRef = useRef(null);

    // Auto-play effect
    useEffect(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (!images.length || !autoPlay) return;

        autoPlayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(autoPlayRef.current);
    }, [images.length, autoPlay]);

    // Update thumbnail group on index change
    useEffect(() => {
        if (!isFullscreen) {
            setGroupStart(Math.floor(currentIndex / groupSize) * groupSize);
        }
    }, [currentIndex, isFullscreen, groupSize]);

    const goToNext = useCallback(() => {
        setMainImageLoaded(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goToPrevious = useCallback(() => {
        setMainImageLoaded(false);
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleThumbnailClick = (index) => {
        if (index === currentIndex) return;
        setMainImageLoaded(false);
        setCurrentIndex(index);
    };

    const openFullscreen = () => {
        setIsFullscreen(true);
        if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
        setAutoPlay(false);
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        if (typeof document !== 'undefined') document.body.style.overflow = '';
        setAutoPlay(false);
    };

    const toggleAutoPlay = () => setAutoPlay((p) => !p);

    if (!images || images.length === 0) {
        return <div className="text-center text-gray-500 py-10">No images available.</div>;
    }

    const currentThumbnails = images.slice(groupStart, groupStart + groupSize);
    const currentImage = images[currentIndex];
    const MAIN_W = 1200;
    const MAIN_H = 800;

    return (
        <>
            <section className="h-full py-12 px-4 sm:px-8 lg:px-20 flex flex-col lg:flex-row items-center gap-8">
                {/* Main Image */}
                <div className="w-full lg:w-1/2">
                    <div className="relative rounded-xl overflow-hidden shadow-lg group" style={{ paddingTop: '70%' }}>
                        <div className={`absolute inset-0 transition-opacity duration-300 ${mainImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-full h-full flex items-center justify-center">
                                <NextImage
                                    src={currentImage.image_url}
                                    alt={currentImage.image_name || `Apartment image ${currentIndex + 1}`}
                                    width={MAIN_W}
                                    height={MAIN_H}
                                    className="object-cover w-full h-full cursor-zoom-in"
                                    priority={currentIndex === 0}
                                    onLoadingComplete={() => setMainImageLoaded(true)}
                                    quality={75}
                                />
                            </div>
                        </div>
                        {!mainImageLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}

                        {/* Navigation */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                            aria-label="Previous image"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200"
                            aria-label="Next image"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>

                        {/* Controls */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={toggleAutoPlay}
                                className="flex justify-center items-center bg-black/50 hover:bg-black/70 text-white p-2 w-10 h-10 rounded-full"
                                aria-label={autoPlay ? 'Pause slideshow' : 'Play slideshow'}
                            >
                                <FontAwesomeIcon icon={autoPlay ? faPause : faPlay} />
                            </button>
                            <button
                                onClick={openFullscreen}
                                className="flex justify-center items-center bg-black/50 hover:bg-black/70 text-white p-2 w-10 h-10 rounded-full"
                                aria-label="View fullscreen"
                            >
                                <FontAwesomeIcon icon={faExpand} />
                            </button>
                        </div>

                        {/* Counter */}
                        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="w-full lg:w-1/2 p-2">
                    <div className="grid grid-cols-2 gap-4">
                        {currentThumbnails.map((img, idx) => {
                            const actualIndex = groupStart + idx;
                            return (
                                <button
                                    key={`${img.id || img.image_url}-${idx}`}
                                    onClick={() => handleThumbnailClick(actualIndex)}
                                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${actualIndex === currentIndex ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'
                                        }`}
                                >
                                    <div style={{ paddingTop: '70%', position: 'relative' }}>
                                        <NextImage
                                            src={img.image_url}
                                            alt={img.image_name || `Thumbnail ${actualIndex + 1}`}
                                            fill
                                            sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw"
                                            loading="lazy"
                                            quality={65}
                                            className="object-cover"
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Fullscreen */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={closeFullscreen}>
                    <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeFullscreen} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="flex items-center justify-center">
                            <NextImage
                                src={currentImage.image_url}
                                alt={currentImage.image_name || `Apartment image ${currentIndex + 1}`}
                                width={MAIN_W}
                                height={MAIN_H}
                                className="object-contain max-w-full max-h-full"
                                priority
                                quality={90}
                            />
                        </div>

                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-4 rounded-full"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 text-white p-4 rounded-full"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>

                        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GallerySection;
