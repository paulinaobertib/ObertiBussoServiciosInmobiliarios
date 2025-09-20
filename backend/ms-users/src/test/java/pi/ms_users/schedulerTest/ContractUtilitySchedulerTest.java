package pi.ms_users.schedulerTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_users.scheduler.ContractUtilityScheduler;
import pi.ms_users.service.impl.ContractUtilityService;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContractUtilitySchedulerTest {

    @Mock
    private ContractUtilityService contractUtilityService;

    @InjectMocks
    private ContractUtilityScheduler scheduler;

    @Test
    void scheduledUtilitiesDueInTenDays_shouldCallServices() {
        scheduler.scheduledUtilitiesDueInTenDays();

        verify(contractUtilityService, times(1)).sendAdminUtilitiesDueInTenDays();
        verify(contractUtilityService, times(1)).sendEmailsForUtilitiesDueInTenDays();
    }
}
