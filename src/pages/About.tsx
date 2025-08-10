import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, X, RotateCcw } from "lucide-react";

// Componente para la cámara
function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const handleCancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  if (!isCameraActive) {
    return (
      <div className="text-center space-y-4">
        <Button onClick={startCamera} className="w-full" variant="outline">
          <Camera className="w-4 h-4 mr-2" />
          Activar Cámara
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg bg-black"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex space-x-2">
        <Button onClick={capturePhoto} className="flex-1">
          <Camera className="w-4 h-4 mr-2" />
          Capturar
        </Button>
        <Button onClick={handleCancel} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Componente para subir archivos
function FileUpload({ onFileSelect }) {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="cursor-pointer"
      />
    </div>
  );
}

// Componente para preview de la imagen
function ImagePreview({ file, preview, onRemove, onRetake }) {
  if (!file && !preview) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <img
          src={preview || URL.createObjectURL(file)}
          alt="Vista previa"
          className="w-full rounded-lg border shadow-sm max-h-64 object-cover"
        />
        <Button
          onClick={onRemove}
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex space-x-2">
        <Button onClick={onRetake} variant="outline" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Cambiar Foto
        </Button>
        <Button onClick={onRemove} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Quitar Foto
        </Button>
      </div>
    </div>
  );
}

// Componente para mostrar el resultado
function ResultDisplay({ result, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Procesando imagen...</p>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Resultado:</p>
      <img
        src={result}
        alt="Resultado procesado"
        className="w-full rounded-lg border shadow-sm"
      />
    </div>
  );
}

// Componente principal
export default function PhotoUploadApp() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [mode, setMode] = useState('select'); // 'select', 'camera', 'preview'
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setMode('preview');
    setOutput(null);
    setError(null);
  };

  const handleCameraCapture = (capturedFile) => {
    setFile(capturedFile);
    setMode('preview');
    setOutput(null);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setMode('select');
    setOutput(null);
    setError(null);
  };

  const handleRetakePhoto = () => {
    setFile(null);
    setMode('select');
    setOutput(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setOutput(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error en la subida");

      const data = await res.json();
      setOutput(data.base64);
    } catch (error) {
      console.error(error);
      setError("Error al procesar la imagen. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            📸 Subir o Capturar Imagen
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setMode('camera')}
                  variant="outline"
                  className="h-20 flex flex-col"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Tomar Foto</span>
                </Button>

                <div className="relative">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex flex-col cursor-pointer"
                    asChild
                  >
                    <label>
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">Subir Archivo</span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mode === 'camera' && (
            <CameraCapture
              onCapture={handleCameraCapture}
              onCancel={() => setMode('select')}
            />
          )}

          {mode === 'preview' && file && (
            <div className="space-y-4">
              <ImagePreview
                file={file}
                onRemove={handleRemoveFile}
                onRetake={handleRetakePhoto}
              />

              <div className="space-y-2">
                <Button
                  onClick={handleUpload}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : 'Enviar a API'}
                </Button>

                <Button
                  onClick={() => setMode('select')}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Volver a Opciones
                </Button>
              </div>
            </div>
          )}

          <ResultDisplay result={output} loading={loading} />
        </CardContent>
      </Card>
    </main>
  );
}
