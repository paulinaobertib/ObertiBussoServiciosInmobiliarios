/*package pi.ms_users.schedulerTest;

import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.junit.jupiter.api.extension.ExtendWith;
import pi.ms_users.scheduler.ContractIncreaseScheduler;
import pi.ms_users.service.impl.ContractIncreaseServiceViejoViejo;

@ExtendWith(MockitoExtension.class)
class ContractIncreaseSchedulerTest {

    @Mock
    private ContractIncreaseServiceViejoViejo contractIncreaseServiceViejo;

    @InjectMocks
    private ContractIncreaseScheduler contractIncreaseScheduler;

    @Test
    void testScheduledIncreaseJob_callsApplyScheduledIncreases() {
        contractIncreaseScheduler.scheduledIncreaseJob();

        verify(contractIncreaseServiceViejo).applyScheduledIncreases();
    }
}
 */

