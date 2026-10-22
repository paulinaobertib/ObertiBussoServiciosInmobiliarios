package pi.ms_users.contractpdf;

import java.util.List;

// texto del PDF, o las paginas como imagen si era un escaneo
public record PdfContent(String text, List<String> pageImagesDataUri) {
    public boolean isScanned() {
        return pageImagesDataUri != null && !pageImagesDataUri.isEmpty();
    }
}
