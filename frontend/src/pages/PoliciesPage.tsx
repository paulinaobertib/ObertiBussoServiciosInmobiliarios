import { Box, Divider, IconButton, Typography } from "@mui/material";
import { BasePage } from "./BasePage";
import { useNavigate } from "react-router-dom";
import ReplyIcon from "@mui/icons-material/Reply";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function PoliciesPage() {
  const navigate = useNavigate();
  const justifySx = {
    textAlign: "justify",
    fontFamily: "Roboto, sans-serif",
    mb: 0.6,
  } as const;
  const accentColor = "#ee671e";
  const headingSx = {
    fontWeight: 700,
    color: accentColor,
    fontFamily: "Roboto, sans-serif",
  } as const;

  const ContactCard = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "94%",
        mx: "auto",
        mt: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        Fecha de última actualización: 30 de octubre de 2025
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 580,
          fontFamily: "Roboto, sans-serif",
        }}
      >
        Titular: Oberti Busso Servicios Inmobiliarios
      </Typography>

      <Divider sx={{ borderColor: "rgba(135, 114, 99, 0.2)" }} />
    </Box>
  );

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300, display: { xs: "none", sm: "inline-flex" } }}
      >
        <ReplyIcon />
      </IconButton>
      <BasePage maxWidth={false}>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            maxWidth: "900px",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          <Typography variant="h4" sx={{ ...headingSx, textAlign: "center", color: "black" }}>
            POLITICA DE PRIVACIDAD
          </Typography>
          <ContactCard />
          <Typography variant="h6" sx={{ ...headingSx, mt: 2, mb: 1 }}>
            1.- NUESTRO COMPROMISO CON LA PRIVACIDAD
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            1.1.- La presente política de privacidad (en adelante, la "Política de Privacidad") establece el modo en que
            Oberti Busso Servicios Inmobiliarios, con domicilio en Luis Galeano 1910 - Local 2, Villa Cabrera, Córdoba,
            Argentina (en adelante, "la Inmobiliaria"), en su carácter de Responsable del Tratamiento de Datos,
            recopila, utiliza y protege la información personal de los usuarios de su sitio web{" "}
            <Box
              component="a"
              href="https://www.inmobiliariaobertibusso.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "inherit", // mantiene color negro
                fontFamily: "Roboto, sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline",
                "&:hover": { color: "#ee671e", textDecoration: "underline" },
              }}
            >
              www.inmobiliariaobertibusso.com.ar
            </Box>{" "}
            (en adelante, el "Sitio Web").
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            1.2.- Esta Política de Privacidad describe la información personal que la Inmobiliaria puede recopilar a
            través del Sitio Web, las medidas de seguridad adoptadas para proteger dicha información, su posibilidad de
            acceder a la misma, y los canales de contacto disponibles para realizar consultas o ejercer derechos sobre
            sus datos personales.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            2.- RECOPILACIÓN DE SU INFORMACIÓN PERSONAL
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            2.1.- Esta Política contempla, en general, la recopilación y uso de información personal obtenida a través
            del Sitio Web, que el usuario proporcione voluntariamente al registrarse por primera vez en el Sitio Web;
            completar formularios de contacto; pedidos de turno; suscripción o solicitudes de tasación; al comunicarse
            por correo electrónico u otros medios digitales tales como WhatsApp y/o similares; cuando navega e
            interactúa con el Sitio Web, incluyendo la visualización de propiedades, el marcado de favoritos o el uso de
            herramientas de comparación; así como datos de navegación obtenidos automáticamente mediante cookies. Los
            datos pueden incluir, identificación personal, nombre y apellido, teléfono, correo electrónico, preferencias
            inmobiliarias, dirección IP, navegador utilizado, además de otros que el usuario suministre voluntariamente
            (la "Información Personal").
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            2.2.- Si usted decide brindarnos su Información Personal, esta podrá ser objeto de tratamiento automatizado
            y almacenada en bases de datos seguras de propiedad de la Inmobiliaria, con el único fin de brindar un mejor
            servicio. Al brindar su Información Personal, usted presta su consentimiento libre, expreso e informado para
            el tratamiento de sus datos personales en los términos de esta Política de Privacidad, autorizando que la
            Inmobiliaria pueda compartir su información con sus asesores o prestadores de servicios (por ejemplo,
            servicios de hosting o mensajería), exclusivamente para cumplir las finalidades mencionadas bajo el título
            "Tratamiento de la Información Personal".
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            2.3.- La Inmobiliaria no recopila información sensible sobre los usuarios, ejemplificativamente, tales como
            datos o información personal de origen racial, opiniones políticas, afiliaciones sindicales, salud u
            orientación sexual, entre otros.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            3.- TRATAMIENTO DE LA INFORMACIÓN PERSONAL
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            3.1.- El tratamiento de la información o datos personales se realiza con el consentimiento libre, expreso e
            informado del titular de los mismos, de conformidad con la Ley No. 25.326 de Protección de los Datos
            Personales.
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            3.2.- Los datos recolectados podrán ser utilizados con la finalidad de brindar información sobre
            propiedades; responder consultas; gestionar solicitudes de tasación; enviar comunicaciones relacionadas con
            los servicios inmobiliarios ofrecidos; atender solicitudes y consultas realizadas a través del Sitio Web,
            correo electrónico, WhatsApp o mecanismos digitales afines; gestionar visitas, turnos y solicitudes de
            información sobre inmuebles; comunicar novedades, actualizaciones o promociones relacionadas con los
            servicios inmobiliarios ofrecidos; implementar mejoras en los servicios, contenidos y funcionalidades del
            Sitio Web; analizar las vistas de propiedades, favoritos y comportamiento de navegación de los usuarios con
            fines estadísticos o de optimización del servicio, incluyendo el uso de modelos de aprendizaje automático,
            sin que implique el tratamiento de datos personales identificables; cuando se generan datos estadísticos de
            navegación que pueden ser utilizados para el entrenamiento o mejora de modelos automatizados o de
            recomendación, sin que implique el tratamiento de información personal identificable; cumplir con
            obligaciones legales o contractuales derivadas de las relaciones establecidas con los usuarios.
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            3.3.- La Información Personal será tratada únicamente para los fines mencionados, y siempre bajo
            cumplimiento de la Ley No. 25.326 de Protección de Datos Personales y normas complementarias.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            4.- COMPARTIENDO, PROTEGIENDO y CONSERVANDO SU INFORMACIÓN PERSONAL
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            4.1.- La Información Personal será tratada de manera confidencial, sin perjuicio de ello, la Inmobiliaria
            podrá compartirla con prestadores de servicios técnicos, tecnológicos o administrativos, necesarios para el
            funcionamiento del Sitio Web; portales inmobiliarios, únicamente para el cumplimiento de las finalidades
            declaradas, garantizando un nivel adecuado de protección de datos en observancia de la normativa aplicable;
            autoridades judiciales o administrativas competentes que la requieran legalmente. La Inmobiliaria no vende
            ni cede información personal a terceros con fines comerciales. No se realizarán transferencias
            internacionales de datos sin el consentimiento previo del titular.
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            4.2.- Se han implementado medidas de seguridad técnicas y organizativas adecuadas para proteger la
            Información Personal frente a accesos no autorizados, y prevenir la pérdida, alteración o uso indebido de la
            misma. No obstante, el usuario reconoce que ningún sistema es completamente inviolable y que siempre existe
            un riesgo asociado al intercambio de información por medios digitales. Los empleados y colaboradores de la
            Inmobiliaria que accedan a datos personales están sujetos a compromisos de confidencialidad y obligaciones
            de resguardo.
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            4.3.- Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades
            informadas o hasta que el titular solicite su supresión.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            5. DERECHOS DEL TITULAR DE LOS DATOS
          </Typography>
          <Typography variant="body1" sx={justifySx}>
            5.1.- El titular de los datos podrá ejercer, en cualquier momento, sus derechos de acceso, rectificación,
            actualización o supresión, enviando un correo electrónico a:{" "}
            <Box
              component="span"
              sx={{
                display: "inline",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": { color: accentColor },
              }}
              onClick={() => window.open("mailto:oberti.busso@gmail.com")}
            >
              oberti.busso@gmail.com,
            </Box>{" "}
            o bien desde su cuenta en el Sitio Web, utilizando las opciones disponibles para tal fin, incluyendo la
            posibilidad de eliminar su cuenta de manera inmediata y definitiva.
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            5.2.- La Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley No. 25.326, con
            domicilio en Av. Pte. Gral. Julio A. Roca 710, piso 3, Ciudad Autónoma de Buenos Aires (
            <Box
              component="a"
              href="https://www.argentina.gob.ar/aaip"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "inherit",
                fontFamily: "Roboto, sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { color: accentColor, textDecoration: "underline" },
                display: "inline",
              }}
            >
              www.argentina.gob.ar/aaip
            </Box>
            ), tiene la atribución de atender denuncias y reclamos relacionados con el incumplimiento de las normas
            sobre protección de datos personales.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            6.- COMUNICACIONES ELECTRÓNICAS
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            6.1.- La Inmobiliaria podrá enviarle al usuario comunicaciones electrónicas relacionadas con propiedades,
            novedades o servicios inmobiliarios de interés; el usuario podrá solicitar, en cualquier momento, el cese
            del envío de estas comunicaciones, conforme al procedimiento establecido en esta Política de Privacidad.
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            6.2.- Todo correo o mensaje electrónico remitido al usuario, incluirá instrucciones claras para rechazar
            futuros envíos promocionales. Si el usuario no desea seguir recibiendo avisos sobre nuestras propiedades o
            actualizaciones, podrá desactivar las notificaciones desde su cuenta de usuario haciendo click en el ícono
            de campana dentro del Sitio Web.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            7.- OTRA INFORMACIÓN - COOKIES
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            7.1.- El Sitio Web puede utilizar cookies u otros mecanismos de almacenamiento local para recopilar
            información no personal sobre el comportamiento del usuario con el fin de mejorar la experiencia de
            navegación. El usuario puede eliminar o bloquear las cookies desde la configuración de su navegador, no
            obstante, algunas funcionalidades del Sitio Web podrían verse afectadas.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            8. MENORES DE EDAD
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            El Sitio Web y los servicios ofrecidos no están dirigidos a personas menores de 18 años, la Inmobiliaria no
            recopila deliberadamente información personal de menores; en caso de detectarse datos de una persona menor
            de edad, se procederá a su eliminación inmediata.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            9. LINKS EXTERNOS
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            El Sitio Web puede incluir enlaces a sitios externos (por ejemplo, redes sociales como Facebook o
            Instagram). La Inmobiliaria no se responsabiliza por las políticas de privacidad ni los contenidos de dichos
            sitios, recomendando al usuario revisar las políticas de cada plataforma antes de utilizarlas.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            10.- MODIFICACIONES A LA POLÍTICA DE PRIVACIDAD
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            Oberti Busso Servicios Inmobiliarios se reserva el derecho de modificar esta Política de Privacidad en
            cualquier momento para adaptarla a novedades normativas o tecnológicas. La versión actualizada estará
            disponible en este mismo Sitio Web y entrará en vigencia a partir de su publicación. Le recomendamos revisar
            esta sección periódicamente.
          </Typography>
          <Typography variant="h6" sx={{ ...headingSx }}>
            11.- LOCALIZACIÓN Y CONTACTO
          </Typography>
          <Typography variant="body1" paragraph sx={justifySx}>
            La presente Política de Privacidad se rige por las leyes de la República Argentina. Para consultas,
            solicitudes o reclamos relacionados con esta política, puede contactarse a:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <EmailIcon sx={{ color: accentColor }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { color: accentColor },
                }}
                onClick={() => window.open("mailto:oberti.busso@gmail.com")}
              >
                oberti.busso@gmail.com
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <LocationOnIcon sx={{ color: accentColor }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { color: accentColor },
                }}
                onClick={() =>
                  window.open(
                    "https://maps.google.com/?q=Luis+Galeano+1910,+Villa+Cabrera,+Córdoba,+Argentina",
                    "_blank"
                  )
                }
              >
                Luis Galeano 1910 – Local 2, Villa Cabrera, Córdoba, Argentina
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                }}
                onClick={() => window.open("https://wa.me/5493513264536", "_blank")}
              >
                <WhatsAppIcon sx={{ color: accentColor }} />
                <Typography variant="body1" sx={{ fontWeight: 600, "&:hover": { color: accentColor } }}>
                  Luis: +54 9 351 3264536
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                }}
                onClick={() => window.open("https://wa.me/5493515107888", "_blank")}
              >
                <WhatsAppIcon sx={{ color: accentColor }} />
                <Typography variant="body1" sx={{ fontWeight: 600, "&:hover": { color: accentColor } }}>
                  Pablo: +54 9 351 5107888
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </BasePage>
    </>
  );
}
