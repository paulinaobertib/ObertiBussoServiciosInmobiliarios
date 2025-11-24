import { useState, useEffect } from "react";
import { Box, IconButton, Paper, Chip, Typography, useTheme, useMediaQuery, Dialog } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CancelIcon from "@mui/icons-material/Cancel";
import { getFullImageUrl } from "../../utils/getFullImageUrl";

interface Image {
  id: number;
  url: string;
}
interface Props {
  images: Image[];
  mainImage: string;
  title: string;
}

// Carrusel que soporta imágenes y vídeos
export const PropertyCarousel = ({ images, mainImage, title }: Props) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const tablet = useMediaQuery(theme.breakpoints.down("lg"));

  // evita duplicados
  const all = [mainImage, ...images.map((i) => i.url)]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .map((url, id) => ({ id, url }));

  const [idx, setIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const thumbs = mobile ? 3 : tablet ? 3 : 3;
  const next = () => setIdx((idx + 1) % all.length);
  const prev = () => setIdx((idx - 1 + all.length) % all.length);
  const openLightbox = (index: number) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const lightboxNext = () => setLightboxIdx((lightboxIdx + 1) % all.length);
  const lightboxPrev = () => setLightboxIdx((lightboxIdx - 1 + all.length) % all.length);

  useEffect(() => {
    if (all.length > 1) {
      const t = setInterval(() => setIdx((i) => (i + 1) % all.length), 3500);
      return () => clearInterval(t);
    }
  }, [all.length]);

  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Slide */}
      {all.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            height: mobile ? 300 : 450,
            position: "relative",
            cursor: "zoom-in",
          }}
          onClick={() => openLightbox(idx)}
        >
          {all.map((img, i) => (
            <Box
              key={img.id}
              sx={{
                position: "absolute",
                inset: 0,
                opacity: i === idx ? 1 : 0,
                transition: "opacity .5s",
              }}
            >
              {isVideo(img.url) ? (
                <video
                  src={getFullImageUrl(img.url)}
                  muted
                  autoPlay
                  loop
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <img
                  src={getFullImageUrl(img.url) || "/placeholder.svg"}
                  alt={`Imagen ${i + 1} de ${title}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </Box>
          ))}
          <Chip
            label={`${idx + 1}/${all.length}`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              bgcolor: "rgba(5,5,5,.6)",
              color: "#fff",
              fontWeight: "bold",
            }}
          />
          {all.length > 1 && (
            <>
              <IconButton
                aria-label="Imagen anterior"
                onClick={(event) => {
                  event.stopPropagation();
                  prev();
                }}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 16,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,1)",
                  },
                  boxShadow: 2,
                  zIndex: 1,
                }}
                size={mobile ? "small" : "medium"}
              >
                <ArrowBackIosNewIcon fontSize={mobile ? "small" : "medium"} />
              </IconButton>
              <IconButton
                aria-label="Siguiente imagen"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 16,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": {
                    backgroundColor: "rgb(246, 246, 246)",
                  },
                  boxShadow: 2,
                  zIndex: 1,
                }}
                size={mobile ? "small" : "medium"}
              >
                <ArrowForwardIosIcon fontSize={mobile ? "small" : "medium"} />
              </IconButton>
            </>
          )}
        </Paper>
      )}

      {/* Miniaturas */}
      <Box
        sx={{
          my: 1,
          display: "flex",
          gap: 1,
          overflowX: "auto",
          minHeight: mobile ? 60 : 80,
        }}
      >
        {(showAll ? all : all.slice(0, thumbs)).map((img, i) => (
          <Box
            key={img.id}
            onClick={() => setIdx(i)}
            sx={{
              width: mobile ? 60 : 80,
              height: mobile ? 60 : 80,
              borderRadius: 1,
              overflow: "hidden",
              cursor: "pointer",
              flexShrink: 0,
              border: i === idx ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
              opacity: i === idx ? 1 : 0.7,
              transition: "all .2s",
              "&:hover": { opacity: 1 },
            }}
          >
            {isVideo(img.url) ? (
              <video
                src={getFullImageUrl(img.url)}
                muted
                autoPlay
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img
                src={getFullImageUrl(img.url) || "/placeholder.svg"}
                alt={`Miniatura ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </Box>
        ))}
        {all.length > thumbs && !showAll && (
          <Box
            onClick={() => setShowAll(true)}
            sx={{
              width: mobile ? 60 : 80,
              height: mobile ? 60 : 80,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(0,0,0,.2)" },
              flexShrink: 0,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              +{all.length - thumbs}
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        sx={{
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            position: "relative",
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 0,
          }}
        >
          <IconButton
            aria-label="Cerrar galería"
            onClick={closeLightbox}
            sx={{
              position: "absolute",
              top: { xs: 4, sm: 8 },
              right: { xs: 4, sm: 8 },
              color: "white",
              zIndex: 2,
              p: { xs: 0.75, sm: 1 },
              backgroundColor: "rgba(0,0,0,0.3)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
            }}
          >
            <CancelIcon fontSize={typeof window !== "undefined" && window.innerWidth < 600 ? "medium" : "small"} />
          </IconButton>

          {all.length > 1 && (
            <>
              <IconButton
                aria-label="Imagen anterior ampliada"
                onClick={(event) => {
                  event.stopPropagation();
                  lightboxPrev();
                }}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: { xs: 4, sm: 16 },
                  transform: "translateY(-50%)",
                  color: "white",
                  zIndex: 2,
                  p: { xs: 0.75, sm: 1 },
                  backgroundColor: "rgba(0,0,0,0.3)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                }}
              >
                <ArrowBackIosNewIcon
                  fontSize={typeof window !== "undefined" && window.innerWidth < 600 ? "medium" : "small"}
                />
              </IconButton>
              <IconButton
                aria-label="Imagen siguiente ampliada"
                onClick={(event) => {
                  event.stopPropagation();
                  lightboxNext();
                }}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: { xs: 4, sm: 16 },
                  transform: "translateY(-50%)",
                  color: "white",
                  zIndex: 2,
                  p: { xs: 0.75, sm: 1 },
                  backgroundColor: "rgba(0,0,0,0.3)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                }}
              >
                <ArrowForwardIosIcon
                  fontSize={typeof window !== "undefined" && window.innerWidth < 600 ? "medium" : "small"}
                />
              </IconButton>
            </>
          )}

          {all[lightboxIdx] &&
            (() => {
              const img = all[lightboxIdx];
              if (isVideo(img.url)) {
                return (
                  <video
                    src={getFullImageUrl(img.url)}
                    muted
                    loop
                    playsInline
                    autoPlay
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      maxWidth: "100vw",
                      maxHeight: window.innerWidth < 600 ? "60vh" : "80vh",
                      objectFit: "contain",
                      cursor: "default",
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                );
              }
              return (
                <Box
                  component="img"
                  src={getFullImageUrl(img.url) || "/placeholder.svg"}
                  alt={`Imagen ampliada ${lightboxIdx + 1} de ${title}`}
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    maxWidth: "100vw",
                    maxHeight: { xs: "60vh", sm: "80vh" },
                    objectFit: "contain",
                  }}
                />
              );
            })()}

          <Chip
            label={`${lightboxIdx + 1}/${all.length}`}
            size="small"
            sx={{
              position: "absolute",
              bottom: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              bgcolor: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: { xs: "1rem", sm: "0.875rem" },
              px: { xs: 1, sm: 1.5 },
              py: { xs: 0.5, sm: 0.5 },
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};
