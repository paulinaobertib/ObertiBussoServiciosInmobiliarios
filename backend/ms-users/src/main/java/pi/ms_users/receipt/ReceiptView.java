package pi.ms_users.receipt;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// todo ya formateado para el template receipts/receipt.html
@Getter
@Builder
public class ReceiptView {
    private final String title;
    private final String number;
    private final boolean inmobiliaria;
    private final boolean liquidacion;
    private final boolean annulled;
    private final String issuerName;
    private final String issuerTitle;
    private final String signerName;
    private final String address;
    private final String city;
    private final String license;
    private final String placeAndDate;
    private final String payerName;
    private final String payerDni;
    private final String ownerName;
    private final String propertyAddress;
    private final String period;
    private final String statementHtml;
    private final List<Item> items;
    private final String total;
    private final String totalInWords;
    private final String notes;
    private final String footerLeft;
    private final String footerRight;
    private final String logoDataUri;
    private final String markDataUri;
    private final String sealDataUri;

    public record Item(String description, String amount) {
    }
}
