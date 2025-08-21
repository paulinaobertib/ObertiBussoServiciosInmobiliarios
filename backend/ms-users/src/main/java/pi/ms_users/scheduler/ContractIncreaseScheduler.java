/*package pi.ms_users.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import pi.ms_users.service.impl.ContractIncreaseServiceViejoViejo;

@Component
@RequiredArgsConstructor
public class ContractIncreaseScheduler {

    private final ContractIncreaseServiceViejoViejo contractIncreaseServiceViejo;

    // todos los 20 de cada mes a las 8 am
    @Scheduled(cron = "0 0 8 20 * ?")
    public void scheduledIncreaseJob() {
        contractIncreaseServiceViejo.applyScheduledIncreases();
    }
}

 */