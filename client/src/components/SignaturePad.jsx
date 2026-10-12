import React, { useRef, useState, useEffect } from 'react';
import { Upload, PenTool, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function SignaturePad({ value, onChange, label = 'Signature', required = false, testIdPrefix = 'sig' }) {
  const [mode, setMode] = useState('draw'); // 'draw' or 'upload'
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  // Setup canvas drawing context
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a';
    }
  }, [mode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Upload drawn signature
  const saveDrawnSignature = async () => {
    if (!hasDrawn || !canvasRef.current) {
      showToast('Please draw your signature before saving.', 'error');
      return;
    }

    try {
      setUploading(true);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const res = await api.post('/upload/signature-base64', { base64Data: dataUrl });
      if (res.success && res.data.url) {
        onChange(res.data.url);
        showToast('Signature saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save drawn signature', 'error');
    } finally {
      setUploading(false);
    }
  };

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit.', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('signature', file);

      const res = await api.post('/upload/signature', formData);
      if (res.success && res.data.url) {
        onChange(res.data.url);
        showToast('Signature image uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload signature image', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group" data-testid={`${testIdPrefix}-signature-section`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label} {required && <span className="required">*</span>}
        </label>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--colors-surface-card)', padding: '3px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--colors-hairline)' }}>
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '3px 10px', border: 'none', minHeight: '28px' }}
            data-testid={`${testIdPrefix}-tab-draw`}
          >
            <PenTool size={12} /> Draw
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '3px 10px', border: 'none', minHeight: '28px' }}
            data-testid={`${testIdPrefix}-tab-upload`}
          >
            <Upload size={12} /> Upload File
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div style={{ border: '1px solid var(--colors-hairline)', borderRadius: 'var(--rounded-md)', background: '#ffffff', padding: '0.85rem' }}>
          <div style={{ background: 'var(--colors-surface-soft)', borderRadius: 'var(--rounded-sm)', border: '1px dashed var(--colors-muted-soft)', overflow: 'hidden' }}>
            <canvas
              ref={canvasRef}
              width={480}
              height={140}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
              data-testid={`${testIdPrefix}-canvas`}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={clearCanvas}
              className="btn btn-sm btn-secondary"
              data-testid={`${testIdPrefix}-clear-btn`}
            >
              <RotateCcw size={13} /> Clear
            </button>
            <button
              type="button"
              onClick={saveDrawnSignature}
              disabled={!hasDrawn || uploading}
              className="btn btn-sm btn-primary"
              data-testid={`${testIdPrefix}-apply-btn`}
            >
              <Check size={13} /> {uploading ? 'Saving...' : 'Apply Signature'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px dashed var(--colors-muted-soft)', borderRadius: 'var(--rounded-md)', padding: '1.5rem', textAlign: 'center', background: 'var(--colors-surface-soft)' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            data-testid={`${testIdPrefix}-file-input`}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-secondary"
            data-testid={`${testIdPrefix}-upload-btn`}
          >
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Choose Signature Image'}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--colors-muted)', marginTop: '0.5rem' }}>
            Supported: PNG, JPEG, WEBP, SVG (Max 5MB)
          </p>
        </div>
      )}

      {/* Active Signature Preview */}
      {value && (
        <div style={{ marginTop: '0.85rem', padding: '0.75rem 1rem', background: '#e6f7f2', borderRadius: 'var(--rounded-md)', border: '1px solid var(--colors-brand-mint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={value}
              alt="Active Signature"
              style={{ maxHeight: '42px', maxWidth: '120px', objectFit: 'contain', background: '#ffffff', padding: '3px 6px', borderRadius: 'var(--rounded-xs)', border: '1px solid var(--colors-hairline)' }}
              data-testid={`${testIdPrefix}-active-img`}
            />
            <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
              Signature attached & verified
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.75rem', padding: '2px 8px', color: 'var(--colors-brand-pink)', borderColor: '#fecdd3' }}
            data-testid={`${testIdPrefix}-remove-btn`}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
