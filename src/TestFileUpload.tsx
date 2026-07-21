import { useState } from 'react';

const API_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3000';

export default function TestFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [ci, setCi] = useState('');
  const [patientName, setPatientName] = useState('');
  const [fileType, setFileType] = useState('PDF');  // ✅ Cambiado a PDF por defecto
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [showFiles, setShowFiles] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert('Selecciona un archivo primero');
      return;
    }

    if (!ci.trim()) {
      alert('El CI es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientCi', ci);  // ✅ Usando patientCi (como espera el backend)
    formData.append('description', description || 'Archivo médico');
    formData.append('fileType', fileType);  // ✅ PDF, DICOM o IMAGE

    try {
      console.log('📤 Enviando a:', `${API_URL}/medical-files/upload`);
      console.log('📤 Datos:', { ci, fileType, description, fileName: file.name });

      const response = await fetch(`${API_URL}/medical-files/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📤 Response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data) || 'Error al subir archivo');
      }

      setResult(data);
      console.log('✅ Archivo subido:', data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleListFiles = async () => {
    if (!ci.trim()) {
      alert('Ingresa un CI para listar archivos');
      return;
    }

    setLoading(true);
    setError(null);
    setShowFiles(true);

    try {
      const response = await fetch(`${API_URL}/medical-files/patient/${ci}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al listar archivos');
      }

      setFiles(data);
      console.log('📋 Archivos del paciente:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`${API_URL}/medical-files/${fileId}/download-url`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener URL de descarga');
      }

      window.open(data.url, '_blank');
      console.log('📥 Descargando archivo...');
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

    try {
      const response = await fetch(`${API_URL}/medical-files/${fileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar archivo');
      }

      alert('✅ Archivo eliminado correctamente');
      handleListFiles();
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error:', err);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      margin: '20px auto',
      maxWidth: '600px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
    }}>
      <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>📁 Prueba de Archivos Médicos</h2>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '14px',
          whiteSpace: 'pre-wrap'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '14px'
        }}>
          ✅ Archivo subido correctamente!
          <br />
          <strong>ID:</strong> {result.id}
          <br />
          <strong>Nombre:</strong> {result.fileName}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontWeight: 500, fontSize: '13px' }}>Archivo:</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: '13px' }}>CI:</label>
            <input
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, fontSize: '13px' }}>Nombre:</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontWeight: 500, fontSize: '13px' }}>Tipo de archivo:</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="PDF">📄 PDF</option>
              <option value="DICOM">🩻 DICOM</option>
              <option value="IMAGE">🖼️ IMAGEN</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 500, fontSize: '13px' }}>Descripción:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Radiografía de tórax"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#0A5C8C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Subiendo...' : '📤 Subir Archivo'}
          </button>

          <button
            onClick={handleListFiles}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#2E9E7E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1
            }}
          >
            📋 Listar Archivos
          </button>
        </div>
      </div>

      {showFiles && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>
            📋 Archivos del paciente (CI: {ci})
          </h3>

          {files.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              No hay archivos para este paciente.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.map((file: any) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <strong>{file.fileName}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {(file.fileSize / 1024).toFixed(1)} KB · {new Date(file.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownload(file.id)}
                      style={{
                        padding: '4px 12px',
                        background: '#0A5C8C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📥 Descargar
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      style={{
                        padding: '4px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}