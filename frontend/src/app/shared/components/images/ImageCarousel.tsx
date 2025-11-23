import { Box } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import carrusel1 from "../../../../assets/carrusel1.jpg";
import carrusel2 from "../../../../assets/carrusel2.jpg";
import carrusel3 from "../../../../assets/carrusel3.jpg";
import carrusel4 from "../../../../assets/carrusel4.jpg";
import carrusel5 from "../../../../assets/carrusel5.jpg";
import carrusel6 from "../../../../assets/carrusel6.jpg";
import carrusel7 from "../../../../assets/carrusel7.jpg";
import carrusel8 from "../../../../assets/carrusel8.jpg";
import logo from "../../../../assets/logoJPG.png";

const carouselImages = [carrusel1, carrusel2, carrusel3, carrusel4, carrusel5, carrusel6, carrusel7, carrusel8];

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: false,
};

export const ImageCarousel = () => {
  const responsiveHeight = { xs: '13rem', sm: '15rem' };

  return (
    <Box sx={{ position: "relative", height: responsiveHeight, mb: '1.9rem', borderRadius: "12px", overflow: "hidden" }}>
      <Slider {...sliderSettings}>
        {carouselImages.map((img, idx) => (
          <Box
            key={idx}
            sx={{
              position: "relative",
              height: responsiveHeight,
              // borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <img
              src={img}
              alt={`Slide ${idx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "opacity(0.5)",
                // borderRadius: "12px",
              }}
            />
          </Box>
        ))}
      </Slider>

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          // backgroundColor: "rgba(200, 200, 200, 0.5)",
          // borderRadius: "12px",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "100%",
            maxWidth: 750,
            height: "auto",
            filter: "drop-shadow(2px 2px 4px rgba(128,128,128,0.6))",
          }}
        />
      </Box>
    </Box>
  );
};
