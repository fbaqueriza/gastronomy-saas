'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { AutomatedResponse } from '../types/whatsapp';

interface AutomatedResponseManagerProps {
  userId: string;
}

export default function AutomatedResponseManager({ userId }: AutomatedResponseManagerProps) {
  const [responses, setResponses] = useState<AutomatedResponse[]>([]);
  const [editingResponse, setEditingResponse] = useState<AutomatedResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(false);

  useEffect(() => {
    checkWhatsAppStatus();
    if (isWhatsAppEnabled) {
      loadResponses();
    }
  }, [userId, isWhatsAppEnabled]);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      setIsWhatsAppEnabled(data.enabled);
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setIsWhatsAppEnabled(false);
    }
  };

  const loadResponses = async () => {
    setLoading(true);
    try {
      // Aquí cargarías las respuestas automáticas desde la API
      const mockResponses: AutomatedResponse[] = [
        {
          id: '1',
          name: 'Saludo Inicial',
          trigger: {
            keywords: ['hola', 'buenos días', 'buenas'],
            intent: 'greeting',
            conditions: {}
          },
          response: {
            type: 'text',
            content: '¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte hoy?',
            variables: []
          },
          isActive: true,
          priority: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Consulta de Precios',
          trigger: {
            keywords: ['precio', 'costo', 'cuánto cuesta'],
            intent: 'inquiry',
            conditions: {}
          },
          response: {
            type: 'dynamic',
            content: 'Te ayudo con los precios. ¿Qué producto te interesa?',
            variables: ['productName']
          },
          isActive: true,
          priority: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Confirmación de Pedido',
          trigger: {
            keywords: ['confirmar', 'pedido', 'orden'],
            intent: 'order',
            conditions: {}
          },
          response: {
            type: 'dynamic',
            content: '¡Perfecto! Confirmamos tu pedido:\n\n{orderDetails}\n\nTotal: ${total}\n\n¿Cuándo necesitas la entrega?',
            variables: ['orderDetails', 'total']
          },
          isActive: true,
          priority: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setResponses(mockResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResponse = async (response: Partial<AutomatedResponse>) => {
    try {
      if (editingResponse) {
        // Actualizar respuesta existente
        const updatedResponses = responses.map(r => 
          r.id === editingResponse.id ? { ...r, ...response, updatedAt: new Date() } : r
        );
        setResponses(updatedResponses);
      } else {
        // Crear nueva respuesta
        const newResponse: AutomatedResponse = {
          id: Date.now().toString(),
          name: response.name || '',
          trigger: response.trigger || { keywords: [], intent: '', conditions: {} },
          response: response.response || { type: 'text', content: '', variables: [] },
          isActive: response.isActive || true,
          priority: response.priority || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setResponses(prev => [...prev, newResponse]);
      }
      
      setEditingResponse(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta respuesta automática?')) {
      try {
        setResponses(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting response:', error);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setResponses(prev => prev.map(r => 
        r.id === id ? { ...r, isActive: !r.isActive, updatedAt: new Date() } : r
      ));
    } catch (error) {
      console.error('Error toggling response:', error);
    }
  };

  // Renderizar mensaje cuando WhatsApp no está configurado
  const renderWhatsAppNotConfigured = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          WhatsApp no está configurado
        </h2>
        <p className="text-gray-600 mb-6">
          Para configurar respuestas automáticas de WhatsApp, primero necesitas configurar las variables de entorno:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left text-sm">
          <p className="font-medium mb-2">Variables requeridas:</p>
          <ul className="space-y-1 text-gray-600">
            <li>• WHATSAPP_API_KEY</li>
            <li>• WHATSAPP_PHONE_NUMBER_ID</li>
            <li>• WHATSAPP_BUSINESS_ACCOUNT_ID</li>
            <li>• WHATSAPP_WEBHOOK_URL</li>
            <li>• WHATSAPP_VERIFY_TOKEN</li>
          </ul>
        </div>
        <div className="mt-6">
          <a
            href="/whatsapp"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Volver al Dashboard de WhatsApp
          </a>
        </div>
      </div>
    </div>
  );

  const renderResponseForm = () => (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingResponse ? 'Editar Respuesta Automática' : 'Nueva Respuesta Automática'}
      </h3>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSaveResponse({
          name: formData.get('name') as string,
          trigger: {
            keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()),
            intent: formData.get('intent') as string,
            conditions: {}
          },
          response: {
            type: formData.get('responseType') as 'text' | 'template' | 'dynamic',
            content: formData.get('content') as string,
            variables: (formData.get('variables') as string).split(',').map(v => v.trim()).filter(Boolean)
          },
          isActive: formData.get('isActive') === 'true',
          priority: parseInt(formData.get('priority') as string)
        });
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingResponse?.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <input
              type="number"
              name="priority"
              defaultValue={editingResponse?.priority || 1}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Palabras Clave (separadas por comas)
          </label>
          <input
            type="text"
            name="keywords"
            defaultValue={editingResponse?.trigger.keywords.join(', ')}
            placeholder="hola, buenos días, ayuda"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intención
          </label>
          <select
            name="intent"
            defaultValue={editingResponse?.trigger.intent}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar intención</option>
            <option value="greeting">Saludo</option>
            <option value="order">Pedido</option>
            <option value="inquiry">Consulta</option>
            <option value="complaint">Reclamo</option>
            <option value="confirmation">Confirmación</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Respuesta
          </label>
          <select
            name="responseType"
            defaultValue={editingResponse?.response.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Texto Simple</option>
            <option value="template">Plantilla</option>
            <option value="dynamic">Dinámica</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenido de la Respuesta
          </label>
          <textarea
            name="content"
            defaultValue={editingResponse?.response.content}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe el contenido de la respuesta..."
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variables (separadas por comas)
          </label>
          <input
            type="text"
            name="variables"
            defaultValue={editingResponse?.response.variables?.join(', ')}
            placeholder="productName, total, orderDetails"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={editingResponse?.isActive ?? true}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Respuesta Activa</span>
          </label>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {editingResponse ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingResponse(null);
              setShowForm(false);
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  // Si WhatsApp no está configurado, mostrar mensaje
  if (!isWhatsAppEnabled) {
    return renderWhatsAppNotConfigured();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Respuestas Automáticas</h1>
        <button
          onClick={() => {
            setEditingResponse(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Respuesta
        </button>
      </div>

      {showForm && renderResponseForm()}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <div key={response.id} className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{response.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    response.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {response.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Prioridad: {response.priority}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(response.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {response.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingResponse(response);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteResponse(response.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Disparadores</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Palabras clave:</span> {response.trigger.keywords.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Intención:</span> {response.trigger.intent}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Respuesta</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tipo:</span> {response.response.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Variables:</span> {response.response.variables?.join(', ') || 'Ninguna'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Contenido</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{response.response.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 