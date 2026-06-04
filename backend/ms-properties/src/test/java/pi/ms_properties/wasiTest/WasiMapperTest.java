package pi.ms_properties.wasiTest;

import org.junit.jupiter.api.Test;
import org.springframework.util.MultiValueMap;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.Operation;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.RentsType;
import pi.ms_properties.domain.Status;
import pi.ms_properties.domain.Type;
import pi.ms_properties.domain.WasiLocationMapping;
import pi.ms_properties.wasi.WasiApiProperties;
import pi.ms_properties.wasi.WasiDefaultsProperties;
import pi.ms_properties.wasi.WasiMapper;

import java.math.BigDecimal;
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
