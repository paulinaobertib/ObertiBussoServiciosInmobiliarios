package pi.ms_users.receiptTest;

import org.junit.jupiter.api.Test;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.receipt.NumberToWordsEs;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class NumberToWordsEsTest {

    @Test
    void basicNumbers() {
        assertEquals("CERO", NumberToWordsEs.toWords(0));
        assertEquals("UNO", NumberToWordsEs.toWords(1));
        assertEquals("QUINCE", NumberToWordsEs.toWords(15));
        assertEquals("VEINTIUNO", NumberToWordsEs.toWords(21));
        assertEquals("TREINTA Y UNO", NumberToWordsEs.toWords(31));
        assertEquals("CIEN", NumberToWordsEs.toWords(100));
        assertEquals("CIENTO UNO", NumberToWordsEs.toWords(101));
        assertEquals("QUINIENTOS", NumberToWordsEs.toWords(500));
    }

    @Test
    void thousandsAndMillions() {
        assertEquals("MIL", NumberToWordsEs.toWords(1000));
        assertEquals("VEINTIÚN MIL", NumberToWordsEs.toWords(21000));
        assertEquals("TREINTA Y UN MIL CIEN", NumberToWordsEs.toWords(31100));
        assertEquals("CIEN MIL", NumberToWordsEs.toWords(100000));
        assertEquals("OCHOCIENTOS CINCUENTA MIL", NumberToWordsEs.toWords(850000));
        assertEquals("CUATROCIENTOS CUARENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE", NumberToWordsEs.toWords(446659));
        assertEquals("UN MILLÓN", NumberToWordsEs.toWords(1_000_000));
        assertEquals("UN MILLÓN CIENTO DIECISÉIS MIL NOVECIENTOS SESENTA", NumberToWordsEs.toWords(1_116_960));
        assertEquals("VEINTIÚN MILLONES", NumberToWordsEs.toWords(21_000_000));
        assertEquals("MIL MILLONES", NumberToWordsEs.toWords(1_000_000_000));
        assertEquals("DOS MIL QUINIENTOS MILLONES UNO", NumberToWordsEs.toWords(2_500_000_001L));
    }

    @Test
    void amounts() {
        assertEquals("PESOS CUATROCIENTOS CUARENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE CON 23/100",
                NumberToWordsEs.amountToWords(new BigDecimal("446659.23"), PaymentCurrency.ARS));
        assertEquals("DÓLARES ESTADOUNIDENSES QUINIENTOS",
                NumberToWordsEs.amountToWords(new BigDecimal("500.00"), PaymentCurrency.USD));
        assertEquals("PESOS UNO CON 05/100",
                NumberToWordsEs.amountToWords(new BigDecimal("1.049"), PaymentCurrency.ARS));
    }

    @Test
    void formatting() {
        assertEquals("1.116.960", NumberToWordsEs.formatAmount(new BigDecimal("1116960")));
        assertEquals("2.966,33", NumberToWordsEs.formatAmount(new BigDecimal("2966.33")));
        assertEquals("7.437,90", NumberToWordsEs.formatAmount(new BigDecimal("7437.9")));
    }

    @Test
    void negativeFails() {
        assertThrows(IllegalArgumentException.class, () -> NumberToWordsEs.toWords(-1));
    }
}
