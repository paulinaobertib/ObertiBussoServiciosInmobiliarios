package pi.ms_users.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_users.domain.*;
import pi.ms_users.dto.*;
import pi.ms_users.repository.IGuarantorRepository;
import pi.ms_users.service.interf.IGuarantorService;
import pi.ms_users.specification.GuarantorSpecification;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuarantorService implements IGuarantorService {

    private final IGuarantorRepository guarantorRepository;

    private final EntityManager em;

    private IncreaseIndexContractDTO mapIncreaseIndex(IncreaseIndex ii) {
        if (ii == null) return null;
        IncreaseIndexContractDTO d = new IncreaseIndexContractDTO();
        d.setId(ii.getId());
        d.setCode(ii.getCode());
        d.setName(ii.getName());
        return d;
    }

    private ContractUtilityContractDTO mapContractUtility(ContractUtility cu) {
        ContractUtilityContractDTO d = new ContractUtilityContractDTO();
        d.setId(cu.getId());
        d.setPeriodicity(cu.getPeriodicity());
        d.setInitialAmount(cu.getInitialAmount());
        d.setLastPaidAmount(cu.getLastPaidAmount());
        d.setLastPaidDate(cu.getLastPaidDate());
        d.setNotes(cu.getNotes());
        d.setUtilityId(cu.getUtility() != null ? cu.getUtility().getId() : null);
        return d;
    }

    private ContractIncreaseContractDTO mapContractIncrease(ContractIncrease ci) {
        ContractIncreaseContractDTO d = new ContractIncreaseContractDTO();
        d.setId(ci.getId());
        d.setDate(ci.getDate());
        d.setCurrency(ci.getCurrency());
        d.setAmount(ci.getAmount());
        d.setAdjustment(ci.getAdjustment());
        d.setNote(ci.getNote());
        d.setPeriodFrom(ci.getPeriodFrom());
        d.setPeriodTo(ci.getPeriodTo());
        d.setIndexId(ci.getIndex() != null ? ci.getIndex().getId() : null);
        return d;
    }

    private CommissionContractDTO mapCommission(Commission c) {
        if (c == null) return null;
        CommissionContractDTO d = new CommissionContractDTO();
        d.setId(c.getId());
        d.setCurrency(c.getCurrency());
        d.setTotalAmount(c.getTotalAmount());
        d.setDate(c.getDate());
        d.setPaymentType(c.getPaymentType());
        d.setInstallments(c.getInstallments());
        d.setStatus(c.getStatus());
        d.setNote(c.getNote());
        return d;
    }

    private PaymentContractDTO mapPayment(Payment p) {
        PaymentContractDTO d = new PaymentContractDTO();
        d.setId(p.getId());
        d.setPaymentCurrency(p.getPaymentCurrency());
        d.setAmount(p.getAmount());
        d.setDate(p.getDate());
        d.setDescription(p.getDescription());
        d.setConcept(p.getConcept());
        d.setContractUtilityId(p.getContractUtility() != null ? p.getContractUtility().getId() : null);
        d.setCommissionId(p.getCommission() != null ? p.getCommission().getId() : null);
        return d;
    }

    public GuarantorGetDTO toGetDTO(Guarantor entity) {
        if (entity == null) return null;
        GuarantorGetDTO dto = new GuarantorGetDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());

        dto.setContractGetDTOS(entity.getContracts() == null ? List.of()
                : entity.getContracts().stream()
                .map(this::mapContractGuarantor)
                .collect(Collectors.toList())
        );
        return dto;
    }

    public Guarantor toEntity(GuarantorDTO dto) {
        if (dto == null) return null;
        Guarantor entity = new Guarantor();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        return entity;
    }

    private ContractGuarantorGetDTO mapContractGuarantor(Contract entity) {
        if (entity == null) return null;

        ContractGuarantorGetDTO dto = new ContractGuarantorGetDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setPropertyId(entity.getPropertyId());
        dto.setContractType(entity.getContractType());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setContractStatus(entity.getContractStatus());
        dto.setCurrency(entity.getCurrency());
        dto.setInitialAmount(entity.getInitialAmount());
        dto.setAdjustmentFrequencyMonths(entity.getAdjustmentFrequencyMonths());
        dto.setLastPaidAmount(entity.getLastPaidAmount());
        dto.setLastPaidDate(entity.getLastPaidDate());
        dto.setNote(entity.getNote());
        dto.setHasDeposit(entity.isHasDeposit());
        dto.setDepositAmount(entity.getDepositAmount());
        dto.setDepositNote(entity.getDepositNote());

        dto.setAdjustmentIndex(mapIncreaseIndex(entity.getAdjustmentIndex()));
        dto.setContractUtilities(entity.getContractUtilities().stream()
                .map(this::mapContractUtility)
                .toList());
        dto.setContractIncrease(entity.getContractIncrease().stream()
                .map(this::mapContractIncrease)
                .toList());
        dto.setCommission(mapCommission(entity.getCommission()));
        dto.setPayments(entity.getPayments().stream()
                .map(this::mapPayment)
                .toList());

        return dto;
    }

    private void validateCreate(GuarantorDTO dto) {
        if (dto == null) throw new BadRequestException("Body requerido.");
        if (isBlank(dto.getName()))  throw new BadRequestException("Nombre requerido.");
        if (isBlank(dto.getPhone())) throw new BadRequestException("Teléfono requerido.");
        if (isBlank(dto.getEmail())) throw new BadRequestException("Email requerido.");

        guarantorRepository.findByEmail(dto.getEmail()).ifPresent(g -> {
            throw new BadRequestException("Email ya está en uso.");
        });
        guarantorRepository.findByPhone(dto.getPhone()).ifPresent(g -> {
            throw new BadRequestException("Teléfono ya está en uso.");
        });
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(GuarantorDTO dto) {
        validateCreate(dto);

        Guarantor g = new Guarantor();
        g.setName(dto.getName());
        g.setPhone(dto.getPhone());
        g.setEmail(dto.getEmail());

        guarantorRepository.save(g);
        return ResponseEntity.status(HttpStatus.CREATED).body("Se ha guardado el garante: " + dto.getName());
    }

    @Override
    @Transactional
    public ResponseEntity<String> update(GuarantorDTO dto) {
        if (dto.getId() == null) throw new BadRequestException("Id es requerido para actualizar.");

        Guarantor g = guarantorRepository.findById(dto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Garante no encontrado"));

        guarantorRepository.findByEmail(dto.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(g.getId()))
                throw new BadRequestException("Email ya está en uso por otro garante.");
        });
        guarantorRepository.findByPhone(dto.getPhone()).ifPresent(existing -> {
            if (!existing.getId().equals(g.getId()))
                throw new BadRequestException("Teléfono ya está en uso por otro garante.");
        });

        g.setName(dto.getName());
        g.setPhone(dto.getPhone());
        g.setEmail(dto.getEmail());

        guarantorRepository.save(g);
        return ResponseEntity.ok("Garante actualizado");
    }

    @Override
    @Transactional
    public ResponseEntity<String> delete(Long id) {
        Guarantor g = guarantorRepository.findByIdWithContracts(id)
                .orElseThrow(() -> new EntityNotFoundException("Garante no encontrado"));

        if (g.getContracts() != null && !g.getContracts().isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar: el garante está vinculado a contratos.");
        }

        guarantorRepository.deleteById(id);
        return ResponseEntity.ok("Garante eliminado");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<GuarantorGetDTO> getById(Long id) {
        Guarantor g = guarantorRepository.findByIdWithContracts(id)
                .orElseThrow(() -> new EntityNotFoundException("Garante no encontrado"));

        return ResponseEntity.ok(toGetDTO(g));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<GuarantorGetDTO>> getAll() {
        List<Guarantor> list = guarantorRepository.findAll();
        List<GuarantorGetDTO> out = list.stream()
                .map(this::toGetDTO)
                .toList();
        return ResponseEntity.ok(out);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<GuarantorGetDTO>> getByContract(Long contractId) {
        List<Guarantor> list = guarantorRepository.findByContractId(contractId);
        List<GuarantorGetDTO> out = list.stream()
                .map(this::toGetDTO)
                .toList();
        return ResponseEntity.ok(out);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractGuarantorGetDTO>> getContractsByGuarantor(Long guarantorId) {
        var contracts = guarantorRepository.findByGuarantorId(guarantorId);
        List<ContractGuarantorGetDTO> out = contracts.stream()
                .map(this::mapContractGuarantor)
                .toList();
        return ResponseEntity.ok(out);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<GuarantorGetDTO> getByEmail(String email) {
        Guarantor g = guarantorRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Garante no encontrado por email"));
        return ResponseEntity.ok(toGetDTO(g));
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<GuarantorGetDTO> getByPhone(String phone) {
        Guarantor g = guarantorRepository.findByPhone(phone)
                .orElseThrow(() -> new EntityNotFoundException("Garante no encontrado por teléfono"));
        return ResponseEntity.ok(toGetDTO(g));
    }

    @Override
    @Transactional
    public ResponseEntity<String> addGuarantorToContract(Long guarantorId, Long contractId) {
        Contract c = em.getReference(Contract.class, contractId);
        Guarantor g = em.getReference(Guarantor.class, guarantorId);

        boolean added = c.getGuarantors().add(g);
        return ResponseEntity.ok(added ? "Vinculado" : "Ya estaba vinculado");
    }

    @Override
    @Transactional
    public ResponseEntity<String> removeGuarantorFromContract(Long guarantorId, Long contractId) {
        Contract c = em.getReference(Contract.class, contractId);
        Guarantor g = em.getReference(Guarantor.class, guarantorId);

        boolean removed = c.getGuarantors().remove(g);
        return ResponseEntity.ok(removed ? "Desvinculado" : "No estaba vinculado");
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<List<GuarantorGetDTO>> search(String search) {
        var spec = GuarantorSpecification.textSearch(search);
        List<Guarantor> list = guarantorRepository.findAll(spec);
        List<GuarantorGetDTO> out = list.stream()
                .map(this::toGetDTO)
                .toList();
        return ResponseEntity.ok(out);
    }
}
