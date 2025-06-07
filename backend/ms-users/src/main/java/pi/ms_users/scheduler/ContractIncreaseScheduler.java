package pi.ms_users.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pi.ms_users.service.impl.ContractIncreaseService;

@Component
@RequiredArgsConstructor
public class ContractIncreaseScheduler {

    private final ContractIncreaseService contractIncreaseService;

    // todos los dias a las 4 am
    @Scheduled(cron = "0 0 4 * * *")
    public void scheduledIncreaseJob() {
        contractIncreaseService.applyScheduledIncreases();
    }
}
