package pi.ms_properties.wasiTest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.util.MultiValueMap;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.Image;
import pi.ms_properties.domain.Operation;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.RentsType;
import pi.ms_properties.domain.Status;
import pi.ms_properties.domain.Type;
import pi.ms_properties.domain.WasiLocationMapping;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.wasi.WasiApiProperties;
import pi.ms_properties.wasi.WasiDefaultsProperties;
import pi.ms_properties.wasi.WasiMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for WasiMapper.propertyToWasiForm: portal sending (portals[]),
 * id_property_type heuristic (ordering + fallback) and the configurable id mappings.
 */
class WasiMapperTest {

    private WasiMapper mapper(WasiDefaultsProperties defaults) {
        return new WasiMapper(new WasiApiProperties(), defaults);
    }

    private WasiMapper mapper() {
        return mapper(new WasiDefaultsProperties());
    }

    private WasiLocationMapping loc() {
        return WasiLocationMapping.builder()
                .wasiCountryId(5)
                .wasiRegionId(14)
                .wasiCityId(100)
                .build();
    }

    private Property property(Operation op, Currency currency, String typeName) {
        Property p = new Property();
        p.setId(42L);
        p.setTitle("Prop test");
        p.setOperation(op);
        p.setCurrency(currency);
        p.setPrice(new BigDecimal("150000"));
        p.setArea(120f);
        p.setCoveredArea(90f);
        p.setBedrooms(2f);
        p.setBathrooms(1f);
        p.setStatus(Status.DISPONIBLE);
        if (typeName != null) {
            Type t = new Type();
            t.setName(typeName);
            p.setType(t);
        }
        return p;
    }

