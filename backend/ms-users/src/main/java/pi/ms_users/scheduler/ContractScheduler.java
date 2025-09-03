package pi.ms_users.scheduler;


import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pi.ms_users.service.impl.ContractService;

@Component
@RequiredArgsConstructor
public class ContractScheduler {
    private final ContractService contractService;

    // Contratos con aumento en un mes
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduledContractIncreaseInOneMonth() {
        contractService.sendEmailsForContractsWithIncreaseInOneMonth();
        contractService.sendAdminContractsWithIncreaseInOneMonth();
    }

    // Contratos próximos a vencer en un mes
    @Scheduled(cron = "0 0 7 * * *")
    public void scheduledContractsExpiringInOneMonth() {
        contractService.sendEmailsForContractsExpiringInOneMonth();
    }

    // Contratos que vencen hoy
    @Scheduled(cron = "0 0 10 * * *")
    public void scheduledContractsExpiringToday() {
        contractService.sendEmailsForContractsExpiringToday();
    }

    // Recordatorio de pago de contratos activos
    @Scheduled(cron = "0 0 9 * * *")
    public void scheduledPaymentRemindersForActiveContracts() {
        contractService.sendPaymentRemindersForActiveContracts();
    }
}