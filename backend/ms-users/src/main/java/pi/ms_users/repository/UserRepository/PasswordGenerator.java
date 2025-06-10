package pi.ms_users.repository.UserRepository;

import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class PasswordGenerator {

    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SYMBOLS = "!@#$%&*()-_=+";
    private static final String ALL = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;
    private static final int PASSWORD_LENGTH = 8;

    public static String generateRandomPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        // Garantizar al menos un carácter de cada tipo requerido
        password.append(getRandomChar(UPPERCASE, random));
        password.append(getRandomChar(LOWERCASE, random));

        // Rellenar el resto de forma aleatoria
        for (int i = 2; i < PASSWORD_LENGTH; i++) {
            password.append(getRandomChar(ALL, random));
        }

        // Mezclar para evitar patrones predecibles
        List<Character> chars = password.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());
        Collections.shuffle(chars, random);

        return chars.stream()
                .map(String::valueOf)
                .collect(Collectors.joining());
    }

    private static char getRandomChar(String chars, SecureRandom random) {
        return chars.charAt(random.nextInt(chars.length()));
    }
}
