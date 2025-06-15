package pi.ms_users.schedulerTest;

import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.junit.jupiter.api.extension.ExtendWith;
import pi.ms_users.scheduler.ContractScheduler;
import pi.ms_users.service.impl.ContractService;

@ExtendWith(MockitoExtension.class)
class ContractSchedulerTest {

    @Mock
    private ContractService contractService;

    @InjectMocks
    private ContractScheduler contractScheduler;

    @Test
    void testScheduledInactive_callsApplyScheduledInactive() {
        contractScheduler.scheduledInactive();

        verify(contractService).applyScheduledInactive();
    }

    @Test
    void testScheduledEndDate_callsApplyScheduledSoonInactive() {
        contractScheduler.scheduledEndDate();

        verify(contractService).applyScheduledSoonInactive();
    }
}

