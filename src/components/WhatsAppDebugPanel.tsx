'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Wifi, WifiOff, AlertCircle, TestTube, RefreshCw } from 'lucide-react';

interface WhatsAppDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppDebugPanel({ isOpen, onClose }: WhatsAppDebugPanelProps) {
  const [status, setStatus] = useState<any>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testPhone, setTestPhone] = useState('+5491112345678');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState('');
  const [incomingPhone, setIncomingPhone] = useState('+5491112345678');

  // Verificar estado del servicio
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      setStatus(data);
      
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus({ error: 'Error checking status' });
    }
  };

  // Enviar mensaje de prueba
  const sendTestMessage = async (simulateIncoming = false) => {
    if (!testMessage.trim() || !testPhone.trim()) {
      alert('Por favor ingresa un mensaje y un número de teléfono');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage,
          simulateIncoming
        }),
      });

      const result = await response.json();
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        success: result.success,
        message: testMessage,
        phone: testPhone,
        result: result,
        simulateIncoming
      };

      setTestResults(prev => [testResult, ...prev]);
      console.log('🧪 Test result:', result);

      if (result.success) {
        alert(`✅ Mensaje enviado exitosamente!\nModo: ${result.mode}\nSimulado: ${result.simulated}`);
      } else {
        alert(`❌ Error enviando mensaje: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      alert('Error enviando mensaje de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  // Simular mensaje entrante
  const simulateIncomingMessage = async () => {
    if (!incomingMessage.trim() || !incomingPhone.trim()) {
      alert('Por favor ingresa un mensaje y un número de teléfono');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/simulate-incoming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: incomingPhone,
          content: incomingMessage,
          messageType: 'text'
        }),
      });

      const result = await response.json();
      
      const testResult = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        success: result.success,
        message: incomingMessage,
        phone: incomingPhone,
        result: result,
        type: 'incoming'
      };

      setTestResults(prev => [testResult, ...prev]);
      console.log('📥 Incoming message result:', result);

      if (result.success) {
        alert(`✅ Mensaje entrante simulado exitosamente!\nDe: ${incomingPhone}\nMensaje: ${incomingMessage}`);
        setIncomingMessage('');
      } else {
        alert(`❌ Error simulando mensaje entrante: ${result.error}`);
      }
    } catch (error) {
      console.error('Error simulating incoming message:', error);
      alert('Error simulando mensaje entrante');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar mensajes en la base de datos
  const checkMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages');
      const data = await response.json();
      console.log('📥 Messages check result:', data);
      alert(`Mensajes en BD: ${data.messages?.length || 0}`);
    } catch (error) {
      console.error('Error checking messages:', error);
      alert('Error verificando mensajes');
    }
  };

  // Limpiar mensajes de prueba
  const clearTestMessages = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los mensajes de prueba?')) {
      return;
    }

    try {
      const response = await fetch('/api/whatsapp/messages', {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log('🧹 Clear messages result:', data);
      alert('Mensajes eliminados');
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Error eliminando mensajes');
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TestTube className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-semibold">WhatsApp Debug Panel</h2>
                <p className="text-sm text-blue-100">Panel de pruebas para WhatsApp</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-full"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Estado del Servicio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Estado del Servicio</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {status ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {status.service?.enabled ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      Estado: {status.service?.enabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Modo: {status.service?.mode || 'Desconocido'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Configurado: {status.service?.configured ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <button
                    onClick={checkStatus}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    <RefreshCw className="h-3 w-3 inline mr-1" />
                    Actualizar
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Cargando estado...</span>
                </div>
              )}
            </div>
          </div>

          {/* Pruebas de Mensajes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Pruebas de Mensajes</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Teléfono:
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+5491112345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje de Prueba:
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Escribe un mensaje de prueba..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => sendTestMessage(false)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 inline mr-1" />
                  Enviar Mensaje
                </button>
                <button
                  onClick={() => sendTestMessage(true)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Enviar + Simular Respuesta
                </button>
              </div>
            </div>
          </div>

          {/* Simular Mensaje Entrante */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Simular Mensaje Entrante</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu Número (Desde):
                </label>
                <input
                  type="text"
                  value={incomingPhone}
                  onChange={(e) => setIncomingPhone(e.target.value)}
                  placeholder="+5491112345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje Entrante:
                </label>
                <textarea
                  value={incomingMessage}
                  onChange={(e) => setIncomingMessage(e.target.value)}
                  placeholder="Escribe un mensaje que simule que llega desde tu WhatsApp..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={simulateIncomingMessage}
                  disabled={isLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Simular Mensaje Entrante
                </button>
              </div>
            </div>
          </div>

          {/* Acciones de Base de Datos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Base de Datos</h3>
            <div className="flex space-x-2">
              <button
                onClick={checkMessages}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Verificar Mensajes
              </button>
              <button
                onClick={clearTestMessages}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Limpiar Mensajes
              </button>
            </div>
          </div>

          {/* Resultados de Pruebas */}
          {testResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Resultados de Pruebas</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {result.success ? '✅ Exitoso' : '❌ Fallido'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {result.message} → {result.phone}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.simulateIncoming ? '📥 + Simulado' : '📤 Enviado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
