'use client';

import React, { useState, useEffect } from 'react';

interface Template {
  name: string;
  status: string;
  category: string;
  language: string;
  components?: any[];
}

interface TemplateMessagePanelProps {
  selectedContact?: string;
  onMessageSent?: () => void;
}

export default function TemplateMessagePanel({ selectedContact, onMessageSent }: TemplateMessagePanelProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState(selectedContact || '');
  const [templateParams, setTemplateParams] = useState<string[]>([]);

  useEffect(() => {
    if (selectedContact) {
      setPhoneNumber(selectedContact);
    }
  }, [selectedContact]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
        console.log('📋 Plantillas cargadas:', data.templates);
      } else {
        alert('Error al cargar plantillas');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = templates.find(t => t.name === templateName);
    if (template) {
      // Extraer parámetros del template ({{1}}, {{2}}, etc.)
      const params = template.components?.map(comp => comp.text?.match(/\{\{(\d+)\}\}/g) || [])
        .flat()
        .map(param => param.replace(/\{\{(\d+)\}\}/, '$1'))
        .filter((param, index, arr) => arr.indexOf(param) === index)
        .sort((a, b) => parseInt(a) - parseInt(b)) || [];
      
      setTemplateParams(params);
    }
  };

  const sendTemplateMessage = async () => {
    if (!phoneNumber || !selectedTemplate) {
      alert('Por favor completa todos los campos');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/whatsapp/send-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          templateName: selectedTemplate,
          language: 'en_US',
          components: templateParams.length > 0 ? [
            {
              type: 'body',
              parameters: templateParams.map((param, index) => ({
                type: 'text',
                text: `Parámetro ${parseInt(param)}`
              }))
            }
          ] : []
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Mensaje de plantilla enviado exitosamente');
        setSelectedTemplate('');
        setTemplateParams([]);
        onMessageSent?.();
      } else {
        alert(data.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error sending template message:', error);
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BUSINESS_INITIATED':
        return 'bg-blue-100 text-blue-800';
      case 'UTILITY':
        return 'bg-green-100 text-green-800';
      case 'MARKETING':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Mensajes de Plantilla</h2>
        <p className="text-gray-600 mt-2">
          Envía mensajes de plantilla para iniciar conversaciones con proveedores
        </p>
      </div>

      <div className="space-y-4">
        {/* Número de teléfono */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Número de teléfono
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+5491135562673"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Plantillas disponibles */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Plantilla</label>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="ml-2">Cargando plantillas...</span>
            </div>
          ) : (
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className={`cursor-pointer transition-colors p-3 border rounded-lg ${
                    selectedTemplate === template.name ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template.name)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.components?.find(c => c.type === 'BODY')?.text || 'Sin descripción'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(template.status)}`}>
                          {template.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parámetros del template */}
        {selectedTemplate && templateParams.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Parámetros del template</label>
            <div className="space-y-2">
              {templateParams.map((param, index) => (
                <div key={param} className="space-y-1">
                  <label htmlFor={`param-${param}`} className="block text-sm font-medium text-gray-700">
                    Parámetro {param}
                  </label>
                  <input
                    id={`param-${param}`}
                    placeholder={`Valor para parámetro ${param}`}
                    onChange={(e) => {
                      const newParams = [...templateParams];
                      newParams[index] = e.target.value;
                      setTemplateParams(newParams);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <button
          onClick={sendTemplateMessage}
          disabled={!phoneNumber || !selectedTemplate || sending}
          className={`w-full px-4 py-2 rounded-md font-medium ${
            !phoneNumber || !selectedTemplate || sending
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {sending ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            'Enviar Plantilla'
          )}
        </button>
      </div>
    </div>
  );
}
