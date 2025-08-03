package pi.ms_properties.feign;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.dto.feign.ContractDTO;
import pi.ms_properties.repository.feign.ContractRepository;
import pi.ms_properties.repository.feign.FeignUserRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractRepositoryTest {

    @Mock
    private FeignUserRepository feignUserRepository;

    @InjectMocks
    private ContractRepository contractRepository;

    // casos de exito

    @Test
    void findByPropertyId_returnsContractListSuccessfully() {
        Long propertyId = 1L;
        List<ContractDTO> mockContracts = List.of(new ContractDTO(), new ContractDTO());
        ResponseEntity<List<ContractDTO>> responseEntity = new ResponseEntity<>(mockContracts, HttpStatus.OK);

        when(feignUserRepository.getContractsByPropertyId(propertyId)).thenReturn(responseEntity);

        List<ContractDTO> result = contractRepository.findByPropertyId(propertyId);

        assertEquals(2, result.size());
        verify(feignUserRepository, times(1)).getContractsByPropertyId(propertyId);
    }

    // casos de error

    @Test
    void findByPropertyId_throwsExceptionWhenFeignFails() {
        Long propertyId = 1L;

        when(feignUserRepository.getContractsByPropertyId(propertyId))
                .thenThrow(new RuntimeException("Error al llamar al servicio externo"));

        assertThrows(RuntimeException.class, () -> contractRepository.findByPropertyId(propertyId));
        verify(feignUserRepository, times(1)).getContractsByPropertyId(propertyId);
    }
}