    private String typeIdFor(String typeName) {
        MultiValueMap<String, String> form = mapper().propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, typeName), loc(), null);
        return form.getFirst("id_property_type");
    }

    // ---------- Operation / currency / location ----------

    @Test
    void sale_usd_mapsOperationCurrencyAndLocation() {
        MultiValueMap<String, String> form = mapper().propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Casa"), loc(), null);

        assertEquals("true", form.getFirst("for_sale"));
        assertEquals("false", form.getFirst("for_rent"));
        assertEquals("false", form.getFirst("for_transfer"));
        assertEquals("150000", form.getFirst("sale_price"));
        assertEquals("0", form.getFirst("rent_price"));
        assertEquals("3", form.getFirst("id_currency")); // USD default
        assertEquals("5", form.getFirst("id_country"));
        assertEquals("14", form.getFirst("id_region"));
        assertEquals("100", form.getFirst("id_city"));
        assertEquals("120", form.getFirst("area"));
        assertEquals("90", form.getFirst("built_area"));
    }

    @Test
    void rent_ars_setsRentPriceCurrencyAndDefaultRentsType() {
        MultiValueMap<String, String> form = mapper().propertyToWasiForm(
                property(Operation.ALQUILER, Currency.ARS, "Departamento"), loc(), null);

        assertEquals("false", form.getFirst("for_sale"));
        assertEquals("true", form.getFirst("for_rent"));
        assertEquals("150000", form.getFirst("rent_price"));
        assertEquals("0", form.getFirst("sale_price"));
        assertEquals("2", form.getFirst("id_currency")); // ARS default
        // ALQUILER without rentsType -> defaults to MENSUAL (4)
        assertEquals("4", form.getFirst("id_rents_type"));
    }

    @Test
    void rent_withRentsType_usesEnumWasiId() {
        Property p = property(Operation.ALQUILER, Currency.ARS, "Departamento");
        p.setRentsType(RentsType.SEMANAL);
        MultiValueMap<String, String> form = mapper().propertyToWasiForm(p, loc(), null);
        assertEquals("2", form.getFirst("id_rents_type")); // SEMANAL = 2
    }

    @Test
    void sale_doesNotSendRentsType() {
        MultiValueMap<String, String> form = mapper().propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Casa"), loc(), null);
        assertNull(form.getFirst("id_rents_type"));
    }

    // ---------- Issue 2: id_property_type ordering + coverage + fallback ----------

    @Test
    void propertyType_campoBeforeCasa_ordering() {
        // "casa de campo" must map to Quinta/Campo (31), NOT House (1)
        assertEquals("31", typeIdFor("Casa de campo"));
        assertEquals("31", typeIdFor("Quinta"));
        assertEquals("31", typeIdFor("Chacra"));
    }

    @Test
    void propertyType_commonMappings() {
        assertEquals("1", typeIdFor("Casa"));
        assertEquals("2", typeIdFor("Departamento"));
        assertEquals("2", typeIdFor("Depto 2 ambientes"));
        assertEquals("14", typeIdFor("Monoambiente"));
        assertEquals("16", typeIdFor("Edificio"));
        assertEquals("4", typeIdFor("Oficina"));
        assertEquals("3", typeIdFor("Local comercial"));
        assertEquals("8", typeIdFor("Galpón"));
        assertEquals("26", typeIdFor("Cochera"));
        assertEquals("20", typeIdFor("Duplex"));
        assertEquals("21", typeIdFor("Penthouse"));
        assertEquals("5", typeIdFor("Terreno"));
        assertEquals("32", typeIdFor("Loteo"));
    }

    @Test
    void propertyType_unknownOrNull_fallsBackToConfigurableDefault() {
        // default config = 1 (Casa)
        assertEquals("1", typeIdFor("Tipo inexistente XYZ"));
        assertEquals("1", typeIdFor(null));

        // configurable default
        WasiDefaultsProperties defaults = new WasiDefaultsProperties();
        defaults.setPropertyTypeDefaultId(99);
        MultiValueMap<String, String> form = mapper(defaults).propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Tipo inexistente XYZ"), loc(), null);
        assertEquals("99", form.getFirst("id_property_type"));
    }

    // ---------- Issue 1: portals[] ----------

    @Test
    void portals_sentAsRepeatedArrayParam() {
        MultiValueMap<String, String> form = mapper().propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Casa"), loc(), List.of(2, 4));
        assertEquals(List.of("2", "4"), form.get("portals[]"));
    }

    @Test
    void portals_nullOrEmpty_doesNotAddKey() {
        MultiValueMap<String, String> nullForm = mapper().propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Casa"), loc(), null);
        assertFalse(nullForm.containsKey("portals[]"));

        MultiValueMap<String, String> emptyForm = mapper().propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Casa"), loc(), List.of());
        assertFalse(emptyForm.containsKey("portals[]"));
    }

    // ---------- Advisory: configurable currency ids ----------

    // ---------- fromWasiProperty: descripción, tipo, imágenes ----------

    private static final ObjectMapper OM = new ObjectMapper();

    private JsonNode node(String json) {
        try {
            return OM.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void fromWasiProperty_cleansHtmlDescriptionToPlainText() {
        JsonNode n = node("{\"id_property\":\"123\",\"observations\":"
                + "\"<p><span style=\\\"color:#000\\\">Hermosa casa &oacute;ptima de 100 m&sup2;<br/>"
                + "con jard&iacute;n</span></p>\"}");
        PropertyDTO dto = mapper().fromWasiProperty(n, false);
        String d = dto.getDescription();
        assertFalse(d.contains("<"), "no debe quedar HTML");
        assertTrue(d.contains("óptima"), "&oacute; -> ó");
        assertTrue(d.contains("m²"), "&sup2; -> ²");
        assertTrue(d.contains("jardín"), "&iacute; -> í");
        assertTrue(d.contains("\n"), "<br/> -> salto de línea");
    }

    @Test
    void fromWasiProperty_typeNameFromIdPropertyType() {
        assertEquals("Casa", mapper().fromWasiProperty(
                node("{\"id_property\":\"1\",\"id_property_type\":1}"), false).getType().getName());
        assertEquals("Lote", mapper().fromWasiProperty(
                node("{\"id_property\":\"2\",\"id_property_type\":32}"), false).getType().getName());
        // id desconocido -> nombre genérico, nunca "Wasi"
        assertEquals("Propiedad", mapper().fromWasiProperty(
                node("{\"id_property\":\"3\",\"id_property_type\":999}"), false).getType().getName());
    }

    @Test
    void fromWasiProperty_galleryUsesOriginalUrlAndOrdersByPosition() {
        JsonNode n = node("{\"id_property\":\"5\",\"galleries\":[{"
                + "\"0\":{\"id\":11,\"position\":2,\"url\":\"u2\",\"url_big\":\"b2\",\"url_original\":\"o2\"},"
                + "\"1\":{\"id\":10,\"position\":1,\"url\":\"u1\",\"url_big\":\"b1\",\"url_original\":\"o1\"}"
                + "}]}");
        List<Image> imgs = new ArrayList<>(mapper().fromWasiProperty(n, false).getImages());
        assertEquals(2, imgs.size());
        assertEquals("o1", imgs.get(0).getUrl()); // position 1 primero
        assertEquals("o2", imgs.get(1).getUrl());
    }

    @Test
    void fromWasiProperty_mapsFeaturesToAmenities() {
        JsonNode n = node("{\"id_property\":\"9\",\"features\":{"
                + "\"internal\":[{\"id\":116,\"nombre\":\"Agua\",\"name\":\"\"},"
                + "{\"id\":85,\"nombre\":\"Cocina equipada\",\"name\":\"\"}],"
                + "\"external\":[{\"id\":30,\"nombre\":\"Patio\",\"name\":\"\"}]}}");
        List<Amenity> ams = new ArrayList<>(mapper().fromWasiProperty(n, false).getAmenities());
        List<String> names = ams.stream().map(Amenity::getName).toList();
        assertEquals(3, ams.size());
        assertTrue(names.contains("Agua"));
        assertTrue(names.contains("Cocina equipada"));
        assertTrue(names.contains("Patio"));
    }

    @Test
    void fromWasiProperty_noFeatures_emptyAmenities() {
        assertTrue(mapper().fromWasiProperty(node("{\"id_property\":\"10\"}"), false).getAmenities().isEmpty());
    }

    @Test
    void fromWasiProperty_mainImagePrefersOriginalThenBig() {
        assertEquals("o", mapper().fromWasiProperty(
                node("{\"id_property\":\"7\",\"main_image\":{\"url\":\"u\",\"url_big\":\"b\",\"url_original\":\"o\"}}"),
                false).getMainImage());
        assertEquals("b", mapper().fromWasiProperty(
                node("{\"id_property\":\"8\",\"main_image\":{\"url\":\"u\",\"url_big\":\"b\"}}"),
                false).getMainImage());
    }

    @Test
    void sourceOf_alliedWithCompanyName_includesName() {
        assertEquals("Aliada - GRUPO A INMOBILIARIA", mapper().sourceOf(
                node("{\"owner\":\"allied\",\"company\":{\"name\":\"GRUPO A INMOBILIARIA\"}}")));
    }

    @Test
    void sourceOf_alliedWithoutName_fallsBackToAliada() {
        assertEquals("Aliada", mapper().sourceOf(node("{\"owner\":\"allied\"}")));
        assertEquals("Aliada", mapper().sourceOf(node("{\"owner\":\"allied\",\"company\":{\"name\":\"\"}}")));
    }

    @Test
    void sourceOf_ownOrMissing_isPropia() {
        assertEquals("propia", mapper().sourceOf(node("{\"owner\":\"own\"}")));
        assertEquals("propia", mapper().sourceOf(node("{}")));
    }

    @Test
    void fromWasiProperty_adminSetsSourceWithAlliedName() {
        PropertyDTO dto = mapper().fromWasiProperty(
                node("{\"id_property\":\"11\",\"owner\":\"allied\",\"company\":{\"name\":\"Grupo X\"}}"), true);
        assertEquals("Aliada - Grupo X", dto.getSource());
    }

    @Test
    void typeIdFor_publicMapping_returnsMinusOneWhenUnknown() {
        WasiMapper m = mapper();
        assertEquals(1, m.typeIdFor("Casa"));
        assertEquals(32, m.typeIdFor("Lote"));
        assertEquals(2, m.typeIdFor("Departamento"));
        assertEquals(-1, m.typeIdFor("Tipo inexistente XYZ"));
        assertEquals(-1, m.typeIdFor(null));
    }

    // ---------- Saneamiento de descripción de aliadas: quitar contacto/promo de otras inmobiliarias ----------

    /** Arma un JSON de propiedad de Wasi con observations/owner/company y devuelve la descripción ya saneada. */
    private String descOf(String observations, String owner, String company) {
        StringBuilder json = new StringBuilder("{\"id_property\":\"1\",\"observations\":");
        try {
            json.append(OM.writeValueAsString(observations));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        if (owner != null) {
            json.append(",\"owner\":\"").append(owner).append("\"");
        }
        if (company != null) {
            json.append(",\"company\":{\"name\":\"").append(company).append("\"}");
        }
        json.append("}");
        return mapper().fromWasiProperty(node(json.toString()), true).getDescription();
    }

    @Test
    void stripContact_exampleGiven_removesPhonePromoLine() {
        String d = descOf(
                "Hermosa casa con jardín.\n"
                        + "💬 Consultanos para más info o agendá tu visita al 351 663-0095 // 351 637-6007 // 351 507-9918",
                "allied", "Grupo X");
        assertTrue(d.contains("Hermosa casa"), "se conserva la descripción real");
        assertFalse(d.contains("663-0095"), "se borra el teléfono");
        assertFalse(d.toLowerCase().contains("consultanos"), "se borra el CTA");
        assertFalse(d.contains("💬"), "se borra el emoji de contacto");
    }

    @Test
    void stripContact_phoneFormats_allRemoved() {
        assertFalse(descOf("Linda casa.\nTel: 351 663-0095", "allied", null).contains("663"));
        assertFalse(descOf("Linda casa.\n+54 351 1234567", "allied", null).contains("1234567"));
        assertFalse(descOf("Linda casa.\n(0351) 456-7890", "allied", null).contains("456"));
        assertFalse(descOf("Linda casa.\n3516630095 // 3516376007", "allied", null).contains("3516630095"));
        assertFalse(descOf("Linda casa.\n11 4567-8900", "allied", null).contains("4567"));
    }

    @Test
    void stripContact_ctaLines_removed() {
        assertFalse(descOf("Excelente ubicación.\nComunicate con nosotros", "allied", null).toLowerCase().contains("comunicate"));
        assertFalse(descOf("Excelente ubicación.\nEscribinos por WhatsApp", "allied", null).toLowerCase().contains("whatsapp"));
        assertFalse(descOf("Excelente ubicación.\nAgendá tu visita hoy", "allied", null).toLowerCase().contains("agend"));
        assertFalse(descOf("Excelente ubicación.\nConsultá mayor información", "allied", null).toLowerCase().contains("consult"));
    }

    @Test
    void stripContact_emailUrlHandle_removed() {
        assertFalse(descOf("Casa céntrica.\ninfo@inmobiliaria.com.ar", "allied", null).contains("@"));
        assertFalse(descOf("Casa céntrica.\nwww.otrainmobiliaria.com.ar", "allied", null).toLowerCase().contains("www."));
        assertFalse(descOf("Casa céntrica.\nSeguinos en @otra_inmo", "allied", null).contains("@otra_inmo"));
        assertFalse(descOf("Casa céntrica.\nInstagram: @propiedades", "allied", null).toLowerCase().contains("instagram"));
    }

    @Test
    void stripContact_alliedNameAsLine_removed() {
        String d = descOf("Departamento luminoso.\nINMOBILIARIA OTRA SRL", "allied", "INMOBILIARIA OTRA SRL");
        assertTrue(d.contains("Departamento luminoso"));
        assertFalse(d.toUpperCase().contains("INMOBILIARIA OTRA SRL"), "se borra el nombre de la aliada");
    }

    @Test
    void stripContact_alliedNameInsideContactLine_removed() {
        String d = descOf("Casa a estrenar.\nConsultá en Grupo X al 351 663-0095", "allied", "Grupo X");
        assertTrue(d.contains("Casa a estrenar"));
        assertFalse(d.contains("Grupo X"));
        assertFalse(d.contains("663-0095"));
    }

    @Test
    void stripContact_keepsLegitNumbers_noFalsePositives() {
        assertTrue(descOf("Lote de 351 m2 con frente amplio", "allied", null).contains("351 m2"));
        assertTrue(descOf("Ubicado sobre Av. Colón 1234", "allied", null).contains("Av. Colón 1234"));
        assertTrue(descOf("Superficie cubierta de 100 m²", "allied", null).contains("100 m²"));
        assertTrue(descOf("Casa de 3 dormitorios y 2 baños", "allied", null).contains("3 dormitorios"));
    }

    @Test
    void stripContact_keepsNormalDescription_untouched() {
        String d = descOf("Amplia casa en barrio cerrado, 4 dormitorios, pileta y quincho.\n"
                + "A 5 minutos del centro.", "allied", "Grupo X");
        assertTrue(d.contains("Amplia casa en barrio cerrado"));
        assertTrue(d.contains("A 5 minutos del centro"));
    }

    @Test
    void stripContact_ownProperty_notCleaned() {
        // Alcance: solo aliadas. En propias de Wasi la descripción queda intacta.
        String d = descOf("Casa propia excelente.\nConsultanos al 351 663-0095", "own", null);
        assertTrue(d.contains("Casa propia excelente"));
        assertTrue(d.contains("663-0095"), "en propias no se limpia el contacto");
    }

    @Test
    void stripContact_nullOrBlankObservations_safe() {
        PropertyDTO dto = mapper().fromWasiProperty(node("{\"id_property\":\"1\",\"owner\":\"allied\"}"), true);
        assertEquals("", dto.getDescription());
    }

    @Test
    void currency_isConfigurable() {
        WasiDefaultsProperties defaults = new WasiDefaultsProperties();
        defaults.setCurrencyUsd(7);
        defaults.setCurrencyArs(9);

        MultiValueMap<String, String> usd = mapper(defaults).propertyToWasiForm(
                property(Operation.VENTA, Currency.USD, "Casa"), loc(), null);
        assertEquals("7", usd.getFirst("id_currency"));

        MultiValueMap<String, String> ars = mapper(defaults).propertyToWasiForm(
                property(Operation.VENTA, Currency.ARS, "Casa"), loc(), null);
        assertEquals("9", ars.getFirst("id_currency"));
    }
}
