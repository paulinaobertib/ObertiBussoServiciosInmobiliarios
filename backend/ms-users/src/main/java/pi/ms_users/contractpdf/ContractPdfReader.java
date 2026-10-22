package pi.ms_users.contractpdf;

import jakarta.ws.rs.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class ContractPdfReader {

    // menos texto que esto por pagina = casi seguro es un escaneo
    private static final int MIN_CHARS_PER_PAGE = 80;
    static final int MAX_TEXT_CHARS = 60_000;
    static final int MAX_SCANNED_PAGES = 8;

    public PdfContent read(byte[] pdf) {
        if (pdf == null || pdf.length < 5 || !new String(pdf, 0, 5).startsWith("%PDF")) {
            throw new BadRequestException("El archivo no es un PDF válido.");
        }
        try (PDDocument doc = Loader.loadPDF(pdf)) {
            int pages = doc.getNumberOfPages();
            String text = new PDFTextStripper().getText(doc).replaceAll("[ \\t]+", " ").replaceAll("\\n{3,}", "\n\n").trim();

            if (text.length() >= MIN_CHARS_PER_PAGE * Math.max(1, Math.min(pages, 3))) {
                return new PdfContent(text.length() > MAX_TEXT_CHARS ? text.substring(0, MAX_TEXT_CHARS) : text, List.of());
            }

            PDFRenderer renderer = new PDFRenderer(doc);
            List<String> images = new ArrayList<>();
            for (int i = 0; i < Math.min(pages, MAX_SCANNED_PAGES); i++) {
                BufferedImage img = renderer.renderImageWithDPI(i, 110, ImageType.GRAY);
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                ImageIO.write(img, "jpg", out);
                images.add("data:image/jpeg;base64," + Base64.getEncoder().encodeToString(out.toByteArray()));
            }
            return new PdfContent(text, images);
        } catch (InvalidPasswordException e) {
            throw new BadRequestException("El PDF está protegido con contraseña.");
        } catch (IOException e) {
            throw new BadRequestException("No se pudo leer el PDF: " + e.getMessage());
        }
    }
}
