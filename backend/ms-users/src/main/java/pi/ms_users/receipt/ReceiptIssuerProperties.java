package pi.ms_users.receipt;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

// datos que se imprimen en los recibos; se pueden pisar desde application.yml (receipts.*)
@Getter
@Component
public class ReceiptIssuerProperties {

    private final String inmobiliariaName;
    private final String corredorName;
    private final String corredorTitle;
    private final String signerName;
    private final String address;
    private final String city;
    private final String license;
    private final String website;
    private final String email;
    private final String phone;

    public ReceiptIssuerProperties(
            @Value("${receipts.inmobiliaria-name:Oberti Busso Servicios Inmobiliarios}") String inmobiliariaName,
            @Value("${receipts.corredor-name:Luis María Oberti}") String corredorName,
            @Value("${receipts.corredor-title:Corredor Público}") String corredorTitle,
            @Value("${receipts.signer-name:Luis María Oberti}") String signerName,
            @Value("${receipts.address:Padre Luis Galeano n° 1.910 – Local 2}") String address,
            @Value("${receipts.city:Córdoba}") String city,
            @Value("${receipts.license:Corredor Público · Mat. 04-2101}") String license,
            @Value("${receipts.website:www.inmobiliariaobertibusso.com.ar}") String website,
            @Value("${receipts.email:}") String email,
            @Value("${receipts.phone:}") String phone) {
        this.inmobiliariaName = inmobiliariaName;
        this.corredorName = corredorName;
        this.corredorTitle = corredorTitle;
        this.signerName = signerName;
        this.address = address;
        this.city = city;
        this.license = license;
        this.website = website;
        this.email = email;
        this.phone = phone;
    }
}
