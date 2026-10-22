package pi.ms_users.receipt;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// arma el PDF del recibo: thymeleaf -> html -> openhtmltopdf
@Component
@RequiredArgsConstructor
public class ReceiptPdfRenderer {

    private static final String BASE = "/receipts/";

    private final SpringTemplateEngine templateEngine;

    private final Map<String, String> dataUris = new ConcurrentHashMap<>();

    public byte[] render(ReceiptView view) {
        Context context = new Context(Locale.forLanguageTag("es-AR"));
        context.setVariable("r", view);
        String html = templateEngine.process("receipts/receipt", context);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            font(builder, "Lato-Regular.ttf", "Lato", 400, BaseRendererBuilder.FontStyle.NORMAL);
            font(builder, "Lato-Italic.ttf", "Lato", 400, BaseRendererBuilder.FontStyle.ITALIC);
            font(builder, "Lato-Bold.ttf", "Lato", 700, BaseRendererBuilder.FontStyle.NORMAL);
            font(builder, "Lato-Black.ttf", "Lato", 900, BaseRendererBuilder.FontStyle.NORMAL);
            font(builder, "Ubuntu-Medium.ttf", "Ubuntu", 500, BaseRendererBuilder.FontStyle.NORMAL);
            font(builder, "Ubuntu-Bold.ttf", "Ubuntu", 700, BaseRendererBuilder.FontStyle.NORMAL);
            font(builder, "GreatVibes-Regular.ttf", "Great Vibes", 400, BaseRendererBuilder.FontStyle.NORMAL);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo generar el PDF del recibo", e);
        }
    }

    public String imageDataUri(String fileName) {
        return dataUris.computeIfAbsent(fileName, f -> "data:image/png;base64," + Base64.getEncoder().encodeToString(read("img/" + f)));
    }

    private void font(PdfRendererBuilder builder, String file, String family, int weight, BaseRendererBuilder.FontStyle style) {
        builder.useFont(() -> stream("fonts/" + file), family, weight, style, true);
    }

    private InputStream stream(String path) {
        InputStream in = getClass().getResourceAsStream(BASE + path);
        if (in == null) throw new IllegalStateException("No se encontró el recurso " + BASE + path);
        return in;
    }

    private byte[] read(String path) {
        try (InputStream in = stream(path)) {
            return in.readAllBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
