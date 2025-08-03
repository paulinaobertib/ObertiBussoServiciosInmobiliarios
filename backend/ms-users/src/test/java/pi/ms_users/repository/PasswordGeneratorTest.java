package pi.ms_users.repository;

import org.junit.jupiter.api.Test;
import pi.ms_users.repository.UserRepository.PasswordGenerator;

import static org.junit.jupiter.api.Assertions.*;

public class PasswordGeneratorTest {
    @Test
    void generateRandomPassword_ShouldReturnPasswordWithRequiredCriteria() {
        String password = PasswordGenerator.generateRandomPassword();

        assertNotNull(password, "La contraseña no debe ser null");
        assertEquals(8, password.length(), "La longitud de la contraseña debe ser 8");

        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowercase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSymbol = password.chars().anyMatch(c -> "!@#$%&*()-_=+".indexOf(c) >= 0);

        assertTrue(hasUppercase, "La contraseña debe tener al menos una letra mayúscula");
        assertTrue(hasLowercase, "La contraseña debe tener al menos una letra minúscula");
        assertTrue(hasDigit || hasSymbol, "La contraseña debe tener al menos un dígito o un símbolo");
    }
}
