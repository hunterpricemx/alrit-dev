const es = {
  meta: {
    title: "Alrit.dev — Desarrollo web que convierte",
    description:
      "Estudio de desarrollo web. Sitios WordPress, e-commerce, LMS, Real Estate, sistemas a medida, apps móviles y automatizaciones. La evolución de Hunter Price Mx.",
  },
  nav: {
    services: "Servicios",
    calculator: "Calculadora",
    portfolio: "Portafolio",
    process: "Proceso",
    cta: "Cotiza tu proyecto",
  },
  hero: {
    titleA: "Construimos el sitio que",
    titleAccent: "tu negocio merece",
    lede: "Diseñamos y desarrollamos experiencias web que se sienten vivas y convierten visitantes en clientes. Cada proyecto, una pieza que merece mostrarse.",
    primary: "Cotiza tu proyecto",
    secondary: "Ver portafolio",
  },
  social: {
    eyebrow: "La evolución de Hunter Price Mx",
    title: "De agencia de marketing a estudio de desarrollo web",
    text: "Más de una década creando presencia digital. Hoy llevamos esa experiencia al código: sitios rápidos, escalables y pensados para vender.",
  },
  services: {
    eyebrow: "Qué hacemos",
    title: "Servicios de desarrollo a la medida de tu negocio",
    items: {
      wordpress: {
        eyebrow: "CMS administrable",
        title: "Sitios WordPress",
        text: "Sitios administrables, rápidos y seguros, listos para que tu equipo los edite.",
      },
      webdev: {
        eyebrow: "Desarrollo a medida",
        title: "Desarrollo de páginas web",
        text: "Sitios a medida con tecnología moderna, optimizados para velocidad y SEO.",
      },
      lms: {
        eyebrow: "Educación en línea",
        title: "Sitios LMS",
        text: "Plataformas de cursos en línea con pagos, certificados y seguimiento de alumnos.",
      },
      ecommerce: {
        eyebrow: "Ventas en línea",
        title: "E-commerce",
        text: "Tiendas en línea que venden: catálogo, pagos y logística integrados.",
      },
      realestate: {
        eyebrow: "Inmobiliario",
        title: "Real Estate",
        text: "Portales inmobiliarios con búsqueda avanzada, fichas y captación de leads.",
      },
      systems: {
        eyebrow: "Software a medida",
        title: "Sistemas a medida",
        text: "Software interno y plataformas que automatizan tu operación.",
      },
      mobile: {
        eyebrow: "iOS y Android",
        title: "Apps móviles",
        text: "Aplicaciones iOS y Android conectadas a tu negocio y tus datos.",
      },
      automation: {
        eyebrow: "Eficiencia operativa",
        title: "Automatizaciones",
        text: "Integramos tus herramientas y eliminamos el trabajo manual repetitivo.",
      },
    },
    title2: "Descubre lo que hacemos",
    cta: "Ver servicio",
  },
  calculator: {
    eyebrow: "Calculadora de proyectos",
    title: "¿Cuánto cuesta tu proyecto?",
    subtitle:
      "Arma tu proyecto y obtén un estimado al instante. Para sistemas a medida te enviamos una cotización personalizada.",
    typeLabel: "Tipo de proyecto",
    sizeLabel: "Tamaño",
    extrasLabel: "Extras",
    types: {
      landing: "Landing page",
      wordpress: "Sitio WordPress",
      ecommerce: "E-commerce",
      lms: "Sitio LMS",
      realestate: "Real Estate",
      custom: "Sistema / App a medida",
    },
    sizes: { small: "Pequeño", medium: "Mediano", large: "Grande" },
    extras: {
      multilang: "Multi-idioma",
      blog: "Blog",
      payments: "Pasarela de pagos",
      seo: "SEO avanzado",
    },
    fromLabel: "Estimado desde",
    disclaimer:
      "Estimado aproximado. El precio final depende del alcance; te confirmamos por escrito.",
    customTitle: "Proyecto a medida",
    customText:
      "Los sistemas y apps se cotizan según tu alcance. Déjanos tus datos y te enviamos una propuesta.",
    requestCta: "Solicitar cotización",
    form: {
      name: "Nombre",
      email: "Correo",
      phone: "Teléfono",
      brief: "Cuéntanos tu proyecto",
      submit: "Enviar solicitud",
      sent: "¡Gracias! Te contactamos muy pronto.",
    },
  },
  portfolio: {
    eyebrow: "Portafolio",
    title: "Proyectos que hablan por nosotros",
    text: "Una muestra de lo que construimos. Pronto, casos de estudio completos.",
    cta: "Ver todos",
  },
  process: {
    eyebrow: "Cómo trabajamos",
    title: "Un proceso claro, sin sorpresas",
    steps: [
      { title: "Descubrimiento", text: "Entendemos tu negocio, metas y audiencia." },
      { title: "Diseño", text: "Prototipamos la experiencia antes de escribir código." },
      { title: "Desarrollo", text: "Construimos rápido, con calidad y SEO desde el día uno." },
      { title: "Lanzamiento", text: "Publicamos, medimos y optimizamos para convertir." },
    ],
  },
  testimonials: {
    eyebrow: "Testimonios",
    title: "Negocios que ya crecen con nosotros",
    items: [
      { quote: "Migramos con Alrit y nuestras ventas en línea se duplicaron en tres meses.", author: "Cliente placeholder", role: "Director, Retail" },
      { quote: "Profesionales, rápidos y siempre un paso adelante. El sitio quedó increíble.", author: "Cliente placeholder", role: "Fundadora, EdTech" },
      { quote: "Automatizaron procesos que nos quitaban horas. Ahora todo fluye.", author: "Cliente placeholder", role: "Operaciones, Inmobiliaria" },
    ],
  },
  finalCta: {
    title: "¿List@ para construir algo que convierta?",
    text: "Cuéntanos tu idea y la convertimos en un producto digital que vende.",
    primary: "Cotiza tu proyecto",
    secondary: "Escríbenos por WhatsApp",
  },
  footer: {
    tagline: "Desarrollo web que convierte. La evolución de Hunter Price Mx.",
    rights: "Todos los derechos reservados.",
    columns: {
      services: "Servicios",
      company: "Empresa",
      contact: "Contacto",
    },
    company: { about: "Nosotros", portfolio: "Portafolio", process: "Proceso", blog: "Blog" },
  },
} as const;

export default es;

/** Recursively widen literal types so other locales can supply different strings. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { -readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof es>;
