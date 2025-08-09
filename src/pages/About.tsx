import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function About() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setOutput(null);

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
      alert("Falló la subida");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Acerca de - Subir Imagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
          <Button onClick={handleUpload} className="w-full">
            Enviar a API
          </Button>

          {loading && <Skeleton className="h-40 w-full" />}
          {output && (
            <img
              src={output}
              alt="Output"
              className="w-full rounded-lg border mt-4"
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
