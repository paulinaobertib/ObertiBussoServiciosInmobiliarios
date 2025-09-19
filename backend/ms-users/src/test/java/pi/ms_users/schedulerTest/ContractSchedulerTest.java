package pi.ms_users.schedulerTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_users.scheduler.ContractScheduler;
import pi.ms_users.service.impl.ContractService;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContractSchedulerTest {

    @Mock
    private ContractService contractService;

    @InjectMocks
    private ContractScheduler scheduler;

    @Test
    void scheduledContractIncreaseInOneMonth_shouldCallServices() {
        scheduler.scheduledContractIncreaseInOneMonth();

        verify(contractService, times(1)).sendEmailsForContractsWithIncreaseInOneMonth();
        verify(contractService, times(1)).sendAdminContractsWithIncreaseInOneMonth();
    }

    @Test
    void scheduledContractsExpiringInOneMonth_shouldCallService() {
        scheduler.scheduledContractsExpiringInOneMonth();

        verify(contractService, times(1)).sendEmailsForContractsExpiringInOneMonth();
    }

    @Test
    void scheduledContractsExpiringToday_shouldCallService() {
        scheduler.scheduledContractsExpiringToday();

        verify(contractService, times(1)).sendEmailsForContractsExpiringToday();
    }

    @Test
    void scheduledPaymentRemindersForActiveContracts_shouldCallService() {
        scheduler.scheduledPaymentRemindersForActiveContracts();

        verify(contractService, times(1)).sendPaymentRemindersForActiveContracts();
    }
}