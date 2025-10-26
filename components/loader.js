'use client';

export default function DotsLoader() {
    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
            <div className="flex gap-2">
                <span className="dot-loader animate-bounce-dot-1"></span>
                <span className="dot-loader animate-bounce-dot-2"></span>
                <span className="dot-loader animate-bounce-dot-3"></span>
            </div>

            <style jsx>{`
        .dot-loader {
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background-color: white;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-dot-1 {
          animation: bounce 1.2s infinite ease-in-out;
        }

        .animate-bounce-dot-2 {
          animation: bounce 1.2s infinite ease-in-out;
          animation-delay: 0.2s;
        }

        .animate-bounce-dot-3 {
          animation: bounce 1.2s infinite ease-in-out;
          animation-delay: 0.4s;
        }
      `}</style>
        </div>
    );
}
