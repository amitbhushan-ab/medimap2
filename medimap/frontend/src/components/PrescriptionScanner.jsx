// src/components/PrescriptionScanner.jsx
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

// ─── Upload Zone ─────────────────────────────────────────────────────────────
function UploadZone({ onFileSelect, preview, isDragging, onDrag, onDragLeave, onDrop }) {
  const fileRef = useRef();
  const cameraRef = useRef();

  return (
    <div
      onDragOver={onDrag}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
        ${isDragging
          ? 'border-[#2E7DFF] bg-blue-50 scale-[1.01]'
          : 'border-gray-200 hover:border-[#2E7DFF] hover:bg-blue-50/30 bg-gray-50'
        }`}
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => onFileSelect(e.target.files[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => onFileSelect(e.target.files[0])}
      />

      {preview ? (
        <div className="relative p-3">
          <img
            src={preview}
            alt="Prescription preview"
            className="w-full max-h-72 object-contain rounded-xl"
          />
          <div className="absolute top-5 right-5 bg-white rounded-full p-1.5 shadow-md">
            <svg className="w-4 h-4 text-[#2E7DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">Click to change image</p>
        </div>
      ) : (
        <div className="py-12 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7DFF]/10 to-[#00C2A8]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#2E7DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Drop prescription here</p>
          <p className="text-sm text-gray-500 mb-5">or click to browse — JPG, PNG, WebP up to 10MB</p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              className="flex items-center gap-2 bg-[#2E7DFF] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Image
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Processing Steps UI ──────────────────────────────────────────────────────
function ProcessingSteps({ step }) {
  const steps = [
    { id: 1, label: 'Uploading image', icon: '📤' },
    { id: 2, label: 'Running OCR scan', icon: '🔍' },
    { id: 3, label: 'AI extracting medicines', icon: '🤖' },
    { id: 4, label: 'Preparing results', icon: '✅' },
  ];

  return (
    <div className="py-8 px-6">
      <div className="flex justify-center mb-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#2E7DFF] border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {steps[Math.min(step - 1, 3)]?.icon}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map(s => (
          <div key={s.id} className={`flex items-center gap-3 transition-all duration-300 ${
            s.id < step ? 'opacity-100' : s.id === step ? 'opacity-100' : 'opacity-30'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
              s.id < step
                ? 'bg-emerald-500 text-white'
                : s.id === step
                ? 'bg-[#2E7DFF] text-white animate-pulse'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {s.id < step ? '✓' : s.id}
            </div>
            <span className={`text-sm font-medium ${s.id === step ? 'text-[#2E7DFF]' : s.id < step ? 'text-emerald-600' : 'text-gray-400'}`}>
              {s.label}
              {s.id === step && <span className="ml-1 animate-pulse">...</span>}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        This may take 10–20 seconds depending on image quality
      </p>
    </div>
  );
}

// ─── Medicine Card ────────────────────────────────────────────────────────────
function MedicineCard({ medicine, index, onFindPharmacy }) {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E7DFF]/10 to-[#00C2A8]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">💊</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{medicine.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {medicine.dosage !== 'Not specified' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-[#2E7DFF] text-xs font-semibold px-2 py-0.5 rounded-full">
                  💉 {medicine.dosage}
                </span>
              )}
              {medicine.quantity !== 'Not specified' && (
                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  📦 {medicine.quantity}
                </span>
              )}
              {medicine.frequency !== 'Not specified' && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  🕐 {medicine.frequency}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onFindPharmacy(medicine.name)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-[#2E7DFF] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          Find Pharmacy
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrescriptionScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, [handleFileSelect]);

  const handleScan = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Simulate step progression
      setProcessingStep(1);
      const formData = new FormData();
      formData.append('prescription', file);

      setProcessingStep(2);
      const response = await fetch(`${API_BASE}/prescription/scan`, {
        method: 'POST',
        body: formData,
      });

      setProcessingStep(3);
      const data = await response.json();

      setProcessingStep(4);
      await new Promise(r => setTimeout(r, 500)); // brief pause for UX

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process prescription');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
      setProcessingStep(0);
    }
  };

  const handleFindPharmacy = (medicineName) => {
    navigate(`/results?q=${encodeURIComponent(medicineName)}`);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Upload zone — hide when showing results */}
      {!result && !processing && (
        <>
          <UploadZone
            onFileSelect={handleFileSelect}
            preview={preview}
            isDragging={isDragging}
            onDrag={handleDrag}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {file && !processing && (
            <div className="mt-4 flex gap-3 animate-fade-up">
              <button
                onClick={handleScan}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] text-white py-3.5 rounded-2xl font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-blue-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Scan Prescription
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3.5 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}

      {/* Processing state */}
      {processing && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm animate-fade-up">
          <ProcessingSteps step={processingStep} />
        </div>
      )}

      {/* Error state */}
      {error && !processing && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-red-800 mb-1">Could not read prescription</h3>
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={handleReset} className="mt-3 text-sm text-[#2E7DFF] font-semibold hover:underline">
                Try again with a different image →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !processing && (
        <div className="animate-fade-up">
          {/* Success header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-emerald-800">
                  {result.medicineCount} medicine{result.medicineCount !== 1 ? 's' : ''} detected
                </p>
                <p className="text-xs text-emerald-600">
                  OCR Confidence: {result.ocrConfidence}% · Parsed by {result.parseMethod === 'gemini' ? '🤖 Gemini AI' : '🔤 Pattern matching'}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-emerald-700 border border-emerald-300 bg-white px-3 py-1.5 rounded-lg hover:bg-emerald-50 font-medium"
            >
              Scan New
            </button>
          </div>

          {/* Medicine list */}
          <div className="space-y-3 mb-4">
            {result.medicines.map((medicine, i) => (
              <MedicineCard
                key={i}
                medicine={medicine}
                index={i}
                onFindPharmacy={handleFindPharmacy}
              />
            ))}
          </div>

          {/* Find all button */}
          {result.medicines.length > 1 && (
            <button
              onClick={() => handleFindPharmacy(result.medicines[0].name)}
              className="w-full py-3.5 bg-gradient-to-r from-[#2E7DFF] to-[#00C2A8] text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
            >
              🗺️ Find All Medicines at Nearby Pharmacies
            </button>
          )}

          {/* Raw OCR text toggle */}
          <details className="mt-4">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
              View raw OCR text
            </summary>
            <pre className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 overflow-auto max-h-40 whitespace-pre-wrap">
              {result.rawText}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
