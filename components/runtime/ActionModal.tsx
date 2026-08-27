"use client";

import { useState } from "react";
import { Action } from "@/platform/config/types";

interface ActionModalProps {
  action: Action;
  reasonOptions?: string[];
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export function ActionModal({ action, reasonOptions, onConfirm, onCancel }: ActionModalProps) {
  const [reason, setReason] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>(reasonOptions?.[0] || "");
  const [customReason, setCustomReason] = useState("");

  const finalReason = reasonOptions ? (selectedOption === "Other" ? customReason : selectedOption) : reason;
  const canConfirm = action.requiresReason ? finalReason.trim().length > 0 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">{action.label} case</h3>
        {action.requiresReason && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
            {reasonOptions && reasonOptions.length > 0 ? (
              <>
                <select
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="mb-2 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  {reasonOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {selectedOption === "Other" && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                )}
              </>
            ) : (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => onConfirm(action.requiresReason ? finalReason : undefined)}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Confirm {action.label}
          </button>
        </div>
      </div>
    </div>
  );
}
