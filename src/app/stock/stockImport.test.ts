import { describe, it, expect } from '@jest/globals';

// Copia de la función de normalización y headerMap del código real
const normalizeHeader = (str: string) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '') // quita tildes
  .replace(/\s+/g, '') // quita espacios
  .replace(/[^a-z0-9]/g, ''); // quita caracteres especiales

const headerMap: Record<string, string> = {
  'producto': 'productName',
  'productname': 'productName',
  'product_name': 'productName',
  'categoria': 'category',
  'categoría': 'category', // acepta con tilde
  'category': 'category',
  'cantidad': 'quantity',
  'quantity': 'quantity',
  'unidad': 'unit',
  'unit': 'unit',
  'frecuenciadereposicion': 'restockFrequency',
  'frecuenciadereposición': 'restockFrequency', // acepta con tilde
  'restockfrequency': 'restockFrequency',
  'restock_frequency': 'restockFrequency',
  'frecuencia': 'restockFrequency',
  'frecuenciaderepocicion': 'restockFrequency',
  'frecuenciareposicion': 'restockFrequency',
  'proveedoresasociados': 'associatedProviders',
  'associatedproviders': 'associatedProviders',
  'associated_providers': 'associatedProviders',
  'proveedorpreferido': 'preferredProvider',
  'proveedorpreferído': 'preferredProvider', // tilde
  'preferredprovider': 'preferredProvider',
  'preferred_provider': 'preferredProvider',
  'ultimaorden': 'lastOrdered',
  'últimaorden': 'lastOrdered', // tilde
  'lastordered': 'lastOrdered',
  'proximaorden': 'nextOrder',
  'próximaorden': 'nextOrder', // tilde
  'nextorder': 'nextOrder',
  'createdat': 'createdAt',
  'created_at': 'createdAt',
  'updatedat': 'updatedAt',
  'updated_at': 'updatedAt',
};

describe('Importación de stock - headers del template', () => {
  it('debe aceptar los headers del template exportado', () => {
    const templateHeaders = [
      'Producto',
      'Categoría',
      'Cantidad',
      'Unidad',
      'Frecuencia de reposición',
      'Proveedores asociados',
      'Proveedor preferido',
      'Última orden',
      'Próxima orden',
    ];
    const normalizedRawHeaders = templateHeaders.map(h => normalizeHeader(h));
    const headers = normalizedRawHeaders.map(h => headerMap[h] || h);
    const required = ['productName', 'category', 'quantity', 'unit', 'restockFrequency'];
    const missing = required.filter(r => !headers.includes(r));
    expect(missing).toEqual([]);
  });
}); 