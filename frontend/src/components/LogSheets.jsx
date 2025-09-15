import React from "react";

export default function LogSheets({ sheets }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold mb-4">ELD Log Sheets</h2>
      <div className="space-y-8">
        {sheets.map((sheet, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Day {sheet.day} • {sheet.date}</div>
              <div className="text-sm text-gray-600">
                Driving: {sheet.driving_hours}h • On Duty: {sheet.on_duty_hours}h • Off Duty: {sheet.off_duty_hours}h
              </div>
            </div>
            {sheet.log_image && sheet.log_image.startsWith("base64_") === false ? (
              <img
                className="w-full max-h-[700px] object-contain bg-gray-50"
                alt={`Log sheet day ${sheet.day}`}
                src={`data:image/png;base64,${sheet.log_image}`}
              />
            ) : (
              <div className="p-6 text-gray-700 bg-yellow-50 rounded">
                Log image not available in response. This is a placeholder.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 