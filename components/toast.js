"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function Toast({ message, type = "error", onClose }) {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

  const icon =
    type === "success"
      ? faCheckCircle
      : type === "error"
      ? faTimesCircle
      : type === "info"
      ? faInfoCircle
      : faExclamationTriangle;

    const styles = { 
        success: "bg-green-50 text-green-800 border-green-200", 
        error: "bg-red-50 text-red-800 border-red-200", 
        info: "bg-blue-50 text-blue-800 border-blue-200", 
        warning: "bg-yellow-50 text-yellow-800 border-yellow-200", 
    };

  return createPortal(

    <div className="fixed bottom-5 min-sm:right-5 max-sm:top-5 z-[9999] pointer-events-none">
    <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-md text-md font-medium animate-slide-up pointer-events-auto border ${ styles[type]}`}
    >
        <FontAwesomeIcon icon={icon} className="w-5 h-5 flex-shrink-0" />
        <span>{message}</span>
    </div>
    </div>
,
    document.body
  );
}
