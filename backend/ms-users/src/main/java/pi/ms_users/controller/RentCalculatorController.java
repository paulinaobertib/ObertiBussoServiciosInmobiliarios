package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.rentcalc.RentCalculationDTO;
import pi.ms_users.service.interf.IRentCalculatorService;

import java.math.BigDecimal;
import java.time.LocalDate;

// calculadora publica de actualizacion de alquileres (no requiere login)
@RestController
@RequestMapping("/rentCalculator")
@RequiredArgsConstructor
public class RentCalculatorController {

    private final IRentCalculatorService rentCalculatorService;

    @GetMapping("/calculate")
    public ResponseEntity<RentCalculationDTO> calculate(@RequestParam BigDecimal amount,
                                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                        @RequestParam int months,
                                                        @RequestParam String index,
                                                        @RequestParam(required = false) Integer ipcLag) {
        return ResponseEntity.ok(rentCalculatorService.calculate(amount, startDate, months, index, ipcLag));
    }
}
