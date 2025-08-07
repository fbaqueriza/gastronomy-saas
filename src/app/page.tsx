'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Menu, 
  X,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  Smartphone,
  CreditCard,
  Shield
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/541135562673', '_blank');
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  const features = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Gestión de Facturas y Finanzas",
      description: "Control completo de facturación, comprobantes y finanzas con reportes automáticos y análisis de rentabilidad."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Gestión de Pedidos en Tiempo Real",
      description: "Recibe, gestiona y rastrea pedidos desde múltiples canales en una sola plataforma."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Comunicación Automatizada WhatsApp",
      description: "Integración completa con WhatsApp Business para atención automática e inteligente."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Reportes y Analítica",
      description: "Dashboard completo con métricas de ventas, clientes y rendimiento de tu negocio."
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Integración con Pagos",
      description: "Acepta pagos online y en efectivo con reportes automáticos de transacciones."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Gestión de Stock",
      description: "Control de inventario con alertas automáticas de reposición y análisis de rotación."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">Gastrosaas</div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#servicios" className="text-gray-700 hover:text-green-600 transition-colors">Servicios</a>
              <a href="#contacto" className="text-gray-700 hover:text-green-600 transition-colors">Contacto</a>
              <button
                onClick={handleLoginClick}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Iniciar Sesión
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <a href="#servicios" className="text-gray-700 hover:text-green-600 transition-colors">Servicios</a>
                <a href="#contacto" className="text-gray-700 hover:text-green-600 transition-colors">Contacto</a>
                <button
                  onClick={handleLoginClick}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-left"
                >
                  Iniciar Sesión
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Digitaliza tu Restaurante con
              <span className="text-green-600"> Gastrosaas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gastrosaas es una plataforma SaaS que ayuda a restaurantes a digitalizar sus operaciones mediante herramientas como gestión de facturas y finanzas, gestión de pedidos, y comunicación automatizada con clientes por WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLoginClick}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                ¿Tienes dudas? Escríbenos por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Servicios Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para modernizar tu restaurante en una sola plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h2>
            <p className="text-xl text-gray-600">
              Estamos aquí para ayudarte a digitalizar tu restaurante
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Información de Contacto
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">fbaqueriza@itba.edu.ar</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">+54 11 3556-2673</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Suipacha 1172, Buenos Aires, Argentina</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                ¿Tienes preguntas?
              </h3>
              <p className="text-gray-600 mb-6">
                Nuestro equipo está disponible para responder todas tus dudas sobre Gastrosaas y cómo puede beneficiar a tu restaurante.
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                ¿Tienes dudas? Escríbenos por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">Gastrosaas</h3>
              <p className="text-gray-300">
                La plataforma completa para digitalizar tu restaurante y potenciar tu negocio.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Facturación y Finanzas</li>
                <li>Gestión de Pedidos</li>
                <li>WhatsApp Business</li>
                <li>Reportes y Analytics</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Sobre Nosotros</li>
                <li>Blog</li>
                <li>Carreras</li>
                <li>Soporte</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={() => setIsPrivacyOpen(true)}
                    className="hover:text-green-400 transition-colors"
                  >
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsTermsOpen(true)}
                    className="hover:text-green-400 transition-colors"
                  >
                    Términos y Condiciones
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Gastrosaas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Política de Privacidad</h3>
                <button 
                  onClick={() => setIsPrivacyOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  Nos comprometemos a proteger tus datos personales y garantizar tu privacidad. Esta política describe cómo recopilamos, utilizamos y protegemos tu información cuando utilizas Gastrosaas.
                </p>
                <p>
                  Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, utilizas nuestros servicios o nos contactas. También recopilamos información automáticamente cuando utilizas nuestra plataforma.
                </p>
                <p>
                  Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios, comunicarnos contigo, y cumplir con nuestras obligaciones legales. No vendemos, alquilamos ni compartimos tu información personal con terceros sin tu consentimiento.
                </p>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal contra el acceso no autorizado, la alteración, divulgación o destrucción.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Términos y Condiciones</h3>
                <button 
                  onClick={() => setIsTermsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-gray-600 space-y-4">
                <p>
                  El uso de Gastrosaas implica la aceptación de estos términos y condiciones. Al acceder y utilizar nuestra plataforma, aceptas estar sujeto a estos términos.
                </p>
                <p>
                  Gastrosaas es una plataforma SaaS que proporciona herramientas de gestión para restaurantes. Te otorgamos una licencia limitada, no exclusiva y revocable para utilizar nuestros servicios de acuerdo con estos términos.
                </p>
                <p>
                  Eres responsable de mantener la confidencialidad de tu cuenta y contraseña, y de todas las actividades que ocurran bajo tu cuenta. No debes compartir tus credenciales de acceso con terceros.
                </p>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en nuestra plataforma. Tu uso continuado de nuestros servicios después de los cambios constituye tu aceptación de los nuevos términos.
                </p>
                <p>
                  Estos términos se rigen por las leyes de Argentina. Cualquier disputa será resuelta en los tribunales competentes de Buenos Aires, Argentina.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
