import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GenieAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);

  const genieVariants = {
    open: {
      opacity: 1,
      scaleY: 1,
      transformOrigin: "bottom",
      transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
    },
    closed: {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "bottom",
      transition: { duration: 0.30, ease: [0.4, 0, 1, 1] },
    },
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-lg"
      >
        {open ? "Close Assistant" : "Open AI Assistant"}
      </button>

      {/* Genie Animated Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="assistant"
            initial="closed"
            animate="open"
            exit="closed"
            variants={genieVariants}
            className="mt-3 w-80 bg-white shadow-xl rounded-xl p-4 border border-gray-200 origin-bottom"
          >
            <h2 className="text-lg font-bold mb-2">AI Assistant</h2>
            <p className="text-gray-600 mb-2">Ask anything…</p>

            <textarea
              className="w-full border rounded-lg p-2 text-sm"
              rows={3}
              placeholder="Type your question..."
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GenieAssistant;