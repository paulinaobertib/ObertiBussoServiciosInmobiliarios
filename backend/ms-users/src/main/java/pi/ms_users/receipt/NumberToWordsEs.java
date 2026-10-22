package pi.ms_users.receipt;

import pi.ms_users.domain.PaymentCurrency;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;

// pasa montos a letras como se escriben en los recibos: "PESOS UN MILLÓN CIENTO DIECISÉIS MIL NOVECIENTOS SESENTA"
public final class NumberToWordsEs {

    private static final String[] UNITS = {"", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"};

    private static final String[] TEN_TO_TWENTY_NINE = {
            "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
            "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"
    };

    private static final String[] TENS = {"", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"};

    private static final String[] HUNDREDS = {"", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
            "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"};

    private NumberToWordsEs() {
    }

    public static String toWords(long n) {
        if (n < 0) throw new IllegalArgumentException("El número no puede ser negativo");
        if (n == 0) return "CERO";
        if (n >= 1_000_000_000_000L) throw new IllegalArgumentException("Número demasiado grande");

        long millions = n / 1_000_000;
        int rest = (int) (n % 1_000_000);

        StringBuilder sb = new StringBuilder();
        if (millions == 1) {
            sb.append("UN MILLÓN");
        } else if (millions > 1) {
            sb.append(belowMillion((int) millions, true)).append(" MILLONES");
        }
        if (rest > 0) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(belowMillion(rest, false));
        }
        return sb.toString();
    }

    // monto completo: "PESOS ... CON 23/100"
    public static String amountToWords(BigDecimal amount, PaymentCurrency currency) {
        BigDecimal value = amount.setScale(2, RoundingMode.HALF_UP);
        long integerPart = value.longValue();
        int cents = value.subtract(BigDecimal.valueOf(integerPart)).movePointRight(2).intValue();

        String prefix = currency == PaymentCurrency.USD ? "DÓLARES ESTADOUNIDENSES " : "PESOS ";
        String words = prefix + toWords(integerPart);
        if (cents > 0) {
            words += String.format(" CON %02d/100", cents);
        }
        return words;
    }

    // formato argentino: 1.116.960 / 2.966,33 (sin decimales si son cero)
    public static String formatAmount(BigDecimal amount) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols();
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');
        BigDecimal value = amount.setScale(2, RoundingMode.HALF_UP);
        boolean hasCents = value.remainder(BigDecimal.ONE).compareTo(BigDecimal.ZERO) != 0;
        DecimalFormat format = new DecimalFormat(hasCents ? "#,##0.00" : "#,##0", symbols);
        return format.format(value);
    }

    public static String currencySymbol(PaymentCurrency currency) {
        return currency == PaymentCurrency.USD ? "U$S" : "$";
    }

    // apocope: "UNO" pasa a "UN" cuando va delante de MIL / MILLONES (VEINTIÚN MIL, TREINTA Y UN MILLONES)
    private static String belowMillion(int n, boolean apocope) {
        int thousands = n / 1000;
        int units = n % 1000;
        StringBuilder sb = new StringBuilder();
        if (thousands == 1) {
            sb.append("MIL");
        } else if (thousands > 1) {
            sb.append(belowThousand(thousands, true)).append(" MIL");
        }
        if (units > 0) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(belowThousand(units, apocope));
        }
        return sb.toString();
    }

    private static String belowThousand(int n, boolean apocope) {
        if (n == 100) return "CIEN";
        int hundreds = n / 100;
        int rest = n % 100;
        StringBuilder sb = new StringBuilder(HUNDREDS[hundreds]);
        if (rest > 0) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(belowHundred(rest, apocope));
        }
        return sb.toString();
    }

    private static String belowHundred(int n, boolean apocope) {
        if (n < 10) {
            return (n == 1 && apocope) ? "UN" : UNITS[n];
        }
        if (n < 30) {
            if (n == 21 && apocope) return "VEINTIÚN";
            return TEN_TO_TWENTY_NINE[n - 10];
        }
        int tens = n / 10;
        int units = n % 10;
        if (units == 0) return TENS[tens];
        return TENS[tens] + " Y " + ((units == 1 && apocope) ? "UN" : UNITS[units]);
    }
}
