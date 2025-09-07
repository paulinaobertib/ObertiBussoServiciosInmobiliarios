package pi.ms_users.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pi.ms_users.service.impl.ContractUtilityService;

@Component
@RequiredArgsConstructor
public class ContractUtilityScheduler {

    private final ContractUtilityService contractUtilityService;

    // Utilities a pagar en 10 días
    @Scheduled(cron = "0 30 9 * * *", zone = "America/Argentina/Buenos_Aires")
    public void scheduledUtilitiesDueInTenDays() {
        contractUtilityService.sendAdminUtilitiesDueInTenDays();
        contractUtilityService.sendEmailsForUtilitiesDueInTenDays();
    }
}