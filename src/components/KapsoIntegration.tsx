'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Send, RefreshCw } from 'lucide-react';

interface KapsoMessage {
  id?: string;
  contactId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export default function KapsoIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [contactId, setContactId] = useState('');
  const [messages, setMessages] = useState<KapsoMessage[]>([]);
  const [status, setStatus] = useState('');

  // Verificar conexión con Kapso
  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kapso/webhook');
      const data = await response.json();
      
      if (response.ok) {
        setIsConnected(true);
        setStatus('Conectado a Kapso');
      } else {
        setIsConnected(false);
        setStatus('Error de conexión');
      }
    } catch (error) {
      console.error('Error verificando conexión:', error);
      setIsConnected(false);
      setStatus('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar mensaje
  const sendMessage = async () => {
    if (!message.trim() || !contactId.trim()) {
      setStatus('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/kapso/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId,
          content: message,
          type: 'text'
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(prev => [...prev, data.message]);
        setMessage('');
        setStatus('Mensaje enviado exitosamente');
      } else {
        setStatus('Error enviando mensaje');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setStatus('Error enviando mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar contactos
  const syncContacts = async () => {
    setIsLoading(true);
    try {
      // Ejemplo de contactos para sincronizar
      const contacts = [
        { phone: '+5491112345678', name: 'Cliente Test 1' },
        { phone: '+5491187654321', name: 'Cliente Test 2' }
      ];

      const response = await fetch('/api/kapso/sync-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setStatus(data.message);
      } else {
        setStatus('Error sincronizando contactos');
      }
    } catch (error) {
      console.error('Error sincronizando contactos:', error);
      setStatus('Error sincronizando contactos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Integración Kapso
          </CardTitle>
          <CardDescription>
            Gestiona la integración con la plataforma Kapso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado de conexión */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
              {status && <span className="text-sm text-gray-600">{status}</span>}
            </div>
            <Button 
              onClick={checkConnection} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </div>

          {/* Enviar mensaje */}
          <div className="space-y-3">
            <h3 className="font-medium">Enviar mensaje</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="ID del contacto"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !isConnected}
                className="w-full md:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
            <Textarea
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Sincronizar contactos */}
          <div className="space-y-3">
            <h3 className="font-medium">Sincronización</h3>
            <Button 
              onClick={syncContacts} 
              disabled={isLoading || !isConnected}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Sincronizar contactos
            </Button>
          </div>

          {/* Mensajes recientes */}
          {messages.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Mensajes recientes</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {messages.map((msg, index) => (
                  <div key={msg.id || index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{msg.contactId}</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {msg.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
