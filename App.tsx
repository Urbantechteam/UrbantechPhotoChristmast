import React, { useState, useRef, useCallback } from 'react';
import { editImageWithGemini } from './services/geminiService';
import { AppStatus, PresetPrompt } from './types';
import { UploadIcon, MagicIcon, DownloadIcon, SantaHatIcon, RefreshIcon } from './components/Icons';

// Presets based on the user's specific scenario
const PRESETS: PresetPrompt[] = [
  {
    id: 'navidad-full',
    label: 'Transformación Navideña Completa',
    description: 'Gorro de Santa y fondo de oficina reemplazado por decoración festiva.',
    prompt: 'Reemplaza el fondo de la oficina por una escena de sala de estar navideña acogedora con un árbol de navidad desenfocado y luces cálidas. Agrega un gorro de Papá Noel rojo y blanco realista en la cabeza de la persona. Asegura que la iluminación sea natural y coherente.',
    icon: '🎄'
  },
  {
    id: 'navidad-fondo',
    label: 'Solo Fondo Navideño',
    description: 'Cambia el fondo de oficina por una escena invernal nevada.',
    prompt: 'Cambia el fondo de la imagen por un paisaje invernal con nieve suave y pinos. Mantén a la persona intacta pero ajusta la iluminación para que coincida con el ambiente.',
    icon: '❄️'
  },
  {
    id: 'navidad-gorro',
    label: 'Solo Gorro de Santa',
    description: 'Agrega un gorro festivo manteniendo el fondo actual.',
    prompt: 'Agrega un gorro de Papá Noel realista y de alta calidad sobre la cabeza de la persona. No cambies el fondo.',
    icon: '🎅'
  }
];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('image/jpeg');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check max size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("La imagen es demasiado grande. Máximo 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setOriginalImage(result);
      setOriginalMimeType(file.type);
      setProcessedImage(null);
      setStatus(AppStatus.IDLE);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle Image Generation
  const handleGenerate = async (promptText: string) => {
    if (!originalImage) return;

    setStatus(AppStatus.PROCESSING);
    setErrorMsg(null);

    try {
      // Remove data URL prefix to get raw base64
      const base64Data = originalImage.split(',')[1];
      
      const resultImage = await editImageWithGemini(base64Data, originalMimeType, promptText);
      
      setProcessedImage(resultImage);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg(err.message || "Ocurrió un error al procesar la imagen. Inténtalo de nuevo.");
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `navidad-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setStatus(AppStatus.IDLE);
    setCustomPrompt('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <SantaHatIcon />
            <h1 className="text-xl font-bold tracking-tight">NavidadAI Editor</h1>
          </div>
          {originalImage && (
             <button 
                onClick={handleReset}
                className="text-xs uppercase tracking-wide font-semibold text-red-100 hover:text-white flex items-center gap-1 transition-colors"
             >
                <RefreshIcon /> Nueva Foto
             </button>
          )}
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        {/* Intro / Upload State */}
        {!originalImage && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in-up">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
              <div className="mb-6 bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-600">
                <UploadIcon />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-slate-800">Sube tu foto</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Transformaremos tu foto de oficina en un recuerdo navideño inolvidable. 
                Añade gorros, cambia fondos y trae el espíritu festivo.
              </p>
              
              <button 
                onClick={triggerFileUpload}
                className="w-full bg-slate-900 text-white text-lg font-semibold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
              >
                <UploadIcon />
                Seleccionar Foto
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="mt-4 text-xs text-slate-400">JPG o PNG hasta 5MB</p>
            </div>
            
            {/* Disclaimer / Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl w-full">
                {[
                    {t: "IA Avanzada", d: "Potenciado por Gemini 2.5 Flash Image"},
                    {t: "Privado", d: "Tus fotos se procesan de forma segura"},
                    {t: "Rápido", d: "Resultados en segundos"}
                ].map((item, idx) => (
                    <div key={idx} className="bg-white/50 p-4 rounded-xl border border-slate-200">
                        <h4 className="font-semibold text-slate-700">{item.t}</h4>
                        <p className="text-sm text-slate-500">{item.d}</p>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* Editor State */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
              
              {/* Status & Error */}
              {status === AppStatus.ERROR && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm">
                      <strong>Error:</strong> {errorMsg}
                  </div>
              )}

              {/* Presets */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-red-500">✨</span> Transformaciones Rápidas
                </h3>
                <div className="space-y-3">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleGenerate(preset.prompt)}
                      disabled={status === AppStatus.PROCESSING}
                      className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{preset.icon}</span>
                        <div>
                            <div className="font-semibold text-slate-800 group-hover:text-red-700">
                                {preset.label}
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-snug">
                                {preset.description}
                            </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-2">Instrucción Personalizada</h3>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ej: Ponme un traje de elfo y que esté nevando..."
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none h-24 mb-3"
                />
                <button
                    onClick={() => handleGenerate(customPrompt)}
                    disabled={!customPrompt.trim() || status === AppStatus.PROCESSING}
                    className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    <MagicIcon />
                    Generar
                </button>
              </div>
            </div>

            {/* Right Column: Image Display */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-200 min-h-[500px] flex flex-col">
                
                {/* Visualizer Area */}
                <div className="relative flex-grow bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                    
                    {/* Original Image (Hidden when processed is showing, or side by side could work, but swapping is cleaner for mobile) */}
                    {(!processedImage && status !== AppStatus.PROCESSING) && (
                         <img 
                            src={originalImage} 
                            alt="Original" 
                            className="max-h-[600px] w-full object-contain"
                         />
                    )}

                    {/* Processing State */}
                    {status === AppStatus.PROCESSING && (
                        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-6 text-lg font-medium text-slate-700 animate-pulse">
                                Aplicando magia navideña...
                            </p>
                            <p className="text-sm text-slate-400 mt-2">Esto toma unos segundos</p>
                        </div>
                    )}

                    {/* Result Image */}
                    {processedImage && (
                        <img 
                           src={processedImage} 
                           alt="Resultado Navideño" 
                           className="max-h-[600px] w-full object-contain animate-in fade-in duration-700"
                        />
                    )}

                    {/* Compare Button Overlay (Only if processed exists) */}
                    {processedImage && (
                        <button 
                            onMouseDown={() => { 
                                const img = document.querySelector('img[alt="Resultado Navideño"]') as HTMLImageElement;
                                if(img) img.src = originalImage;
                            }}
                            onMouseUp={() => {
                                const img = document.querySelector('img[alt="Resultado Navideño"]') as HTMLImageElement;
                                if(img) img.src = processedImage!;
                            }}
                            onMouseLeave={() => {
                                const img = document.querySelector('img[alt="Resultado Navideño"]') as HTMLImageElement;
                                if(img && processedImage) img.src = processedImage;
                            }}
                            onTouchStart={() => {
                                const img = document.querySelector('img[alt="Resultado Navideño"]') as HTMLImageElement;
                                if(img) img.src = originalImage;
                            }}
                            onTouchEnd={() => {
                                const img = document.querySelector('img[alt="Resultado Navideño"]') as HTMLImageElement;
                                if(img) img.src = processedImage!;
                            }}
                            className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md hover:bg-black/70 transition-all cursor-pointer select-none"
                        >
                            Mantén para ver original
                        </button>
                    )}
                </div>

                {/* Action Bar */}
                <div className="mt-4 flex justify-between items-center">
                    <div>
                       {processedImage ? (
                           <span className="text-green-600 font-medium flex items-center gap-1">
                               <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                               ¡Imagen Lista!
                           </span>
                       ) : (
                           <span className="text-slate-400 text-sm">Vista Previa</span>
                       )}
                    </div>

                    {processedImage && (
                        <button 
                            onClick={handleDownload}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <DownloadIcon />
                            Descargar
                        </button>
                    )}
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} NavidadAI Editor. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
}