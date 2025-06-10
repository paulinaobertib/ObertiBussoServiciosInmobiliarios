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
    public void scheduledIncreaseJob() {
        contractService.applyScheduledInactive();
    }
}
