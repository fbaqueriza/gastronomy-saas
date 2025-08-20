import TemplateMessagePanel from '@/components/TemplateMessagePanel';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Plantillas de Mensajes</h1>
          <p className="text-gray-600 mt-2">
            Envía mensajes de plantilla para iniciar conversaciones con proveedores
          </p>
        </div>
        
        <TemplateMessagePanel />
      </div>
    </div>
  );
}
