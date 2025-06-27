package pi.ms_users.errorTest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import pi.ms_users.error.GlobalExceptionHandler;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleNotFoundException() {
        NotFoundException ex = new NotFoundException("Recurso no encontrado");

        ResponseEntity<String> response = handler.handleNotFoundException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Recurso no encontrado", response.getBody());
    }

    @Test
    void testHandleNoSuchElement() {
        NoSuchElementException ex = new NoSuchElementException("Elemento no encontrado");
        ResponseEntity<String> response = handler.handleNoSuchElement(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Elemento no encontrado", response.getBody());
    }

    @Test
    void testHandleEntityNotFound() {
        EntityNotFoundException ex = new EntityNotFoundException("Entidad no encontrada");
        ResponseEntity<String> response = handler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Entidad no encontrada", response.getBody());
    }

    @Test
    void testHandleDataIntegrity() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Violación de integridad");
        ResponseEntity<String> response = handler.handleDataIntegrity(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Violación de integridad de datos", response.getBody());
    }

    @Test
    void testHandleConstraintViolation() {
        ConstraintViolationException ex = new ConstraintViolationException("Datos inválidos", null);
        ResponseEntity<String> response = handler.handleConstraint(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Datos inválidos"));
    }

    @Test
    void testHandleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Argumento inválido");
        ResponseEntity<String> response = handler.handleIllegalArgument(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Argumento inválido"));
    }

    @Test
    void testHandleTransaction() {
        TransactionSystemException ex = new TransactionSystemException("Error en la transacción");
        ResponseEntity<String> response = handler.handleTransaction(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertTrue(response.getBody().contains("Error en la transacción"));
    }

    @Test
    void testHandleGeneric() {
        Exception ex = new Exception("Error inesperado");
        ResponseEntity<String> response = handler.handleGeneric(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("Error inesperado"));
    }

    @Test
    void testHandleAccessDenied() {
        AccessDeniedException ex = new AccessDeniedException("Acceso denegado");
        ResponseEntity<String> response = handler.handleAccessDenied(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().contains("Acceso denegado"));
    }

    @Test
    void testHandleBadCredentials() {
        BadCredentialsException ex = new BadCredentialsException("Credenciales inválidas");
        ResponseEntity<String> response = handler.handleBadCredentials(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody().contains("No autorizado"));
    }

    @Test
    void testHandleAuthentication() {
        AuthenticationException ex = new AuthenticationException("Error de autenticación") {};
        ResponseEntity<String> response = handler.handleAuthenticationException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody().contains("No autorizado"));
    }

    @Test
    void testHandleBadRequest_MissingServletRequestParameter() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("start", "LocalDateTime");
        ResponseEntity<String> response = handler.handleBadRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Bad request"));
        assertTrue(response.getBody().contains("start"));
    }

    @Test
    void testHandleBadRequest_MethodArgumentTypeMismatch() {
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                "invalid", LocalDateTime.class, "date", null, new IllegalArgumentException("Formato incorrecto"));
        ResponseEntity<String> response = handler.handleBadRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Bad request"));
        assertTrue(response.getBody().contains("date"));
    }

    @Test
    void testHandleMissingServletRequestPartException() {
        MissingServletRequestPartException ex = new MissingServletRequestPartException("data");
        ResponseEntity<String> response = handler.handleMissingServletRequestPart(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Falta parte requerida de la petición: data"));
    }

    @Test
    void testHandleHttpMessageNotReadable() {
        Throwable cause = new IllegalArgumentException("JSON parse error");
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Malformed JSON request", cause, null);

        ResponseEntity<String> response = handler.handleHttpMessageNotReadable(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("Invalid or missing request body"));
        assertTrue(response.getBody().contains("JSON parse error"));
    }
}
