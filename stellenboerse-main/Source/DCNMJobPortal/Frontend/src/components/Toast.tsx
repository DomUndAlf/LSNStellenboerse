import * as React from "react";
import { useEffect } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { t } from "i18next";
import { useJoomlaHeaderOffset } from "../hooks/useJoomlaHeaderOffset";

interface IToastProps {
  message: string;
  count: number;
  onClose: () => void;
}

function Toast({ message, count, onClose }: IToastProps): React.ReactElement {
  const headerOffset = useJoomlaHeaderOffset();

  useEffect(() => {
    const TIMER = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(TIMER);
  }, [onClose]);

  return (
    <div
      className="fixed right-4 animate-slide-in-right"
      style={{ 
        top: `${headerOffset + 16}px`,
        zIndex: 99999 
      }}
    >
      <div className="bg-white border-l-4 border-hellblau rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="h-6 w-6 text-hellblau flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-scale-md font-medium text-dunkelblau">{message}</p>
            <p className="text-scale-sm text-textbody mt-1">
              {count} {count === 1 ? t("toast.jobFound") : t("toast.jobsFound")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-dunkelblau transition-colors"
            aria-label="Schließen"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
