import * as React from "react";
import { useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Description from "./Description";
import Title from "./Title";
import Contact from "./Contact";
import { IFrameProps } from "../Interfaces/props";
import Disclaimer from "./Disclaimer";
import { useJoomlaHeaderOffset } from "../hooks/useJoomlaHeaderOffset";

function Frame({ isOpen, job, onClose }: IFrameProps) {
  const headerOffset = useJoomlaHeaderOffset();

  useEffect(() => {
    if (!isOpen) return;

    // Lock parent window scroll when dialog opens
    try {
      if (window.parent && window.parent !== window) {
        const parentBody = window.parent.document.body;
        const parentHtml = window.parent.document.documentElement;
        
        // Save original overflow values
        const originalBodyOverflow = parentBody.style.overflow;
        const originalHtmlOverflow = parentHtml.style.overflow;
        
        // Lock parent scroll
        parentBody.style.overflow = "hidden";
        parentHtml.style.overflow = "hidden";
        
        // Cleanup function to restore scroll
        return () => {
          parentBody.style.overflow = originalBodyOverflow;
          parentHtml.style.overflow = originalHtmlOverflow;
        };
      }
    } catch (e) {
      // Cross-origin iframe - can't access parent
      console.log("Cannot access parent window (cross-origin)");
    }
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      className="fixed inset-0"
      style={{ zIndex: 99998 }}
    >
      <div className="fixed inset-0 bg-schwarz bg-opacity-50"></div>

      <div className="fixed inset-0 overflow-y-auto">
        <div 
          className="flex min-h-full items-center justify-center p-2 sm:p-4"
          style={{ paddingTop: headerOffset ? `${headerOffset + 8}px` : undefined }}
        >
          <DialogPanel
            className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] 
                      max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] 
                      flex flex-col bg-weiss 
                      shadow-2xl rounded-lg overflow-hidden"
          >
            <div className="sticky top-0 bg-weiss pt-6 pb-4 px-4 sm:px-6 lg:px-8 z-20 border-b border-gray-100">
              <button
                onClick={onClose}
                aria-label="Close Dialog"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 
                         focus:outline-none z-30"
              >
                <XMarkIcon
                  className="w-6 h-6 sm:w-8 sm:h-8 text-dunkelblau hover:text-orange 
                                    transition-colors duration-200"
                />
              </button>
              {job && <Title job={job} />}
            </div>

            {job && (
              <div className="flex-1 overflow-auto">
                <Disclaimer job={job} />
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
                  <div className="w-full lg:w-2/3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <Description job={job} />
                    </div>
                  </div>

                  <div className="w-full lg:w-1/3">
                    <div className="lg:sticky lg:top-6">
                      <Contact job={job} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default Frame;
