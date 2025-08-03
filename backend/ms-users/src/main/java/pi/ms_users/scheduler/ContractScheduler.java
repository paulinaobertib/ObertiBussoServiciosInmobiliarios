package pi.ms_users.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pi.ms_users.service.impl.ContractService;

@Component
@RequiredArgsConstructor
public class ContractScheduler {
    private final ContractService contractService;

    // todos los dias a las 2 am
    @Scheduled(cron = "0 0 2 * * *")
    public void scheduledInactive() {
        contractService.applyScheduledInactive();
    }

    // todos los dias a las 8 am
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduledEndDate() {
        contractService.applyScheduledSoonInactive();
    }

    // el primero de cada mes a las 8 am
    @Scheduled(cron = "0 0 8 1 * ?", zone = "America/Argentina/Buenos_Aires")
    public void applyMonthlyRentReminder() {
        contractService.applyScheduledPayment();
    }
}
